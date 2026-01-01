# 👥 CẤP QUYỀN CHO NHÂN VIÊN - HƯỚNG DẪN NHANH

**Date:** 2025-01-29
**Elon Musk Style:** Simple, Fast, Works

---

## 🎯 CÁCH ĐƠN GIẢN NHẤT (2 PHÚT)

### Cách 1: Qua Supabase Dashboard ⚡

1. **Vào Supabase Dashboard**
   - https://supabase.com/dashboard
   - Chọn project của bạn
   - Click **Authentication** → **Users**

2. **Tìm user (nhân viên)**
   - Search bằng email
   - Click vào user đó

3. **Sửa User Metadata**
   - Scroll xuống phần **Raw User Meta Data**
   - Click **Edit**
   - Thêm hoặc sửa:

```json
{
  "role": "staff",
  "permissions": [
    "/admin/ideas",
    "/admin/content-queue",
    "/admin/seo-center"
  ]
}
```

4. **Save**

5. **User cần logout và login lại**

---

## 🚀 CÁCH 2: Qua Script (1 phút)

**Sử dụng script đã tạo:**

```bash
# Set role với permissions mặc định
npm run employee:set-role -- nhanvien@example.com staff

# Set role với permissions tùy chỉnh
npm run employee:set-role -- nhanvien@example.com staff --features /admin/ideas,/admin/content-queue
```

**Roles có sẵn:**
- `admin` - Full access
- `staff` - Limited access (Ideas, Content, SEO, Courses)
- `editor` - Content only
- `marketer` - Marketing features

---

## 📋 PERMISSIONS CÓ SẴN

### Role: `staff` (Mặc định)

**Có quyền:**
- ✅ `/admin/ideas` - Ideas & Planning
- ✅ `/admin/content-queue` - Content management
- ✅ `/admin/seo-center` - SEO tools
- ✅ `/admin/courses` - Course management
- ✅ `/admin/consultations` - Consultations

**Không có:**
- ❌ `/admin/users` - User management
- ❌ `/admin/settings` - System settings
- ❌ `/admin/analytics` - Full analytics

---

## 🔧 CẦN UPDATE CODE KHÔNG?

### Option A: Quick Fix (Cho phép staff role)

**Update AdminRoute để allow staff:**

```typescript
// src/components/auth/AdminRoute.tsx
const userRole = user?.user_metadata?.role as string | undefined;
const isAdmin = userRole === "admin";
const isStaff = userRole === "staff"; // Add this

if (!isAdmin && !isStaff) {
  return <Navigate to="/dashboard" replace />;
}
```

**→ Nếu làm vậy, staff sẽ có FULL admin access (tất cả features)**

### Option B: Feature-Based (Recommended)

**Dùng FeatureRoute để check permissions** (đã tạo component)

**Wrap routes:**

```typescript
// App.tsx
<Route
  path="/admin/ideas"
  element={
    <AdminRoute>
      <FeatureRoute requiredFeature="/admin/ideas" allowedRoles={['admin', 'staff']}>
        <AdminIdeas />
      </FeatureRoute>
    </AdminRoute>
  }
/>
```

**→ Staff chỉ có quyền truy cập features được cấp**

---

## ✅ RECOMMENDED APPROACH

### **Nếu đang vội (Ship fast):**

1. ✅ **Set role qua Supabase Dashboard** (2 phút)
2. ✅ **Update AdminRoute để allow staff role** (5 phút)
3. ✅ **Done!** Staff có full admin access

### **Nếu muốn kiểm soát tốt hơn:**

1. ✅ Set role qua Supabase
2. ✅ Wrap routes với FeatureRoute
3. ✅ Staff chỉ có quyền theo permissions

---

## 📝 VÍ DỤ CỤ THỂ

### Cấp quyền cho nhân viên A:

**Email:** `nhanvien@example.com`
**Cần quyền:** Ideas, Content Queue, SEO

**Cách làm:**

1. Vào Supabase Dashboard
2. Tìm user `nhanvien@example.com`
3. Edit User Metadata:

```json
{
  "role": "staff",
  "permissions": [
    "/admin/ideas",
    "/admin/content-queue",
    "/admin/seo-center"
  ]
}
```

4. Save
5. User logout/login lại

---

## 🎯 NEXT STEPS

1. **Hôm nay:** Set role cho nhân viên qua Supabase
2. **Tuần này:** Update AdminRoute hoặc wrap routes với FeatureRoute
3. **Sau này:** Thêm UI trong AdminUsers để cấp quyền

---

**Status:** ✅ Ready to use
**Time:** 2 phút
**Difficulty:** ⭐ Easy

---

**Created:** 2025-01-29


