'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  TrendingUp,
  Truck,
  ShoppingCart,
  Users,
  Package,
  ChefHat,
  UtensilsCrossed,
  Building2,
  Trash2,
  Star,
  FileText,
  Lightbulb,
  Upload,
  Settings,
  ClipboardList,
  BarChart3,
} from 'lucide-react'

const navItems = [
  {
    label: 'لوحة التحكم',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'المبيعات',
    href: '/sales',
    icon: TrendingUp,
  },
  {
    label: 'منصات التوصيل',
    href: '/delivery',
    icon: Truck,
  },
  {
    label: 'المشتريات',
    href: '/procurement',
    icon: ShoppingCart,
  },
  {
    label: 'الموردون',
    href: '/suppliers',
    icon: Users,
  },
  {
    label: 'المخزون',
    href: '/inventory',
    icon: Package,
  },
  {
    label: 'الوصفات',
    href: '/recipes',
    icon: ChefHat,
  },
  {
    label: 'القائمة',
    href: '/menu',
    icon: UtensilsCrossed,
  },
  {
    label: 'الفروع',
    href: '/branches',
    icon: Building2,
  },
  {
    label: 'الهدر',
    href: '/waste',
    icon: Trash2,
  },
  {
    label: 'الجودة',
    href: '/quality',
    icon: Star,
  },
  {
    label: 'التقارير',
    href: '/reports',
    icon: BarChart3,
  },
  {
    label: 'التوصيات الذكية',
    href: '/ai-insights',
    icon: Lightbulb,
  },
  {
    label: 'استيراد البيانات',
    href: '/import',
    icon: Upload,
  },
  {
    label: 'الإعدادات',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'سجل التدقيق',
    href: '/audit-logs',
    icon: ClipboardList,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Restaurant Profit OS</p>
            <p className="text-xs text-slate-400">نظام الربحية</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        v1.0.0 — Restaurant Profit OS
      </div>
    </aside>
  )
}
