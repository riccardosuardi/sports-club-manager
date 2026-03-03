-- =============================================
-- Tabella impostazioni associazione sportiva
-- =============================================

CREATE TABLE IF NOT EXISTS association_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  province TEXT,
  phone TEXT,
  email TEXT,
  pec TEXT,
  fiscal_code TEXT,
  vat_number TEXT,
  website TEXT,
  president TEXT,
  founded_year TEXT,
  sport_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: solo admin può vedere e gestire
ALTER TABLE association_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin vede impostazioni associazione"
  ON association_settings FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria'));

CREATE POLICY "Admin gestisce impostazioni associazione"
  ON association_settings FOR ALL
  USING (get_user_role() = 'admin');

-- Trigger updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON association_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
