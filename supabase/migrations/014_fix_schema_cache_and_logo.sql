-- Fix clothing_inventory schema cache + add logo_url to association_settings
-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Ensure clothing_inventory table and constraints exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clothing_inventory' AND table_schema = 'public') THEN
    CREATE TABLE clothing_inventory (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      UNIQUE(item_id, size)
    );
    ALTER TABLE clothing_inventory ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Re-grant permissions to ensure PostgREST can see it
GRANT ALL ON clothing_inventory TO authenticated;
GRANT ALL ON clothing_inventory TO anon;

-- Add logo_url to association_settings
ALTER TABLE association_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Allow all authenticated users to read association_settings (for sidebar name/logo)
-- Drop existing restrictive select policy and create a permissive one
DO $$ BEGIN
  BEGIN
    DROP POLICY "Admin vede impostazioni associazione" ON association_settings;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

CREATE POLICY "Authenticated can read association settings"
  ON association_settings FOR SELECT TO authenticated
  USING (true);

-- Reload schema again after changes
NOTIFY pgrst, 'reload schema';
