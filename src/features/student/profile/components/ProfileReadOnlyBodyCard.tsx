import { FqCard, FqTag, FqText } from '@/shared/ui'
import type { ProgressOverview } from '@/shared/services/contracts/progress'

type ProfileReadOnlyBodyCardProps = {
  progress: ProgressOverview
}

function resolveBmiLabel(status: ProgressOverview['bodyComposition']['bmiStatus']) {
  if (status === 'healthy') {
    return 'Faixa saudavel'
  }

  if (status === 'underweight') {
    return 'Abaixo da faixa'
  }

  if (status === 'overweight') {
    return 'Acima da faixa'
  }

  return 'Faixa de obesidade'
}

export function ProfileReadOnlyBodyCard({ progress }: ProfileReadOnlyBodyCardProps) {
  return (
    <FqCard
      title="Dados fisicos em leitura"
      subtitle="Peso e medidas aparecem como referencia, sem virar um formulario de edicao."
      className="border-border bg-card"
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <FqText as="p" className="text-xs text-muted-foreground">
              Peso atual
            </FqText>
            <FqText as="p" className="mt-2 text-card-title font-semibold text-foreground">
              {progress.metrics.currentWeightKg.toFixed(1)} kg
            </FqText>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-2">
              <FqText as="p" className="text-xs text-muted-foreground">
                IMC
              </FqText>
              <FqTag tone="secondary">{progress.metrics.bmi.toFixed(1)}</FqTag>
            </div>
            <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
              {resolveBmiLabel(progress.bodyComposition.bmiStatus)}
            </FqText>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <FqText as="p" className="text-xs text-muted-foreground">
              Altura
            </FqText>
            <FqText as="p" className="mt-2 text-card-title font-semibold text-foreground">
              {progress.bodyComposition.heightCm} cm
            </FqText>
          </div>
        </div>

        {progress.bodyComposition.latestMeasurements ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <FqText as="p" className="text-xs text-muted-foreground">
                Cintura
              </FqText>
              <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                {progress.bodyComposition.latestMeasurements.waistCm} cm
              </FqText>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <FqText as="p" className="text-xs text-muted-foreground">
                Quadril
              </FqText>
              <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                {progress.bodyComposition.latestMeasurements.hipsCm} cm
              </FqText>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-4">
            <FqText as="p" className="text-sm text-muted-foreground">
              Nenhuma medicao corporal registrada ainda.
            </FqText>
          </div>
        )}
      </div>
    </FqCard>
  )
}
