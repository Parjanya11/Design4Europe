// =====================================================================
// Signature export.
//
// Netlify Blobs has no dashboard, so this is the only way to see the
// signature list as a whole. Returns CSV by default (opens in Excel or
// Sheets) or JSON with ?format=json.
//
// The response contains personal data, so it is token-protected and
// marked no-store.
// =====================================================================

import { getStore } from '@netlify/blobs';

// Blobs are fetched one key at a time, so read them in parallel batches
// rather than sequentially. Bounded to stay well inside the function
// timeout on a list of any realistic size.
const CONCURRENCY = 20;

const COLUMNS = [
  ['submittedAt', 'Submitted'],
  ['name', 'Name'],
  ['role', 'Role'],
  ['organisation', 'Organisation'],
  ['country', 'Country'],
  ['category', 'Category'],
  ['email', 'Email'],
  ['approved', 'Approved'],
];

export default async (req) => {
  const url = new URL(req.url);

  // --- Access control --------------------------------------------------
  // Rejection reasons are explicit, for the same reason as the sign-on
  // endpoint: a guard that cannot say why it refused wastes debugging time.
  const expected = process.env.EXPORT_TOKEN;
  if (!expected) {
    return json(
      {
        ok: false,
        stage: 'config',
        reason: 'EXPORT_TOKEN is not set for this deploy context.',
        verdict: 'Add EXPORT_TOKEN in Netlify, then redeploy - env vars reach functions only on a new deploy.',
      },
      500,
    );
  }

  const header = req.headers.get('authorization') || '';
  const provided = url.searchParams.get('token') || header.replace(/^Bearer\s+/i, '');

  if (!provided) {
    return json(
      { ok: false, reason: 'No token supplied.', verdict: 'Append ?token=YOUR_EXPORT_TOKEN to the URL.' },
      401,
    );
  }

  if (provided !== expected) {
    return json(
      {
        ok: false,
        reason: 'Token did not match.',
        providedLength: provided.length,
        expectedLength: expected.length,
        verdict: 'Differing lengths usually mean a truncated paste or trailing whitespace.',
      },
      401,
    );
  }

  // --- Read every signature --------------------------------------------
  let records;
  try {
    records = await readAllSignatures();
  } catch (err) {
    console.error('Export failed:', err.message);
    return json({ ok: false, error: 'Could not read the signature store.' }, 500);
  }

  // Newest last, matching the order they were signed.
  records.sort((a, b) => String(a.submittedAt).localeCompare(String(b.submittedAt)));

  if (url.searchParams.get('format') === 'json') {
    return json({ ok: true, count: records.length, signatures: records });
  }

  const today = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(records), {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="design4europe-signatures-${today}.csv"`,
      'x-signature-count': String(records.length),
      'cache-control': 'no-store',
    },
  });
};

// ---------------------------------------------------------------------

async function readAllSignatures() {
  const store = getStore('signatures');
  const { blobs } = await store.list();
  const keys = blobs.map((b) => b.key);

  const records = [];
  for (let i = 0; i < keys.length; i += CONCURRENCY) {
    const batch = keys.slice(i, i + CONCURRENCY);
    const values = await Promise.all(
      batch.map(async (key) => {
        try {
          return await store.get(key, { type: 'json' });
        } catch {
          // One unreadable record must not sink the whole export.
          console.error('Unreadable signature record:', key);
          return null;
        }
      }),
    );
    records.push(...values.filter(Boolean));
  }

  return records;
}

// ---------------------------------------------------------------------

// A field containing a comma, quote or newline has to be quoted, and any
// internal quote doubled. Institution names and roles routinely contain
// commas, so this is not a theoretical concern.
function csvCell(value) {
  const s = value === undefined || value === null ? '' : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(records) {
  const head = COLUMNS.map(([, label]) => csvCell(label)).join(',');
  const rows = records.map((r) => COLUMNS.map(([key]) => csvCell(r[key])).join(','));

  // Excel assumes the system codepage unless a UTF-8 BOM is present, which
  // would mangle accented names - and most of these signatories have them.
  return '﻿' + [head, ...rows].join('\r\n') + '\r\n';
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
