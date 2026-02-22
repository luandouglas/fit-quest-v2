import { useHistory } from 'react-router-dom'

import { FqButton, FqCard, FqIcon, FqText } from '@/shared/ui'

export function TrainingSessionPage() {
  const history = useHistory()

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4">
      <FqCard className="w-full border-border bg-card text-center">
        <div className="space-y-4">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <FqIcon name="play" />
          </span>

          <FqText as="h1" variant="title" className="text-lg">
            Sessão de treino
          </FqText>

          <FqText as="p" className="text-sm text-muted-foreground">
            Placeholder da sessão. Aqui ficará o player/flow de execução dos exercícios.
          </FqText>

          <div className="flex flex-wrap justify-center gap-2">
            <FqButton variant="outline" tone="neutral" onClick={() => history.push('/tabs/workouts')}>
              Voltar para Treinos
            </FqButton>
            <FqButton onClick={() => history.push('/tabs/home')}>Ir para Home</FqButton>
          </div>
        </div>
      </FqCard>
    </section>
  )
}
