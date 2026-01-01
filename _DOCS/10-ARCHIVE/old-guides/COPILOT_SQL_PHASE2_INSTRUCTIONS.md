# 📋 HƯỚNG DẪN CHO COPILOT - APPLY SQL MIGRATIONS PHASE 2

**Mục đích:** Apply 2 database migrations cho AI Second Brain Phase 2
**Thời gian ước tính:** 15-25 phút
**Risk Level:** Low-Medium

---

## 🎯 NHIỆM VỤ

Apply 2 SQL migration files theo thứ tự để setup domain statistics và agent configuration cho Phase 2.

---

## 📁 FILES CẦN APPLY

### 1. `supabase/migrations/brain/004_domain_statistics.sql`
**Thứ tự:** 4 (sau Phase 1 migrations)
**Mục đích:** Tạo domain statistics tracking system
**Risk:** Medium

### 2. `supabase/migrations/brain/005_domain_agents.sql`
**Thứ tự:** 5 (sau migration 004)
**Mục đích:** Thêm agent configuration cho domains
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
   - Copy nội dung file 004 → Paste → Run
   - Copy nội dung file 005 → Paste → Run

---

## ✅ VERIFICATION

Sau khi apply, chạy các queries sau để verify:

```sql
-- Verify Migration 004
SELECT table_name FROM information_schema.tables
WHERE table_name = 'brain_domain_stats';
-- Expected: 1 row

SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'update_domain_stats';
-- Expected: 1 row

-- Verify Migration 005
SELECT column_name FROM information_schema.columns
WHERE table_name = 'brain_domains' AND column_name = 'agent_config';
-- Expected: 1 row

SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'get_domain_agent_context';
-- Expected: 1 row
```

---

## ⚠️ LƯU Ý

1. **Thứ tự quan trọng:** Phải chạy theo thứ tự 004 → 005
2. **Backup:** Nên backup database trước khi apply (optional)
3. **Phase 1:** Đảm bảo Phase 1 migrations đã được apply
4. **Performance:** Statistics sẽ tự động update, có thể có impact nếu nhiều data

---

## 🐛 TROUBLESHOOTING

### Lỗi: "relation brain_domains does not exist"
- **Giải pháp:** Apply Phase 1 migrations trước

### Lỗi: "function already exists"
- **Giải pháp:** Dùng `CREATE OR REPLACE` hoặc drop function trước

### Lỗi: "permission denied"
- **Giải pháp:** Check user có quyền CREATE TABLE/FUNCTION
- Dùng service role key nếu cần

---

## ✅ CHECKLIST

- [ ] Đã đọc hướng dẫn này
- [ ] Đã verify Phase 1 migrations đã apply
- [ ] Đã backup database (optional)
- [ ] Đã apply migration 004
- [ ] Đã verify migration 004
- [ ] Đã apply migration 005
- [ ] Đã verify migration 005
- [ ] Đã test statistics calculation
- [ ] Đã báo cáo kết quả

---

**Status:** Ready for execution
**Priority:** High
**Estimated Time:** 15-25 minutes

