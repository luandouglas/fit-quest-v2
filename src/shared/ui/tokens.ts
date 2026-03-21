import type { FqSize, FqTone, FqVariant } from '@/shared/ui/types'

export const fqButtonSizeMap = {
  xs: 'min-h-8 px-3 text-caption',
  sm: 'min-h-9 px-3.5 text-body',
  md: 'min-h-10 px-4 text-body',
  lg: 'min-h-12 px-5 text-card-title',
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
      'bg-primary text-primary-foreground shadow-btn-primary hover:bg-primary/90 active:bg-primary/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-ring',
    outline:
      'border border-primary/25 bg-primary/5 text-primary shadow-btn-outline hover:bg-primary/10 active:bg-primary/15 disabled:active:bg-transparent focus-visible:ring-ring',
    ghost:
      'text-primary hover:bg-primary/10 active:bg-primary/15 disabled:active:bg-transparent focus-visible:ring-ring',
  },
  secondary: {
    solid:
      'bg-secondary text-secondary-foreground shadow-btn-secondary hover:bg-secondary/90 active:bg-secondary/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-secondary',
    outline:
      'border border-secondary/25 bg-secondary/5 text-secondary shadow-btn-outline hover:bg-secondary/10 active:bg-secondary/15 disabled:active:bg-transparent focus-visible:ring-secondary',
    ghost:
      'text-secondary hover:bg-secondary/10 active:bg-secondary/15 disabled:active:bg-transparent focus-visible:ring-secondary',
  },
  success: {
    solid:
      'bg-success text-success-foreground shadow-btn-success hover:bg-success/90 active:bg-success/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-success',
    outline:
      'border border-success/25 bg-success/5 text-success shadow-btn-outline hover:bg-success/10 active:bg-success/15 disabled:active:bg-transparent focus-visible:ring-success',
    ghost:
      'text-success hover:bg-success/10 active:bg-success/15 disabled:active:bg-transparent focus-visible:ring-success',
  },
  warning: {
    solid:
      'bg-warning text-warning-foreground shadow-btn-warning hover:bg-warning/90 active:bg-warning/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-warning',
    outline:
      'border border-warning/25 bg-warning/10 text-warning shadow-btn-outline hover:bg-warning/10 active:bg-warning/15 disabled:active:bg-transparent focus-visible:ring-warning',
    ghost:
      'text-warning hover:bg-warning/10 active:bg-warning/15 disabled:active:bg-transparent focus-visible:ring-warning',
  },
  danger: {
    solid:
      'bg-destructive text-destructive-foreground shadow-btn-danger hover:bg-destructive/90 active:bg-destructive/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-destructive',
    outline:
      'border border-destructive/25 bg-destructive/5 text-destructive shadow-btn-outline hover:bg-destructive/10 active:bg-destructive/15 disabled:active:bg-transparent focus-visible:ring-destructive',
    ghost:
      'text-destructive hover:bg-destructive/10 active:bg-destructive/15 disabled:active:bg-transparent focus-visible:ring-destructive',
  },
  neutral: {
    solid:
      'bg-foreground text-background shadow-btn-neutral hover:opacity-90 active:opacity-95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-ring',
    outline:
      'border border-border bg-card text-foreground shadow-btn-outline hover:bg-accent active:bg-accent/80 disabled:active:bg-transparent focus-visible:ring-ring',
    ghost:
      'text-foreground hover:bg-accent active:bg-accent/80 disabled:active:bg-transparent focus-visible:ring-ring',
  },
} satisfies Record<FqTone, Record<FqVariant, string>>

export const fqBadgeToneMap = {
  primary: 'border border-primary/15 bg-primary/10 text-primary',
  secondary: 'border border-secondary/15 bg-secondary/10 text-secondary',
  success: 'border border-success/15 bg-success/10 text-success',
  warning: 'border border-warning/20 bg-warning/15 text-warning-foreground',
  danger: 'border border-destructive/15 bg-destructive/10 text-destructive',
  neutral: 'border border-border bg-muted text-foreground',
} satisfies Record<FqTone, string>
