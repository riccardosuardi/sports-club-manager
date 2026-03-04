-- Add date fields to courses (replacing schedule/location/instructor/season)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS end_date date;

-- Add organigramma (JSON) to association_settings
ALTER TABLE association_settings ADD COLUMN IF NOT EXISTS organigramma text;
