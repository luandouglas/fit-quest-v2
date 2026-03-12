import { FqProgressBar } from '@/shared/ui'
import type { FqTone } from '@/shared/ui'

type MacrosProgressProps = {
  label: string
  consumed: number
  target: number
  tone?: FqTone
  unit?: string
}

export function MacrosProgress({ label, consumed, target, tone = 'primary', unit = 'g' }: MacrosProgressProps) {
  const safeTarget = Math.max(target, 1)
  const progress = Math.round((consumed / safeTarget) * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {consumed}/{target} {unit}
        </p>
      </div>
      <FqProgressBar value={progress} tone={tone} showLabel={false} />
    </div>
  )
}
