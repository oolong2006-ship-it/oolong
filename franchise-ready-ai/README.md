# Franchise Ready AI — منصة تقييم جاهزية الفرنشايز

منصة SaaS عربية (RTL) تساعد أصحاب المطاعم والكافيهات والمنشآت الخدمية على تقييم
جاهزية منشآتهم للامتياز التجاري (Franchise)، وإصدار تقرير PDF احترافي شامل يحمل
شعار المنشأة وبياناتها.

> **تنبيه قانوني:** التقرير الناتج تقرير استشاري أولي ومساند، ولا يُعد عقد امتياز
> نهائيًا أو وثيقة قانونية معتمدة إلا بعد مراجعته من مستشار قانوني مختص واستكمال
> المتطلبات النظامية.

## 🚀 احصل على رابط حيّ بنقرة واحدة

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oolong2006-ship-it/oolong/tree/claude/franchise-ready-ai-saas-ans6p1&root-directory=franchise-ready-ai&project-name=franchise-ready-ai&repository-name=franchise-ready-ai)

> اضبط **Root Directory = `franchise-ready-ai`** وأضف متغيرات البيئة. التفاصيل الكاملة في **[DEPLOY.md](./DEPLOY.md)**.

---

## التقنيات

| الطبقة | التقنية |
|--------|---------|
| الإطار | Next.js 16 (App Router) + TypeScript |
| الواجهة | Tailwind CSS v4 + RTL + خط Tajawal |
| قاعدة البيانات | PostgreSQL + Prisma ORM |
| المصادقة | JWT + جلسات في قاعدة البيانات + bcrypt |
| الدفع | نمط Adapter (Mock / Moyasar / HyperPay / Tap) |
| الذكاء الاصطناعي | نمط Adapter (Anthropic Claude) |
| التخزين | نمط Adapter (محلي / Supabase / S3) |
| توليد PDF | قوالب HTML + Playwright/Chromium |

---

## نموذج العمل

- سعر الخدمة: **1,999 ريال سعودي** (+ ضريبة القيمة المضافة 15%).
- كل عملية دفع ناجحة تمنح **رصيدًا واحدًا** لإنشاء تقرير منشأة واحدة.
- المستخدم يعبّئ البيانات على مراحل ويحفظها كمسودة.
- بعد إصدار PDF النهائي يُقفل المشروع.
- أي منشأة جديدة تتطلب دفعًا جديدًا.

### حالات المشروع
`draft → data_completed → ai_generated → preview_ready → final_issued → locked`

---

## التشغيل محليًا

### 1. المتطلبات
- Node.js 20+
- PostgreSQL 14+

### 2. التثبيت
```bash
npm install
cp .env.example .env   # ثم عدّل القيم
```

### 3. إعداد قاعدة البيانات
```bash
npx prisma generate      # توليد Prisma Client
npx prisma db push       # إنشاء الجداول
npm run db:seed          # زرع بيانات تجريبية (admin + user)
```

### 4. التشغيل
```bash
npm run dev              # وضع التطوير → http://localhost:3000
# أو
npm run build && npm run start   # وضع الإنتاج
```

### بيانات الدخول التجريبية (بعد db:seed)
| الدور | البريد | كلمة المرور |
|------|--------|-------------|
| مدير | `admin@franchise-ready.ai` | `Admin@1234!` |
| مستخدم | `test@example.com` | `Test@1234!` |

---

