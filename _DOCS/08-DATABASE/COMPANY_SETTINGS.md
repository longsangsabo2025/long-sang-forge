# 🏢 Company Settings - Hướng dẫn sử dụng

## Tổng quan

Bảng `company_settings` lưu trữ thông tin động của công ty, được AI Chatbot query real-time khi trả lời khách hàng.

## Cấu trúc bảng

```sql
company_settings (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,      -- Định danh unique cho setting
  value JSONB NOT NULL,          -- Dữ liệu dạng JSON
  category TEXT NOT NULL,        -- Phân loại setting
  description TEXT,              -- Mô tả
  is_public BOOLEAN DEFAULT true,-- Có hiển thị cho public không
  updated_at TIMESTAMPTZ,        -- Thời gian cập nhật cuối
  updated_by UUID                -- Ai cập nhật
)
```

## Danh sách Settings hiện có

### 1. Contact (Thông tin liên hệ)

| Key               | Mô tả               |
| ----------------- | ------------------- |
| `contact_email`   | Email liên hệ chính |
| `contact_phone`   | Số điện thoại, Zalo |
| `contact_address` | Địa chỉ công ty     |

### 2. Pricing (Bảng giá dịch vụ)

| Key                        | Dịch vụ                          |
| -------------------------- | -------------------------------- |
| `pricing_landing_page`     | Landing Page: 3-5 triệu          |
| `pricing_business_website` | Website Doanh nghiệp: 8-15 triệu |
| `pricing_ecommerce`        | E-commerce: 15-30 triệu          |
| `pricing_mobile_app`       | Mobile App: 30-100 triệu         |
| `pricing_ai_chatbot`       | AI Chatbot: 5-20 triệu           |
| `pricing_second_brain`     | Second Brain: 99k-499k/tháng     |

### 3. Promotion (Khuyến mãi)

| Key                 | Mô tả                  |
| ------------------- | ---------------------- |
| `current_promotion` | Khuyến mãi đang active |

### 4. Company (Thông tin công ty)

| Key            | Mô tả                                     |
| -------------- | ----------------------------------------- |
| `company_info` | Tên, tagline, năm thành lập, team size... |

### 5. Operations (Vận hành)

| Key             | Mô tả        |
| --------------- | ------------ |
| `working_hours` | Giờ làm việc |

### 6. Payment (Thanh toán)

| Key              | Mô tả                 |
| ---------------- | --------------------- |
| `payment_bank`   | Thông tin ngân hàng   |
| `payment_policy` | Chính sách thanh toán |

### 7. Policy (Chính sách)

| Key               | Mô tả             |
| ----------------- | ----------------- |
| `warranty_policy` | Bảo hành, bảo trì |

### 8. Chatbot (Cấu hình AI)

| Key                | Mô tả                  |
| ------------------ | ---------------------- |
| `chatbot_greeting` | Lời chào chatbot       |
| `quick_facts`      | Thông tin nhanh cho AI |

### 9. Social (Mạng xã hội)

| Key            | Mô tả                        |
| -------------- | ---------------------------- |
| `social_links` | Facebook, YouTube, GitHub... |

## Cách cập nhật

### Qua Supabase Dashboard

1. Vào https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/editor
2. Chọn bảng `company_settings`
3. Tìm setting cần sửa theo `key`
4. Edit cột `value` (JSON)

### Qua API

```javascript
const { error } = await supabase
  .from("company_settings")
  .update({
    value: {
      active: true,
      title: "Ưu đãi mới",
      discount_percent: 15,
    },
  })
  .eq("key", "current_promotion");
```

### Qua Script

```bash
node scripts/update-company-setting.cjs contact_phone '{"phone":"0909999999"}'
```

## AI Integration

AI Chatbot tự động query `company_settings` mỗi khi chat:

1. **Cache 5 phút**: Không query DB mỗi tin nhắn
2. **Inject vào prompt**: Bảng giá, khuyến mãi được thêm vào system prompt
3. **Real-time**: Cập nhật setting → AI trả lời mới sau 5 phút

### Ví dụ AI Response

**User**: "Giá landing page bao nhiêu?"

**AI**: "Thiết kế landing page có giá từ 3-5 triệu, bao gồm 1 trang, responsive, SEO cơ bản..."
_(Dữ liệu từ `pricing_landing_page`)_

**User**: "Có khuyến mãi gì không?"

**AI**: "Long Sang đang có ưu đãi giảm 10%, mã NEWYEAR2026, đến 31/01/2026..."
_(Dữ liệu từ `current_promotion`)_

## API Endpoints

### GET `/functions/v1/sales-consultant?path=pricing`

Trả về tất cả pricing, contact, promotion.

### GET `/functions/v1/sales-consultant?path=settings`

Trả về tất cả company settings.

## Helper Functions (PostgreSQL)

```sql
-- Lấy 1 setting
SELECT get_company_setting('contact_phone');

-- Lấy tất cả pricing
SELECT * FROM get_all_pricing();

-- Lấy khuyến mãi hiện tại (nếu còn hiệu lực)
SELECT get_current_promotion();
```

## Cập nhật giá thường xuyên

Khi cần thay đổi giá:

```sql
UPDATE company_settings
SET value = jsonb_set(value, '{price_display}', '"5 - 8 triệu"')
WHERE key = 'pricing_landing_page';
```

Hoặc thay toàn bộ:

```sql
UPDATE company_settings
SET value = '{
  "name": "Landing Page",
  "price_from": 5000000,
  "price_to": 8000000,
  "price_display": "5 - 8 triệu",
  "timeline": "1-2 tuần",
  "includes": ["1 trang", "Responsive", "SEO chuẩn"],
  "note": "Giá mới 2026"
}'::jsonb
WHERE key = 'pricing_landing_page';
```

## Lưu ý quan trọng

1. **Không xóa key**: Chỉ update value, không delete key
2. **JSON valid**: Đảm bảo value là JSON hợp lệ
3. **Cache**: AI cache 5 phút, thay đổi không ngay lập tức
4. **Backup**: Backup trước khi thay đổi lớn

---

_Tài liệu cập nhật: 2026-01-04_
