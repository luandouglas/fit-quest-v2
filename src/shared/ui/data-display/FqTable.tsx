import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqTableColumn<TData extends Record<string, ReactNode>> = {
  key: keyof TData
  header: string
  align?: 'left' | 'center' | 'right'
}

type FqTableProps<TData extends Record<string, ReactNode>> = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> & {
    columns: Array<FqTableColumn<TData>>
    data: TData[]
    emptyLabel?: string
  }

const alignMap: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function FqTable<TData extends Record<string, ReactNode>>({
  columns,
  data,
  emptyLabel = 'Sem dados',
  className,
  
  testId,
  ...rest
}: FqTableProps<TData>) {
  return (
    <div
      className={cx('overflow-x-auto rounded-lg border border-zinc-200 bg-white', className)}
     
      data-testid={testId}
      {...rest}
    >
      <table className="min-w-full divide-y divide-zinc-200">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cx('px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500', alignMap[column.align ?? 'left'])}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.length ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-zinc-50">
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${String(column.key)}`}
                    className={cx('px-4 py-2 text-sm text-zinc-700', alignMap[column.align ?? 'left'])}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-zinc-500">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
