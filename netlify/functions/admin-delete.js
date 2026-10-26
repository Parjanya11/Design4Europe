// =====================================================================
// Delete signature records.
//
// Needed for two things: clearing test data, and honouring a GDPR
// erasure request from someone who has signed.
//
// Deliberately awkward to fire by accident:
//   - POST only, so a crawler or link prefetch can never trigger it
//   - requires the export token
//   - deletes only explicitly named keys; there is no "delete all"
//   - dry run unless { "confirm": true } is sent
//
// Get the keys from the export: /.netlify/functions/export?format=json
// =====================================================================

import { getStore } from '@netlify/blobs';

const MAX_PER_CALL = 50;

export default async (req) => {
  if (req.method !== 'POST') {
    return json(
      {
        ok: false,
        error: 'Method not allowed. This endpoint deletes data, so it is POST only.',
      },
      405,
    );
  }

  // --- Access control ---------------------------------------------------
  const expected = process.env.EXPORT_TOKEN;
  if (!expected) {
    return json({ ok: false, stage: 'config', reason: 'EXPORT_TOKEN is not set.' }, 500);
  }

  const header = req.headers.get('authorization') || '';
  const url = new URL(req.url);
  const provided = url.searchParams.get('token') || header.replace(/^Bearer\s+/i, '');

  if (provided !== expected) {
    return json({ ok: false, reason: 'Token missing or incorrect.' }, 401);
  }

  // --- Payload ----------------------------------------------------------
  let body;
  try {
    body = await req.json();
  } catch {
    return json(
      { ok: false, error: 'Send JSON: { "keys": ["..."], "confirm": true }' },
      400,
    );
  }

  const keys = Array.isArray(body?.keys) ? body.keys.filter((k) => typeof k === 'string') : [];

  if (keys.length === 0) {
    return json(
      {
        ok: false,
        error: 'No keys supplied.',
        hint: 'Get keys from /.netlify/functions/export?format=json, then send { "keys": [...] }.',
      },
      400,
    );
  }

  if (keys.length > MAX_PER_CALL) {
    return json(
      { ok: false, error: `Too many keys. Maximum ${MAX_PER_CALL} per call.` },
      400,
    );
  }

  const store = getStore('signatures');

  // --- Dry run by default -----------------------------------------------
  // Show exactly whose records these are before anything is destroyed.
  if (body.confirm !== true) {
    const preview = [];
    for (const key of keys) {
      let record = null;
      try {
        record = await store.get(key, { type: 'json' });
      } catch {
        /* treated as missing below */
      }
      preview.push(
        record
          ? {
              key,
              found: true,
              name: record.name,
              organisation: record.organisation,
              email: record.email,
              submittedAt: record.submittedAt,
            }
          : { key, found: false },
      );
    }

    return json({
      ok: true,
      dryRun: true,
      wouldDelete: preview.filter((p) => p.found).length,
      notFound: preview.filter((p) => !p.found).length,
      records: preview,
      next: 'Check these are the right records, then resend with "confirm": true.',
    });
  }

  // --- Delete -----------------------------------------------------------
  const deleted = [];
  const failed = [];

  for (const key of keys) {
    try {
      await store.delete(key);
      deleted.push(key);
    } catch (err) {
      console.error('Delete failed:', key, err.message);
      failed.push({ key, error: err.message });
    }
  }

  // Deletions are irreversible, so leave a trail in the function logs.
  console.log(`Deleted ${deleted.length} signature record(s):`, deleted.join(', '));

  return json({
    ok: failed.length === 0,
    deleted: deleted.length,
    failed: failed.length,
    keys: deleted,
    errors: failed,
  });
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
