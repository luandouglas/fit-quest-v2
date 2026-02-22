import type { HTMLAttributes } from 'react'

import { FqIcon, type IconName } from '@/shared/ui/primitives/FqIcon'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqAchievementCardProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    title: string
    description?: string
    icon?: IconName
    unlocked?: boolean
  }

export function FqAchievementCard({
  title,
  description,
  icon = 'trophy',
  unlocked = false,
  className,
  
  testId,
  ...rest
}: FqAchievementCardProps) {
  return (
    <article
      className={cx(
        'rounded-xl border p-4 transition',
        unlocked ? 'border-amber-300 bg-amber-50' : 'border-zinc-200 bg-white',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-start gap-3">
        <span
          className={cx(
            'rounded-xl p-2',
            unlocked ? 'bg-amber-200 text-amber-800' : 'bg-zinc-100 text-zinc-500',
          )}
        >
          <FqIcon name={icon} size={18} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          {description ? <p className="text-xs text-zinc-600">{description}</p> : null}
          <p className="mt-2 text-xs font-medium text-zinc-500">
            {unlocked ? 'Conquista desbloqueada' : 'Conquista bloqueada'}
          </p>
        </div>
      </div>
    </article>
  )
}
