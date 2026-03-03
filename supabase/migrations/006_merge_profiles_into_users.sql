-- =============================================
-- Migrazione: Unifica profiles dentro users
-- profiles (autenticazione) + users (soci/contatti) = unica tabella users
-- =============================================

-- 1. Aggiungi colonne auth a users
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'socio';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Migra dati da profiles: collega per email
UPDATE users u SET
  auth_id = p.id,
  role = p.role,
  avatar_url = p.avatar_url
FROM profiles p
WHERE LOWER(u.email) = LOWER(p.email) AND u.auth_id IS NULL;

-- Per profili senza corrispondenza in users, crea nuovi record
INSERT INTO users (first_name, last_name, email, auth_id, role, avatar_url, is_member, status)
SELECT
  p.full_name, '', p.email, p.id, p.role, p.avatar_url, false, 'attivo'
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.auth_id = p.id);

-- 3. Aggiorna get_user_role() per usare users
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 4. Aggiorna handle_new_user() per inserire in users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (first_name, last_name, email, auth_id, role, is_member, status)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    '',
    NEW.email,
    NEW.id,
    'socio',
    false,
    'attivo'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Aggiungi policy RLS per utente autenticato su users
CREATE POLICY "Utente vede il proprio record"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Utente aggiorna il proprio record"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- 6. Elimina tabella profiles (policy, trigger e indici vengono eliminati automaticamente)
DROP TABLE IF EXISTS profiles;
