'use client'

import { signOut } from 'next-auth/react'
import { useOrganization } from '@/hooks/useOrganization'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function Topbar() {
  const { organizationName, role } = useOrganization()
  const [menuOpen, setMenuOpen] = useState(false)

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'مشرف عام',
    OWNER: 'مالك',
    CEO: 'مدير تنفيذي',
    CFO: 'مدير مالي',
    PROCUREMENT_MANAGER: 'مدير مشتريات',
    OPERATIONS_MANAGER: 'مدير عمليات',
    WAREHOUSE_MANAGER: 'مدير مستودع',
    BRANCH_MANAGER: 'مدير فرع',
    QUALITY_MANAGER: 'مدير جودة',
    ACCOUNTANT: 'محاسب',
    AUDITOR: 'مدقق',
    VIEWER: 'مشاهد',
  }

  return (
    <header className="fixed top-0 left-0 right-64 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30">
      {/* Organization name */}
      <div>
        <h1 className="text-sm font-semibold text-slate-800">
          {organizationName ?? 'نظام الربحية'}
        </h1>
        <p className="text-xs text-slate-500">لوحة تحكم الربحية</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-700">
                {role ? roleLabels[role] ?? role : ''}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
