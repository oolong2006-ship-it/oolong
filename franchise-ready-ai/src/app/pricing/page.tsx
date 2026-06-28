"use client";

import { useState } from "react";
import Link from "next/link";

const PRIMARY = "#1a5c3a";
const PRIMARY_DARK = "#0f3d26";
const SECONDARY = "#c9a84c";
const SECONDARY_DARK = "#a0812e";

function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 8px rgba(26,92,58,0.07)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link href="/" style={{ color: "#374151", fontWeight: 500, fontSize: 15, textDecoration: "none" }}>الرئيسية</Link>
          <Link href="/pricing" style={{ color: PRIMARY, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>التسعير</Link>
          <Link
            href="/register"
            style={{
              backgroundColor: SECONDARY, color: "#fff",
              fontWeight: 700, fontSize: 15, padding: "0.5rem 1.25rem",
              borderRadius: 8, textDecoration: "none",
            }}
          >
            سجّل الآن
          </Link>
        </div>
      </div>
    </nav>
  );
}

function PricingHero() {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
        padding: "4rem 1.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.40)",
            color: SECONDARY,
            borderRadius: 999,
            padding: "0.4rem 1rem",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          شفافية كاملة في التسعير
        </div>
        <h1 style={{ color: "#ffffff", fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 900, lineHeight: 1.3, marginBottom: "1rem" }}>
          سعر واحد، قيمة <span style={{ color: SECONDARY }}>لا تُقدَّر</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", lineHeight: 1.75 }}>
          بدلاً من دفع عشرات الآلاف لمستشاريين، احصل على تقرير شامل بسعر ثابت وشفاف
        </p>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section style={{ backgroundColor: "#f8faf9", padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, textAlign: "center", marginBottom: "2.5rem" }}>
          قارن بنفسك
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {/* Traditional Consultant */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "2rem 1.5rem",
              textAlign: "right",
            }}
          >
            <div style={{ color: "#64748b", fontWeight: 700, fontSize: 14, marginBottom: "1rem" }}>
              المستشار التقليدي
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#dc2626", marginBottom: "0.25rem" }}>15,000+</div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: "1.5rem" }}>ريال أو أكثر</div>
            {[
              "أسابيع أو أشهر من الانتظار",
              "جودة متفاوتة بين المستشارين",
              "رسوم إضافية غير متوقعة",
              "لا يغطي جميع الجوانب",
            ].map((point, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.4rem 0", color: "#64748b", fontSize: 14 }}>
                <span style={{ color: "#dc2626", fontSize: 16 }}>✗</span>
                {point}
              </div>
            ))}
          </div>

          {/* Our Platform */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: `2px solid ${SECONDARY}`,
              borderRadius: 16,
              padding: "2rem 1.5rem",
              textAlign: "right",
              boxShadow: "0 8px 32px rgba(201,168,76,0.15)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -14,
                right: "50%",
                transform: "translateX(50%)",
                backgroundColor: SECONDARY,
                color: "#1a1a1a",
                fontSize: 12,
                fontWeight: 800,
                padding: "0.3rem 1rem",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              الأذكى والأوفر
            </div>
            <div style={{ color: PRIMARY, fontWeight: 700, fontSize: 14, marginBottom: "1rem" }}>
              Franchise Ready AI
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: PRIMARY_DARK, marginBottom: "0.25rem" }}>1,999</div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: "1.5rem" }}>ريال سعودي شامل VAT</div>
            {[
              "نتائج فورية خلال دقائق",
              "تقرير موحد ومنهجي بمعايير ثابتة",
              "سعر ثابت بلا مفاجآت",
              "تغطية شاملة لـ 28 قسماً",
            ].map((point, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.4rem 0", color: "#374151", fontSize: 14 }}>
                <span style={{ color: PRIMARY, fontWeight: 700, fontSize: 16 }}>✓</span>
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard() {
  const included = [
    { icon: "📄", text: "تقرير PDF احترافي يتجاوز 100 صفحة" },
    { icon: "🎯", text: "درجة جاهزية الفرنشايز من 100" },
    { icon: "🔍", text: "تحليل شامل لـ 28 قسماً تحليلياً" },
    { icon: "🗺️", text: "خارطة طريق 90 يوم + 12 شهر" },
    { icon: "✅", text: "قائمة الامتثال السعودية الكاملة" },
    { icon: "⚠️", text: "تحليل المخاطر وخطة التخفيف" },
    { icon: "🏗️", text: "نموذج هيكل الامتياز المقترح" },
    { icon: "📈", text: "خطة التوسع الجغرافي المقترحة" },
  ];

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `2px solid ${SECONDARY}`,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 12px 48px rgba(201,168,76,0.18)",
          }}
        >
          {/* Card Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 14, fontWeight: 500, marginBottom: "0.5rem" }}>
              تقرير جاهزية الامتياز التجاري
            </div>
            <div style={{ color: "#ffffff", fontSize: "4rem", fontWeight: 900, lineHeight: 1 }}>
              1,999
            </div>
            <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 16, fontWeight: 500, marginTop: "0.25rem" }}>
              ريال سعودي
            </div>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "rgba(201,168,76,0.20)",
                border: "1px solid rgba(201,168,76,0.40)",
                color: SECONDARY,
                borderRadius: 999,
                padding: "0.3rem 1rem",
                fontSize: 13,
                fontWeight: 600,
                marginTop: "1rem",
              }}
            >
              شامل ضريبة القيمة المضافة 15%
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: "2rem" }}>
            <div style={{ color: PRIMARY_DARK, fontSize: 15, fontWeight: 700, marginBottom: "1.25rem", textAlign: "right" }}>
              ما يشمله التقرير:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {included.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    backgroundColor: "#f8faf9",
                    borderRadius: 10,
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ color: "#374151", fontSize: 14, fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid rgba(22,163,74,0.20)",
                borderRadius: 10,
                padding: "0.75rem 1rem",
                marginBottom: "1.5rem",
                color: "#16a34a",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              تقرير واحد لكل دفعة — ادفع عند الحاجة فقط
            </div>

            <Link
              href="/register"
              style={{
                display: "block",
                backgroundColor: SECONDARY,
                color: "#1a1a1a",
                fontWeight: 800,
                fontSize: "1.15rem",
                padding: "1.1rem",
                borderRadius: 12,
                textDecoration: "none",
                textAlign: "center",
                boxShadow: "0 4px 24px rgba(201,168,76,0.40)",
              }}
            >
              ابدأ الآن واحصل على تقريرك
            </Link>

            <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
              بالنقر على الزر أعلاه توافق على{" "}
              <Link href="/terms" style={{ color: PRIMARY, textDecoration: "underline" }}>شروط الاستخدام</Link>
              {" "}و{" "}
              <Link href="/privacy" style={{ color: PRIMARY, textDecoration: "underline" }}>سياسة الخصوصية</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "ما طرق الدفع المقبولة؟",
      a: "نقبل جميع بطاقات الائتمان والخصم المباشر (فيزا، ماستركارد)، ومدى، وApple Pay، وSTC Pay. جميع المعاملات مؤمّنة بأعلى معايير التشفير.",
    },
    {
      q: "هل يمكنني استرداد المبلغ إذا لم أكن راضياً؟",
      a: "نظراً لأن الخدمة تُقدَّم فورياً عند اكتمال البيانات، فإن السياسة لا تشمل الاسترداد بعد إصدار التقرير. نوصي بمراجعة جميع بياناتك قبل الإصدار النهائي. في حال وجود خلل تقني موثّق، سندرس الحالة.",
    },
    {
      q: "هل السعر شامل ضريبة القيمة المضافة؟",
      a: "نعم، السعر المعلن 1,999 ريال شامل ضريبة القيمة المضافة 15% بالكامل. لا توجد رسوم إضافية.",
    },
    {
      q: "هل يمكنني طلب أكثر من تقرير؟",
      a: "نعم. كل تقرير يتطلب دفعة مستقلة. إذا كنت تمتلك أكثر من منشأة وتريد تقييم كل واحدة منها، ستحتاج لدفع رسوم لكل منشأة على حدة.",
    },
    {
      q: "هل هناك خصومات للشركات أو الكميات؟",
      a: "للاستفسار عن أسعار الشركات أو الكميات الكبيرة (أكثر من 5 تقارير)، تواصل معنا مباشرة عبر البريد الإلكتروني وسنقدم لك عرضاً مخصصاً.",
    },
    {
      q: "متى يصدر الفاتورة الضريبية؟",
      a: "تصدر الفاتورة الضريبية الرسمية تلقائياً بعد إتمام عملية الدفع وتُرسَل إلى بريدك الإلكتروني المسجّل خلال دقائق.",
    },
  ];

  return (
    <section style={{ backgroundColor: "#f8faf9", padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ color: PRIMARY_DARK, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
            أسئلة حول التسعير والدفع
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{ border: `1px solid ${openIndex === i ? PRIMARY : "#e2e8f0"}`, borderRadius: 12, overflow: "hidden" }}
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
                <span style={{ color: PRIMARY_DARK, fontWeight: 700, fontSize: 15 }}>{faq.q}</span>
                <span
                  style={{
                    color: PRIMARY, fontSize: 20, fontWeight: 700, flexShrink: 0,
                    display: "inline-block", transition: "transform 0.2s",
                    transform: openIndex === i ? "rotate(45deg)" : "rotate(0)",
                  }}
                >
                  +
                </span>
              </button>
              {openIndex === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", backgroundColor: "#f8faf9", color: "#374151", fontSize: 15, lineHeight: 1.8, textAlign: "right" }}>
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

function LegalNotice() {
  return (
    <section style={{ backgroundColor: "#fffbeb", padding: "2.5rem 1.5rem" }}>
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
          <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
          <p style={{ color: "#78350f", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
            <strong>تنبيه:</strong> التقرير الناتج هو تقرير استشاري أولي ومساند، ولا يُعد عقد امتياز نهائياً أو وثيقة قانونية
            معتمدة إلا بعد مراجعته من مستشار قانوني مختص. استخدام هذه المنصة لا يُغني عن الاستشارة القانونية المتخصصة.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ backgroundColor: "#0f1f16", padding: "2.5rem 1.5rem", color: "rgba(255,255,255,0.65)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", fontSize: 13 }}>
          <span>© 2025 Franchise Ready AI. جميع الحقوق محفوظة.</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 13 }}>شروط الاستخدام</Link>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 13 }}>سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <PricingHero />
        <ComparisonSection />
        <PricingCard />
        <PricingFAQ />
        <LegalNotice />
      </main>
      <Footer />
    </>
  );
}
