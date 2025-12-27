import React, { useEffect, useState } from 'react'
import { downloadBackup, createBackupSnapshot, importBackupFile, saveSnapshot, listSnapshots, deleteSnapshot, restoreSnapshotById } from '../../utils/backup'
import { useToast } from '../../context/ToastContext'

export default function BackupPanel() {
  const { showToast } = useToast()
  const [snaps, setSnaps] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    try {
      const list = await listSnapshots()
      setSnaps(list)
    } catch (e) {
      // ignore if indexedDB unavailable
      setSnaps([])
    }
  }

  const handleExport = () => {
    try {
      const snap = createBackupSnapshot()
      downloadBackup(snap)
      showToast('Backup downloaded', 'success')
    } catch (e) {
      showToast('Export failed', 'error')
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      await importBackupFile(file, { overwrite: false })
      showToast('Import successful (existing keys preserved). Refresh to see changes.', 'success')
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error')
    } finally { setLoading(false); e.target.value = '' }
  }

  const handleSaveSnapshot = async () => {
    try {
      const snap = createBackupSnapshot()
      await saveSnapshot(snap)
      showToast('Snapshot saved locally', 'success')
      fetchList()
    } catch (e) {
      showToast('Could not save snapshot: ' + (e.message || e), 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete snapshot?')) return
    try { await deleteSnapshot(id); showToast('Deleted', 'success'); fetchList() } catch (e) { showToast('Delete failed', 'error') }
  }

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this snapshot? This will overwrite missing keys unless you cancel.')) return
    try {
      await restoreSnapshotById(id, { overwrite: false })
      showToast('Snapshot restored (existing keys preserved). Refresh to see changes.', 'success')
    } catch (e) {
      showToast('Restore failed: ' + (e.message || e), 'error')
    }
  }

  return (
    <div className="mt-6 bg-slate-900 p-3 rounded space-y-3">
      <h3 className="font-semibold">Backup & Restore</h3>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleExport} className="py-2 px-3 rounded bg-accent text-slate-900">Export JSON</button>
        <label className="py-2 px-3 rounded bg-slate-700 text-slate-300 text-center cursor-pointer">
          Import JSON
          <input type="file" accept="application/json" onChange={handleFile} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleSaveSnapshot} className="py-2 px-3 rounded bg-emerald-600">Save Snapshot</button>
        <button onClick={() => fetchList()} className="py-2 px-3 rounded bg-slate-700">Refresh List</button>
      </div>

      <div>
        <h4 className="text-sm text-slate-400">Local Snapshots</h4>
        {snaps.length === 0 && <div className="text-slate-500 text-sm">No snapshots</div>}
        <div className="space-y-2 mt-2">
          {snaps.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
              <div className="text-sm">
                <div className="font-medium">{s.meta.createdAt}</div>
                <div className="text-slate-400 text-xs">{Object.keys(s.data || {}).length} keys</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleRestore(s.id)} className="py-1 px-2 rounded bg-blue-600 text-sm">Restore</button>
                <button onClick={() => handleDelete(s.id)} className="py-1 px-2 rounded bg-red-600 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
