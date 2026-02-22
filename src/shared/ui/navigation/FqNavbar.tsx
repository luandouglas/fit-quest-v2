import type { HTMLAttributes } from 'react'

import { FqButton } from '@/shared/ui/primitives/FqButton'
import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqNavbarItem = {
  label: string
  active?: boolean
  onClick?: () => void
}

type FqNavbarProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> & {
    title?: string
    items?: FqNavbarItem[]
    onMenuClick?: () => void
  }

export function FqNavbar({
  title = 'FitQuest',
  items = [],
  onMenuClick,
  className,
  
  testId,
  ...rest
}: FqNavbarProps) {
  return (
    <nav
      className={cx(
        'flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3',
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-center gap-2">
        <FqButton
          variant="ghost"
          size="sm"
          tone="neutral"
          leftIcon="menu"
          aria-label="Abrir menu"
          onClick={onMenuClick}
        >
          Menu
        </FqButton>
        <span className="text-base font-semibold text-zinc-900">{title}</span>
      </div>
      <div className="hidden items-center gap-1 sm:flex">
        {items.map((item) => (
          <FqButton
            key={item.label}
            variant={item.active ? 'solid' : 'ghost'}
            tone={item.active ? 'primary' : 'neutral'}
            size="sm"
            onClick={item.onClick}
          >
            {item.label}
          </FqButton>
        ))}
      </div>
    </nav>
  )
}
