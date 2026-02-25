import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import ProfileDetail from './pages/ProfileDetail'
import ReportScam from './pages/ReportScam'

// Admin
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ModerationPage from './pages/admin/ModerationPage'
import PerpetratorsPage from './pages/admin/PerpetratorsPage'
import UsersPage from './pages/admin/UsersPage'
import ClarificationsPage from './pages/admin/ClarificationsPage'

import AdminSettingsPage from './pages/admin/AdminSettingsPage'

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
          <Route path="/report" element={<ReportScam />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="perpetrators" element={<PerpetratorsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="clarifications" element={<ClarificationsPage />} />

            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
