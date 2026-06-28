"use client"

import { useEffect, useState, useCallback } from "react"

interface AdminProject {
  id: string
  nameAr: string | null
  nameEn: string | null
  activityType: string | null
  city: string | null
  status: string
  dataCompletion: number
  readinessScore: number | null
  userId: string
  userName: string
  userEmail: string
  createdAt: string
  updatedAt: string
  reportUrl: string | null
}

interface ProjectsResponse {
  projects: AdminProject[]
  total: number
  page: number
  totalPages: number
}

const statusOptions = [
  { value: "", label: "جميع الحالات" },
  { value: "draft", label: "مسودة" },
  { value: "data_completed", label: "اكتملت البيانات" },
  { value: "ai_generated", label: "تم التحليل" },
  { value: "preview_ready", label: "جاهز للمراجعة" },
  { value: "final_issued", label: "صدر التقرير" },
  { value: "locked", label: "مقفل" },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
  data_completed: { label: "اكتملت البيانات", color: "bg-blue-100 text-blue-700" },
  ai_generated: { label: "تم التحليل", color: "bg-purple-100 text-purple-700" },
  preview_ready: { label: "جاهز للمراجعة", color: "bg-orange-100 text-orange-700" },
  final_issued: { label: "صدر التقرير", color: "bg-green-100 text-green-700" },
  locked: { label: "مقفل", color: "bg-gray-200 text-gray-600" },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "bg-gray-100 text-gray-700" }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default function AdminProjectsPage() {
  const [data, setData] = useState<ProjectsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/admin/projects?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل المشاريع")
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleToggleLock = async (project: AdminProject) => {
    const newStatus = project.status === "locked" ? "final_issued" : "locked"
    const actionLabel = project.status === "locked" ? "فتح" : "قفل"
    const name = project.nameAr ?? project.nameEn ?? "هذا المشروع"
    if (!confirm(`هل تريد ${actionLabel} "${name}"؟`)) return

    setTogglingId(project.id)
    try {
      const res = await fetch(`/api/admin/projects?projectId=${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? "فشل تحديث الحالة")
      }
      await fetchProjects()
    } catch (e) {
      alert(e instanceof Error ? e.message : "خطأ في التحديث")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المشاريع</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.total.toLocaleString("ar-SA")} مشروع` : "جارٍ التحميل..."}
          </p>
        </div>
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 w-full sm:w-52"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data || data.projects.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📁</p>
            <p>لا توجد مشاريع</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المنشأة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المستخدم</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الاكتمال</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">نتيجة الجاهزية</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {project.nameAr ?? project.nameEn ?? "بدون اسم"}
                      </div>
                      {project.activityType && (
                        <div className="text-xs text-gray-400">{project.activityType}</div>
                      )}
                      {project.city && (
                        <div className="text-xs text-gray-400">{project.city}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{project.userName}</div>
                      <div className="text-xs text-gray-400">{project.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-[#1a5c3a] h-1.5 rounded-full"
                            style={{ width: `${project.dataCompletion}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{project.dataCompletion}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {project.readinessScore != null ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold text-base ${
                              project.readinessScore >= 70
                                ? "text-green-600"
                                : project.readinessScore >= 40
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {project.readinessScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(project.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Toggle lock */}
                        <button
                          onClick={() => handleToggleLock(project)}
                          disabled={togglingId === project.id}
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
                            project.status === "locked"
                              ? "text-green-700 border-green-200 hover:border-green-400"
                              : "text-orange-700 border-orange-200 hover:border-orange-400"
                          }`}
                        >
                          {togglingId === project.id
                            ? "..."
                            : project.status === "locked"
                            ? "🔓 فتح"
                            : "🔒 قفل"}
                        </button>
                        {/* Download report */}
                        {project.reportUrl ? (
                          <a
                            href={project.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            📥 التقرير
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300 px-2.5 py-1">لا تقرير</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            السابق
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages || loading}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  )
}
