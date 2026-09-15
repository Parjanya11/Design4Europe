// =====================================================================
// Sign-on endpoint for the Design for Europe open letter.
//
// Replaces Formspree. For each valid submission it:
//   1. stores the signature in Netlify Blobs
//   2. emails a confirmation to the signatory
//   3. emails a notification to the campaign mailbox
//
// Storing first is deliberate: a signature that is recorded but whose
// email failed can be recovered, whereas one lost at the door cannot.
// Email failures therefore do not fail the request.
// =====================================================================

import { getStore } from '@netlify/blobs';
import nodemailer from 'nodemailer';

const CONNECT_TIMEOUT_MS = 5000;
const GREETING_TIMEOUT_MS = 5000;
const SOCKET_TIMEOUT_MS = 10000;

// Generous enough for real institutional names, tight enough to refuse junk.
const LIMITS = {
  name: 200,
  role: 200,
  country: 100,
  organisation: 300,
  category: 100,
  category_other: 200,
  email: 320, // RFC maximum
};

const REQUIRED = ['name', 'role', 'country', 'organisation', 'category', 'email'];

export default async (req) => {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  // --- Read the submission (FormData from the browser, JSON for tooling) ---
  let fields;
  try {
    fields = await readFields(req);
  } catch {
    return json({ ok: false, error: 'Could not read submission.' }, 400);
  }

  // --- Honeypot -------------------------------------------------------
  // Bots fill hidden fields; humans never see them. Answer 200 so the bot
  // believes it succeeded and does not retry, but store and send nothing.
  if (fields._gotcha) {
    return json({ ok: true });
  }

  // --- Validation -----------------------------------------------------
  const missing = REQUIRED.filter((key) => !fields[key]);
  if (missing.length > 0) {
    return json({ ok: false, error: 'Please complete every field.', missing }, 400);
  }

  // "Other" is only meaningful with the free-text value beside it.
  if (fields.category === 'Other' && !fields.category_other) {
    return json({ ok: false, error: 'Please specify your category.' }, 400);
  }

  if (!isPlausibleEmail(fields.email)) {
    return json({ ok: false, error: 'That email address does not look valid.' }, 400);
  }

  const oversized = Object.keys(LIMITS).filter(
    (key) => fields[key] && fields[key].length > LIMITS[key],
  );
  if (oversized.length > 0) {
    return json({ ok: false, error: 'One or more fields is too long.', oversized }, 400);
  }

  // --- Build the record ------------------------------------------------
  const submittedAt = new Date().toISOString();
  const record = {
    name: fields.name,
    role: fields.role,
    country: fields.country,
    organisation: fields.organisation,
    category: fields.category === 'Other' ? fields.category_other : fields.category,
    categoryRaw: fields.category,
    email: fields.email,
    submittedAt,
    // Approval gate for a future public signatory list. Nothing is
    // published without a deliberate human decision.
    approved: false,
  };

  // --- 1. Store --------------------------------------------------------
  // Timestamp-prefixed key so listings come back in chronological order.
  const key = `${submittedAt}-${crypto.randomUUID().slice(0, 8)}`;

  try {
    const store = getStore('signatures');
    await store.setJSON(key, record);
  } catch (err) {
    // Nothing was recorded, so this genuinely failed. Tell the visitor.
    console.error('Blob write failed:', err.message);
    return json({ ok: false, error: 'We could not record your signature. Please try again.' }, 500);
  }

  // --- 2 & 3. Email ----------------------------------------------------
  // The signature is safely stored by this point. Email problems are logged
  // for us to chase, never surfaced as a failure to the person signing.
  const mail = await sendEmails(record).catch((err) => ({ ok: false, error: err.message }));
  if (!mail.ok) {
    console.error('Signature stored but email failed:', key, mail.error);
  }

  return json({ ok: true });
};

// ---------------------------------------------------------------------
// Input handling
// ---------------------------------------------------------------------

async function readFields(req) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return normalise(await req.json());
  }

  const form = await req.formData();
  return normalise(Object.fromEntries(form.entries()));
}

// Trim everything and drop non-strings, so validation sees predictable input.
function normalise(raw) {
  const out = {};
  for (const [key, value] of Object.entries(raw || {})) {
    if (typeof value === 'string') out[key] = value.trim();
  }
  return out;
}

