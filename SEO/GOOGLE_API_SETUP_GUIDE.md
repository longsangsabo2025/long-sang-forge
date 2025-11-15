# 🔐 HƯỚNG DẪN SETUP GOOGLE API CREDENTIALS

## BƯỚC 1: Tạo Google Cloud Project

1. **Truy cập Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Tạo Project mới:**
   - Click "Select a project" → "New Project"
   - Tên project: `long-sang-automation`
   - Click "Create"

---

## BƯỚC 2: Kích hoạt APIs

Trong project vừa tạo, kích hoạt các APIs sau:

### 2.1. Google Search Console API
```
https://console.cloud.google.com/apis/library/searchconsole.googleapis.com
```
→ Click "ENABLE"

### 2.2. Google Analytics Data API
```
https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
```
→ Click "ENABLE"

### 2.3. Google Indexing API
```
https://console.cloud.google.com/apis/library/indexing.googleapis.com
```
→ Click "ENABLE"

### 2.4. Google My Business API
```
https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com
```
→ Click "ENABLE"

---

## BƯỚC 3: Tạo Service Account

1. **Vào IAM & Admin → Service Accounts:**
   ```
   https://console.cloud.google.com/iam-admin/serviceaccounts
   ```

2. **Create Service Account:**
   - Service account name: `automation-bot`
   - Service account ID: `automation-bot` (tự động generate)
   - Description: `Service account for SEO automation and Google APIs`
   - Click "CREATE AND CONTINUE"

3. **Grant permissions:**
   - Role: `Owner` (hoặc `Editor` nếu muốn giới hạn)
   - Click "CONTINUE" → "DONE"

---

## BƯỚC 4: Tạo & Download JSON Key

1. **Click vào Service Account vừa tạo**

2. **Vào tab "KEYS":**
   - Click "ADD KEY" → "Create new key"
   - Chọn "JSON"
   - Click "CREATE"

3. **File JSON sẽ tự động download** với tên dạng:
   ```
   long-sang-automation-xxxxx.json
   ```

4. **⚠️ BẢO MẬT FILE NÀY:**
   - KHÔNG commit vào Git
   - KHÔNG share công khai
   - Lưu trong thư mục an toàn

---

## BƯỚC 5: Cấp quyền cho Service Account

### 5.1. Google Search Console

1. **Truy cập Google Search Console:**
   ```
   https://search.google.com/search-console/
   ```

2. **Chọn property của bạn**

3. **Settings → Users and permissions**

4. **Add user:**
   - Email: `automation-bot@long-sang-automation.iam.gserviceaccount.com`
   - Permission: `Owner` hoặc `Full`
   - Click "ADD"

### 5.2. Google Analytics

1. **Truy cập Google Analytics:**
   ```
   https://analytics.google.com/
   ```

2. **Admin → Property → Property Access Management**

3. **Add users:**
   - Email: Service account email (từ JSON file)
   - Roles: `Editor` hoặc `Administrator`
   - Click "Add"

---

## BƯỚC 6: Copy JSON Content

1. **Mở file JSON vừa download**

2. **Copy toàn bộ nội dung** (format như sau):

```json
{
  "type": "service_account",
  "project_id": "long-sang-automation",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n",
  "client_email": "automation-bot@long-sang-automation.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/automation-bot%40long-sang-automation.iam.gserviceaccount.com"
}
```

3. **Gửi cho tôi theo một trong các cách:**

   **Cách 1: Lưu vào file .env (RECOMMENDED)**
   ```bash
   # Tạo file .env.local trong project
   GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

   **Cách 2: Paste trực tiếp vào chat (ít an toàn hơn)**
   - Paste toàn bộ JSON content
   - Tôi sẽ setup ngay

   **Cách 3: Upload file JSON**
   - Đổi tên file thành: `google-credentials.json`
   - Đặt trong thư mục: `d:\0.APP\1510\long-sang-forge\config\`
   - Tôi sẽ đọc và setup

---

## ✅ CHECKLIST

- [ ] Tạo Google Cloud Project
- [ ] Kích hoạt Search Console API
- [ ] Kích hoạt Analytics API
- [ ] Kích hoạt Indexing API
- [ ] Tạo Service Account
- [ ] Download JSON key
- [ ] Add service account vào Search Console
- [ ] Add service account vào Analytics
- [ ] Gửi credentials cho bot

---

## 🔒 BẢO MẬT

**File cần thêm vào .gitignore:**
```gitignore
# Google Credentials
google-credentials.json
config/google-credentials.json
.env.local
*.json
!package.json
!tsconfig.json
```

**Các quyền Service Account có thể làm:**
- ✅ Đọc Search Console data
- ✅ Submit sitemap
- ✅ Request indexing
- ✅ Đọc Analytics data
- ✅ Tạo custom reports
- ❌ KHÔNG thể xóa project
- ❌ KHÔNG thể thay đổi billing

---

## 📞 HỖ TRỢ

Nếu gặp khó khăn ở bước nào, hãy cho tôi biết:
1. Screenshot màn hình hiện tại
2. Error message (nếu có)
3. Bước đang bị kẹt

Tôi sẽ hướng dẫn chi tiết hơn!
