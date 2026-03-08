import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../lib/api'
import SEO from '../components/SEO'

interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  bio: string | null
  role: string
  createdAt: string
}

interface UserStats {
  totalReports: number
  verifiedReports: number
}

interface UserComment {
  id: string
  content: string
  upvotes: number
  downvotes: number
  createdAt: string
  perpetrator: {
    id: string
    entityName: string | null
    accountNumber: string | null
    phoneNumber: string | null
    bankName: string | null
  }
}

interface UploadedAvatar {
  url: string
  preview: string
}

export default function UserProfilePage() {
  const { token, isLoggedIn, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)

  // Comments fetching
  const [comments, setComments] = useState<UserComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(false)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [uploadedAvatar, setUploadedAvatar] = useState<UploadedAvatar | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'discussions'>('profile')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      if (!token) return
      setLoading(true)
      try {
        const res = await usersApi.getProfile(token)
        if (res.error) {
          setError(res.error)
        } else if (res.data) {
          setProfile(res.data.user)
          setStats(res.data.stats)
          setEditName(res.data.user.name)
          setEditBio(res.data.user.bio || '')
          setEditAvatarUrl(res.data.user.avatarUrl || '')
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Terjadi kesalahan saat memuat profil.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, isLoggedIn, navigate])

  const fetchComments = async (pageNumber: number) => {
    if (!token) return
    setCommentsLoading(true)
    try {
      const res = await usersApi.getComments(token, pageNumber)
      if (res.data) {
        setComments(res.data.comments)
        setHasMoreComments(res.data.hasMore)
        setPage(pageNumber)
      }
    } catch (err) {
      console.error('Failed to fetch user comments', err)
    } finally {
      setCommentsLoading(false)
    }
  }

  // Load comments when switching to discussions tab
  useEffect(() => {
    if (activeTab === 'discussions' && comments.length === 0) {
      fetchComments(1)
    }
  }, [activeTab])

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG/PNG)')
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Ukuran file maksimal 2MB')
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setUploadedAvatar({ url: '', preview: previewUrl })

    // Upload to R2
    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
      const res = await fetch(`${API_BASE}/api/upload/evidence`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah foto profil')
      }

      setUploadedAvatar({
        url: data.file.url,
        preview: previewUrl,
      })
    } catch (err: unknown) {
      console.error('Avatar upload error:', err)
      setError((err as Error).message || 'Gagal mengunggah foto profil')
      setUploadedAvatar(null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSaveProfile = async () => {
    if (!token) return
    setIsSaving(true)
    try {
      // Use uploaded avatar URL if available, otherwise use existing editAvatarUrl
      const finalAvatarUrl = uploadedAvatar?.url || editAvatarUrl || undefined

      const res = await usersApi.updateProfile({
        name: editName,
        bio: editBio,
        avatarUrl: finalAvatarUrl,
      }, token)

      if (res.error) {
        setError(res.error)
      } else if (res.data) {
        setProfile((prev) => prev ? { ...prev, name: editName, bio: editBio, avatarUrl: finalAvatarUrl || null } : null)
        setUploadedAvatar(null)
        setIsEditing(false)
        // Update user context to reflect new avatar immediately
        updateUser({ avatarUrl: finalAvatarUrl ?? null })
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan profil')
    } finally {
      setIsSaving(false)
    }
  }

  const getPerpetratorLabel = (perp: UserComment['perpetrator']) => {
    if (perp.entityName) return perp.entityName
    if (perp.accountNumber) return `${perp.bankName || 'Bank'} - ${perp.accountNumber}`
    if (perp.phoneNumber) return perp.phoneNumber
    return 'Entitas Tidak Diketahui'
  }

  const initials = profile?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

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

  return (
    <>
      <SEO
        title="Profil Pengguna"
        description="Kelola profil pengguna CekReput Anda, lihat statistik kontribusi, dan kelola diskusi."
        canonical="https://cekreput.com/profile"
        noIndex={true}
      />
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-primary/30">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 lg:py-16">
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-8 text-rose-400 font-medium flex items-center gap-3 animate-in fade-in">
            <span className="material-symbols-outlined shrink-0 text-xl">error</span>
            {error}
            <button onClick={() => setError('')} className="ml-auto opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar - Profile Card & Stats */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Main Profile Info */}
            <div className="glass-panel p-6 rounded-2xl animate-in flip-in-y duration-700">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20 mb-4 overflow-hidden ring-4 ring-slate-800">
                    {uploadedAvatar?.preview ? (
                      <img src={uploadedAvatar.preview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Upload Avatar Button - Only show when editing */}
                  {isEditing && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleAvatarFileSelect}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary hover:bg-primary-hover border-4 border-slate-900 flex items-center justify-center text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Ganti foto profil"
                      >
                        {isUploading ? (
                          <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">camera_alt</span>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {uploadedAvatar && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Foto profil baru dipilih
                  </p>
                )}
                
                <h2 className="text-xl font-bold text-white leading-tight">{profile?.name}</h2>
                <p className="text-slate-400 text-sm mb-3">{profile?.email}</p>
                
                <div className="flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-slate-800/50 border border-white/5 text-xs text-slate-300 font-medium">
                  {profile?.role === 'admin' ? (
                     <><span className="material-symbols-outlined text-[14px] text-amber-500">shield_person</span> Admin</>
                  ) : profile?.role === 'moderator' ? (
                     <><span className="material-symbols-outlined text-[14px] text-blue-500">gavel</span> Moderator</>
                  ) : (
                     <><span className="material-symbols-outlined text-[14px] text-primary">verified_user</span> Pengguna Reguler</>
                  )}
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4"></div>

                <p className="text-slate-300 text-sm italic mb-6">
                  {profile?.bio || "Belum ada bio."}
                </p>

                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2 text-slate-300"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit Profil
                </button>
              </div>
            </div>

            {/* Contribution Stats */}
            <div className="glass-panel p-6 rounded-2xl animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitoring</span>
                Statistik Kontribusi
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stats?.totalReports || 0}</div>
                  <div className="text-xs font-medium text-slate-400">Total Laporan</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{stats?.verifiedReports || 0}</div>
                  <div className="text-xs font-medium text-slate-400">Terverifikasi</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Content Area */}
          <div className="flex-1 w-full flex flex-col">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800/50 pb-px overflow-x-auto no-scrollbar">
              <button
                onClick={() => { setActiveTab('profile'); setIsEditing(false) }}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'profile' && !isEditing ? 'border-primary text-primary bg-primary/5 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 rounded-t-lg'}`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Informasi Akun
              </button>
              <button
                onClick={() => { setActiveTab('discussions'); setIsEditing(false) }}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'discussions' && !isEditing ? 'border-primary text-primary bg-primary/5 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 rounded-t-lg'}`}
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                Diskusi Saya
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-[400px]">
              
              {/* Profile / Edit Profile Content */}
              {isEditing || activeTab === 'profile' ? (
                <div className="glass-panel p-6 sm:p-8 rounded-2xl animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">
                      {isEditing ? 'Edit Informasi Profil' : 'Informasi Personal'}
                    </h3>
                  </div>

                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nama Lengkap</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                          />
                        ) : (
                          <div className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 cursor-not-allowed">
                            {profile?.name}
                          </div>
                        )}
                      </div>

                      {/* Email (Non-editable) */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Akun (Tidak dapat diubah)</label>
                        <div className="w-full bg-slate-900/80 border border-slate-800 text-slate-500 rounded-xl px-4 py-3 flex items-center justify-between">
                          {profile?.email}
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Biografi Singkat</label>
                        {isEditing ? (
                          <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[100px] resize-y"
                            placeholder="Ceritakan sedikit tentang Anda..."
                          />
                        ) : (
                          <div className="w-full bg-slate-900/50 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 min-h-[100px] whitespace-pre-wrap cursor-not-allowed">
                            {profile?.bio || '-'}
                          </div>
                        )}
                      </div>

                      {/* Avatar Upload Info */}
                      {isEditing && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Foto Profil</label>
                          <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                            <p className="text-sm text-slate-400">
                              Klik tombol <span className="material-symbols-outlined text-[16px] align-middle">camera_alt</span> di pojok kanan bawah foto profil untuk mengganti foto
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="pt-6 flex justify-end gap-4 border-t border-slate-800/50">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setEditName(profile?.name || '')
                            setEditBio(profile?.bio || '')
                            setEditAvatarUrl(profile?.avatarUrl || '')
                            setUploadedAvatar(null)
                          }}
                          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving || isUploading}
                          className="px-6 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 disabled:hover:scale-100 disabled:opacity-70 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        >
                          {isSaving ? (
                             <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Menyimpan...</>
                          ) : (
                             <><span className="material-symbols-outlined text-[18px]">save</span> Simpan Perubahan</>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              ) : null}

              {/* Discussions Content */}
              {activeTab === 'discussions' && !isEditing && (
                <div className="glass-panel p-6 rounded-2xl animate-in fade-in duration-300">
                  <h3 className="text-xl font-bold text-white mb-6">Riwayat Komentar & Diskusi</h3>
                  
                  {commentsLoading && comments.length === 0 ? (
                    <div className="flex justify-center py-12">
                       <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-slate-500">speaker_notes_off</span>
                      </div>
                      <p className="text-slate-400">Anda belum pernah mengirim komentar pada profil mana pun.</p>
                      <Link to="/" className="text-primary hover:underline mt-2 text-sm font-medium">Cari Profil Pelaku</Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Link 
                               to={`/profile/${comment.perpetrator.id}`}
                               className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1 rounded-full border border-primary/20 transition-colors flex items-center gap-1 opacity-80 group-hover:opacity-100"
                            >
                              Lihat Diskusi <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>
                          </div>
                          
                          <p className="text-slate-300 text-sm leading-relaxed mb-4">
                            "{comment.content}"
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-wrap gap-4">
                             <div className="flex items-center gap-4 text-xs font-medium">
                                <span className="flex items-center gap-1.5 text-emerald-400/80">
                                   <span className="material-symbols-outlined text-[16px]">thumb_up</span> {comment.upvotes}
                                </span>
                                <span className="flex items-center gap-1.5 text-rose-400/80">
                                   <span className="material-symbols-outlined text-[16px]">thumb_down</span> {comment.downvotes}
                                </span>
                             </div>

                             <div className="text-xs text-slate-400 flex items-center gap-1">
                               Ditinggalkan pada profil: <span className="font-semibold text-slate-300">{getPerpetratorLabel(comment.perpetrator)}</span>
                             </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination Controls */}
                      <div className="flex items-center justify-between pt-4">
                        <button
                          onClick={() => fetchComments(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-slate-800"
                        >
                          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                          Sblm
                        </button>
                        <span className="text-xs text-slate-500">Hal {page}</span>
                        <button
                          onClick={() => fetchComments(page + 1)}
                          disabled={!hasMoreComments}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-slate-800"
                        >
                          Lnjt
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
    </>
  )
}
