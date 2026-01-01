# Deploy Send Email Function

## Cách 1: Qua Supabase Dashboard (Đơn giản nhất)

1. **Mở Supabase Dashboard:**
   https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/functions

2. **Create New Function:**

   - Click "Create a new function"
   - Name: `send-email`
   - Copy paste code từ `supabase/functions/send-email/index.ts`

3. **Set Secret:**

   - Vào Settings → Edge Functions → Secrets
   - Add: `RESEND_API_KEY` = `re_4JbEjrK1_56CH3wHuqfLSV1GhTmR8r1Dc`

4. **Test:**

```bash
curl -X POST https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"longsang063@gmail.com","template":"contactAutoReply","data":{"name":"Test"}}'
```

## Cách 2: Qua CLI (Cần login)

```bash
npx supabase login
npx supabase link --project-ref diexsbzqwsbpilsymnfb
npx supabase secrets set RESEND_API_KEY=re_4JbEjrK1_56CH3wHuqfLSV1GhTmR8r1Dc
npx supabase functions deploy send-email --no-verify-jwt
```

## Frontend đã sẵn sàng

- ContactSection.tsx ✅
- BookingForm.tsx ✅

Cả 2 đều gọi: `${VITE_SUPABASE_URL}/functions/v1/send-email`
