# 📋 BÀN GIAO SQL MIGRATIONS - PHASE 2

**Ngày bàn giao:** $(date)
**Dự án:** Long Sang Forge - AI Second Brain
**Phase:** 2 - Domain System Enhancement
**Người thực hiện:** Copilot
**Người bàn giao:** Development Team

---

## 🎯 MỤC ĐÍCH

Bàn giao 2 SQL migration files cho Phase 2 để apply vào Supabase database. Các migrations này sẽ:
1. Tạo domain statistics tracking system
2. Thêm domain agent configuration capabilities

---

## 📁 FILES CẦN APPLY

### 1. Migration 004: Domain Statistics
**File:** `supabase/migrations/brain/004_domain_statistics.sql`
**Thứ tự:** 4 (sau migration 003)
**Mục đích:** Tạo domain statistics tracking system

**Nội dung:**
- Tạo table `brain_domain_stats` với các metrics
- Tạo function `update_domain_stats()` để calculate statistics
- Tạo triggers để auto-update stats khi knowledge thay đổi
- Tạo RLS policies cho user isolation

**Risk Level:** Medium
**Estimated Time:** 10-15 minutes

### 2. Migration 005: Domain Agents
**File:** `supabase/migrations/brain/005_domain_agents.sql`
**Thứ tự:** 5 (sau migration 004)
**Mục đích:** Thêm agent configuration cho domains

**Nội dung:**
- Thêm `agent_config` JSONB column vào `brain_domains`
- Thêm agent metadata columns
- Tạo function `get_domain_agent_context()` cho agent context
- Tạo indexes cho performance

**Risk Level:** Low
**Estimated Time:** 5-10 minutes

---

## 🚀 HƯỚNG DẪN THỰC HIỆN

### Option A: Supabase CLI (Recommended)

```bash
# 1. Navigate to project
cd D:\0.PROJECTS\01-MAIN-PRODUCTS\long-sang-forge

# 2. Link to Supabase (if not already linked)
supabase link --project-ref diexsbzqwsbpilsymnfb

# 3. Push migrations
supabase db push

# 4. Verify migrations applied
supabase db diff
```

### Option B: Supabase Dashboard

1. Login vào https://supabase.com/dashboard
2. Select project: `diexsbzqwsbpilsymnfb`
3. Go to SQL Editor
4. Chạy từng file theo thứ tự:
   - Copy nội dung `004_domain_statistics.sql` → Paste → Run
   - Copy nội dung `005_domain_agents.sql` → Paste → Run

### Option C: psql Command Line

```bash
# Connect to Supabase database
psql "postgresql://postgres:[PASSWORD]@db.diexsbzqwsbpilsymnfb.supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/brain/004_domain_statistics.sql
\i supabase/migrations/brain/005_domain_agents.sql
```

---

## ✅ VERIFICATION QUERIES

Sau khi apply migrations, chạy các queries sau để verify:

### Verify Migration 004

```sql
-- 1. Check statistics table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'brain_domain_stats';
-- Expected: 1 row

-- 2. Check function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'update_domain_stats';
-- Expected: 1 row

-- 3. Check triggers exist
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%domain_stats%';
-- Expected: 2 rows (on knowledge and query_history)

-- 4. Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'brain_domain_stats';
-- Expected: rowsecurity = true
```

### Verify Migration 005

