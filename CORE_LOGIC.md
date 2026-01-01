# CORE_LOGIC - LONG SANG FORGE

> **First Principles Accuracy**: Mọi thông tin được trích xuất từ source code thực tế, không phải README tổng hợp.

## 1. Technology Stack
*Source: `package.json`*

```json
{
  "react": "^18.3.1",
  "typescript": "^5.8.3",
  "vite": "^5.4.21",
  "@supabase/supabase-js": "^2.75.0",
  "@tanstack/react-query": "^5.83.0",
  "react-router-dom": "^6.30.1",
  "tailwindcss": "^3.4.17",
  "framer-motion": "^12.23.24",
  "openai": "^6.8.1",
  "stripe": "^19.3.0",
  "electron": "^39.2.4",
  "n8n": "^1.117.3",
  "i18next": "^25.6.0"
}
```

### Build Configurations
- **Web**: Vite → Vercel
- **Desktop**: Electron Builder (Win/Mac/Linux)
- **API**: Express.js on port 3001
- **Workflows**: n8n integrated

## 2. Application Routes
*Source: `src/App.tsx`*

### Public Pages (Portfolio & Marketing)
```typescript
const Index = lazy(() => import("./pages/Index"));
const CVPage = lazy(() => import("./pages/cv/CVPage"));
const PricingPage = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
```

### Project Showcase & Investment
```typescript
const EnhancedProjectShowcase = lazy(() => import("./pages/EnhancedProjectShowcase"));
const AppShowcaseDetail = lazy(() => import("./pages/AppShowcaseDetail"));
const ProjectInterest = lazy(() => import("./pages/ProjectInterest"));

// Investment Portal (nested routes)
const InvestmentPortalLayout = lazy(() => import("./pages/InvestmentPortalLayout"));
const InvestmentOverview = lazy(() => import("./pages/InvestmentOverview"));
const InvestmentRoadmap = lazy(() => import("./pages/InvestmentRoadmap"));
const InvestmentFinancials = lazy(() => import("./pages/InvestmentFinancials"));
const InvestmentApply = lazy(() => import("./pages/InvestmentApply"));
```

### Academy & Marketplace
```typescript
const Academy = lazy(() => import("./pages/Academy"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const LearningPathPage = lazy(() => import("./pages/LearningPathPage"));
const MVPMarketplace = lazy(() => import("./components/agent-center/MVPMarketplace"));
const AgentDetailPage = lazy(() => import("./pages/AgentDetailPage"));
```

### AI Second Brain
```typescript
const BrainDashboard = lazy(() => import("./pages/BrainDashboard"));
const DomainView = lazy(() => import("./pages/DomainView"));
```

### Route Definitions
| Route | Component | Access |
|-------|-----------|--------|
| `/` | Index | Public |
| `/cv` | CVPage | Public |
| `/pricing` | PricingPage | Public |
| `/payment-success` | PaymentSuccess | Public |
| `/project-showcase` | EnhancedProjectShowcase | Public |
| `/project-showcase/:slug` | AppShowcaseDetail | Public |
| `/project-showcase/:slug/interest` | ProjectInterest | Public |
| `/project-showcase/:slug/investment` | InvestmentPortalLayout | Public |
| `/project-showcase/:slug/investment/roadmap` | InvestmentRoadmap | Public |
| `/project-showcase/:slug/investment/financials` | InvestmentFinancials | Public |
| `/project-showcase/:slug/investment/apply` | InvestmentApply | Public |
| `/academy` | Academy | Public |
| `/academy/course/:id` | CourseDetail | Public |
| `/academy/learning-path` | LearningPathPage | Public |
| `/marketplace` | MVPMarketplace | Public |
| `/marketplace/:agentId` | AgentDetailPage | Public |
| `/brain` | BrainDashboard | Public |
| `/brain/domain/:id` | DomainView | Public |
| `/dashboard` | UserDashboard | Auth |
| `/auth/callback` | AuthCallback | Public |

## 3. Academy System Types
*Source: `src/types/academy.ts`*

### Course Model
```typescript
export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  instructor_id?: string;
  instructor?: Instructor;
  thumbnail_url?: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_hours: number;
  total_lessons: number;
  language: string;
  price: number;
  original_price?: number;
  is_free: boolean;
  is_published: boolean;
  tags: string[];
  what_you_learn: string[];
  requirements: string[];
  features: string[];
  total_students: number;
  average_rating: number;
  total_reviews: number;
  last_updated: string;
}
```

### Lesson Model
```typescript
export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'article' | 'quiz' | 'code' | 'assignment';
  video_url?: string;
  article_content?: string;
  duration_minutes: number;
  is_free_preview: boolean;
  order_index: number;
  resources: LessonResource[];
}
```

