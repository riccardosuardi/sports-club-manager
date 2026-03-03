-- Aggiunge flag attività giovanile ai corsi
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_youth BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_courses_is_youth ON courses(is_youth);
