import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { STATUS, SEVERITY, formatDate } from '../../lib/constants'
import { Badge, Button } from '../ui'
import { ArrowLeft, MessageCircle, Send, Camera, Video, Mic, User } from 'lucide-react'

export default function ReportDetail({ report: initialReport, user, onBack }) {
  const [report, setReport] = useState(initialReport)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    db.getComments(report.id).then(setComments)
  }, [report.id])

  const status = STATUS[report.status] || STATUS.aperta
  const severity = SEVERITY[report.severity] || SEVERITY.media

  const canUpdateStatus = user.role === 'tecnico' || user.role === 'admin'

  const updateStatus = async (newStatus) => {
    const updated = await db.updateReport(report.id, { status: newStatus })
    setReport(r => ({ ...r, ...updated }))
  }

  const addComment = async () => {
    if (!newComment.trim()) return
    setLoading(true)
    const comment = await db.addComment(report.id, {
      text: newComment.trim(),
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
    })
    setComments(c => [...c, comment])
    setNewComment('')
    setLoading(false)
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

        {/* Comments */}
        <div className="border-t border-gray-800 p-4">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
            <MessageCircle size={14} /> Commenti ({comments.length})
          </h3>

          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className={`flex gap-2.5 ${c.user_id === user.id ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <User size={14} className="text-gray-400" />
                </div>
                <div className={`max-w-[75%] ${c.user_id === user.id ? 'bg-blue-600/20 border-blue-500/30' : 'bg-gray-800 border-gray-700'} border rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{c.user_name || 'Utente'}</span>
                    <span className="text-[10px] text-gray-500">{c.user_role}</span>
                  </div>
                  <p className="text-sm text-gray-300">{c.text}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{formatDate(c.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addComment()}
          placeholder="Scrivi un commento..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={addComment}
          disabled={!newComment.trim() || loading}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-xl transition-colors"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  )
}
