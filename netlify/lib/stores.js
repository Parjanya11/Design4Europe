// =====================================================================
// Which signature store a function should use.
//
// Deploy previews and branch deploys run the same functions as the live
// site. Without this, testing the form on a preview would write a real
// signature to the live list and send real emails. Previews now get their
// own store, and send no email.
//
// Fails safe in one direction only: if the deploy context is missing or
// unrecognised, the function behaves exactly as production always has.
// A preview mistaken for production is today's behaviour; production
// mistaken for a preview would hide real signatures, so that can only
// happen on an explicit preview context.
// =====================================================================

import { getStore } from '@netlify/blobs';

const PREVIEW_CONTEXTS = new Set(['deploy-preview', 'branch-deploy', 'dev']);

// `context` is the second argument Netlify passes to every function.
export function isPreview(context) {
  return PREVIEW_CONTEXTS.has(context?.deploy?.context);
}

export function signatureStore(context) {
  return getStore(isPreview(context) ? 'signatures-preview' : 'signatures');
}

// Derived data only (see signature-index.js). Safe to delete at any time.
export function indexStore(context) {
  return getStore(isPreview(context) ? 'signatures-index-preview' : 'signatures-index');
}
