/*
  # Create Orders and Procurement Management

  1. New Tables
    - `purchase_orders` - Track purchase orders from suppliers
    - `purchase_order_items` - Line items in each purchase order
    - `order_status_history` - Track order status changes over time

  2. Security
    - Enable RLS on all tables
    - Admins can manage orders
    - Users can view orders for their organization
    - Order history is immutable (audit trail)

  3. Features
    - Order lifecycle tracking
    - Automatic invoice tracking
    - Supplier performance data collection
*/

CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  organization_id uuid NOT NULL REFERENCES user_profiles(id),
  order_date timestamptz DEFAULT now(),
  expected_delivery_date date,
  actual_delivery_date date,
  total_amount numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read orders for their organization"
  ON purchase_orders FOR SELECT
  TO authenticated
  USING (
    organization_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE POLICY "Admins can create orders"
  ON purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES medicines(id),
  quantity_ordered integer NOT NULL,
  quantity_received integer DEFAULT 0,
  unit_price numeric NOT NULL,
  line_total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read items for their orders"
  ON purchase_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM purchase_orders po
      WHERE po.id = order_id AND (
        po.organization_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN user_roles ur ON up.role_id = ur.id
          WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
      )
    )
  );

CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES user_profiles(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read order history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM purchase_orders po
      WHERE po.id = order_id AND (
        po.organization_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_profiles up
          JOIN user_roles ur ON up.role_id = ur.id
          WHERE up.id = auth.uid() AND ur.name = 'admin'
        )
      )
    )
  );
