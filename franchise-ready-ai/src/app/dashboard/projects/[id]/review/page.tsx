"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EstablishmentData {
  id: string;
  status: string;
  dataCompletion: number;
  nameAr: string | null;
  nameEn: string | null;
  activityType: string | null;
  city: string | null;
  country: string;
  foundingYear: number | null;
  branchCount: number | null;
  fullyOwned: boolean | null;
  trademarkReg: boolean | null;
  crNumber: string | null;
  descriptionAr: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  brandColors: string | null;
  mainProducts: string | null;
  bestSeller: string | null;
  avgPrice: number | null;
  uniquePoints: string | null;
  hasDocRecipes: boolean | null;
  qualityReplicable: boolean | null;
  targetCustomer: string | null;
  competitors: string | null;
  expansionCities: string | null;
  demandStrength: string | null;
  seasonality: string | null;
  avgMonthlySales: number | null;
  avgDailyOrders: number | null;
  avgInvoiceValue: number | null;
  cogs: number | null;
  rent: number | null;
  salaries: number | null;
  opExpenses: number | null;
  netProfit: number | null;
  newBranchCost: number | null;
  paybackPeriod: string | null;
  hasSOPs: boolean | null;
  hasPOS: boolean | null;
  hasERP: boolean | null;
  hasOpsManual: boolean | null;
  hasTrainingManual: boolean | null;
  qualityControl: string | null;
  complaintProcess: string | null;
  hasInternalAudit: boolean | null;
  employeesPerBranch: number | null;
  orgStructure: string | null;
  trainingDuration: string | null;
  hasInternalTrainer: boolean | null;
  easyToReplicate: boolean | null;
  mainSuppliers: string | null;
  hasSupplierContracts: boolean | null;
  hasMaterialSpecs: boolean | null;
  hasCentralKitchen: boolean | null;
  hasCentralWarehouse: boolean | null;
  canMandateSuppliers: boolean | null;
  franchiseWhy: string | null;
  targetBranchCount: number | null;
  expansionScope: string | null;
  proposedFees: number | null;
  proposedRoyalty: number | null;
  franchiseeSupport: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: string | number | boolean | null | undefined, suffix = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  return `${value}${suffix}`;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 w-36 shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm font-medium flex-1 ${value === "—" ? "text-gray-300" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Section config ───────────────────────────────────────────────────────────

type SectionId =
  | "general"
  | "identity"
  | "products"
  | "market"
  | "financials"
  | "operations"
  | "hr"
  | "supply_chain"
  | "franchise_intent";

interface Section {
  id: SectionId;
  label: string;
  icon: string;
  wizardStep: number;
}

const SECTIONS: Section[] = [
  { id: "general", label: "المعلومات العامة", icon: "🏢", wizardStep: 1 },
  { id: "identity", label: "الهوية والعلامة", icon: "🎨", wizardStep: 2 },
  { id: "products", label: "المنتجات والخدمات", icon: "🛍️", wizardStep: 3 },
  { id: "market", label: "السوق والعملاء", icon: "📊", wizardStep: 4 },
  { id: "financials", label: "المالية", icon: "💰", wizardStep: 5 },
  { id: "operations", label: "التشغيل", icon: "⚙️", wizardStep: 6 },
  { id: "hr", label: "الموارد البشرية", icon: "👥", wizardStep: 7 },
  { id: "supply_chain", label: "سلسلة التوريد", icon: "🔗", wizardStep: 8 },
  { id: "franchise_intent", label: "أهداف الفرنشايز", icon: "🚀", wizardStep: 9 },
];

function getSectionRows(
  section: SectionId,
  data: EstablishmentData
): Array<{ label: string; value: string }> {
  switch (section) {
    case "general":
      return [
        { label: "الاسم بالعربية", value: fmt(data.nameAr) },
        { label: "الاسم بالإنجليزية", value: fmt(data.nameEn) },
        { label: "نوع النشاط", value: fmt(data.activityType) },
        { label: "المدينة", value: fmt(data.city) },
        { label: "الدولة", value: fmt(data.country) },
        { label: "سنة التأسيس", value: fmt(data.foundingYear) },
        { label: "عدد الفروع", value: fmt(data.branchCount) },
        { label: "مملوكة بالكامل", value: fmt(data.fullyOwned) },
        { label: "العلامة مسجلة", value: fmt(data.trademarkReg) },
        { label: "رقم السجل التجاري", value: fmt(data.crNumber) },
        { label: "وصف النشاط", value: fmt(data.descriptionAr) },
      ];
    case "identity":
      return [
        { label: "الموقع الإلكتروني", value: fmt(data.websiteUrl) },
        { label: "حساب إنستغرام", value: fmt(data.instagramUrl) },
        { label: "ألوان العلامة", value: fmt(data.brandColors) },
      ];
    case "products":
      return [
        { label: "المنتجات الرئيسية", value: fmt(data.mainProducts) },
        { label: "الأكثر مبيعاً", value: fmt(data.bestSeller) },
        { label: "متوسط السعر", value: fmt(data.avgPrice, " ريال") },
        { label: "نقاط التميز", value: fmt(data.uniquePoints) },
        { label: "وصفات موثقة", value: fmt(data.hasDocRecipes) },
        { label: "جودة قابلة للتكرار", value: fmt(data.qualityReplicable) },
      ];
    case "market":
      return [
        { label: "العميل المستهدف", value: fmt(data.targetCustomer) },
        { label: "المنافسون", value: fmt(data.competitors) },
        { label: "المدن المستهدفة", value: fmt(data.expansionCities) },
        { label: "قوة الطلب", value: fmt(data.demandStrength) },
        { label: "الموسمية", value: fmt(data.seasonality) },
      ];
    case "financials":
      return [
        { label: "متوسط المبيعات الشهرية", value: fmt(data.avgMonthlySales, " ريال") },
        { label: "متوسط الطلبات اليومية", value: fmt(data.avgDailyOrders) },
        { label: "متوسط قيمة الفاتورة", value: fmt(data.avgInvoiceValue, " ريال") },
        { label: "تكلفة البضاعة (COGS)", value: fmt(data.cogs, "%") },
        { label: "الإيجار", value: fmt(data.rent, " ريال") },
        { label: "الرواتب", value: fmt(data.salaries, " ريال") },
        { label: "مصاريف التشغيل", value: fmt(data.opExpenses, " ريال") },
        { label: "صافي الربح", value: fmt(data.netProfit, " ريال") },
        { label: "تكلفة فرع جديد", value: fmt(data.newBranchCost, " ريال") },
        { label: "فترة الاسترداد", value: fmt(data.paybackPeriod) },
      ];
    case "operations":
      return [
        { label: "إجراءات موثقة (SOPs)", value: fmt(data.hasSOPs) },
        { label: "نظام POS", value: fmt(data.hasPOS) },
        { label: "نظام ERP", value: fmt(data.hasERP) },
        { label: "دليل التشغيل", value: fmt(data.hasOpsManual) },
        { label: "دليل التدريب", value: fmt(data.hasTrainingManual) },
        { label: "ضبط الجودة", value: fmt(data.qualityControl) },
        { label: "إجراءات الشكاوى", value: fmt(data.complaintProcess) },
        { label: "التدقيق الداخلي", value: fmt(data.hasInternalAudit) },
      ];
    case "hr":
      return [
        { label: "موظفون لكل فرع", value: fmt(data.employeesPerBranch) },
        { label: "الهيكل التنظيمي", value: fmt(data.orgStructure) },
        { label: "مدة التدريب", value: fmt(data.trainingDuration) },
        { label: "مدرب داخلي", value: fmt(data.hasInternalTrainer) },
        { label: "سهولة استنساخ الكوادر", value: fmt(data.easyToReplicate) },
      ];
    case "supply_chain":
      return [
        { label: "الموردون الرئيسيون", value: fmt(data.mainSuppliers) },
        { label: "عقود موردين", value: fmt(data.hasSupplierContracts) },
        { label: "مواصفات مواد موثقة", value: fmt(data.hasMaterialSpecs) },
        { label: "مطبخ مركزي", value: fmt(data.hasCentralKitchen) },
        { label: "مستودع مركزي", value: fmt(data.hasCentralWarehouse) },
        { label: "إمكانية إلزام الموردين", value: fmt(data.canMandateSuppliers) },
      ];
    case "franchise_intent":
      return [
        { label: "سبب الامتياز", value: fmt(data.franchiseWhy) },
        { label: "عدد الفروع المستهدفة", value: fmt(data.targetBranchCount) },
        { label: "نطاق التوسع", value: fmt(data.expansionScope) },
        { label: "رسوم الامتياز المقترحة", value: fmt(data.proposedFees, " ريال") },
        { label: "نسبة الإتاوة المقترحة", value: fmt(data.proposedRoyalty, "%") },
        { label: "دعم المنتفع", value: fmt(data.franchiseeSupport) },
      ];
  }
}

// ─── Accordion Section ────────────────────────────────────────────────────────

function SectionAccordion({
  section,
  data,
  projectId,
  defaultOpen,
}: {
  section: Section;
  data: EstablishmentData;
  projectId: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const rows = getSectionRows(section.id, data);
  const filledCount = rows.filter((r) => r.value !== "—").length;
  const totalCount = rows.length;
  const pct = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-right hover:bg-gray-50 transition-colors"
      >
        <span className="text-xl">{section.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm">{section.label}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {filledCount}/{totalCount} حقل مكتمل
          </div>
        </div>
        {/* Progress pill */}
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            pct >= 80
              ? "bg-green-100 text-green-700"
              : pct >= 50
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {pct}%
        </span>
        {/* Edit link */}
        <Link
          href={`/dashboard/projects/${projectId}/wizard?step=${section.wizardStep}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-[#1a5c3a] hover:text-[#0f3d26] border border-[#1a5c3a]/30 rounded-lg px-2.5 py-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          تعديل
        </Link>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-3">
          {rows.map((row) => (
            <DataRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [data, setData] = useState<EstablishmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error || !json.success) {
          setError(json.error ?? "تعذّر تحميل البيانات");
        } else {
          setData(json.establishment ?? json.data ?? json);
        }
      })
      .catch(() => setError("تعذّر الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleAnalyze() {
    if (!consent) return;
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setAnalyzeError(json.error ?? "حدث خطأ أثناء التحليل.");
        return;
      }
      router.push(`/dashboard/projects/${projectId}/score`);
    } catch {
      setAnalyzeError("تعذّر الاتصال بالخادم. يرجى المحاولة مجدداً.");
    } finally {
      setAnalyzing(false);
    }
  }

  const completion = data?.dataCompletion ?? 0;
  const isLowCompletion = completion < 70;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مراجعة البيانات</h1>
            <p className="mt-1 text-gray-500 text-sm">
              راجع جميع البيانات المدخلة قبل بدء التحليل بالذكاء الاصطناعي
            </p>
          </div>
          <Link
            href={`/dashboard/projects/${projectId}/wizard`}
            className="text-sm text-[#1a5c3a] hover:text-[#0f3d26] font-medium border border-[#1a5c3a]/30 rounded-lg px-3 py-2 transition-colors whitespace-nowrap"
          >
            العودة للمعالج
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1a5c3a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Completion card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">نسبة اكتمال البيانات</span>
                <span
                  className={`text-lg font-bold ${
                    completion >= 70 ? "text-[#1a5c3a]" : "text-orange-500"
                  }`}
                >
                  {completion}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completion >= 70 ? "bg-[#1a5c3a]" : "bg-orange-400"
                  }`}
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {/* Low completion warning */}
            {isLowCompletion && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-orange-800 text-sm">بيانات ناقصة</p>
                  <p className="text-orange-700 text-sm mt-1">
                    نسبة اكتمال البيانات أقل من 70%. نوصي بإكمال المزيد من المعلومات للحصول على
                    تحليل أدق وتقرير أكثر شمولاً.
                  </p>
                  <Link
                    href={`/dashboard/projects/${projectId}/wizard`}
                    className="inline-block mt-2 text-sm font-semibold text-orange-700 hover:text-orange-900 underline"
                  >
                    إكمال البيانات الناقصة →
                  </Link>
                </div>
              </div>
            )}

            {/* Sections accordion */}
            <div className="space-y-3">
              {SECTIONS.map((section, i) => (
                <SectionAccordion
                  key={section.id}
                  section={section}
                  data={data}
                  projectId={projectId}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {/* Analysis CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-gray-900">بدء التحليل بالذكاء الاصطناعي</h2>
              <p className="text-sm text-gray-600">
                سيتم إرسال بياناتك للتحليل بالذكاء الاصطناعي وسيتم توليد تقرير جاهزية شامل يتضمن
                28 قسماً يُقيّم منشأتك من جميع الجوانب.
              </p>

              {/* Analyze error */}
              {analyzeError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {analyzeError}
                </div>
              )}

              {/* Consent checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={analyzing}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1a5c3a] accent-[#1a5c3a]"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  أوافق على إرسال البيانات المدخلة للتحليل بالذكاء الاصطناعي وأفهم أن التقرير
                  الناتج ذو طابع{" "}
                  <span className="font-semibold text-gray-900">استشاري فقط</span> وليس وثيقة
                  قانونية معتمدة.
                </span>
              </label>

              {/* Analyzing progress */}
              {analyzing && (
                <div className="flex items-center gap-3 bg-[#e8f5ee] rounded-xl p-4">
                  <div className="w-6 h-6 border-3 border-[#1a5c3a] border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#1a5c3a]">
                      جارٍ التحليل بالذكاء الاصطناعي...
                    </p>
                    <p className="text-xs text-[#2d7a52] mt-0.5">
                      قد تستغرق هذه العملية بضع دقائق. يرجى عدم إغلاق الصفحة.
                    </p>
                  </div>
                </div>
              )}

              {/* CTA button */}
              {!analyzing && (
                <button
                  onClick={handleAnalyze}
                  disabled={!consent}
                  className="w-full bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-bold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  ابدأ التحليل الذكي
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
