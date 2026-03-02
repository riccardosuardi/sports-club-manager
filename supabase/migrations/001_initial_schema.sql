-- =============================================
-- Schema per Gestione Associazione Sportiva
-- =============================================

-- Enum per i ruoli
CREATE TYPE user_role AS ENUM ('admin', 'segreteria', 'istruttore', 'socio');
CREATE TYPE member_status AS ENUM ('attivo', 'sospeso', 'scaduto', 'cancellato');
CREATE TYPE contact_status AS ENUM ('nuovo', 'contattato', 'interessato', 'convertito', 'perso');
CREATE TYPE order_status AS ENUM ('richiesto', 'ordinato', 'arrivato', 'consegnato', 'annullato');
CREATE TYPE enrollment_status AS ENUM ('attivo', 'sospeso', 'completato', 'ritirato');

-- =============================================
-- Profili utente (estende auth.users di Supabase)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'socio',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Soci
-- =============================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  fiscal_code TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'Altro')),
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  province TEXT,

  -- Relazione genitore-figlio
  parent_id UUID REFERENCES members(id) ON DELETE SET NULL,
  is_minor BOOLEAN NOT NULL DEFAULT false,

  -- Tessera e stato
  membership_number TEXT UNIQUE,
  status member_status NOT NULL DEFAULT 'attivo',
  membership_start DATE,
  membership_end DATE,

  -- Certificato medico
  medical_certificate_expiry DATE,
  medical_certificate_type TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_parent ON members(parent_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_name ON members(last_name, first_name);

-- =============================================
-- Corsi / Attività
-- =============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT,
  instructor_name TEXT,
  schedule TEXT,            -- es. "Lun/Mer 17:00-18:30"
  location TEXT,
  max_participants INTEGER,
  season TEXT,              -- es. "2025/2026"
  price NUMERIC(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Iscrizioni ai corsi
-- =============================================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'attivo',
  enrolled_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(member_id, course_id)
);

CREATE INDEX idx_enrollments_member ON enrollments(member_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- =============================================
-- Presenze
-- =============================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,

  UNIQUE(enrollment_id, date)
);

CREATE INDEX idx_attendance_date ON attendance(date);

-- =============================================
-- Catalogo abbigliamento
-- =============================================
CREATE TABLE clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,           -- es. "Maglia", "Pantaloncini", "Tuta"
  available_sizes TEXT[],  -- es. {'XS','S','M','L','XL'}
  price NUMERIC(10, 2),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Ordini abbigliamento
-- =============================================
CREATE TABLE clothing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status order_status NOT NULL DEFAULT 'richiesto',
  total_price NUMERIC(10, 2),
  notes TEXT,
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clothing_orders_member ON clothing_orders(member_id);
CREATE INDEX idx_clothing_orders_status ON clothing_orders(status);

-- =============================================
-- Contatti Marketing
-- =============================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,             -- es. "Sito web", "Passaparola", "Evento", "Social"
  interest TEXT,           -- es. "Nuoto", "Calcio", "Tennis"
  status contact_status NOT NULL DEFAULT 'nuovo',
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  converted_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_status ON contacts(status);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Helper per ottenere il ruolo dell'utente corrente
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: ognuno vede il proprio, admin/segreteria vedono tutti
CREATE POLICY "Utenti vedono il proprio profilo"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR get_user_role() IN ('admin', 'segreteria'));

CREATE POLICY "Utenti aggiornano il proprio profilo"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR get_user_role() = 'admin');

-- Members: admin/segreteria/istruttori possono vedere e gestire
CREATE POLICY "Staff vede tutti i soci"
  ON members FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

CREATE POLICY "Admin e segreteria gestiscono i soci"
  ON members FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- Courses: tutti gli autenticati possono vedere, staff gestisce
CREATE POLICY "Tutti vedono i corsi"
  ON courses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff gestisce i corsi"
  ON courses FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

-- Enrollments
CREATE POLICY "Staff vede le iscrizioni"
  ON enrollments FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

CREATE POLICY "Admin e segreteria gestiscono iscrizioni"
  ON enrollments FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- Attendance
CREATE POLICY "Staff vede le presenze"
  ON attendance FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

CREATE POLICY "Staff gestisce le presenze"
  ON attendance FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

-- Clothing items: tutti vedono, staff gestisce
CREATE POLICY "Tutti vedono l'abbigliamento"
  ON clothing_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff gestisce l'abbigliamento"
  ON clothing_items FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- Clothing orders
CREATE POLICY "Staff vede tutti gli ordini"
  ON clothing_orders FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria'));

CREATE POLICY "Staff gestisce gli ordini"
  ON clothing_orders FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- Contacts (marketing): solo admin e segreteria
CREATE POLICY "Admin e segreteria vedono i contatti"
  ON contacts FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria'));

CREATE POLICY "Admin e segreteria gestiscono i contatti"
  ON contacts FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- =============================================
-- Trigger per aggiornare updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clothing_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Trigger per creare profilo alla registrazione
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'socio')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
