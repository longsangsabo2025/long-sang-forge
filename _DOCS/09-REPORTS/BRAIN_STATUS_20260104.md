# 🧠 AI BRAIN STATUS - 2026-01-04

## Tổng quan

| Metric               | Value        |
| -------------------- | ------------ |
| **Total Documents**  | 526          |
| **Total Categories** | 50           |
| **Company Settings** | 18           |
| **Dynamic Pricing**  | ✅ Real-time |
| **AI Model**         | gpt-4o-mini  |

## Brain Categories (Top 20)

| Category                    | Count |
| --------------------------- | ----- |
| productivity                | 59    |
| health                      | 49    |
| learning                    | 32    |
| finance                     | 32    |
| ai                          | 26    |
| Business & Entrepreneurship | 25    |
| self-improvement            | 19    |
| development                 | 19    |
| marketing                   | 18    |
| vietnamese-finance          | 15    |
| ai-automation-agency        | 15    |
| ai-tutorials                | 15    |
| mental-health               | 13    |
| leadership                  | 13    |
| design                      | 12    |
| seo                         | 12    |
| business                    | 12    |
| psychology                  | 11    |
| startup-ceo                 | 10    |
| web-dev-education           | 10    |

## Platform Knowledge

| Category           | Count  |
| ------------------ | ------ |
| company            | 2      |
| services           | 1      |
| product            | 2      |
| process            | 2      |
| faq                | 1      |
| policy             | 1      |
| portfolio          | 1      |
| technical          | 3      |
| **Total Platform** | **13** |

## Dynamic Company Settings (NEW)

Bảng `company_settings` với 18 settings:

### Contact (3)

- contact_email
- contact_phone
- contact_address

### Pricing (6)

- pricing_landing_page: 3-5 triệu
- pricing_business_website: 8-15 triệu
- pricing_ecommerce: 15-30 triệu
- pricing_mobile_app: 30-100 triệu
- pricing_ai_chatbot: 5-20 triệu
- pricing_second_brain: 99k-499k/tháng

### Promotion (1)

- current_promotion: NEWYEAR2026 - Giảm 10%

### Others (8)

- company_info
- working_hours
- social_links
- payment_bank
- payment_policy
- warranty_policy
- chatbot_greeting
- quick_facts

## AI Integration Flow

```
User Message
     ↓
┌─────────────────────────────────┐
│    Sales Consultant Edge Fn     │
├─────────────────────────────────┤
│ 1. Load AI Config (cache 5min)  │
│ 2. Query company_settings       │
│ 3. Generate embedding           │
│ 4. Search knowledge_base        │
│ 5. Build enhanced prompt        │
│    - Memory context             │
│    - Dynamic pricing            │
│    - Promotion                  │
│    - Knowledge context          │
│ 6. Call OpenAI                  │
│ 7. Return response              │
└─────────────────────────────────┘
     ↓
AI Response (with dynamic data)
```

## API Endpoints

| Endpoint                       | Method | Description              |
| ------------------------------ | ------ | ------------------------ |
| `?path=health`                 | GET    | Health check             |
| `?path=pricing`                | GET    | Get dynamic pricing      |
| `?path=settings`               | GET    | Get all company settings |
| `?path=credits&userId=xxx`     | GET    | Get user credits         |
| `?path=preferences&userId=xxx` | GET    | Get AI preferences       |
| (body)                         | POST   | Chat with AI             |
| `?path=preferences`            | POST   | Save AI preferences      |
| `?path=preferences&userId=xxx` | DELETE | Delete preferences       |

## Scripts Available

| Script                           | Description                   |
| -------------------------------- | ----------------------------- |
| `setup-company-settings-v2.cjs`  | Seed company settings data    |
| `update-company-setting.cjs`     | Update specific setting       |
| `import-platform-knowledge.cjs`  | Import platform knowledge     |
| `import-deepwork-adhd.cjs`       | Import Deep Work/ADHD content |
| `import-health-articles.cjs`     | Import health articles        |
| `import-psychology-articles.cjs` | Import psychology articles    |

## Quick Commands

```bash
# List all company settings
node scripts/update-company-setting.cjs --list

# Get specific setting
node scripts/update-company-setting.cjs --get pricing_landing_page

# Update setting
node scripts/update-company-setting.cjs current_promotion '{"active": false}'

# Test AI chat
$body = '{"userMessage": "Gia website bao nhieu?", "messages": []}'
Invoke-RestMethod -Uri "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

## Version History

- v4.0-dynamic (2026-01-04): Added company_settings integration
- v3.2-brain: pgvector knowledge search
- v3.0-supabase: Edge Function migration
- v2.0: AI personalization (Pro/VIP)
- v1.0: Basic chat

---

_Report generated: 2026-01-04_
