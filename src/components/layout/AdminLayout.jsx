import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, ClipboardList, Wrench, Users, Cog, LogOut, Menu, X } from 'lucide-react'
import AdminDashboard from '../../pages/admin/AdminDashboard'
import AdminReports from '../../pages/admin/AdminReports'
import AdminMachines from '../../pages/admin/AdminMachines'
import AdminUsers from '../../pages/admin/AdminUsers'
import AdminTechnicians from '../../pages/admin/AdminTechnicians'

const NAV = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'reports', icon: ClipboardList, label: 'Segnalazioni' },
  { id: 'machines', icon: Cog, label: 'Macchinari' },
  { id: 'technicians', icon: Wrench, label: 'Tecnici' },
  { id: 'users', icon: Users, label: 'Utenti' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderPage = () => {
    switch (tab) {
      case 'dashboard': return <AdminDashboard />
      case 'reports': return <AdminReports />
      case 'machines': return <AdminMachines />
      case 'technicians': return <AdminTechnicians />
      case 'users': return <AdminUsers />
      default: return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-800">
          <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-base">🔧</span>
          </div>
          {sidebarOpen && <span className="text-base font-bold text-white tracking-tight">ManuTech</span>}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2 space-y-1">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-blue-600/15 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {sidebarOpen && label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-sm shrink-0">🛡️</div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500">Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            {sidebarOpen && 'Esci'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2 className="text-base font-bold text-white">{NAV.find(n => n.id === tab)?.label}</h2>
          </div>
        </header>

        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
