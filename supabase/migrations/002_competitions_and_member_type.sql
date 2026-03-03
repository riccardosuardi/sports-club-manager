-- =============================================
-- Migrazione: Calendario Gare + Tipologia Socio
-- =============================================

-- Enum per tipo socio
CREATE TYPE member_type AS ENUM ('giovane', 'adulto', 'genitore');

-- Enum per stato competizione
CREATE TYPE competition_status AS ENUM ('programmata', 'iscrizioni_aperte', 'iscrizioni_chiuse', 'in_corso', 'completata', 'annullata');

-- Aggiunge colonna member_type alla tabella soci
ALTER TABLE members ADD COLUMN member_type member_type;

-- Crea indice per ricerca per tipologia
CREATE INDEX idx_members_type ON members(member_type);

-- =============================================
-- Tabella Gare/Competizioni
-- =============================================
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT,
  competition_date DATE NOT NULL,
  competition_end_date DATE,             -- per gare su più giorni
  start_time TIME,
  end_time TIME,
  location TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  status competition_status NOT NULL DEFAULT 'programmata',
  max_participants INTEGER,
  registration_deadline DATE,
  category TEXT,                          -- es. "Esordienti", "Cadetti", "Assoluti"
  notes TEXT,
  is_home BOOLEAN NOT NULL DEFAULT false, -- gara in casa o trasferta
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_competitions_date ON competitions(competition_date);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_sport ON competitions(sport);

-- =============================================
-- Iscrizioni alle Gare
-- =============================================
CREATE TABLE competition_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'attivo',
  category TEXT,                          -- categoria di gara specifica del socio
  notes TEXT,
  result TEXT,                            -- risultato/piazzamento
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(competition_id, member_id)
);

CREATE INDEX idx_comp_reg_competition ON competition_registrations(competition_id);
CREATE INDEX idx_comp_reg_member ON competition_registrations(member_id);

-- =============================================
-- RLS per le nuove tabelle
-- =============================================
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;

-- Competitions: tutti gli autenticati possono vedere, staff gestisce
CREATE POLICY "Tutti vedono le gare"
  ON competitions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff gestisce le gare"
  ON competitions FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

-- Registrations: staff vede, admin/segreteria gestisce
CREATE POLICY "Staff vede iscrizioni gare"
  ON competition_registrations FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

CREATE POLICY "Admin e segreteria gestiscono iscrizioni gare"
  ON competition_registrations FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- Trigger updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
