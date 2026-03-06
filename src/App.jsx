import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberDetail from './pages/MemberDetail'
import Courses from './pages/Courses'
import Clothing from './pages/Clothing'
import Competitions from './pages/Competitions'
import Marketing from './pages/Marketing'
import MarketingActivities from './pages/MarketingActivities'
import SettingsUser from './pages/SettingsUser'
import SettingsAssociation from './pages/SettingsAssociation'
import YouthAthletes from './pages/YouthAthletes'
import YouthParents from './pages/YouthParents'
import YouthCourses from './pages/YouthCourses'

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading, hasRole } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (roles && profile && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/atleti" element={<Members />} />
        <Route path="/atleti/:id" element={<MemberDetail />} />
        <Route path="/gare" element={<Competitions />} />
        <Route path="/attivita" element={<Courses />} />
        <Route path="/abbigliamento" element={<Clothing />} />

        {/* Attivita Giovanile */}
        <Route path="/attivita-giovanile/atleti" element={<YouthAthletes />} />
        <Route path="/attivita-giovanile/genitori" element={<YouthParents />} />
        <Route path="/attivita-giovanile/attivita" element={<YouthCourses />} />

        {/* Marketing */}
        <Route
          path="/marketing/contatti"
          element={
            <ProtectedRoute roles={['admin', 'segreteria']}>
              <Marketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing/attivita"
          element={
            <ProtectedRoute roles={['admin', 'segreteria']}>
              <MarketingActivities />
            </ProtectedRoute>
          }
        />

        {/* Impostazioni */}
        <Route
          path="/impostazioni/utente"
          element={<SettingsUser />}
        />
        <Route
          path="/impostazioni/associazione"
          element={
            <ProtectedRoute roles={['admin']}>
              <SettingsAssociation />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
