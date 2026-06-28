"use client"

import { useEffect, useState, useCallback } from "react"

interface AdminUser {
  id: string
  name: string
  email: string
  mobile: string | null
  role: string
  credits: number
  projectsCount: number
  createdAt: string
  deletedAt: string | null
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page: number
  totalPages: number
}

function GrantCreditModal({
  user,
  onClose,
  onSuccess,
}: {
  user: AdminUser
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGrant = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/credits/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "فشل منح الرصيد")
      onSuccess()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">منح رصيد</h3>
        <p className="text-sm text-gray-600 mb-1">
          المستخدم: <span className="font-semibold">{user.name}</span>
        </p>
        <p className="text-sm text-gray-600 mb-4">
          الرصيد الحالي: <span className="font-semibold text-[#1a5c3a]">{user.credits}</span>
        </p>
        <p className="text-sm text-gray-700 mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3">
          سيتم إضافة رصيد مشروع واحد لهذا المستخدم بدون مدفوعات.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleGrant}
            disabled={loading}
            className="flex-1 bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "جارٍ المنح..." : "منح رصيد"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [grantUser, setGrantUser] = useState<AdminUser | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل المستخدمين")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return
    setDeletingId(userId)
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? "فشل الحذف")
      }
      await fetchUsers()
    } catch (e) {
      alert(e instanceof Error ? e.message : "خطأ في الحذف")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المستخدمون</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.total.toLocaleString("ar-SA")} مستخدم مسجل` : "جارٍ التحميل..."}
          </p>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-white"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data || data.users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p>لا يوجد مستخدمون</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المستخدم</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الجوال</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الرصيد</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المشاريع</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الصلاحية</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">تاريخ التسجيل</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50/50 transition-colors ${user.deletedAt ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dir-ltr text-left">
                      {user.mobile ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e8f5ee] text-[#1a5c3a] font-bold text-sm">
                        {user.credits}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{user.projectsCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role === "ADMIN" ? "مدير" : "مستخدم"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGrantUser(user)}
                          className="text-xs font-medium text-[#1a5c3a] hover:text-[#0f3d26] border border-[#1a5c3a]/30 hover:border-[#1a5c3a] px-2.5 py-1 rounded-lg transition-colors"
                        >
                          منح رصيد
                        </button>
                        {!user.deletedAt && user.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deletingId === user.id}
                            className="text-xs font-medium text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingId === user.id ? "..." : "حذف"}
                          </button>
                        )}
                        {user.deletedAt && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">محذوف</span>
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

      {/* Grant Credit Modal */}
      {grantUser && (
        <GrantCreditModal
          user={grantUser}
          onClose={() => setGrantUser(null)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  )
}
