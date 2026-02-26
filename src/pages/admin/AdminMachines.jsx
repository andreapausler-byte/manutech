import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { Button, Modal, Input, Textarea, EmptyState, Spinner } from '../../components/ui'
import { Plus, Edit, Trash2, FileText, Video, Cog } from 'lucide-react'

export default function AdminMachines() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', department: '', description: '', notes: '' })
  const [attachments, setAttachments] = useState([]) // { type: 'pdf'|'video', name, url }

  const load = async () => {
    setLoading(true)
    setMachines(await db.getMachines())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', department: '', description: '', notes: '' })
    setAttachments([])
    setShowForm(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({ name: m.name, department: m.department || '', description: m.description || '', notes: m.notes || '' })
    setAttachments(m.attachments || [])
    setShowForm(true)
  }

  const addAttachment = (type) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type === 'pdf' ? '.pdf' : 'video/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const url = await db.uploadFile('machines', `${Date.now()}-${file.name}`, file)
      setAttachments(a => [...a, { type, name: file.name, url }])
    }
    input.click()
  }

  const save = async () => {
    if (!form.name.trim()) return
    const data = { ...form, attachments }
    if (editing) {
      await db.updateMachine(editing.id, data)
    } else {
      await db.createMachine(data)
    }
    setShowForm(false)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Eliminare questo macchinario?')) return
    await db.deleteMachine(id)
    load()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{machines.length} macchinari registrati</p>
        <Button onClick={openNew}><Plus size={16} /> Nuovo Macchinario</Button>
      </div>

      {loading ? <Spinner /> : machines.length === 0 ? (
        <EmptyState icon="⚙️" title="Nessun macchinario" subtitle="Aggiungi i macchinari della tua azienda" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {machines.map(m => (
            <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/15 rounded-xl flex items-center justify-center">
                    <Cog size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.name}</h3>
                    {m.department && <p className="text-xs text-gray-500">{m.department}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><Edit size={14} /></button>
                  <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              {m.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{m.description}</p>}
              {m.attachments?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {m.attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-lg text-xs text-gray-300 hover:text-white transition-colors">
                      {a.type === 'pdf' ? <FileText size={12} className="text-red-400" /> : <Video size={12} className="text-emerald-400" />}
                      {a.name?.substring(0, 20)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Modifica Macchinario' : 'Nuovo Macchinario'} size="md">
        <div className="space-y-4">
          <Input label="Nome *" placeholder="Es. Pressa idraulica #3" value={form.name} onChange={e => set('name', e.target.value)} />
          <Input label="Reparto" placeholder="Es. Linea produzione 1" value={form.department} onChange={e => set('department', e.target.value)} />
          <Textarea label="Descrizione" placeholder="Note sul macchinario..." value={form.description} onChange={e => set('description', e.target.value)} />

          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">
              Documentazione ({attachments.length})
            </label>
            <div className="flex gap-2 mb-3">
              <Button size="sm" variant="outline" onClick={() => addAttachment('pdf')}>
                <FileText size={14} className="text-red-400" /> Aggiungi PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => addAttachment('video')}>
                <Video size={14} className="text-emerald-400" /> Aggiungi Video
              </Button>
            </div>
            {attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2 mb-1">
                {a.type === 'pdf' ? <FileText size={14} className="text-red-400" /> : <Video size={14} className="text-emerald-400" />}
                <span className="text-xs text-gray-300 flex-1 truncate">{a.name}</span>
                <button onClick={() => setAttachments(at => at.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <Button onClick={save} className="w-full" disabled={!form.name.trim()}>
            {editing ? 'Salva Modifiche' : 'Crea Macchinario'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
