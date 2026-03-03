-- Rinomina tabella persone -> users
ALTER TABLE persone RENAME TO users;

-- Aggiorna indici
ALTER INDEX idx_persone_is_member RENAME TO idx_users_is_member;
ALTER INDEX idx_persone_contact_status RENAME TO idx_users_contact_status;
