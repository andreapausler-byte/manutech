import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { STATUS, SEVERITY, timeAgo } from '../../lib/constants'
import { AlertTriangle, CheckCircle, Clock, Wrench, TrendingUp, BarChart3 } from 'lucide-react'

export default function AdminDashboard() {
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([db.getReports(), db.getUsers()]).then(([r, u]) => {
      setReports(r)
      setUsers(u)
      setLoading(false)
    })
  }, [])

  const stats = {
    total: reports.length,
    aperte: reports.filter(r => r.status === 'aperta').length,
    inCorso: reports.filter(r => r.status === 'in_lavorazione' || r.status === 'assegnata').length,
    risolte: reports.filter(r => r.status === 'risolta').length,
    critiche: reports.filter(r => r.severity === 'critica').length,
    tecnici: users.filter(u => u.role === 'tecnico').length,
    operatori: users.filter(u => u.role === 'operatore').length,
  }

  const kpis = [
    { label: 'Totale Segnalazioni', value: stats.total, icon: BarChart3, color: '#3b82f6', bg: '#3b82f615' },
    { label: 'Aperte', value: stats.aperte, icon: AlertTriangle, color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'In Lavorazione', value: stats.inCorso, icon: Wrench, color: '#a855f7', bg: '#a855f715' },
    { label: 'Risolte', value: stats.risolte, icon: CheckCircle, color: '#22c55e', bg: '#22c55e15' },
    { label: 'Critiche', value: stats.critiche, icon: AlertTriangle, color: '#ef4444', bg: '#ef444415' },
    { label: 'Tecnici Attivi', value: stats.tecnici, icon: Wrench, color: '#06b6d4', bg: '#06b6d415' },
  ]

  const resolveRate = stats.total > 0 ? Math.round((stats.risolte / stats.total) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Resolution Rate + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" /> Tasso di Risoluzione
          </h3>
          <div className="flex items-end gap-4">
            <span className="text-5xl font-bold text-white">{resolveRate}%</span>
            <span className="text-sm text-gray-400 mb-2">{stats.risolte} su {stats.total}</span>
          </div>
          <div className="mt-4 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${resolveRate}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
            />
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Distribuzione Gravità</h3>
          <div className="space-y-3">
            {Object.entries(SEVERITY).map(([key, { label, color }]) => {
              const count = reports.filter(r => r.severity === key).length
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Attività Recente</h3>
        <div className="space-y-2">
          {reports.slice(0, 8).map(r => {
            const status = STATUS[r.status] || STATUS.aperta
            return (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: status.color }} />
                <span className="text-sm text-white flex-1 truncate">{r.title}</span>
                {r.machine && <span className="text-xs text-gray-500 hidden sm:block">🏭 {r.machine}</span>}
                <span className="text-xs text-gray-500 shrink-0">{timeAgo(r.created_at)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
