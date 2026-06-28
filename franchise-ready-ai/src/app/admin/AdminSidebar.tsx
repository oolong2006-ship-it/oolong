"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

const navLinks = [
  { icon: "📊", label: "الإحصائيات", href: "/admin" },
  { icon: "👥", label: "المستخدمون", href: "/admin/users" },
  { icon: "💳", label: "المدفوعات", href: "/admin/payments" },
  { icon: "📁", label: "المشاريع", href: "/admin/projects" },
  { icon: "⚙️", label: "الإعدادات", href: "/admin/settings" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch {
      router.push("/")
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <aside className="flex flex-col h-screen sticky top-0 bg-red-900 text-white w-64 min-w-[16rem] shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="text-lg font-bold leading-tight">Franchise Ready AI</div>
        <div className="text-xs text-white/60 mt-0.5">لوحة الإدارة</div>
      </div>

      {/* Admin badge */}
      <div className="px-6 py-3 border-b border-white/10 bg-red-800/40">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-200">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          صلاحيات المدير العام
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{link.icon}</span>
              <span>{link.label}</span>
              {active && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-red-300" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Back to dashboard + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-150"
        >
          <span className="text-base leading-none">🏠</span>
          <span>لوحة المستخدم</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-150 disabled:opacity-50"
        >
          <span className="text-base leading-none">🚪</span>
          <span>{loggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}</span>
        </button>
      </div>
    </aside>
  )
}
