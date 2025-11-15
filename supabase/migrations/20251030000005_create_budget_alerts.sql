-- ================================================
-- CREATE BUDGET ALERTS TABLE
-- ================================================
-- Stores budget threshold alerts for notifications

-- Budget alerts table
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_50', 'threshold_75', 'threshold_90', 'exceeded')),
  message TEXT NOT NULL,
  threshold_amount DECIMAL(10, 4),
  current_amount DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_budget_alerts_agent ON budget_alerts(agent_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_created ON budget_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_acknowledged ON budget_alerts(acknowledged) WHERE NOT acknowledged;

-- Enable RLS
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all budget alerts"
  ON budget_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert budget alerts"
  ON budget_alerts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can acknowledge alerts"
  ON budget_alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to create budget alert
CREATE OR REPLACE FUNCTION create_budget_alert(
  p_agent_id UUID,
  p_alert_type TEXT,
  p_message TEXT,
  p_threshold_amount DECIMAL DEFAULT NULL,
  p_current_amount DECIMAL DEFAULT NULL
)
RETURNS budget_alerts AS $$
DECLARE
  v_alert budget_alerts;
BEGIN
  -- Insert alert
  INSERT INTO budget_alerts (
    agent_id,
    alert_type,
    message,
    threshold_amount,
    current_amount
  ) VALUES (
    p_agent_id,
    p_alert_type,
    p_message,
    p_threshold_amount,
    p_current_amount
  )
  RETURNING * INTO v_alert;
  
  RETURN v_alert;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE budget_alerts IS 'Stores budget threshold alerts for real-time notifications';
