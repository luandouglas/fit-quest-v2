import type { FqSize, FqTone, FqVariant } from '@/shared/ui/types'

export const fqButtonSizeMap = {
  xs: 'min-h-8 px-3 py-1.5 text-xs',
  sm: 'min-h-9 px-3.5 py-2 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-base',
  lg: 'min-h-12 px-6 py-3 text-base',
} satisfies Record<FqSize, string>

export const fqIconButtonSizeMap = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} satisfies Record<FqSize, string>

export const fqToneVariantMap = {
  primary: {
    solid: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring',
    outline:
      'border border-primary/40 text-primary hover:bg-primary/10 focus-visible:ring-ring',
    ghost: 'text-primary hover:bg-primary/10 focus-visible:ring-ring',
  },
  secondary: {
    solid: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary',
    outline:
      'border border-secondary/40 text-secondary hover:bg-secondary/10 focus-visible:ring-secondary',
    ghost: 'text-secondary hover:bg-secondary/10 focus-visible:ring-secondary',
  },
  success: {
    solid: 'bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success',
    outline:
      'border border-success/40 text-success hover:bg-success/10 focus-visible:ring-success',
    ghost: 'text-success hover:bg-success/10 focus-visible:ring-success',
  },
  warning: {
    solid: 'bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning',
    outline:
      'border border-warning/40 text-warning hover:bg-warning/10 focus-visible:ring-warning',
    ghost: 'text-warning hover:bg-warning/10 focus-visible:ring-warning',
  },
  danger: {
    solid: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
    outline:
      'border border-destructive/40 text-destructive hover:bg-destructive/10 focus-visible:ring-destructive',
    ghost: 'text-destructive hover:bg-destructive/10 focus-visible:ring-destructive',
  },
  neutral: {
    solid: 'bg-foreground text-background hover:opacity-90 focus-visible:ring-ring',
    outline:
      'border border-border text-foreground hover:bg-accent focus-visible:ring-ring',
    ghost: 'text-foreground hover:bg-accent focus-visible:ring-ring',
  },
} satisfies Record<FqTone, Record<FqVariant, string>>

export const fqBadgeToneMap = {
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-warning-foreground',
  danger: 'bg-destructive/15 text-destructive',
  neutral: 'bg-muted text-foreground',
} satisfies Record<FqTone, string>
