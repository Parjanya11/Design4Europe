// =====================================================================
// PHASE A DIAGNOSTIC - TEMPORARY. Delete once SMTP viability is known.
//
// Answers one question: can a Netlify Function (AWS Lambda) reach
// mijndomein's SMTP server and send mail through the project mailbox?
//
// It reports which stage was reached - connect, authenticate, send -
// with timings, so a failure is immediately diagnosable rather than a
// generic "it didn't work".
//
// Timeouts are deliberately tight. A blocked SMTP port manifests as a
// hang, not an error, so we fail fast and pivot rather than waiting on
// the Lambda ceiling.
// =====================================================================

import nodemailer from 'nodemailer';

// Connect and greeting are the stages that hang when a port is blocked,
// so they get the strict 5s bound. The socket gets longer because an
// established, working connection may legitimately take a moment to
// hand over the message - we don't want to fail a send that is fine.
const CONNECT_TIMEOUT_MS = 5000;
const GREETING_TIMEOUT_MS = 5000;
const SOCKET_TIMEOUT_MS = 10000;

const REQUIRED_ENV = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'NOTIFY_TO'];

export default async (req) => {
  // This endpoint sends real email, so it is not left open to the world.
  // The rejection reason is reported explicitly: a diagnostic that cannot
  // distinguish "misconfigured" from "wrong token" is not much of a diagnostic.
  // Lengths are reported to expose trailing whitespace or truncation without
  // ever echoing the token itself.
  const expected = process.env.SMTP_TEST_TOKEN;
  const provided = new URL(req.url).searchParams.get('token');

  if (!expected) {
    return json(
      {
        ok: false,
        stage: 'config',
        reason: 'SMTP_TEST_TOKEN is not set for this deploy context.',
        verdict:
          'The environment variable did not reach the function. If it was saved as a secret, ' +
          'confirm the value is in the Production field, then redeploy - env vars only reach ' +
          'a function on a new deploy.',
      },
      500,
    );
  }

  if (!provided) {
    return json(
      {
        ok: false,
        stage: 'auth',
        reason: 'No token query parameter supplied.',
        verdict: 'Append ?token=YOUR_TOKEN to the URL, using the value you set in Netlify.',
      },
      401,
    );
  }

  if (provided !== expected) {
    return json(
      {
        ok: false,
        stage: 'auth',
        reason: 'Token did not match.',
        providedLength: provided.length,
        expectedLength: expected.length,
        verdict:
          'Token is configured but does not match. Differing lengths usually mean a truncated ' +
          'paste or trailing whitespace; equal lengths mean a character is wrong.',
      },
      401,
    );
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return json(
      {
        ok: false,
        stage: 'config',
        missing,
        verdict: 'Environment variables are not set. Add them in Netlify and redeploy.',
      },
      500,
    );
  }

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 uses implicit TLS; 587 starts plain and upgrades via STARTTLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: CONNECT_TIMEOUT_MS,
    greetingTimeout: GREETING_TIMEOUT_MS,
    socketTimeout: SOCKET_TIMEOUT_MS,
  });

  // --- Stage 1: connect + TLS + authenticate, without sending anything ---
  const startedAt = Date.now();
  let verifyMs = null;

  try {
    await transporter.verify();
    verifyMs = Date.now() - startedAt;
  } catch (err) {
    return json(
      {
        ok: false,
        stage: 'connect-or-auth',
        elapsedMs: Date.now() - startedAt,
        host: process.env.SMTP_HOST,
        port,
        code: err.code ?? null,
        command: err.command ?? null,
        message: err.message,
        verdict: diagnose(err),
      },
      502,
    );
  }

  // --- Stage 2: actually send a message ---
  const sendStartedAt = Date.now();

  try {
    const info = await transporter.sendMail({
      from: `"Design for Europe" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_TO,
      subject: 'Phase A: SMTP test from Netlify',
      text: [
        'This message was sent by a Netlify Function running on AWS Lambda,',
        'through the mijndomein mailbox over SMTP.',
        '',
        'Receiving it confirms Phase A passed: the V2 sign-on function can send',
        'confirmation emails without adding an email vendor.',
        '',
        `Connect + auth: ${verifyMs}ms`,
      ].join('\n'),
    });

    return json({
      ok: true,
      stage: 'sent',
      verifyMs,
      sendMs: Date.now() - sendStartedAt,
      totalMs: Date.now() - startedAt,
      messageId: info.messageId ?? null,
      accepted: info.accepted ?? [],
      rejected: info.rejected ?? [],
      verdict:
        'PASS. SMTP works from Netlify. Proceed with Phase B as planned - no email vendor needed. ' +
        'Check the inbox to confirm delivery, and look in spam if it is not there.',
    });
  } catch (err) {
    return json(
      {
        ok: false,
        stage: 'send',
        verifyMs,
        elapsedMs: Date.now() - sendStartedAt,
        code: err.code ?? null,
        command: err.command ?? null,
        message: err.message,
        verdict: diagnose(err),
      },
      502,
    );
  }
};

// Turn a nodemailer error into a decision, not just a symptom.
function diagnose(err) {
  switch (err.code) {
    case 'ETIMEDOUT':
    case 'ESOCKET':
    case 'ECONNECTION':
    case 'ECONNREFUSED':
      return (
        'FAIL - connection blocked, refused or throttled. This is the outcome Phase A exists ' +
        'to catch. Pivot to the Resend API fallback (Phase A4). Do not spend time debugging this.'
      );
    case 'EAUTH':
      return (
        'Reached the mail server but credentials were rejected. SMTP is NOT blocked - this is a ' +
        'config problem. Re-check SMTP_USER (usually the full email address) and SMTP_PASS.'
      );
    case 'EENVELOPE':
      return 'Connected and authenticated, but the server rejected the sender or recipient address.';
    default:
      return 'Unexpected failure. Review the code and message above before deciding whether to pivot.';
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
