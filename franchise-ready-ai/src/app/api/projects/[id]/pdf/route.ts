import { NextResponse } from "next/server";
import { getSession, getSessionTokenFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { chromium } from "playwright";

export const dynamic = "force-dynamic";

function getScoreClassification(score: number): string {
  if (score >= 85) return "جاهزة بدرجة عالية";
  if (score >= 70) return "قابلة للامتياز مع تحسينات";
  if (score >= 50) return "تحتاج بناء أنظمة";
  return "غير جاهزة حاليًا";
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#16a34a";
  if (score >= 70) return "#2563eb";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function buildPdfHtml(
  establishmentName: string,
  score: number,
  reportDate: string,
  sections: Array<{ titleAr: string | null; content: string | null; orderIndex: number }>
): string {
  const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);
  const classification = getScoreClassification(score);
  const scoreColor = getScoreColor(score);

  const sectionsHtml = sortedSections
    .map(
      (s, i) => `
    <div class="section" id="section-${i}">
      <h2 class="section-title">${s.titleAr ?? ""}</h2>
      <div class="section-content">${(s.content ?? "").replace(/\n/g, "<br>")}</div>
    </div>
  `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تقرير جاهزية الامتياز التجاري - ${establishmentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Tajawal', 'Arial', sans-serif;
      direction: rtl;
      color: #1a1a1a;
      font-size: 13px;
      line-height: 1.8;
      background: #fff;
    }

    /* ── Cover Page ── */
    .cover-page {
      page-break-after: always;
      min-height: 100vh;
      background: linear-gradient(160deg, #1a5c3a 0%, #0f3d26 60%, #1a5c3a 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 40px;
      position: relative;
      overflow: hidden;
    }

    .cover-page::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(circle at 20% 80%, rgba(201,168,76,0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(201,168,76,0.1) 0%, transparent 50%);
    }

    .cover-logo {
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.15);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
      font-size: 36px;
      color: #c9a84c;
      border: 2px solid rgba(201,168,76,0.4);
      position: relative;
      z-index: 1;
    }

    .cover-badge {
      background: rgba(201,168,76,0.2);
      border: 1px solid rgba(201,168,76,0.5);
      color: #c9a84c;
      padding: 6px 20px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .cover-title {
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }

    .cover-subtitle {
      font-size: 18px;
      color: rgba(255,255,255,0.75);
      margin-bottom: 48px;
      position: relative;
      z-index: 1;
    }

    .cover-establishment {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 28px 48px;
      margin-bottom: 48px;
      position: relative;
      z-index: 1;
    }

    .cover-establishment-name {
      font-size: 24px;
      font-weight: 700;
      color: #c9a84c;
      margin-bottom: 8px;
    }

    .cover-establishment-date {
      font-size: 13px;
      color: rgba(255,255,255,0.7);
    }

    .cover-score-box {
      background: rgba(255,255,255,0.1);
      border: 2px solid ${scoreColor};
      border-radius: 16px;
      padding: 20px 40px;
      position: relative;
      z-index: 1;
    }

    .cover-score-label {
      font-size: 13px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 4px;
    }

    .cover-score-number {
      font-size: 56px;
      font-weight: 900;
      color: ${scoreColor};
      line-height: 1;
    }

    .cover-score-classification {
      font-size: 14px;
      color: rgba(255,255,255,0.85);
      margin-top: 6px;
    }

    .cover-footer {
      position: absolute;
      bottom: 30px;
      left: 0; right: 0;
      text-align: center;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      z-index: 1;
    }

    /* ── Page Structure ── */
    .page {
      padding: 40px 48px;
      position: relative;
    }

    /* ── Header / Footer ── */
    @page {
      margin: 0;
      size: A4;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 28px;
    }

    .page-header-brand {
      font-size: 13px;
      font-weight: 700;
      color: #1a5c3a;
    }

    .page-header-name {
      font-size: 12px;
      color: #64748b;
    }

    .page-footer {
      position: fixed;
      bottom: 20px;
      left: 0; right: 0;
      text-align: center;
      font-size: 10px;
      color: #94a3a0;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin: 0 48px;
    }

    .disclaimer-footer {
      font-size: 10px;
      color: #dc2626;
      opacity: 0.7;
      margin-top: 4px;
    }

    /* ── Watermark ── */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(26, 92, 58, 0.04);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 4px;
    }

    /* ── Sections ── */
    .section {
      page-break-before: always;
      padding: 40px 48px;
      position: relative;
    }

    .section:first-child {
      page-break-before: avoid;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #1a5c3a;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 3px solid #c9a84c;
      display: inline-block;
    }

    .section-content {
      font-size: 13px;
      line-height: 1.9;
      color: #2d3748;
      white-space: pre-wrap;
    }

    /* ── Score Summary Page ── */
    .score-summary {
      background: linear-gradient(135deg, #f8faf9, #e8f5ee);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      text-align: center;
    }

    .score-big {
      font-size: 72px;
      font-weight: 900;
      color: ${scoreColor};
      line-height: 1;
    }

    .score-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }

    .score-classification {
      font-size: 18px;
      font-weight: 700;
      color: ${scoreColor};
      margin-top: 8px;
    }

    .dimension-bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .dimension-label {
      font-size: 12px;
      color: #374151;
      width: 140px;
      flex-shrink: 0;
      text-align: right;
    }

    .dimension-bar-track {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .dimension-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: #1a5c3a;
    }

    .dimension-score-val {
      font-size: 12px;
      font-weight: 700;
      color: #1a5c3a;
      width: 36px;
      text-align: left;
    }
  </style>
</head>
<body>

  <!-- Watermark -->
  <div class="watermark">استشاري فقط</div>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-logo">📊</div>
    <div class="cover-badge">Franchise Ready AI | فرنشايز ريدي</div>
    <div class="cover-title">تقرير جاهزية الامتياز التجاري</div>
    <div class="cover-subtitle">تقييم شامل بالذكاء الاصطناعي</div>

    <div class="cover-establishment">
      <div class="cover-establishment-name">${establishmentName}</div>
      <div class="cover-establishment-date">تاريخ الإصدار: ${reportDate}</div>
    </div>

    <div class="cover-score-box">
      <div class="cover-score-label">درجة الجاهزية الإجمالية</div>
      <div class="cover-score-number">${score}</div>
      <div class="cover-score-classification">${classification}</div>
    </div>

    <div class="cover-footer">
      هذا التقرير ذو طابع استشاري بحت | استشاري فقط — For Advisory Purposes Only
    </div>
  </div>

  <!-- Body Pages -->
  <div class="page-footer">
    <div>${establishmentName} | تقرير جاهزية الامتياز التجاري | ${reportDate}</div>
    <div class="disclaimer-footer">هذا التقرير استشاري فقط وليس وثيقة قانونية معتمدة</div>
  </div>

  <!-- Sections -->
  ${sectionsHtml}

</body>
</html>`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let browser = null;

  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح. يرجى تسجيل الدخول." },
        { status: 401 }
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "غير مصرح. يرجى تسجيل الدخول." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify establishment ownership
    const establishment = await db.establishment.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        nameAr: true,
        nameEn: true,
        status: true,
        finalIssuedAt: true,
      },
    });

    if (!establishment) {
      return NextResponse.json(
        { success: false, error: "المشروع غير موجود." },
        { status: 404 }
      );
    }

    if (establishment.userId !== session.id) {
      return NextResponse.json(
        { success: false, error: "غير مصرح بالوصول إلى هذا المشروع." },
        { status: 403 }
      );
    }

    // Get latest report with sections
    const report = await db.generatedReport.findFirst({
      where: { establishmentId: id },
      orderBy: { generatedAt: "desc" },
      include: {
        sections: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "لم يتم إنشاء تقرير لهذا المشروع بعد." },
        { status: 404 }
      );
    }

    const establishmentName =
      establishment.nameAr ?? establishment.nameEn ?? "المنشأة";
    const reportDate = (establishment.finalIssuedAt ?? report.generatedAt).toLocaleDateString(
      "ar-SA",
      { year: "numeric", month: "long", day: "numeric" }
    );

    const html = buildPdfHtml(
      establishmentName,
      report.readinessScore ?? 0,
      reportDate,
      report.sections
    );

    // Launch Playwright chromium to generate PDF
    browser = await chromium.launch({
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
      },
    });

    await browser.close();
    browser = null;

    const safeFileName = establishmentName.replace(/[^؀-ۿ\w]/g, "_");

    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="franchise-report-${safeFileName}.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("[GET /api/projects/[id]/pdf]", error);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء توليد ملف PDF. يرجى المحاولة مجدداً." },
      { status: 500 }
    );
  }
}
