# 🚀 Long Sang Forge - Quick Start Guide

> **Project:** long-sang-portfolio v1.0.0  
> **Prerequisites:** Node.js 18+, npm/pnpm  
> **Time:** ~10 minutes

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm or pnpm
- ✅ Git
- ✅ Supabase account
- ✅ (Optional) Stripe account for payments
- ✅ (Optional) OpenAI API key for AI features

---

## ⚡ Quick Setup

### 1. Navigate to Project
```powershell
cd "D:\0.PROJECTS\01-MAIN-PRODUCTS\long-sang-forge"
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Environment Setup
```powershell
# Copy environment template
Copy-Item .env.example .env.local

# Edit with your credentials
code .env.local
```

### 4. Configure Environment Variables
```env
# .env.local

# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_xxx
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=sk-xxx

# Google Analytics (Optional)
GOOGLE_ANALYTICS_PROPERTY_ID=xxx
```

### 5. Link Supabase (if using existing project)
```powershell
npm run supabase:link
```

### 6. Start Development
```powershell
# Start both frontend + API
npm run dev

# Or start full stack with n8n
npm run dev:full
```

### 7. Open in Browser
```
Frontend: http://localhost:5173
API:      http://localhost:3001
```

---

## 📦 Available Scripts

### Development
| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + API |
| `npm run dev:frontend` | Start Vite only |
| `npm run dev:api` | Start API server only |
| `npm run dev:full` | Start all including n8n |

### Building
| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

### Desktop App
| Command | Description |
|---------|-------------|
| `npm run desktop` | Run Electron app |
| `npm run desktop:dev` | Dev mode Electron |
| `npm run desktop:build:win` | Build Windows installer |
| `npm run desktop:build:mac` | Build macOS DMG |

### Testing
| Command | Description |
|---------|-------------|
| `npm run test` | Run tests |
| `npm run test:ui` | Test with UI |
| `npm run test:coverage` | Coverage report |
| `npm run test:all` | Run all test suites |

### SEO Tools
| Command | Description |
|---------|-------------|
| `npm run seo:analyze` | Analyze SEO |
| `npm run seo:monitor` | Monitor performance |
| `npm run seo:generate-sitemap` | Generate sitemap |
| `npm run seo:full-report` | Full SEO report |

### Deployment
| Command | Description |
|---------|-------------|
| `npm run deploy:all` | Deploy everything |
| `npm run deploy:db` | Push database changes |
| `npm run deploy:functions` | Deploy edge functions |
| `npm run vercel:deploy` | Deploy to Vercel |

### n8n Workflows
| Command | Description |
|---------|-------------|
| `npm run n8n:start` | Start n8n |
| `npm run n8n:dev` | Start with tunnel |
| `npm run workflows:create` | Create workflows |

---

## 🔧 Tech Stack Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                  LONG SANG FORGE STACK                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend:    React 18.3 + TypeScript 5.8                       │
│  Build:       Vite 5.4.21 + SWC                                 │
│  Styling:     TailwindCSS 3.4.17 + Radix UI                     │
│  State:       TanStack Query 5.83.0                             │
│  Forms:       React Hook Form 7.61.1 + Zod 3.25.76              │
│  Backend:     Express.js + Supabase 2.75.0                      │
│  Desktop:     Electron 39.2.4                                   │
│  AI:          OpenAI 6.8.1                                      │
│  Payments:    Stripe 19.3.0                                     │
│  Email:       Nodemailer 7.0.10                                 │
│  Automation:  n8n 1.117.3                                       │
│  i18n:        i18next 25.6.0                                    │
│  Analytics:   Google Analytics Data API 5.2.1                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
long-sang-forge/
├── src/
│   ├── components/        # UI Components
│   │   ├── ui/            # shadcn/ui components
│   │   └── features/      # Feature components
│   ├── pages/             # Route pages
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── services/          # API services
│   ├── locales/           # i18n translations
│   └── types/             # TypeScript types
├── api/
│   └── server.js          # Express API server
├── electron/
│   └── main.cjs           # Electron main process
├── scripts/               # Build & utility scripts
├── supabase/
│   ├── functions/         # Edge functions
│   └── migrations/        # Database migrations
├── public/                # Static assets
├── _DOCS/                 # Documentation
├── vite.config.ts         # Vite config
├── tailwind.config.ts     # Tailwind config
└── package.json           # Dependencies
```

---

## 🔐 Admin Access

### Set Admin Role
```powershell
npm run admin:set-role -- --email your@email.com --role admin
```

### Admin Features
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/content` - Content management
- `/admin/analytics` - Analytics

---

## 🌐 Deployment

### Vercel (Recommended)
```powershell
# Deploy to Vercel
npm run vercel:deploy

# Check deployments
npm run vercel:deployments

# Manage env variables
npm run vercel:env
```

### Supabase Functions
```powershell
# Deploy edge functions
npm run deploy:functions
```

---

## 🧪 Testing

```powershell
# Unit tests
npm run test

# With coverage
npm run test:coverage

# E2E marketplace tests
npm run test:marketplace

# System tests
npm run test:system
```

---

## 🔄 n8n Workflow Automation

### Start n8n
```powershell
# Local n8n
npm run n8n:start

# With webhook tunnel (for testing)
npm run n8n:dev
```

### Access n8n
```
http://localhost:5678
```

### Auto-create workflows
```powershell
npm run workflows:create
```

---

## 📊 SEO Tools

```powershell
# Full SEO analysis
npm run seo:full-report

# Individual tools
npm run seo:analyze          # Site analysis
npm run seo:keywords         # Keyword research
npm run seo:generate-sitemap # Create sitemap
npm run seo:score            # Calculate scores
```

---

## ❓ Troubleshooting

### Port conflicts
```powershell
# Kill processes on ports
npx kill-port 5173 3001 5678
```

### Database issues
```powershell
# Reset Supabase link
npm run supabase:link

# Check status
npm run supabase:status
```

### Build errors
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Stripe API](https://stripe.com/docs/api)
- [OpenAI API](https://platform.openai.com/docs)

---

*Quick Start Guide - Generated 06/2025*
