import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqTextVariant = 'title' | 'subtitle' | 'body' | 'caption'

type FqTextProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> & {
    variant?: FqTextVariant
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'label'
  }

const variantClassMap: Record<FqTextVariant, string> = {
  title: 'text-2xl font-semibold tracking-tight text-zinc-900',
  subtitle: 'text-lg font-medium text-zinc-700',
  body: 'text-sm text-zinc-700',
  caption: 'text-xs text-zinc-500',
}

const variantTagMap: Record<FqTextVariant, FqTextProps['as']> = {
  title: 'h2',
  subtitle: 'h3',
  body: 'p',
  caption: 'span',
}

export function FqText({
  variant = 'body',
  as,
  className,
  
  testId,
  children,
  ...rest
}: FqTextProps) {
  const Tag = as ?? variantTagMap[variant] ?? 'p'

  return (
    <Tag
      className={cx(variantClassMap[variant], className)}
     
      data-testid={testId}
      {...rest}
    >
      {children}
    </Tag>
  )
}
