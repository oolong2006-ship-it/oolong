"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReportMeta {
  id: string;
  isFinal: boolean;
  readinessScore: number | null;
  generatedAt: string;
  establishmentName: string;
  finalIssuedAt: string | null;
}

// ─── Score classification ────────────────────────────────────────────────────

function getClassificationLabel(score: number): string {
  if (score >= 85) return "🏆 جاهزة بدرجة عالية";
  if (score >= 70) return "✅ قابلة للامتياز مع تحسينات";
  if (score >= 50) return "⚠️ تحتاج بناء أنظمة";
  return "❌ غير جاهزة حاليًا";
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 50) return "text-orange-500";
  return "text-red-600";
}

// ─── Success animation ────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
      <div className="absolute inset-0 rounded-full bg-green-100" />
      {/* Check */}
      <svg
        className="w-12 h-12 text-[#1a5c3a] relative z-10"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DownloadPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [report, setReport] = useState<ReportMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/report`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error ?? "تعذّر تحميل بيانات التقرير");
        } else {
          setReport(json.report);
        }
      })
      .catch(() => setError("تعذّر الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleDownloadPdf() {
    setDownloadError(null);
    setDownloading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/pdf`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setDownloadError((json as { error?: string }).error ?? "حدث خطأ أثناء توليد الملف.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = report?.establishmentName ?? "تقرير-الامتياز";
      a.download = `${name}-franchise-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("تعذّر تحميل الملف. يرجى المحاولة مجدداً.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/dashboard/projects/${projectId}/preview`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  }

  const score = report?.readinessScore ?? 0;
  const issuedDate = report?.finalIssuedAt
    ? new Date(report.finalIssuedAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#1a5c3a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Success card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Top green strip */}
              <div className="bg-gradient-to-r from-[#1a5c3a] to-[#2d7a52] h-2" />

              <div className="p-8 text-center space-y-4">
                <SuccessIcon />

                <div>
                  <h1 className="text-xl font-bold text-gray-900 mt-2">
                    تقريرك جاهز للتحميل
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    تم إصدار تقرير جاهزية الامتياز التجاري بنجاح
                  </p>
                </div>

                {/* Report meta */}
                {report && (
                  <div className="bg-[#f8faf9] rounded-xl p-4 text-right space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">المنشأة</span>
                      <span className="font-semibold text-gray-900">
                        {report.establishmentName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">درجة الجاهزية</span>
                      <span className={`font-bold text-lg ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">التصنيف</span>
                      <span className="font-medium text-gray-700">
                        {getClassificationLabel(score)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">تاريخ الإصدار</span>
                      <span className="text-gray-700">{issuedDate}</span>
                    </div>
                  </div>
                )}

                {/* Download error */}
                {downloadError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                    {downloadError}
                  </div>
                )}

                {/* Download button */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="w-full bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-bold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جارٍ التحضير...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      تحميل PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <span>🔗</span> مشاركة التقرير
              </h2>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 truncate" dir="ltr">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/dashboard/projects/${projectId}/preview`
                    : "..."}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-[#1a5c3a] text-white hover:bg-[#0f3d26]"
                  }`}
                >
                  {copied ? "✓ تم النسخ" : "نسخ الرابط"}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                هذا الرابط خاص بحسابك ويتطلب تسجيل الدخول للوصول.
              </p>
            </div>

            {/* Lock notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-lg shrink-0">🔒</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">المشروع مقفل</p>
                <p className="text-xs text-amber-700 mt-1">
                  تم قفل هذا المشروع بعد إصدار التقرير النهائي. أي تعديل أو إعادة تحليل يتطلب
                  شراء باقة إضافية.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/projects/new"
                className="w-full bg-[#c9a84c] hover:bg-[#a0812e] text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-sm text-center"
              >
                ابدأ منشأة جديدة
              </Link>
              <Link
                href="/dashboard/projects"
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition-colors text-sm text-center"
              >
                العودة لمشاريعي
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
