# Second Brain for Users - Documentation

> **Version:** 1.0.0
> **Created:** 2026-01-03
> **Status:** Production Ready

## 🧠 Overview

Second Brain là tính năng cho phép users tạo hệ thống quản lý tri thức cá nhân được hỗ trợ bởi AI. Users có thể import kiến thức từ nhiều nguồn và chat với AI để truy vấn, tổng hợp thông tin.

## 🏗️ Architecture

### Database Tables

| Table                | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `user_brain_quotas`  | Track usage limits per user per month    |
| `user_brain_imports` | Track import jobs (YouTube, URL, PDF)    |
| `user_brain_chats`   | Store chat history with brain            |
| `brain_plan_limits`  | Define limits for each subscription plan |

### Edge Functions

| Function       | Purpose                              |
| -------------- | ------------------------------------ |
| `brain-import` | Import content from YouTube/URL/text |
| `brain-chat`   | Chat with personal knowledge base    |

### React Components

| Component         | Path                                            |
| ----------------- | ----------------------------------------------- |
| `UserSecondBrain` | `src/brain/components/user/UserSecondBrain.tsx` |
| `UserBrainChat`   | `src/brain/components/user/UserBrainChat.tsx`   |
| `UserBrainImport` | `src/brain/components/user/UserBrainImport.tsx` |

### Pages

| Route            | Page                             |
| ---------------- | -------------------------------- |
| `/my-brain`      | User's personal brain dashboard  |
| `/brain/pricing` | Pricing plans for brain          |
| `/brain`         | Admin brain dashboard (existing) |

## 💰 Pricing Plans

| Feature             | Free | Pro (199k/mo) | Team (499k/mo) |
| ------------------- | ---- | ------------- | -------------- |
| Documents           | 50   | 500           | 2,000          |
| Queries/month       | 100  | 1,000         | 5,000          |
| Domains             | 3    | 10            | 50             |
| URL Import          | ✅   | ✅            | ✅             |
| YouTube Import      | ❌   | ✅            | ✅             |
| PDF Import          | ❌   | ✅            | ✅             |
| API Access          | ❌   | ✅            | ✅             |
| Priority Processing | ❌   | ❌            | ✅             |

## 🚀 Deployment

### 1. Run Database Migration

```bash
node scripts/run-second-brain-migration.cjs
```

Or apply SQL directly:

```sql
-- File: supabase/migrations/20260103_second_brain_user.sql
```

### 2. Deploy Edge Functions

```bash
# Import function
npx supabase functions deploy brain-import --no-verify-jwt

# Chat function
npx supabase functions deploy brain-chat --no-verify-jwt
```

### 3. Build Frontend

```bash
npm run build
```

## 🔒 Security

- **RLS Policies**: Users can only access their own data
- **Quota Enforcement**: Check quota before every operation
- **Rate Limiting**: Built into quota system

## 📱 User Flow

```
1. User logs in
2. Navigate to /my-brain
3. See quota overview (documents, queries, domains)
4. Import knowledge:
   - Paste URL → System fetches & chunks content
   - Paste YouTube URL (Pro) → System extracts transcript
   - Type text manually → System saves directly
5. Chat with brain:
   - Ask questions
   - AI searches knowledge base
   - AI responds with context
6. View referenced knowledge
7. Upgrade plan if needed → /brain/pricing
```

## 🔧 API Reference

### Import Content

```typescript
POST /functions/v1/brain-import
{
  userId: string,
  sourceType: "youtube" | "url" | "text",
  sourceUrl?: string,
  content?: string,
  title?: string,
  domainId?: string
}
```

### Chat with Brain

```typescript
POST /functions/v1/brain-chat
{
  userId: string,
  message: string,
  sessionId?: string,
  domainId?: string,
  messages?: Array<{role: string, content: string}>
}
```

## 📊 Hooks

```typescript
// Get quota
const { data: quota } = useUserBrainQuota();

// Import content
const importMutation = useImportContent();
await importMutation.mutateAsync({ sourceType: "url", sourceUrl: "..." });

// Chat
const { messages, sendMessage, isLoading } = useUserBrainChat();
await sendMessage("What did I learn about X?");

// Get domains
const { data: domains } = useUserBrainDomains();
```

## 🎯 Next Steps (Future)

1. **PDF Import**: Add PDF parsing with pdf-parse
2. **Notion Import**: Connect to Notion API
3. **Chrome Extension**: One-click save to brain
4. **Mobile App**: React Native app for brain
5. **Team Sharing**: Share knowledge between team members
6. **Smart Summaries**: Auto-generate weekly summaries

---

**Files Created:**

- `supabase/migrations/20260103_second_brain_user.sql`
- `supabase/functions/brain-import/index.ts`
- `supabase/functions/brain-chat/index.ts`
- `src/brain/lib/services/user-brain-api.ts`
- `src/brain/hooks/useUserBrain.ts`
- `src/brain/components/user/UserSecondBrain.tsx`
- `src/brain/components/user/UserBrainChat.tsx`
- `src/brain/components/user/UserBrainImport.tsx`
- `src/pages/MyBrain.tsx`
- `src/pages/BrainPricing.tsx`
- `scripts/run-second-brain-migration.cjs`
