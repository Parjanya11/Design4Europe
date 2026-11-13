// =====================================================================
// A cached, slim copy of every signature, for the public list.
//
// Blobs has no query: reading 843 signatures meant 843 separate reads,
// 1-8 seconds per page view. The index holds what the public list needs
// from each record in one blob. Each call lists the keys (one request),
// reads the index (one request), and fetches only signatures the index
// has not seen yet - normally none.
//
// It is a cache, never the source of truth:
//   - it is rebuilt from scratch every REBUILD_AFTER_MS, so an edited
//     record (e.g. one marked removed) is picked up within that window
//   - deleted signatures drop out on the next call
//   - deleting the index blob loses nothing; the next call rebuilds it
// Email addresses are never copied into it.
// =====================================================================

export const INDEX_KEY = 'public-index-v1';
const REBUILD_AFTER_MS = 6 * 60 * 60 * 1000;
const CONCURRENCY = 25;

// Only what the public list and its counts need.
export function slim(record) {
  return {
    name: record.name || '',
    organisation: record.organisation || '',
    country: record.country || '',
    category: record.category || '',
    signingAs: record.signingAs || '',
    namePublic: record.namePublic === true,
    approved: record.approved ?? null,
  };
}

export async function loadIndexedSignatures(signatures, index, now = Date.now()) {
  const { blobs } = await signatures.list();
  const keys = blobs.map((b) => b.key);

  let cached = null;
  try {
    cached = await index.get(INDEX_KEY, { type: 'json' });
  } catch {
    // Unreadable index: rebuild below.
  }

  const fresh = cached && now - cached.builtAt < REBUILD_AFTER_MS;
  const entries = fresh ? { ...cached.entries } : {};
  const builtAt = fresh ? cached.builtAt : now;

  const live = new Set(keys);
  let changed = !fresh;
  for (const key of Object.keys(entries)) {
    if (!live.has(key)) { delete entries[key]; changed = true; }
  }

  const missing = keys.filter((k) => !(k in entries));
  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const batch = missing.slice(i, i + CONCURRENCY);
    const records = await Promise.all(
      batch.map((k) => signatures.get(k, { type: 'json' }).catch(() => null)),
    );
    batch.forEach((k, j) => { if (records[j]) entries[k] = slim(records[j]); });
    changed = true;
  }

  if (changed) {
    try {
      await index.setJSON(INDEX_KEY, { builtAt, entries });
    } catch (err) {
      // The list is still correct for this request; the next one retries.
      console.error('Could not write signature index:', err.message);
    }
  }

  return {
    records: Object.values(entries),
    stats: { keys: keys.length, fetched: missing.length, rebuilt: !fresh },
  };
}
