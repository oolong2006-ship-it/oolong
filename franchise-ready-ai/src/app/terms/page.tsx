import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description: "شروط وأحكام استخدام منصة Franchise Ready AI",
};

const PRIMARY = "#1a5c3a";
const PRIMARY_DARK = "#0f3d26";
const SECONDARY = "#c9a84c";

function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 6px rgba(26,92,58,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 38, height: 38, borderRadius: 8,
              backgroundColor: PRIMARY, color: SECONDARY, fontWeight: 900, fontSize: 18,
            }}
          >
            F
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: PRIMARY }}>Franchise Ready AI</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: SECONDARY }}>فرنشايز ريدي</span>
          </span>
        </Link>
        <Link href="/" style={{ color: "#374151", fontWeight: 500, fontSize: 15, textDecoration: "none" }}>
          ← العودة للرئيسية
        </Link>
      </div>
    </nav>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: "2rem",
        marginBottom: "1.25rem",
        border: "1px solid #e2e8f0",
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: PRIMARY_DARK,
          fontSize: "1.1rem",
          fontWeight: 800,
          marginBottom: "1rem",
          paddingBottom: "0.75rem",
          borderBottom: `2px solid ${PRIMARY}`,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: PRIMARY,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {number}
        </span>
        {title}
      </h2>
      <div style={{ color: "#374151", fontSize: 15, lineHeight: 1.9 }}>{children}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#0f1f16",
        padding: "2rem 1.5rem",
        color: "rgba(255,255,255,0.65)",
        marginTop: "0",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: 13,
        }}
      >
        <span>© 2025 Franchise Ready AI. جميع الحقوق محفوظة.</span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/terms" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>شروط الاستخدام</Link>
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>سياسة الخصوصية</Link>
        </div>
      </div>
    </footer>
  );
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page Header */}
        <section
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
            padding: "3.5rem 1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h1
              style={{
                color: "#ffffff",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 900,
                marginBottom: "0.75rem",
              }}
            >
              شروط الاستخدام
            </h1>
            <p style={{ color: "rgba(255,255,255,0.70)", fontSize: 15, lineHeight: 1.7, marginBottom: "1rem" }}>
              يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة Franchise Ready AI
            </p>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.30)",
                color: SECONDARY,
                borderRadius: 8,
                padding: "0.4rem 1rem",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              آخر تحديث: يناير 2025
            </div>
          </div>
        </section>

        {/* Content */}
        <section style={{ backgroundColor: "#f8faf9", padding: "3rem 1.5rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            <Section number="1" title="تعريفات">
              <p style={{ marginBottom: "0.75rem" }}>في هذه الشروط والأحكام، تعني المصطلحات التالية:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}><strong>"المنصة"</strong>: موقع وتطبيق Franchise Ready AI وجميع خدماته المتاحة.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>"المستخدم"</strong>: أي شخص طبيعي أو اعتباري يصل إلى المنصة أو يستخدمها بأي صورة.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>"التقرير"</strong>: وثيقة PDF الاستشارية التي تُولّدها المنصة بناءً على البيانات التي يُدخلها المستخدم.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>"الخدمة"</strong>: منتج تقييم جاهزية الامتياز التجاري المقدَّم عبر المنصة.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>"الشركة"</strong>: الكيان القانوني المشغِّل لمنصة Franchise Ready AI.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>"المنشأة"</strong>: المشروع التجاري الذي يُقدّم المستخدم بياناته لأجل تقييمه.</li>
              </ul>
            </Section>

            <Section number="2" title="القبول بالشروط">
              <p style={{ marginBottom: "0.75rem" }}>
                باستخدامك لهذه المنصة أو التسجيل فيها أو الدفع مقابل الخدمة، فإنك تؤكد موافقتك الكاملة والصريحة
                على هذه الشروط والأحكام وسياسة الخصوصية المرفقة.
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                إذا كنت تتصرف نيابةً عن شركة أو كيان قانوني، فإنك تؤكد أن لديك الصلاحيات الكاملة والمخولة
                لإلزام ذلك الكيان بهذه الشروط.
              </p>
              <p>
                إذا كنت لا توافق على أي بند من هذه الشروط، فيجب عليك التوقف عن استخدام المنصة فوراً.
              </p>
            </Section>

            <Section number="3" title="طبيعة الخدمة ونطاقها">
              <p style={{ marginBottom: "0.75rem" }}>
                تقدم المنصة خدمة توليد تقارير استشارية أولية لتقييم مدى جاهزية المنشآت التجارية للتوسع
                عبر نظام الامتياز التجاري (الفرنشايز) في المملكة العربية السعودية.
              </p>
              <p style={{ marginBottom: "0.75rem" }}><strong>يُقرّ المستخدم ويتأكد بأن:</strong></p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>التقرير الناتج هو وثيقة استشارية أولية وليس عقد امتياز نهائياً بأي حال.</li>
                <li style={{ marginBottom: "0.6rem" }}>التقرير لا يُعدّ وثيقة قانونية معتمدة ولا يُغني عن مراجعة مستشار قانوني مختص ومرخّص.</li>
                <li style={{ marginBottom: "0.6rem" }}>جودة التقرير ودقته مرتبطتان ارتباطاً مباشراً بصحة واكتمال البيانات التي يُدخلها المستخدم.</li>
                <li style={{ marginBottom: "0.6rem" }}>الشركة غير مسؤولة عن أي قرارات تجارية أو قانونية أو استثمارية تُتخذ بناءً على محتوى التقرير.</li>
                <li style={{ marginBottom: "0.6rem" }}>المنصة لا تضمن قابلية المنشأة الفعلية للحصول على ترخيص امتياز أو نجاح نموذج الامتياز.</li>
              </ul>
            </Section>

            <Section number="4" title="متطلبات التسجيل والأهلية">
              <p style={{ marginBottom: "0.75rem" }}>لاستخدام الخدمة والتسجيل في المنصة، يجب على المستخدم:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>أن يكون عمره 18 عاماً أو أكثر، أو حائزاً على الأهلية القانونية الكاملة المعترف بها نظاماً.</li>
                <li style={{ marginBottom: "0.6rem" }}>تقديم معلومات صحيحة وحديثة ودقيقة وكاملة عند التسجيل وإدخال البيانات.</li>
                <li style={{ marginBottom: "0.6rem" }}>الحفاظ على سرية بيانات الدخول الخاصة به ومنع وصول الغير إليها.</li>
                <li style={{ marginBottom: "0.6rem" }}>إخطار الشركة فوراً عند اكتشاف أي استخدام غير مصرح به لحسابه.</li>
                <li style={{ marginBottom: "0.6rem" }}>الالتزام بعدم مشاركة حسابه مع أطراف ثالثة.</li>
              </ul>
            </Section>

            <Section number="5" title="الالتزامات والمحظورات">
              <p style={{ marginBottom: "0.75rem" }}><strong>يلتزم المستخدم صراحةً بعدم:</strong></p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>إدخال بيانات مزيفة أو مضللة أو غير دقيقة بأي قصد.</li>
                <li style={{ marginBottom: "0.6rem" }}>إعادة بيع التقرير أو توزيعه تجارياً لأطراف ثالثة دون إذن كتابي مسبق من الشركة.</li>
                <li style={{ marginBottom: "0.6rem" }}>محاولة اختراق أو تعطيل المنصة أو الوصول غير المصرح به إلى أنظمتها أو قواعد بياناتها.</li>
                <li style={{ marginBottom: "0.6rem" }}>استخدام المنصة لأي غرض غير مشروع أو مخالف للأنظمة والتشريعات السعودية.</li>
                <li style={{ marginBottom: "0.6rem" }}>ادعاء أن التقرير صادر عن جهة رسمية حكومية أو وثيقة قانونية معتمدة رسمياً.</li>
                <li style={{ marginBottom: "0.6rem" }}>استخدام التقرير لتقديم خدمات استشارية لأطراف ثالثة تجارياً دون ترخيص.</li>
                <li style={{ marginBottom: "0.6rem" }}>نسخ أو محاكاة آليات عمل المنصة أو واجهتها أو خوارزمياتها.</li>
              </ul>
            </Section>

            <Section number="6" title="الدفع والأسعار">
              <p style={{ marginBottom: "0.75rem" }}>
                سعر الخدمة الحالي هو <strong>1,999 ريال سعودي شامل ضريبة القيمة المضافة 15%</strong>.
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                يُصدر التقرير عند اكتمال عملية الدفع واستيفاء جميع البيانات المطلوبة. كل دفعة مقابل تقرير واحد لمنشأة واحدة.
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                تحتفظ الشركة بحق تعديل الأسعار في أي وقت مع إشعار مسبق مدته لا تقل عن 7 أيام.
                لن تؤثر التعديلات على الدفعات المُسدَّدة قبل الإعلان عن التغيير.
              </p>
              <p>
                تُصدر فاتورة ضريبية رسمية معتمدة لكل معاملة مدفوعة وتُرسَل إلكترونياً إلى البريد المسجَّل.
              </p>
            </Section>

            <Section number="7" title="سياسة الاسترداد">
              <p style={{ marginBottom: "0.75rem" }}>
                نظراً للطبيعة الرقمية الفورية للخدمة، <strong>لا يحق استرداد الرسوم</strong> بعد توليد التقرير وإتاحته للتنزيل.
              </p>
              <p style={{ marginBottom: "0.75rem" }}><strong>حالات تُدرَس بشكل استثنائي:</strong></p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>وجود خلل تقني موثّق في المنصة يمنع توليد التقرير كلياً.</li>
                <li style={{ marginBottom: "0.6rem" }}>تكرار الدفع للمعاملة ذاتها بسبب خطأ في نظام الدفع الإلكتروني.</li>
              </ul>
              <p style={{ marginTop: "0.75rem" }}>
                لتقديم طلب استرداد، تواصل مع فريق الدعم خلال 7 أيام من تاريخ الدفع مع إرفاق رقم المعاملة
                والمستندات الداعمة. ستُدرَس الطلبات خلال 5 أيام عمل.
              </p>
            </Section>

            <Section number="8" title="الملكية الفكرية">
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>حقوق الشركة:</strong> جميع عناصر المنصة بما تشمل المحتوى والمنهجيات والخوارزميات
                والتصاميم والكود البرمجي هي ملك حصري للشركة ومحمية بموجب قوانين الملكية الفكرية المعمول بها.
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>حقوق المستخدم على التقرير:</strong> يمتلك المستخدم ترخيصاً شخصياً غير حصري وغير قابل
                للنقل لاستخدام التقرير الصادر لأغراضه التجارية الخاصة المتعلقة بمنشأته.
              </p>
              <p>
                لا يحق للمستخدم: نسب التقرير لجهة أخرى، أو إزالة العلامات التجارية للشركة منه،
                أو إعادة نشره بوصفه عمله الأصيل، أو استخدامه لأغراض تجارية خارج نطاق منشأته.
              </p>
            </Section>

            <Section number="9" title="إخلاء المسؤولية القانونية">
              <p style={{ marginBottom: "0.75rem" }}>
                تُقدَّم المنصة والخدمات "كما هي" (AS IS) دون أي ضمانات صريحة أو ضمنية من أي نوع كان.
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>الشركة غير مسؤولة عن أي خسائر أو أضرار تنشأ عن:</strong>
              </p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>الاعتماد على محتوى التقرير في اتخاذ قرارات تجارية أو قانونية أو استثمارية.</li>
                <li style={{ marginBottom: "0.6rem" }}>عدم دقة أو اكتمال البيانات التي يُدخلها المستخدم.</li>
                <li style={{ marginBottom: "0.6rem" }}>تغيّر الأنظمة واللوائح القانونية بعد تاريخ إصدار التقرير.</li>
                <li style={{ marginBottom: "0.6rem" }}>انقطاع الخدمة أو توقف المنصة مؤقتاً لأي سبب تقني أو غير تقني.</li>
                <li style={{ marginBottom: "0.6rem" }}>أي خسائر غير مباشرة أو تبعية أو عرضية مهما كان نوعها.</li>
              </ul>
              <p style={{ marginTop: "0.75rem" }}>
                <strong>الحد الأقصى لمسؤولية الشركة</strong> في جميع الأحوال لا يتجاوز المبلغ المدفوع
                فعلياً مقابل الخدمة المحددة موضع النزاع.
              </p>
            </Section>

            <Section number="10" title="تعديل الشروط">
              <p style={{ marginBottom: "0.75rem" }}>
                تحتفظ الشركة بحق تعديل هذه الشروط في أي وقت. سيُخطَر المستخدمون المسجَّلون بأي تعديلات
                جوهرية عبر البريد الإلكتروني أو إشعار بارز في المنصة قبل سريان التعديلات بما لا يقل عن 14 يوماً.
              </p>
              <p>
                استمرارك في استخدام المنصة بعد نشر التعديلات يُعدّ قبولاً صريحاً لها.
                إذا لم توافق على التعديلات، عليك التوقف عن استخدام المنصة وإخطارنا كتابياً.
              </p>
            </Section>

            <Section number="11" title="إنهاء الخدمة وتعليق الحساب">
              <p style={{ marginBottom: "0.75rem" }}>
                تحتفظ الشركة بحق تعليق أو إنهاء حساب أي مستخدم، مع أو بدون إشعار مسبق، في حال:
              </p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>انتهاك أي بند من هذه الشروط.</li>
                <li style={{ marginBottom: "0.6rem" }}>الاشتباه في نشاط احتيالي أو تدليسي.</li>
                <li style={{ marginBottom: "0.6rem" }}>محاولة الوصول غير المصرح به لبيانات مستخدمين آخرين.</li>
                <li style={{ marginBottom: "0.6rem" }}>استخدام المنصة بصورة مخالفة للأنظمة السعودية أو القوانين الدولية المعمول بها.</li>
              </ul>
              <p style={{ marginTop: "0.75rem" }}>
                في حال إنهاء الحساب بسبب انتهاك الشروط، لن يحق للمستخدم المطالبة بأي استرداد أو تعويض.
              </p>
            </Section>

            <Section number="12" title="القانون المطبق وتسوية النزاعات">
              <p style={{ marginBottom: "0.75rem" }}>
                تخضع هذه الشروط للتفسير والتطبيق وفق <strong>أنظمة وتشريعات المملكة العربية السعودية</strong>.
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                في حال نشوء أي نزاع أو خلاف، يسعى الطرفان أولاً إلى حله بالطرق الودية خلال 30 يوماً
                من تاريخ الإخطار الكتابي الرسمي.
              </p>
              <p>
                إذا تعذّر الحل الودي، يُحال النزاع إلى الجهات القضائية المختصة في المملكة العربية السعودية،
                وتكون محاكم مدينة الرياض هي محكمة الاختصاص الأصيل.
              </p>
            </Section>

            <Section number="13" title="التواصل والدعم">
              <p style={{ marginBottom: "0.75rem" }}>لأي استفسارات أو ملاحظات حول هذه الشروط، يمكنك التواصل معنا عبر:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>البريد الإلكتروني: <strong>legal@franchise-ready.ai</strong></li>
                <li style={{ marginBottom: "0.6rem" }}>بريد الدعم الفني: <strong>support@franchise-ready.ai</strong></li>
                <li style={{ marginBottom: "0.6rem" }}>نموذج التواصل المتاح في صفحة الدعم على المنصة</li>
              </ul>
              <p style={{ marginTop: "0.75rem" }}>
                سيتم الرد على استفساراتك خلال 2-3 أيام عمل.
              </p>
            </Section>

            {/* Legal Notice Box */}
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fcd34d",
                borderRadius: 14,
                padding: "1.5rem 2rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                textAlign: "right",
                marginTop: "1.5rem",
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ color: "#92400e", fontWeight: 800, fontSize: 15, marginBottom: "0.5rem" }}>
                  تذكير قانوني مهم
                </div>
                <p style={{ color: "#78350f", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  التقرير الناتج عن استخدام منصة Franchise Ready AI هو وثيقة استشارية أولية ومساندة فحسب.
                  لا يُعدّ عقد امتياز نهائياً ولا وثيقة قانونية معتمدة إلا بعد مراجعته من مستشار قانوني مرخّص
                  واستكمال المتطلبات النظامية المعمول بها في المملكة العربية السعودية.
                  استخدام هذه المنصة لا يُغني بأي حال عن الاستشارة القانونية والمالية المتخصصة.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
