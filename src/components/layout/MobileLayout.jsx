import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Home, ClipboardList, Plus, User, LogOut } from 'lucide-react'
import ReportsList from '../reports/ReportsList'
import NewReport from '../reports/NewReport'
import ReportDetail from '../reports/ReportDetail'
import ProfilePage from '../../pages/mobile/ProfilePage'
import MobileDashboard from '../../pages/mobile/MobileDashboard'

const TABS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'reports', icon: ClipboardList, label: 'Segnalazioni' },
  { id: 'profile', icon: User, label: 'Profilo' },
]

export default function MobileLayout() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('home')
  const [screen, setScreen] = useState(null) // 'new-report', 'report-detail'
  const [selectedReport, setSelectedReport] = useState(null)

  const openReport = (report) => {
    setSelectedReport(report)
    setScreen('report-detail')
  }

  const goBack = () => {
    setScreen(null)
    setSelectedReport(null)
  }

  // Overlay screens
  if (screen === 'new-report') {
    return (
      <NewReport
        user={user}
        onBack={goBack}
        onCreated={() => { goBack(); setTab('reports') }}
      />
    )
  }

  if (screen === 'report-detail' && selectedReport) {
    return (
      <ReportDetail
        report={selectedReport}
        user={user}
        onBack={goBack}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <span className="text-sm">🔧</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">ManuTech</h1>
            <p className="text-[10px] text-gray-500">{user.name} • {user.role}</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
          <LogOut size={18} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'home' && <MobileDashboard user={user} onViewReport={openReport} />}
        {tab === 'reports' && <ReportsList user={user} onSelectReport={openReport} />}
        {tab === 'profile' && <ProfilePage />}
      </main>

      {/* FAB - Nuova Segnalazione */}
      <button
        onClick={() => setScreen('new-report')}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all active:scale-95"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-40">
        <div className="flex items-center justify-around py-2">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                tab === id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
