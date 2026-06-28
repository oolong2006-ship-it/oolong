"use client"

import { useEffect, useState, useCallback } from "react"

interface AdminPayment {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  totalAmount: number
  status: string
  provider: string | null
  providerRef: string | null
  description: string | null
  creditGranted: boolean
  createdAt: string
}

interface PaymentsResponse {
  payments: AdminPayment[]
  total: number
  page: number
  totalPages: number
}

const statusOptions = [
  { value: "", label: "جميع الحالات" },
  { value: "pending", label: "معلق" },
  { value: "completed", label: "مكتمل" },
  { value: "failed", label: "فشل" },
  { value: "refunded", label: "مُسترد" },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700" },
  failed: { label: "فشل", color: "bg-red-100 text-red-700" },
  refunded: { label: "مُسترد", color: "bg-gray-100 text-gray-600" },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: "bg-gray-100 text-gray-600" }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

interface GrantCreditForPaymentModalProps {
  payment: AdminPayment
  onClose: () => void
  onSuccess: () => void
}

function GrantCreditForPaymentModal({ payment, onClose, onSuccess }: GrantCreditForPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGrant = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/credits/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: payment.userId }),
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
        <h3 className="text-lg font-bold text-gray-900 mb-3">منح رصيد يدوياً</h3>
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p>المستخدم: <span className="font-semibold">{payment.userName}</span></p>
          <p>المبلغ: <span className="font-semibold">{payment.totalAmount} {payment.currency}</span></p>
          <p>المرجع: <span className="font-mono text-xs">{payment.id}</span></p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-5">
          سيتم منح رصيد مشروع واحد لهذا المستخدم بصرف النظر عن هذه الدفعة.
        </div>
        {error && <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleGrant}
            disabled={loading}
            className="flex-1 bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "جارٍ المنح..." : "تأكيد المنح"}
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

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [grantPayment, setGrantPayment] = useState<AdminPayment | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/admin/payments?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل المدفوعات")
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.total.toLocaleString("ar-SA")} معاملة` : "جارٍ التحميل..."}
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
        ) : !data || data.payments.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">💳</p>
            <p>لا توجد مدفوعات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المعرف</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المستخدم</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">المبلغ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">مزود الدفع</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الرصيد</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500">
                        {payment.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-xs text-gray-400">{payment.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {payment.totalAmount.toLocaleString("ar-SA")} {payment.currency}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.provider ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {payment.creditGranted ? (
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                          مُمنوح
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      {!payment.creditGranted && (
                        <button
                          onClick={() => setGrantPayment(payment)}
                          className="text-xs font-medium text-[#1a5c3a] hover:text-[#0f3d26] border border-[#1a5c3a]/30 hover:border-[#1a5c3a] px-2.5 py-1 rounded-lg transition-colors"
                        >
                          منح رصيد
                        </button>
                      )}
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
      {grantPayment && (
        <GrantCreditForPaymentModal
          payment={grantPayment}
          onClose={() => setGrantPayment(null)}
          onSuccess={fetchPayments}
        />
      )}
    </div>
  )
}
