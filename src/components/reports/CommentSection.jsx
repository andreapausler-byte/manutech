import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { REACTIONS, formatDate } from '../../lib/constants'
import { MessageCircle, Send, User } from 'lucide-react'

// Thread commenti con reazioni + ringraziamenti a segnalazione risolta.
// variant='page' → input fisso in basso (mobile), 'modal' → input inline (admin)
export default function CommentSection({ report, user, variant = 'page' }) {
  const [comments, setComments] = useState([])
  const [reactions, setReactions] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    db.getComments(report.id).then(setComments)
    db.getReactions(report.id).then(setReactions)
    // Aprire il thread azzera i "non letti" nelle liste
    db.markReportRead(report.id, user.id)
  }, [report.id, user.id])

  const addComment = async () => {
    if (!newComment.trim()) return
    setLoading(true)
    try {
      const comment = await db.addComment(report.id, {
        text: newComment.trim(),
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
      })
      setComments(c => [...c, comment])
      setNewComment('')
    } finally {
      setLoading(false)
    }
  }

  // commentId = null → reazione a livello segnalazione (grazie)
  const toggleReaction = async (type, commentId = null) => {
    const existing = reactions.find(r =>
      r.type === type && r.user_id === user.id && (r.comment_id || null) === commentId
    )
    if (existing) {
      await db.removeReaction(existing.id)
      setReactions(rs => rs.filter(r => r.id !== existing.id))
    } else {
      const added = await db.addReaction(report.id, {
        comment_id: commentId,
        user_id: user.id,
        user_name: user.name,
        type,
      })
      setReactions(rs => [...rs, added])
    }
  }

  const reactionsFor = (commentId, type) =>
    reactions.filter(r => r.comment_id === commentId && r.type === type)

  // ── Ringraziamenti (👏 a livello segnalazione) ──
  const thanks = reactions.filter(r => r.type === 'grazie' && !r.comment_id)
  const iThanked = thanks.some(r => r.user_id === user.id)
  const isAssignee = report.assigned_to === user.id
  const thankNames = thanks.map(t => t.user_name).join(', ')
  const assigneeName = report.assigned_to_name || 'chi se n\'è occupato'

  return (
    <div className={variant === 'page' ? 'border-t border-gray-800 p-4' : 'border-t border-gray-800 pt-4'}>
      {/* Card grazie: appare quando la segnalazione è risolta */}
      {report.status === 'risolta' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4">
          <p className="text-sm font-semibold text-emerald-300">🎉 Segnalazione risolta</p>
          {thanks.length > 0 && (
            <p className="text-xs text-gray-300 mt-1.5">
              👏 {isAssignee
                ? `${thankNames} ti ringrazi${thanks.length > 1 ? 'ano' : 'a'} per l'intervento!`
                : `Grazie da: ${thankNames}`}
            </p>
          )}
          {!isAssignee && (
            <button
              onClick={() => toggleReaction('grazie')}
              className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors active:scale-95 ${
                iThanked
                  ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500/50'
              }`}
            >
              👏 {iThanked ? 'Grazie inviato' : `Ringrazia ${assigneeName}`}
            </button>
          )}
        </div>
      )}

      <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
        <MessageCircle size={14} /> Commenti ({comments.length})
      </h3>

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-xs text-gray-500">Nessun commento ancora.</p>
        )}
        {comments.map(c => {
          const isMine = c.user_id === user.id
          // I nomi di chi ha reagito sono visibili all'autore del messaggio:
          // è lui che deve sapere chi lo sta seguendo
          const namesSummary = Object.entries(REACTIONS)
            .map(([type, { emoji }]) => {
              const list = reactionsFor(c.id, type)
              return list.length ? `${emoji} ${list.map(r => r.user_name).join(', ')}` : null
            })
            .filter(Boolean)
            .join(' · ')

          return (
            <div key={c.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <User size={14} className="text-gray-400" />
              </div>
              <div className={`max-w-[75%] ${isMine ? 'bg-blue-600/20 border-blue-500/30' : 'bg-gray-800 border-gray-700'} border rounded-xl p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">{c.user_name || 'Utente'}</span>
                  <span className="text-[10px] text-gray-500">{c.user_role}</span>
                </div>
                <p className="text-sm text-gray-300">{c.text}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {Object.entries(REACTIONS).map(([type, { emoji, label }]) => {
                    const list = reactionsFor(c.id, type)
                    // Sul proprio messaggio le reazioni si vedono ma non si toccano
                    if (isMine && list.length === 0) return null
                    const mine = list.some(r => r.user_id === user.id)
                    return (
                      <button
                        key={type}
                        disabled={isMine}
                        onClick={() => toggleReaction(type, c.id)}
                        title={list.length ? `${label}: ${list.map(r => r.user_name).join(', ')}` : label}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                          mine
                            ? 'bg-blue-600/30 border-blue-500/50 text-white'
                            : 'bg-gray-900/50 border-gray-700 text-gray-400'
                        } ${isMine ? '' : 'hover:border-gray-500 active:scale-95'}`}
                      >
                        <span>{emoji}</span>
                        {list.length > 0 && <span className="font-semibold">{list.length}</span>}
                      </button>
                    )
                  })}
                </div>
                {isMine && namesSummary && (
                  <p className="text-[10px] text-gray-500 mt-1.5">{namesSummary}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-1">{formatDate(c.created_at)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className={variant === 'page'
        ? 'fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-3 flex gap-2'
        : 'flex gap-2 mt-4'}
      >
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
