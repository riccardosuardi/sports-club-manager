import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Shirt,
  Megaphone,
  Settings,
  Trophy,
  Calendar,
  Shapes,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Contact,
  Building2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Atleti', to: '/atleti', icon: Users },
  { name: 'Gare', to: '/gare', icon: Calendar },
  { name: 'Attività', to: '/attivita', icon: GraduationCap },
  { name: 'Abbigliamento', to: '/abbigliamento', icon: Shirt },
  {
    name: 'Attività Giovanile',
    icon: Shapes,
    children: [
      { name: 'Atleti', to: '/attivita-giovanile/atleti' },
      { name: 'Genitori', to: '/attivita-giovanile/genitori' },
      { name: 'Attività', to: '/attivita-giovanile/attivita' },
    ],
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    roles: ['admin', 'segreteria'],
    children: [
      { name: 'Contatti', to: '/marketing/contatti' },
    ],
  },
  {
    name: 'Impostazioni',
    icon: Settings,
    roles: ['admin'],
    children: [
      { name: 'Utente', to: '/impostazioni/utente' },
      { name: 'Associazione', to: '/impostazioni/associazione' },
    ],
  },
]

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { hasRole, profile, signOut } = useAuth()
  const location = useLocation()

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r))
  )

  const [expanded, setExpanded] = useState(() => {
    const initial = {}
    navigation.forEach((item) => {
      if (item.children) {
        initial[item.name] = item.children.some((c) => location.pathname.startsWith(c.to))
      }
    })
    return initial
  })

  function toggleGroup(name) {
    if (collapsed) return
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${collapsed ? 'justify-center' : ''}`

  const groupButtonClasses = (isActive) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${collapsed ? 'justify-center' : ''}`

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          {collapsed ? (
            <Trophy className="mx-auto text-primary-600" size={24} />
          ) : (
            <div className="flex items-center gap-2">
              <Trophy className="text-primary-600" size={24} />
              <span className="text-lg font-bold text-gray-900">SportClub</span>
            </div>
          )}
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {filteredNav.map((item) => {
            if (item.children) {
              const isGroupActive = item.children.some((c) => location.pathname.startsWith(c.to))
              const isOpen = !collapsed && (expanded[item.name] || isGroupActive)

              if (collapsed) {
                const firstChild = item.children[0]
                return (
                  <NavLink
                    key={item.name}
                    to={firstChild.to}
                    className={linkClasses}
                    title={item.name}
                    onClick={onClose}
                  >
                    <item.icon size={20} />
                  </NavLink>
                )
              }

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={groupButtonClasses(isGroupActive)}
                  >
                    <item.icon size={20} />
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-8 mt-1 space-y-0.5">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={linkClasses}
                          onClick={onClose}
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClasses}
                onClick={onClose}
                end={item.to === '/'}
                title={collapsed ? item.name : undefined}
              >
                <item.icon size={20} />
                {!collapsed && item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* User + Collapse */}
        <div className="border-t border-gray-200 p-2">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700" title={profile?.full_name}>
                <User size={16} />
              </div>
              <button
                onClick={signOut}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Esci"
              >
                <LogOut size={16} />
              </button>
              <button
                onClick={onToggleCollapse}
                className="hidden rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:block"
                title="Espandi sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <User size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                </div>
                <button
                  onClick={signOut}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Esci"
                >
                  <LogOut size={16} />
                </button>
              </div>
              <button
                onClick={onToggleCollapse}
                className="hidden w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:flex"
                title="Comprimi sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
