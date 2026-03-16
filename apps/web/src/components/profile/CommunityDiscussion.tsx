import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { perpetratorsApi, commentsApi, type UserComment } from '../../lib/api'
import AuthModal from '../AuthModal'
import UserBadge from './UserBadge'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'

interface Comment extends UserComment {
  user: {
    id: string
    name: string
    role: string
    badges?: string[] | null
  }
}

const getTimeAgo = (dateStr: string) => {
  const timestamp = new Date(dateStr).getTime()
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'baru saja'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.floor(days / 30)
  return `${months} bulan lalu`
}

export default function CommunityDiscussion() {
  const { user, token } = useAuth()
  const { id } = useParams<{ id: string }>()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [votingCommentId, setVotingCommentId] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState<string | null>(null)
  const [turnstileSuccess, setTurnstileSuccess] = useState(false)
  const [visibleComments, setVisibleComments] = useState(3)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

  // Generate consistent color for user avatar based on user ID
  const getUserAvatarColor = (userId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-amber-500',
    ]
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Force re-render periodically to update timestamps
  const [, setNowTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setNowTick(prev => prev + 1), 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return
      setLoading(true)
      try {
        console.log('[CommunityDiscussion] Fetching comments for perpetrator:', id)
        const res = await perpetratorsApi.getComments(id)
        console.log('[CommunityDiscussion] API response:', res)
        if (res.data?.comments) {
          // Use actual user data from API response
          console.log('[CommunityDiscussion] Comments fetched:', res.data.comments.length)
          setComments(res.data.comments as unknown as Comment[])
        } else {
          console.log('[CommunityDiscussion] No comments in response')
        }
      } catch (err) {
        console.error('[CommunityDiscussion] Gagal mengambil komentar:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [id])

  const handleInputClick = () => {
    if (!user) {
      setShowLoginPrompt(true)
    }
  }

  const handleSend = async () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    if (!newComment.trim() || isSubmitting || !token || !id) {
      console.log('[CommunityDiscussion] Cannot send:', {
        hasComment: !!newComment.trim(),
        isSubmitting,
        hasToken: !!token,
        hasId: !!id
      })
      return
    }

    const message = newComment.trim()
    setNewComment('')
    setIsSubmitting(true)
    setSubmitError(null)

    console.log('[CommunityDiscussion] Sending comment:', {
      perpetratorId: id,
      content: message,
      hasTurnstileToken: !!turnstileToken
    })

    // Send to backend
    try {
      const res = await commentsApi.create({
        perpetratorId: id,
        content: message,
        turnstileToken: turnstileToken || '',
      }, token)

      console.log('[CommunityDiscussion] API response:', res)

      if (res.data && typeof res.data === 'object' && 'comment' in res.data) {
        // Construct the new comment with current user info
        const newCom: Comment = {
          ...(res.data as { comment: Comment }).comment,
          user: {
            id: user.id || '',
            name: user.name || 'Anda',
            role: user.role || 'user',
            badges: user.badges || []
          }
        }
        setComments(prev => [newCom, ...prev])
        // Reset turnstile after successful submit
        turnstileRef.current?.reset()
        setTurnstileToken(null)
        console.log('[CommunityDiscussion] Comment sent successfully')
      }
    } catch (err) {
      console.error('[CommunityDiscussion] Error creating comment:', err)
      setSubmitError('Gagal mengirim komentar. Silakan coba lagi.')
      // Reset turnstile on error so they can try again
      turnstileRef.current?.reset()
      setTurnstileToken(null)
      // Restore the comment text so user doesn't lose it
      setNewComment(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async (commentId: string) => {
    if (!user || !token) {
      setShowLoginPrompt(true)
      return
    }

    // Optimistic update
    const originalComments = comments
    setVotingCommentId(commentId)
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
    ))

    try {
      await commentsApi.vote(commentId, 'up', token)
    } catch {
      // Revert on error
      setComments(originalComments)
      setSubmitError('Gagal memberikan vote. Silakan coba lagi.')
      setTimeout(() => setSubmitError(null), 3000)
    } finally {
      setVotingCommentId(null)
    }
  }

  return (
    <>
      <section className="glass-panel rounded-2xl p-6 flex flex-col h-full">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-primary">forum</span>
          Diskusi Komunitas
        </h3>

        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {submitError}
          </div>
        )}

        {/* Turnstile Error */}
        {turnstileError && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            {turnstileError}
          </div>
        )}

        <div className="space-y-5 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">forum</span>
              <p className="text-slate-400 text-sm">Belum ada diskusi untuk profil ini.</p>
              <p className="text-slate-500 text-xs mt-1">Jadilah yang pertama memberikan komentar!</p>
              {turnstileError && (
                <p className="text-slate-600 text-xs mt-2">
                  💡 Tip: Refresh halaman jika Turnstile tidak berfungsi
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Display only visibleComments (default 3) */}
              {comments.slice(0, visibleComments).map((comment, index) => {
                const displayTime = getTimeAgo(comment.createdAt)
                const initial = comment.user.name.charAt(0).toUpperCase()
                const isAdmin = comment.user.role === 'admin'
                const isLastVisible = index === visibleComments - 1 || index === comments.length - 1
                const avatarColor = getUserAvatarColor(comment.user.id)
                return (
                  <div key={comment.id} className={`flex gap-3 ${!isLastVisible ? 'pb-5 border-b border-slate-700/30' : 'pb-3'}`}>
                    <div className="shrink-0 mt-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border border-slate-700 text-white ${avatarColor}`}>
                        {initial}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="text-xs font-bold text-white flex items-center gap-1">
                            {comment.user.name}
                            {isAdmin && <span className="material-symbols-outlined text-[12px] text-amber-500" title="Admin">shield_person</span>}
                          </p>
                          <UserBadge badges={comment.user.badges} />
                        </div>
                        <span className="text-[10px] text-slate-600 shrink-0">{displayTime}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <button
                           onClick={() => handleUpvote(comment.id)}
                           disabled={votingCommentId === comment.id}
                           className={`flex items-center gap-1 text-[10px] transition-colors ${
                             votingCommentId === comment.id
                               ? 'text-slate-500 cursor-not-allowed'
                               : 'text-emerald-400 hover:text-emerald-300'
                           }`}
                         >
                           {votingCommentId === comment.id ? (
                             <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                           ) : (
                             <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                           )}
                           {comment.upvotes}
                         </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Load More Button */}
              {visibleComments < comments.length && (
                <div className="pt-4 mt-4 border-t border-slate-700/50 flex justify-center">
                  <button
                    onClick={() => setVisibleComments(prev => prev + 3)}
                    className="px-6 py-2 rounded-lg bg-transparent hover:bg-slate-800/50 border border-slate-600 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    Lainnya ({comments.length - visibleComments} lagi)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Comment Input */}
        <div className="mt-auto pt-4 border-t border-slate-700/50 flex flex-col gap-3">
          {user && (
            <div className="flex flex-col gap-2">
              {/* Turnstile Widget - Hide on success */}
              {!turnstileSuccess && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={turnstileSiteKey}
                    onSuccess={(t) => {
                      setTurnstileToken(t)
                      setTurnstileError(null)
                      setTurnstileSuccess(true)
                    }}
                    onError={(e) => {
                      console.error('[CommunityDiscussion] Turnstile error:', e)
                      setTurnstileError('Untuk Berdiskusi Perlu Refresh Ulang')
                      setTurnstileToken(null)
                      setTurnstileSuccess(false)
                    }}
                    onExpire={() => {
                      setTurnstileToken(null)
                      setTurnstileSuccess(false)
                      turnstileRef.current?.reset()
                    }}
                    ref={turnstileRef}
                    options={{ 
                      size: 'flexible', 
                      theme: 'dark',
                      execution: 'render'
                    }}
                  />
                </div>
              )}
              {/* Show check icon on success */}
              {turnstileSuccess && (
                <div className="flex justify-center items-center gap-1 text-emerald-400 text-xs">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Verified</span>
                </div>
              )}
              {turnstileError && (
                <p className="text-[10px] text-slate-500 mt-1 text-center">
                  Refresh halaman untuk mencoba lagi
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 bg-[#10231f] border border-[#214a42] rounded-full px-4 py-2.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-white placeholder-slate-500 min-w-0 disabled:opacity-50"
              placeholder={user ? "Minimal 10 karakter..." : "Klik untuk berdiskasi..."}
              value={newComment}
              onClick={handleInputClick}
              onChange={(e) => {
                if (user) setNewComment(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isSubmitting}
            />
            <button
              onClick={handleSend}
              disabled={(!newComment.trim() || !user || !turnstileToken || isSubmitting || newComment.trim().length < 10)}
              className="shrink-0 bg-primary text-[#0f231f] h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={newComment.trim().length < 10 && newComment.trim().length > 0 ? `Minimal 10 karakter (saat ini: ${newComment.trim().length})` : undefined}
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">send</span>
              )}
            </button>
          </div>
          {/* Character count */}
          {user && newComment.length > 0 && (
            <div className={`text-xs text-right ${newComment.trim().length < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {newComment.trim().length}/10 karakter minimal
            </div>
          )}
        </div>
      </section>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl max-w-sm w-full text-center animate-fade-in-up">
            <div className="h-14 w-14 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Login Diperlukan</h3>
            <p className="text-slate-400 text-sm mb-6">
              Jika ingin bergabung ke kolom diskusi, kamu harus login terlebih dahulu.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setShowLoginPrompt(false)
                  setShowAuthModal(true)
                }}
                className="flex-1 py-2.5 bg-primary text-[#0f231f] rounded-xl hover:bg-primary-dark transition-colors text-sm font-bold"
              >
                Login Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Triggered by Prompt */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
