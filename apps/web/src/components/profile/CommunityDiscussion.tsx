import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { perpetratorsApi, commentsApi } from '../../lib/api'
import AuthModal from '../AuthModal'
import UserBadge from './UserBadge'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'

interface Comment {
  id: string
  content: string
  upvotes: number
  downvotes: number
  createdAt: string
  user: {
    id: string
    name: string
    role: string
    badges?: string[]
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
  const turnstileRef = useRef<TurnstileInstance>(null)
  
  // Force re-render periodically to update timestamps
  const [, setNowTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setNowTick(prev => prev + 1), 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])
  
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return
      setLoading(true)
      try {
        const res = await perpetratorsApi.getComments(id)
        if (res.data?.comments) {
          // Map UserComment to Comment format
          setComments(res.data.comments.map(c => ({
            ...c,
            user: { id: 'unknown', name: 'Anonymous', role: 'user' }
          })))
        }
      } catch {
        console.error('Gagal mengambil komentar:')
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

    if (!newComment.trim() || isSubmitting || !token || !id) return

    const message = newComment.trim()
    setNewComment('')
    setIsSubmitting(true)

    // Send to backend
    try {
      const res = await commentsApi.create({
        perpetratorId: id,
        content: message,
        turnstileToken: turnstileToken || '',
      }, token)
      
      if (res.data && typeof res.data === 'object' && 'comment' in res.data) {
        // Construct the new comment with current user info
        const newCom: Comment = {
          ...(res.data as { comment: Comment }).comment,
          user: {
            id: user.id || '',
            name: user.name || 'Anda',
            role: user.role || 'user'
          }
        }
        setComments(prev => [newCom, ...prev])
      }
      } catch {
      console.error('Error creating comment')
      // Reset turnstile on error so they can try again
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async (commentId: string) => {
    if (!user || !token) {
      setShowLoginPrompt(true)
      return
    }

    try {
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
      ))
      await commentsApi.vote(commentId, 'up', token)
    } catch {
      // Revert on error
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, upvotes: c.upvotes - 1 } : c
      ))
    }
  }

  return (
    <>
      <section className="glass-panel rounded-2xl p-6 flex flex-col h-full">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-primary">forum</span>
          Diskusi Komunitas
        </h3>
        
        <div className="space-y-5 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Belum ada diskusi untuk profil ini.</p>
          ) : (
            comments.map((comment) => {
              const displayTime = getTimeAgo(comment.createdAt)
              const initial = comment.user.name.charAt(0).toUpperCase()
              const isAdmin = comment.user.role === 'admin'
              return (
                <div key={comment.id} className="flex gap-3">
                  <div className="shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border border-slate-700 bg-slate-800 text-slate-300">
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
                      <span className="text-[10px] text-slate-500 shrink-0">{displayTime}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <button 
                         onClick={() => handleUpvote(comment.id)}
                         className={`flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors`}
                       >
                         <span className="material-symbols-outlined text-[14px]">thumb_up</span> {comment.upvotes}
                       </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} className="h-1 text-transparent" />
        </div>

        {/* Comment Input */}
        <div className="mt-auto pt-4 border-t border-slate-700/50 flex flex-col gap-2">
          {user && (
             <div className="self-end my-1">
               <Turnstile
                 siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                 onSuccess={(t) => setTurnstileToken(t)}
                 ref={turnstileRef}
                 options={{ size: 'flexible', theme: 'dark' }}
               />
             </div>
          )}
          <div className="flex items-center gap-2 bg-[#10231f] border border-[#214a42] rounded-full px-4 py-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            <input 
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-white placeholder-slate-500 min-w-0" 
              placeholder={user ? "Ikut berdiskusi..." : "Klik untuk berdiskusi..."}
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
            />
            <button 
              onClick={handleSend}
              disabled={(!newComment.trim() || !user || !turnstileToken)}
              className="shrink-0 bg-primary text-[#0f231f] h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
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