## متغيرات البيئة (`.env`)

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/franchise_ready_ai"
JWT_SECRET="change-this-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ANTHROPIC_API_KEY=""          # لتفعيل توليد التقرير بالذكاء الاصطناعي
PAYMENT_PROVIDER="mock"        # mock | moyasar | hyperpay | tap
STORAGE_PROVIDER="local"       # local | supabase
VAT_RATE="0.15"
PRICE_SAR="1999"
```

> إذا لم يُضبط `ANTHROPIC_API_KEY`، يعمل محرّك التقارير بنصوص بديلة (fallback)
> لتسهيل التطوير دون استهلاك API.

---

## بنية المشروع

```
src/
├── app/
│   ├── page.tsx                    # الصفحة التسويقية (Landing)
│   ├── pricing/                    # التسعير
│   ├── terms/  privacy/            # الشروط والخصوصية
│   ├── login/  register/           # المصادقة
│   ├── payment/                    # الدفع + callback
│   ├── dashboard/                  # لوحة المستخدم
│   │   ├── projects/
│   │   │   ├── new/                # إنشاء منشأة
│   │   │   └── [id]/
│   │   │       ├── wizard/         # جمع البيانات على مراحل
│   │   │       ├── files/          # رفع الملفات
│   │   │       ├── review/         # مراجعة البيانات
│   │   │       ├── score/          # درجة الجاهزية
│   │   │       ├── preview/        # معاينة التقرير
│   │   │       └── download/       # تحميل PDF النهائي
│   │   ├── credits/  profile/
│   ├── admin/                      # لوحة الإدارة
│   └── api/                        # كل نقاط النهاية (REST)
├── components/layout/              # Sidebar, DashboardLayout
├── lib/
│   ├── db.ts          # Prisma client
│   ├── auth.ts        # JWT + جلسات + bcrypt
│   ├── payment.ts     # محوّل الدفع
│   ├── ai.ts          # محوّل الذكاء الاصطناعي + حساب الدرجة
│   ├── storage.ts     # محوّل التخزين
│   └── wizard-config.ts  # تعريف أقسام وأسئلة الـ Wizard
├── templates/report.html           # قالب تقرير PDF (RTL)
└── middleware.ts                   # حماية المسارات
prisma/
├── schema.prisma                   # 11 جدولًا
└── seed.ts
```

---

## محرّك حساب الجاهزية (من 100)

| المحور | الوزن |
|--------|------|
| قوة العلامة التجارية | 15 |
| قابلية التكرار | 20 |
| وضوح المنتج | 10 |
| الاقتصاديات التشغيلية | 20 |
| الأنظمة والإجراءات | 15 |
| سلسلة التوريد | 10 |
| الجاهزية القانونية | 10 |

**التصنيف:** 85–100 جاهزة بدرجة عالية · 70–84 قابلة مع تحسينات ·
50–69 تحتاج بناء أنظمة · أقل من 50 غير جاهزة حاليًا.

---

## التقرير النهائي (28 قسمًا)

غلاف · إخلاء مسؤولية · فهرس · ملخص تنفيذي · ملف المنشأة · العلامة التجارية ·
درجة الجاهزية · تقييم الوضع · تحليل المنتجات · تحليل السوق · الجاهزية التشغيلية ·
النموذج المالي · نموذج الفرنشايز · الرسوم المقترحة · متطلبات الممنوح · دعم المانح ·
التدريب · سلسلة التوريد · ضبط الجودة · الأدلة المطلوبة · قائمة الامتثال السعودية ·
هيكل وثيقة الإفصاح · المخاطر والتخفيف · خارطة 90 يوم · خارطة 12 شهرًا ·
المعلومات الناقصة · توصية المستشار · الخطوات التالية.

---

## النشر (Production)

1. وفّر قاعدة PostgreSQL (Supabase / Neon / RDS).
2. اضبط متغيرات البيئة في منصة الاستضافة (Vercel موصى بها).
3. `npx prisma migrate deploy` على قاعدة الإنتاج.
4. لتوليد PDF على Vercel استخدم `@sparticuz/chromium` مع Playwright، أو شغّل
   التوليد على خدمة منفصلة تدعم Chromium.

---

## الأمان والخصوصية
- كلمات المرور مُشفّرة (bcrypt) · جلسات JWT في قاعدة البيانات.
- حماية المسارات عبر middleware + تحقق على مستوى كل API.
- التحقق من نوع/حجم الملفات (حد 25MB).
- منع التوليد النهائي المكرر وقفل المشروع بعد الإصدار.
- موافقات صريحة (consent) قبل الدفع وقبل إرسال البيانات للتحليل.
- لا تُستخدم بيانات المستخدمين لتدريب نماذج عامة.
