# 👥 CẤP QUYỀN CHO NHÂN VIÊN - CÁCH ĐƠN GIẢN NHẤT

**Date:** 2025-01-29
**Time:** 2 phút ⚡

---

## 🎯 CÁCH LÀM (2 PHÚT)

### Bước 1: Vào Supabase Dashboard

1. Vào: https://supabase.com/dashboard
2. Chọn project của bạn
3. Click **Authentication** → **Users**

### Bước 2: Tìm và Edit User

1. Search email của nhân viên
2. Click vào user đó
3. Scroll xuống phần **Raw User Meta Data**
4. Click **Edit**

### Bước 3: Thêm Role & Permissions

Paste vào:

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

### Bước 4: Save

Click **Save** → Done!

### Bước 5: Nhân viên logout/login lại

---

## 📋 PERMISSIONS CÓ SẴN

Bạn có thể cấp các permissions này:

- `/admin/ideas` - Ideas & Planning
- `/admin/content-queue` - Content Queue
- `/admin/seo-center` - SEO Center
- `/admin/courses` - Course Management
- `/admin/consultations` - Consultations
- `/admin/projects` - Projects
- `/admin/social-media` - Social Media
- `/admin/analytics` - Analytics (read-only)

---

## 🚀 ROLE TEMPLATES

### Role: `staff`

```json
{
  "role": "staff",
  "permissions": [
    "/admin/ideas",
    "/admin/content-queue",
    "/admin/seo-center",
    "/admin/courses"
  ]
}
```

### Role: `editor`

```json
{
  "role": "editor",
  "permissions": [
    "/admin/content-queue",
    "/admin/courses",
    "/admin/ideas"
  ]
}
```

### Role: `marketer`

```json
{
  "role": "marketer",
  "permissions": [
    "/admin/seo-center",
    "/admin/content-queue",
    "/admin/social-media",
    "/admin/projects"
  ]
}
```

---

## ✅ DONE!

Sau khi set role:
- User cần logout và login lại
- User sẽ có quyền truy cập các features được cấp

---

**Next:** Nếu bạn muốn hệ thống check permissions tự động, cần update code. Nhưng cách trên đã hoạt động!


