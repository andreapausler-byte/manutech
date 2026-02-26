import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/layout/LoginPage'
import MobileLayout from './components/layout/MobileLayout'
import AdminLayout from './components/layout/AdminLayout'
import { Spinner } from './components/ui'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl">🔧</span>
          </div>
          <Spinner />
          <p className="text-sm text-gray-400 mt-2">Caricamento ManuTech...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  // Admin → desktop layout, others → mobile layout
  if (user.role === 'admin') return <AdminLayout />
  return <MobileLayout />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
