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
    solid: 'bg-slate-700 text-white hover:bg-slate-600 focus-visible:ring-slate-500',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500',
    ghost: 'text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500',
  },
  success: {
    solid: 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500',
    outline:
      'border border-emerald-300 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500',
    ghost: 'text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500',
  },
  warning: {
    solid: 'bg-amber-500 text-amber-950 hover:bg-amber-400 focus-visible:ring-amber-500',
    outline:
      'border border-amber-300 text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500',
    ghost: 'text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500',
  },
  danger: {
    solid: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
    outline:
      'border border-rose-300 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500',
    ghost: 'text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500',
  },
  neutral: {
    solid: 'bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-500',
    outline:
      'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 focus-visible:ring-zinc-500',
    ghost: 'text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-500',
  },
} satisfies Record<FqTone, Record<FqVariant, string>>

export const fqBadgeToneMap = {
  primary: 'bg-blue-100 text-blue-700',
  secondary: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  neutral: 'bg-zinc-100 text-zinc-700',
} satisfies Record<FqTone, string>
