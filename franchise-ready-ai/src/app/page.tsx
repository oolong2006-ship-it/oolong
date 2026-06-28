"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PRIMARY = "#1a5c3a";
const PRIMARY_DARK = "#0f3d26";
const SECONDARY = "#c9a84c";
const SECONDARY_DARK = "#a0812e";

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#ffffff",
        boxShadow: scrolled ? "0 2px 16px rgba(26,92,58,0.10)" : "none",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
        transition: "box-shadow 0.3s, border-color 0.3s",
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
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: PRIMARY,
              color: SECONDARY,
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            F
          </span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: PRIMARY }}>Franchise Ready AI</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: SECONDARY }}>فرنشايز ريدي</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link href="/" style={{ color: "#374151", fontWeight: 500, fontSize: 15, textDecoration: "none" }}>
            الرئيسية
          </Link>
          <Link href="/pricing" style={{ color: "#374151", fontWeight: 500, fontSize: 15, textDecoration: "none" }}>
            التسعير
          </Link>
          <Link
            href="/register"
            style={{
              backgroundColor: SECONDARY,
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "0.5rem 1.25rem",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            سجّل الآن
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 60%, #07201a 100%)`,
        padding: "6rem 1.5rem 5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", top: -80, left: -80, width: 320, height: 320,
          borderRadius: "50%", background: "rgba(201,168,76,0.07)", pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -60, right: -60, width: 240, height: 240,
          borderRadius: "50%", background: "rgba(201,168,76,0.06)", pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.40)",
            color: SECONDARY,
            borderRadius: 999,
            padding: "0.4rem 1rem",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: "1.75rem",
          }}
        >
          🏆 المنصة الأولى عربياً لتقييم جاهزية الفرنشايز
        </div>

        <h1
          style={{
            color: "#ffffff",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            lineHeight: 1.3,
            marginBottom: "1.5rem",
          }}
        >
          حوّل مطعمك أو كافيهك إلى{" "}
          <span style={{ color: SECONDARY }}>ملف فرنشايز احترافي</span>{" "}
          خلال دقائق
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.80)",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            lineHeight: 1.75,
            marginBottom: "2.5rem",
            maxWidth: 680,
            margin: "0 auto 2.5rem",
          }}
        >
          أدخل بيانات منشأتك، ارفع شعارك وملفاتك، واحصل على تقرير PDF شامل لتقييم
          جاهزية الامتياز التجاري وخطة التحول إلى{" "}
          <span style={{ color: SECONDARY, fontWeight: 700 }}>Franchise-Ready</span>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              backgroundColor: SECONDARY,
              color: "#1a1a1a",
              fontWeight: 800,
              fontSize: "1.15rem",
              padding: "1rem 2.5rem",
              borderRadius: 10,
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(201,168,76,0.40)",
            }}
          >
            ابدأ الآن – 1,999 ريال
          </Link>
          <a
            href="#how-it-works"
            style={{ color: "rgba(255,255,255,0.70)", fontSize: 15, textDecoration: "none", fontWeight: 500 }}
          >
            شاهد كيف يعمل ↓
          </a>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "3rem",
            marginTop: "3.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "100+", label: "صفحة تقرير" },
            { value: "28", label: "قسمًا تحليليًا" },
            { value: "فوري", label: "جاهزية" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ color: SECONDARY, fontSize: "2rem", fontWeight: 900 }}>{stat.value}</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem ───────────────────────────────────────────────────────────────────
