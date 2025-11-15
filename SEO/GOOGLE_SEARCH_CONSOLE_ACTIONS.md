# 🚀 Google Search Console - Actions Guide

## ✅ Bạn có thể làm GÌ với API Key?

Với service account đã có quyền Owner, bạn có **FULL CONTROL** trên Google Search Console!

---

## 🎯 7 Actions Có Sẵn Ngay

### 1. **📊 Xem Performance Data**
```powershell
# Performance 7 ngày gần nhất
node scripts/seo-actions.mjs performance

# Performance 30 ngày
node scripts/seo-actions.mjs performance 30
```

**Output:**
- Top keywords
- Clicks, Impressions, CTR, Position
- Summary statistics
- Trends over time

---

### 2. **🔍 Top Search Queries**
```powershell
# Top 50 queries
node scripts/seo-actions.mjs top-queries

# Top 100 queries
node scripts/seo-actions.mjs top-queries 100
```

**Xem:**
- Keywords nào đang bring traffic
- Position cho mỗi keyword
- CTR performance
- Opportunities để optimize

---

### 3. **🗺️ Quản Lý Sitemaps**

#### List sitemaps hiện tại:
```powershell
node scripts/seo-actions.mjs sitemaps
```

#### Submit sitemap mới:
```powershell
node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap.xml
```

#### Delete sitemap:
```powershell
node scripts/seo-actions.mjs delete-sitemap https://saboarena.com/old-sitemap.xml
```

---

### 4. **🚀 Request URL Indexing**

#### Index 1 URL:
```powershell
node scripts/seo-actions.mjs index-url https://saboarena.com/new-tournament
```

**Tác dụng:**
- Gửi URL lên Google ngay lập tức
- Không cần đợi Google tự crawl
- Thường được index trong vài giờ

---

### 5. **📦 Bulk Index URLs**

#### Tạo file `urls.txt`:
```text
https://saboarena.com/tournament-1
https://saboarena.com/tournament-2
https://saboarena.com/blog/post-1
https://saboarena.com/blog/post-2
```

#### Run bulk index:
```powershell
node scripts/seo-actions.mjs bulk-index urls.txt
```

**Features:**
- Index nhiều URLs cùng lúc
- Auto rate-limiting (1 request/second)
- Progress tracking
- Success/fail report

---

## 💡 Use Cases Thực Tế

### Use Case 1: **New Content Published**
```powershell
# Vừa publish blog post mới
node scripts/seo-actions.mjs index-url https://saboarena.com/blog/new-post

# ✅ Google sẽ crawl và index trong vài giờ thay vì vài ngày!
```

### Use Case 2: **Tournament Events**
```powershell
# Tournament mới bắt đầu
node scripts/seo-actions.mjs index-url https://saboarena.com/tournaments/valorant-cup-2025

# ✅ Event page lên Google ngay, users tìm thấy được!
```

### Use Case 3: **Content Update**
```powershell
# Đã update content on existing page
node scripts/seo-actions.mjs index-url https://saboarena.com/about

# ✅ Google re-crawl page với content mới
```

### Use Case 4: **Launch New Website Section**
```bash
# Tạo file với tất cả URLs trong section mới
echo "https://saboarena.com/players/player-1
https://saboarena.com/players/player-2
https://saboarena.com/players/player-3" > players.txt

# Index tất cả
node scripts/seo-actions.mjs bulk-index players.txt

# ✅ Toàn bộ section lên Google cùng lúc!
```

### Use Case 5: **Weekly Performance Check**
```powershell
# Mỗi thứ 2 check performance
node scripts/seo-actions.mjs performance 7

# ✅ Xem keywords nào tăng/giảm, adjust strategy
```

### Use Case 6: **Monthly Keywords Analysis**
```powershell
# End of month: check top keywords
node scripts/seo-actions.mjs top-queries 100

# ✅ Identify opportunities, create content cho missing keywords
```

---

## 🤖 Automation Ideas

### Daily Auto-Index New Pages

**Create: `scripts/auto-index-daily.mjs`**
```javascript
import { glob } from 'glob';

// Tìm tất cả files created trong 24h qua
const newPages = await glob('build/**/*.html', {
  stat: true,
  withFileTypes: true,
})
  .then(files => files.filter(f => {
    const ageHours = (Date.now() - f.mtimeMs) / (1000 * 60 * 60);
    return ageHours < 24;
  }));

// Index chúng
for (const page of newPages) {
  const url = convertToPublicUrl(page.path);
  await exec(`node scripts/seo-actions.mjs index-url ${url}`);
}
```

**Setup cron job (Windows Task Scheduler):**
```
Daily at 6 AM: node scripts/auto-index-daily.mjs
```

---

### Weekly Performance Report

**Create: `scripts/weekly-report.mjs`**
```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get performance data
const { stdout } = await execAsync('node scripts/seo-actions.mjs performance 7');

// Send email report
await sendEmail({
  to: 'team@saboarena.com',
  subject: '📊 Weekly SEO Report - SABO ARENA',
  body: stdout
});
```

**Schedule:**
```
Every Monday 8 AM: node scripts/weekly-report.mjs
```

---

### Real-time Content Indexing

**Watch for new files:**
```javascript
import chokidar from 'chokidar';

const watcher = chokidar.watch('content/**/*.md');

watcher.on('add', async (path) => {
  console.log(`New content: ${path}`);
  
  const url = convertToUrl(path);
  
  // Auto-index immediately
  await exec(`node scripts/seo-actions.mjs index-url ${url}`);
  
  console.log(`✅ Indexed: ${url}`);
});
```

