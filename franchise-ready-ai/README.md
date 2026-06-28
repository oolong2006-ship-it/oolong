# Franchise Ready AI — منصة تقييم جاهزية الفرنشايز

منصة SaaS عربية احترافية تساعد أصحاب المطاعم والكافيهات على تقييم جاهزيتهم للفرنشايز وإصدار تقرير PDF شامل.

## متطلبات التشغيل

- Node.js 18+
- PostgreSQL 14+
- (اختياري) حساب Anthropic API للتحليل الذكي

## التثبيت والتشغيل

```bash
# 1. انسخ ملف البيئة
cp .env.example .env

# 2. عدّل المتغيرات في .env
# DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY

# 3. ثبّت المكتبات
npm install

# 4. ولّد Prisma Client
npx prisma generate

# 5. أنشئ قاعدة البيانات
npx prisma db push

# 6. أدخل بيانات أولية
npm run db:seed

# 7. شغّل المشروع
npm run dev
```

المشروع يعمل على: http://localhost:3000

## بيانات الدخول للاختبار

- **مدير النظام**: admin@franchise-ready.ai / Admin@1234!
- **مستخدم تجريبي**: test@example.com / Test@1234!

## هيكل المشروع

```
src/
├── app/
│   ├── page.tsx              # الصفحة الرئيسية (Landing Page)
│   ├── login/                # تسجيل الدخول
│   ├── register/             # إنشاء حساب
│   ├── payment/              # الدفع
│   ├── pricing/              # التسعير
│   ├── terms/                # الشروط والأحكام
│   ├── privacy/              # سياسة الخصوصية
│   ├── dashboard/
│   │   ├── page.tsx          # لوحة التحكم
│   │   ├── projects/         # إدارة المشاريع
│   │   │   └── [id]/
│   │   │       ├── wizard/   # معالج جمع البيانات
│   │   │       ├── files/    # رفع الملفات
│   │   │       ├── review/   # مراجعة البيانات
│   │   │       ├── score/    # درجة الجاهزية
│   │   │       ├── preview/  # معاينة التقرير
│   │   │       └── download/ # تحميل PDF
│   │   ├── credits/          # رصيد المشاريع
│   │   └── profile/          # الملف الشخصي
│   ├── admin/
│   │   ├── page.tsx          # لوحة الإدارة
│   │   ├── users/            # إدارة المستخدمين
│   │   ├── payments/         # المدفوعات
│   │   └── projects/         # المشاريع
│   └── api/
│       ├── auth/             # مسارات المصادقة
│       ├── payment/          # مسارات الدفع
│       ├── user/             # بيانات المستخدم
│       ├── projects/         # إدارة المشاريع
│       └── admin/            # APIs الإدارة
├── lib/
│   ├── auth.ts               # المصادقة وإدارة الجلسات
│   ├── ai.ts                 # محرك الذكاء الاصطناعي
│   ├── payment.ts            # بوابة الدفع (adapter pattern)
│   ├── storage.ts            # تخزين الملفات
│   ├── db.ts                 # Prisma client
│   ├── utils.ts              # دوال مساعدة
│   └── wizard-config.ts      # إعدادات معالج البيانات
├── components/
│   └── layout/
│       ├── Sidebar.tsx       # الشريط الجانبي
│       └── DashboardLayout.tsx
├── templates/
│   └── report.html           # قالب PDF
└── types/
    └── index.ts              # أنواع TypeScript
```

## نموذج العمل

- **السعر**: 1,999 ريال سعودي (+ 15% VAT)
- **كل دفعة** = رصيد مشروع واحد
- **كل رصيد** = تقرير منشأة واحد (100+ صفحة PDF)
- **بعد الإصدار**: المشروع مقفل، أي تعديل يتطلب دفعة جديدة

## ربط بوابة الدفع

المشروع يدعم نمط الـ Adapter. لربط بوابة حقيقية:

```typescript
// في src/lib/payment.ts
// أنشئ class جديد يطبق PaymentProvider interface
class MoyasarProvider implements PaymentProvider {
  async createPayment(params) { /* ... */ }
  async verifyPayment(reference) { /* ... */ }
}

// ثم في paymentService factory:
case "moyasar": return new MoyasarProvider()
```

ثم ضع في `.env`:
```
PAYMENT_PROVIDER=moyasar
MOYASAR_API_KEY=sk_live_...
```

## توليد التقرير

1. المستخدم يملأ البيانات عبر الـ Wizard (9 أقسام)
2. يرفع الملفات (شعار، ملفات تجارية)
3. يضغط "ابدأ التحليل" → يُرسل إلى Claude AI
4. AI تحلل البيانات وتكتب 28 قسمًا بالعربية
5. يُعاين التقرير ويصدر PDF احترافي
6. يُقفل المشروع بعد الإصدار النهائي

## المتغيرات البيئية

| المتغير | الوصف | مطلوب |
|---------|-------|--------|
| DATABASE_URL | رابط PostgreSQL | ✅ |
| JWT_SECRET | مفتاح التوقيع (32+ حرف) | ✅ |
| ANTHROPIC_API_KEY | مفتاح API للذكاء الاصطناعي | ✅ |
| PAYMENT_PROVIDER | mock / moyasar / tap | اختياري |
| STORAGE_PROVIDER | local / supabase | اختياري |
| NEXT_PUBLIC_APP_URL | رابط التطبيق | اختياري |
| VAT_RATE | نسبة الضريبة (0.15) | اختياري |
| PRICE_SAR | سعر الخدمة (1999) | اختياري |

## الأمان

- كلمات المرور مشفرة بـ bcryptjs (12 rounds)
- الجلسات مخزنة في قاعدة البيانات
- ملفات المستخدمين محمية بـ signed URLs
- Rate limiting على مسارات المصادقة
- Audit logs لكل عملية
- منع تكرار إصدار التقرير

---

بُني بواسطة: Franchise Ready AI Team
