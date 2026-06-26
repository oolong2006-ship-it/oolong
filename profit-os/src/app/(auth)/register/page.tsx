'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      organizationName: (form.elements.namedItem('organizationName') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json() as { error?: string }
        setError(body.error ?? 'حدث خطأ أثناء التسجيل')
        return
      }

      router.push('/login?registered=1')
    } catch {
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
          <span className="text-white text-xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">إنشاء حساب جديد</h1>
        <p className="text-slate-500 mt-1 text-sm">ابدأ مع نظام تشغيل الربحية</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">الاسم</label>
          <input
            name="name"
            type="text"
            required
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="اسمك الكامل"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم المطعم / المجموعة</label>
          <input
            name="organizationName"
            type="text"
            required
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مجموعة ذوق للمطاعم"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">البريد الإلكتروني</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@restaurant.com"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">كلمة المرور</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="8 أحرف على الأقل"
            dir="ltr"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  )
}
