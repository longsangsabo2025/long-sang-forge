# Admin Edit Tool - Hướng dẫn sử dụng

## Tổng quan

Admin Edit Tool là một công cụ cho phép admin chỉnh sửa nội dung (ảnh, text, link) trực tiếp trên giao diện website mà không cần vào code hay file manager.

## Cài đặt

Tool đã được tích hợp sẵn trong project. Import từ `@/components/admin`:

```tsx
import {
  AdminEditProvider,
  EditableImage,
  EditableText,
  EditableLink,
  useAdminEdit,
} from "@/components/admin";
```

## Cách sử dụng

### 1. Wrap trang với AdminEditProvider

```tsx
const MyPage = () => {
  return (
    <AdminEditProvider
      pageId="my-page-id" // ID duy nhất cho trang (bắt buộc)
      storageBucket="showcase-assets" // Bucket Supabase để upload ảnh (mặc định)
      adminEmails={["admin@email.com"]} // Danh sách email admin (tùy chọn)
    >
      {/* Nội dung trang */}
    </AdminEditProvider>
  );
};
```

### 2. Sử dụng EditableImage cho ảnh

```tsx
<EditableImage
  imageKey="hero-banner" // Key duy nhất cho ảnh này
  defaultSrc="/images/hero.jpg" // Ảnh mặc định
  alt="Hero Banner" // Alt text
  className="w-full h-auto" // CSS classes
/>
```

### 3. Sử dụng EditableText cho văn bản

```tsx
<EditableText
  textKey="page-title" // Key duy nhất cho text này
  defaultText="Tiêu đề trang" // Text mặc định
  as="h1" // Tag HTML (h1, h2, p, span, div...)
  className="text-4xl font-bold" // CSS classes
  multiline={false} // true = textarea, false = input
/>
```

### 4. Sử dụng EditableLink cho liên kết

```tsx
<EditableLink
  linkKey="cta-button" // Key duy nhất
  defaultHref="/contact" // URL mặc định
  defaultText="Liên hệ ngay" // Text mặc định
  className="btn btn-primary" // CSS classes
/>
```

### 5. Sử dụng hook useAdminEdit cho custom logic

```tsx
const MyComponent = () => {
  const {
    isEditMode, // boolean - đang ở edit mode không
    isAdmin, // boolean - có phải admin không
    getText, // (key, default) => string
    setText, // (key, value) => void
    getImage, // (key, default) => string
    setImage, // (key, url) => void
    uploadImage, // (key, file) => Promise<string|null>
  } = useAdminEdit();

  return (
    <div>
      {isEditMode && <span>Đang ở chế độ edit</span>}
      <p>{getText("custom-text", "Default text")}</p>
    </div>
  );
};
```

## Tính năng

### Floating Toolbar

- Nút "Edit Mode" xuất hiện góc phải dưới cho admin
- Trong edit mode: có nút Reset, Save, Done

### Edit Mode Indicator

- Banner thông báo ở trên cùng khi đang edit mode

### Auto-save

- Tự động lưu khi thoát edit mode

### Upload ảnh

- Upload lên Supabase Storage
- Fallback về blob URL nếu upload lỗi
- Max size: 10MB

### Persistence

- Lưu vào localStorage với key: `admin_edit_{pageId}`
- Data persist qua các session

## Ví dụ hoàn chỉnh

```tsx
import { AdminEditProvider, EditableImage, EditableText } from "@/components/admin";

const LandingPage = () => {
  return (
    <AdminEditProvider pageId="landing-page">
      <header>
        <EditableImage imageKey="logo" defaultSrc="/logo.png" alt="Logo" className="h-12" />
        <EditableText
          textKey="tagline"
          defaultText="Welcome to our website"
          as="h1"
          className="text-2xl"
        />
      </header>

      <main>
        <section>
          <EditableImage imageKey="hero" defaultSrc="/hero.jpg" alt="Hero" className="w-full" />
          <EditableText
            textKey="description"
            defaultText="This is our amazing product."
            as="p"
            multiline
            className="text-lg"
          />
        </section>
      </main>
    </AdminEditProvider>
  );
};

export default LandingPage;
```

## Các trang đã áp dụng

1. **SABO Arena** (`/sabo-arena-billiards-platform`)
   - pageId: `sabo-arena`
   - Ảnh: hero, features, screenshots, download

## Thêm admin mới

Thêm email vào prop `adminEmails` hoặc set `role: "admin"` trong user metadata của Supabase.

## Lưu ý

1. Mỗi `imageKey` và `textKey` phải unique trong cùng một page
2. Data được lưu riêng cho mỗi `pageId`
3. Ảnh được upload vào folder `{pageId}/` trong storage bucket
4. Chỉ admin mới thấy nút Edit Mode
