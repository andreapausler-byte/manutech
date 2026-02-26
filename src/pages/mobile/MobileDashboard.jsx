import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { STATUS, SEVERITY, timeAgo } from '../../lib/constants'
import { Badge } from '../../components/ui'
import { AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react'

export default function MobileDashboard({ user, onViewReport }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.getReports().then(data => {
      setReports(data)
      setLoading(false)
    })
  }, [])

  const stats = {
    total: reports.length,
    aperte: reports.filter(r => r.status === 'aperta').length,
    inCorso: reports.filter(r => r.status === 'in_lavorazione' || r.status === 'assegnata').length,
    risolte: reports.filter(r => r.status === 'risolta').length,
    critiche: reports.filter(r => r.severity === 'critica').length,
  }

  const recent = reports.slice(0, 5)

  const kpis = [
    { label: 'Aperte', value: stats.aperte, icon: AlertTriangle, color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'In Corso', value: stats.inCorso, icon: Wrench, color: '#a855f7', bg: '#a855f715' },
    { label: 'Risolte', value: stats.risolte, icon: CheckCircle, color: '#22c55e', bg: '#22c55e15' },
    { label: 'Critiche', value: stats.critiche, icon: Clock, color: '#ef4444', bg: '#ef444415' },
  ]

  return (
    <div className="p-4 space-y-5">
      {/* Welcome */}
      <div>
        <h2 className="text-lg font-bold text-white">Ciao, {user.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-gray-400">Ecco la situazione attuale</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4" style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Segnalazioni Recenti</h3>
        {recent.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Nessuna segnalazione</div>
        ) : (
          <div className="space-y-2">
            {recent.map(report => {
              const status = STATUS[report.status] || STATUS.aperta
              return (
                <button
                  key={report.id}
                  onClick={() => onViewReport(report)}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800/80 border border-gray-800 rounded-xl p-3.5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate pr-3">{report.title}</h4>
                    <Badge {...status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {report.machine && <span>🏭 {report.machine}</span>}
                    <span className="ml-auto">{timeAgo(report.created_at)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