```sql
-- 1. Check agent_config column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'brain_domains'
AND column_name = 'agent_config';
-- Expected: 1 row with data_type = 'jsonb'

-- 2. Check agent metadata columns
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'brain_domains'
AND column_name LIKE 'agent_%';
-- Expected: 4 rows (agent_config, agent_last_used_at, agent_total_queries, agent_success_rate)

-- 3. Check function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_domain_agent_context';
-- Expected: 1 row

-- 4. Check index exists
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'brain_domains'
AND indexname LIKE '%agent%';
-- Expected: 1 row
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Thứ tự Migration
- **PHẢI** chạy theo thứ tự: 004 → 005
- Không được skip hoặc đảo thứ tự

### 2. Backup Database
- **Nên** backup database trước khi apply (optional nhưng recommended)
- Có thể dùng Supabase dashboard để backup

### 3. Testing
- Test trên staging environment trước
- Verify tất cả queries hoạt động
- Check performance impact

### 4. Rollback Plan
- Nếu có lỗi, có thể rollback bằng cách:
  - Drop table `brain_domain_stats` (migration 004)
  - Drop columns từ `brain_domains` (migration 005)
- **Lưu ý:** Rollback sẽ mất data, cẩn thận!

### 5. Performance
- Statistics table sẽ tự động update khi knowledge thay đổi
- Có thể có performance impact nếu có nhiều knowledge items
- Monitor query performance sau khi apply

---

## 🐛 TROUBLESHOOTING

### Lỗi: "relation brain_domains does not exist"
- **Nguyên nhân:** Migration 002 chưa được apply
- **Giải pháp:** Apply migration 002 trước

### Lỗi: "function update_domain_stats already exists"
- **Nguyên nhân:** Function đã tồn tại
- **Giải pháp:** Drop function và tạo lại, hoặc dùng `CREATE OR REPLACE`

### Lỗi: "permission denied"
- **Nguyên nhân:** User không có quyền CREATE TABLE/FUNCTION
- **Giải pháp:** Dùng service role key hoặc contact admin

### Lỗi: "column agent_config already exists"
- **Nguyên nhân:** Column đã được thêm trước đó
- **Giải pháp:** Skip migration này hoặc dùng `IF NOT EXISTS`

### Lỗi: "trigger already exists"
- **Nguyên nhân:** Trigger đã được tạo
- **Giải pháp:** Drop trigger và tạo lại, hoặc dùng `CREATE OR REPLACE`

---

## 📊 EXPECTED RESULTS

### Sau khi apply Migration 004:
- ✅ Table `brain_domain_stats` được tạo
- ✅ Function `update_domain_stats()` hoạt động
- ✅ Triggers tự động update stats
- ✅ RLS policies bảo vệ user data

### Sau khi apply Migration 005:
- ✅ Column `agent_config` được thêm vào `brain_domains`
- ✅ Agent metadata columns được thêm
- ✅ Function `get_domain_agent_context()` hoạt động
- ✅ Indexes được tạo cho performance

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check error message trong Supabase logs
2. Verify migration order
3. Check file paths đúng
4. Contact development team nếu cần

**Contact:**
- Development Team: [Contact Info]
- Supabase Support: https://supabase.com/support

---

## ✅ CHECKLIST

### Pre-Application
- [ ] Đã đọc hướng dẫn này
- [ ] Đã backup database (optional)
- [ ] Đã verify Phase 1 migrations đã apply
- [ ] Đã có quyền truy cập Supabase

### Application
- [ ] Đã apply migration 004 (Domain Statistics)
- [ ] Đã verify migration 004 thành công
- [ ] Đã apply migration 005 (Domain Agents)
- [ ] Đã verify migration 005 thành công

### Post-Application
- [ ] Đã chạy verification queries
- [ ] Đã test statistics calculation
- [ ] Đã test agent context function
- [ ] Đã check performance
- [ ] Đã báo cáo kết quả

---

## 📝 NOTES

### Migration 004 Details
- Statistics table sẽ tự động populate khi có knowledge
- Triggers sẽ update stats real-time
- Có thể manually trigger update bằng: `SELECT update_domain_stats('domain-id');`

### Migration 005 Details
- Agent config là JSONB, có thể store flexible configuration
- Default config được set trong application code
- Function `get_domain_agent_context()` cần user_id để RLS hoạt động

---

**Status:** Ready for Execution
**Priority:** High
**Estimated Total Time:** 15-25 minutes
**Risk Level:** Low-Medium

---

**Bàn giao bởi:** Development Team
**Ngày:** $(date)
**Version:** 2.0

