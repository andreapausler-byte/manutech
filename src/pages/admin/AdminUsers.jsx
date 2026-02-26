import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { ROLES } from '../../lib/constants'
import { Button, Modal, Input, EmptyState, Spinner } from '../../components/ui'
import { Plus, Trash2, Shield, Users } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operatore' })

  const load = async () => {
    setLoading(true)
    setUsers(await db.getUsers())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const create = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return
    await db.createUser(form)
    setShowNew(false)
    setForm({ name: '', email: '', password: '', role: 'operatore' })
    load()
  }

  const remove = async (id) => {
    if (id === 'admin-1') return alert('Non puoi eliminare l\'admin principale')
    if (!confirm('Eliminare questo utente?')) return
    await db.deleteUser(id)
    load()
  }

  const grouped = {
    admin: users.filter(u => u.role === 'admin'),
    tecnico: users.filter(u => u.role === 'tecnico'),
    operatore: users.filter(u => u.role === 'operatore'),
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{users.length} utenti totali</p>
        <Button onClick={() => setShowNew(true)}><Plus size={16} /> Nuovo Utente</Button>
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([role, list]) => {
            const info = ROLES[role]
            return (
              <div key={role}>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <span>{info.icon}</span> {info.label} ({list.length})
                </h3>
                {list.length === 0 ? (
                  <p className="text-xs text-gray-500 pl-7">Nessun {info.label.toLowerCase()}</p>
                ) : (
                  <div className="space-y-2">
                    {list.map(u => (
                      <div key={u.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3.5 hover:border-gray-700 transition-colors">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: info.color + '15' }}>
                          {info.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        {u.id !== 'admin-1' && (
                          <button
                            onClick={() => remove(u.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* New User Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nuovo Utente">
        <div className="space-y-4">
          <Input label="Nome" placeholder="Mario Rossi" value={form.name} onChange={e => set('name', e.target.value)} />
          <Input label="Email" type="email" placeholder="mario@azienda.it" value={form.email} onChange={e => set('email', e.target.value)} />
          <Input label="Password" type="password" placeholder="Min. 6 caratteri" value={form.password} onChange={e => set('password', e.target.value)} />
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Ruolo</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ROLES).map(([key, { label, icon, color }]) => (
                <button
                  key={key}
                  onClick={() => set('role', key)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    form.role === key ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs font-medium text-gray-300">{label}</div>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={create} className="w-full" disabled={!form.name || !form.email || !form.password}>
            Crea Utente
          </Button>
        </div>
      </Modal>
    </div>
  )
}
