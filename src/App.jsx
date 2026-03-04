import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'

// Lazy-load all pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Members = lazy(() => import('./pages/Members'))
const MemberDetail = lazy(() => import('./pages/MemberDetail'))
const Courses = lazy(() => import('./pages/Courses'))
const Clothing = lazy(() => import('./pages/Clothing'))
const Competitions = lazy(() => import('./pages/Competitions'))
const Marketing = lazy(() => import('./pages/Marketing'))
const SettingsUser = lazy(() => import('./pages/SettingsUser'))
const SettingsAssociation = lazy(() => import('./pages/SettingsAssociation'))
const YouthAthletes = lazy(() => import('./pages/YouthAthletes'))
const YouthParents = lazy(() => import('./pages/YouthParents'))
const YouthCourses = lazy(() => import('./pages/YouthCourses'))

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-gray-500">Caricamento...</div>
    </div>
  )
}

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
    <Suspense fallback={<PageLoader />}>
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

          {/* Attività Giovanile */}
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

          {/* Impostazioni */}
          <Route
            path="/impostazioni/utente"
            element={
              <ProtectedRoute roles={['admin']}>
                <SettingsUser />
              </ProtectedRoute>
            }
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
    </Suspense>
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
