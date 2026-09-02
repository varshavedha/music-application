-- Run this SQL in your Supabase SQL Editor

-- Create the songs table
CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  cover_url text,
  audio_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Note: Since we are using an anonymous public key and keeping things simple, 
-- we will enable RLS and create open policies for demonstration purposes. 
-- In a real production app, you should restrict INSERT/UPDATE/DELETE to authenticated admins only.

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON songs
  FOR SELECT USING (true);

-- Allow insert access to everyone (for this simple demo admin page)
CREATE POLICY "Allow public insert access" ON songs
  FOR INSERT WITH CHECK (true);

-- Allow update access to everyone (for this simple demo admin page)
CREATE POLICY "Allow public update access" ON songs
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow delete access to everyone (for this simple demo admin page)
CREATE POLICY "Allow public delete access" ON songs
  FOR DELETE USING (true);
