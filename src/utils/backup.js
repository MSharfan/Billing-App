// Lightweight backup utilities: export/import + IndexedDB snapshot store
// Keep this dependency-free and conservative (small data volumes expected).

const ALLOWLIST_KEYS = [
  // keys discovered during repo audit
  'cart',
  'products',
  'accounts',
  'bills',
  'shopName',
  'shopAddress',
  'shopPhone',
  'shopGST',
  'upiId',
  'pin',
  'logoImage',
];

export function createBackupSnapshot() {
  const snapshot = {
    id: `snap-${new Date().toISOString()}`,
    meta: {
      createdAt: new Date().toISOString(),
      app: 'Billing-App',
      version: 1,
    },
    data: {},
  };

  const keys = ALLOWLIST_KEYS.length ? ALLOWLIST_KEYS : Object.keys(localStorage);
  keys.forEach((k) => {
    try {
      const raw = localStorage.getItem(k);
      snapshot.data[k] = raw === null ? null : JSON.parse(raw);
    } catch (e) {
      // if parse fails, store raw string
      snapshot.data[k] = localStorage.getItem(k);
    }
  });

  return snapshot;
}

export function downloadBackup(snapshot = createBackupSnapshot()) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `billing-backup-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function validateBackup(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, reason: 'invalid-json' };
  if (!snapshot.data || typeof snapshot.data !== 'object') return { ok: false, reason: 'missing-data' };
  return { ok: true };
}

export async function importBackupObject(snapshot, { overwrite = false } = {}) {
  const check = validateBackup(snapshot);
  if (!check.ok) throw new Error(check.reason);

  Object.entries(snapshot.data).forEach(([k, v]) => {
    try {
      if (localStorage.getItem(k) && !overwrite) {
        // skip existing key unless overwrite requested
        return;
      }
      localStorage.setItem(k, JSON.stringify(v));
    } catch (err) {
      try { localStorage.setItem(k, v); } catch (e) { /* swallow */ }
    }
  });
}

export async function importBackupFile(file, opts = {}) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error('invalid-json');
  }
  return importBackupObject(parsed, opts);
}

// -----------------------------
// IndexedDB snapshot store (very small wrapper)
// -----------------------------
const DB_NAME = 'billing-backups-db';
const STORE = 'snapshots';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSnapshot(snapshot) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.put(snapshot);
    tx.oncomplete = () => resolve(snapshot.id);
    tx.onerror = () => reject(tx.error);
  });
}

export async function listSnapshots() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result.sort((a,b)=> b.meta.createdAt.localeCompare(a.meta.createdAt)));
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSnapshot(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function restoreSnapshotById(id, { overwrite = false } = {}) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = async () => {
      if (!req.result) return reject(new Error('not-found'));
      try {
        await importBackupObject(req.result, { overwrite });
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    req.onerror = () => reject(req.error);
  });
}
