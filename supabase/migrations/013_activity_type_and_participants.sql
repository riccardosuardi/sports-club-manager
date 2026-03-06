-- Add activity_type to courses: 'marketing' or 'atleti'
ALTER TABLE courses ADD COLUMN IF NOT EXISTS activity_type text NOT NULL DEFAULT 'atleti';

-- Create activity_participants table for per-activity user tracking
CREATE TABLE IF NOT EXISTS activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'contattato',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- RLS policies
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage activity_participants"
  ON activity_participants FOR ALL
  USING (true)
  WITH CHECK (true);
