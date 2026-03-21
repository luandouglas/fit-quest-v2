import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { FqIconButton } from '@/shared/ui/primitives/FqIconButton'
import type { FqTone } from '@/shared/ui/types'
import { cx } from '@/shared/utils'

export type FqToastItem = {
  id: string
  title: string
  description?: string
  tone?: FqTone
  duration?: number
}

type FqToastContextValue = {
  toast: (input: Omit<FqToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

const fqToastContext = createContext<FqToastContextValue | null>(null)

const toneMap: Record<FqTone, string> = {
  primary: 'border-blue-200 bg-blue-50 text-blue-900',
  secondary: 'border-slate-200 bg-slate-50 text-slate-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
  neutral: 'border-zinc-200 bg-zinc-50 text-zinc-900',
}

type FqToastProps = {
  item: FqToastItem
  onDismiss: (id: string) => void
}

export function FqToast({ item, onDismiss }: FqToastProps) {
  return (
    <div
      className={cx(
        'w-full max-w-toast rounded-lg border p-3 shadow-lg',
        toneMap[item.tone ?? 'neutral'],
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{item.title}</p>
          {item.description ? <p className="mt-1 text-xs opacity-80">{item.description}</p> : null}
        </div>
        <FqIconButton
          icon="x"
          label="Dismiss toast"
          size="xs"
          variant="ghost"
          tone="neutral"
          onClick={() => onDismiss(item.id)}
        />
      </div>
    </div>
  )
}

type FqToastProviderProps = {
  children: ReactNode
}

export function FqToastProvider({ children }: FqToastProviderProps) {
  const [toasts, setToasts] = useState<FqToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback((input: Omit<FqToastItem, 'id'>) => {
    const nextToast: FqToastItem = {
      id: crypto.randomUUID(),
      duration: 3000,
      tone: 'neutral',
      ...input,
    }

    setToasts((current) => [nextToast, ...current])
  }, [])

  useEffect(() => {
    if (!toasts.length) {
      return
    }

    const timers = toasts.map((item) => {
      if (!item.duration || item.duration <= 0) {
        return null
      }

      return window.setTimeout(() => {
        dismiss(item.id)
      }, item.duration)
    })

    return () => {
      timers.forEach((timer) => {
        if (timer) {
          window.clearTimeout(timer)
        }
      })
    }
  }, [dismiss, toasts])

  const value = useMemo<FqToastContextValue>(
    () => ({
      toast,
      dismiss,
    }),
    [toast, dismiss],
  )

  return createElement(
    fqToastContext.Provider,
    { value },
    children,
    typeof document !== 'undefined'
      ? createPortal(
          <div className="pointer-events-none fixed right-3 top-3 z-toast flex flex-col gap-2">
            {toasts.map((item) => (
              <div key={item.id} className="pointer-events-auto">
                <FqToast item={item} onDismiss={dismiss} />
              </div>
            ))}
          </div>,
          document.body,
        )
      : null,
  )
}

export function useToast() {
  const context = useContext(fqToastContext)

  if (!context) {
    throw new Error('useToast must be used within FqToastProvider')
  }

  return context
}
