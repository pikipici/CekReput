import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import ProfileDetail from './pages/ProfileDetail'
import ReportScam from './pages/ReportScam'
import ClarifyPage from './pages/ClarifyPage'
import MyReportsPage from './pages/MyReportsPage'
import UserProfilePage from './pages/UserProfilePage'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'

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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<SearchResults />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
          <Route path="/report" element={<ReportScam />} />
          <Route path="/clarify/:id" element={<ClarifyPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

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
  )
}

export default App
