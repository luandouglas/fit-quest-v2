export const fqVariants = ['solid', 'outline', 'ghost'] as const
export type FqVariant = (typeof fqVariants)[number]

export const fqSizes = ['xs', 'sm', 'md', 'lg'] as const
export type FqSize = (typeof fqSizes)[number]

export const fqTones = ['primary', 'secondary', 'success', 'warning', 'danger', 'neutral'] as const
export type FqTone = (typeof fqTones)[number]

export function isFqVariant(value: unknown): value is FqVariant {
  return typeof value === 'string' && fqVariants.includes(value as FqVariant)
}

export function isFqSize(value: unknown): value is FqSize {
  return typeof value === 'string' && fqSizes.includes(value as FqSize)
}

export function isFqTone(value: unknown): value is FqTone {
  return typeof value === 'string' && fqTones.includes(value as FqTone)
}

export type FqBaseProps = {
  className?: string
  testId?: string
}
