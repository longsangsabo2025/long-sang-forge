# PROJECT STATUS — Long Sang Forge
> Marketplace + Academy + AI Agent Platform
> Last updated: 2026-02-25

---

## QUICK INFO

| Field | Value |
|-------|-------|
| **URL** | [longsang.org](https://longsang.org) |
| **Stack** | React 18 + Vite + TypeScript + Supabase + Tailwind + shadcn/ui |
| **Supabase** | `diexsbzqwsbpilsymnfb` (shared) |
| **Vercel** | `prj_d8DawVOvwbov9CAfSHnWfbPBBTJA` / `long-sang-forge` |
| **Completion** | **92%** |
| **Revenue** | ⏳ Stripe Edge Function deployed, chờ API keys |

---

## CHECKLIST → 100%

### ✅ Core (DONE)
- [x] React 18 + Vite + TypeScript setup
- [x] 57 pages, ~50 routes
- [x] 17 admin pages (Dashboard, Users, Settings, AI, SEO, etc.)
- [x] Auth flow (Supabase auth + AdminRoute + UserRoute + ProtectedRoute)
- [x] Marketplace: 5 MVP agents (Lead Qualifier, Content Writer, SEO, Social, Data)
- [x] Academy routes connected
- [x] Investment Portal (4-tab)
- [x] SEO engine (auto-indexing, Search Console sync, sitemap gen)
- [x] AI Brain/knowledge base + sales consultant chat
- [x] PWA + Electron desktop support
- [x] i18n (Vietnamese/English)
- [x] 72+ DB migrations, 20+ Edge Functions
- [x] Ecosystem footer (links to all sister products)
- [x] Code-split vendor-charts (517KB → deferred)
- [x] Build: 5.76s, 107 precache entries

### ✅ Payments (Frontend)
- [x] Stripe client API (`src/lib/stripe/api.ts`) — checkout + portal
- [x] VNPay Edge Function (`supabase/functions/vnpay/`) — FULL (268 lines)
- [x] Casso webhook (`supabase/functions/casso-webhook/`) — bank auto-confirm (1381 lines)
- [x] Pricing page with Stripe/VNPay toggle
- [x] Subscription system (672 lines) — free/pro/vip tiers
- [x] DB schema: stripe_customer_id, stripe_subscription_id, price IDs

### ✅ Deploy (2026-02-25)
- [x] Vercel project linked
- [x] vercel.json configured (alias: longsang.org, www.longsang.org)
- [x] `npx vercel --prod` — deployed successfully
- [x] Domain longsang.org active

### ⏳ Stripe Backend (90% done)
- [x] Stripe Edge Function created (`supabase/functions/stripe/index.ts`)
- [x] Routes: create-checkout-session, customer-portal, webhook, test
- [x] Edge Function deployed to Supabase
- [x] Frontend wired to Edge Function URLs (`EDGE_FUNCTIONS.STRIPE.*`)
- [x] /stripe/test returns `{ success: true }`
- [ ] **Set STRIPE_SECRET_KEY** in Supabase secrets
- [ ] **Set STRIPE_WEBHOOK_SECRET** in Supabase secrets
- [ ] **Create Stripe Products** (Free, Pro, Vip) in Stripe Dashboard
- [ ] **Seed stripe_price_id_monthly + yearly** in `subscription_plans` table
- [ ] **Test checkout flow** end-to-end

### ⏳ VNPay Production
- [ ] Switch VNPay from sandbox to production keys
- [ ] Set VNPAY_TMN_CODE + VNPAY_HASH_SECRET (production)
- [ ] Test payment flow

### ⬜ Remaining for 100%
- [ ] Google Analytics ID set (`VITE_GA_ID`)
- [ ] Real marketplace agent execution (currently mock)
- [ ] Email notifications (Resend/SendGrid keys)
- [ ] First real user signup
- [ ] First paid subscription

---

## BLOCKERS

| Blocker | Owner | Impact | ETA |
|---------|:-----:|--------|:---:|
| No Stripe API keys | CEO | Can't process payments | 15 min |
| VNPay sandbox mode | CEO | Vietnam payments blocked | 15 min |
| No GA4 tracking | CTO | Can't measure traffic | 5 min |

---

## RECENT CHANGES

| Date | Change |
|------|--------|
| 2026-02-25 | Deployed to longsang.org via Vercel |
| 2026-02-25 | Created + deployed Stripe Edge Function |
| 2026-02-25 | Fixed stripe API client → Edge Function URL |
| 2026-02-25 | Added STRIPE to EDGE_FUNCTIONS config |
| 2026-02-25 | Marketplace + Academy routes connected |
| 2026-02-25 | 5 bugs fixed (imports, PWA manifest, debug logging) |
