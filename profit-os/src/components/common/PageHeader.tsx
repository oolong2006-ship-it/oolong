import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  titleAr?: string
  subtitle?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  titleAr,
  subtitle,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon size={20} className="text-blue-600" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {titleAr ?? title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
