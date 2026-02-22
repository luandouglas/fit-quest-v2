import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqAvatarProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    src?: string
    alt?: string
    name?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }

const sizeMap: Record<NonNullable<FqAvatarProps['size']>, string> = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-9 w-9 text-sm',
  md: 'h-11 w-11 text-base',
  lg: 'h-14 w-14 text-lg',
}

function getInitials(name?: string) {
  if (!name) {
    return 'FQ'
  }

  return name
    .split(' ')
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase()
}

export function FqAvatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  
  testId,
  ...rest
}: FqAvatarProps) {
  return (
    <div
      className={cx(
        'inline-flex items-center justify-center overflow-hidden rounded-full bg-zinc-200 font-semibold text-zinc-700',
        sizeMap[size],
        className,
      )}
     
      data-testid={testId}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt ?? name ?? 'Avatar'} className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
