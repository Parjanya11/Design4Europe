// In-memory stand-in for @netlify/blobs, for testing the functions offline.
// Counts reads so tests can assert how much work a request did.
const stores = (globalThis.__fakeStores ||= new Map());
export const reads = (globalThis.__fakeReads ||= { count: 0 });

export function getStore(name) {
  if (!stores.has(name)) stores.set(name, new Map());
  const m = stores.get(name);
  return {
    async list() {
      return { blobs: [...m.keys()].sort().map((key) => ({ key })) };
    },
    async get(key) {
      reads.count++;
      return m.has(key) ? structuredClone(m.get(key)) : null;
    },
    async setJSON(key, value) {
      m.set(key, structuredClone(value));
    },
    async delete(key) {
      m.delete(key);
    },
  };
}
