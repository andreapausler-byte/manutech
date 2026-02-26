import { useState, useRef } from 'react'
import { Camera, Video, Mic, Image, X, Square, Trash2 } from 'lucide-react'
import { db } from '../../lib/supabase'

export default function MediaCapture({ media, onChange }) {
  const [recording, setRecording] = useState(false)
  const [audioTime, setAudioTime] = useState(0)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const timerRef = useRef(null)

  const addFile = async (file, type) => {
    const url = await db.uploadFile('attachments', `${Date.now()}-${file.name}`, file)
    onChange([...media, { id: Date.now().toString(), type, name: file.name, url, size: file.size }])
  }

  const handleCapture = (accept, type) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.capture = 'environment'
    input.onchange = (e) => {
      if (e.target.files[0]) addFile(e.target.files[0], type)
    }
    input.click()
  }

  const handleGallery = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.multiple = true
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        const type = file.type.startsWith('video') ? 'video' : 'photo'
        addFile(file, type)
      })
    }
    input.click()
  }

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunks.current = []
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
        addFile(file, 'audio')
        stream.getTracks().forEach(t => t.stop())
        clearInterval(timerRef.current)
        setAudioTime(0)
      }
      recorder.start()
      mediaRecorder.current = recorder
      setRecording(true)
      setAudioTime(0)
      timerRef.current = setInterval(() => setAudioTime(t => t + 1), 1000)
    } catch (err) {
      alert('Permesso microfono negato. Abilita il microfono nelle impostazioni del browser.')
    }
  }

  const stopAudio = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop()
      setRecording(false)
    }
  }

  const removeMedia = (id) => {
    onChange(media.filter(m => m.id !== id))
  }

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">
        Allegati {media.length > 0 && <span className="text-blue-400">({media.length})</span>}
      </label>

      {/* Capture Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleCapture('image/*', 'photo')}
          className="flex flex-col items-center gap-1.5 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors"
        >
          <Camera size={20} className="text-blue-400" />
          <span className="text-[10px] text-gray-400 font-medium">Foto</span>
        </button>

        <button
          type="button"
          onClick={() => handleCapture('video/*', 'video')}
          className="flex flex-col items-center gap-1.5 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors"
        >
          <Video size={20} className="text-emerald-400" />
          <span className="text-[10px] text-gray-400 font-medium">Video</span>
        </button>

        <button
          type="button"
          onClick={recording ? stopAudio : startAudio}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
            recording
              ? 'bg-red-500/20 border-red-500 animate-pulse'
              : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
          }`}
        >
          {recording ? <Square size={20} className="text-red-400" /> : <Mic size={20} className="text-orange-400" />}
          <span className="text-[10px] text-gray-400 font-medium">
            {recording ? formatTime(audioTime) : 'Audio'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleGallery}
          className="flex flex-col items-center gap-1.5 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors"
        >
          <Image size={20} className="text-purple-400" />
          <span className="text-[10px] text-gray-400 font-medium">Galleria</span>
        </button>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="space-y-2">
          {media.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-2.5 border border-gray-700/50">
              {m.type === 'photo' && (
                <img src={m.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              )}
              {m.type === 'video' && (
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Video size={18} className="text-emerald-400" />
                </div>
              )}
              {m.type === 'audio' && (
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Mic size={18} className="text-orange-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{m.name}</p>
                <p className="text-xs text-gray-500">{m.type === 'photo' ? 'Foto' : m.type === 'video' ? 'Video' : 'Nota audio'}</p>
              </div>
              <button
                type="button"
                onClick={() => removeMedia(m.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
