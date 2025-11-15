# ⚡ CHATWOOT + CAPTAIN AI - QUICK START (5 PHÚT)

## 🎯 SETUP NHANH

### Bước 1: Chuẩn bị (1 phút)

**Cần có:**
- ✅ Docker Desktop đã cài
- ✅ OpenAI API key

**Kiểm tra Docker:**
```bash
docker --version
```

Nếu chưa có: https://www.docker.com/products/docker-desktop

---

### Bước 2: Cấu hình (2 phút)

**1. Mở file `.env`**

**2. Thêm OpenAI API key:**
```bash
OPENAI_API_KEY=sk-your-key-here
```

**3. (Optional) Đổi domain nếu production:**
```bash
FRONTEND_URL=https://yourdomain.com
```

**Done!** ✅

---

### Bước 3: Chạy (1 phút)

**Double-click file:**
```
setup.bat
```

Hoặc chạy manual:
```bash
docker-compose up -d
```

**Đợi 30 giây...**

---

### Bước 4: Truy cập (1 phút)

**Mở browser:**
```
http://localhost:3000
```

**Tạo tài khoản admin:**
- Điền thông tin
- Click "Create Account"
- Login vào dashboard

**Done!** 🎉

---

## 🎨 TÍCH HỢP VÀO WEBSITE

### Copy code này vào website (trước `</body>`):

```html
<script>
  (function(d,t) {
    var BASE_URL="http://localhost:3000";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: 'GET_FROM_DASHBOARD',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

**Lấy websiteToken:**
1. Dashboard → Settings → Inboxes
2. Click vào inbox của bạn
3. Tab "Configuration"
4. Copy "Website Token"

---

## 🤖 ENABLE CAPTAIN AI

### Trong Chatwoot Dashboard:

**1. Settings → Integrations**
- Tìm "Captain AI"
- Click "Enable"

**2. Configure Captain:**
- Auto-respond: ON
- Confidence threshold: 0.8
- Escalate to human: ON

**3. Add FAQs:**
- Settings → Help Center
- Create Category
- Add Articles
- Captain sẽ học từ đây!

---

## ✅ TEST

**1. Mở website của bạn**

**2. Click vào chat bubble (góc dưới phải)**

**3. Gửi tin nhắn test:**
```
"Hello, I need help"
```

**4. Captain AI sẽ trả lời tự động!** 🎉

---

## 🎯 NEXT STEPS

### Tùy chỉnh widget:
- Settings → Inboxes → Widget Configuration
- Đổi màu, vị trí, greeting message

### Thêm team members:
- Settings → Agents → Invite
- Phân quyền: Admin, Agent, hoặc Viewer

### Connect thêm channels:
- Facebook Messenger
- WhatsApp
- Email
- Instagram

### Train Captain AI:
- Thêm nhiều FAQs
- Review conversations
- Update knowledge base

---

## 🐛 TROUBLESHOOTING

### Port 3000 đã được dùng?
```bash
# Đổi port trong docker-compose.yml
ports:
  - '3001:3000'
```

### Services không start?
```bash
# Xem logs
docker-compose logs

# Restart
docker-compose restart
```

### Captain AI không hoạt động?
- Check OpenAI API key trong `.env`
- Restart services: `docker-compose restart`
- Xem logs: `docker-compose logs rails`

---

## 📚 TÀI LIỆU

- **README.md** - Hướng dẫn đầy đủ
- **INTEGRATION_GUIDE.md** - Tích hợp chi tiết
- **Chatwoot Docs** - https://www.chatwoot.com/docs

---

## 🎊 DONE!

**Bạn đã có:**
- ✅ AI Customer Support running
- ✅ Captain AI auto-responding
- ✅ Widget trên website
- ✅ Dashboard để quản lý

**Total time: 5 phút!** ⚡

**Questions? Check README.md hoặc docs!**
