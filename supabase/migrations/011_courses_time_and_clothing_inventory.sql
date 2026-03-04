-- Add time fields to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS end_time TIME;

-- Add quantity per size and assignment tracking to clothing
CREATE TABLE IF NOT EXISTS clothing_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE(item_id, size)
);

CREATE TABLE IF NOT EXISTS clothing_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  assigned_at DATE NOT NULL DEFAULT CURRENT_DATE,
  returned_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for clothing_inventory
ALTER TABLE clothing_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view clothing inventory"
  ON clothing_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/segreteria can manage clothing inventory"
  ON clothing_inventory FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'segreteria'))
  );

-- RLS for clothing_assignments
ALTER TABLE clothing_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view clothing assignments"
  ON clothing_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/segreteria can manage clothing assignments"
  ON clothing_assignments FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'segreteria'))
  );
