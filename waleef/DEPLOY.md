# نشر وليف — Deploying Waleef

تطبيق وليف يستخدم **Next.js مع API route** (`/api/chat`)، فيحتاج استضافة تشغّل خادم
— لذلك **Vercel** هو الخيار الأنسب والأسهل. عندك طريقتان:

---

## الطريقة (1): لوحة Vercel — الأسهل، بدون أي كود ✅

هذي أسرع طريقة تشوف فيها التطبيق برابط عام، وتعطيك معاينة تلقائية لكل تحديث.

1. ادخل [vercel.com](https://vercel.com) وسجّل دخول بحساب GitHub.
2. **Add New → Project**، واختر مستودع `oolong2006-ship-it/oolong`.
   - لو طلب صلاحيات الوصول للمستودع، اعطِه إياها (هذي «الصلاحيات» المطلوبة).
3. في إعدادات المشروع، عيّن:
   - **Root Directory** = `waleef`
   - **Framework Preset** = Next.js (يتعرّف عليه تلقائيًا)
4. **Deploy**.

بعد دقيقة تقريبًا راح يعطيك رابطًا مثل `https://waleef.vercel.app` تفتحه من الجوال مباشرة.
وأي دفعة جديدة على الفرع تنشر تلقائيًا، وكل Pull Request يحصل على رابط معاينة خاص.

---

## الطريقة (2): نشر تلقائي عبر GitHub Actions 🤖

جاهزة في `/.github/workflows/deploy-waleef.yml`. تنشر تلقائيًا عند كل دفعة تلمس
مجلد `waleef/`. كل اللي تحتاجه إضافة **سر واحد فقط** في المستودع:

`Settings → Secrets and variables → Actions → New repository secret`

| الاسم | القيمة |
|---|---|
| `VERCEL_TOKEN` | توكن من [vercel.com/account/tokens](https://vercel.com/account/tokens) ← اضغط **Create Token** وانسخه |

> Vercel ينشئ المشروع تلقائيًا عند أول نشر، فما تحتاج `ORG_ID` ولا `PROJECT_ID`.

**الخطوات:**
1. سجّل دخول [vercel.com](https://vercel.com) بحساب GitHub.
2. روح [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create Token** → انسخ القيمة.
3. في المستودع: `Settings → Secrets and variables → Actions → New repository secret`
   - الاسم: `VERCEL_TOKEN`
   - القيمة: التوكن اللي نسخته
4. روح تبويب **Actions → Deploy Waleef to Vercel → Run workflow** (أو ادفع أي تغيير).
5. بعد ما يخلص، رابط التطبيق يظهر في ملخص التشغيل (Summary) أعلى الصفحة.

> ملاحظة: قبل إضافة السر، تتخطّى المهمة نفسها بهدوء وتبقى الـ CI خضراء — ما تفشل.

---

## تشغيل محلي للتجربة قبل النشر

```bash
cd waleef
npm install
npm run dev        # http://localhost:3000
```

---

### أي طريقة أختار؟
- تبي تشوفه بأسرع وقت وبدون أسرار؟ → **الطريقة (1)**.
- تبي نشرًا آليًا متكاملًا داخل الـ repo؟ → **الطريقة (2)**.
