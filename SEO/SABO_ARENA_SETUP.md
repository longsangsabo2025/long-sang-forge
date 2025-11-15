# 🎯 SABO ARENA - SEO SETUP GUIDE

## 🚀 QUICK START CHECKLIST

### ✅ STEP 1: Verify Website Ownership

**Add website to Google Search Console:**

1. **Go to:** https://search.google.com/search-console/
2. **Click:** "Add property"
3. **Enter:** `saboarena.com` hoặc `https://saboarena.com`
4. **Choose verification method:**

   **Option A: HTML File Upload** (Recommended)
   - Download verification file
   - Upload to website root: `https://saboarena.com/google[xxx].html`
   - Click "Verify"

   **Option B: DNS Record**
   - Add TXT record to DNS:
     ```
     Name: @
     Type: TXT
     Value: [verification code from Google]
     ```

   **Option C: HTML Tag**
   - Add meta tag to `<head>`:
     ```html
     <meta name="google-site-verification" content="[code]" />
     ```

5. **Click "VERIFY"**

---

### ✅ STEP 2: Add Service Account

**After verification:**

1. **Go to:** Settings → Users and permissions
2. **Click:** "Add user"
3. **Email:** `automation-bot-102@long-sang-automation.iam.gserviceaccount.com`
4. **Permission:** Select "Owner"
5. **Click:** "ADD"

---

### ✅ STEP 3: Test Connection

```bash
cd d:\0.APP\1510\long-sang-forge
node scripts/test-google-api.mjs
```

**Expected output:**
```
✅ Search Console API works!
📊 Found 1 sites:
   - https://saboarena.com (siteOwner)
```

---

### ✅ STEP 4: Submit Sitemap

**Generate sitemap first** (if not exists):

Create `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://saboarena.com/</loc>
    <lastmod>2025-11-11</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Add more URLs here -->
</urlset>
```

**Submit to Google:**
1. Go to Search Console → Sitemaps
2. Enter: `https://saboarena.com/sitemap.xml`
3. Click "SUBMIT"

---

### ✅ STEP 5: Setup Google Analytics (Optional but Recommended)

1. **Go to:** https://analytics.google.com/
2. **Create property** for saboarena.com
3. **Get Property ID** (format: properties/123456789)
4. **Update .env.local:**
   ```bash
   GOOGLE_ANALYTICS_PROPERTY_ID=properties/[your-property-id]
   ```
5. **Add service account:**
   - Admin → Property Access Management
   - Add: `automation-bot-102@long-sang-automation.iam.gserviceaccount.com`
   - Role: "Editor"

---

## 🎯 SABO ARENA - SEO STRATEGY

### **Target Keywords:**

**Primary Keywords:**
- ✅ sabo arena
- ✅ [thêm keywords chính]

**Secondary Keywords:**
- Gaming platform
- Esports arena
- [thêm keywords phụ]

**Long-tail Keywords:**
- [specific phrases về gaming/sports]

---

### **Content Strategy:**

**Homepage:**
- Title: "SABO ARENA - [Value Proposition]"
- Meta Description: "Discover SABO ARENA... [compelling description under 160 chars]"

**Key Pages:**
1. About
2. Services/Features
3. Pricing (if applicable)
4. Blog/News
5. Contact

---

### **Technical SEO:**

✅ **Must Have:**
- [ ] Sitemap.xml submitted
- [ ] Robots.txt configured
- [ ] SSL certificate (HTTPS)
- [ ] Mobile-responsive design
- [ ] Fast loading speed (< 3s)
- [ ] Structured data (Schema.org)

✅ **Meta Tags:** (Already updated in index.html)
```html
<title>SABO ARENA - Your Gaming Destination</title>
<meta name="description" content="..." />
<meta name="keywords" content="sabo arena, gaming, esports" />
```

---

## 📊 AUTOMATED TASKS FOR SABO ARENA

**Daily Automation:**
- ✅ Check rankings for target keywords
- ✅ Monitor competitor positions
- ✅ Track clicks & impressions
- ✅ Alert on ranking drops

**Weekly Automation:**
- ✅ Performance summary report
- ✅ Top performing pages
- ✅ Keywords to optimize
- ✅ Content suggestions

**Monthly Automation:**
- ✅ Comprehensive SEO audit
- ✅ Backlink analysis
- ✅ Content gap analysis
- ✅ Competitor research

---

## 🔧 QUICK COMMANDS

**Test connection:**
```bash
node scripts/test-google-api.mjs
```

**Start development:**
```bash
npm run dev
```

**Access SEO Dashboard:**
```
http://localhost:4000/seo-dashboard
```

**Submit URL to Google:**
```bash
# Run in dev tools console or create script
await indexingAPI.requestIndexing('https://saboarena.com/new-page');
```

---

## 📈 SUCCESS METRICS

**Month 1 Goals:**
- [ ] 100+ impressions/day
- [ ] 10+ clicks/day
- [ ] Top 50 for primary keywords
- [ ] All pages indexed

**Month 3 Goals:**
- [ ] 500+ impressions/day
- [ ] 50+ clicks/day
- [ ] Top 20 for primary keywords
- [ ] 3+ backlinks

**Month 6 Goals:**
- [ ] 2000+ impressions/day
- [ ] 200+ clicks/day
- [ ] Top 10 for primary keywords
- [ ] 10+ quality backlinks

---

## 🎨 SABO ARENA - SPECIFIC SEO TIPS

### **Gaming/Sports Industry SEO:**

1. **Create Game/Event Pages**
   - Individual pages for each game/event
   - Rich content with images/videos
   - Schema markup for events

2. **Player/Team Profiles**
   - SEO-optimized profiles
   - Statistics and achievements
   - Link to social media

3. **News & Updates**
   - Regular blog posts
   - Tournament results
   - Industry news

4. **Community Content**
   - User-generated content
   - Forums/discussions
   - Reviews and testimonials

5. **Video Content**
   - YouTube integration
   - Gameplay videos
   - Tutorials and guides

---

## 🔗 RESOURCES

**Google Search Console:**
https://search.google.com/search-console/

**Google Analytics:**
https://analytics.google.com/

**Sitemap Generator:**
https://www.xml-sitemaps.com/

**PageSpeed Insights:**
https://pagespeed.web.dev/

**Schema Markup Generator:**
https://technicalseo.com/tools/schema-markup-generator/

---

## 📞 NEXT STEPS

After setup complete:

1. ✅ Verify website in Search Console
2. ✅ Add service account
3. ✅ Submit sitemap
4. ✅ Setup Analytics
5. ✅ Test dashboard: http://localhost:4000/seo-dashboard
6. ✅ Monitor daily for 1 week
7. ✅ Add more pages/content
8. ✅ Build backlinks
9. ✅ Scale to next website

---

## 🎯 READY TO SCALE?

**When SABO ARENA is running smoothly:**

1. Add next website to `src/config/websites.ts`
2. Repeat verification process
3. Dashboard will automatically show all websites
4. Manage everything from one place

**Easy scaling! 🚀**
