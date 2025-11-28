-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  class TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on full_name for search
CREATE INDEX IF NOT EXISTS students_full_name_idx ON students(full_name);

-- Create index on class for filtering
CREATE INDEX IF NOT EXISTS students_class_idx ON students(class);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for viewing students (all authenticated users)
CREATE POLICY "Students are viewable by authenticated users"
  ON students
  FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- Create RLS policy for inserting students (admin only)
CREATE POLICY "Students can be created by admin"
  ON students
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policy for updating students (admin only)
CREATE POLICY "Students can be updated by admin"
  ON students
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policy for deleting students (admin only)
CREATE POLICY "Students can be deleted by admin"
  ON students
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
