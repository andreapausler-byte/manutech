import { useAuth } from '../../contexts/AuthContext'
import { ROLES } from '../../lib/constants'
import { Button } from '../../components/ui'
import { LogOut, User, Mail, Shield } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const role = ROLES[user.role] || ROLES.operatore

  return (
    <div className="p-4 space-y-6">
      {/* Avatar & Info */}
      <div className="text-center pt-4">
        <div className="w-20 h-20 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center text-3xl mb-4 border-2 border-gray-700">
          {role.icon}
        </div>
        <h2 className="text-lg font-bold text-white">{user.name}</h2>
        <p className="text-sm text-gray-400">{role.label}</p>
      </div>

      {/* Info Cards */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <Mail size={18} className="text-gray-400" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Email</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <Shield size={18} className="text-gray-400" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Ruolo</p>
            <p className="text-sm text-white">{role.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Modalità</p>
            <p className="text-sm text-white">{isSupabaseConfigured() ? 'Online (Supabase)' : 'Demo (localStorage)'}</p>
          </div>
        </div>
      </div>

      <Button onClick={logout} variant="danger" className="w-full" size="lg">
        <LogOut size={18} /> Esci
      </Button>
    </div>
  )
}
