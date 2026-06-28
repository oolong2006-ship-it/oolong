"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReportSection {
  id: string;
  sectionKey: string;
  titleAr: string | null;
  content: string | null;
  orderIndex: number;
}

interface ReportMeta {
  id: string;
  isFinal: boolean;
  readinessScore: number | null;
  generatedAt: string;
  establishmentName: string;
  establishmentStatus: string;
  finalIssuedAt: string | null;
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-3 py-6">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
        <div className="h-3 bg-gray-100 rounded w-full" />
      </div>
    </div>
  );
}

// ─── Single section card ──────────────────────────────────────────────────────

function SectionCard({
  section,
  isFinal,
  projectId,
  onRegenerate,
}: {
  section: ReportSection;
  isFinal: boolean;
  projectId: string;
  onRegenerate: (sectionId: string) => void;
}) {
  return (
    <div
      id={`section-${section.sectionKey}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <h2 className="font-bold text-gray-900 text-sm">
          {section.orderIndex + 1}. {section.titleAr ?? section.sectionKey}
        </h2>
        {!isFinal && (
          <button
            onClick={() => onRegenerate(section.id)}
            className="flex items-center gap-1.5 text-xs text-[#1a5c3a] hover:text-[#0f3d26] border border-[#1a5c3a]/30 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            إعادة التوليد
          </button>
        )}
      </div>
      <div className="px-5 py-5">
        <p className="text-sm text-gray-700 leading-loose whitespace-pre-wrap">
          {section.content ?? "لم يتم توليد محتوى هذا القسم بعد."}
        </p>
      </div>
    </div>
  );
}

// ─── TOC Sidebar ──────────────────────────────────────────────────────────────

function TocSidebar({
  sections,
  activeKey,
}: {
  sections: ReportSection[];
  activeKey: string | null;
}) {
  return (
    <nav className="space-y-0.5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 pb-2">
        فهرس التقرير
      </p>
      {sections.map((s) => (
        <a
          key={s.sectionKey}
          href={`#section-${s.sectionKey}`}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
            activeKey === s.sectionKey
              ? "bg-[#e8f5ee] text-[#1a5c3a] font-semibold"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span className="w-5 shrink-0 text-right text-gray-400">
            {s.orderIndex + 1}.
          </span>
          <span className="leading-tight">{s.titleAr ?? s.sectionKey}</span>
        </a>
      ))}
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [report, setReport] = useState<ReportMeta | null>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/report`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error ?? "تعذّر تحميل التقرير");
        } else {
          setReport(json.report);
          setSections(json.sections ?? []);
          if (json.sections?.length > 0) {
            setActiveKey(json.sections[0].sectionKey);
          }
        }
      })
      .catch(() => setError("تعذّر الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Intersection observer for active TOC item
  useEffect(() => {
    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = entry.target.id.replace("section-", "");
            setActiveKey(key);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((s) => {
      const el = document.getElementById(`section-${s.sectionKey}`);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  function handleRegenerate(sectionId: string) {
    // Placeholder — in production, POST to a regenerate endpoint
    console.log("Regenerate section:", sectionId);
  }

  async function handleIssueFinal() {
    if (!consent) return;
    setIssueError(null);
    setIssuing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/issue-final`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setIssueError(json.error ?? "حدث خطأ أثناء إصدار التقرير.");
        return;
      }
      router.push(`/dashboard/projects/${projectId}/download`);
    } catch {
      setIssueError("تعذّر الاتصال بالخادم. يرجى المحاولة مجدداً.");
    } finally {
      setIssuing(false);
    }
  }

  const isFinal = report?.isFinal ?? false;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">معاينة التقرير</h1>
            <p className="mt-1 text-gray-500 text-sm">
              راجع جميع أقسام التقرير قبل الإصدار النهائي
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard/projects/${projectId}/score`}
              className="text-sm text-[#1a5c3a] border border-[#1a5c3a]/30 hover:bg-[#e8f5ee] px-3 py-2 rounded-lg transition-colors"
            >
              درجة الجاهزية
            </Link>
            {isFinal && (
              <Link
                href={`/dashboard/projects/${projectId}/download`}
                className="text-sm bg-[#1a5c3a] hover:bg-[#0f3d26] text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                تحميل التقرير
              </Link>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            <div className="hidden lg:block bg-white rounded-xl border border-gray-100 p-4">
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${60 + (i % 4) * 10}%` }} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                  <SectionSkeleton />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && report && (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
            {/* Sidebar TOC */}
            <div className="hidden lg:block sticky top-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <TocSidebar sections={sections} activeKey={activeKey} />
            </div>

            {/* Main content */}
            <div className="space-y-4">
              {/* Report info bar */}
              {report && (
                <div className="bg-[#e8f5ee] border border-[#1a5c3a]/20 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-xs text-[#1a5c3a]">
                  <span className="font-semibold">{report.establishmentName}</span>
                  <span className="text-[#1a5c3a]/40">|</span>
                  <span>درجة الجاهزية: <strong>{report.readinessScore}/100</strong></span>
                  <span className="text-[#1a5c3a]/40">|</span>
                  <span>
                    تاريخ التحليل:{" "}
                    {new Date(report.generatedAt).toLocaleDateString("ar-SA")}
                  </span>
                  {isFinal && (
                    <>
                      <span className="text-[#1a5c3a]/40">|</span>
                      <span className="bg-[#1a5c3a] text-white px-2 py-0.5 rounded-full font-semibold">
                        صدر نهائياً
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Sections */}
              {sections.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                  لا توجد أقسام في هذا التقرير بعد.
                </div>
              ) : (
                sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isFinal={isFinal}
                    projectId={projectId}
                    onRegenerate={handleRegenerate}
                  />
                ))
              )}

              {/* Final issue block — only show if not yet final */}
              {!isFinal && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <h2 className="font-bold text-gray-900">إصدار التقرير النهائي</h2>

                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                    <p className="font-semibold mb-1">تنبيه قانوني مهم</p>
                    <p>
                      هذا التقرير ذو طابع <strong>استشاري بحت</strong> ولا يُعدّ وثيقة قانونية
                      معتمدة أو بديلاً عن الاستشارة القانونية المتخصصة. جميع التوصيات والتحليلات
                      الواردة في هذا التقرير مبنية على البيانات التي أدخلها صاحب المنشأة. يُنصح
                      بمراجعة مستشار قانوني وتجاري متخصص قبل اتخاذ أي قرارات تجارية أو
                      استثمارية.
                    </p>
                  </div>

                  {/* Issue error */}
                  {issueError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                      {issueError}
                    </div>
                  )}

                  {/* Consent checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      disabled={issuing}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1a5c3a] accent-[#1a5c3a]"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      أفهم أن هذا التقرير{" "}
                      <span className="font-semibold text-gray-900">استشاري وليس وثيقة قانونية معتمدة</span>،
                      وأوافق على إصداره بصيغته النهائية.
                    </span>
                  </label>

                  {/* Issue button */}
                  <button
                    onClick={handleIssueFinal}
                    disabled={!consent || issuing}
                    className="w-full bg-[#c9a84c] hover:bg-[#a0812e] text-white font-bold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                  >
                    {issuing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جارٍ إصدار التقرير...
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        إصدار التقرير النهائي
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