---

## 🎯 Chiến Thuật SEO với API

### Tactic 1: **Instant Indexing** (Competitive Advantage)

**Problem:** Đối thủ publish news → mất 2-3 ngày để Google index

**Solution:**
```powershell
# Bạn publish → index ngay trong 2 giờ
node scripts/seo-actions.mjs index-url [url]

# ✅ Bạn xuất hiện trên Google TRƯỚC đối thủ!
```

### Tactic 2: **Keyword Gap Analysis**

**Step 1:** Get top queries
```powershell
node scripts/seo-actions.mjs top-queries 200 > queries.txt
```

**Step 2:** Analyze data
```javascript
// Find queries with high impressions, low clicks (low CTR)
// These are opportunities!
```

**Step 3:** Create content targeting those keywords

**Step 4:** Index immediately
```powershell
node scripts/seo-actions.mjs index-url [new-content-url]
```

### Tactic 3: **Sitemap Segmentation**

**Instead of 1 sitemap:**
```
sitemap.xml (all pages)
```

**Create multiple specialized sitemaps:**
```
sitemap-tournaments.xml (high priority, daily update)
sitemap-blog.xml (medium priority, weekly update)
sitemap-players.xml (low priority, monthly update)
```

**Submit each:**
```powershell
node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap-tournaments.xml
node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap-blog.xml
node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap-players.xml
```

**Benefit:** Google prioritizes crawling correctly

---

## 📊 Performance Tracking

### What to Monitor Daily:

```powershell
# Check performance
node scripts/seo-actions.mjs performance

# Look for:
# ✅ Trending up keywords (double down)
# ⚠️ Dropping keywords (investigate why)
# 🆕 New keywords (expand content)
```

### What to Monitor Weekly:

```powershell
# Deep keyword analysis
node scripts/seo-actions.mjs top-queries 100

# Identify:
# 🎯 Keywords với position 11-20 (opportunity to reach page 1)
# 📈 Keywords với high impressions, low CTR (improve titles/descriptions)
# 🔍 Related keywords to target
```

---

## 🚨 Alerts & Monitoring

### Setup Automated Alerts:

**Create: `scripts/seo-alerts.mjs`**
```javascript
// Check performance vs yesterday
const today = await getPerformance(1);
const yesterday = await getPerformance(2, 1);

const clicksDrop = (yesterday.clicks - today.clicks) / yesterday.clicks;

if (clicksDrop > 0.2) { // 20% drop
  await sendAlert({
    type: 'WARNING',
    message: `🚨 Clicks dropped ${(clicksDrop * 100).toFixed(1)}%`,
    data: { today, yesterday }
  });
}

// Check for penalties
const topKeywords = await getTopQueries(10);
const bigDrops = topKeywords.filter(k => k.positionChange > 10);

if (bigDrops.length > 0) {
  await sendAlert({
    type: 'CRITICAL',
    message: `⚠️ ${bigDrops.length} keywords dropped >10 positions`,
    keywords: bigDrops
  });
}
```

---

## 💰 ROI của API Access

### Manual vs Automated:

| Task | Manual Time | API Time | Saved |
|------|-------------|----------|-------|
| Check performance | 5 min | 10 sec | 99% |
| Index 1 URL | 2 min | 5 sec | 96% |
| Index 100 URLs | 200 min | 100 sec | 99% |
| Submit sitemap | 3 min | 5 sec | 97% |
| Weekly report | 30 min | 10 sec | 99% |

**Monthly Time Saved:** ~20 hours
**Value:** $500-1000 (SEO consultant rate)

---

## 🔥 Advanced: CI/CD Integration

### Auto-Index on Deploy:

**GitHub Actions workflow:**
```yaml
name: Deploy & Index

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: npm run deploy
      
      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v35
        
      - name: Index changed pages
        env:
          GOOGLE_CREDS: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_JSON }}
        run: |
          for file in ${{ steps.changed-files.outputs.all_changed_files }}; do
            URL="https://saboarena.com/${file}"
            node scripts/seo-actions.mjs index-url $URL
          done
```

**Result:** Every deploy → affected pages auto-indexed → instant Google updates!

---

## 🎯 Next Steps

### Immediate Actions (Today):

1. **Submit sitemap:**
   ```powershell
   # Tạo sitemap.xml trước (sẽ làm ở step tiếp)
   node scripts/seo-actions.mjs submit-sitemap https://saboarena.com/sitemap.xml
   ```

2. **Index important pages:**
   ```powershell
   node scripts/seo-actions.mjs index-url https://saboarena.com
   node scripts/seo-actions.mjs index-url https://saboarena.com/tournaments
   node scripts/seo-actions.mjs index-url https://saboarena.com/about
   ```

3. **Setup monitoring:**
   ```powershell
   # Add to daily cron
   node scripts/seo-actions.mjs performance > logs/performance-$(date +%Y%m%d).txt
   ```

---

## 📚 Resources

**Files:**
- `scripts/seo-actions.mjs` - Main CLI tool
- `src/lib/seo/google-api-client.ts` - API wrapper
- `SEO/SABO_ARENA_SEO_STRATEGY.md` - 90-day strategy

**Google Docs:**
- [Search Console API Reference](https://developers.google.com/webmaster-tools/v1)
- [Indexing API Guide](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [Web Search API](https://developers.google.com/custom-search/v1/overview)

---

**Bạn muốn làm gì tiếp theo?**
1. Tạo sitemap.xml?
2. Index homepage và main pages?
3. Setup automation scripts?
4. Tất cả? 🚀
