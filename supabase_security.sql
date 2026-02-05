-- 0. Ensure columns exist before applying policies
-- Para a tabela 'jobs'
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Para a tabela 'promotions'
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'jobs' Table

-- Public can read ONLY published jobs
CREATE POLICY "Public can view published jobs" 
ON jobs FOR SELECT 
TO public 
USING (status = 'published');

-- Admins can do EVERYTHING (Select, Insert, Update, Delete)
CREATE POLICY "Admins have full access to jobs" 
ON jobs FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email' = 'josuemiguelsued@gmail.com') OR 
  ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true)
);

-- 2. Policies for 'promotions' Table

-- Public can read ONLY published promotions
CREATE POLICY "Public can view published promotions" 
ON promotions FOR SELECT 
TO public 
USING (status = 'published');

-- Authenticated users can insert NEW promotions (Submit)
CREATE POLICY "Users can submit promotions" 
ON promotions FOR INSERT 
TO authenticated 
WITH CHECK (true); 

-- Users can view their own submitted promotions (even if pending)
CREATE POLICY "Users can view own promotions" 
ON promotions FOR SELECT 
TO authenticated 
USING (submitted_by = auth.uid());

-- Admins have full access
CREATE POLICY "Admins have full access to promotions" 
ON promotions FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email' = 'josuemiguelsued@gmail.com') OR 
  ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true)
);

-- 3. Policies for 'exchange_rates' Table

-- Public can view exchange rates
CREATE POLICY "Public can view exchange rates" 
ON exchange_rates FOR SELECT 
TO public 
USING (true);

-- Only Admins can update/insert exchange rates
CREATE POLICY "Admins can manage exchange rates" 
ON exchange_rates FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email' = 'josuemiguelsued@gmail.com') OR 
  ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true)
);

-- HELPER: Function to make a user an admin
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
