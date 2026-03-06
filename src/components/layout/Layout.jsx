import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

const ROUTE_ROLES = {
  '/': null,
  '/atleti': null,
  '/gare': null,
  '/attivita': null,
  '/abbigliamento': null,
  '/attivita-giovanile/atleti': null,
  '/attivita-giovanile/genitori': null,
  '/attivita-giovanile/attivita': null,
  '/marketing/contatti': ['admin', 'segreteria'],
  '/marketing/attivita': ['admin', 'segreteria'],
  '/impostazioni/utente': null,
  '/impostazioni/associazione': ['admin'],
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { profile } = useAuth()
  const location = useLocation()

  const path = location.pathname
  const matchedPath = Object.keys(ROUTE_ROLES).find(r => path === r || (r !== '/' && path.startsWith(r)))
  const roles = matchedPath ? ROUTE_ROLES[matchedPath] : undefined

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar - only burger menu */}
        <div className="flex h-12 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <Menu size={20} />
          </button>
        </div>
        {/* Debug roles banner */}
        <div className="flex items-center justify-between border-b border-dashed border-amber-300 bg-amber-50 px-4 py-1 text-xs text-amber-700">
          <span>
            Ruoli pagina: <strong>{roles ? roles.join(', ') : 'tutti'}</strong>
          </span>
          <span>
            Il tuo ruolo: <strong className="capitalize">{profile?.role || '—'}</strong>
          </span>
        </div>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
