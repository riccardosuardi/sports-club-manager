-- =============================================
-- Migrazione: Unifica members + contacts in persone
-- =============================================

-- 1. Aggiungi campi marketing/contatto alla tabella members
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_member BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE members ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS interest TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS contact_status contact_status;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- 2. Migra dati da contacts a members (come non iscritti)
INSERT INTO members (first_name, last_name, email, phone, source, interest, contact_status, last_contacted_at, notes, is_member, status, created_at, updated_at)
SELECT first_name, last_name, email, phone, source, interest, status, last_contacted_at, notes, false, 'attivo', created_at, updated_at
FROM contacts
WHERE id NOT IN (SELECT converted_member_id FROM contacts WHERE converted_member_id IS NOT NULL);

-- Per i contatti già convertiti, aggiorna il socio esistente con i dati marketing
UPDATE members m SET
  source = c.source,
  interest = c.interest,
  contact_status = c.status,
  last_contacted_at = c.last_contacted_at
FROM contacts c
WHERE c.converted_member_id = m.id;

-- 3. Elimina tabella contacts
DROP TABLE IF EXISTS contacts;

-- 4. Rinomina members in persone
ALTER TABLE members RENAME TO persone;

-- 5. Aggiorna gli indici (i nomi restano quelli vecchi, ma funzionano)
-- I FK in enrollments, clothing_orders, competition_registrations
-- seguono automaticamente il rename della tabella

-- 6. Aggiorna le RLS policies (le policy seguono il rename automaticamente)
-- Aggiungi policy per il nuovo campo is_member per il marketing
-- Le policy esistenti già coprono admin/segreteria per gestione

-- 7. Trigger updated_at (segue il rename automaticamente)

-- 8. Indice per is_member
CREATE INDEX idx_persone_is_member ON persone(is_member);
CREATE INDEX idx_persone_contact_status ON persone(contact_status);
