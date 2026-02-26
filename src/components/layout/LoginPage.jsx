import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input } from '../ui'
import { ROLES } from '../../lib/constants'
import { LogIn, UserPlus, Wrench } from 'lucide-react'

export default function LoginPage() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operatore' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        if (!form.name.trim()) { setError('Inserisci il tuo nome'); setLoading(false); return }
        await register(form)
      }
    } catch (err) {
      setError(err.message || 'Errore durante l\'accesso')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-2xl mb-4">
            <Wrench className="text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ManuTech</h1>
          <p className="text-gray-400 text-sm mt-1">Sistema di Gestione Manutenzione</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex gap-1 mb-6 bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Accedi
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Nome"
                placeholder="Mario Rossi"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="mario@azienda.it"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />

            {!isLogin && (
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Ruolo</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLES).map(([key, { label, icon }]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => set('role', key)}
                      className={`p-2.5 rounded-xl border text-center transition-all text-xs font-medium ${
                        form.role === key
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-lg mb-0.5">{icon}</div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                <><LogIn size={18} /> Accedi</>
              ) : (
                <><UserPlus size={18} /> Registrati</>
              )}
            </Button>
          </form>

          {isLogin && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Demo: admin@manutech.it / admin123
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
