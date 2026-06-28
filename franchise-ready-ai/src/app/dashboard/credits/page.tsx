"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface CreditHistoryItem {
  id: string;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
  payment?: {
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  } | null;
}

interface CreditsData {
  credits: number;
  history: CreditHistoryItem[];
}

export default function CreditsPage() {
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/credits")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("فشل تحميل بيانات الرصيد"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">رصيدي</h1>

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
            {/* Balance card */}
            <div className="bg-gradient-to-br from-[#1a5c3a] to-[#2d7a52] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">رصيدك الحالي</p>
                  <p className="mt-1 text-5xl font-bold">{data.credits}</p>
                  <p className="mt-1 text-white/60 text-sm">
                    {data.credits === 0
                      ? "لا يوجد رصيد متاح"
                      : data.credits === 1
                      ? "مشروع متاح"
                      : `مشروع متاح`}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl">
                  💳
                </div>
              </div>
              <div className="mt-5">
                <Link
                  href="/payment"
                  className="inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#d9be7a] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  <span>➕</span>
                  اشترِ رصيدًا جديدًا
                </Link>
              </div>
            </div>

            {/* How credits work */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">كيف يعمل نظام الرصيد؟</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: "🛒",
                    title: "اشترِ رصيدًا",
                    desc: "كل وحدة رصيد تمنحك تقريراً كاملاً لمنشأة واحدة",
                  },
                  {
                    icon: "📋",
                    title: "أنشئ مشروعًا",
                    desc: "يُستخدم الرصيد عند إنشاء منشأة جديدة وبدء التقييم",
                  },
                  {
                    icon: "📄",
                    title: "احصل على تقريرك",
                    desc: "تقرير PDF شامل يقيّم جاهزيتك للامتياز التجاري",
                  },
                ].map((step) => (
                  <div key={step.title} className="bg-[#f8faf9] rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit history */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">سجل الرصيد</h2>
              </div>

              {data.history.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">
                  لا يوجد سجل بعد
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f8faf9] border-b border-gray-100">
                          <th className="text-right px-5 py-3 font-semibold text-gray-600">التاريخ</th>
                          <th className="text-right px-5 py-3 font-semibold text-gray-600">المبلغ</th>
                          <th className="text-right px-5 py-3 font-semibold text-gray-600">الحالة</th>
                          <th className="text-right px-5 py-3 font-semibold text-gray-600">تاريخ الاستخدام</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.history.map((item) => (
                          <tr key={item.id} className="hover:bg-[#f8faf9] transition-colors">
                            <td className="px-5 py-3.5 text-gray-700">
                              {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="px-5 py-3.5 text-gray-700">
                              {item.payment
                                ? `${item.payment.amount} ${item.payment.currency}`
                                : "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.used
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {item.used ? "مستخدم" : "متاح"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-500">
                              {item.usedAt
                                ? new Date(item.usedAt).toLocaleDateString("ar-SA")
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile list */}
                  <ul className="sm:hidden divide-y divide-gray-50">
                    {data.history.map((item) => (
                      <li key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                          {item.payment && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.payment.amount} {item.payment.currency}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.used
                              ? "bg-gray-100 text-gray-600"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.used ? "مستخدم" : "متاح"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
