"use client"

import { useEffect, useState } from "react"

interface AdminStats {
  totalUsers: number
  paymentsToday: number
  paymentsCountToday: number
  totalRevenue: number
  reportsIssued: number
  conversionRate: number
  recentPayments: RecentPayment[]
  recentProjects: RecentProject[]
  systemHealth: SystemHealth
}

interface RecentPayment {
  id: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  status: string
  provider: string | null
  createdAt: string
}

interface RecentProject {
  id: string
  nameAr: string | null
  nameEn: string | null
  userName: string
  status: string
  readinessScore: number | null
  createdAt: string
}

interface SystemHealth {
  db: "ok" | "error"
  uptime: number
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700" },
  failed: { label: "فشل", color: "bg-red-100 text-red-700" },
  refunded: { label: "مُسترد", color: "bg-gray-100 text-gray-600" },
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setStats(data)
      })
      .catch((e) => setError(e.message || "فشل تحميل الإحصائيات"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-red-700">
          <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">جارٍ تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">خطأ: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
        <p className="mt-1 text-sm text-gray-500">
          نظرة عامة على أداء المنصة
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          icon="👥"
          label="إجمالي المستخدمين"
          value={stats.totalUsers.toLocaleString("ar-SA")}
          color="text-red-700"
        />
        <KpiCard
          icon="💳"
          label="مدفوعات اليوم"
          value={`${stats.paymentsToday.toLocaleString("ar-SA")} ر.س`}
          sub={`${stats.paymentsCountToday} معاملة`}
          color="text-green-700"
        />
        <KpiCard
          icon="💰"
          label="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString("ar-SA")} ر.س`}
          color="text-[#1a5c3a]"
        />
        <KpiCard
          icon="📄"
          label="التقارير المصدرة"
          value={stats.reportsIssued.toLocaleString("ar-SA")}
          color="text-purple-700"
        />
        <KpiCard
          icon="📈"
          label="معدل التحويل"
          value={`${stats.conversionRate.toFixed(1)}%`}
          sub="نسبة دفع ← تقرير"
          color="text-blue-700"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">أحدث المدفوعات</h2>
            <a href="/admin/payments" className="text-sm text-red-700 hover:underline font-medium">
              عرض الكل
            </a>
          </div>
          {stats.recentPayments.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">لا توجد مدفوعات بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">المستخدم</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">المبلغ</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">الحالة</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-[140px]">{p.userName}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[140px]">{p.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {p.amount.toLocaleString("ar-SA")} {p.currency}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">أحدث المشاريع</h2>
            <a href="/admin/projects" className="text-sm text-red-700 hover:underline font-medium">
              عرض الكل
            </a>
          </div>
          {stats.recentProjects.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">لا توجد مشاريع بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">المنشأة</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">المستخدم</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">الحالة</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-500">النتيجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-[140px]">
                          {p.nameAr ?? p.nameEn ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">{p.userName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        {p.readinessScore != null ? (
                          <span className="font-semibold text-[#1a5c3a]">{p.readinessScore}%</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">حالة النظام</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                stats.systemHealth.db === "ok" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-700">
              قاعدة البيانات:{" "}
              <span className={stats.systemHealth.db === "ok" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {stats.systemHealth.db === "ok" ? "تعمل بشكل طبيعي" : "خطأ"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-700">
              وقت التشغيل:{" "}
              <span className="text-green-600 font-medium">
                {Math.floor(stats.systemHealth.uptime / 3600)} ساعة
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
