"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScoreData {
  reportId: string;
  establishmentName: string;
  readinessScore: number;
  brandStrength: number;
  replicability: number;
  productClarity: number;
  unitEconomics: number;
  systemsSOPs: number;
  supplyChain: number;
  legalReadiness: number;
  generatedAt: string;
  isFinal: boolean;
}

// ─── Score classification ────────────────────────────────────────────────────

interface Classification {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

function getClassification(score: number): Classification {
  if (score >= 85)
    return {
      label: "🏆 جاهزة بدرجة عالية",
      color: "#16a34a",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    };
  if (score >= 70)
    return {
      label: "✅ قابلة للامتياز مع تحسينات",
      color: "#2563eb",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    };
  if (score >= 50)
    return {
      label: "⚠️ تحتاج بناء أنظمة",
      color: "#d97706",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
    };
  return {
    label: "❌ غير جاهزة حاليًا",
    color: "#dc2626",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
  };
}

// ─── Dimension config ─────────────────────────────────────────────────────────

interface Dimension {
  key: keyof Omit<
    ScoreData,
    "reportId" | "establishmentName" | "readinessScore" | "generatedAt" | "isFinal"
  >;
  label: string;
  weight: number;
}

const DIMENSIONS: Dimension[] = [
  { key: "brandStrength", label: "قوة العلامة التجارية", weight: 15 },
  { key: "replicability", label: "قابلية التكرار", weight: 20 },
  { key: "productClarity", label: "وضوح المنتج", weight: 10 },
  { key: "unitEconomics", label: "الاقتصاديات التشغيلية", weight: 20 },
  { key: "systemsSOPs", label: "الأنظمة والإجراءات", weight: 15 },
  { key: "supplyChain", label: "سلسلة التوريد", weight: 10 },
  { key: "legalReadiness", label: "الجاهزية القانونية", weight: 10 },
];

function getStrengths(data: ScoreData): string[] {
  return DIMENSIONS.filter(
    (d) => (data[d.key] as number) >= 70
  ).map((d) => `${d.label} (${data[d.key]}/100)`);
}

function getGaps(data: ScoreData): string[] {
  return DIMENSIONS.filter(
    (d) => (data[d.key] as number) < 60
  ).map((d) => `${d.label} (${data[d.key]}/100)`);
}

// ─── Animated counter ────────────────────────────────────────────────────────

function useAnimatedCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    start.current = null;

    function step(timestamp: number) {
      if (start.current === null) start.current = timestamp;
      const elapsed = timestamp - start.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    }

    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return count;
}

// ─── Dimension progress bar ───────────────────────────────────────────────────

function DimensionBar({
  label,
  weight,
  value,
}: {
  label: string;
  weight: number;
  value: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const color =
    value >= 70 ? "#16a34a" : value >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">({weight} نقطة)</span>
          <span className="font-bold" style={{ color }}>
            {value}
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScorePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/score`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error ?? "تعذّر تحميل النتائج");
        } else {
          setData(json);
        }
      })
      .catch(() => setError("تعذّر الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, [projectId]);

  const animatedScore = useAnimatedCount(data?.readinessScore ?? 0);
  const classification = data ? getClassification(data.readinessScore) : null;
  const strengths = data ? getStrengths(data) : [];
  const gaps = data ? getGaps(data) : [];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">درجة الجاهزية</h1>
          <p className="mt-1 text-gray-500 text-sm">
            نتائج تحليل الذكاء الاصطناعي لمنشأتك
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#1a5c3a] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">جارٍ تحميل النتائج...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
            <div className="mt-3">
              <button
                onClick={() => router.push(`/dashboard/projects/${projectId}/review`)}
                className="text-sm font-semibold text-[#1a5c3a] hover:underline"
              >
                العودة لمراجعة البيانات →
              </button>
            </div>
          </div>
        )}

        {data && classification && (
          <>
            {/* Score hero card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-br from-[#1a5c3a] to-[#0f3d26] px-6 py-8 text-center">
                <p className="text-white/70 text-sm mb-2">{data.establishmentName}</p>
                <div
                  className="text-8xl font-black leading-none tabular-nums"
                  style={{ color: classification.color }}
                >
                  {animatedScore}
                </div>
                <p className="text-white/50 text-sm mt-2">من 100 نقطة</p>
              </div>
              <div className={`px-6 py-4 ${classification.bgColor} border-t ${classification.borderColor}`}>
                <p className={`text-center text-base font-bold ${classification.textColor}`}>
                  {classification.label}
                </p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-sm">تفصيل درجات المحاور</h2>
              <div className="space-y-4">
                {DIMENSIONS.map((d) => (
                  <DimensionBar
                    key={d.key}
                    label={d.label}
                    weight={d.weight}
                    value={data[d.key] as number}
                  />
                ))}
              </div>
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-green-700 text-sm mb-3 flex items-center gap-2">
                  <span>✅</span> نقاط القوة
                </h3>
                {strengths.length === 0 ? (
                  <p className="text-xs text-gray-400">لم يتم تحديد نقاط قوة بعد</p>
                ) : (
                  <ul className="space-y-2">
                    {strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="text-green-500 mt-0.5 shrink-0">●</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Gaps */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-red-700 text-sm mb-3 flex items-center gap-2">
                  <span>🔴</span> الفجوات والتحديات
                </h3>
                {gaps.length === 0 ? (
                  <p className="text-xs text-gray-400">لا توجد فجوات جوهرية</p>
                ) : (
                  <ul className="space-y-2">
                    {gaps.map((g) => (
                      <li key={g} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="text-red-500 mt-0.5 shrink-0">●</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dashboard/projects/${projectId}/preview`}
                className="flex-1 bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-sm text-center"
              >
                عرض التقرير الكامل
              </Link>
              <Link
                href={`/dashboard/projects/${projectId}/review`}
                className="flex-1 border border-[#1a5c3a]/30 text-[#1a5c3a] hover:bg-[#e8f5ee] font-medium py-3.5 px-6 rounded-xl transition-colors text-sm text-center"
              >
                العودة للمراجعة
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
