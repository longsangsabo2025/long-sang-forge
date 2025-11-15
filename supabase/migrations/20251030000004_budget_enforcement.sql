-- ================================================
-- BUDGET ENFORCEMENT SYSTEM
-- ================================================
-- Automatically checks and enforces budget limits before agent execution

-- Function to check if agent is within budget
CREATE OR REPLACE FUNCTION check_agent_budget(p_agent_id uuid)
RETURNS boolean AS $$
DECLARE
  v_budget RECORD;
  v_daily_spend decimal;
  v_monthly_spend decimal;
  v_daily_limit decimal;
  v_monthly_limit decimal;
  v_auto_pause boolean;
BEGIN
  -- Get agent budget configuration
  SELECT * INTO v_budget
  FROM agent_budgets
  WHERE agent_id = p_agent_id;
  
  -- If no budget configured, allow execution
  IF v_budget IS NULL THEN
    RETURN true;
  END IF;
  
  v_daily_spend := COALESCE(v_budget.current_daily_spend, 0);
  v_monthly_spend := COALESCE(v_budget.current_monthly_spend, 0);
  v_daily_limit := v_budget.daily_limit;
  v_monthly_limit := v_budget.monthly_limit;
  v_auto_pause := COALESCE(v_budget.auto_pause_on_limit, true);
  
  -- Check daily limit
  IF v_daily_limit IS NOT NULL AND v_daily_spend >= v_daily_limit THEN
    -- Auto-pause agent if enabled
    IF v_auto_pause THEN
      UPDATE ai_agents SET status = 'paused' WHERE id = p_agent_id;
      
      -- Log the auto-pause event
      INSERT INTO activity_logs (agent_id, action, status, details)
      VALUES (p_agent_id, 'auto_pause', 'warning', 
              jsonb_build_object(
                'reason', 'daily_budget_exceeded',
                'daily_spend', v_daily_spend,
                'daily_limit', v_daily_limit
              ));
    END IF;
    RETURN false;
  END IF;
  
  -- Check monthly limit
  IF v_monthly_limit IS NOT NULL AND v_monthly_spend >= v_monthly_limit THEN
    -- Auto-pause agent if enabled
    IF v_auto_pause THEN
      UPDATE ai_agents SET status = 'paused' WHERE id = p_agent_id;
      
      -- Log the auto-pause event
      INSERT INTO activity_logs (agent_id, action, status, details)
      VALUES (p_agent_id, 'auto_pause', 'warning',
              jsonb_build_object(
                'reason', 'monthly_budget_exceeded',
                'monthly_spend', v_monthly_spend,
                'monthly_limit', v_monthly_limit
              ));
    END IF;
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to update budget spend after agent execution
CREATE OR REPLACE FUNCTION update_budget_after_execution()
RETURNS trigger AS $$
DECLARE
  v_cost decimal;
BEGIN
  -- Get cost from the new cost_analytics record
  v_cost := NEW.cost;
  
  -- Update agent budget
  UPDATE agent_budgets
  SET 
    current_daily_spend = current_daily_spend + v_cost,
    current_monthly_spend = current_monthly_spend + v_cost,
    updated_at = NOW()
  WHERE agent_id = NEW.agent_id;
  
  -- Check if approaching threshold (for notifications)
  PERFORM check_budget_threshold(NEW.agent_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update budget after cost is tracked
DROP TRIGGER IF EXISTS trg_update_budget_after_cost ON cost_analytics;
CREATE TRIGGER trg_update_budget_after_cost
  AFTER INSERT ON cost_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_after_execution();

-- Function to check if approaching budget threshold
CREATE OR REPLACE FUNCTION check_budget_threshold(p_agent_id uuid)
RETURNS void AS $$
DECLARE
  v_budget RECORD;
  v_daily_percent decimal;
  v_monthly_percent decimal;
  v_threshold integer;
BEGIN
  -- Get agent budget
  SELECT * INTO v_budget
  FROM agent_budgets
  WHERE agent_id = p_agent_id;
  
  IF v_budget IS NULL OR NOT v_budget.notify_on_threshold THEN
    RETURN;
  END IF;
  
  v_threshold := COALESCE(v_budget.alert_threshold, 80);
  
  -- Calculate daily percentage
  IF v_budget.daily_limit IS NOT NULL AND v_budget.daily_limit > 0 THEN
    v_daily_percent := (v_budget.current_daily_spend / v_budget.daily_limit) * 100;
    
    IF v_daily_percent >= v_threshold AND v_daily_percent < 100 THEN
      -- Log threshold warning
      INSERT INTO activity_logs (agent_id, action, status, details)
      VALUES (p_agent_id, 'budget_alert', 'warning',
              jsonb_build_object(
                'type', 'daily_threshold',
                'percent', v_daily_percent,
                'threshold', v_threshold,
                'current_spend', v_budget.current_daily_spend,
                'limit', v_budget.daily_limit
              ));
    END IF;
  END IF;
  
  -- Calculate monthly percentage
  IF v_budget.monthly_limit IS NOT NULL AND v_budget.monthly_limit > 0 THEN
    v_monthly_percent := (v_budget.current_monthly_spend / v_budget.monthly_limit) * 100;
    
    IF v_monthly_percent >= v_threshold AND v_monthly_percent < 100 THEN
      -- Log threshold warning
      INSERT INTO activity_logs (agent_id, action, status, details)
      VALUES (p_agent_id, 'budget_alert', 'warning',
              jsonb_build_object(
                'type', 'monthly_threshold',
                'percent', v_monthly_percent,
                'threshold', v_threshold,
                'current_spend', v_budget.current_monthly_spend,
                'limit', v_budget.monthly_limit
              ));
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily budgets (run via cron daily at midnight)
CREATE OR REPLACE FUNCTION reset_daily_budgets()
RETURNS void AS $$
BEGIN
  UPDATE agent_budgets
  SET 
    current_daily_spend = 0,
    last_reset = NOW()
  WHERE daily_limit IS NOT NULL;
  
  -- Log reset event
  INSERT INTO activity_logs (action, status, details)
  VALUES ('daily_budget_reset', 'info',
          jsonb_build_object(
            'reset_time', NOW(),
            'budgets_reset', (SELECT COUNT(*) FROM agent_budgets WHERE daily_limit IS NOT NULL)
          ));
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly budgets (run via cron monthly on 1st)
CREATE OR REPLACE FUNCTION reset_monthly_budgets()
RETURNS void AS $$
BEGIN
  UPDATE agent_budgets
  SET 
    current_monthly_spend = 0,
    last_reset = NOW()
  WHERE monthly_limit IS NOT NULL;
  
  -- Log reset event
  INSERT INTO activity_logs (action, status, details)
  VALUES ('monthly_budget_reset', 'info',
          jsonb_build_object(
            'reset_time', NOW(),
            'budgets_reset', (SELECT COUNT(*) FROM agent_budgets WHERE monthly_limit IS NOT NULL)
          ));
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION check_agent_budget IS 'Checks if agent is within budget limits before execution';
COMMENT ON FUNCTION update_budget_after_execution IS 'Updates budget spend after agent execution';
COMMENT ON FUNCTION check_budget_threshold IS 'Checks if agent is approaching budget threshold';
COMMENT ON FUNCTION reset_daily_budgets IS 'Resets daily budget counters (run via cron)';
COMMENT ON FUNCTION reset_monthly_budgets IS 'Resets monthly budget counters (run via cron)';
