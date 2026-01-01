# 🗄️ SQL MIGRATIONS HANDOFF - AI SECOND BRAIN

**Dành cho:** Copilot / Database Admin
**Mục đích:** Hướng dẫn apply database migrations cho AI Second Brain
**Ngày:** $(date)

---

## 📋 TỔNG QUAN

Có **3 migration files** cần được apply theo thứ tự để setup database cho AI Second Brain.

**Location:** `supabase/migrations/brain/`

---

## 📁 MIGRATION FILES

### 1. 001_enable_pgvector.sql
**Mục đích:** Enable pgvector extension
**Thứ tự:** 1 (phải chạy đầu tiên)
**Risk:** Low - chỉ enable extension

**Nội dung:**
- Enable `vector` extension
- Verify extension installation
- Log success

**Cách chạy:**
```sql
-- Chạy trực tiếp trong Supabase SQL Editor
-- Hoặc qua Supabase CLI:
supabase db push
```

**Verification:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Should return 1 row
```

---

### 2. 002_brain_tables.sql
**Mục đích:** Tạo tất cả brain tables
**Thứ tự:** 2 (sau pgvector)
**Risk:** Medium - tạo nhiều tables và policies

**Tables được tạo:**
1. `brain_domains` - Domains management
2. `brain_knowledge` - Knowledge storage với embeddings
3. `brain_core_logic` - Core Logic (cho Phase 3)
4. `brain_memory` - Memory system (cho Phase 5)
5. `brain_query_history` - Query tracking

**Features:**
- RLS policies cho user isolation
- Indexes cho performance
- Vector index cho similarity search
- Triggers cho updated_at

**Cách chạy:**
```sql
-- Chạy trong Supabase SQL Editor
-- Hoặc:
supabase db push
```

**Verification:**
```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'brain_%';

-- Should return 5 tables:
-- brain_domains
-- brain_knowledge
-- brain_core_logic
-- brain_memory
-- brain_query_history

-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'brain_%';

-- All should have rowsecurity = true
```

**Lưu ý:**
- Migration này tạo vector index với `ivfflat` - cần có data trước khi index hiệu quả
- Nếu có lỗi về vector index, có thể comment out và tạo sau

---

### 3. 003_vector_search_function.sql
**Mục đích:** Tạo PostgreSQL function cho vector search
**Thứ tự:** 3 (sau tables)
**Risk:** Low - chỉ tạo function

**Function:** `match_knowledge()`

**Parameters:**
- `query_embedding` (vector(1536)) - Query embedding vector
- `match_threshold` (float) - Minimum similarity (0-1), default 0.7
- `match_count` (int) - Max results, default 10
- `domain_ids` (uuid[]) - Optional domain filter
- `user_id_filter` (uuid) - Optional user filter

**Returns:** Table với columns:
- id, domain_id, title, content, content_type, source_url, tags, similarity, metadata, created_at

**Cách chạy:**
```sql
-- Chạy trong Supabase SQL Editor
-- Hoặc:
supabase db push
```

**Verification:**
```sql
-- Check function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'match_knowledge';

-- Should return 1 row

-- Test function (cần có data trước)
-- Note: Cần embedding vector 1536 dimensions để test
```

---

## 🚀 QUY TRÌNH APPLY MIGRATIONS

### Option 1: Supabase CLI (Recommended)

```bash
# 1. Navigate to project root
cd /path/to/long-sang-forge

# 2. Link to Supabase project (if not already)
supabase link --project-ref YOUR_PROJECT_REF

# 3. Push all migrations
supabase db push

# 4. Verify
supabase db diff
```

### Option 2: Supabase Dashboard

1. Login vào Supabase Dashboard
2. Navigate to SQL Editor
3. Chạy từng file theo thứ tự:
   - Copy content từ `001_enable_pgvector.sql`
   - Paste vào SQL Editor
   - Click "Run"
   - Repeat cho file 2 và 3

### Option 3: Manual SQL Execution

1. Mở Supabase SQL Editor
2. Chạy từng migration file theo thứ tự
3. Verify sau mỗi step

---

## ✅ VERIFICATION CHECKLIST

Sau khi apply migrations, verify:

- [ ] pgvector extension enabled
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'vector';
  ```

- [ ] All tables created
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name LIKE 'brain_%';
  ```

- [ ] RLS policies enabled
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables
  WHERE schemaname = 'public' AND tablename LIKE 'brain_%';
  ```

- [ ] Vector index created
  ```sql
  SELECT indexname FROM pg_indexes
  WHERE tablename = 'brain_knowledge' AND indexname LIKE '%embedding%';
  ```

- [ ] Function created
  ```sql
  SELECT routine_name FROM information_schema.routines
  WHERE routine_schema = 'public' AND routine_name = 'match_knowledge';
  ```

- [ ] Permissions granted
  ```sql
  SELECT grantee, privilege_type
  FROM information_schema.role_table_grants
  WHERE table_name LIKE 'brain_%';
  ```

---

## 🔧 TROUBLESHOOTING

### Issue: pgvector extension not available
**Solution:**
- Check Supabase project tier (pgvector available on all tiers)
- Contact Supabase support if needed
- Alternative: Use Supabase's built-in vector support

### Issue: Vector index creation fails
**Solution:**
- Index requires data to be effective
- Can create index after data is loaded
- Or use `CREATE INDEX CONCURRENTLY` for large tables

### Issue: RLS policies blocking access
**Solution:**
- Verify user is authenticated
- Check `auth.uid()` returns correct user ID
- Test with service role key (bypass RLS)

### Issue: Function permission denied
**Solution:**
- Grant execute permission:
  ```sql
  GRANT EXECUTE ON FUNCTION match_knowledge TO authenticated;
  GRANT EXECUTE ON FUNCTION match_knowledge TO anon;
  ```

---

## 📝 POST-MIGRATION STEPS

Sau khi migrations applied:

1. **Test Vector Search**
   ```sql
   -- Insert test knowledge với embedding
   -- Then test search function
   ```

2. **Verify RLS**
   - Create test user
   - Test domain CRUD
   - Verify user isolation

3. **Check Performance**
   - Test vector search speed
   - Monitor index usage
   - Optimize if needed

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check error messages trong Supabase logs
2. Verify migration order
3. Check Supabase documentation
4. Contact team lead

---

## ✅ MIGRATION CHECKLIST

- [ ] Backup database trước khi apply
- [ ] Apply migration 001 (pgvector)
- [ ] Verify pgvector enabled
- [ ] Apply migration 002 (tables)
- [ ] Verify tables created
- [ ] Verify RLS policies
- [ ] Apply migration 003 (function)
- [ ] Verify function created
- [ ] Test vector search function
- [ ] Document any issues

---

**Handoff completed by:** AI Assistant
**Date:** $(date)
**Status:** Ready for execution

