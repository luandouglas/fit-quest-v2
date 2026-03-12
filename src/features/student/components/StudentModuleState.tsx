import { FqAlert, FqButton, FqCard, FqEmptyState, FqSkeleton, FqText } from '@/shared/ui'
import type { FqTone, IconName } from '@/shared/ui'
import { cx } from '@/shared/utils'

type StudentModuleStateProps = {
  state: 'loading' | 'error' | 'empty'
  title: string
  description: string
  icon?: IconName
  tone?: FqTone
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  shellClassName?: string
}

export function StudentModuleState({
  state,
  title,
  description,
  icon = 'info',
  tone = 'primary',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  shellClassName,
}: StudentModuleStateProps) {
  if (state === 'loading') {
    return (
      <section className={cx('fq-page-shell-medium', shellClassName)}>
        <FqCard className="fq-fitness-glow border-border bg-card">
          <div className="space-y-5">
            <div className="space-y-2">
              <FqText as="p" className="fq-subtle-label">
                Aguarde um instante
              </FqText>
              <FqText as="h1" className="text-lg font-semibold text-foreground">
                {title}
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                {description}
              </FqText>
            </div>

            <div className="space-y-3">
              <FqSkeleton className="h-12 w-full rounded-[calc(var(--radius)+4px)]" rounded="lg" />
              <div className="grid gap-3 sm:grid-cols-2">
                <FqSkeleton className="h-28 w-full rounded-[calc(var(--radius)+4px)]" rounded="lg" />
                <FqSkeleton className="h-28 w-full rounded-[calc(var(--radius)+4px)]" rounded="lg" />
              </div>
            </div>
          </div>
        </FqCard>
      </section>
    )
  }

  if (state === 'error') {
    return (
      <section className={cx('fq-page-shell-medium space-y-4', shellClassName)}>
        <FqAlert tone={tone} title={title}>
          {description}
        </FqAlert>
        <div className="flex flex-wrap gap-2">
          {actionLabel && onAction ? (
            <FqButton variant="outline" tone="neutral" onClick={onAction}>
              {actionLabel}
            </FqButton>
          ) : null}
          {secondaryActionLabel && onSecondaryAction ? (
            <FqButton variant="ghost" tone="neutral" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </FqButton>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section className={cx('fq-page-shell-medium', shellClassName)}>
      <div className="rounded-[calc(var(--radius)+10px)] border border-dashed border-border/75 bg-card/78 px-4 py-8 shadow-[0_18px_40px_rgba(36,49,44,0.05)]">
        <FqEmptyState icon={icon} title={title} description={description} />
        {actionLabel && onAction ? (
          <div className="mt-5 flex justify-center">
            <FqButton onClick={onAction}>{actionLabel}</FqButton>
          </div>
        ) : null}
      </div>
    </section>
  )
}
