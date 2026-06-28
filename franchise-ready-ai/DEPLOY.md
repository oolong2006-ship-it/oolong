# دليل النشر — Franchise Ready AI

هذا الدليل يأخذك من الصفر إلى **رابط حيّ** خلال دقائق.

---

## الخيار الأسرع: Vercel + Supabase (موصى به)

### 1. جهّز قاعدة بيانات PostgreSQL مجانية
- أنشئ مشروعًا على [Supabase](https://supabase.com) أو [Neon](https://neon.tech).
- انسخ **Connection String** (يبدأ بـ `postgresql://...`).

### 2. انشر على Vercel بنقرة
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oolong2006-ship-it/oolong/tree/claude/franchise-ready-ai-saas-ans6p1&root-directory=franchise-ready-ai&project-name=franchise-ready-ai&repository-name=franchise-ready-ai)

> **مهم:** عند الاستيراد اضبط **Root Directory = `franchise-ready-ai`**.

### 3. اضبط متغيرات البيئة في Vercel
| المتغير | القيمة |
|---------|--------|
| `DATABASE_URL` | connection string من Supabase/Neon |
| `JWT_SECRET` | أي نص عشوائي طويل وسري |
| `NEXT_PUBLIC_APP_URL` | رابط مشروعك على Vercel |
| `ANTHROPIC_API_KEY` | مفتاح Anthropic (اختياري — بدونه يعمل بنصوص بديلة) |
| `PAYMENT_PROVIDER` | `mock` (أو moyasar/hyperpay/tap عند التفعيل) |
| `STORAGE_PROVIDER` | `supabase` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` / `SUPABASE_BUCKET` | عند استخدام تخزين Supabase |
| `VAT_RATE` | `0.15` |
| `PRICE_SAR` | `1999` |

### 4. هيّئ الجداول (مرة واحدة)
من جهازك بعد ضبط `DATABASE_URL` على قاعدة الإنتاج:
```bash
cd franchise-ready-ai
npx prisma db push
npm run db:seed     # اختياري: ينشئ حساب admin وحساب تجريبي
```

### 5. تم 🎉
رابطك الحيّ سيكون: `https://<اسم-مشروعك>.vercel.app`

---

## ملاحظة حول توليد PDF على بيئة Serverless

يستخدم المشروع Playwright/Chromium لتوليد PDF من قوالب HTML. هذا يعمل مباشرة في
أي بيئة تملك Chromium (جهازك، أو Docker، أو خادم VPS).

على Vercel (serverless) يلزم بديل خفيف لـ Chromium:

```bash
npm install @sparticuz/chromium playwright-core
```

ثم في `src/app/api/projects/[id]/pdf/route.ts` استبدل إطلاق المتصفح بـ:
```ts
import chromium from "@sparticuz/chromium"
import { chromium as pw } from "playwright-core"

const browser = await pw.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: true,
})
```
وأضف في أعلى الملف: `export const maxDuration = 60`.

**البديل الأبسط:** انشر على منصة تدعم Docker (Railway / Render / Fly.io) حيث يعمل
Playwright الكامل دون تعديل.

---

## النشر على Railway / Render (يدعم Chromium كاملًا)

1. اربط المستودع، واضبط Root = `franchise-ready-ai`.
2. أضف قاعدة PostgreSQL من المنصة نفسها.
3. اضبط نفس متغيرات البيئة أعلاه.
4. أمر البناء: `npm install && npx prisma generate && npm run build`
5. أمر التشغيل: `npx prisma db push && npm run start`

---

## التشغيل محليًا (للتجربة الفورية)
```bash
cd franchise-ready-ai
npm install
cp .env.example .env          # عدّل DATABASE_URL على قاعدتك
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev                   # → http://localhost:3000
```
بيانات الدخول التجريبية:
- مدير: `admin@franchise-ready.ai` / `Admin@1234!`
- مستخدم: `test@example.com` / `Test@1234!`
