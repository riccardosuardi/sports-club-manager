-- =============================================
-- Fix: RLS policies su tabella users
-- Le policy della migrazione 006 erano troppo restrittive:
-- permettevano solo di vedere il proprio record.
-- Ora staff (admin, segreteria, istruttore) può vedere tutti.
-- =============================================

-- 1. Rimuovi le policy restrittive della migrazione 006
DROP POLICY IF EXISTS "Utente vede il proprio record" ON users;
DROP POLICY IF EXISTS "Utente aggiorna il proprio record" ON users;

-- 2. Assicura che RLS sia attivo sulla tabella users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. SELECT: staff vede tutti, utente normale vede solo sé stesso
CREATE POLICY "users_select_policy"
  ON users FOR SELECT
  USING (
    auth_id = auth.uid()
    OR get_user_role() IN ('admin', 'segreteria', 'istruttore')
  );

-- 4. INSERT: admin e segreteria possono creare utenti, trigger crea il proprio
CREATE POLICY "users_insert_policy"
  ON users FOR INSERT
  WITH CHECK (
    auth_id = auth.uid()
    OR get_user_role() IN ('admin', 'segreteria')
  );

-- 5. UPDATE: staff può aggiornare, utente aggiorna solo sé stesso
CREATE POLICY "users_update_policy"
  ON users FOR UPDATE
  USING (
    auth_id = auth.uid()
    OR get_user_role() IN ('admin', 'segreteria')
  );

-- 6. DELETE: solo admin e segreteria
CREATE POLICY "users_delete_policy"
  ON users FOR DELETE
  USING (
    get_user_role() IN ('admin', 'segreteria')
  );
