import { X } from 'lucide-react'

// ── Badge ────────────────────────────────────────────────
export function Badge({ label, color, bg }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide"
      style={{ background: bg || color + '22', color }}
    >
      {label}
    </span>
  )
}

// ── Button ───────────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white focus:ring-gray-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ── Select ───────────────────────────────────────────────
export function Select({ label, options, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">
          {label}
        </label>
      )}
      <select
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Textarea ─────────────────────────────────────────────
export function Textarea({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-semibold">
          {label}
        </label>
      )}
      <textarea
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
        rows={4}
        {...props}
      />
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative bg-gray-900 border border-gray-700 rounded-2xl w-full ${sizes[size]} max-h-[85vh] overflow-y-auto animate-fade-in shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  )
}

// ── Loading Spinner ──────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className="border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  )
}
