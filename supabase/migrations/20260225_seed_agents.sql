-- ============================================================
-- LONGSANG AI COMPANY — Seed All 45 Agents
-- Run AFTER 20260225_agent_registry.sql migration
-- 
-- AUDIT (2026-02-26): 19 REAL CODE / 26 DISABLED
--   Content: 12 real (youtube-agent-crew)
--   Marketing: 2 real + 8 disabled (Claude prompts, no runtime)
--   Sales: 2 real + 4 disabled (catalog entries in mvp-agents.ts)
--   Entertainment: 1 real + 3 disabled (docs/guide only)
--   Infrastructure: 1 real + 4 disabled (utility libs + ghost paths)
--   Operations: 1 real
--   Sports: 0 real + 2 disabled (React hooks, not agents)
--   Real Estate: 0 real + 3 disabled (no agent code exists)
--   Education: 0 real + 2 disabled (planned/no code)
-- ============================================================

-- ═══════════════════════════════════════════════
-- DEPARTMENT: CONTENT (12 agents)
-- Source: youtube-agent-crew
-- ═══════════════════════════════════════════════

INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('Harvester', 'content-harvester', 'content', '🔍', 'Extract content from YouTube videos — metadata, transcripts, key topics, timestamps, quotes', 'pipeline', 'youtube-agent-crew', 'src/agents/harvester.js', 'gpt-4o', 0.002, 'idle'),
('Brain Curator', 'content-brain-curator', 'content', '🧠', 'Connect harvested content to 28-book knowledge library + BRAIN framework', 'pipeline', 'youtube-agent-crew', 'src/agents/brain-curator.js', 'gpt-4o', 0.002, 'idle'),
('Script Writer', 'content-script-writer', 'content', '✍️', 'Two-pass Vietnamese podcast script writer (1800-2500 words, 7 sections)', 'pipeline', 'youtube-agent-crew', 'src/agents/script-writer.js', 'gpt-4o', 0.003, 'idle'),
('Voice Producer', 'content-voice-producer', 'content', '🎙️', 'Convert script to audio via self-hosted VoxCPM-1.5-VN (800M params, RTX 4090)', 'pipeline', 'youtube-agent-crew', 'src/agents/voice-producer.js', 'voxcpm-1.5-vn', 0.001, 'idle'),
('Visual Director', 'content-visual-director', 'content', '🎨', 'Design visual storyboard — thumbnail, scene-by-scene plan, text overlays', 'pipeline', 'youtube-agent-crew', 'src/agents/visual-director.js', 'gpt-4o', 0.001, 'idle'),
('Video Composer', 'content-video-composer', 'content', '🎬', 'Create podcast-style videos with waveform, progress bar, Whisper subtitles', 'pipeline', 'youtube-agent-crew', 'src/agents/video-composer.js', 'whisper+ffmpeg', 0.001, 'idle'),
('Publisher', 'content-publisher', 'content', '📤', 'SEO-optimized YouTube upload + community post + metadata optimization', 'pipeline', 'youtube-agent-crew', 'src/agents/publisher.js', 'gpt-4o', 0.001, 'idle'),
('Shorts Script Writer', 'content-shorts-writer', 'content', '📱', '60-second YouTube Shorts scripts (120-150 words, subtitle-first design)', 'pipeline', 'youtube-agent-crew', 'src/agents/shorts-script-writer.js', 'gpt-4o', 0.001, 'idle'),
('Transcript Cleaner', 'content-transcript-cleaner', 'content', '📝', 'Clean Vietnamese auto-captions — fix spelling, diacriticals, financial terms', 'pipeline', 'youtube-agent-crew', 'src/agents/transcript-cleaner.js', 'gpt-4o-mini', 0.001, 'idle'),
('TTS Preprocessor', 'content-tts-preprocessor', 'content', '🔤', 'Transliterate foreign names to Vietnamese phonetics (100+ mappings)', 'pipeline', 'youtube-agent-crew', 'src/agents/tts-preprocessor.js', 'gpt-4o-mini', 0.0005, 'idle'),
('TTS Auditor', 'content-tts-auditor', 'content', '🔊', '3-layer quality gate: audio metrics + duration ratio + STT back-validation', 'pipeline', 'youtube-agent-crew', 'src/agents/tts-auditor.js', 'whisper+ffprobe', 0.0005, 'idle'),
('Content Repurposer', 'content-repurposer', 'content', '♻️', 'Transform video → SEO blog post + 5-platform social snippets + newsletter', 'scheduled', 'youtube-agent-crew', 'src/utils/content-repurposer.js', 'gemini-2.0-flash', 0.002, 'idle');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: MARKETING (10 agents)
-- 2 REAL (auto-seeder, engagement-bot)
-- 8 DISABLED (Claude Code agent prompts — no executable runtime yet)
-- ═══════════════════════════════════════════════

INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status, skills) VALUES
('Auto-Seeder', 'marketing-auto-seeder', 'marketing', '📢', 'Cross-post to Telegram + Twitter + Facebook + Reddit after video upload', 'scheduled', 'youtube-agent-crew', 'src/utils/auto-seeder.js', 'none', 0.01, 'idle', '["cross-posting", "social-media"]'),
('Social Engagement Bot', 'marketing-engagement-bot', 'marketing', '👍', 'Buy initial engagement via forlike.pro — likes, views, comments across platforms', 'scheduled', 'auto-seeding', 'src/index.js', 'deepseek', 0.10, 'idle', '["forlike-api", "ai-comments", "strategy-engine"]'),
-- ⚠️ Below 8 agents are Claude Code prompts (.claude/agents/*.md), NOT executable code. Status=disabled until runtime is built.
('SEO Specialist', 'marketing-seo-specialist', 'marketing', '🔎', 'Keyword research, SEO audit, programmatic SEO, schema markup', 'on-demand', 'agentkits-marketing', '.claude/agents/seo-specialist.md', 'gemini-2.0-flash', 0.005, 'disabled', '["seo-audit", "programmatic-seo", "schema-markup"]'),
('Copywriter', 'marketing-copywriter', 'marketing', '📝', 'Marketing copy — landing pages, ads, email subject lines, CTAs', 'on-demand', 'agentkits-marketing', '.claude/agents/copywriter.md', 'gemini-2.0-flash', 0.005, 'disabled', '["copywriting", "marketing-psychology"]'),
('Email Wizard', 'marketing-email-wizard', 'marketing', '📧', 'Email sequences — drip campaigns, onboarding flows, win-back emails', 'on-demand', 'agentkits-marketing', '.claude/agents/email-wizard.md', 'gemini-2.0-flash', 0.005, 'disabled', '["email-sequence", "copywriting"]'),
('Lead Qualifier', 'marketing-lead-qualifier', 'marketing', '🎯', 'Score leads 0-100, estimate deal size, draft personalized follow-up', 'on-demand', 'agentkits-marketing', '.claude/agents/lead-qualifier.md', 'gemini-2.0-flash', 0.005, 'disabled', '["lead-scoring", "sales-enablement"]'),
('Conversion Optimizer', 'marketing-cro-optimizer', 'marketing', '📊', 'Page CRO, form CRO, signup flow CRO, popup CRO, paywall upgrade', 'on-demand', 'agentkits-marketing', '.claude/agents/conversion-optimizer.md', 'gemini-2.0-flash', 0.005, 'disabled', '["page-cro", "form-cro", "ab-test-setup"]'),
('Brand Voice Guardian', 'marketing-brand-guardian', 'marketing', '🛡️', 'Ensure consistent brand voice across all content and platforms', 'on-demand', 'agentkits-marketing', '.claude/agents/brand-voice-guardian.md', 'gemini-2.0-flash', 0.002, 'disabled', '["brand-voice", "content-strategy"]'),
('Persona Builder', 'marketing-persona-builder', 'marketing', '👤', 'Build detailed customer personas from data + market research', 'on-demand', 'agentkits-marketing', '.claude/agents/persona-builder.md', 'gemini-2.0-flash', 0.005, 'disabled', '["product-marketing-context", "marketing-psychology"]'),
('Growth Hacker', 'marketing-growth-hacker', 'marketing', '🚀', 'Launch strategy, referral programs, free tool strategy, pricing optimization', 'on-demand', 'agentkits-marketing', '.claude/agents/attraction-specialist.md', 'gemini-2.0-flash', 0.005, 'disabled', '["launch-strategy", "referral-program", "pricing-strategy", "free-tool-strategy"]');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: SALES (6 agents)
-- 2 REAL (sales-consultant Edge Function, brain-chat Edge Function)
-- 4 DISABLED (catalog entries in mvp-agents.ts — no runtime)
-- ═══════════════════════════════════════════════

INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('Sales Consultant AI', 'sales-consultant', 'sales', '💼', '1222-line sales AI — pgvector RAG, knowledge search, conversation memory, credits, AI personalization', 'reactive', 'long-sang-forge', 'supabase/functions/sales-consultant/index.ts', 'gpt-4o', 0.01, 'active'),
('Brain Knowledge Bot', 'sales-brain-bot', 'sales', '🧠', 'Second Brain — import YouTube/URLs → embed → chat with personal knowledge base', 'reactive', 'long-sang-forge', 'supabase/functions/brain-chat/index.ts', 'gpt-4o-mini', 0.01, 'active'),
-- ⚠️ Below 4 agents are catalog entries in mvp-agents.ts — have system_prompt + pricing but no execution runtime
('Blog Post Writer', 'sales-blog-writer', 'sales', '📄', 'SEO-optimized 1500-word blog posts with H2/H3 structure, meta, internal linking', 'on-demand', 'long-sang-forge', 'src/data/mvp-agents.ts', 'gpt-4o', 0.50, 'disabled'),
('Email Follow-up Agent', 'sales-email-followup', 'sales', '📨', 'Personalized follow-up emails — reference previous conversations, suggest send times', 'on-demand', 'long-sang-forge', 'src/data/mvp-agents.ts', 'gpt-4o-mini', 0.02, 'disabled'),
('Social Media Manager', 'sales-social-manager', 'sales', '📲', 'Generate platform-optimized posts for LinkedIn, FB, Twitter, IG, TikTok from single brief', 'on-demand', 'long-sang-forge', 'src/data/mvp-agents.ts', 'gpt-4o-mini', 0.10, 'disabled'),
('Data Analyzer', 'sales-data-analyzer', 'sales', '📊', 'Analyze datasets for trends, anomalies — executive summary, key insights, recommendations', 'on-demand', 'long-sang-forge', 'src/data/mvp-agents.ts', 'gpt-4o', 0.20, 'disabled');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: ENTERTAINMENT (4 agents)
-- 1 REAL (moltbook-bot Python)
-- 3 DISABLED (docs/character bible only, no executable code)
-- ═══════════════════════════════════════════════

INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('Moltbook Social Bot', 'ent-moltbook-bot', 'entertainment', '🤖', 'Autonomous bot on Moltbook AI social network — auto-post, AI comments, strategic upvote, 24/7', 'autonomous', 'moltbook-agent', 'lyblack_agent.py', 'openai', 0.005, 'idle'),
-- ⚠️ Below 3 are reference docs (character bible, script templates, video guide) — not executable
('Lý Blạck Character', 'ent-lyblack', 'entertainment', '🎭', '1300-year-old Vietnamese poet parody — Thơ Blạck, Blạck Wisdom, Blạck Reactions', 'autonomous', 'LyBlack-Content', 'docs/02-LY-BLACK-CHARACTER-BIBLE.md', 'poppy-ai', 0.05, 'disabled'),
('LyBlack Script Generator', 'ent-script-gen', 'entertainment', '🎬', 'Generate comedy scripts in Lý Blạck voice — Poppy AI + character bible', 'on-demand', 'LyBlack-Content', 'scripts/', 'poppy-ai', 0.02, 'disabled'),
('LyBlack Video Generator', 'ent-video-gen', 'entertainment', '🎥', 'AI lipsync video generation — Higgsfield AI integration', 'on-demand', 'LyBlack-Content', 'docs/01-HIGGSFIELD-AI-TOOLS-GUIDE.md', 'higgsfield-ai', 0.10, 'disabled');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: INFRASTRUCTURE (5 agents)
-- 1 REAL (health-monitor Edge Function)
-- 2 UTILITY LIBS (analytics.ts, error-reporter.ts — not autonomous agents)
-- 2 GHOST (bug-fixer path doesn't exist, deploy-manager no code)
-- ═══════════════════════════════════════════════

INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('Health Monitor', 'infra-health-monitor', 'infrastructure', '🏥', 'Ecosystem health check — ping all products, check Edge Functions, report to Telegram', 'scheduled', 'admin', 'supabase/functions/ecosystem-health-check/index.ts', 'none', 0, 'active'),
-- ⚠️ Below are utility libraries and non-existent paths, NOT autonomous agents
('Error Reporter', 'infra-error-reporter', 'infrastructure', '🚨', 'Centralized error capture — window.onerror, unhandledrejection, optional Sentry', 'reactive', '_SHARED', 'configs/error-reporter.ts', 'none', 0, 'disabled'),
('Analytics Tracker', 'infra-analytics-tracker', 'infrastructure', '📈', 'Framework-agnostic event tracker — page views, clicks, conversions, batch flush', 'reactive', '_SHARED', 'configs/analytics.ts', 'none', 0, 'disabled'),
('Bug Fixer AI', 'infra-bug-fixer', 'infrastructure', '🔧', 'AI fix suggestions, self-healing, circuit breaker, predictive error detection', 'reactive', 'admin', 'src/lib/services/bug-system/', 'gemini-2.0-flash', 0.02, 'disabled'),
('Deploy Manager', 'infra-deploy-manager', 'infrastructure', '🚀', 'Vercel deployments via API — trigger, monitor, rollback', 'on-demand', 'admin', 'src/lib/services/', 'none', 0, 'disabled');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: OPERATIONS (1 agent)
-- Source: SABOHUB
-- ═══════════════════════════════════════════════

INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('SABOHUB AI Assistant', 'ops-sabohub-ai', 'operations', '🏢', 'Per-company AI assistant — document analysis, recommendations, chat interface', 'reactive', 'SABOHUB', 'supabase/functions/ai-chat/index.ts', 'gpt-4-turbo', 0.02, 'active');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: SPORTS (2 agents)
-- Source: Sabo Arena
-- ═══════════════════════════════════════════════

-- ⚠️ Below 2 are standard React hooks/utils, NOT autonomous agents. Disabled.
INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('Tournament Manager', 'sports-tournament-mgr', 'sports', '🏆', 'Create and manage billiards tournaments — brackets, matchmaking, results', 'reactive', 'sabo-arena', 'website-next/src/hooks/', 'none', 0, 'disabled'),
('Rankings Engine', 'sports-rankings-engine', 'sports', '🥇', 'Elo/Glicko-based player rankings calculation', 'scheduled', 'sabo-arena', 'website-next/src/lib/', 'none', 0, 'disabled');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: REAL ESTATE (3 agents)
-- Source: VT Dream Homes
-- ═══════════════════════════════════════════════

-- ⚠️ ALL 3 are GHOST — src/lib/ only has utility files, no agent code. Disabled.
INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('Property AI Chatbot', 'realestate-chatbot', 'realestate', '🏠', 'Buyer/seller AI assistant — property search, pricing guidance, market insights', 'reactive', 'vungtau-dream-homes', 'src/lib/', 'gemini-2.0-flash', 0.01, 'disabled'),
('AI Recommender', 'realestate-recommender', 'realestate', '🎯', 'Match buyers to properties based on preferences, budget, location', 'reactive', 'vungtau-dream-homes', 'src/lib/', 'gemini-2.0-flash', 0.01, 'disabled'),
('Market Analyzer', 'realestate-market-analyzer', 'realestate', '📊', 'Vũng Tàu real estate market trends, price analytics, comparables', 'scheduled', 'vungtau-dream-homes', 'src/lib/', 'gemini-2.0-flash', 0.01, 'disabled');

-- ═══════════════════════════════════════════════
-- DEPARTMENT: EDUCATION (2 agents)
-- Source: AINewbie
-- ═══════════════════════════════════════════════

-- ⚠️ Both GHOST/PLANNED — no agent code exists. Disabled.
INSERT INTO agent_registry (name, codename, department, avatar_emoji, description, type, source_project, source_file, model, cost_per_run, status) VALUES
('Curriculum Agent', 'edu-curriculum', 'education', '📚', 'Plan and generate AI education course content', 'on-demand', 'ainewbie-web', 'src/lib/', 'gemini-2.0-flash', 0.01, 'disabled'),
('Community Manager', 'edu-community-mgr', 'education', '👥', 'Manage AINewbie Telegram community — moderate, answer questions, share content', 'scheduled', 'ainewbie-web', 'planned', 'gemini-2.0-flash', 0.005, 'disabled');

-- ═══════════════════════════════════════════════
-- ORGANIZATION: Set up reporting hierarchy
-- ═══════════════════════════════════════════════

-- Content Department: All pipeline agents report to Script Writer (the conductor)
UPDATE agent_registry SET reports_to = (SELECT id FROM agent_registry WHERE codename = 'content-script-writer')
WHERE department = 'content' AND codename != 'content-script-writer';

-- Marketing Department leader: Growth Hacker
UPDATE agent_registry SET reports_to = (SELECT id FROM agent_registry WHERE codename = 'marketing-growth-hacker')
WHERE department = 'marketing' AND codename != 'marketing-growth-hacker';

-- Sales Department leader: Sales Consultant AI
UPDATE agent_registry SET reports_to = (SELECT id FROM agent_registry WHERE codename = 'sales-consultant')
WHERE department = 'sales' AND codename != 'sales-consultant';

-- ═══════════════════════════════════════════════
-- SCHEDULE: pg_cron job for daily reports
-- ═══════════════════════════════════════════════

-- Run daily at 23:00 to generate agent reports
-- NOTE: Execute this via Supabase SQL Editor (requires pg_cron extension)
-- SELECT cron.schedule('generate-agent-daily-reports', '0 23 * * *', 'SELECT generate_agent_daily_reports()');
