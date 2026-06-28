"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  userName: string;
  userEmail: string;
  onClose?: () => void;
}

const navLinks = [
  { icon: "🏠", label: "الرئيسية", href: "/dashboard" },
  { icon: "📁", label: "مشاريعي", href: "/dashboard/projects" },
  { icon: "💳", label: "رصيدي", href: "/dashboard/credits" },
  { icon: "👤", label: "حسابي", href: "/dashboard/profile" },
];

export default function Sidebar({ userName, userEmail, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex flex-col h-full bg-[#1a5c3a] text-white w-64 min-w-[16rem]">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <div className="text-lg font-bold leading-tight">Franchise Ready AI</div>
          <div className="text-xs text-white/60 mt-0.5">فرنشايز ريدي</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{userName}</div>
            <div className="text-xs text-white/60 truncate">{userEmail}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{link.icon}</span>
              <span>{link.label}</span>
              {active && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
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
  );
}
