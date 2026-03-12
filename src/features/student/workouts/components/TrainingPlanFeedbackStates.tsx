import { AlertTriangle, ArrowLeft, Dumbbell, Sparkles } from 'lucide-react'

import { FqButton, FqSkeleton, FqText } from '@/shared/ui'

type FeedbackStateProps = {
  onBack: () => void
}

type ErrorStateProps = {
  onRetry: () => void
}

type EmptyStateProps = FeedbackStateProps & {
  onShowPlans: () => void
  canShowPlans?: boolean
  showPlansReason?: string
}

export function TrainingPlanLoadingState() {
  return (
    <section className="fq-page-shell space-y-5">
      <div className="fq-gradient-hero-mix overflow-hidden rounded-[34px] border border-border/70 bg-card p-6 md:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.9fr)]">
          <div className="space-y-4">
            <FqSkeleton className="h-4 w-28" rounded="full" />
            <FqSkeleton className="h-14 w-[min(460px,100%)]" rounded="lg" />
            <FqSkeleton className="h-5 w-[min(580px,100%)]" rounded="full" />
            <FqSkeleton className="h-3 w-full" rounded="full" />
          </div>

          <div className="rounded-[28px] border border-white/65 bg-white/70 p-5 shadow-[0_18px_44px_rgba(36,49,44,0.08)]">
            <FqSkeleton className="h-4 w-32" rounded="full" />
            <FqSkeleton className="mt-4 h-8 w-40" rounded="lg" />
            <FqSkeleton className="mt-3 h-16 w-full" rounded="lg" />
            <div className="mt-5 flex gap-2">
              <FqSkeleton className="h-10 flex-1" rounded="full" />
              <FqSkeleton className="h-10 flex-1" rounded="full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.92fr)]">
        <div className="space-y-5">
          <FqSkeleton className="h-[300px] w-full rounded-[30px]" />
          <FqSkeleton className="h-[420px] w-full rounded-[30px]" />
        </div>

        <div className="space-y-5">
          <FqSkeleton className="h-[210px] w-full rounded-[30px]" />
          <FqSkeleton className="h-[160px] w-full rounded-[30px]" />
          <FqSkeleton className="h-[260px] w-full rounded-[30px]" />
        </div>
      </div>
    </section>
  )
}

export function TrainingPlanErrorState({ onRetry }: ErrorStateProps) {
  return (
    <section className="fq-page-shell">
      <div className="fq-gradient-hero-danger overflow-hidden rounded-[34px] border border-destructive/18 bg-card p-6 shadow-[0_26px_60px_rgba(45,34,22,0.08)] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.24em] text-destructive">
                Training plan
              </FqText>
              <FqText as="h1" className="text-3xl font-semibold tracking-tight text-foreground">
                Nao foi possivel carregar seus treinos
              </FqText>
              <FqText as="p" className="max-w-2xl text-sm leading-7 text-muted-foreground">
                A experiencia foi redesenhada, mas os dados ainda nao chegaram. Tente recarregar para montar sua agenda novamente.
              </FqText>
            </div>
          </div>

          <FqButton onClick={onRetry} rightIcon="arrowRight">
            Tentar novamente
          </FqButton>
        </div>
      </div>
    </section>
  )
}

export function TrainingPlanEmptyState({
  onBack,
  onShowPlans,
  canShowPlans = true,
  showPlansReason,
}: EmptyStateProps) {
  return (
    <section className="fq-page-shell">
      <header className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Voltar"
          onClick={onBack}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-white/72 text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </header>

      <div className="fq-gradient-hero-mix overflow-hidden rounded-[34px] border border-border/70 bg-card p-6 shadow-[0_26px_60px_rgba(36,49,44,0.08)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-[0_14px_30px_rgba(95,141,118,0.22)]">
              <Dumbbell className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <FqText as="p" className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Training plan
              </FqText>
              <FqText as="h1" className="fq-display text-4xl text-foreground md:text-5xl">
                Sem treino atribuido agora
              </FqText>
              <FqText as="p" className="max-w-2xl text-sm leading-7 text-muted-foreground">
                A tela nova ja esta pronta para receber sua rotina. Assim que houver um treino ativo, a agenda semanal, o card de hoje e os detalhes do treino aparecem aqui.
              </FqText>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/65 bg-white/74 p-5 shadow-[0_18px_44px_rgba(36,49,44,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-secondary" />
              Proxima acao
            </div>

            <FqText as="p" className="mt-3 text-sm leading-7 text-muted-foreground">
              {canShowPlans
                ? 'Gere um treino rapido para nao perder ritmo enquanto a agenda principal nao chega.'
                : 'Seu treino precisa ser liberado por quem acompanha sua rotina.'}
            </FqText>

            <div className="mt-5 flex flex-col gap-3">
              <FqButton onClick={canShowPlans ? onShowPlans : undefined} isDisabled={!canShowPlans}>
                Criar treino rapido
              </FqButton>
              <FqButton variant="outline" tone="neutral" onClick={onBack}>
                Voltar para o hub
              </FqButton>
            </div>

            {!canShowPlans && showPlansReason ? (
              <FqText as="p" className="mt-4 text-xs leading-6 text-muted-foreground">
                {showPlansReason}
              </FqText>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
