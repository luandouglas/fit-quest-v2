import { FqProgressBar } from '@/shared/ui'

type MacrosProgressProps = {
  label: string
  consumed: number
  goal: number
  unit: string
}

export function MacrosProgress({ label, consumed, goal, unit }: MacrosProgressProps) {
  const percentage = goal > 0 ? Math.round((consumed / goal) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          {consumed}{unit} / {goal}{unit}
        </p>
      </div>
      <FqProgressBar value={percentage} tone="secondary" showLabel={false} />
    </div>
  )
}
