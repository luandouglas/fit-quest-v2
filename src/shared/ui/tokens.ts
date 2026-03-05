import type { FqSize, FqTone, FqVariant } from '@/shared/ui/types'

export const fqButtonSizeMap = {
  xs: 'min-h-8 px-3 text-xs',
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-14 px-6 text-base',
} satisfies Record<FqSize, string>

export const fqIconButtonSizeMap = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} satisfies Record<FqSize, string>

export const fqToneVariantMap = {
  primary: {
    solid:
      'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-ring',
    outline:
      'border border-primary/40 text-primary shadow-sm hover:bg-primary/10 active:bg-primary/20 disabled:active:bg-transparent focus-visible:ring-ring',
    ghost:
      'text-primary hover:bg-primary/10 active:bg-primary/20 disabled:active:bg-transparent focus-visible:ring-ring',
  },
  secondary: {
    solid:
      'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 active:bg-secondary/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-secondary',
    outline:
      'border border-secondary/40 text-secondary shadow-sm hover:bg-secondary/10 active:bg-secondary/20 disabled:active:bg-transparent focus-visible:ring-secondary',
    ghost:
      'text-secondary hover:bg-secondary/10 active:bg-secondary/20 disabled:active:bg-transparent focus-visible:ring-secondary',
  },
  success: {
    solid:
      'bg-success text-success-foreground shadow-sm hover:bg-success/90 active:bg-success/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-success',
    outline:
      'border border-success/40 text-success shadow-sm hover:bg-success/10 active:bg-success/20 disabled:active:bg-transparent focus-visible:ring-success',
    ghost:
      'text-success hover:bg-success/10 active:bg-success/20 disabled:active:bg-transparent focus-visible:ring-success',
  },
  warning: {
    solid:
      'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90 active:bg-warning/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-warning',
    outline:
      'border border-warning/40 text-warning shadow-sm hover:bg-warning/10 active:bg-warning/20 disabled:active:bg-transparent focus-visible:ring-warning',
    ghost:
      'text-warning hover:bg-warning/10 active:bg-warning/20 disabled:active:bg-transparent focus-visible:ring-warning',
  },
  danger: {
    solid:
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-destructive',
    outline:
      'border border-destructive/40 text-destructive shadow-sm hover:bg-destructive/10 active:bg-destructive/20 disabled:active:bg-transparent focus-visible:ring-destructive',
    ghost:
      'text-destructive hover:bg-destructive/10 active:bg-destructive/20 disabled:active:bg-transparent focus-visible:ring-destructive',
  },
  neutral: {
    solid:
      'bg-foreground text-background shadow-sm hover:opacity-90 active:opacity-95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-ring',
    outline:
      'border border-border text-foreground shadow-sm hover:bg-accent active:bg-accent/80 disabled:active:bg-transparent focus-visible:ring-ring',
    ghost:
      'text-foreground hover:bg-accent active:bg-accent/80 disabled:active:bg-transparent focus-visible:ring-ring',
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
