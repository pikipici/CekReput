import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'

export default function AdminLayout() {
  const { user, isLoggedIn, token } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({ pending: 0, clarifications: 0 })

  useEffect(() => {
    if (!token) return
    const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
    fetch(`${API_BASE}/api/moderation/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats({
            pending: data.stats.pending || 0,
            clarifications: data.stats.pendingClarifications || 0
          })
        }
      })
      .catch(() => {})
  }, [token])

  // Redirect if not admin/moderator
  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />
  }

  if (user.role !== 'admin' && user.role !== 'moderator') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingReports={stats.pending}
        pendingClarifications={stats.clarifications}
      />

      {/* Main content area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
