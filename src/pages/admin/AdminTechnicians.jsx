import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { EmptyState, Spinner } from '../../components/ui'
import { Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export default function AdminTechnicians() {
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([db.getUsers(), db.getReports()]).then(([u, r]) => {
      setUsers(u)
      setReports(r)
      setLoading(false)
    })
  }, [])

  const tecnici = users.filter(u => u.role === 'tecnico')

  const getTechStats = (techId) => {
    const assigned = reports.filter(r => r.assigned_to === techId)
    const resolved = assigned.filter(r => r.status === 'risolta')
    const inProgress = assigned.filter(r => r.status === 'in_lavorazione')
    const pending = assigned.filter(r => r.status === 'assegnata')
    return {
      total: assigned.length,
      resolved: resolved.length,
      inProgress: inProgress.length,
      pending: pending.length,
      rate: assigned.length > 0 ? Math.round((resolved.length / assigned.length) * 100) : 0,
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-sm text-gray-400">{tecnici.length} tecnici registrati</p>

      {tecnici.length === 0 ? (
        <EmptyState icon="🔧" title="Nessun tecnico" subtitle="Aggiungi tecnici dalla sezione Utenti" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tecnici.map(tech => {
            const stats = getTechStats(tech.id)
            return (
              <div key={tech.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                    <Wrench size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{tech.name}</h3>
                    <p className="text-xs text-gray-500">{tech.email}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-white">{stats.total}</p>
                    <p className="text-[10px] text-gray-500">Assegnate</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-emerald-400">{stats.resolved}</p>
                    <p className="text-[10px] text-gray-500">Risolte</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-amber-400">{stats.inProgress}</p>
                    <p className="text-[10px] text-gray-500">In Corso</p>
                  </div>
                </div>

                {/* Resolution Rate Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-400">Tasso risoluzione</span>
                    <span className="text-white font-semibold">{stats.rate}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.rate}%`,
                        background: stats.rate > 70 ? '#22c55e' : stats.rate > 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
