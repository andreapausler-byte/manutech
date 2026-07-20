import { REACTIONS } from '../../lib/constants'

// Chip compatti con l'attività della discussione, mostrati nelle liste:
// 💬 messaggi (evidenziati se ci sono non letti) e feedback sui messaggi
// contati per utenti distinti. compact → solo messaggi e ✅ conferme.
export default function ActivityChips({ activity, compact = false, className = '' }) {
  if (!activity) return null
  const { comment_count, unread_count, reactions } = activity
  const hasFeedback = Object.values(reactions || {}).some(n => n > 0)
  if (!comment_count && !hasFeedback) return null

  const chip = 'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border'
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {comment_count > 0 && (
        <span className={`${chip} ${
          unread_count > 0
            ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 font-semibold'
            : 'bg-gray-800 border-gray-700 text-gray-400'
        }`}>
          💬 {comment_count}
          {unread_count > 0 && <span>· {unread_count} {unread_count === 1 ? 'nuovo' : 'nuovi'}</span>}
        </span>
      )}
      {Object.entries(REACTIONS).map(([type, { emoji, label }]) => {
        const n = reactions?.[type] || 0
        if (!n || (compact && type !== 'confermo')) return null
        return (
          <span
            key={type}
            title={`${label}: ${n} ${n === 1 ? 'persona' : 'persone'}`}
            className={`${chip} bg-gray-800 border-gray-700 text-gray-400`}
          >
            {emoji} {n}
          </span>
        )
      })}
    </div>
  )
}
