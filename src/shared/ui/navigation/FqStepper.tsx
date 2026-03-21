import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqStepItem = {
  id: string
  title: string
  description?: string
  icon?: IconName
}

type FqStepperProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLOListElement>, 'style' | 'className'> & {
    steps: readonly FqStepItem[]
    activeStep: number
  }

function resolveStepState(index: number, activeStep: number) {
  if (index < activeStep) {
    return 'done'
  }

  if (index === activeStep) {
    return 'active'
  }

  return 'upcoming'
}

export function FqStepper({ steps, activeStep, className, testId, ...rest }: FqStepperProps) {
  return (
    <ol
      className={cx('grid gap-2 sm:grid-cols-3', className)}
      data-testid={testId}
      {...rest}
    >
      {steps.map((step, index) => {
        const state = resolveStepState(index, activeStep)

        return (
          <li
            key={step.id}
            className={cx(
              'rounded-lg border p-3 transition-colors',
              state === 'done' && 'border-success/40 bg-success/10',
              state === 'active' && 'border-primary/40 bg-primary/10',
              state === 'upcoming' && 'border-border bg-card',
            )}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  state === 'done' && 'bg-success text-success-foreground',
                  state === 'active' && 'bg-primary text-primary-foreground',
                  state === 'upcoming' && 'bg-muted text-muted-foreground',
                )}
              >
                {state === 'done' ? <FqIcon name="check" size={14} /> : index + 1}
              </span>
              {step.icon ? <FqIcon name={step.icon} size={16} className="text-muted-foreground" /> : null}
              <span className="text-sm font-semibold text-foreground">{step.title}</span>
            </div>
            {step.description ? <p className="mt-2 text-xs text-muted-foreground">{step.description}</p> : null}
          </li>
        )
      })}
    </ol>
  )
}
