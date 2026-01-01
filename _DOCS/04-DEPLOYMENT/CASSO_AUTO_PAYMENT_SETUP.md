# Hướng dẫn thiết lập Casso Auto Payment

## Tổng quan

Hệ thống tự động xác nhận thanh toán khi khách hàng chuyển khoản qua ngân hàng.

**Flow hoạt động:**

1. Khách đặt lịch → Chọn gói có phí → Hiện QR VietQR
2. Khách chuyển khoản với nội dung: `TUVAN [TÊN] [NGÀY]`
3. Casso detect giao dịch → Gọi webhook đến server
4. Server match nội dung → Tự động confirm booking
5. Email xác nhận gửi cho khách + admin

---

## Bước 1: Đăng ký Casso

1. Truy cập https://my.casso.vn/ và đăng ký tài khoản
2. Miễn phí cho cá nhân (< 100 giao dịch/tháng)

## Bước 2: Kết nối ngân hàng

1. Vào **Ngân hàng** → **Thêm ngân hàng**
2. Chọn **ACB**
3. Nhập thông tin:
   - Số tài khoản: `10141347`
   - Tên chủ TK: `VO LONG SANG`
4. Xác thực theo hướng dẫn của Casso

## Bước 3: Tạo Webhook

1. Vào **Webhook** → **Tạo webhook**
2. Cấu hình:
   - **URL**: `https://longsang.org/api/casso/webhook`
   - **Income**: ✅ (nhận thông báo tiền vào)
   - **Outcome**: ❌ (không cần)
3. Copy **Secure Token** để dùng ở bước 4

## Bước 4: Cấu hình Server

Thêm vào file `.env.local`:

```env
# Casso Webhook
CASSO_WEBHOOK_SECRET=your_secure_token_from_casso
```

## Bước 5: Chạy Migration Database

Vào Supabase SQL Editor và chạy:

```sql
-- Add payment tracking fields to consultations table
ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_amount INTEGER;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_consultations_payment_status
ON consultations(payment_status);

CREATE INDEX IF NOT EXISTS idx_consultations_payment_tx
ON consultations(payment_transaction_id);
```

## Bước 6: Test Webhook

Test endpoint hoạt động:

```bash
curl https://longsang.org/api/casso/test
```

Response mong đợi:

```json
{
  "status": "ok",
  "message": "Casso webhook is ready",
  "timestamp": "2024-12-29T..."
}
```

---

## Chi tiết kỹ thuật

### Nội dung chuyển khoản

Format: `TUVAN[TÊN][NGÀY]`

- Ví dụ: `TUVAN SANGVOLON 20241229`

### Webhook Payload từ Casso

```json
{
  "error": 0,
  "data": [
    {
      "id": 123456,
      "tid": "FT24363...",
      "description": "TUVAN SANGVOLON 20241229",
      "amount": 499000,
      "cusum_balance": 1000000,
      "when": "2024-12-29 14:30:00"
    }
  ]
}
```

### Matching Logic

1. Trích xuất `TUVAN` + tên + ngày từ description
2. Tìm consultation pending có payment ref tương ứng
3. Verify số tiền (tolerance 1%)
4. Update status → confirmed, payment_status → paid
5. Gửi email xác nhận

### Bảng giá

| Gói                       | Giá      |
| ------------------------- | -------- |
| Gói Cơ Bản (30 phút)      | 299.000đ |
| Gói Tiêu Chuẩn (60 phút)  | 499.000đ |
| Gói Premium (120 phút)    | 999.000đ |
| Tư vấn miễn phí (15 phút) | 0đ       |

---

## Email Templates

### Gửi cho khách (paymentConfirmed)

- Subject: `✅ Thanh toán thành công - Lịch hẹn [ngày] đã được xác nhận!`
- Nội dung: Thông tin lịch hẹn, hướng dẫn chuẩn bị

### Gửi cho admin (adminPaymentConfirmed)

- Subject: `💰 Thanh toán xác nhận: [tên] - [số tiền]`
- Nội dung: Thông tin khách, số tiền, trạng thái

---

## Troubleshooting

### Webhook không nhận được

1. Kiểm tra URL webhook đúng chưa
2. Kiểm tra Secure Token khớp không
3. Xem logs: `https://my.casso.vn/` → **Webhook** → **Logs**

### Không match được booking

1. Kiểm tra nội dung chuyển khoản đúng format không
2. Kiểm tra số tiền khớp không
3. Kiểm tra booking có status `pending` không

### Email không gửi được

1. Kiểm tra RESEND_API_KEY trong Supabase
2. Kiểm tra template name đúng không
3. Xem logs Edge Function trong Supabase Dashboard
