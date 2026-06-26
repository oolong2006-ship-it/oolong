import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositiveGood?: boolean
  }
  icon?: LucideIcon
  iconColor?: string
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-blue-600',
  className,
  variant = 'default',
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
  }

  const trendIsPositive = trend && trend.value > 0
  const isGoodTrend = trend ? (trend.isPositiveGood !== false ? trendIsPositive : !trendIsPositive) : null

  return (
    <div className={cn('rounded-xl border p-5 shadow-sm', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 number-display">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg bg-slate-100', iconColor)}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          {trendIsPositive ? (
            <TrendingUp size={14} className={isGoodTrend ? 'text-green-600' : 'text-red-600'} />
          ) : trend.value < 0 ? (
            <TrendingDown size={14} className={isGoodTrend ? 'text-green-600' : 'text-red-600'} />
          ) : (
            <Minus size={14} className="text-slate-400" />
          )}
          <span className={cn(
            'text-xs font-medium',
            isGoodTrend === true ? 'text-green-600' :
            isGoodTrend === false ? 'text-red-600' :
            'text-slate-500'
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
