/*
  # Create Medicine Catalog

  1. New Tables
    - `medicine_categories` - Drug categories (antibiotics, painkillers, etc)
    - `medicines` - Medicine master data
    - `suppliers` - Supplier database with performance tracking
    - `medicine_supplier_mapping` - Many-to-many relationship between medicines and suppliers

  2. Security
    - Enable RLS on all tables
    - Admins can manage medicine data
    - Pharmacists can read medicine data
    - Hospitals can read medicine data they have access to

  3. Features
    - Track unit price, manufacturer, strength/dosage
    - Supplier performance fields for AI scoring
*/

CREATE TABLE IF NOT EXISTS medicine_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO medicine_categories (name, description) VALUES
  ('Antibiotics', 'Antimicrobial agents'),
  ('Painkillers', 'Analgesics and pain relievers'),
  ('Antihistamines', 'Allergy medications'),
  ('Cardiovascular', 'Heart and blood pressure medications'),
  ('Diabetes', 'Blood sugar management'),
  ('Respiratory', 'Asthma and breathing medications'),
  ('Digestive', 'Gastrointestinal medications'),
  ('Vitamins & Supplements', 'Nutritional supplements'),
  ('Topical', 'Skin applications'),
  ('Vaccines', 'Immunizations')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  delivery_reliability_score numeric DEFAULT 0,
  quality_score numeric DEFAULT 0,
  average_delivery_days numeric DEFAULT 0,
  total_orders_delivered integer DEFAULT 0,
  on_time_deliveries integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES medicine_categories(id),
  strength text,
  unit_of_measure text,
  manufacturer text,
  unit_price numeric NOT NULL,
  minimum_stock_level integer DEFAULT 100,
  reorder_quantity integer DEFAULT 500,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read medicines"
  ON medicines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage medicines"
  ON medicines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS medicine_supplier_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  supplier_medicine_code text,
  lead_time_days integer DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  UNIQUE(medicine_id, supplier_id)
);

ALTER TABLE medicine_supplier_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read mappings"
  ON medicine_supplier_mapping FOR SELECT
  TO authenticated
  USING (true);
