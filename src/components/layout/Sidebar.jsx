import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Shirt,
  Megaphone,
  Settings,
  Trophy,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Soci', to: '/soci', icon: Users },
  { name: 'Corsi', to: '/corsi', icon: GraduationCap },
  { name: 'Abbigliamento', to: '/abbigliamento', icon: Shirt },
  { name: 'Marketing', to: '/marketing', icon: Megaphone, roles: ['admin', 'segreteria'] },
  { name: 'Impostazioni', to: '/impostazioni', icon: Settings, roles: ['admin'] },
]

export default function Sidebar({ open, onClose }) {
  const { hasRole } = useAuth()

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r))
  )

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <Trophy className="text-primary-600" size={24} />
            <span className="text-lg font-bold text-gray-900">SportClub</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClasses} onClick={onClose} end={item.to === '/'}>
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
