import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { commentsApi } from '../../lib/api'
import AuthModal from '../AuthModal'

interface Comment {
  id: string
  author: string
  initial: string
  color: string
  timeAgo: string
  content: string
  upvotes: number
  isAdmin?: boolean
  hasUpvoted?: boolean
  timestamp?: number
}



const STORAGE_KEY = 'cekreput_community_comments_global'

const loadComments = (): Comment[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Comment[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Backwards compatibility: add timestamps to legacy comments
        return parsed.map(c => ({
          ...c,
          timestamp: c.timestamp || Date.now() - 60000 // default to 1 min ago if missing
        }))
      }
    } catch {
      // ignore
    }
  }
  return []
}

const getTimeAgo = (timestamp: number) => {
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
  const [comments, setComments] = useState<Comment[]>(loadComments)
  const [newComment, setNewComment] = useState('')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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

  // Save to localStorage when comments change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
  }, [comments])

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

    if (!newComment.trim() || isSubmitting) return

    const message = newComment.trim()
    setNewComment('')
    setIsSubmitting(true)

    // Optimistic UI update
    const tempId = Date.now().toString()
    const commentObj: Comment = {
      id: tempId,
      author: user?.name || 'Anda',
      initial: (user?.name || 'A').charAt(0).toUpperCase(),
      color: 'bg-primary/20 text-primary border-primary/30',
      timeAgo: 'baru saja',
      content: message,
      upvotes: 0,
      timestamp: Date.now()
    }

    setComments(prev => [...prev, commentObj])

    // Send to backend
    if (token && id) {
      try {
        const { error } = await commentsApi.create({
          perpetratorId: id,
          content: message
        }, token)
        
        if (error) {
          console.error("Failed to save comment to database: ", error)
          // Even if it fails, we keep it in the optimistic UI & local storage
          // so the user's input isn't abruptly lost during the demo.
        }
      } catch (err) {
        console.error("Error creating comment: ", err)
      }
    }

    setIsSubmitting(false)
  }

  const handleUpvote = (id: string) => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    setComments(comments.map(c => {
      if (c.id === id) {
        if (c.hasUpvoted) {
          return { ...c, upvotes: c.upvotes - 1, hasUpvoted: false }
        } else {
          return { ...c, upvotes: c.upvotes + 1, hasUpvoted: true }
        }
      }
      return c
    }))
  }

  return (
    <>
      <section className="glass-panel rounded-2xl p-6 flex flex-col h-full">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-primary">forum</span>
          Diskusi Komunitas
        </h3>
        
        <div className="space-y-5 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {comments.map((comment) => {
            const displayTime = comment.timestamp ? getTimeAgo(comment.timestamp) : comment.timeAgo
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="shrink-0 mt-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${comment.color}`}>
                    {comment.initial}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      {comment.author}
                      {comment.isAdmin && <span className="material-symbols-outlined text-[12px] text-primary" title="Admin Terverifikasi">verified_user</span>}
                    </p>
                    <span className="text-[10px] text-slate-500">{displayTime}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => handleUpvote(comment.id)}
                      className={`flex items-center gap-1 text-[10px] hover:text-primary-dark transition-colors ${comment.hasUpvoted ? 'text-primary font-bold' : 'text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {comment.upvotes}
                    </button>
                    <button onClick={handleInputClick} className="text-[10px] text-slate-400 hover:text-white transition-colors">Balas</button>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} className="h-1 text-transparent" />
        </div>

        {/* Comment Input */}
        <div className="mt-auto pt-4 border-t border-slate-700/50">
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
              disabled={(!newComment.trim() || !user)}
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
