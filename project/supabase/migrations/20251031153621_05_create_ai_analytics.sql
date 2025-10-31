/*
  # Create AI Analytics and Demand Forecasting Tables

  1. New Tables
    - `demand_history` - Historical usage data for forecasting
    - `demand_forecast` - AI-generated demand predictions
    - `ai_insights` - Generated AI recommendations and insights
    - `anomaly_records` - Detected anomalies in usage patterns

  2. Security
    - Enable RLS on all tables
    - Users can read forecasts for their organization
    - Admins can manage all forecasts

  3. Features
    - Time-series demand tracking
    - Predictive analytics storage
    - Anomaly detection logging
    - AI-generated recommendations
*/

CREATE TABLE IF NOT EXISTS demand_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id),
  organization_id uuid NOT NULL REFERENCES user_profiles(id),
  quantity_consumed integer NOT NULL,
  transaction_date date NOT NULL,
  day_of_week integer,
  month integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(medicine_id, organization_id, transaction_date)
);

ALTER TABLE demand_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read demand history for their organization"
  ON demand_history FOR SELECT
  TO authenticated
  USING (
    organization_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS demand_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id),
  organization_id uuid NOT NULL REFERENCES user_profiles(id),
  forecast_date date NOT NULL,
  predicted_quantity integer NOT NULL,
  confidence_score numeric,
  forecast_generated_at timestamptz DEFAULT now(),
  model_version text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(medicine_id, organization_id, forecast_date)
);

ALTER TABLE demand_forecast ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read forecasts for their organization"
  ON demand_forecast FOR SELECT
  TO authenticated
  USING (
    organization_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES user_profiles(id),
  insight_type text NOT NULL CHECK (insight_type IN ('restocking', 'expiry_risk', 'cost_optimization', 'supplier_performance', 'anomaly')),
  title text NOT NULL,
  description text,
  related_medicine_id uuid REFERENCES medicines(id),
  recommendation text,
  priority text CHECK (priority IN ('high', 'medium', 'low')),
  is_actioned boolean DEFAULT false,
  action_notes text,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read insights for their organization"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (
    organization_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS anomaly_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id),
  organization_id uuid NOT NULL REFERENCES user_profiles(id),
  anomaly_type text NOT NULL CHECK (anomaly_type IN ('unusual_usage', 'stock_discrepancy', 'rapid_depletion')),
  severity text CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  description text,
  expected_value numeric,
  actual_value numeric,
  variance_percentage numeric,
  is_investigated boolean DEFAULT false,
  investigation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE anomaly_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read anomalies for their organization"
  ON anomaly_records FOR SELECT
  TO authenticated
  USING (
    organization_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'admin'
    )
  );
