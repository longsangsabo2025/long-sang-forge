-- Complete AI Features Database Migration
-- Tables for Vector DB, LangGraph, Streaming Chat, Multimodal

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Base table (Vector Store + RAG)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536), -- text-embedding-3-small dimensions
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
  ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata ON knowledge_base USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source ON knowledge_base(source);

-- RPC function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5,
  filter jsonb DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE
    (filter = '{}' OR kb.metadata @> filter)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Agent State table (LangGraph workflows)
CREATE TABLE IF NOT EXISTS agent_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  task TEXT NOT NULL,
  current_step TEXT,
  completed_steps TEXT[] DEFAULT '{}',
  state_data JSONB NOT NULL DEFAULT '{}',
  output TEXT,
  error TEXT,
  status TEXT DEFAULT 'running', -- running, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_state_workflow ON agent_state(workflow_id);
CREATE INDEX IF NOT EXISTS idx_agent_state_status ON agent_state(status);
CREATE INDEX IF NOT EXISTS idx_agent_state_created ON agent_state(created_at DESC);

-- Chat Sessions table (Streaming Chat)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  system_prompt TEXT,
  use_rag BOOLEAN DEFAULT false,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);

-- Multimodal Files table (Vision, Audio, Image Generation)
CREATE TABLE IF NOT EXISTS multimodal_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_type TEXT NOT NULL, -- image, audio, video
  file_url TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  file_size INTEGER,
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_multimodal_files_type ON multimodal_files(file_type);
CREATE INDEX IF NOT EXISTS idx_multimodal_files_created ON multimodal_files(created_at DESC);

-- RLS policies for knowledge_base
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read knowledge_base"
  ON knowledge_base FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage knowledge_base"
  ON knowledge_base FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS policies for agent_state
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read agent_state"
  ON agent_state FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage agent_state"
  ON agent_state FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all chat sessions"
  ON chat_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS policies for multimodal_files
ALTER TABLE multimodal_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read multimodal_files"
  ON multimodal_files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert multimodal_files"
  ON multimodal_files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage multimodal_files"
  ON multimodal_files FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON knowledge_base TO authenticated;
GRANT ALL ON knowledge_base TO service_role;

GRANT SELECT ON agent_state TO authenticated;
GRANT ALL ON agent_state TO service_role;

GRANT SELECT, INSERT, UPDATE ON chat_sessions TO authenticated;
GRANT ALL ON chat_sessions TO service_role;

GRANT SELECT, INSERT ON multimodal_files TO authenticated;
GRANT ALL ON multimodal_files TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION match_documents TO authenticated, service_role;

-- Comments
COMMENT ON TABLE knowledge_base IS 'Vector store for RAG - stores documents with embeddings';
COMMENT ON TABLE agent_state IS 'LangGraph workflow state management';
COMMENT ON TABLE chat_sessions IS 'Streaming chat conversation history';
COMMENT ON TABLE multimodal_files IS 'Multimodal AI file storage and analysis';
COMMENT ON FUNCTION match_documents IS 'Semantic similarity search using pgvector';
