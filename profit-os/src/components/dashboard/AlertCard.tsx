import { cn } from '@/lib/utils'
import type { AlertItem } from '@/types'
import { AlertTriangle, AlertCircle, Info, XCircle, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AlertCardProps {
  alert: AlertItem
  onMarkRead?: (id: string) => void
}

const severityConfig = {
  LOW: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'منخفض',
  },
  MEDIUM: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'متوسط',
  },
  HIGH: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    label: 'مرتفع',
  },
  CRITICAL: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'حرج',
  },
}

export function AlertCard({ alert, onMarkRead }: AlertCardProps) {
  const config = severityConfig[alert.severity as keyof typeof severityConfig] ?? severityConfig.MEDIUM
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        config.bg,
        config.border,
        !alert.isRead && 'ring-1 ring-inset',
        alert.severity === 'CRITICAL' && !alert.isRead ? 'ring-red-300' : ''
      )}
    >
      <Icon size={18} className={cn(config.color, 'shrink-0 mt-0.5')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-800 leading-snug">
            {alert.titleAr ?? alert.title}
          </p>
          <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium shrink-0', config.color, config.bg)}>
            {config.label}
          </span>
        </div>
        {(alert.descriptionAr ?? alert.description) && (
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {alert.descriptionAr ?? alert.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-400">{formatDate(alert.createdAt)}</p>
          {!alert.isRead && onMarkRead && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              <CheckCircle size={12} />
              تم القراءة
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
