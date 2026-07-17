import { useState } from 'react'
import { db } from '../../lib/supabase'
import { STATUS, SEVERITY, formatDate } from '../../lib/constants'
import { Badge, Button } from '../ui'
import { ArrowLeft, Video, Mic } from 'lucide-react'
import CommentSection from './CommentSection'

export default function ReportDetail({ report: initialReport, user, onBack }) {
  const [report, setReport] = useState(initialReport)

  const status = STATUS[report.status] || STATUS.aperta
  const severity = SEVERITY[report.severity] || SEVERITY.media

  const canUpdateStatus = user.role === 'tecnico' || user.role === 'admin'

  const updateStatus = async (newStatus) => {
    const updated = await db.updateReport(report.id, { status: newStatus })
    setReport(r => ({ ...r, ...updated }))
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white truncate">{report.title}</h1>
          <p className="text-[10px] text-gray-500">{formatDate(report.created_at)}</p>
        </div>
        <Badge {...status} />
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Info Section */}
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge {...severity} />
            {report.machine && <Badge label={`🏭 ${report.machine}`} color="#94a3b8" bg="#94a3b822" />}
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">{report.description}</p>

          {/* Media Attachments */}
          {report.media?.length > 0 && (
            <div>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Allegati</h3>
              <div className="grid grid-cols-3 gap-2">
                {report.media.map((m, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-800 overflow-hidden border border-gray-700">
                    {m.type === 'photo' ? (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    ) : m.type === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <Video size={24} className="text-emerald-400" />
                        <span className="text-[10px] text-gray-400">Video</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <Mic size={24} className="text-orange-400" />
                        <span className="text-[10px] text-gray-400">Audio</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Actions */}
          {canUpdateStatus && (
            <div>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Aggiorna Stato</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS).filter(([k]) => k !== report.status).map(([key, { label, color }]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(key)}
                    className="border-gray-700"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments + Reactions */}
        <CommentSection report={report} user={user} variant="page" />
      </div>
    </div>
  )
}
