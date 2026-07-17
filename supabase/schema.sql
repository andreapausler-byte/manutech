-- ╔══════════════════════════════════════════════════════════════╗
-- ║  ManuTech - Schema Database Supabase                       ║
-- ║  Esegui questo SQL nel SQL Editor di Supabase               ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── UTENTI ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'operatore' CHECK (role IN ('operatore', 'tecnico', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MACCHINARI ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SEGNALAZIONI ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  machine TEXT,
  severity TEXT DEFAULT 'media' CHECK (severity IN ('bassa', 'media', 'alta', 'critica')),
  status TEXT DEFAULT 'aperta' CHECK (status IN ('aperta', 'assegnata', 'in_lavorazione', 'risolta')),
  media JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  created_by_name TEXT,
  assigned_to UUID REFERENCES users(id),
  assigned_to_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COMMENTI ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  user_role TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── REAZIONI ────────────────────────────────────────────────────
-- Feedback sui messaggi (👍 utile, ✅ confermo, 🔧 risolto) e
-- ringraziamenti a livello segnalazione (👏 grazie, comment_id NULL).
-- Se hai già un database esistente, esegui solo questa sezione
-- (tabella + indici + RLS in fondo al file).
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('utile', 'confermo', 'risolto', 'grazie')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDICI ──────────────────────────────────────────────────────
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_severity ON reports(severity);
CREATE INDEX idx_reports_assigned ON reports(assigned_to);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_comments_report ON comments(report_id);
CREATE INDEX idx_reactions_report ON reactions(report_id);
-- Una sola reazione per utente/tipo su ogni messaggio (o segnalazione)
CREATE UNIQUE INDEX idx_reactions_unique_comment ON reactions(comment_id, user_id, type) WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX idx_reactions_unique_report ON reactions(report_id, user_id, type) WHERE comment_id IS NULL;

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Policy: tutti gli utenti autenticati possono leggere
CREATE POLICY "Users can read all" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reports can read all" ON reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Comments can read all" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Machines can read all" ON machines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reactions can read all" ON reactions FOR SELECT TO authenticated USING (true);

-- Policy: inserimento
CREATE POLICY "Users can insert own" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can create reports" ON reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can add comments" ON comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can create machines" ON machines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can add reactions" ON reactions FOR INSERT TO authenticated WITH CHECK (true);

-- Policy: aggiornamento
CREATE POLICY "Admins and techs can update reports" ON reports FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can update machines" ON machines FOR UPDATE TO authenticated USING (true);

-- Policy: eliminazione (solo admin)
CREATE POLICY "Admins can delete users" ON users FOR DELETE TO authenticated USING (true);
CREATE POLICY "Users can remove reactions" ON reactions FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admins can delete machines" ON machines FOR DELETE TO authenticated USING (true);

-- ── STORAGE BUCKET ──────────────────────────────────────────────
-- Crea manualmente dal pannello Supabase:
-- Storage → New Bucket → "attachments" → Public

-- ── ADMIN DI DEFAULT ────────────────────────────────────────────
-- Dopo aver creato l'account admin da Supabase Auth, inserisci:
-- INSERT INTO users (auth_id, name, email, role) 
-- VALUES ('UUID_DA_AUTH', 'Admin', 'admin@manutech.it', 'admin');
