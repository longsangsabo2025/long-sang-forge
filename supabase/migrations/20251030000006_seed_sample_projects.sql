-- ================================================
-- SEED DATA: Sample Projects with Demo Agents
-- ================================================

-- Clean up existing demo agents first (optional)
DELETE FROM public.ai_agents 
WHERE name LIKE 'Demo%' OR name LIKE '%Agent';

-- ================================================
-- 1. E-COMMERCE PROJECT
-- ================================================

-- Product Description Writer
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '🛍️ Product Description Writer',
  'content_writer',
  'ecommerce',
  'active',
  'Tự động tạo mô tả sản phẩm hấp dẫn, tối ưu SEO cho các sản phẩm mới',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'auto_publish', false,
    'require_approval', true,
    'tone', 'friendly',
    'max_length', 500,
    'generate_seo', true,
    'target_audience', 'online shoppers',
    'include_features', true,
    'include_benefits', true
  )
);

-- Customer Review Responder
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '💬 Customer Review Responder',
  'custom',
  'ecommerce',
  'paused',
  'Tự động phản hồi đánh giá của khách hàng một cách chuyên nghiệp và thân thiện',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'tone', 'professional',
    'response_time', 'within 24 hours',
    'sentiment_analysis', true,
    'auto_respond_positive', true,
    'require_approval_negative', true
  )
);

-- Abandoned Cart Recovery
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '🛒 Cart Recovery Agent',
  'lead_nurture',
  'ecommerce',
  'paused',
  'Gửi email nhắc nhở khách hàng về giỏ hàng bỏ quên với ưu đãi đặc biệt',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'email_provider', 'resend',
    'follow_up_delay_hours', 2,
    'max_follow_ups', 3,
    'offer_discount', true,
    'discount_percentage', 10,
    'personalization_level', 'high'
  )
);

-- ================================================
-- 2. CRM & SALES PROJECT
-- ================================================

-- Lead Qualification Agent
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '🎯 Lead Qualifier',
  'analytics',
  'crm',
  'active',
  'Phân tích và chấm điểm leads dựa trên hành vi, tự động phân loại hot/warm/cold',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'scoring_criteria', jsonb_build_array(
      'engagement_level',
      'budget_range',
      'decision_timeline',
      'fit_score'
    ),
    'auto_assign_sales', true,
    'send_alerts', true
  )
);

-- Sales Follow-up Automator
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '📧 Sales Follow-up Bot',
  'lead_nurture',
  'crm',
  'paused',
  'Tự động gửi email follow-up cho prospects dựa trên giai đoạn trong sales funnel',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'email_provider', 'resend',
    'follow_up_sequence', jsonb_build_array(
      'day_1_introduction',
      'day_3_value_proposition',
      'day_7_case_study',
      'day_14_special_offer'
    ),
    'personalization_level', 'high'
  )
);

-- Meeting Notes Summarizer
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '📝 Meeting Notes AI',
  'custom',
  'crm',
  'paused',
  'Tóm tắt cuộc họp, trích xuất action items và tự động cập nhật CRM',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'extract_action_items', true,
    'identify_next_steps', true,
    'auto_create_tasks', true,
    'send_summary_email', true
  )
);

-- ================================================
-- 3. MARKETING AUTOMATION PROJECT
-- ================================================

-- Blog Content Generator
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '✍️ Blog Content Generator',
  'content_writer',
  'marketing',
  'active',
  'Tự động tạo blog posts chất lượng cao từ topics, hoàn chỉnh với SEO metadata',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'auto_publish', false,
    'require_approval', true,
    'tone', 'professional',
    'max_length', 2000,
    'generate_seo', true,
    'include_images', false,
    'target_audience', 'business professionals'
  )
);

-- Social Media Manager
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '📱 Social Media Manager',
  'social_media',
  'marketing',
  'paused',
  'Tự động đăng nội dung lên LinkedIn, Facebook, Twitter với timing tối ưu',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'platforms', jsonb_build_array('linkedin', 'facebook', 'twitter'),
    'post_variants', 3,
    'include_hashtags', true,
    'auto_schedule', true,
    'optimal_timing', true,
    'content_types', jsonb_build_array('tips', 'news', 'questions', 'stories')
  )
);

-- Email Campaign Creator
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '💌 Email Campaign AI',
  'lead_nurture',
  'marketing',
  'paused',
  'Tạo email campaigns cho các segments khác nhau với A/B testing tự động',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'email_provider', 'resend',
    'segment_targeting', true,
    'ab_testing', true,
    'personalization_level', 'high',
    'optimize_send_time', true
  )
);

