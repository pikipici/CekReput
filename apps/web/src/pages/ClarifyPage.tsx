import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { perpetratorsApi, clarificationsApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import FileUploader, { type UploadedFile } from '../components/report/FileUploader'

export default function ClarifyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [perpetrator, setPerpetrator] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    identityName: '',
    identityNik: '',
    relationType: '',
    relationTypeCustom: '',
    statement: '',
  })
  
  const [identityPhoto, setIdentityPhoto] = useState<File | null>(null)
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null)
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    if (!token) {
      // Must be logged in
      navigate(`/?login=true`)
      return
    }

    if (id) {
      perpetratorsApi.getById(id)
        .then(res => setPerpetrator(res.data?.perpetrator))
        .catch(() => setError('Data pelaku tidak ditemukan'))
        .finally(() => setLoading(false))
    }
  }, [id, token, navigate])

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
    const res = await fetch(`${API_BASE}/api/upload/evidence`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto ' + file.name)
    return data.file.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!identityPhoto || !selfiePhoto) {
        throw new Error('Mohon lengkapi foto KTP dan foto Selfie dengan KTP')
      }

      // 1. Upload photos first
      const identityPhotoUrl = await uploadFile(identityPhoto)
      const selfiePhotoUrl = await uploadFile(selfiePhoto)
      
      const evidenceUrls = evidenceFiles.map((f) => f.url)

      const finalRelationType = formData.relationType === 'Lainnya' ? formData.relationTypeCustom : formData.relationType

      // 2. Submit clarification
      const res = await clarificationsApi.create({
        perpetratorId: id,
        identityName: formData.identityName,
        identityNik: formData.identityNik,
        statement: formData.statement,
        relationType: finalRelationType,
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        identityPhotoUrl,
        selfiePhotoUrl,
      }, token!)

      if (res.error) {
        const errorMsg = typeof res.error === 'string' ? res.error : JSON.stringify(res.error)
        throw new Error(errorMsg)
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim pengajuan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Pengajuan Berhasil Dikirim</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Tim moderator kami akan segera meninjau dokumen identitas dan pernyataan Anda. Kami akan menghubungi Anda jika memerlukan informasi tambahan.
            </p>
            <button 
              onClick={() => navigate(`/profile/${id}`)}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium w-full"
            >
              Kembali ke Profil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="mb-8">
          <button 
            onClick={() => navigate(`/profile/${id}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">Formulir Hak Jawab</h1>
          <p className="text-slate-400">
            Ajukan klarifikasi resmi jika Anda adalah pemilik nomor atau entitas yang dilaporkan dan merasa tidak melakukan penipuan.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-rose-500 shrink-0">error</span>
            <p className="text-rose-400 text-sm mt-0.5">{error}</p>
          </div>
        )}

        {perpetrator && (
          <div className="mb-8 p-5 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-rose-500">money_off</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Klarifikasi</p>
              <p className="text-white font-medium text-lg font-mono">
                {perpetrator.accountNumber || perpetrator.phoneNumber || perpetrator.entityName}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Data Diri */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800 pb-b">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-xl font-bold text-white">Verifikasi Identitas Pribadi</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm justify-between text-slate-400 mb-2">Nama Sesuai KTP <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.identityName}
                  onChange={(e) => setFormData({...formData, identityName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600"
                  placeholder="Budi Santoso"
                  required
                />
              </div>
              <div>
                <label className="block text-sm justify-between text-slate-400 mb-2">NIK KTP <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.identityNik}
                  onChange={(e) => setFormData({...formData, identityNik: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600 font-mono"
                  placeholder="16 Digit NIK"
                  maxLength={16}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm justify-between text-slate-400 mb-2">Hubungan dengan Data Pelaku <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.relationType}
                    onChange={(e) => setFormData({...formData, relationType: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled>Pilih status hubungan</option>
                    <option value="Pemilik Sendiri">Pemilik nomor/rekening secara sah</option>
                    <option value="Keluarga">Keluarga dari pemilik sah</option>
                    <option value="Perwakilan Perusahaan">Perwakilan Perusahaan/Toko</option>
                    <option value="Korban Pencatutan">Korban Pencatutan Identitas KTP</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                
                {formData.relationType === 'Lainnya' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm text-slate-400 mb-2">Sebutkan Hubungan <span className="text-rose-500">*</span></label>
                    <input 
                      type="text"
                      value={formData.relationTypeCustom}
                      onChange={(e) => setFormData({...formData, relationTypeCustom: e.target.value})}
                      placeholder="Sebutkan hubungan dengan data pelaku..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600"
                      required={formData.relationType === 'Lainnya'}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="relative">
                  <label className="block text-sm text-slate-400 mb-2">Upload Foto KTP <span className="text-rose-500">*</span></label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-primary/50 bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative h-48">
                    {identityPhoto ? (
                      <>
                        <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">image</span>
                        <p className="text-sm font-medium text-white truncate max-w-full px-4">{identityPhoto.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(identityPhoto.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-3 block">id_card</span>
                        <p className="text-sm text-slate-300 font-medium mb-1">Klik untuk upload foto KTP</p>
                        <p className="text-xs text-slate-500">Format: JPG, PNG. Maks 5MB.</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setIdentityPhoto(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
               </div>
               
               <div className="relative">
                  <label className="block text-sm text-slate-400 mb-2">Upload Selfie dengan KTP <span className="text-rose-500">*</span></label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-primary/50 bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative h-48">
                    {selfiePhoto ? (
                      <>
                        <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">image</span>
                        <p className="text-sm font-medium text-white truncate max-w-full px-4">{selfiePhoto.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(selfiePhoto.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-3 block">portrait</span>
                        <p className="text-sm text-slate-300 font-medium mb-1">Klik untuk upload Selfie + KTP</p>
                        <p className="text-xs text-slate-500">Wajah dan teks KTP harus terlihat jelas.</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setSelfiePhoto(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
               </div>
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-500/80 flex items-start gap-2 leading-relaxed">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Data KTP dan NIK Anda <strong>SANGAT RAHASIA</strong> dan hanya digunakan untuk proses verifikasi internal oleh Admin. Data ini tidak akan pernah ditampilkan ke ranah publik.</span>
              </p>
            </div>
          </div>

          {/* Section 2: Pernyataan */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-xl font-bold text-white">Surat Pernyataan / Pembelaan</h2>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2 justify-between flex">
                <span>Pernyataan / Kronologi Anda <span className="text-rose-500">*</span></span>
                <span>{formData.statement.length}/5000</span>
              </label>
              <textarea 
                value={formData.statement}
                onChange={(e) => setFormData({...formData, statement: e.target.value})}
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-600 resize-none"
                placeholder="Ceritakan kronologi sebenarnya atau status penyelesaian masalah tersebut. Jika Anda sudah merefund nominal pelapor, cantumkan sedetail mungkin. Pernyataan ini nantinya akan ditampilkan ke publik jika disetujui..."
                minLength={50}
                maxLength={5000}
                required
              />
              <p className="text-xs text-slate-500 mt-2">Minimal 50 karakter. Jelaskan dengan lengkap dan sopan.</p>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm text-slate-400 mb-2">Upload File Bukti (Opsional)</label>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
                <FileUploader 
                  files={evidenceFiles} 
                  onChange={setEvidenceFiles} 
                  maxFiles={5}
                />
                <p className="text-xs text-slate-500 mt-3 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Format: JPG, PNG, WEBP, PDF, MP4. Maksimal 5 file, ukuran masing-masing tidak lebih dari 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Mengecek Berkas...
                </>
              ) : (
                <>
                  Kirim Pengajuan
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
