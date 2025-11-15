# 🌐 QUẢN LÝ NHIỀU WEBSITES VỚI HỆ THỐNG SEO

## CHIẾN LƯỢC CHO NHIỀU WEBSITES

### **Option 1: Single Account - Multiple Properties** ⭐ RECOMMENDED

**Cách hoạt động:**
- 1 Service Account để quản lý TẤT CẢ websites
- Add service account vào từng website trong Search Console
- Dễ quản lý, tiết kiệm chi phí

**Setup:**

1. **Add tất cả websites vào Google Search Console:**
   ```
   https://search.google.com/search-console/
   ```
   - Click "Add property"
   - Nhập domain: `https://website1.com`
   - Verify ownership
   - Lặp lại cho mỗi website

2. **Add service account vào MỌI websites:**
   - Vào Settings của từng website
   - Add user: `automation-bot-102@long-sang-automation.iam.gserviceaccount.com`
   - Grant "Owner" permission

3. **Update .env.local với array:**

```bash
# Multiple websites - JSON array format
GOOGLE_SEARCH_CONSOLE_PROPERTIES='[
  "https://longsang.dev",
  "https://longsangautomation.com",
  "https://website3.com"
]'

# Hoặc dùng primary + secondary
GOOGLE_SEARCH_CONSOLE_PROPERTY_URL=https://longsang.dev
GOOGLE_SEARCH_CONSOLE_SECONDARY_URLS=https://website2.com,https://website3.com
```

**Lợi ích:**
- ✅ Quản lý tập trung
- ✅ Tiết kiệm chi phí (1 service account)
- ✅ Dễ scale
- ✅ Báo cáo tổng hợp

---

### **Option 2: Project Per Website**

**Khi nào dùng:**
- Websites thuộc nhiều brand khác nhau
- Cần tách biệt permissions
- Có team riêng cho mỗi website

**Setup:**
1. Tạo Google Cloud Project riêng cho mỗi website
2. Tạo Service Account riêng
3. Maintain multiple `.env` files

**Nhược điểm:**
- ❌ Phức tạp hơn
- ❌ Chi phí cao hơn (nếu scale lớn)
- ❌ Khó maintain

---

## 🎯 RECOMMENDATION CHO BẠN

### **Bắt đầu với Main Website:**

**Bước 1: Xác định website ưu tiên**

Trả lời các câu hỏi:
1. Website nào có traffic cao nhất hiện tại?
2. Website nào quan trọng nhất cho business?
3. Website nào bạn muốn tăng trưởng mạnh nhất?

**Bước 2: Setup website đó trước**

```bash
# .env.local
GOOGLE_SEARCH_CONSOLE_PROPERTY_URL=https://your-main-website.com
```

**Bước 3: Sau 1-2 tuần, add thêm websites khác**

---

## 💡 EXAMPLE: NHIỀU WEBSITES

### **Case Study: Bạn có 3 websites**

**Website 1: Portfolio/Personal Brand**
- `https://longsang.dev`
- Mục tiêu: Tăng personal brand, showcase projects
- Priority: HIGH

**Website 2: Business/Service**
- `https://longsangautomation.com`
- Mục tiêu: Generate leads, bán services
- Priority: HIGH

**Website 3: Blog/Content Site**
- `https://techblog.com`
- Mục tiêu: Traffic, ads revenue
- Priority: MEDIUM

### **Chiến lược SEO:**

**Phase 1 (Tuần 1-4): Focus vào Website 1**
```env
GOOGLE_SEARCH_CONSOLE_PROPERTY_URL=https://longsang.dev
```

**Phase 2 (Tuần 5-8): Add Website 2**
```env
GOOGLE_SEARCH_CONSOLE_PROPERTIES='["https://longsang.dev","https://longsangautomation.com"]'
```

**Phase 3 (Tuần 9+): Add Website 3**
```env
GOOGLE_SEARCH_CONSOLE_PROPERTIES='["https://longsang.dev","https://longsangautomation.com","https://techblog.com"]'
```

---

## 🔧 CODE SUPPORT CHO NHIỀU WEBSITES

Hệ thống đã support sẵn multiple websites:

### **src/lib/seo/google-api-client.ts**

```typescript
// Lấy tất cả websites
const sites = await searchConsoleAPI.listSites();

// Loop qua từng website
for (const site of sites) {
  const data = await searchConsoleAPI.getPerformance(
    site.siteUrl,
    startDate,
    endDate
  );
  
  console.log(`${site.siteUrl}:`, data);
}
```

### **Dashboard sẽ tự động detect tất cả websites**

```typescript
// Dashboard sẽ show dropdown để chọn website
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose website" />
  </SelectTrigger>
  <SelectContent>
    {sites.map(site => (
      <SelectItem key={site.siteUrl} value={site.siteUrl}>
        {site.siteUrl}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## 📊 DASHBOARD CHO NHIỀU WEBSITES

**Features tự động có:**

1. **Website Selector**
   - Dropdown để chọn website
   - Switch giữa các websites nhanh chóng

2. **Comparative Analytics**
   - So sánh performance giữa websites
   - Top performer, worst performer
   - Tổng clicks/impressions của tất cả sites

3. **Bulk Actions**
   - Submit sitemap cho tất cả websites cùng lúc
   - Index nhiều URLs từ nhiều websites
   - Batch reports

---

## 🚀 QUICK START

**Nếu bạn có nhiều websites, làm theo:**

### **1. List tất cả websites của bạn:**

```
Website 1: _______________________________
Website 2: _______________________________
Website 3: _______________________________
```

### **2. Prioritize (1-5, 1 = highest):**

```
Website 1: Priority _____
Website 2: Priority _____
Website 3: Priority _____
```

### **3. Start với #1 priority:**

```bash
# .env.local
GOOGLE_SEARCH_CONSOLE_PROPERTY_URL=https://[your-priority-1-website]
```

### **4. Add website vào Search Console:**

1. Go to: https://search.google.com/search-console/
2. Add property: [your-priority-1-website]
3. Verify ownership
4. Add service account: `automation-bot-102@long-sang-automation.iam.gserviceaccount.com`

### **5. Test:**

```bash
node scripts/test-google-api.mjs
```

---

## 💰 CHI PHÍ & LIMITS

**Google Search Console API:**
- ✅ **FREE** cho unlimited websites
- ✅ **FREE** cho 1200 queries/minute
- ✅ **FREE** cho unlimited indexing requests
- ✅ No monthly cost

**Best Practice:**
- Start với 1 website
- Validate strategy
- Scale to more websites
- No risk, no cost

---

## ❓ FAQ

**Q: Có giới hạn số websites không?**
A: KHÔNG. Bạn có thể add unlimited websites.

**Q: Mất bao lâu để setup thêm website mới?**
A: ~5 phút/website (verify + add service account)

**Q: Có thể tự động add websites không?**
A: Verify ownership cần manual, nhưng sau đó mọi thứ tự động.

**Q: Dashboard có support nhiều websites không?**
A: YES! Tự động detect và show dropdown.

**Q: Nên bắt đầu với website nào?**
A: Website có traffic cao nhất HOẶC quan trọng nhất cho business.

---

## 📞 GỢI Ý CHO BẠN

**Hãy cho tôi biết:**

1. **Bạn có bao nhiêu websites?**
2. **Tên domain của từng website?**
3. **Website nào quan trọng nhất?**

Tôi sẽ giúp bạn:
- ✅ Setup chiến lược SEO cụ thể
- ✅ Prioritize websites
- ✅ Config .env.local phù hợp
- ✅ Tạo automation workflows cho từng site

**Ready to scale? 🚀**
