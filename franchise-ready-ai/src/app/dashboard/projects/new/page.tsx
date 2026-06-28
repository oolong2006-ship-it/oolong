"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

const activityTypes = [
  { value: "مطعم", label: "مطعم" },
  { value: "كافيه", label: "كافيه" },
  { value: "خدمات", label: "خدمات" },
  { value: "أخرى", label: "أخرى" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  const [nameAr, setNameAr] = useState("");
  const [activityType, setActivityType] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/credits")
      .then((r) => r.json())
      .then((data) => setCredits(data?.credits ?? 0))
      .catch(() => setCredits(0))
      .finally(() => setCreditsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      setError("يرجى إدخال اسم المنشأة");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: nameAr.trim(),
          activityType: activityType || undefined,
          city: city.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل إنشاء المشروع");
        return;
      }
      router.push(`/dashboard/projects/${data.projectId}/wizard`);
    } catch {
      setError("حدث خطأ غير متوقع، يرجى المحاولة مجدداً");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/dashboard/projects" className="hover:text-[#1a5c3a] transition-colors">
            مشاريعي
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">إنشاء منشأة جديدة</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900">إنشاء منشأة جديدة</h1>

        {creditsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#1a5c3a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!creditsLoading && credits === 0 && (
          <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-lg font-bold text-gray-900">لا يوجد رصيد كافٍ</h3>
            <p className="mt-2 text-gray-600 text-sm max-w-sm mx-auto">
              تحتاج إلى رصيد لإنشاء مشروع جديد. اشترِ رصيدًا وابدأ تقييم منشأتك.
            </p>
            <Link
              href="/payment"
              className="mt-5 inline-block bg-[#c9a84c] hover:bg-[#a0812e] text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              اشترِ رصيدًا
            </Link>
          </div>
        )}

        {!creditsLoading && credits !== null && credits > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Credits notice */}
            <div className="flex items-center gap-3 mb-6 bg-[#e8f5ee] rounded-xl px-4 py-3">
              <span className="text-xl">💳</span>
              <p className="text-sm text-[#1a5c3a] font-medium">
                رصيدك المتاح:{" "}
                <span className="font-bold">{credits} مشروع</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="nameAr" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  اسم المنشأة <span className="text-red-500">*</span>
                </label>
                <input
                  id="nameAr"
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  required
                  placeholder="مثال: مطعم الأصالة"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9]"
                />
              </div>

              {/* Activity type */}
              <div>
                <label htmlFor="activityType" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  نوع النشاط
                </label>
                <select
                  id="activityType"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9] appearance-none"
                >
                  <option value="">اختر نوع النشاط</option>
                  {activityTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  المدينة
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: الرياض"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9]"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? "جارٍ الإنشاء..." : "إنشاء المنشأة"}
                </button>
                <Link
                  href="/dashboard/projects"
                  className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