### Enrollment & Progress
```typescript
export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  last_accessed_lesson_id?: string;
  certificate_issued: boolean;
  certificate_url?: string;
}

export interface LessonProgress {
  is_completed: boolean;
  watch_time_seconds: number;
  last_position_seconds: number;
}
```

## 4. App Showcase Types
*Source: `src/types/app-showcase.types.ts`*

```typescript
export interface AppShowcaseData {
  id: string;
  slug: string;
  appName: string;
  tagline: string;
  description: string;
  icon?: string;
  productionUrl?: string;
  
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    stats: { users: string; rating: string; tournaments: string };
    backgroundImage?: string;
  };
  
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  
  downloads: { appStore?: string; googlePlay?: string };
  social: { facebook?: string; instagram?: string; youtube?: string; tiktok?: string; discord?: string; twitter?: string };
  features: AppFeature[];
  
  cta: {
    heading: string;
    description: string;
    rating: { score: string; totalUsers: string };
  };
  
  metadata: {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    status: 'draft' | 'published';
  };
}

export interface AppFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  screenshot?: string;
  badge?: { text: string; color: string };
  highlights?: string[];
  stats?: { label: string; value: string; icon?: string }[];
}
```

## 5. Database Schema (Academy)
*Source: `supabase/migrations/20251111000002_academy_system.sql`*

### instructors
```sql
id UUID PRIMARY KEY,
user_id UUID REFERENCES auth.users(id),
name TEXT NOT NULL,
title TEXT,
bio TEXT,
avatar_url TEXT,
total_students INTEGER DEFAULT 0,
total_courses INTEGER DEFAULT 0,
average_rating DECIMAL(3,2) DEFAULT 0.00
```

### courses
```sql
id UUID PRIMARY KEY,
title TEXT NOT NULL,
subtitle TEXT,
description TEXT,
instructor_id UUID REFERENCES instructors(id),
thumbnail_url TEXT,
category TEXT NOT NULL,
level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
duration_hours DECIMAL(5,2),
total_lessons INTEGER DEFAULT 0,
language TEXT DEFAULT 'Tiếng Việt',
price DECIMAL(10,2) DEFAULT 0,
original_price DECIMAL(10,2),
is_free BOOLEAN DEFAULT false,
is_published BOOLEAN DEFAULT false,
tags TEXT[] DEFAULT '{}',
what_you_learn TEXT[] DEFAULT '{}',
requirements TEXT[] DEFAULT '{}',
features TEXT[] DEFAULT '{}',
total_students INTEGER DEFAULT 0,
average_rating DECIMAL(3,2) DEFAULT 0.00,
total_reviews INTEGER DEFAULT 0
```

### lessons
```sql
id UUID PRIMARY KEY,
section_id UUID REFERENCES course_sections(id),
title TEXT NOT NULL,
description TEXT,
content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'quiz', 'code', 'assignment')),
video_url TEXT,
article_content TEXT,
duration_minutes INTEGER,
is_free_preview BOOLEAN DEFAULT false,
order_index INTEGER NOT NULL,
resources JSONB DEFAULT '[]'
```

### course_enrollments
```sql
user_id UUID REFERENCES auth.users(id),
course_id UUID REFERENCES courses(id),
enrolled_at TIMESTAMPTZ DEFAULT NOW(),
completed_at TIMESTAMPTZ,
progress_percentage INTEGER DEFAULT 0,
last_accessed_lesson_id UUID REFERENCES lessons(id),
certificate_issued BOOLEAN DEFAULT false,
certificate_url TEXT,
UNIQUE(user_id, course_id)
```

### course_reviews
```sql
rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
comment TEXT,
helpful_count INTEGER DEFAULT 0,
UNIQUE(user_id, course_id)
```

## 6. Database Schema (Investment)
*Source: `supabase/migrations/20241113_investment_tables.sql`*

### investment_applications
```sql
id UUID PRIMARY KEY,
project_id INTEGER NOT NULL,
project_slug TEXT NOT NULL,
project_name TEXT NOT NULL,

-- Personal Information (Step 1)
full_name TEXT NOT NULL,
email TEXT NOT NULL,
phone TEXT NOT NULL,
address TEXT NOT NULL,

-- Investment Details (Step 2)
investment_amount NUMERIC NOT NULL,
investor_type TEXT NOT NULL CHECK (investor_type IN ('individual', 'institution', 'fund')),
company_name TEXT,
investment_purpose TEXT NOT NULL,

-- Experience & Verification (Step 3)
investment_experience TEXT NOT NULL,
risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('low', 'medium', 'high')),
identity_document TEXT NOT NULL,

-- Legal Agreements (Step 4)
agree_terms BOOLEAN NOT NULL DEFAULT false,
agree_risk BOOLEAN NOT NULL DEFAULT false,
agree_privacy BOOLEAN NOT NULL DEFAULT false,

-- Status
status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'contacted')),
admin_notes TEXT
```

