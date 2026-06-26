import { cn } from '@/lib/utils'
import type { Recommendation } from '@/types'
import { Lightbulb, ArrowRight, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RecommendationCardProps {
  recommendation: Recommendation
  onAccept?: (id: string) => void
  onDismiss?: (id: string) => void
}

const priorityColors = {
  high: 'border-orange-200 bg-orange-50',
  medium: 'border-blue-200 bg-blue-50',
  low: 'border-slate-200 bg-slate-50',
}

export function RecommendationCard({
  recommendation,
  onAccept,
  onDismiss,
}: RecommendationCardProps) {
  const priority = recommendation.priority >= 8 ? 'high' : recommendation.priority >= 5 ? 'medium' : 'low'

  return (
    <div className={cn('rounded-lg border p-4', priorityColors[priority])}>
      <div className="flex items-start gap-3">
        <Lightbulb size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {recommendation.titleAr ?? recommendation.title}
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {recommendation.descriptionAr ?? recommendation.description}
          </p>

          {recommendation.estimatedImpact !== null && recommendation.estimatedImpact !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <DollarSign size={13} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">
                الأثر المتوقع:{' '}
                {recommendation.impactUnit === 'SAR'
                  ? formatCurrency(recommendation.estimatedImpact)
                  : `${recommendation.estimatedImpact.toFixed(1)} ${recommendation.impactUnit ?? ''}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            {onAccept && (
              <button
                onClick={() => onAccept(recommendation.id)}
                className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRight size={12} />
                قبول
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(recommendation.id)}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                تجاهل
              </button>
            )}
            <span className="text-xs text-slate-400 mr-auto">
              أولوية: {recommendation.priority}/10
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
