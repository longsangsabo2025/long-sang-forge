# 🤖 CHATWOOT + CAPTAIN AI - CUSTOMER SUPPORT SYSTEM

**Status:** Ready to deploy  
**Time to setup:** 10-15 minutes  
**Cost:** $30-150/month

---

## 🚀 QUICK START

### Step 1: Prerequisites

**Required:**
- Docker Desktop installed
- OpenAI API key (for Captain AI)

**Check Docker:**
```bash
docker --version
docker-compose --version
```

If not installed: https://www.docker.com/products/docker-desktop

---

### Step 2: Configure

**Edit `.env` file:**
```bash
# Required: Add your OpenAI API key
OPENAI_API_KEY=sk-your-key-here

# Optional: Change domain (for production)
FRONTEND_URL=https://yourdomain.com

# Optional: Email settings
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

### Step 3: Deploy

**Option A: Windows (Double-click)**
```
setup.bat
```

**Option B: Manual**
```bash
# Generate secret key
powershell -Command "$key = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 128 | ForEach-Object {[char]$_}); Write-Output $key"

# Update .env with the generated key

# Start services
docker-compose up -d
```

---

### Step 4: Access Chatwoot

**Open browser:**
```
http://localhost:3000
```

**Create admin account:**
1. Fill in your details
2. Verify email (if configured)
3. Login to dashboard

---

### Step 5: Configure Captain AI

**In Chatwoot Dashboard:**

1. **Settings → Integrations → Captain AI**
   - Enable Captain
   - Configure auto-response rules
   - Set confidence threshold (0.8 recommended)

2. **Settings → Inboxes → Create Inbox**
   - Choose "Website"
   - Configure widget appearance
   - Copy widget code

3. **Train Captain:**
   - Settings → Help Center
   - Add FAQs
   - Add knowledge base articles
   - Captain will learn from these

---

### Step 6: Add to Your Website

**Copy this code to your website:**
```html
<!-- Add before </body> tag -->
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
        websiteToken: 'YOUR_WEBSITE_TOKEN',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

**Get YOUR_WEBSITE_TOKEN:**
- Dashboard → Settings → Inboxes → Your Inbox → Configuration

---

## 🎯 FEATURES

### ✅ Captain AI Agent
- Auto-respond to common questions
- Learn from FAQs and knowledge base
- Escalate complex queries to humans
- Multi-language support

### ✅ Omnichannel Support
- Website live chat
- Email support
- Facebook Messenger
- Instagram DM
- WhatsApp Business
- Twitter DM
- Telegram
- SMS

### ✅ Team Collaboration
- Multiple agents
- Internal notes
- @mentions
- Auto-assignment
- Canned responses

### ✅ Help Center
- Self-service portal
- FAQs
- Knowledge base articles
- Search functionality

### ✅ Analytics
- Conversation reports
- Agent performance
- CSAT scores
- Response times

---

## 🔧 CONFIGURATION

### Captain AI Settings

**In `.env` file:**
```bash
# Enable/Disable Captain
CAPTAIN_ENABLED=true

# AI Model (gpt-4o recommended)
CAPTAIN_MODEL=gpt-4o

# Temperature (0.7 = balanced)
CAPTAIN_TEMPERATURE=0.7

# Auto-resolve conversations
CAPTAIN_AUTO_RESOLVE=true

# Confidence threshold (0.8 = high confidence)
CAPTAIN_CONFIDENCE_THRESHOLD=0.8

# Escalate to human when unsure
CAPTAIN_ESCALATE_TO_HUMAN=true
```

### Widget Customization

**In Chatwoot Dashboard:**
- Settings → Inboxes → Widget Configuration
- Customize colors, position, greeting
- Add pre-chat form
- Set business hours

---

## 📊 MONITORING

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f rails
docker-compose logs -f sidekiq
```

### Check Status
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

---

## 🔒 SECURITY

### Production Checklist

- [ ] Change all default passwords
- [ ] Generate new SECRET_KEY_BASE
- [ ] Enable HTTPS (FORCE_SSL=true)
- [ ] Configure firewall
- [ ] Setup backups
- [ ] Enable 2FA for admin
- [ ] Review RLS policies

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres chatwoot > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres chatwoot < backup.sql
```

---

## 🌐 PRODUCTION DEPLOYMENT

### Option 1: DigitalOcean (Recommended)

