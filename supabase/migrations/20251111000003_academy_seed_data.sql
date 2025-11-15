-- Seed data for Academy system
-- Sample courses, instructors, and learning paths

-- Insert sample instructor
INSERT INTO instructors (id, name, title, bio, avatar_url, total_students, total_courses, average_rating)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Dr. Nguyễn Văn A', 'Senior AI Architect', 'Expert in AI/ML with 10+ years experience', 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor1', 50000, 12, 4.9);

-- Insert sample courses
INSERT INTO courses (
  id, title, subtitle, description, instructor_id, thumbnail_url, category, level,
  duration_hours, total_lessons, price, original_price, is_free, is_published, tags,
  what_you_learn, requirements, features, total_students, average_rating, total_reviews
) VALUES
(
  '00000000-0000-0000-0000-000000000101',
  'Xây dựng AI Agent với Model Context Protocol (MCP)',
  'Master modern AI agent development với cutting-edge MCP protocol',
  'Học cách tạo AI agents tùy chỉnh sử dụng MCP protocol để tích hợp automation tools',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  'AI Agents',
  'Advanced',
  8,
  24,
  1990000,
  2990000,
  false,
  true,
  ARRAY['MCP', 'AI Agents', 'Automation', 'Protocol'],
  ARRAY[
    'Hiểu sâu về Model Context Protocol và kiến trúc của nó',
    'Xây dựng custom MCP servers với 6+ automation tools',
    'Tích hợp MCP với existing AI workflows (N8N, LangChain)',
    'Implement tool calling và resource management',
    'Best practices cho production deployment',
    'Debugging và monitoring MCP agents'
  ],
  ARRAY[
    'Kiến thức cơ bản về TypeScript/JavaScript',
    'Hiểu về REST APIs và async programming',
    'Đã làm việc với OpenAI API hoặc tương tự',
    'Có máy tính với Node.js 18+ installed'
  ],
  ARRAY[
    '24 video lectures với HD quality',
    '12 coding exercises',
    '3 real-world projects',
    'Certificate of completion',
    'Lifetime access',
    'Q&A support'
  ],
  1250,
  4.9,
  156
),
(
  '00000000-0000-0000-0000-000000000102',
  'Vector Database & RAG: Từ Cơ Bản Đến Nâng Cao',
  'Mastering pgvector, embeddings, và Retrieval Augmented Generation',
  'Master pgvector, embeddings, và Retrieval Augmented Generation cho AI applications',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800',
  'AI Infrastructure',
  'Intermediate',
  6,
  18,
  1490000,
  1990000,
  false,
  true,
  ARRAY['Vector DB', 'RAG', 'pgvector', 'Embeddings'],
  ARRAY[
    'Hiểu về vector databases và use cases',
    'Setup và configure pgvector extension',
    'Generate embeddings với OpenAI',
    'Implement semantic search',
    'Build RAG systems với retrieval',
    'Optimize vector search performance'
  ],
  ARRAY[
    'PostgreSQL basics',
    'Python hoặc TypeScript',
    'Basic understanding of APIs'
  ],
  ARRAY[
    '18 video lectures',
    '8 hands-on projects',
    'Real-world RAG implementation',
    'Certificate',
    'Lifetime access'
  ],
  2100,
  4.8,
  243
),
(
  '00000000-0000-0000-0000-000000000103',
  'LangGraph Multi-Agent Orchestration',
  'Xây dựng hệ thống multi-agent phức tạp với state machines',
  'Xây dựng hệ thống multi-agent phức tạp với state machines và conditional routing',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
  'AI Orchestration',
  'Advanced',
  10,
  32,
  2490000,
  3490000,
  false,
  true,
  ARRAY['LangGraph', 'Multi-Agent', 'Workflows', 'State Machines'],
  ARRAY[
    'LangGraph architecture và concepts',
    'Build state machines for AI workflows',
    'Implement conditional routing',
    'Create specialized agents',
    'Orchestrate multi-agent systems',
    'Production deployment strategies'
  ],
  ARRAY[
    'Python hoặc TypeScript advanced',
    'Experience với AI/LLMs',
    'Understanding of state machines'
  ],
  ARRAY[
    '32 comprehensive lectures',
    '15 coding exercises',
    '5 production projects',
    'Certificate',
    'Lifetime access',
    'Community support'
  ],
  890,
  4.9,
  98
),
(
  '00000000-0000-0000-0000-000000000104',
  'Giới thiệu về AI Agents - Miễn phí',
  'Khóa học nhập môn về AI agents, automation và modern AI stack',
  'Khóa học nhập môn về AI agents, automation và modern AI stack',
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  'Introduction',
  'Beginner',
  2,
  8,
  0,
  0,
  true,
  true,
  ARRAY['Beginner', 'Free', 'Introduction', 'AI Basics'],
  ARRAY[
    'What are AI agents',
    'Modern AI stack overview',
    'OpenAI API basics',
    'Simple automation examples'
  ],
  ARRAY[
    'No prerequisites',
    'Basic computer skills'
  ],
  ARRAY[
    '8 video lectures',
    'Free forever',
    'Community access'
  ],
  5600,
  4.8,
  789
);

-- Insert sample sections and lessons for course 1
INSERT INTO course_sections (id, course_id, title, description, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Introduction to MCP', 'Learn MCP fundamentals', 1),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Building Your First Server', 'Create your first MCP server', 2);

INSERT INTO lessons (id, section_id, title, content_type, duration_minutes, is_free_preview, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'What is MCP? Architecture Overview', 'video', 15, true, 1),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', 'Setting up Development Environment', 'video', 12, true, 2),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', 'MCP Protocol Deep Dive', 'video', 20, false, 3),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', 'Server Architecture & Structure', 'video', 18, false, 1),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000202', 'Implementing Tools', 'video', 25, false, 2);

-- Insert learning path
INSERT INTO learning_paths (id, title, description, total_duration_weeks, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000401', 'AI Engineer Learning Path', 'Complete journey from beginner to production-ready AI engineer', 22, 1);

INSERT INTO learning_path_steps (id, path_id, title, description, duration_weeks, skills, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000401', 'AI Fundamentals', 'Nền tảng cơ bản về AI, Machine Learning, và OpenAI APIs', 4, ARRAY['Python Basics', 'OpenAI API', 'Prompt Engineering'], 1),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000401', 'Vector Database & RAG', 'Học cách build semantic search và retrieval systems', 3, ARRAY['pgvector', 'Embeddings', 'Semantic Search', 'RAG'], 2),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000401', 'AI Agent Development', 'Xây dựng autonomous agents với MCP và LangGraph', 6, ARRAY['MCP Protocol', 'LangGraph', 'Multi-Agent', 'Tool Calling'], 3);

-- Link courses to learning path steps
INSERT INTO learning_path_courses (step_id, course_id, order_index)
VALUES
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000104', 1),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000102', 1),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000101', 1),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000103', 2);

-- Comments
COMMENT ON TABLE instructors IS 'Sample instructor data for Academy';
COMMENT ON TABLE courses IS 'Sample courses with real Vietnamese content';
