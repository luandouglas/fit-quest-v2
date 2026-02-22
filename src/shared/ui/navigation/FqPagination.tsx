import type { HTMLAttributes } from 'react'

import { FqIconButton } from '@/shared/ui/primitives/FqIconButton'
import { cx } from '@/shared/utils'
import { clamp } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

type FqPaginationProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> & {
    currentPage: number
    totalPages: number
    onPageChange?: (page: number) => void
  }

export function FqPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  
  testId,
  ...rest
}: FqPaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1)
  const safeCurrentPage = clamp(currentPage, 1, safeTotalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cx('inline-flex items-center gap-3', className)}
     
      data-testid={testId}
      {...rest}
    >
      <FqIconButton
        icon="chevronLeft"
        label="Previous page"
        onClick={() => onPageChange?.(clamp(safeCurrentPage - 1, 1, safeTotalPages))}
        isDisabled={safeCurrentPage <= 1}
      />
      <span className="text-sm text-zinc-600">
        Página {safeCurrentPage} de {safeTotalPages}
      </span>
      <FqIconButton
        icon="chevronRight"
        label="Next page"
        onClick={() => onPageChange?.(clamp(safeCurrentPage + 1, 1, safeTotalPages))}
        isDisabled={safeCurrentPage >= safeTotalPages}
      />
    </nav>
  )
}
