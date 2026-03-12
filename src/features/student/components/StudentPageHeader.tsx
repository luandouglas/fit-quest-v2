import type { ReactNode } from 'react'

import { FqTag, FqText } from '@/shared/ui'
import type { FqTone, IconName } from '@/shared/ui'
import { cx } from '@/shared/utils'

type StudentPageHeaderTag = {
  id: string
  label: string
  tone?: FqTone
  icon?: IconName
}

type StudentPageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  tags?: StudentPageHeaderTag[]
  actions?: ReactNode
  className?: string
}

export function StudentPageHeader({
  eyebrow = 'Ecossistema do aluno',
  title,
  description,
  tags = [],
  actions,
  className,
}: StudentPageHeaderProps) {
  return (
    <header className={cx('fq-page-header space-y-3', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <FqText as="p" className="fq-subtle-label">
            {eyebrow}
          </FqText>
          <FqText as="h1" variant="title" className="text-lg md:text-xl">
            {title}
          </FqText>
          <FqText as="p" className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </FqText>
        </div>

        {actions ? <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <FqTag key={tag.id} tone={tag.tone ?? 'neutral'} leftIcon={tag.icon}>
              {tag.label}
            </FqTag>
          ))}
        </div>
      ) : null}
    </header>
  )
}
