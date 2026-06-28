import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة خصوصية وحماية البيانات لمنصة Franchise Ready AI",
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
    <footer style={{ backgroundColor: "#0f1f16", padding: "2rem 1.5rem", color: "rgba(255,255,255,0.65)" }}>
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

export default function PrivacyPage() {
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
              سياسة الخصوصية
            </h1>
            <p style={{ color: "rgba(255,255,255,0.70)", fontSize: 15, lineHeight: 1.7, marginBottom: "1rem" }}>
              نلتزم بحماية خصوصيتك وبياناتك الشخصية. اقرأ هذه السياسة لتعرف كيف نتعامل مع معلوماتك.
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

        {/* Commitment Banner */}
        <section style={{ backgroundColor: PRIMARY, padding: "1.25rem 1.5rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
              {[
                { icon: "🔒", text: "لا نبيع بياناتك" },
                { icon: "🤖", text: "لا نستخدمها لتدريب AI" },
                { icon: "🗑️", text: "حق الحذف الكامل" },
                { icon: "🇸🇦", text: "ملتزمون بالأنظمة السعودية" },
              ].map((item) => (
                <div
                  key={item.text}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#ffffff", fontSize: 14, fontWeight: 600 }}
                >
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section style={{ backgroundColor: "#f8faf9", padding: "3rem 1.5rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            <Section number="1" title="البيانات التي نجمعها">
              <p style={{ marginBottom: "1rem" }}>نجمع الأنواع التالية من البيانات عند استخدامك للمنصة:</p>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ color: PRIMARY_DARK, fontWeight: 700, marginBottom: "0.5rem" }}>أ) بيانات التسجيل والحساب</div>
                <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                  <li style={{ marginBottom: "0.4rem" }}>الاسم الكامل وبريد إلكتروني ورقم جوال</li>
                  <li style={{ marginBottom: "0.4rem" }}>اسم المنشأة والقطاع التجاري والمدينة</li>
                  <li style={{ marginBottom: "0.4rem" }}>كلمة المرور (مُشفَّرة كلياً — لا يمكن لأحد قراءتها)</li>
                </ul>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ color: PRIMARY_DARK, fontWeight: 700, marginBottom: "0.5rem" }}>ب) بيانات المنشأة التجارية</div>
                <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                  <li style={{ marginBottom: "0.4rem" }}>المعلومات التشغيلية والمالية للمنشأة التي تُدخلها في الاستمارات</li>
                  <li style={{ marginBottom: "0.4rem" }}>الملفات والمستندات المرفوعة (شعار، وثائق داعمة)</li>
                  <li style={{ marginBottom: "0.4rem" }}>إجاباتك على أسئلة تقييم جاهزية الفرنشايز</li>
                </ul>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ color: PRIMARY_DARK, fontWeight: 700, marginBottom: "0.5rem" }}>ج) بيانات الدفع</div>
                <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                  <li style={{ marginBottom: "0.4rem" }}>معاملات الدفع مُعالَجة بأمان عبر بوابات دفع معتمدة</li>
                  <li style={{ marginBottom: "0.4rem" }}>نحتفظ بسجلات المعاملات للمحاسبة والفوترة فقط</li>
                  <li style={{ marginBottom: "0.4rem" }}>لا نحتفظ بأرقام بطاقات الائتمان على خوادمنا</li>
                </ul>
              </div>

              <div>
                <div style={{ color: PRIMARY_DARK, fontWeight: 700, marginBottom: "0.5rem" }}>د) البيانات التقنية</div>
                <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                  <li style={{ marginBottom: "0.4rem" }}>عنوان IP ونوع الجهاز والمتصفح</li>
                  <li style={{ marginBottom: "0.4rem" }}>الصفحات التي تزورها وأوقات الزيارة</li>
                  <li style={{ marginBottom: "0.4rem" }}>سجلات الأخطاء التقنية لتحسين الأداء</li>
                </ul>
              </div>
            </Section>

            <Section number="2" title="كيف نستخدم بياناتك">
              <p style={{ marginBottom: "0.75rem" }}>نستخدم بياناتك <strong>حصراً</strong> للأغراض التالية:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}><strong>تقديم الخدمة:</strong> توليد تقرير جاهزية الفرنشايز بناءً على بياناتك.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>إدارة حسابك:</strong> التحقق من هويتك وإدارة اشتراكاتك ومعاملاتك.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>الدعم الفني:</strong> الرد على استفساراتك وحل المشكلات التقنية.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>الفوترة والامتثال:</strong> إصدار الفواتير الضريبية المعتمدة.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>الأمن والحماية:</strong> كشف ومنع الاحتيال والوصول غير المصرح به.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>تحسين الخدمة:</strong> تحليل بيانات الاستخدام المُجمَّعة وغير الشخصية فقط.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>الإشعارات الضرورية:</strong> تنبيهات تتعلق بحسابك والتحديثات الجوهرية.</li>
              </ul>

              <div
                style={{
                  marginTop: "1rem",
                  backgroundColor: "rgba(26,92,58,0.05)",
                  border: "1px solid rgba(26,92,58,0.15)",
                  borderRadius: 12,
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
                <div>
                  <div style={{ color: PRIMARY_DARK, fontWeight: 700, fontSize: 14, marginBottom: "0.35rem" }}>
                    تعهدنا الصريح بشأن الذكاء الاصطناعي
                  </div>
                  <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.75 }}>
                    <strong>لا نستخدم بياناتك أو بيانات منشأتك أو محتوى تقاريرك لتدريب أي نموذج ذكاء اصطناعي</strong>،
                    سواء نماذجنا أو نماذج أطراف ثالثة. بياناتك تُستخدم فقط لتوليد تقريرك الخاص.
                  </div>
                </div>
              </div>
            </Section>

            <Section number="3" title="مشاركة البيانات مع أطراف ثالثة">
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>لا نبيع بياناتك الشخصية لأي طرف ثالث بأي ثمن أو صورة كانت.</strong>
              </p>
              <p style={{ marginBottom: "0.75rem" }}>نشارك بيانات محدودة مع الأطراف التالية فقط:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>
                  <strong>مزودو الخدمات التقنية</strong> (الاستضافة، قواعد البيانات، بوابات الدفع):
                  فقط بقدر ما تستلزمه الخدمة، مع إلزامهم باتفاقيات سرية صارمة.
                </li>
                <li style={{ marginBottom: "0.6rem" }}>
                  <strong>الجهات الحكومية والرقابية:</strong> عند الطلب الرسمي وفق الأنظمة السعودية.
                </li>
                <li style={{ marginBottom: "0.6rem" }}>
                  <strong>الخبراء القانونيون:</strong> بشكل محدود في حالات النزاعات القانونية مع الالتزام الكامل بالسرية.
                </li>
              </ul>
            </Section>

            <Section number="4" title="حماية البيانات والأمن">
              <p style={{ marginBottom: "0.75rem" }}>نطبّق أعلى معايير الأمن لحماية بياناتك:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}>تشفير جميع البيانات المنقولة باستخدام بروتوكول TLS 1.3</li>
                <li style={{ marginBottom: "0.6rem" }}>تشفير البيانات المُخزَّنة في قواعد البيانات (Encryption at Rest)</li>
                <li style={{ marginBottom: "0.6rem" }}>تشفير كلمات المرور بخوارزميات تجزئة قوية (bcrypt)</li>
                <li style={{ marginBottom: "0.6rem" }}>المصادقة الثنائية للحسابات الإدارية</li>
                <li style={{ marginBottom: "0.6rem" }}>مراجعات أمنية دورية ومراقبة مستمرة</li>
                <li style={{ marginBottom: "0.6rem" }}>تقييد وصول الموظفين لبياناتك على مبدأ أدنى امتياز</li>
              </ul>
              <p style={{ marginTop: "0.75rem", color: "#64748b", fontSize: 14 }}>
                في حال اكتشاف اختراق يؤثر على بياناتك، سنُخطرك خلال 72 ساعة ونتخذ الإجراءات التصحيحية الفورية.
              </p>
            </Section>

            <Section number="5" title="ملفات تعريف الارتباط (Cookies)">
              <p style={{ marginBottom: "0.75rem" }}>نستخدم ملفات تعريف الارتباط للأغراض التالية:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                {[
                  { type: "ضرورية", required: true, desc: "للمصادقة والأمان وإبقاء جلسة تسجيل الدخول. لا يمكن تعطيلها." },
                  { type: "وظيفية", required: false, desc: "لحفظ تفضيلاتك وإعداداتك على المنصة." },
                  { type: "تحليلية", required: false, desc: "لفهم كيفية استخدام المنصة وتحسينها (بيانات مجمّعة ومجهولة الهوية)." },
                ].map((c) => (
                  <div
                    key={c.type}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "0.75rem",
                      backgroundColor: "#f8faf9", borderRadius: 10, padding: "0.75rem 1rem",
                    }}
                  >
                    <span
                      style={{
                        minWidth: 70,
                        backgroundColor: c.required ? PRIMARY : "#e2e8f0",
                        color: c.required ? "#fff" : "#374151",
                        borderRadius: 6, padding: "0.2rem 0.5rem",
                        fontSize: 12, fontWeight: 700, textAlign: "center", flexShrink: 0,
                      }}
                    >
                      {c.type}
                    </span>
                    <span style={{ color: "#374151", fontSize: 14 }}>{c.desc}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "#64748b" }}>
                يمكنك إدارة ملفات تعريف الارتباط غير الضرورية من إعدادات متصفحك في أي وقت.
              </p>
            </Section>

            <Section number="6" title="مدة الاحتفاظ بالبيانات">
              <p style={{ marginBottom: "0.75rem" }}>نحتفظ ببياناتك للفترات التالية:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.6rem" }}><strong>بيانات الحساب:</strong> طوال فترة نشاط حسابك + 12 شهراً بعد الإغلاق.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>التقارير الصادرة:</strong> 24 شهراً من تاريخ الإصدار للتمكن من إعادة التنزيل.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>سجلات المعاملات المالية:</strong> 7 سنوات وفق متطلبات هيئة الزكاة والضريبة والجمارك.</li>
                <li style={{ marginBottom: "0.6rem" }}><strong>بيانات الاستخدام التحليلية:</strong> 24 شهراً ثم تُحذف أو تُجمَّع بصورة مجهولة الهوية.</li>
              </ul>
            </Section>

            <Section number="7" title="حقوقك على بياناتك">
              <p style={{ marginBottom: "1rem" }}>بموجب الأنظمة المعمول بها، تمتلك الحقوق التالية:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { icon: "👁️", title: "حق الاطلاع", desc: "طلب نسخة كاملة من بياناتك الشخصية المحفوظة لدينا." },
                  { icon: "✏️", title: "حق التصحيح", desc: "تصحيح أي بيانات غير دقيقة أو منقوصة." },
                  { icon: "🗑️", title: "حق الحذف", desc: "حذف بياناتك الشخصية نهائياً مع مراعاة الالتزامات القانونية." },
                  { icon: "📦", title: "حق نقل البيانات", desc: "استلام بياناتك بصيغة إلكترونية قابلة للقراءة الآلية." },
                  { icon: "🚫", title: "حق الاعتراض", desc: "الاعتراض على معالجة معينة لبياناتك، بما يشمل التواصل التسويقي." },
                  { icon: "⏸️", title: "حق التقييد", desc: "طلب تقييد معالجة بياناتك في حالات محددة." },
                ].map((right) => (
                  <div
                    key={right.title}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "0.75rem",
                      backgroundColor: "#f8faf9", borderRadius: 10, padding: "1rem",
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{right.icon}</span>
                    <div>
                      <div style={{ color: PRIMARY_DARK, fontWeight: 700, fontSize: 14, marginBottom: "0.2rem" }}>{right.title}</div>
                      <div style={{ color: "#64748b", fontSize: 14 }}>{right.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: "1rem", fontSize: 14 }}>
                لممارسة أي من هذه الحقوق، تواصل معنا على <strong>privacy@franchise-ready.ai</strong>.
                سنرد على طلبك خلال 30 يوماً.
              </p>
            </Section>

            <Section number="8" title="حق الحذف الكامل">
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>نمنحك الحق الكامل في طلب حذف حسابك وجميع بياناتك المرتبطة به.</strong>
              </p>
              <p style={{ marginBottom: "0.75rem" }}>عند تقديم طلب الحذف، سنقوم بـ:</p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.5rem" }}>حذف بيانات ملفك الشخصي وبيانات المنشأة المُدخَلة.</li>
                <li style={{ marginBottom: "0.5rem" }}>حذف الملفات المرفوعة (الشعار والمستندات) من خوادمنا.</li>
                <li style={{ marginBottom: "0.5rem" }}>إغلاق حسابك نهائياً ومنع الوصول إليه مستقبلاً.</li>
              </ul>
              <p style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
                <strong>استثناءات لا يشملها الحذف بموجب المتطلبات القانونية:</strong>
              </p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.5rem" }}>سجلات الفواتير والمعاملات المالية (7 سنوات وفق هيئة الزكاة والضريبة والجمارك).</li>
                <li style={{ marginBottom: "0.5rem" }}>البيانات المطلوبة في إطار نزاع قانوني قائم.</li>
              </ul>
              <p style={{ marginTop: "0.75rem", fontSize: 14, color: "#64748b" }}>
                سيتم تنفيذ طلب الحذف خلال 30 يوماً من استلامه وتأكيد هويتك.
              </p>
            </Section>

            <Section number="9" title="تعهدنا بشأن الذكاء الاصطناعي">
              <div
                style={{
                  backgroundColor: "rgba(26,92,58,0.05)",
                  border: "1px solid rgba(26,92,58,0.15)",
                  borderRadius: 12,
                  padding: "1.25rem 1.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ color: PRIMARY_DARK, fontWeight: 800, fontSize: 15, marginBottom: "0.5rem" }}>
                  تعهد واضح وصريح غير قابل للتأويل
                </div>
                <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  <strong>لا نستخدم بياناتك الشخصية أو بيانات منشأتك أو محتوى تقاريرك لتدريب أي نموذج ذكاء اصطناعي</strong>،
                  سواء نماذجنا الداخلية أو نماذج أطراف ثالثة بأي صورة من الصور.
                  بياناتك مِلكٌ لك وحدك وتُستخدم حصراً لتوليد تقريرك الخاص.
                </p>
              </div>
              <p>
                نستخدم نماذج الذكاء الاصطناعي كأداة لمعالجة بياناتك وتوليد التقرير فقط، دون الاحتفاظ
                بأي بيانات خاصة بك في ذاكرة النماذج أو سجلاتها بصورة دائمة.
              </p>
            </Section>

            <Section number="10" title="نقل البيانات دولياً">
              <p style={{ marginBottom: "0.75rem" }}>
                قد تُعالَج بياناتك أو تُخزَّن على خوادم في دول أخرى في إطار خدمات البنية التحتية السحابية.
                نضمن في جميع الأحوال أن أي نقل دولي يتم وفق ضمانات ملائمة تشمل:
              </p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.5rem" }}>اتفاقيات معالجة البيانات مع مزودي الخدمة (DPA).</li>
                <li style={{ marginBottom: "0.5rem" }}>الالتزام بمعايير حماية البيانات الدولية المعترف بها.</li>
                <li style={{ marginBottom: "0.5rem" }}>التشفير الكامل للبيانات أثناء النقل والتخزين.</li>
              </ul>
            </Section>

            <Section number="11" title="خصوصية القاصرين">
              <p>
                منصتنا مخصصة حصراً للمستخدمين البالغين 18 عاماً أو أكثر. لا نجمع بيانات من أشخاص
                دون هذا السن عن قصد. إذا علمنا بأن مستخدماً قاصراً قدّم بياناته،
                سنحذف حسابه وبياناته فوراً ودون إشعار مسبق.
              </p>
            </Section>

            <Section number="12" title="التواصل بشأن الخصوصية">
              <p style={{ marginBottom: "0.75rem" }}>
                لأي استفسارات أو طلبات أو مخاوف تتعلق بخصوصيتك، تواصل مع مسؤول حماية البيانات:
              </p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.5rem" }}>البريد الإلكتروني: <strong>privacy@franchise-ready.ai</strong></li>
                <li style={{ marginBottom: "0.5rem" }}>للمشكلات الأمنية العاجلة: <strong>security@franchise-ready.ai</strong></li>
              </ul>
              <p style={{ marginTop: "0.75rem" }}>
                نلتزم بالرد على جميع طلبات الخصوصية خلال <strong>30 يوماً</strong> من استلامها.
              </p>
            </Section>

            <Section number="13" title="تحديثات سياسة الخصوصية">
              <p style={{ marginBottom: "0.75rem" }}>
                قد نحدّث هذه السياسة لتعكس تغييرات في خدماتنا أو الأنظمة. سنُخطرك بأي تعديلات جوهرية عبر:
              </p>
              <ul style={{ paddingRight: "1.5rem", margin: 0, listStyleType: "disc" }}>
                <li style={{ marginBottom: "0.5rem" }}>إشعار بارز في المنصة قبل 14 يوماً من سريان التغيير.</li>
                <li style={{ marginBottom: "0.5rem" }}>بريد إلكتروني إلى عنوانك المسجّل لدينا.</li>
              </ul>
            </Section>

            {/* Final Commitment */}
            <div
              style={{
                backgroundColor: "rgba(26,92,58,0.05)",
                border: "1px solid rgba(26,92,58,0.15)",
                borderRadius: 14,
                padding: "1.5rem 2rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                textAlign: "right",
                marginTop: "1.5rem",
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>🔒</span>
              <div>
                <div style={{ color: PRIMARY_DARK, fontWeight: 800, fontSize: 15, marginBottom: "0.5rem" }}>
                  التزامنا بخصوصيتك
                </div>
                <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  خصوصيتك ليست مجرد شرط قانوني نلتزم به، بل هي قيمة أساسية نؤمن بها.
                  نعمل باستمرار على تحسين معايير حماية بياناتك وتوفير شفافية كاملة حول كيفية التعامل معها.
                  إذا كان لديك أي سؤال أو مخاوف، فريق الخصوصية لدينا في خدمتك على{" "}
                  <strong>privacy@franchise-ready.ai</strong>.
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
