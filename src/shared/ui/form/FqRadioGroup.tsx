import type { HTMLAttributes } from 'react'

import { FqRadio } from '@/shared/ui/form/FqRadio'
import type { FqBaseProps } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

export type FqRadioOption = {
  label: string
  value: string
  description?: string
}

type FqRadioGroupProps = FqBaseProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className' | 'onChange'> & {
    name: string
    label?: string
    options: FqRadioOption[]
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    isDisabled?: boolean
  }

export function FqRadioGroup({
  name,
  label,
  options,
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  className,
  
  testId,
  ...rest
}: FqRadioGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('flex flex-col gap-2', className)}
     
      data-testid={testId}
      {...rest}
    >
      {label ? <span className="text-sm font-medium text-zinc-700">{label}</span> : null}
      {options.map((option) => (
        <FqRadio
          key={option.value}
          name={name}
          label={option.label}
          description={option.description}
          value={option.value}
          checked={value === undefined ? undefined : value === option.value}
          defaultChecked={
            defaultValue === undefined ? undefined : defaultValue === option.value
          }
          onChange={(event) => {
            if (event.target.checked) {
              onChange?.(event.target.value)
            }
          }}
          isDisabled={isDisabled}
        />
      ))}
    </div>
  )
}
