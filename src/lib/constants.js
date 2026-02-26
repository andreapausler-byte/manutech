export const ROLES = {
  operatore: { label: 'Operatore', color: '#3b82f6', icon: '👷' },
  tecnico: { label: 'Tecnico', color: '#22c55e', icon: '🔧' },
  admin: { label: 'Admin', color: '#f59e0b', icon: '🛡️' },
}

export const STATUS = {
  aperta: { label: 'Aperta', color: '#f59e0b', bg: '#f59e0b22' },
  assegnata: { label: 'Assegnata', color: '#3b82f6', bg: '#3b82f622' },
  in_lavorazione: { label: 'In Lavorazione', color: '#a855f7', bg: '#a855f722' },
  risolta: { label: 'Risolta', color: '#22c55e', bg: '#22c55e22' },
}

export const SEVERITY = {
  bassa: { label: 'Bassa', color: '#22c55e', bg: '#22c55e22' },
  media: { label: 'Media', color: '#f59e0b', bg: '#f59e0b22' },
  alta: { label: 'Alta', color: '#f97316', bg: '#f9731622' },
  critica: { label: 'Critica', color: '#ef4444', bg: '#ef444422' },
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'adesso'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min fa`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h fa`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}g fa`
  return formatDate(dateStr)
}
