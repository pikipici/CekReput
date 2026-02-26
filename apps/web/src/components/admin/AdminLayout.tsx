import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'

export default function AdminLayout() {
  const { user, isLoggedIn } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats] = useState({ pending: 0, clarifications: 0 })

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
