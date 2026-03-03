-- =============================================
-- Fix: Registrazione nuovi utenti
-- Problema: "Database error saving new user"
-- Causa: mancava policy INSERT su profiles + search_path non impostato
-- =============================================

-- 1. Ricrea la funzione con search_path corretto e casting sicuro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'socio'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Aggiungi policy INSERT su profiles (mancava nello schema originale)
-- Permette al trigger di inserire il profilo durante la registrazione
CREATE POLICY "Inserimento profilo alla registrazione"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
