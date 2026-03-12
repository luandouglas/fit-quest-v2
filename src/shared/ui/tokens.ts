import type { FqSize, FqTone, FqVariant } from '@/shared/ui/types'

export const fqButtonSizeMap = {
  xs: 'min-h-8 px-3.5 text-xs',
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-5 text-[0.95rem]',
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
      'bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(95,141,118,0.22)] hover:bg-primary/92 active:bg-primary/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-ring',
    outline:
      'border border-primary/25 bg-primary/6 text-primary shadow-[0_8px_18px_rgba(36,49,44,0.04)] hover:bg-primary/10 active:bg-primary/14 disabled:active:bg-transparent focus-visible:ring-ring',
    ghost:
      'text-primary hover:bg-primary/10 active:bg-primary/14 disabled:active:bg-transparent focus-visible:ring-ring',
  },
  secondary: {
    solid:
      'bg-secondary text-secondary-foreground shadow-[0_12px_24px_rgba(120,146,174,0.22)] hover:bg-secondary/92 active:bg-secondary/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-secondary',
    outline:
      'border border-secondary/25 bg-secondary/6 text-secondary shadow-[0_8px_18px_rgba(36,49,44,0.04)] hover:bg-secondary/10 active:bg-secondary/14 disabled:active:bg-transparent focus-visible:ring-secondary',
    ghost:
      'text-secondary hover:bg-secondary/10 active:bg-secondary/14 disabled:active:bg-transparent focus-visible:ring-secondary',
  },
  success: {
    solid:
      'bg-success text-success-foreground shadow-[0_12px_24px_rgba(77,135,107,0.22)] hover:bg-success/92 active:bg-success/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-success',
    outline:
      'border border-success/25 bg-success/6 text-success shadow-[0_8px_18px_rgba(36,49,44,0.04)] hover:bg-success/10 active:bg-success/14 disabled:active:bg-transparent focus-visible:ring-success',
    ghost:
      'text-success hover:bg-success/10 active:bg-success/14 disabled:active:bg-transparent focus-visible:ring-success',
  },
  warning: {
    solid:
      'bg-warning text-warning-foreground shadow-[0_12px_24px_rgba(196,141,77,0.22)] hover:bg-warning/92 active:bg-warning/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-warning',
    outline:
      'border border-warning/25 bg-warning/8 text-warning shadow-[0_8px_18px_rgba(36,49,44,0.04)] hover:bg-warning/12 active:bg-warning/16 disabled:active:bg-transparent focus-visible:ring-warning',
    ghost:
      'text-warning hover:bg-warning/10 active:bg-warning/14 disabled:active:bg-transparent focus-visible:ring-warning',
  },
  danger: {
    solid:
      'bg-destructive text-destructive-foreground shadow-[0_12px_24px_rgba(198,90,88,0.22)] hover:bg-destructive/92 active:bg-destructive/95 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-destructive',
    outline:
      'border border-destructive/25 bg-destructive/6 text-destructive shadow-[0_8px_18px_rgba(36,49,44,0.04)] hover:bg-destructive/10 active:bg-destructive/14 disabled:active:bg-transparent focus-visible:ring-destructive',
    ghost:
      'text-destructive hover:bg-destructive/10 active:bg-destructive/14 disabled:active:bg-transparent focus-visible:ring-destructive',
  },
  neutral: {
    solid:
      'bg-foreground text-background shadow-[0_12px_24px_rgba(36,49,44,0.16)] hover:opacity-94 active:opacity-97 active:translate-y-px disabled:active:translate-y-0 focus-visible:ring-ring',
    outline:
      'border border-border/80 bg-card/80 text-foreground shadow-[0_8px_18px_rgba(36,49,44,0.04)] hover:bg-accent active:bg-accent/80 disabled:active:bg-transparent focus-visible:ring-ring',
    ghost:
      'text-foreground hover:bg-accent active:bg-accent/80 disabled:active:bg-transparent focus-visible:ring-ring',
  },
} satisfies Record<FqTone, Record<FqVariant, string>>

export const fqBadgeToneMap = {
  primary: 'border border-primary/15 bg-primary/10 text-primary',
  secondary: 'border border-secondary/15 bg-secondary/10 text-secondary',
  success: 'border border-success/15 bg-success/10 text-success',
  warning: 'border border-warning/18 bg-warning/14 text-warning-foreground',
  danger: 'border border-destructive/15 bg-destructive/10 text-destructive',
  neutral: 'border border-border/70 bg-muted/70 text-foreground',
} satisfies Record<FqTone, string>
