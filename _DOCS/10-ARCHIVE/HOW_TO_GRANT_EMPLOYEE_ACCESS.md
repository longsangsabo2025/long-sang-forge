# 👥 CẤP QUYỀN CHO NHÂN VIÊN - HƯỚNG DẪN THỰC TẾ

**Date:** 2025-01-29
**Elon Musk Style:** Simple, Fast, Effective

---

## 🎯 GOAL

Cấp quyền cho nhân viên truy cập một số tính năng admin (không phải tất cả).

---

## 🧠 FIRST PRINCIPLES ANALYSIS

**Vấn đề hiện tại:**
- Hệ thống chỉ có 2 levels: `admin` hoặc không
- Tất cả admin = full access
- Không có phân quyền theo feature

**Giải pháp:**
1. ✅ **Quick fix** - Dùng role trong user_metadata
2. ✅ **Check permissions** - FeatureRoute component
3. ✅ **Set permissions** - Qua UI hoặc script

---

## ⚡ SOLUTION - 3 CÁCH ĐƠN GIẢN

### Cách 1: QUA SUPABASE DASHBOARD (Nhanh nhất - 2 phút)

**Bước 1:** Vào Supabase Dashboard
- https://supabase.com/dashboard
- Chọn project
- **Authentication** → **Users**

**Bước 2:** Tìm user (nhân viên)
- Search bằng email
- Click vào user

**Bước 3:** Sửa User Metadata
- Scroll xuống **Raw User Meta Data**
- Click **Edit**

**Bước 4:** Thêm role và permissions

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

**Bước 5:** Save
- User cần logout và login lại để có hiệu lực

---

### Cách 2: QUA SCRIPT (Recommended - 1 phút)

**Đã tạo script:** `scripts/set-employee-role.ts`

**Sử dụng:**

```bash
# Set role với permissions mặc định
npm run employee:set-role -- nhanvien@example.com staff

# Set role với permissions tùy chỉnh
npm run employee:set-role -- nhanvien@example.com staff --features /admin/ideas,/admin/content-queue,/admin/seo-center
```

**Roles có sẵn:**
- `admin` - Full access
- `staff` - Limited access (Ideas, Content, SEO, Courses)
- `editor` - Content only
- `marketer` - Marketing features
- `viewer` - Read only

---

### Cách 3: QUA ADMIN UI (Best UX - Cần implement)

**Tích hợp vào AdminUsers page** - Có thể làm sau.

---

## 📋 ROLE TEMPLATES

### Role: `staff` (Nhân viên)

**Permissions mặc định:**
- ✅ `/admin/ideas` - Ideas & Planning
- ✅ `/admin/content-queue` - Content management
- ✅ `/admin/seo-center` - SEO tools
- ✅ `/admin/courses` - Course management
- ✅ `/admin/consultations` - Consultations

**Không có:**
- ❌ `/admin/users` - User management
- ❌ `/admin/settings` - System settings

### Role: `editor` (Editor/Writer)

**Permissions:**
- ✅ `/admin/content-queue`
- ✅ `/admin/courses`
- ✅ `/admin/ideas`

### Role: `marketer` (Marketing)

**Permissions:**
- ✅ `/admin/seo-center`
- ✅ `/admin/content-queue`
- ✅ `/admin/social-media`
- ✅ `/admin/projects`

---

## 🔧 IMPLEMENTATION - TẠO FEATUREROUTE

**Hiện tại:** AdminRoute chỉ check `role === "admin"`

**Cần:** FeatureRoute để check permissions

### Step 1: Tạo FeatureRoute Component

**File:** `src/components/auth/FeatureRoute.tsx`

