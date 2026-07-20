import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { STATUS, SEVERITY, formatDate } from '../../lib/constants'
import { Badge, Button, Modal, Input, Textarea, Select, EmptyState, Spinner } from '../../components/ui'
import MediaCapture from '../../components/media/MediaCapture'
import CommentSection from '../../components/reports/CommentSection'
import ActivityChips from '../../components/reports/ActivityChips'
import { Plus, Search, Filter, Eye, UserCheck } from 'lucide-react'

export default function AdminReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState(null)

  // New Report Form
  const [form, setForm] = useState({ title: '', machine: '', severity: 'media', description: '' })
  const [media, setMedia] = useState([])
  const [machines, setMachines] = useState([])

  const load = async () => {
    setLoading(true)
    const [r, u, m] = await Promise.all([db.getReports({}, user?.id), db.getUsers(), db.getMachines()])
    setReports(r)
    setUsers(u)
    setMachines(m)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const tecnici = users.filter(u => u.role === 'tecnico')

  const filtered = reports.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false
    if (filterSeverity && r.severity !== filterSeverity) return false
    if (search) {
      const q = search.toLowerCase()
      return r.title?.toLowerCase().includes(q) || r.machine?.toLowerCase().includes(q)
    }
    return true
  })

  const createReport = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    await db.createReport({
      ...form,
      media,
      created_by: 'admin-1',
      created_by_name: 'Admin',
      status: 'aperta',
    })
    setShowNew(false)
    setForm({ title: '', machine: '', severity: 'media', description: '' })
    setMedia([])
    load()
  }

  const assignTech = async (reportId, techId) => {
    const tech = tecnici.find(t => t.id === techId)
    await db.updateReport(reportId, {
      assigned_to: techId,
      assigned_to_name: tech?.name,
      status: 'assegnata',
    })
    load()
    setSelected(null)
  }

  const updateStatus = async (reportId, status) => {
    await db.updateReport(reportId, { status })
    load()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Cerca segnalazioni..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white"
        >
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white"
        >
          <option value="">Tutte le gravità</option>
          {Object.entries(SEVERITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nuova Segnalazione
        </Button>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="📋" title="Nessuna segnalazione trovata" />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Titolo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Macchinario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Gravità</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Attività</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Assegnato a</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const status = STATUS[r.status] || STATUS.aperta
                const severity = SEVERITY[r.severity] || SEVERITY.media
                return (
                  <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm text-white font-medium">{r.title}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-400">{r.machine || '—'}</span>
                    </td>
                    <td className="px-4 py-3"><Badge {...status} /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge {...severity} /></td>
                    <td className="px-4 py-3">
                      <ActivityChips activity={r.activity} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-400">{r.assigned_to_name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{formatDate(r.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(r)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Report Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nuova Segnalazione" size="lg">
        <div className="space-y-4">
          <Input label="Titolo *" placeholder="Descrivi il problema" value={form.title} onChange={e => set('title', e.target.value)} />
          <Select
            label="Macchinario"
            value={form.machine}
            onChange={e => set('machine', e.target.value)}
            options={[{ value: '', label: 'Seleziona...' }, ...machines.map(m => ({ value: m.name, label: m.name }))]}
          />
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Gravità</label>
            <div className="flex gap-2">
              {Object.entries(SEVERITY).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => set('severity', key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${form.severity === key ? 'text-white' : 'border-gray-700 text-gray-400'}`}
                  style={form.severity === key ? { background: color, borderColor: color } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Descrizione *" placeholder="Dettagli..." value={form.description} onChange={e => set('description', e.target.value)} />
          <MediaCapture media={media} onChange={setMedia} />
          <Button onClick={createReport} className="w-full" disabled={!form.title.trim() || !form.description.trim()}>
            Crea Segnalazione
          </Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      {/* Alla chiusura ricarica: il dettaglio ha azzerato i non letti */}
      <Modal open={!!selected} onClose={() => { setSelected(null); load() }} title={selected?.title} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge {...(STATUS[selected.status] || STATUS.aperta)} />
              <Badge {...(SEVERITY[selected.severity] || SEVERITY.media)} />
              {selected.machine && <Badge label={`🏭 ${selected.machine}`} color="#94a3b8" bg="#94a3b822" />}
            </div>
            <p className="text-sm text-gray-300">{selected.description}</p>

            {/* Assign Technician */}
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">
                <UserCheck size={14} className="inline mr-1" /> Assegna Tecnico
              </label>
              <div className="flex flex-wrap gap-2">
                {tecnici.map(t => (
                  <Button
                    key={t.id}
                    size="sm"
                    variant={selected.assigned_to === t.id ? 'success' : 'outline'}
                    onClick={() => assignTech(selected.id, t.id)}
                  >
                    🔧 {t.name}
                  </Button>
                ))}
                {tecnici.length === 0 && <p className="text-sm text-gray-500">Nessun tecnico disponibile</p>}
              </div>
            </div>

            {/* Status Update */}
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Cambia Stato</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS).map(([key, { label, color }]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={selected.status === key ? 'primary' : 'outline'}
                    onClick={() => { updateStatus(selected.id, key); setSelected(s => ({ ...s, status: key })) }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Media */}
            {selected.media?.length > 0 && (
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Allegati</label>
                <div className="grid grid-cols-4 gap-2">
                  {selected.media.map((m, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-800 overflow-hidden border border-gray-700 flex items-center justify-center">
                      {m.type === 'photo' ? (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{m.type === 'video' ? '🎥' : '🎤'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments + Reactions */}
            <CommentSection report={selected} user={user} variant="modal" />
          </div>
        )}
      </Modal>
    </div>
  )
}
