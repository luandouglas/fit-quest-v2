import { FqButton, FqCard, FqProgressBar } from '@/shared/ui'

import type { NutritionDay } from '../types'

type WaterCardProps = {
  day: NutritionDay
  isOffline: boolean
  onQuickAdd: (ml: number) => void
  onOpenEditor: () => void
}

const quickOptions = [200, 300, 500]

export function WaterCard({ day, isOffline, onQuickAdd, onOpenEditor }: WaterCardProps) {
  const percentage = day.goals.waterMl > 0 ? Math.round((day.consumed.waterMl / day.goals.waterMl) * 100) : 0
  const remaining = Math.max(day.goals.waterMl - day.consumed.waterMl, 0)

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-foreground">Agua</p>
            <p className="text-sm text-muted-foreground">{day.consumed.waterMl} / {day.goals.waterMl} ml</p>
          </div>
          <FqButton
            size="md"
            variant="outline"
            tone="secondary"
            onClick={onOpenEditor}
            className="min-h-11"
            isDisabled={isOffline}
          >
            Editar
          </FqButton>
        </div>

        <FqProgressBar value={percentage} tone="secondary" showLabel={false} />

        <div className="grid grid-cols-3 gap-2">
          {quickOptions.map((amount) => (
            <FqButton
              key={amount}
              size="md"
              variant="outline"
              tone="primary"
              onClick={() => onQuickAdd(amount)}
              className="min-h-11"
              isDisabled={isOffline}
            >
              +{amount} ml
            </FqButton>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {remaining > 0 ? `Faltam ${remaining} ml para bater a meta.` : 'Meta de agua concluida hoje.'}
        </p>
      </div>
    </FqCard>
  )
}