### project_interests
```sql
project_id INTEGER NOT NULL,
project_slug TEXT NOT NULL,
project_name TEXT NOT NULL,
full_name TEXT NOT NULL,
email TEXT NOT NULL,
phone TEXT NOT NULL,
message TEXT,
status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'not_interested'))
```

## 7. Express.js API Server
*Source: `api/server.js`*

### API Routes
| Endpoint | Module | Description |
|----------|--------|-------------|
| `/api/drive` | google-drive | Google Drive integration |
| `/api/google/analytics` | google/analytics | GA4 data |
| `/api/google/calendar` | google/calendar | Calendar events |
| `/api/google/gmail` | google/gmail | Email sending |
| `/api/google/maps` | google/maps | Maps/Places |
| `/api/google/indexing` | google/indexing | SEO indexing |
| `/api/credentials` | credentials | API keys storage |
| `/api/email` | email | Email sending (Nodemailer) |
| `/api/vnpay` | vnpay | VNPay payment |
| `/api/agents` | agents | AI Agents CRUD |
| `/api/seo` | seo | SEO analysis |
| `/api/investment` | investment | Investment applications |
| `/api/project` | project-interest | Project interest forms |
| `/api/ai-assistant` | ai-assistant | AI chat |
| `/api/ai-review` | ai-review | AI code review |
| `/api/analytics` | web-vitals | Performance metrics |
| `/api/brain/domains` | brain/domains | Domain management |
| `/api/brain/knowledge` | brain/knowledge | Knowledge CRUD |

### Server Configuration
```javascript
const PORT = process.env.API_PORT || process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

## 8. App Providers Stack
*Source: `src/App.tsx`*

```tsx
<ErrorBoundary>
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="longsang-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>...</Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
</ErrorBoundary>
```

## 9. Frontend Structure
*Source: `src/` directory*

```
src/
├── pages/               # Route components (lazy loaded)
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # AuthProvider, AuthDialog
│   ├── academy/         # Course cards, player
│   ├── agent-center/    # Marketplace components
│   ├── sections/        # Homepage sections
│   └── theme/           # ThemeProvider
├── types/               # TypeScript interfaces
│   ├── academy.ts       # Course, Lesson, Enrollment
│   ├── app-showcase.types.ts  # AppShowcaseData
│   └── automation.ts    # Workflow types
├── hooks/               # Custom React hooks
├── contexts/            # React Context providers
├── lib/                 # Utilities, Supabase client
├── services/            # API service functions
├── integrations/        # Generated Supabase types
├── i18n/                # Internationalization setup
└── locales/             # Translation JSON files
```

## 10. NPM Scripts
*Source: `package.json`*

### Development
```bash
npm run dev              # Frontend + API (concurrently)
npm run dev:frontend     # Vite dev server
npm run dev:api          # Express API server
npm run dev:full         # Frontend + API + n8n
```

### Desktop (Electron)
```bash
npm run desktop          # Run Electron app
npm run desktop:dev      # Development mode
npm run desktop:build    # Build for current OS
npm run desktop:build:win # Windows build
npm run desktop:build:mac # macOS build
npm run desktop:build:linux # Linux build
```

### Testing
```bash
npm run test             # Vitest watch mode
npm run test:run         # Run once
npm run test:coverage    # With coverage
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests
npm run test:marketplace # Marketplace E2E
```

### SEO Tools
```bash
npm run seo:analyze      # Run SEO analyzer
npm run seo:monitor      # Performance monitor
npm run seo:generate-sitemap # Generate sitemap
npm run seo:audit        # Full SEO audit
npm run seo:keywords     # Keyword research
npm run seo:score        # Calculate scores
npm run seo:full-report  # All SEO checks
```

### Deployment
```bash
npm run build            # Production build
npm run deploy:db        # Supabase migrations
npm run deploy:functions # Edge functions
npm run vercel:deploy    # Vercel deployment
```

### n8n Workflows
```bash
npm run n8n:start        # Start n8n
npm run n8n:dev          # Start with tunnel
npm run workflows:create # Auto-create workflows
```

## 11. Electron Configuration
*Source: `package.json` → build*

```json
{
  "appId": "com.longsang.portfolio",
  "productName": "Long Sang Portfolio",
  "directories": { "output": "release" },
  "files": ["dist/**/*", "electron/**/*"],
  "win": { "target": ["nsis", "portable"] },
  "mac": { "target": ["dmg"] },
  "linux": { "target": ["AppImage"] },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

## 12. Environment Variables
*Source: `.env.example`*

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# AI
VITE_OPENAI_API_KEY=
VITE_ANTHROPIC_API_KEY=

# Google APIs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

# Payment
STRIPE_SECRET_KEY=
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=

# API Server
API_PORT=3001
```

---

*Document generated from actual source code analysis following First Principles methodology.*
