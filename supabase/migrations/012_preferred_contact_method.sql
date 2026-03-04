-- =============================================
-- Aggiunge metodo di contatto preferito e
-- corregge i collegamenti tra entità
-- =============================================

-- 1. Aggiunge preferred_contact_method alla tabella users
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT
  CHECK (preferred_contact_method IN ('email', 'whatsapp', 'phone'))
  DEFAULT NULL;

-- 2. Aggiorna il trigger handle_new_user per usare la tabella users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, email, first_name, last_name, role, is_member)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), ''),
    COALESCE(
      CASE
        WHEN position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) > 0
        THEN substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1)
        ELSE ''
      END, ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'socio'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Aggiorna get_user_role() per essere più robusto
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1),
    'socio'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Fix: assicura che enrollments e clothing_orders referenzino la tabella users
-- (le FK dovrebbero già essere corrette dopo il rename, ma aggiungiamo gli indici mancanti)
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_parent ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_is_member ON users(is_member);
CREATE INDEX IF NOT EXISTS idx_users_contact_status ON users(contact_status);

-- 5. Fix RLS per enrollments: assicura che lo staff possa fare CRUD completo
DROP POLICY IF EXISTS "Staff vede le iscrizioni" ON enrollments;
DROP POLICY IF EXISTS "Admin e segreteria gestiscono iscrizioni" ON enrollments;

CREATE POLICY "staff_select_enrollments"
  ON enrollments FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

CREATE POLICY "staff_manage_enrollments"
  ON enrollments FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- 6. Fix RLS per attendance
DROP POLICY IF EXISTS "Staff vede le presenze" ON attendance;
DROP POLICY IF EXISTS "Staff gestisce le presenze" ON attendance;

CREATE POLICY "staff_select_attendance"
  ON attendance FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

CREATE POLICY "staff_manage_attendance"
  ON attendance FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

-- 7. Fix RLS per clothing_orders
DROP POLICY IF EXISTS "Staff vede tutti gli ordini" ON clothing_orders;
DROP POLICY IF EXISTS "Staff gestisce gli ordini" ON clothing_orders;

CREATE POLICY "staff_select_clothing_orders"
  ON clothing_orders FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria'));

CREATE POLICY "staff_manage_clothing_orders"
  ON clothing_orders FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria'));

-- 8. Fix RLS per competitions (dalla migrazione 002)
DROP POLICY IF EXISTS "Staff vede tutte le gare" ON competitions;
DROP POLICY IF EXISTS "Staff gestisce le gare" ON competitions;

CREATE POLICY "all_select_competitions"
  ON competitions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "staff_manage_competitions"
  ON competitions FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

-- 9. Fix RLS per competition_registrations
DROP POLICY IF EXISTS "Staff vede le iscrizioni gare" ON competition_registrations;
DROP POLICY IF EXISTS "Staff gestisce le iscrizioni gare" ON competition_registrations;

CREATE POLICY "staff_select_comp_registrations"
  ON competition_registrations FOR SELECT
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));

CREATE POLICY "staff_manage_comp_registrations"
  ON competition_registrations FOR ALL
  USING (get_user_role() IN ('admin', 'segreteria', 'istruttore'));
