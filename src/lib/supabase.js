import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase non configurato. Crea un file .env con:\n' +
    'VITE_SUPABASE_URL=https://tuoprogetto.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=la_tua_chiave_anon\n\n' +
    'Per ora l\'app userà la modalità demo (localStorage).'
  )
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => !!supabase

// ── Modalità Demo (localStorage) ─────────────────────────
// Usata come fallback quando Supabase non è configurato
// Permette di testare l'app senza backend

const KEYS = {
  users: 'manutech_users',
  reports: 'manutech_reports',
  machines: 'manutech_machines',
  session: 'manutech_session',
  comments: 'manutech_comments',
}

function getStore(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') }
  catch { return [] }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// Assicura che esista un admin di default
export function ensureDefaultAdmin() {
  const users = getStore(KEYS.users)
  if (!users.find(u => u.role === 'admin')) {
    users.push({
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@manutech.it',
      password: 'admin123',
      role: 'admin',
      created_at: new Date().toISOString(),
    })
    setStore(KEYS.users, users)
  }
}

// ── API unificata (Supabase o localStorage) ──────────────

export const db = {
  // ─── USERS ───
  async getUsers() {
    if (supabase) {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
      return data || []
    }
    return getStore(KEYS.users)
  },

  async createUser(user) {
    if (supabase) {
      const { data, error } = await supabase.from('users').insert(user).select().single()
      if (error) throw error
      return data
    }
    const users = getStore(KEYS.users)
    const newUser = { ...user, id: `user-${Date.now()}`, created_at: new Date().toISOString() }
    users.push(newUser)
    setStore(KEYS.users, users)
    return newUser
  },

  async deleteUser(id) {
    if (supabase) {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) throw error
      return
    }
    const users = getStore(KEYS.users).filter(u => u.id !== id)
    setStore(KEYS.users, users)
  },

  async login(email, password) {
    if (supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
      return user
    }
    const users = getStore(KEYS.users)
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Credenziali non valide')
    setStore(KEYS.session, user)
    return user
  },

  async register(userData) {
    if (supabase) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })
      if (authError) throw authError
      const { data, error } = await supabase.from('users').insert({
        name: userData.name,
        email: userData.email,
        role: userData.role || 'operatore',
        auth_id: authData.user.id,
      }).select().single()
      if (error) throw error
      return data
    }
    return db.createUser(userData)
  },

  async getSession() {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null
      const { data: user } = await supabase.from('users').select('*').eq('email', session.user.email).single()
      return user
    }
    try { return JSON.parse(localStorage.getItem(KEYS.session)) } catch { return null }
  },

  async logout() {
    if (supabase) {
      await supabase.auth.signOut()
      return
    }
    localStorage.removeItem(KEYS.session)
  },

  // ─── REPORTS ───
  async getReports(filters = {}) {
    if (supabase) {
      let query = supabase.from('reports').select('*, assigned_to_user:users!reports_assigned_to_fkey(name), created_by_user:users!reports_created_by_fkey(name)').order('created_at', { ascending: false })
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.severity) query = query.eq('severity', filters.severity)
      if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
      const { data } = await query
      return data || []
    }
    let reports = getStore(KEYS.reports)
    if (filters.status) reports = reports.filter(r => r.status === filters.status)
    if (filters.severity) reports = reports.filter(r => r.severity === filters.severity)
    return reports
  },

  async getReport(id) {
    if (supabase) {
      const { data } = await supabase.from('reports').select('*, assigned_to_user:users!reports_assigned_to_fkey(name), created_by_user:users!reports_created_by_fkey(name)').eq('id', id).single()
      return data
    }
    return getStore(KEYS.reports).find(r => r.id === id)
  },

  async createReport(report) {
    if (supabase) {
      const { data, error } = await supabase.from('reports').insert(report).select().single()
      if (error) throw error
      return data
    }
    const reports = getStore(KEYS.reports)
    const newReport = { ...report, id: `rep-${Date.now()}`, created_at: new Date().toISOString(), status: 'aperta', comments: [] }
    reports.unshift(newReport)
    setStore(KEYS.reports, reports)
    return newReport
  },

  async updateReport(id, updates) {
    if (supabase) {
      const { data, error } = await supabase.from('reports').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    }
    const reports = getStore(KEYS.reports)
    const idx = reports.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Segnalazione non trovata')
    reports[idx] = { ...reports[idx], ...updates, updated_at: new Date().toISOString() }
    setStore(KEYS.reports, reports)
    return reports[idx]
  },

  // ─── COMMENTS ───
  async getComments(reportId) {
    if (supabase) {
      const { data } = await supabase.from('comments').select('*, user:users(name, role)').eq('report_id', reportId).order('created_at', { ascending: true })
      return data || []
    }
    const report = getStore(KEYS.reports).find(r => r.id === reportId)
    return report?.comments || []
  },

  async addComment(reportId, comment) {
    if (supabase) {
      const { data, error } = await supabase.from('comments').insert({ ...comment, report_id: reportId }).select('*, user:users(name, role)').single()
      if (error) throw error
      return data
    }
    const reports = getStore(KEYS.reports)
    const idx = reports.findIndex(r => r.id === reportId)
    if (idx === -1) throw new Error('Segnalazione non trovata')
    const newComment = { ...comment, id: `com-${Date.now()}`, created_at: new Date().toISOString() }
    reports[idx].comments = [...(reports[idx].comments || []), newComment]
    setStore(KEYS.reports, reports)
    return newComment
  },

  // ─── REACTIONS ───
  async getReactions(reportId) {
    if (supabase) {
      const { data } = await supabase.from('reactions').select('*').eq('report_id', reportId).order('created_at', { ascending: true })
      return data || []
    }
    const report = getStore(KEYS.reports).find(r => r.id === reportId)
    return report?.reactions || []
  },

  async addReaction(reportId, reaction) {
    if (supabase) {
      const { data, error } = await supabase.from('reactions').insert({ ...reaction, report_id: reportId }).select().single()
      if (error) throw error
      return data
    }
    const reports = getStore(KEYS.reports)
    const idx = reports.findIndex(r => r.id === reportId)
    if (idx === -1) throw new Error('Segnalazione non trovata')
    const newReaction = { ...reaction, id: `rea-${Date.now()}`, report_id: reportId, created_at: new Date().toISOString() }
    reports[idx].reactions = [...(reports[idx].reactions || []), newReaction]
    setStore(KEYS.reports, reports)
    return newReaction
  },

  async removeReaction(id) {
    if (supabase) {
      const { error } = await supabase.from('reactions').delete().eq('id', id)
      if (error) throw error
      return
    }
    const reports = getStore(KEYS.reports)
    const idx = reports.findIndex(r => r.reactions?.some(x => x.id === id))
    if (idx === -1) return
    reports[idx].reactions = reports[idx].reactions.filter(x => x.id !== id)
    setStore(KEYS.reports, reports)
  },

  // Totale 👏 ricevuti sulle segnalazioni assegnate all'utente
  async getThanksReceived(userId) {
    if (supabase) {
      const { data } = await supabase.from('reactions')
        .select('id, reports!inner(assigned_to)')
        .eq('type', 'grazie')
        .is('comment_id', null)
        .eq('reports.assigned_to', userId)
      return data?.length || 0
    }
    return getStore(KEYS.reports)
      .filter(r => r.assigned_to === userId)
      .reduce((n, r) => n + (r.reactions || []).filter(x => x.type === 'grazie' && !x.comment_id).length, 0)
  },

  // ─── MACHINES ───
  async getMachines() {
    if (supabase) {
      const { data } = await supabase.from('machines').select('*').order('name')
      return data || []
    }
    return getStore(KEYS.machines)
  },

  async createMachine(machine) {
    if (supabase) {
      const { data, error } = await supabase.from('machines').insert(machine).select().single()
      if (error) throw error
      return data
    }
    const machines = getStore(KEYS.machines)
    const newMachine = { ...machine, id: `mac-${Date.now()}`, created_at: new Date().toISOString() }
    machines.push(newMachine)
    setStore(KEYS.machines, machines)
    return newMachine
  },

  async updateMachine(id, updates) {
    if (supabase) {
      const { data, error } = await supabase.from('machines').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    }
    const machines = getStore(KEYS.machines)
    const idx = machines.findIndex(m => m.id === id)
    if (idx === -1) throw new Error('Macchinario non trovato')
    machines[idx] = { ...machines[idx], ...updates }
    setStore(KEYS.machines, machines)
    return machines[idx]
  },

  async deleteMachine(id) {
    if (supabase) {
      const { error } = await supabase.from('machines').delete().eq('id', id)
      if (error) throw error
      return
    }
    const machines = getStore(KEYS.machines).filter(m => m.id !== id)
    setStore(KEYS.machines, machines)
  },

  // ─── FILE STORAGE ───
  async uploadFile(bucket, path, file) {
    if (supabase) {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
      return publicUrl
    }
    // Fallback: converte in base64 per localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },
}
