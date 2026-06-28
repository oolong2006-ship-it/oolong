"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Project {
  id: string;
  nameAr: string | null;
  nameEn: string | null;
  activityType: string | null;
  city: string | null;
  status: string;
  dataCompletion: number;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "مسودة", bg: "bg-gray-100", text: "text-gray-700" },
  data_completed: { label: "اكتملت البيانات", bg: "bg-blue-100", text: "text-blue-700" },
  ai_generated: { label: "تم التحليل", bg: "bg-purple-100", text: "text-purple-700" },
  preview_ready: { label: "جاهز للمراجعة", bg: "bg-orange-100", text: "text-orange-700" },
  final_issued: { label: "صدر التقرير", bg: "bg-green-100", text: "text-green-700" },
  locked: { label: "مقفل", bg: "bg-gray-200", text: "text-gray-600" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function ProjectActionButton({ project }: { project: Project }) {
  switch (project.status) {
    case "draft":
    case "data_completed":
      return (
        <Link
          href={`/dashboard/projects/${project.id}/wizard`}
          className="text-sm font-medium text-[#1a5c3a] hover:text-[#0f3d26] transition-colors"
        >
          استكمال البيانات
        </Link>
      );
    case "ai_generated":
    case "preview_ready":
      return (
        <Link
          href={`/dashboard/projects/${project.id}/preview`}
          className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
        >
          مراجعة التقرير
        </Link>
      );
    case "final_issued":
      return (
        <Link
          href={`/dashboard/projects/${project.id}/report`}
          className="text-sm font-medium text-green-700 hover:text-green-900 transition-colors"
        >
          عرض التقرير
        </Link>
      );
    case "locked":
      return (
        <span className="text-sm text-gray-400">مقفل</span>
      );
    default:
      return (
        <Link
          href={`/dashboard/projects/${project.id}/wizard`}
          className="text-sm font-medium text-[#1a5c3a] hover:text-[#0f3d26] transition-colors"
        >
          فتح
        </Link>
      );
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/user/credits").then((r) => r.json()),
    ])
      .then(([projectsData, creditsData]) => {
        if (projectsData.error) {
          setError(projectsData.error);
        } else {
          setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects ?? []);
        }
        setCredits(creditsData?.credits ?? 0);
      })
      .catch(() => setError("فشل تحميل المشاريع"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">مشاريعي</h1>
          {credits > 0 && (
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-2 bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <span className="text-base">➕</span>
              مشروع جديد
            </Link>
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

        {!loading && !error && projects.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-lg font-bold text-gray-900">لا توجد مشاريع بعد</h3>
            <p className="mt-2 text-gray-500 text-sm max-w-xs mx-auto">
              أنشئ مشروعك الأول لبدء تقييم جاهزيتك للامتياز التجاري
            </p>
            {credits > 0 ? (
              <Link
                href="/dashboard/projects/new"
                className="mt-5 inline-block bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                إنشاء مشروع جديد
              </Link>
            ) : (
              <Link
                href="/payment"
                className="mt-5 inline-block bg-[#c9a84c] hover:bg-[#a0812e] text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                اشترِ رصيدًا أولاً
              </Link>
            )}
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8faf9] border-b border-gray-100">
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">اسم المنشأة</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">النشاط</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">الحالة</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">تاريخ الإنشاء</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-[#f8faf9] transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {project.nameAr ?? project.nameEn ?? "بدون اسم"}
                        {project.city && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">
                            {project.city}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {project.activityType ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-5 py-4">
                        <ProjectActionButton project={project} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="sm:hidden divide-y divide-gray-50">
              {projects.map((project) => (
                <li key={project.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {project.nameAr ?? project.nameEn ?? "بدون اسم"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {project.activityType ?? "—"}
                        {project.city ? ` · ${project.city}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(project.createdAt).toLocaleDateString("ar-SA")}</span>
                    <ProjectActionButton project={project} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