```typescript
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface FeatureRouteProps {
  children: ReactNode;
  requiredFeature?: string;
  allowedRoles?: string[];
}

export function FeatureRoute({
  children,
  requiredFeature,
  allowedRoles = ['admin']
}: FeatureRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.user_metadata?.role as string;
  const userPermissions = user?.user_metadata?.permissions as string[] || [];

  // Admin has full access
  if (userRole === 'admin') {
    return <>{children}</>;
  }

  // Check role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check feature permission
  if (requiredFeature) {
    const hasPermission =
      userPermissions.includes(requiredFeature) ||
      userPermissions.includes('*');

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
```

### Step 2: Wrap Routes với FeatureRoute

**File:** `src/App.tsx`

```typescript
import { FeatureRoute } from "./components/auth/FeatureRoute";

// Ví dụ: Ideas route
<Route
  path="/admin/ideas"
  element={
    <AdminRoute>
      <FeatureRoute
        requiredFeature="/admin/ideas"
        allowedRoles={['admin', 'staff', 'editor']}
      >
        <AdminIdeas />
      </FeatureRoute>
    </AdminRoute>
  }
/>

// Ví dụ: Users route - chỉ admin
<Route
  path="/admin/users"
  element={
    <AdminRoute>
      <FeatureRoute allowedRoles={['admin']}>
        <AdminUsers />
      </FeatureRoute>
    </AdminRoute>
  }
/>
```

---

## 🚀 QUICK START - SHIP IT!

### Option A: Quick Fix (30 phút)

1. ✅ **Set role cho nhân viên qua Supabase Dashboard** (2 phút)
2. ✅ **Tạo FeatureRoute component** (10 phút)
3. ✅ **Wrap 5-10 routes quan trọng** (15 phút)
4. ✅ **Test** (3 phút)

### Option B: Full Implementation (2 giờ)

1. ✅ Tất cả như Option A
2. ✅ Wrap tất cả routes
3. ✅ Thêm UI trong AdminUsers
4. ✅ Test đầy đủ

---

## 📊 PERMISSION STRUCTURE

```typescript
// User metadata structure
{
  "role": "staff",  // admin | staff | editor | marketer | viewer
  "permissions": [  // Array of feature paths
    "/admin/ideas",
    "/admin/content-queue",
    "/admin/seo-center"
  ]
}
```

---

## ✅ STEP-BY-STEP HƯỚNG DẪN

### Bước 1: Cấp quyền cho nhân viên

**Cách đơn giản nhất:**

1. Vào **Supabase Dashboard**
2. **Authentication** → **Users**
3. Tìm user (nhân viên)
4. Click **Edit User**
5. **Raw User Meta Data** → Thêm:

```json
{
  "role": "staff",
  "permissions": ["/admin/ideas", "/admin/content-queue"]
}
```

6. **Save**
7. User logout/login lại

### Bước 2: Implement FeatureRoute (nếu cần)

Nếu bạn muốn hệ thống check permissions tự động, cần:
1. Tạo FeatureRoute component
2. Wrap routes
3. Test

---

## 🎯 RECOMMENDED APPROACH

### **Nếu đang vội (Ship fast):**

1. ✅ **Set role qua Supabase** - 2 phút
2. ✅ **Update AdminRoute** để allow `staff` role - 5 phút
3. ✅ **Manual check permissions trong từng page** - 30 phút

### **Nếu có thời gian (Do it right):**

1. ✅ Implement FeatureRoute
2. ✅ Wrap tất cả routes
3. ✅ Add UI trong AdminUsers

---

## 💡 ELON MUSK STYLE

> "Perfect is the enemy of good. Ship first, optimize later."

**Translation:**
- Set role qua Supabase → Ship ngay
- FeatureRoute component → Làm sau (nếu cần)

---

**TL;DR:**

1. **Vào Supabase Dashboard**
2. **Tìm user (nhân viên)**
3. **Edit User Metadata:**
   ```json
   {
     "role": "staff",
     "permissions": ["/admin/ideas", "/admin/content-queue"]
   }
   ```
4. **Save**
5. **Done!**

**Time:** 2 phút ⚡

---

**Created:** 2025-01-29
**Status:** ✅ Ready to use
**Next:** Set role cho nhân viên ngay!
