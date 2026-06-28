"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface RecentProject {
  id: string;
  nameAr: string | null;
  nameEn: string | null;
  activityType: string | null;
  status: string;
  createdAt: string;
}

interface DashboardData {
  credits: number;
  projects: number;
  completedReports: number;
  recentProjects: RecentProject[];
  userName: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
  data_completed: { label: "اكتملت البيانات", color: "bg-blue-100 text-blue-700" },
  ai_generated: { label: "تم التحليل", color: "bg-purple-100 text-purple-700" },
  preview_ready: { label: "جاهز للمراجعة", color: "bg-orange-100 text-orange-700" },
  final_issued: { label: "صدر التقرير", color: "bg-green-100 text-green-700" },
  locked: { label: "مقفل", color: "bg-gray-200 text-gray-600" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      })
      .catch(() => setError("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          {data && (
            <p className="mt-1 text-gray-500">
              مرحباً،{" "}
              <span className="font-semibold text-[#1a5c3a]">{data.userName}</span>
            </p>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1a5c3a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">رصيد المشاريع المتاح</p>
                    <p className="mt-1 text-3xl font-bold text-[#1a5c3a]">{data.credits}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#e8f5ee] rounded-xl flex items-center justify-center text-2xl">
                    💳
                  </div>
                </div>
                {data.credits === 0 && (
                  <Link
                    href="/payment"
                    className="mt-3 block text-center text-sm font-medium text-[#c9a84c] hover:text-[#a0812e] transition-colors"
                  >
                    اشترِ الآن ←
                  </Link>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">المشاريع الجارية</p>
                    <p className="mt-1 text-3xl font-bold text-[#1a5c3a]">{data.projects}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#e8f5ee] rounded-xl flex items-center justify-center text-2xl">
                    📁
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">التقارير المكتملة</p>
                    <p className="mt-1 text-3xl font-bold text-[#1a5c3a]">{data.completedReports}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#e8f5ee] rounded-xl flex items-center justify-center text-2xl">
                    📄
                  </div>
                </div>
              </div>
            </div>

            {/* No credits CTA */}
            {data.credits === 0 && (
              <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">ليس لديك رصيد</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    اشترِ رصيدًا لبدء مشاريعك وتقييم جاهزيتك للامتياز التجاري
                  </p>
                </div>
                <Link
                  href="/payment"
                  className="shrink-0 bg-[#c9a84c] hover:bg-[#a0812e] text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  اشترِ الآن
                </Link>
              </div>
            )}

            {/* Credits > 0 but no projects CTA */}
            {data.credits > 0 && data.projects === 0 && (
              <div className="bg-[#1a5c3a] rounded-2xl p-8 text-center text-white">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-xl font-bold">ابدأ مشروعك الأول</h3>
                <p className="mt-2 text-white/80 text-sm max-w-sm mx-auto">
                  لديك رصيد جاهز! ابدأ الآن بتقييم منشأتك للامتياز التجاري
                </p>
                <Link
                  href="/dashboard/projects/new"
                  className="mt-5 inline-block bg-[#c9a84c] hover:bg-[#d9be7a] text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  ابدأ مشروعك الأول
                </Link>
              </div>
            )}

            {/* Recent projects */}
            {data.recentProjects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">مشاريعك الأخيرة</h2>
                  <Link
                    href="/dashboard/projects"
                    className="text-sm text-[#1a5c3a] hover:text-[#0f3d26] font-medium transition-colors"
                  >
                    عرض الكل
                  </Link>
                </div>
                <ul className="divide-y divide-gray-50">
                  {data.recentProjects.slice(0, 3).map((project) => (
                    <li key={project.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {project.nameAr ?? project.nameEn ?? "منشأة بدون اسم"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {project.activityType ?? "—"} &bull;{" "}
                          {new Date(project.createdAt).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={project.status} />
                        <Link
                          href={`/dashboard/projects/${project.id}/wizard`}
                          className="text-sm text-[#1a5c3a] hover:underline font-medium"
                        >
                          فتح
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
