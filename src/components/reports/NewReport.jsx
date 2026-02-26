import { useState, useEffect } from 'react'
import { db } from '../../lib/supabase'
import { SEVERITY } from '../../lib/constants'
import { Button, Input, Textarea, Select } from '../ui'
import MediaCapture from '../media/MediaCapture'
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react'

export default function NewReport({ user, onBack, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    machine: '',
    severity: 'media',
    description: '',
  })
  const [media, setMedia] = useState([])
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    db.getMachines().then(setMachines)
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const isValid = form.title.trim() && form.description.trim()

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    try {
      await db.createReport({
        title: form.title.trim(),
        machine: form.machine || null,
        severity: form.severity,
        description: form.description.trim(),
        media: media,
        created_by: user.id,
        created_by_name: user.name,
        status: 'aperta',
      })
      onCreated()
    } catch (err) {
      alert('Errore: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-white">Nuova Segnalazione</h1>
      </header>

      <div className="p-4 space-y-5 pb-8">
        <Input
          label="Titolo *"
          placeholder="Es. Pompa guasta linea 3"
          value={form.title}
          onChange={e => set('title', e.target.value)}
        />

        <Select
          label="Macchinario"
          value={form.machine}
          onChange={e => set('machine', e.target.value)}
          options={[
            { value: '', label: 'Seleziona macchinario (opzionale)' },
            ...machines.map(m => ({ value: m.name, label: m.name })),
          ]}
        />

        {/* Severity Selection */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Gravità</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(SEVERITY).map(([key, { label, color }]) => (
              <button
                type="button"
                key={key}
                onClick={() => set('severity', key)}
                className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  form.severity === key
                    ? 'text-white border-transparent'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
                style={form.severity === key ? { background: color, borderColor: color } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Descrizione *"
          placeholder="Descrivi il problema in dettaglio..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />

        <MediaCapture media={media} onChange={setMedia} />

        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={!isValid || loading}
          variant={isValid ? 'primary' : 'ghost'}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Send size={18} /> Invia Segnalazione</>
          )}
        </Button>
      </div>
    </div>
  )
}
