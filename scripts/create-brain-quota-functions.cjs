/**
 * Create check_brain_quota RPC function
 */

require("dotenv").config();
const { Client } = require("pg");

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log("Connected\n");

  const sql = `
    -- Create or replace check_brain_quota function
    CREATE OR REPLACE FUNCTION public.check_brain_quota(
      p_user_id UUID,
      p_action TEXT -- 'document', 'query', 'domain'
    )
    RETURNS JSONB AS $$
    DECLARE
      v_quota RECORD;
      v_month TEXT;
      v_allowed BOOLEAN;
      v_reason TEXT;
      v_limit INT;
      v_current INT;
    BEGIN
      v_month := to_char(NOW(), 'YYYY-MM');
      v_allowed := true;

      -- Get user quota for current month
      SELECT * INTO v_quota
      FROM user_brain_quotas
      WHERE user_id = p_user_id AND month_year = v_month;

      -- If no quota record, create one with defaults
      IF v_quota IS NULL THEN
        INSERT INTO user_brain_quotas (user_id, month_year, max_documents, max_queries_per_month, max_domains)
        VALUES (p_user_id, v_month, 50, 100, 3)
        RETURNING * INTO v_quota;
      END IF;

      -- Check based on action
      IF p_action = 'document' THEN
        v_current := v_quota.documents_count;
        v_limit := v_quota.max_documents;
        v_allowed := v_current < v_limit;
        v_reason := 'Document limit reached';
      ELSIF p_action = 'query' THEN
        v_current := v_quota.queries_count;
        v_limit := v_quota.max_queries_per_month;
        v_allowed := v_current < v_limit;
        v_reason := 'Query limit reached';
      ELSIF p_action = 'domain' THEN
        v_current := v_quota.domains_count;
        v_limit := v_quota.max_domains;
        v_allowed := v_current < v_limit;
        v_reason := 'Domain limit reached';
      ELSE
        v_reason := 'Unknown action';
        v_allowed := false;
      END IF;

      RETURN jsonb_build_object(
        'allowed', v_allowed,
        'reason', CASE WHEN v_allowed THEN NULL ELSE v_reason END,
        'current', v_current,
        'limit', v_limit
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create function to increment usage
    CREATE OR REPLACE FUNCTION public.increment_brain_usage(
      p_user_id UUID,
      p_action TEXT,
      p_amount INT DEFAULT 1
    )
    RETURNS VOID AS $$
    DECLARE
      v_month TEXT;
    BEGIN
      v_month := to_char(NOW(), 'YYYY-MM');

      -- Upsert quota record
      INSERT INTO user_brain_quotas (user_id, month_year)
      VALUES (p_user_id, v_month)
      ON CONFLICT (user_id, month_year) DO NOTHING;

      -- Update based on action
      IF p_action = 'document' THEN
        UPDATE user_brain_quotas
        SET documents_count = documents_count + p_amount, updated_at = NOW()
        WHERE user_id = p_user_id AND month_year = v_month;
      ELSIF p_action = 'query' THEN
        UPDATE user_brain_quotas
        SET queries_count = queries_count + p_amount, updated_at = NOW(), last_query_at = NOW()
        WHERE user_id = p_user_id AND month_year = v_month;
      ELSIF p_action = 'domain' THEN
        UPDATE user_brain_quotas
        SET domains_count = domains_count + p_amount, updated_at = NOW()
        WHERE user_id = p_user_id AND month_year = v_month;
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Grant execute to authenticated users
    GRANT EXECUTE ON FUNCTION public.check_brain_quota TO authenticated;
    GRANT EXECUTE ON FUNCTION public.check_brain_quota TO service_role;
    GRANT EXECUTE ON FUNCTION public.increment_brain_usage TO authenticated;
    GRANT EXECUTE ON FUNCTION public.increment_brain_usage TO service_role;
  `;

  await client.query(sql);
  console.log("✅ Functions created:");
  console.log("  - check_brain_quota(p_user_id, p_action)");
  console.log("  - increment_brain_usage(p_user_id, p_action, p_amount)");

  await client.end();
}

run().catch((e) => console.error("Error:", e.message));
