
CREATE OR REPLACE FUNCTION hybrid_search_knowledge
(
    query_text TEXT,
    query_embedding vector
(1536),
    match_count INT DEFAULT 10,
    semantic_weight FLOAT DEFAULT 0.7,
    keyword_weight FLOAT DEFAULT 0.3,
    filter_user_id TEXT DEFAULT NULL,
    filter_category TEXT DEFAULT NULL
  )
  RETURNS TABLE
(
    id UUID,
    title TEXT,
    content TEXT,
    context_prefix TEXT,
    category TEXT,
    tags TEXT[],
    metadata JSONB,
    similarity FLOAT,
    keyword_rank FLOAT,
    combined_score FLOAT
  )
  LANGUAGE plpgsql
  AS $$
BEGIN
  RETURN QUERY
  WITH
    semantic_results
    AS
    (
      SELECT
        kb.id,
        kb.title,
        kb.content,
        kb.context_prefix,
        kb.category,
        kb.tags,
        kb.metadata,
        1 - (kb.embedding <=> query_embedding) as similarity,
        0
    ::float as keyword_rank
      FROM knowledge_base kb
      WHERE kb.is_active = true
        AND
  (filter_user_id IS NULL OR kb.user_id = filter_user_id)
        AND
  (filter_category IS NULL OR kb.category = filter_category)
      ORDER BY kb.embedding <=> query_embedding
      LIMIT match_count * 3
    ),
    keyword_results AS
  (
      SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.context_prefix,
    kb.category,
    kb.tags,
    kb.metadata,
    0
  ::float as similarity,
        ts_rank_cd
  (kb.search_vector, plainto_tsquery
  ('english', query_text)) as keyword_rank
      FROM knowledge_base kb
      WHERE kb.is_active = true
        AND kb.search_vector @@ plainto_tsquery
  ('english', query_text)
        AND
  (filter_user_id IS NULL OR kb.user_id = filter_user_id)
        AND
  (filter_category IS NULL OR kb.category = filter_category)
      ORDER BY keyword_rank DESC
      LIMIT match_count * 3
    ),
    combined AS
  (
      SELECT
    COALESCE(s.id, k.id) as id,
    COALESCE(s.title, k.title) as title,
    COALESCE(s.content, k.content) as content,
    COALESCE(s.context_prefix, k.context_prefix) as context_prefix,
    COALESCE(s.category, k.category) as category,
    COALESCE(s.tags, k.tags) as tags,
    COALESCE(s.metadata, k.metadata) as metadata,
    COALESCE(s.similarity, 0) as similarity,
    COALESCE(k.keyword_rank, 0) as keyword_rank,
    (COALESCE(s.similarity, 0) * semantic_weight +
         COALESCE(k.keyword_rank, 0) * keyword_weight) as combined_score
  FROM semantic_results s
    FULL OUTER JOIN keyword_results k ON s.id = k.id
    )
  SELECT *
  FROM combined
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
  $$;