-- ================================================
-- 4. OPERATIONS & PRODUCTIVITY PROJECT
-- ================================================

-- Task Prioritizer
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '⚡ Task Prioritizer AI',
  'analytics',
  'operations',
  'active',
  'Phân tích và ưu tiên công việc dựa trên deadline, impact, effort',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'prioritization_method', 'eisenhower_matrix',
    'factors', jsonb_build_array('urgency', 'importance', 'effort', 'impact'),
    'auto_assign', true,
    'send_daily_digest', true
  )
);

-- Document Summarizer
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '📄 Document Summarizer',
  'custom',
  'operations',
  'paused',
  'Tóm tắt documents dài thành bullet points ngắn gọn, dễ hiểu',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'output_format', 'bullet_points',
    'max_summary_length', 300,
    'extract_key_insights', true,
    'supported_formats', jsonb_build_array('pdf', 'docx', 'txt')
  )
);

-- Report Generator
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '📊 Weekly Report Generator',
  'analytics',
  'operations',
  'paused',
  'Tự động tạo báo cáo tuần từ data, gửi email cho stakeholders',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'report_frequency', 'weekly',
    'include_charts', true,
    'include_insights', true,
    'recipients', jsonb_build_array('team', 'management'),
    'send_day', 'monday'
  )
);

-- ================================================
-- 5. WEBSITE AUTOMATION PROJECT (thêm vào existing)
-- ================================================

-- SEO Content Optimizer
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '🔍 SEO Optimizer',
  'content_writer',
  'website',
  'active',
  'Tối ưu hóa nội dung website cho SEO, suggest keywords và meta tags',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'auto_publish', false,
    'require_approval', true,
    'generate_seo', true,
    'keyword_research', true,
    'competitor_analysis', false,
    'tone', 'professional'
  )
);

-- Website Chat Support Bot
INSERT INTO public.ai_agents (name, type, category, status, description, config)
VALUES (
  '💬 Chat Support Bot',
  'custom',
  'website',
  'paused',
  'Chatbot tự động trả lời câu hỏi khách hàng trên website 24/7',
  jsonb_build_object(
    'ai_model', 'gpt-4o-mini',
    'response_style', 'friendly',
    'escalate_to_human', true,
    'escalation_keywords', jsonb_build_array('urgent', 'manager', 'complaint'),
    'available_24_7', true,
    'collect_feedback', true
  )
);

-- ================================================
-- CREATE SAMPLE BUDGETS
-- ================================================

-- Set budgets for active agents (skip if exists)
INSERT INTO public.agent_budgets (agent_id, max_daily_cost, max_monthly_cost, current_daily_spent, current_monthly_spent, auto_pause_on_exceed)
SELECT 
  a.id,
  5.00,    -- $5/day
  100.00,  -- $100/month
  0.00,
  0.00,
  true
FROM public.ai_agents a
WHERE a.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM public.agent_budgets b WHERE b.agent_id = a.id
  );

-- Set smaller budgets for paused agents (skip if exists)
INSERT INTO public.agent_budgets (agent_id, max_daily_cost, max_monthly_cost, current_daily_spent, current_monthly_spent, auto_pause_on_exceed)
SELECT 
  a.id,
  2.00,    -- $2/day
  30.00,   -- $30/month
  0.00,
  0.00,
  true
FROM public.ai_agents a
WHERE a.status = 'paused'
  AND NOT EXISTS (
    SELECT 1 FROM public.agent_budgets b WHERE b.agent_id = a.id
  );

-- ================================================
-- CREATE SAMPLE ACTIVITY LOGS
-- ================================================

INSERT INTO public.activity_logs (agent_id, action, details, status, duration_ms)
SELECT 
  id,
  'Agent Created',
  jsonb_build_object(
    'message', 'Sample agent ready for configuration',
    'category', category,
    'version', '1.0.0'
  ),
  'success',
  0
FROM public.ai_agents
WHERE name LIKE '🛍️%' OR name LIKE '💬%' OR name LIKE '🛒%' 
   OR name LIKE '🎯%' OR name LIKE '📧%' OR name LIKE '📝%'
   OR name LIKE '✍️%' OR name LIKE '📱%' OR name LIKE '💌%'
   OR name LIKE '⚡%' OR name LIKE '📄%' OR name LIKE '📊%'
   OR name LIKE '🔍%' OR name LIKE '💬%';
