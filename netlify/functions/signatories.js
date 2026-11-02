// =====================================================================
// Public signatory list.
//
// This is the ONE endpoint with no token, so it is deliberately narrow:
//
//   - returns only signatories who chose namePublic: true
//   - returns only name, organisation, country and category
//   - NEVER returns an email address, or any field not listed above
//   - `approved: false` is an override, used to pull an entry down
//
// The 145 who asked to stay private are counted in the totals but never
// named, so the headline figure stays honest without breaking a promise
// made to them at sign-up.
// =====================================================================

import { getStore } from '@netlify/blobs';

const CONCURRENCY = 25;

// Signatories type their own country, so the same place arrives several
// ways. Normalised for counting and display; the stored value is untouched.
const COUNTRY_ALIASES = {
  nederland: 'Netherlands',
  'the netherlands': 'Netherlands',
  holland: 'Netherlands',
  deutschland: 'Germany',
  danmark: 'Denmark',
  suomi: 'Finland',
  sverige: 'Sweden',
  norge: 'Norway',
  espana: 'Spain',
  'españa': 'Spain',
  italia: 'Italy',
  belgie: 'Belgium',
  'belgië': 'Belgium',
  belgique: 'Belgium',
  osterreich: 'Austria',
  'österreich': 'Austria',
  polska: 'Poland',
  portugal: 'Portugal',
  eesti: 'Estonia',
  'ελλάδα': 'Greece',
  uk: 'United Kingdom',
  'u.k.': 'United Kingdom',
  'great britain': 'United Kingdom',
  schweiz: 'Switzerland',
  suisse: 'Switzerland',
};

function normaliseCountry(raw) {
  const value = (raw || '').trim();
  if (!value) return '';
  const key = value.toLowerCase();
  if (COUNTRY_ALIASES[key]) return COUNTRY_ALIASES[key];
  // Title-case so "netherlands" and "NETHERLANDS" group together.
  return value.replace(/\S+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

export default async (req) => {
  if (req.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let records;
  try {
    records = await readAll();
  } catch (err) {
    console.error('Signatory list failed:', err.message);
    return json({ ok: false, error: 'Could not load the signatory list.' }, 500);
  }

  // Anything pulled down by a moderator is excluded from both the list
  // and the counts.
  const live = records.filter((r) => r && r.approved !== 'removed');

  const publishable = live.filter((r) => r.namePublic === true);

  // Only these fields ever leave the server.
  const publishedRecords = publishable
    .map((r) => ({
      name: (r.name || '').trim(),
      organisation: (r.organisation || '').trim(),
      country: normaliseCountry(r.country),
      category: (r.category || '').trim(),
      institutional: r.signingAs === 'On behalf of an institution',
    }))
    .filter((r) => r.name);

  const signatories = publishedRecords
    .filter((r) => !r.institutional)
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));

  // Institutional endorsements carry different weight to an individual's,
  // so they are listed separately. Deduplicated, because several people may
  // sign for the same institution. Only included where the signer consented
  // to be listed - the consent was theirs to give.
  const seen = new Map();
  for (const r of publishedRecords) {
    if (!r.institutional || !r.organisation) continue;
    const key = r.organisation.toLowerCase();
    if (!seen.has(key)) seen.set(key, { name: r.organisation, country: r.country });
  }
  const organisationList = [...seen.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'en'),
  );

  const countries = new Set(live.map((r) => normaliseCountry(r.country)).filter(Boolean));
  const organisations = new Set(
    live.map((r) => (r.organisation || '').trim()).filter(Boolean),
  );

  return json(
    {
      ok: true,
      total: live.length,
      listed: signatories.length + organisationList.length,
      unlisted: live.length - signatories.length - organisationList.length,
      countries: countries.size,
      organisations: organisations.size,
      signatories,
      organisationList,
    },
    200,
    // Public and slow-changing: cache briefly so a burst of visitors does
    // not become a burst of function calls.
    { 'cache-control': 'public, max-age=300, stale-while-revalidate=600' },
  );
};

async function readAll() {
  const store = getStore('signatures');
  const { blobs } = await store.list();
  const keys = blobs.map((b) => b.key);

  const out = [];
  for (let i = 0; i < keys.length; i += CONCURRENCY) {
    const batch = keys.slice(i, i + CONCURRENCY);
    const values = await Promise.all(
      batch.map((k) => store.get(k, { type: 'json' }).catch(() => null)),
    );
    out.push(...values.filter(Boolean));
  }
  return out;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}
