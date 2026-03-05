import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { clarificationsApi, type Clarification } from '../../lib/api'

export default function ClarificationsPage() {
  const { token } = useAuth()
  const [clarifications, setClarifications] = useState<Clarification[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [selectedClarification, setSelectedClarification] = useState<Clarification | null>(null)
  const [resetThreat, setResetThreat] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleDownloadEvidence = async (clarification: Clarification) => {
    if (!clarification.evidenceUrls || clarification.evidenceUrls.length === 0) return

    try {
      const isAbsolute = (url: string) => url.startsWith('http://') || url.startsWith('https://')
      const isLocalUpload = (url: string) => url.startsWith('/uploads')

      // Kasus Single File
      if (clarification.evidenceUrls.length === 1) {
        const url = clarification.evidenceUrls[0]
        if (isAbsolute(url)) {
          window.open(url, '_blank')
        } else {
          const targetPath = url.startsWith('/') ? url : (isLocalUpload(url) ? url : `/uploads/evidence/${url}`)
          window.open(`${window.location.protocol}//${window.location.host}${targetPath}`, '_blank')
        }
        return
      }

      // Kasus Multiple Files -> ZIP
      const JSZip = (await import('jszip')).default
      const { saveAs } = await import('file-saver')
      
      const zip = new JSZip()
      const perpName = typeof clarification.perpetratorData === 'string' ? clarification.perpetratorData : (clarification.perpetratorPhone || clarification.perpetratorName || 'Unknown')
      const folderName = `Klarifikasi_Bukti_${perpName.replace(/[^a-zA-Z0-9]/g, '_')}_${clarification.id.substring(0,8)}`
      const folder = zip.folder(folderName)
      
      const fetchPromises = clarification.evidenceUrls.map(async (url: string, index: number) => {
        let downloadUrl = ''
        const _isAbs = isAbsolute(url)
        if (_isAbs) {
          downloadUrl = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`
        } else {
          const targetPath = url.startsWith('/') ? url : (isLocalUpload(url) ? url : `/uploads/evidence/${url}`)
          downloadUrl = `${window.location.protocol}//${window.location.host}${targetPath}`
        }

        const response = await fetch(downloadUrl)
        if (!response.ok) throw new Error(`Failed to fetch ${url}`)
        
        const blob = await response.blob()
        let filename = url.split('/').pop() || `bukti-${index + 1}`
        if (_isAbs) {
          try {
             const u = new URL(url)
             filename = u.pathname.split('/').pop() || filename
          } catch {}
        }
        folder?.file(filename, blob)
      })

      await Promise.all(fetchPromises)
      
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${folderName}.zip`)
      
    } catch (err) {
      console.error('Failed to zip files:', err)
      alert('Gagal membuat file ZIP karena pembatasan jaringan. Silakan buka file satu per satu.')
    }
  }

  const fetchPending = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await clarificationsApi.getPending(1, token)
      const data = res.data as { clarifications?: Clarification[] } | undefined
      setClarifications(data?.clarifications ?? [])
    } catch {
      console.error('Failed to fetch clarifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [token])

  const handleModerate = async (action: 'approve' | 'reject') => {
    if (!token || !selectedClarification) return
    setProcessing(true)
    try {
      await clarificationsApi.moderate(
        selectedClarification.id,
        { action, resetThreat: action === 'approve' ? resetThreat : false },
        token
      )
      
      // Update local state
      setClarifications(prev => prev.filter(c => c.id !== selectedClarification.id))
      setSelectedClarification(null)
      setResetThreat(false)
    } catch {
      alert('Gagal memproses klarifikasi')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Moderasi Klarifikasi & KYC</h1>
          <p className="text-slate-400 text-sm">Review pengajuan Hak Jawab dan dokumen identitas (KTP).</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex gap-3">
          <div className="text-center">
            <span className="block text-xs text-slate-400 font-semibold uppercase">Pending</span>
            <span className="block text-xl font-bold text-amber-500">{clarifications.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Tgl Pengajuan</th>
                <th className="px-6 py-4 font-semibold">Data Dilaporkan</th>
                <th className="px-6 py-4 font-semibold">Nama KYC</th>
                <th className="px-6 py-4 font-semibold">Status Hubungan</th>
                <th className="px-6 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-primary">progress_activity</span>
                    <p>Memuat data klarifikasi...</p>
                  </td>
                </tr>
              ) : clarifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Belum ada pengajuan klarifikasi tertunda.
                  </td>
                </tr>
              ) : (
                clarifications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {typeof item.perpetratorData === 'string' ? item.perpetratorData : (item.perpetratorPhone || item.perpetratorName || '-')}
                    </td>
                    <td className="px-6 py-4">
                      {item.identityName}
                      <br/>
                      <span className="text-xs text-slate-500 font-mono">{item.identityNik}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded text-xs font-semibold whitespace-nowrap">
                        {item.relationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedClarification(item)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium text-xs whitespace-nowrap"
                      >
                        Review Dokumen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedClarification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Review Hak Jawab
              </h2>
              <button onClick={() => setSelectedClarification(null)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Col: Dokumen KYC */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Dokumen Identitas (SANGAT RAHASIA)</h3>
                    
                    <div className="space-y-1 mb-4">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Nama di KTP</p>
                      <p className="font-bold text-white">{selectedClarification.identityName}</p>
                    </div>
                    
                    <div className="space-y-1 mb-6">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Nomor Induk Kependudukan (NIK)</p>
                      <p className="font-bold text-white font-mono">{selectedClarification.identityNik}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 relative group cursor-pointer" onClick={() => selectedClarification.identityPhotoUrl && window.open(selectedClarification.identityPhotoUrl, '_blank')}>
                        <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white font-bold tracking-widest uppercase z-10 pointer-events-none">FOTO KTP</span>
                        <img src={selectedClarification.identityPhotoUrl ?? ''} alt="KTP" className="w-full h-40 object-cover rounded-lg group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">open_in_new</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 relative group cursor-pointer" onClick={() => selectedClarification.selfiePhotoUrl && window.open(selectedClarification.selfiePhotoUrl, '_blank')}>
                         <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white font-bold tracking-widest uppercase z-10 pointer-events-none">SELFIE + KTP</span>
                        <img src={selectedClarification.selfiePhotoUrl ?? ''} alt="Selfie" className="w-full h-40 object-cover rounded-lg group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">open_in_new</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Pernyataan & Pelaku */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Detail Pengajuan</h3>
                    
                    <div className="bg-background-dark border border-slate-800 rounded-xl p-4 mb-4">
                      <p className="text-xs text-slate-400 font-semibold mb-1">Target Data:</p>
                      <p className="font-bold text-white text-lg font-mono">{typeof selectedClarification.perpetratorData === 'string' ? selectedClarification.perpetratorData : (selectedClarification.perpetratorPhone || selectedClarification.perpetratorName || '-')}</p>
                      <p className="text-xs text-slate-500 mt-1">Diajukan oleh: {selectedClarification.requesterName ?? '-'} ({selectedClarification.requesterEmail ?? '-'})</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6">
                      <p className="text-xs text-slate-500 uppercase font-semibold mb-3 flex justify-between items-center">
                        Pernyataan Klarifikasi
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded normal-case">{selectedClarification.relationType}</span>
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar pr-2">{selectedClarification.statement}</p>
                    </div>

                    {selectedClarification.evidenceUrls && selectedClarification.evidenceUrls.length > 0 && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <span className="material-symbols-outlined text-emerald-500">
                              {selectedClarification.evidenceUrls.length > 1 ? 'folder_zip' : 'description'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Bukti Tambahan</p>
                            <p className="text-xs text-slate-400">{selectedClarification.evidenceUrls.length} file dilampirkan oleh pengaju</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownloadEvidence(selectedClarification)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors border border-slate-700 shrink-0 w-full sm:w-auto justify-center"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {selectedClarification.evidenceUrls.length > 1 ? 'download' : 'open_in_new'}
                          </span>
                          {selectedClarification.evidenceUrls.length > 1 ? 'Unduh Semua (ZIP)' : 'Buka File'}
                        </button>
                      </div>
                    )}

                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div className="pt-0.5">
                          <input 
                            type="checkbox" 
                            checked={resetThreat} 
                            onChange={(e) => setResetThreat(e.target.checked)}
                            className="w-4 h-4 rounded border-amber-500/30 text-amber-500 focus:ring-amber-500 bg-slate-950 appearance-none inline-grid place-content-center
                              checked:before:content-[''] checked:before:w-2 checked:before:h-2 checked:before:rounded-sm checked:before:bg-amber-500 checked:before:shadow-[inset_1em_1em_var(--tw-shadow-color)]"
                          />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-amber-500">Cabut Status Tersangka (Reset Threat Level)</span>
                          <span className="block text-xs text-amber-500/70 mt-1 leading-relaxed">
                            Jika dicentang, badge peringatan merah di profil ini akan dihapus. Lakukan ini hanya jika Anda yakin pelapor salah lapor, pemilik data membuktikan tidak bersalah, atau kedua belah pihak sudah berdamai.
                          </span>
                        </div>
                      </label>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-950 shrink-0 flex items-center justify-between gap-4">
              <button 
                onClick={() => handleModerate('reject')}
                disabled={processing}
                className="px-6 py-2.5 bg-slate-800 hover:bg-danger/20 text-slate-300 hover:text-danger border border-slate-700 hover:border-danger/50 rounded-lg transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">block</span>
                Tolak Klarifikasi
              </button>

              <button 
                onClick={() => handleModerate('approve')}
                disabled={processing}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.3)] rounded-lg transition-all font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                )}
                Setujui & Publikasikan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
