import { NavLink } from 'react-router-dom'

import { FqIcon, FqText } from '@/shared/ui'
import { cx } from '@/shared'

import { studentPrimaryNavigationItems } from '../navigation'

type StudentSectionRailProps = {
  activePath: string
}

export function StudentSectionRail({ activePath }: StudentSectionRailProps) {
  return (
    <nav
      aria-label="Seções do aluno"
      className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
    >
      {studentPrimaryNavigationItems.map((item) => {
        const isActive = item.matches(activePath)

        return (
          <NavLink
            key={item.key}
            to={item.path}
            exact={item.exact}
            className={cx(
              'fq-raise-hover min-w-[130px] rounded-[26px] border px-4 py-3 transition',
              isActive
                ? 'border-primary/20 bg-primary/10 text-foreground shadow-[0_12px_24px_rgba(95,141,118,0.12)]'
                : 'border-border/75 bg-card/75 text-muted-foreground',
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  'inline-flex h-10 w-10 items-center justify-center rounded-2xl',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-background/80 text-foreground',
                )}
              >
                <FqIcon name={item.icon} size={18} />
              </span>
              <span className="min-w-0">
                <FqText as="span" className="block text-sm font-semibold text-current">
                  {item.label}
                </FqText>
                <FqText as="span" className="hidden text-xs text-muted-foreground lg:block">
                  {item.description}
                </FqText>
              </span>
            </div>
          </NavLink>
        )
      })}
    </nav>
  )
}
