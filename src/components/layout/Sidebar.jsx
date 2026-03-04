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
  Baby,
  X,
  ChevronDown,
  Contact,
  Building2,
  User,
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
    icon: Baby,
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

export default function Sidebar({ open, onClose }) {
  const { hasRole } = useAuth()
  const location = useLocation()

  const filteredNav = navigation.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r))
  )

  // Auto-expand groups if a child route is active
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
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const groupButtonClasses = (isActive) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNav.map((item) => {
            if (item.children) {
              const isGroupActive = item.children.some((c) => location.pathname.startsWith(c.to))
              const isOpen = expanded[item.name] || isGroupActive

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
              >
                <item.icon size={20} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