**1-Click Deploy:**
- Go to DigitalOcean Marketplace
- Search "Chatwoot"
- Click "Create Chatwoot Droplet"
- Follow setup wizard

**Cost:** $12-24/month

### Option 2: Heroku

**One-Click Deploy:**
```
https://heroku.com/deploy?template=https://github.com/chatwoot/chatwoot
```

**Cost:** $7-25/month

### Option 3: AWS/Azure/GCP

**Use Docker Compose:**
1. Provision VM
2. Install Docker
3. Clone this repo
4. Run `docker-compose up -d`

---

## 🔌 INTEGRATIONS

### Connect Facebook Messenger

1. **Create Facebook App**
   - https://developers.facebook.com
   - Create new app
   - Add Messenger product

2. **Configure in Chatwoot**
   - Settings → Inboxes → Add Inbox
   - Choose Facebook
   - Follow OAuth flow

3. **Add to `.env`**
   ```bash
   FB_APP_ID=your_app_id
   FB_APP_SECRET=your_app_secret
   FB_VERIFY_TOKEN=your_verify_token
   ```

### Connect WhatsApp Business

1. **Get WhatsApp Business API**
   - Apply at https://business.whatsapp.com

2. **Configure in Chatwoot**
   - Settings → Inboxes → Add Inbox
   - Choose WhatsApp
   - Enter credentials

### Connect Email

1. **Configure SMTP in `.env`**
   ```bash
   SMTP_ADDRESS=smtp.gmail.com
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```

2. **Create Email Inbox**
   - Settings → Inboxes → Add Inbox
   - Choose Email
   - Configure forwarding

---

## 💡 TIPS & TRICKS

### Improve Captain AI Accuracy

1. **Add more FAQs**
   - Cover common questions
   - Use natural language
   - Include variations

2. **Train with real conversations**
   - Review chat history
   - Add good responses to knowledge base
   - Update FAQs based on patterns

3. **Set proper confidence threshold**
   - 0.9 = Very confident (fewer responses)
   - 0.8 = Balanced (recommended)
   - 0.7 = More responses (may be less accurate)

### Optimize Performance

1. **Enable caching**
2. **Use CDN for assets**
3. **Optimize database queries**
4. **Monitor resource usage**

---

## 🐛 TROUBLESHOOTING

### Services won't start
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild
docker-compose up -d --build
```

### Can't access http://localhost:3000
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Change port in docker-compose.yml
ports:
  - '3001:3000'  # Use 3001 instead
```

### Captain AI not responding
```bash
# Check OpenAI API key in .env
OPENAI_API_KEY=sk-...

# Restart services
docker-compose restart

# Check logs
docker-compose logs rails | grep -i captain
```

### Database errors
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Wait for initialization
docker-compose logs -f postgres
```

---

## 📞 SUPPORT

### Official Resources
- Docs: https://www.chatwoot.com/docs
- GitHub: https://github.com/chatwoot/chatwoot
- Community: https://discord.gg/chatwoot
- Captain AI: https://chwt.app/captain-docs

### Common Issues
- Search GitHub Issues: https://github.com/chatwoot/chatwoot/issues
- Check Community Forum: https://community.chatwoot.com

---

## 🎊 SUCCESS CHECKLIST

- [ ] Docker services running
- [ ] Accessed http://localhost:3000
- [ ] Created admin account
- [ ] Configured Captain AI
- [ ] Added OpenAI API key
- [ ] Created website inbox
- [ ] Added widget to website
- [ ] Tested chat functionality
- [ ] Added FAQs
- [ ] Trained Captain AI
- [ ] Configured team members
- [ ] Setup email notifications
- [ ] Tested on mobile
- [ ] Reviewed analytics

---

## 🚀 NEXT STEPS

1. **Customize branding**
   - Upload logo
   - Set brand colors
   - Customize widget

2. **Add team members**
   - Invite agents
   - Set permissions
   - Configure auto-assignment

3. **Connect channels**
   - Facebook Messenger
   - WhatsApp
   - Email
   - Instagram

4. **Build knowledge base**
   - Add articles
   - Create FAQs
   - Organize categories

5. **Monitor & improve**
   - Review analytics
   - Train Captain AI
   - Optimize responses

---

**🎉 CONGRATULATIONS! Your AI Customer Support is ready!**

**Questions? Check the docs or reach out to the community!**
