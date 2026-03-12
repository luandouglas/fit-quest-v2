import { FqAlert, FqButton, FqEmptyState, FqIcon, FqSkeleton, FqText } from '@/shared/ui'

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
    <section className="fq-page-shell">
      <FqSkeleton className="h-10 w-52" rounded="lg" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-4 md:col-span-2 lg:col-span-6">
          <FqSkeleton className="h-44 w-full" rounded="lg" />
          <FqSkeleton className="h-24 w-full" rounded="lg" />
          <FqSkeleton className="h-24 w-full" rounded="lg" />
        </div>
        <FqSkeleton className="h-52 w-full md:col-span-1 lg:col-span-3" rounded="lg" />
        <FqSkeleton className="h-56 w-full md:col-span-1 lg:col-span-3" rounded="lg" />
      </div>
    </section>
  )
}

export function TrainingPlanErrorState({ onRetry }: ErrorStateProps) {
  return (
    <section className="fq-page-shell">
      <FqAlert tone="danger" title="Não foi possível carregar seus treinos">
        Verifique sua conexão e tente novamente.
      </FqAlert>
      <FqButton onClick={onRetry} leftIcon="arrowRight">
        Tentar novamente
      </FqButton>
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
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        >
          <FqIcon name="arrowLeft" size={16} />
        </button>
        <FqText as="h1" variant="title" className="text-lg">
          Treinos
        </FqText>
      </header>

      <FqEmptyState
        icon="dumbbell"
        title="Sem treino atribuído para hoje"
        description={
          canShowPlans
            ? 'Você pode explorar os planos disponíveis e escolher um treino para continuar evoluindo.'
            : 'Aguarde seu personal atribuir o treino do dia para iniciar a sessao.'
        }
        actionLabel={canShowPlans ? 'Ver planos' : undefined}
        onAction={canShowPlans ? onShowPlans : undefined}
      />
      {!canShowPlans && showPlansReason ? (
        <FqText as="p" className="text-xs text-muted-foreground">
          {showPlansReason}
        </FqText>
      ) : null}
    </section>
  )
}
