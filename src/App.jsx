import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberDetail from './pages/MemberDetail'
import Courses from './pages/Courses'
import Clothing from './pages/Clothing'
import Marketing from './pages/Marketing'
import Settings from './pages/Settings'

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
        <Route path="/soci" element={<Members />} />
        <Route path="/soci/:id" element={<MemberDetail />} />
        <Route path="/corsi" element={<Courses />} />
        <Route path="/abbigliamento" element={<Clothing />} />
        <Route
          path="/marketing"
          element={
            <ProtectedRoute roles={['admin', 'segreteria']}>
              <Marketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/impostazioni"
          element={
            <ProtectedRoute roles={['admin']}>
              <Settings />
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
