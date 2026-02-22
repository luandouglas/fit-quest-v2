import type { ReactNode } from 'react'

import * as Tabs from '@radix-ui/react-tabs'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

export type FqTabDefinition = {
  value: string
  label: string
  content: ReactNode
}

type FqTabsProps = FqBaseProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  items?: FqTabDefinition[]
  children?: ReactNode
}

type FqTabItemProps = FqBaseProps & {
  value: string
  children: ReactNode
}

export function FqTabItem({ value, className, testId, children }: FqTabItemProps) {
  return (
    <Tabs.Trigger
      value={value}
      className={cx(
        'rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
        'data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm',
        className,
      )}
     
      data-testid={testId}
    >
      {children}
    </Tabs.Trigger>
  )
}

export function FqTabs({
  value,
  defaultValue,
  onValueChange,
  items,
  className,
  
  testId,
  children,
}: FqTabsProps) {
  const fallbackValue = items?.[0]?.value

  return (
    <Tabs.Root
      value={value}
      defaultValue={defaultValue ?? fallbackValue}
      onValueChange={onValueChange}
      className={cx('w-full', className)}
     
      data-testid={testId}
    >
      <Tabs.List className="inline-flex rounded-xl bg-zinc-100 p-1">
        {items?.map((item) => (
          <FqTabItem key={item.value} value={item.value}>
            {item.label}
          </FqTabItem>
        ))}
        {children}
      </Tabs.List>

      {items?.map((item) => (
        <Tabs.Content
          key={item.value}
          value={item.value}
          className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 focus-visible:outline-none"
        >
          {item.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
