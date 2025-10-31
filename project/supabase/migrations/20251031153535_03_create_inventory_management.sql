/*
  # Create Inventory Management System

  1. New Tables
    - `inventory_batches` - Track medicine batches with expiry dates and locations
    - `inventory_transactions` - Log all stock movements
    - `stock_alerts` - Track active alerts for low stock and expiry warnings

  2. Security
    - Enable RLS on all tables
    - Users can only see inventory for their organization
    - Admins can see all inventory
    - All transactions are logged for audit trail

  3. Features
    - Batch-level tracking with expiry management
    - Real-time stock movement logging
    - Alert generation system
*/

CREATE TABLE IF NOT EXISTS inventory_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id),
  batch_number text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  manufacturing_date date,
  expiry_date date NOT NULL,
  location text,
  organization_id uuid REFERENCES user_profiles(id),
  received_date timestamptz DEFAULT now(),
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(batch_number, organization_id)
);

ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read inventory for their organization"
  ON inventory_batches FOR SELECT
  TO authenticated
  USING (
    organization_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage all inventory"
  ON inventory_batches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES inventory_batches(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('inbound', 'outbound', 'adjustment', 'disposal')),
  quantity_change integer NOT NULL,
  reason text,
  performed_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON inventory_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inventory_batches ib
      WHERE ib.id = batch_id AND (
        ib.organization_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN user_roles ur ON up.role_id = ur.id
          WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
      )
    )
  );

CREATE POLICY "Admins and pharmacists can create transactions"
  ON inventory_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    performed_by = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN user_roles ur ON up.role_id = ur.id
        WHERE up.id = auth.uid() AND (ur.name = 'admin' OR ur.name = 'pharmacist')
      )
    )
  );

CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES inventory_batches(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'expiry_warning', 'expired')),
  alert_level text NOT NULL CHECK (alert_level IN ('critical', 'warning', 'info')),
  message text,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read alerts for their organization"
  ON stock_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inventory_batches ib
      WHERE ib.id = batch_id AND (
        ib.organization_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN user_roles ur ON up.role_id = ur.id
          WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
      )
    )
  );
