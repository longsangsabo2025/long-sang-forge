# 📋 HƯỚNG DẪN CHO COPILOT - APPLY SQL MIGRATIONS

**Mục đích:** Apply 3 database migrations cho AI Second Brain
**Thời gian ước tính:** 15-30 phút
**Risk Level:** Low-Medium

---

## 🎯 NHIỆM VỤ

Apply 3 SQL migration files theo thứ tự để setup database cho AI Second Brain system.

---

## 📁 FILES CẦN APPLY

### 1. `supabase/migrations/brain/001_enable_pgvector.sql`
**Thứ tự:** 1 (PHẢI CHẠY ĐẦU TIÊN)
**Mục đích:** Enable pgvector extension
**Risk:** Low

### 2. `supabase/migrations/brain/002_brain_tables.sql`
**Thứ tự:** 2 (sau pgvector)
**Mục đích:** Tạo 5 tables + RLS policies + indexes
**Risk:** Medium

### 3. `supabase/migrations/brain/003_vector_search_function.sql`
**Thứ tự:** 3 (sau tables)
**Mục đích:** Tạo PostgreSQL function cho vector search
**Risk:** Low

---

## 🚀 CÁCH THỰC HIỆN

### Option A: Supabase CLI (Recommended)

```bash
# 1. Navigate to project
cd D:\0.PROJECTS\01-MAIN-PRODUCTS\long-sang-forge

# 2. Link to Supabase (if not already linked)
supabase link --project-ref diexsbzqwsbpilsymnfb

# 3. Push migrations
supabase db push

# 4. Verify
supabase db diff
```

### Option B: Supabase Dashboard

1. Login vào https://supabase.com/dashboard
2. Select project: `diexsbzqwsbpilsymnfb`
3. Go to SQL Editor
4. Chạy từng file theo thứ tự:
   - Copy nội dung file 001 → Paste → Run
   - Copy nội dung file 002 → Paste → Run
   - Copy nội dung file 003 → Paste → Run

---

## ✅ VERIFICATION

Sau khi apply, chạy các queries sau để verify:

```sql
-- 1. Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Expected: 1 row

-- 2. Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'brain_%';
-- Expected: 5 tables (domains, knowledge, core_logic, memory, query_history)

-- 3. Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'brain_%';
-- Expected: All should have rowsecurity = true

-- 4. Check function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'match_knowledge';
-- Expected: 1 row
```

---

## ⚠️ LƯU Ý

1. **Thứ tự quan trọng:** Phải chạy theo thứ tự 001 → 002 → 003
2. **Backup:** Nên backup database trước khi apply (optional)
3. **Vector Index:** Index sẽ được tạo nhưng cần data để hiệu quả
4. **RLS:** Tất cả tables đã có RLS policies, users chỉ thấy data của mình

---

## 🐛 TROUBLESHOOTING

### Lỗi: "extension vector does not exist"
- **Giải pháp:** Check Supabase project tier (pgvector có trên tất cả tiers)
- Nếu vẫn lỗi, contact Supabase support

### Lỗi: "relation already exists"
- **Giải pháp:** Tables đã tồn tại, có thể skip migration 002
- Hoặc drop tables và chạy lại (cẩn thận với data)

### Lỗi: "permission denied"
- **Giải pháp:** Check user có quyền CREATE EXTENSION và CREATE TABLE
- Dùng service role key nếu cần

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check error message trong Supabase logs
2. Verify migration order
3. Check file paths đúng
4. Contact team lead nếu cần

---

## ✅ CHECKLIST

- [ ] Đã đọc hướng dẫn này
- [ ] Đã backup database (optional)
- [ ] Đã apply migration 001 (pgvector)
- [ ] Đã verify pgvector enabled
- [ ] Đã apply migration 002 (tables)
- [ ] Đã verify tables created
- [ ] Đã apply migration 003 (function)
- [ ] Đã verify function created
- [ ] Đã test vector search function (optional)
- [ ] Đã báo cáo kết quả

---

**Status:** Ready for execution
**Priority:** High
**Estimated Time:** 15-30 minutes