function ProblemSection() {
  const problems = [
    { icon: "🧭", text: "لا تعرف من أين تبدأ في بناء نموذج الفرنشايز" },
    { icon: "💸", text: "تقارير الاستشاريين تكلفك آلاف الريالات بدون ضمان للجودة" },
    { icon: "⏳", text: "تضيع وقتك في جمع بيانات متفرقة بدون منهجية واضحة" },
  ];

  return (
    <section style={{ backgroundColor: "#0f1f16", padding: "5rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            color: "#f87171",
            backgroundColor: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 999,
            padding: "0.3rem 1rem",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          التحديات
        </div>
        <h2 style={{ color: "#ffffff", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "1rem" }}>
          ما المشكلة؟
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, marginBottom: "3rem" }}>
          كثير من أصحاب المنشآت يواجهون هذه العقبات عند التفكير في الامتياز التجاري
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {problems.map((p, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(248,113,113,0.18)",
                borderRadius: 14,
                padding: "2rem 1.5rem",
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: "1rem" }}>{p.icon}</div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.7, fontWeight: 500 }}>
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Solution ──────────────────────────────────────────────────────────────────
function SolutionSection() {
  return (
    <section style={{ backgroundColor: "#f8faf9", padding: "5rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            color: PRIMARY,
            backgroundColor: "rgba(26,92,58,0.08)",
            border: "1px solid rgba(26,92,58,0.20)",
            borderRadius: 999,
            padding: "0.3rem 1rem",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          الحل
        </div>
        <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "1.5rem" }}>
          الحل بين يديك
        </h2>
        <p style={{ color: "#374151", fontSize: "1.1rem", lineHeight: 1.85, marginBottom: "2rem" }}>
          <strong style={{ color: PRIMARY }}>Franchise Ready AI</strong> هي منصة ذكاء اصطناعي متخصصة تحوّل
          بيانات منشأتك إلى تقرير فرنشايز احترافي شامل يغطي جميع جوانب الجاهزية التشغيلية والمالية
          والقانونية. بدلاً من دفع آلاف الريالات لمستشاريين وانتظار أسابيع، تحصل على تقريرك خلال
          دقائق بسعر ثابت ومعقول.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "2.5rem" }}>
          {[
            { icon: "⚡", label: "نتائج فورية" },
            { icon: "📊", label: "تحليل شامل ومعمّق" },
            { icon: "🔒", label: "بيانات آمنة ومحمية" },
            { icon: "🇸🇦", label: "ملائم للسوق السعودي" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(26,92,58,0.12)",
                borderRadius: 12,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span style={{ color: PRIMARY_DARK, fontWeight: 600, fontSize: 15 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── What You Get ──────────────────────────────────────────────────────────────
function WhatYouGetSection() {
  const deliverables = [
    { icon: "📄", title: "تقرير PDF احترافي", desc: "يتجاوز 100 صفحة بتصميم احترافي يعكس هوية منشأتك" },
    { icon: "🎯", title: "درجة جاهزية الفرنشايز", desc: "تقييم دقيق من 100 يحدد مستوى جاهزيتك الحالية" },
    { icon: "🔍", title: "تحليل 9 محاور تشغيلية", desc: "تغطية شاملة للعمليات والتمويل والتسويق والموارد البشرية وأكثر" },
    { icon: "🏗️", title: "نموذج هيكل الامتياز", desc: "الهيكل المقترح لنموذج الامتياز الخاص بمنشأتك" },
    { icon: "✅", title: "قائمة الامتثال السعودية", desc: "متطلبات هيئة الاستثمار ووزارة التجارة والجهات المختصة" },
    { icon: "🗺️", title: "خارطة طريق 90 يوم + 12 شهر", desc: "خطة عمل تفصيلية للتحول إلى Franchise-Ready مرحلةً بمرحلة" },
    { icon: "📈", title: "خطة التوسع المقترحة", desc: "استراتيجية جغرافية ومالية لتوسيع شبكة امتيازاتك" },
    { icon: "⚠️", title: "تحليل المخاطر وخطة التخفيف", desc: "تحديد المخاطر الرئيسية والإجراءات الوقائية الموصى بها" },
  ];

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-block",
              color: SECONDARY_DARK,
              backgroundColor: "rgba(201,168,76,0.10)",
              border: "1px solid rgba(201,168,76,0.30)",
              borderRadius: 999,
              padding: "0.3rem 1rem",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            المخرجات
          </div>
          <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            ماذا ستحصل عليه؟
          </h2>
          <p style={{ color: "#64748b", fontSize: 16 }}>
            تقرير واحد يجمع كل ما تحتاجه لتحويل منشأتك إلى فرنشايز ناجح
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {deliverables.map((d, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#f8faf9",
                border: "1px solid rgba(26,92,58,0.10)",
                borderRadius: 14,
                padding: "1.5rem",
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: 30, marginBottom: "0.5rem" }}>{d.icon}</div>
              <h3 style={{ color: PRIMARY_DARK, fontWeight: 700, fontSize: 16, margin: "0 0 0.25rem" }}>{d.title}</h3>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── For Whom ──────────────────────────────────────────────────────────────────
function ForWhomSection() {
  const audience = [
    { icon: "🍽️", title: "أصحاب المطاعم والمقاهي", desc: "هل لديك مطعم أو كافيه ناجح تريد تحويله إلى سلسلة امتياز؟ هذا المنتج لك." },
    { icon: "🏪", title: "أصحاب المحلات والعلامات التجارية", desc: "إذا كنت تمتلك علامة تجارية راسخة في قطاعها وتريد توسيعها عبر الامتياز." },
    { icon: "🚀", title: "رواد الأعمال في القطاع الخدمي", desc: "من يمتلك نموذج عمل ناجحاً في الخدمات ويريد تقييم قابليته للامتياز." },
    { icon: "🌐", title: "الراغبون في التوسع بالامتياز", desc: "كل من يفكر في التوسع بنموذج الفرنشايز ويحتاج خارطة طريق واضحة." },
  ];

  return (
    <section style={{ backgroundColor: "#f8faf9", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            لمن هذا المنتج؟
          </h2>
          <p style={{ color: "#64748b", fontSize: 16 }}>إذا كنت من أحد هؤلاء، فأنت في المكان الصحيح</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {audience.map((a, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid rgba(26,92,58,0.10)",
                borderRadius: 16,
                padding: "2rem 1.5rem",
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: "1rem" }}>{a.icon}</div>
              <h3 style={{ color: PRIMARY, fontWeight: 700, fontSize: 17, marginBottom: "0.5rem" }}>{a.title}</h3>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: 1, title: "سجّل وادفع رسوم الخدمة", desc: "إنشاء حسابك ودفع رسوم الاشتراك بأمان عبر بوابات الدفع المعتمدة" },
    { num: 2, title: "أدخل بيانات منشأتك", desc: "استمارة ذكية شاملة تغطي جميع جوانب منشأتك التشغيلية والمالية" },
    { num: 3, title: "ارفع ملفاتك وشعارك", desc: "رفع الشعار والمستندات الداعمة لتخصيص التقرير بهوية منشأتك" },
    { num: 4, title: "راجع درجة الجاهزية", desc: "اطلع على درجة جاهزيتك الفورية مع ملاحظات أولية" },
    { num: 5, title: "احصل على تقرير PDF احترافي", desc: "تقريرك الشامل جاهز للتنزيل والمشاركة خلال دقائق" },
  ];

  return (
    <section id="how-it-works" style={{ backgroundColor: "#ffffff", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            كيف يعمل؟
          </h2>
          <p style={{ color: "#64748b", fontSize: 16 }}>خمس خطوات بسيطة توصلك إلى تقرير فرنشايز احترافي</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1.25rem",
                backgroundColor: "#f8faf9",
                borderRadius: 14,
                padding: "1.5rem",
                border: "1px solid rgba(26,92,58,0.10)",
              }}
            >
              <div
                style={{
                  minWidth: 44, height: 44, borderRadius: "50%",
                  backgroundColor: PRIMARY, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 18, flexShrink: 0,
                }}
              >
                {step.num}
              </div>
              <div style={{ textAlign: "right" }}>
                <h3 style={{ color: PRIMARY_DARK, fontWeight: 700, fontSize: 17, margin: "0 0 0.25rem" }}>{step.title}</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Report Preview ────────────────────────────────────────────────────────────
function ReportPreviewSection() {
  const reportSections = [
    "ملخص تنفيذي ودرجة الجاهزية الكلية",
    "تحليل نموذج العمل والميزة التنافسية",
    "تقييم العمليات والإجراءات التشغيلية",
    "الوضع المالي وهوامش الربح",
    "تحليل العلامة التجارية والهوية البصرية",
    "متطلبات الامتثال والتراخيص",
    "الهيكل المقترح لعقد الامتياز",
    "خارطة طريق التحول 90 يوم + 12 شهر",
    "تحليل السوق والفرص الجغرافية",
    "تقييم المخاطر وخطة التخفيف",
  ];

  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
        padding: "5rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            نموذج من التقرير
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16 }}>
            لمحة عن الأقسام التي يغطيها تقريرك الاحترافي
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              backgroundColor: PRIMARY,
              padding: "1.5rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 500 }}>تقرير جاهزية الامتياز التجاري</div>
              <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 18, marginTop: 2 }}>اسم منشأتك</div>
            </div>
            <div
              style={{
                backgroundColor: SECONDARY, color: "#1a1a1a",
                fontWeight: 900, fontSize: 22,
                padding: "0.75rem 1.25rem", borderRadius: 10, textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>درجة الجاهزية</div>
              87/100
            </div>
          </div>
          <div style={{ padding: "1.5rem 2rem" }}>
            <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600, marginBottom: "1rem" }}>محتويات التقرير</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.6rem" }}>
              {reportSections.map((section, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.6rem 0.75rem", backgroundColor: "#f8faf9",
                    borderRadius: 8, fontSize: 14, color: "#374151", fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: 22, height: 22, borderRadius: "50%",
                      backgroundColor: PRIMARY, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  {section}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: "rgba(201,168,76,0.10)",
                border: "1px solid rgba(201,168,76,0.30)",
                borderRadius: 8,
                color: SECONDARY_DARK,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              + 18 قسماً إضافياً في التقرير الكامل
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────────
function PricingSection() {
  const included = [
    "تقرير PDF احترافي يتجاوز 100 صفحة",
    "درجة جاهزية الفرنشايز من 100",
    "تحليل 28 قسماً تحليلياً شاملاً",
    "خارطة طريق 90 يوم + 12 شهر",
    "قائمة الامتثال السعودية الكاملة",
    "تحليل المخاطر وخطة التخفيف",
  ];

  return (
    <section id="pricing" style={{ backgroundColor: "#f8faf9", padding: "5rem 1.5rem", textAlign: "center" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
          التسعير
        </h2>
        <p style={{ color: "#64748b", fontSize: 16, marginBottom: "2.5rem" }}>
          سعر واحد واضح، بدون رسوم خفية أو اشتراكات
        </p>
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `2px solid ${SECONDARY}`,
            borderRadius: 20,
            padding: "2.5rem 2rem",
            boxShadow: "0 8px 40px rgba(201,168,76,0.15)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(201,168,76,0.12)",
              color: SECONDARY_DARK,
              borderRadius: 999,
              padding: "0.3rem 1rem",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: "1.25rem",
            }}
          >
            الأكثر شمولاً في السوق
          </div>
          <div style={{ fontSize: "3.5rem", fontWeight: 900, color: PRIMARY_DARK, lineHeight: 1, marginBottom: "0.25rem" }}>
            1,999
          </div>
          <div style={{ color: "#64748b", fontSize: 16, fontWeight: 500, marginBottom: "0.5rem" }}>ريال سعودي</div>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#f0fdf4", color: "#16a34a",
              borderRadius: 6, padding: "0.2rem 0.75rem",
              fontSize: 13, fontWeight: 600, marginBottom: "1.5rem",
            }}
          >
            شامل ضريبة القيمة المضافة
          </div>

          <div style={{ backgroundColor: "#f8faf9", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", textAlign: "right" }}>
            <div style={{ color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: "0.75rem" }}>يشمل:</div>
            {included.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.4rem 0", color: "#374151", fontSize: 14 }}>
                <span style={{ color: PRIMARY, fontWeight: 700, fontSize: 16 }}>✓</span>
                {item}
              </div>
            ))}
          </div>

          <div style={{ color: "#64748b", fontSize: 13, marginBottom: "1.5rem", padding: "0.6rem 1rem", backgroundColor: "#f8faf9", borderRadius: 8 }}>
            تقرير واحد لكل دفعة — ادفع عند الحاجة
          </div>

          <Link
            href="/register"
            style={{
              display: "block",
              backgroundColor: SECONDARY,
              color: "#1a1a1a",
              fontWeight: 800,
              fontSize: "1.1rem",
              padding: "1rem",
              borderRadius: 10,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(201,168,76,0.35)",
            }}
          >
            ابدأ الآن واحصل على تقريرك
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "ما الذي سأحصل عليه بالضبط؟",
      a: "ستحصل على تقرير PDF احترافي يتجاوز 100 صفحة يشمل: درجة جاهزية الفرنشايز من 100، تحليل 28 قسماً تحليلياً، نموذج هيكل الامتياز المقترح، قائمة الامتثال السعودية، خارطة طريق 90 يوم + 12 شهر، خطة التوسع المقترحة، وتحليل المخاطر.",
    },
    {
      q: "هل التقرير نهائي قانونياً؟",
      a: "لا. التقرير هو وثيقة استشارية أولية ومساندة تساعدك على فهم مستوى جاهزيتك. يجب مراجعته من مستشار قانوني مختص واستكمال المتطلبات النظامية قبل إطلاق برنامج الامتياز رسمياً.",
    },
    {
      q: "كم يستغرق إنشاء التقرير؟",
      a: "بمجرد استكمال إدخال البيانات ورفع الملفات، يتم إنشاء التقرير فورياً خلال دقائق. العملية برمتها من التسجيل حتى الحصول على التقرير لا تتجاوز 30-60 دقيقة.",
    },
    {
      q: "هل يمكنني تعديل التقرير بعد الإصدار؟",
      a: "التقرير يُنشأ بناءً على البيانات التي أدخلتها. في حال رغبت في تحديث البيانات وإعادة توليد التقرير، يتطلب ذلك دفعة جديدة. ننصح بمراجعة جميع بياناتك قبل الإصدار النهائي.",
    },
    {
      q: "ما الفرق بين هذه المنصة وتوظيف مستشار؟",
      a: "المستشار التقليدي يكلفك ما بين 15,000 و50,000 ريال أو أكثر، ويستغرق أسابيع أو أشهراً. منصتنا تقدم تحليلاً شاملاً بسعر ثابت 1,999 ريال خلال دقائق. التقرير لا يُغني عن المستشار القانوني في المراحل النهائية، لكنه يمنحك أساساً قوياً وموفراً للوقت والمال.",
    },
  ];

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            الأسئلة الشائعة
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${openIndex === i ? PRIMARY : "#e2e8f0"}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "1.25rem 1.5rem",
                  backgroundColor: openIndex === i ? "#f8faf9" : "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "right",
                  gap: "1rem",
                }}
              >
                <span style={{ color: PRIMARY_DARK, fontWeight: 700, fontSize: 16 }}>{faq.q}</span>
                <span
                  style={{
                    color: PRIMARY,
                    fontSize: 20,
                    fontWeight: 700,
                    flexShrink: 0,
                    display: "inline-block",
                    transition: "transform 0.2s",
                    transform: openIndex === i ? "rotate(45deg)" : "rotate(0)",
                  }}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div
                  style={{
                    padding: "0 1.5rem 1.25rem",
                    backgroundColor: "#f8faf9",
                    color: "#374151",
                    fontSize: 15,
                    lineHeight: 1.8,
                    textAlign: "right",
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Legal Notice ──────────────────────────────────────────────────────────────
function LegalNotice() {
  return (
    <section style={{ backgroundColor: "#fffbeb", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #fcd34d",
            borderRadius: 14,
            padding: "1.5rem 2rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            textAlign: "right",
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ color: "#92400e", fontWeight: 800, fontSize: 16, marginBottom: "0.5rem" }}>
              تنبيه قانوني مهم
            </div>
            <p style={{ color: "#78350f", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              التقرير الناتج هو تقرير استشاري أولي ومساند، ولا يُعد عقد امتياز نهائياً أو وثيقة قانونية
              معتمدة إلا بعد مراجعته من مستشار قانوني مختص واستكمال المتطلبات النظامية المعمول بها في
              المملكة العربية السعودية. استخدام هذه المنصة لا يُغني عن الاستشارة القانونية المتخصصة.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ backgroundColor: "#0f1f16", padding: "3rem 1.5rem", color: "rgba(255,255,255,0.65)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 34, height: 34, borderRadius: 7,
                  backgroundColor: SECONDARY, color: "#1a1a1a", fontWeight: 900, fontSize: 16,
                }}
              >
                F
              </span>
              <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 15 }}>فرنشايز ريدي</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              منصة ذكاء اصطناعي متخصصة في تقييم جاهزية المنشآت التجارية للتوسع عبر نظام الامتياز.
            </p>
          </div>
          <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 14, marginBottom: "0.75rem" }}>الخدمة</div>
              {[
                { label: "الرئيسية", href: "/" },
                { label: "التسعير", href: "/pricing" },
                { label: "سجّل الآن", href: "/register" },
              ].map((link) => (
                <div key={link.href} style={{ marginBottom: "0.4rem" }}>
                  <Link href={link.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }}>
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 14, marginBottom: "0.75rem" }}>قانوني</div>
              {[
                { label: "شروط الاستخدام", href: "/terms" },
                { label: "سياسة الخصوصية", href: "/privacy" },
              ].map((link) => (
                <div key={link.href} style={{ marginBottom: "0.4rem" }}>
                  <Link href={link.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, textDecoration: "none" }}>
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: 13 }}>
          <span>© 2025 Franchise Ready AI. جميع الحقوق محفوظة.</span>
          <span>صُنع بالمملكة العربية السعودية 🇸🇦</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <WhatYouGetSection />
        <ForWhomSection />
        <HowItWorksSection />
        <ReportPreviewSection />
        <PricingSection />
        <FAQSection />
        <LegalNotice />
      </main>
      <Footer />
    </>
  );
}
