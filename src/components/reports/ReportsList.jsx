import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { STATUS, SEVERITY, timeAgo } from '../../lib/constants'
import { Badge, EmptyState, Spinner } from '../ui'
import { Search, Filter, AlertTriangle } from 'lucide-react'
import ActivityChips from './ActivityChips'

export default function ReportsList({ user, onSelectReport }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [onlyUnread, setOnlyUnread] = useState(false)

  const load = async () => {
    setLoading(true)
    const filters = {}
    if (filterStatus) filters.status = filterStatus
    const data = await db.getReports(filters, user?.id)
    setReports(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus])

  const filtered = reports.filter(r => {
    if (onlyUnread && !(r.activity?.unread_count > 0)) return false
    if (!search) return true
    const q = search.toLowerCase()
    return r.title?.toLowerCase().includes(q) || r.machine?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
  })
  // A parità di gruppo resta l'ordine per data: prima chi ha novità da leggere
  const sorted = [...filtered].sort((a, b) =>
    (b.activity?.unread_count > 0 ? 1 : 0) - (a.activity?.unread_count > 0 ? 1 : 0)
  )

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Cerca segnalazioni..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilterStatus('')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            !filterStatus ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Tutte
        </button>
        <button
          onClick={() => setOnlyUnread(v => !v)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            onlyUnread ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          💬 Con novità
        </button>
        {Object.entries(STATUS).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === key ? 'text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
            style={filterStatus === key ? { background: color } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="📋" title="Nessuna segnalazione" subtitle="Le segnalazioni appariranno qui" />
      ) : (
        <div className="space-y-2">
          {sorted.map(report => {
            const status = STATUS[report.status] || STATUS.aperta
            const severity = SEVERITY[report.severity] || SEVERITY.media
            return (
              <button
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="w-full text-left bg-gray-900 hover:bg-gray-800/80 border border-gray-800 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-white line-clamp-1">{report.title}</h3>
                  <Badge {...status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {report.machine && <span>🏭 {report.machine}</span>}
                  <span>•</span>
                  <Badge {...severity} />
                  <span className="ml-auto">{timeAgo(report.activity?.last_comment_at || report.created_at)}</span>
                </div>
                <ActivityChips activity={report.activity} className="mt-2" />
                {report.media?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {report.media.slice(0, 4).map((m, i) => (
                      <div key={i} className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center text-xs">
                        {m.type === 'photo' ? '📷' : m.type === 'video' ? '🎥' : '🎤'}
                      </div>
                    ))}
                    {report.media.length > 4 && (
                      <div className="w-8 h-8 rounded-md bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                        +{report.media.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
