import { Menu, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuClick }) {
  const { profile, signOut } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="lg:flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <User size={16} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          title="Esci"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