// Deliberately permissive. Real addresses are stranger than most regexes
// allow, and the confirmation email is the real proof of validity.
function isPlausibleEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ---------------------------------------------------------------------
// Email rendering
//
// Every message goes out as both plain text and HTML. Mail clients render
// plain text in a proportional font, where space-padded columns do not line
// up, so the HTML part carries a real table and the text part drops the
// column layout entirely rather than pretending.
// ---------------------------------------------------------------------

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Reads as "15 September 2026 at 22:19 UTC" rather than an ISO timestamp.
function formatTimestamp(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
  return `${date} at ${time} UTC`;
}

// rows: [[label, value], ...]
function detailsHtml(rows) {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 28px 6px 0;color:#6b7a99;font-size:14px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;color:#0b1e4d;font-size:15px;font-weight:500;vertical-align:top;">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:18px 0;">${cells}
    </table>`;
}

// No attempt at column alignment here - it cannot survive a proportional font.
function detailsText(rows) {
  return rows.map(([label, value]) => `${label}: ${value}`).join('\n');
}

function wrapHtml(bodyHtml) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f7f9fc;">
    <div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #e1e6f0;border-radius:8px;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:#45557e;">
      ${bodyHtml}
      <p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #e1e6f0;font-size:13px;color:#8b97b4;">
        Design for Europe &middot;
        <a href="https://design4europe.eu" style="color:#003198;text-decoration:none;">design4europe.eu</a>
      </p>
    </div>
  </body>
</html>`;
}

// ---------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------

function buildTransport() {
  const port = Number(process.env.SMTP_PORT);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: CONNECT_TIMEOUT_MS,
    greetingTimeout: GREETING_TIMEOUT_MS,
    socketTimeout: SOCKET_TIMEOUT_MS,
  });
}

async function sendEmails(record) {
  const from = `"Design for Europe" <${process.env.SMTP_USER}>`;
  const notifyTo = process.env.NOTIFY_TO;
  const transporter = buildTransport();

  const signatoryRows = [
    ['Name', record.name],
    ['Role', record.role],
    ['Organisation', record.organisation],
    ['Country', record.country],
    ['Category', record.category],
  ];

  // --- Confirmation to the signatory ---
  const confirmation = transporter.sendMail({
    from,
    to: record.email,
    replyTo: notifyTo,
    subject: 'Your signature has been added to the open letter',
    text: [
      `Dear ${record.name},`,
      '',
      'Thank you for signing the open letter calling on the European Commission',
      'to give Design a structural role in FP10.',
      '',
      'We have recorded your signature as:',
      '',
      detailsText(signatoryRows),
      '',
      'We will be in touch as FP10’s structure is finalised.',
      '',
      'If anything above is wrong, or you would like your signature removed,',
      `reply to this message at ${notifyTo}.`,
      '',
      'Design for Europe',
      'https://design4europe.eu',
    ].join('\n'),
    html: wrapHtml(`
      <p style="margin:0 0 16px;">Dear ${escapeHtml(record.name)},</p>
      <p style="margin:0 0 16px;">
        Thank you for signing the open letter calling on the European Commission
        to give Design a structural role in FP10.
      </p>
      <p style="margin:0;">We have recorded your signature as:</p>
      ${detailsHtml(signatoryRows)}
      <p style="margin:0 0 16px;">We will be in touch as FP10&rsquo;s structure is finalised.</p>
      <p style="margin:0;">
        If anything above is wrong, or you would like your signature removed,
        reply to this message at
        <a href="mailto:${escapeHtml(notifyTo)}" style="color:#003198;">${escapeHtml(notifyTo)}</a>.
      </p>`),
  });

  // --- Notification to the campaign mailbox ---
  // Reply-To is the signatory, so answering writes straight back to them.
  const notificationRows = [
    ...signatoryRows,
    ['Email', record.email],
    ['Submitted', formatTimestamp(record.submittedAt)],
  ];

  const notification = transporter.sendMail({
    from,
    to: notifyTo,
    replyTo: record.email,
    subject: `New signature: ${record.organisation} (${record.country})`,
    text: [
      'A new signature has been added to the open letter.',
      '',
      detailsText(notificationRows),
      '',
      'Reply to this message to respond to the signatory directly.',
    ].join('\n'),
    html: wrapHtml(`
      <p style="margin:0;">A new signature has been added to the open letter.</p>
      ${detailsHtml(notificationRows)}
      <p style="margin:0;">Reply to this message to respond to the signatory directly.</p>`),
  });

  const results = await Promise.allSettled([confirmation, notification]);
  const failed = results.filter((r) => r.status === 'rejected');

  if (failed.length > 0) {
    return { ok: false, error: failed.map((f) => f.reason?.message).join('; ') };
  }
  return { ok: true };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
