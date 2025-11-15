-- AI Observability & Monitoring Tables
-- Store metrics for all AI operations

-- AI Metrics table
CREATE TABLE IF NOT EXISTS ai_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_metrics_agent ON ai_metrics(agent_name);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_timestamp ON ai_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_success ON ai_metrics(success);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_run_id ON ai_metrics(run_id);

-- RLS policies
ALTER TABLE ai_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read ai_metrics"
  ON ai_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to insert ai_metrics"
  ON ai_metrics FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant access
GRANT SELECT ON ai_metrics TO authenticated;
GRANT ALL ON ai_metrics TO service_role;

-- Comments
COMMENT ON TABLE ai_metrics IS 'Stores AI operation metrics for observability';
COMMENT ON COLUMN ai_metrics.run_id IS 'Unique identifier for each AI operation';
COMMENT ON COLUMN ai_metrics.agent_name IS 'Name of the AI agent that executed the operation';
COMMENT ON COLUMN ai_metrics.latency_ms IS 'Operation duration in milliseconds';
COMMENT ON COLUMN ai_metrics.cost_usd IS 'Estimated cost in USD based on token usage';
