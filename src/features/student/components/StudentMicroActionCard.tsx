import type { ReactNode } from 'react'

import { FqButton, FqCard, FqProgressBar, FqTag, FqText, type FqTone, type IconName } from '@/shared/ui'

export type StudentMicroActionPreset = {
  id: string
  label: string
  icon: IconName
  onClick: () => void
  tone?: FqTone
  isDisabled?: boolean
}

type StudentMicroActionCardProps = {
  eyebrow: string
  title: string
  description: string
  statusLabel: string
  statusTone: FqTone
  progressPct: number
  summaryLabel: string
  rewardLabel: string
  presets: StudentMicroActionPreset[]
  customSlot?: ReactNode
  footer?: ReactNode
  className?: string
}

export function StudentMicroActionCard({
  eyebrow,
  title,
  description,
  statusLabel,
  statusTone,
  progressPct,
  summaryLabel,
  rewardLabel,
  presets,
  customSlot,
  footer,
  className,
}: StudentMicroActionCardProps) {
  return (
    <FqCard className={className ?? 'border-border bg-card'}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <FqText as="p" className="fq-subtle-label">
              {eyebrow}
            </FqText>
            <FqText as="h2" className="mt-2 text-sm font-semibold text-foreground">
              {title}
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              {description}
            </FqText>
          </div>
          <FqTag tone={statusTone}>{statusLabel}</FqTag>
        </div>

        <div className="space-y-2 rounded-xl border border-border/70 bg-background/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Progresso atual
            </FqText>
            <FqText as="p" className="text-xs text-muted-foreground">
              {summaryLabel}
            </FqText>
          </div>
          <FqProgressBar value={progressPct} tone={statusTone === 'success' ? 'success' : 'secondary'} />
          <FqText as="p" className="text-xs text-muted-foreground">
            {rewardLabel}
          </FqText>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {presets.map((preset) => (
            <FqButton
              key={preset.id}
              leftIcon={preset.icon}
              tone={preset.tone ?? 'secondary'}
              variant="outline"
              className="min-h-14"
              onClick={preset.onClick}
              isDisabled={preset.isDisabled}
            >
              {preset.label}
            </FqButton>
          ))}
        </div>

        {customSlot}
        {footer}
      </div>
    </FqCard>
  )
}
