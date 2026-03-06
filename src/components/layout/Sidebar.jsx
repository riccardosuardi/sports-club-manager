import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  UserRoundPlus,
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
import { useAssociation } from '../../context/AssociationContext'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Atleti', to: '/atleti', icon: Users },
  { name: 'Ospiti', to: '/ospiti', icon: UserRoundPlus },
  { name: 'Gare', to: '/gare', icon: Calendar },
  { name: 'Attività', to: '/attivita', icon: GraduationCap },
  { name: 'Abbigliamento', to: '/abbigliamento', icon: Shirt },
  {
    name: 'Attività Giovanile',
    icon: Shapes,
    children: [
      { name: 'Atleti', to: '/attivita-giovanile/atleti', icon: Users },
      { name: 'Genitori', to: '/attivita-giovanile/genitori', icon: Contact },
      { name: 'Attività', to: '/attivita-giovanile/attivita', icon: GraduationCap },
    ],
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    roles: ['admin', 'segreteria'],
    children: [
      { name: 'Contatti', to: '/marketing/contatti', icon: Contact },
      { name: 'Attività', to: '/marketing/attivita', icon: GraduationCap },
    ],
  },
  {
    name: 'Impostazioni',
    icon: Settings,
    children: [
      { name: 'Utente', to: '/impostazioni/utente', icon: User },
      { name: 'Associazione', to: '/impostazioni/associazione', icon: Building2, roles: ['admin'] },
    ],
  },
]

function Tooltip({ label, children }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)

  function handleEnter() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 })
    }
    setShow(true)
  }

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && createPortal(
        <div
          className="pointer-events-none fixed z-[9999] -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{ top: pos.top, left: pos.left }}
        >
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>,
        document.body
      )}
    </div>
  )
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { hasRole, profile, signOut } = useAuth()
  const { settings: assocSettings } = useAssociation()
  const location = useLocation()

  const filteredNav = navigation
    .filter((item) => !item.roles || item.roles.some((r) => hasRole(r)))
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((c) => !c.roles || c.roles.some((r) => hasRole(r)))
        return { ...item, children: filteredChildren }
      }
      return item
    })
    .filter((item) => !item.children || item.children.length > 0)

  const [expanded, setExpanded] = useState(() => {
    const initial = {}
    navigation.forEach((item) => {
      if (item.children) {
        initial[item.name] = item.children.some((c) => location.pathname.startsWith(c.to))
      }
    })
    return initial
  })

  // Auto-close groups that are not active when route changes
  useEffect(() => {
    setExpanded((prev) => {
      const next = {}
      navigation.forEach((item) => {
        if (item.children) {
          const isActive = item.children.some((c) => location.pathname.startsWith(c.to))
          next[item.name] = isActive
        }
      })
      return next
    })
  }, [location.pathname])

  function toggleGroup(name) {
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
        <div className="flex flex-col border-b border-gray-200">
          <div className="flex h-14 items-center justify-between px-4">
            {collapsed ? (
              assocSettings?.logo_url ? (
                <img src={assocSettings.logo_url} alt="" className="mx-auto h-8 w-8 rounded-lg object-cover" />
              ) : (
                <Trophy className="mx-auto text-primary-600" size={24} />
              )
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                {assocSettings?.logo_url ? (
                  <img src={assocSettings.logo_url} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                ) : (
                  <Trophy className="shrink-0 text-primary-600" size={24} />
                )}
                <span className="text-lg font-bold text-gray-900 truncate">{assocSettings?.name || 'SportClub'}</span>
              </div>
            )}
            <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 lg:hidden">
              <X size={20} />
            </button>
          </div>
          {!collapsed && (
            <div className="px-4 pb-2 text-xs text-gray-400">v0.3.0-beta</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {filteredNav.map((item) => {
            if (item.children) {
              const isGroupActive = item.children.some((c) => location.pathname.startsWith(c.to))
              const isOpen = !collapsed && (expanded[item.name] || isGroupActive)

              if (collapsed) {
                const showDots = expanded[item.name] || isGroupActive
                return (
                  <div key={item.name} className="space-y-0.5">
                    <Tooltip label={item.name}>
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className={groupButtonClasses(isGroupActive)}
                      >
                        <item.icon size={20} />
                      </button>
                    </Tooltip>
                    {showDots && item.children.map((child) => (
                      <Tooltip key={child.to} label={child.name}>
                        <NavLink
                          to={child.to}
                          className={linkClasses}
                          onClick={onClose}
                        >
                          <span className={`h-2 w-2 rounded-full ${location.pathname.startsWith(child.to) ? 'bg-primary-600' : 'bg-gray-400'}`} />
                        </NavLink>
                      </Tooltip>
                    ))}
                  </div>
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

            if (collapsed) {
              return (
                <Tooltip key={item.to} label={item.name}>
                  <NavLink
                    to={item.to}
                    className={linkClasses}
                    onClick={onClose}
                    end={item.to === '/'}
                  >
                    <item.icon size={20} />
                  </NavLink>
                </Tooltip>
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
