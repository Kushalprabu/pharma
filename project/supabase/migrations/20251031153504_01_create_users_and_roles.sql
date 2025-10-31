/*
  # Create Users and Roles System

  1. New Tables
    - `user_roles` - Defines available system roles
    - `user_profiles` - Extended user information with role assignment
  
  2. Security
    - Enable RLS on user_profiles
    - Users can read their own profile
    - Admins can read all profiles

  3. Notes
    - Built-in auth.users table from Supabase handles authentication
    - user_profiles extends auth with domain-specific fields
*/

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO user_roles (name, description) VALUES
  ('admin', 'Pharma Manager / System Administrator'),
  ('pharmacist', 'Pharmacist / Store Staff'),
  ('hospital', 'Hospital / Distributor'),
  ('auditor', 'Auditor / Regulator')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role_id uuid NOT NULL REFERENCES user_roles(id),
  organization text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );
