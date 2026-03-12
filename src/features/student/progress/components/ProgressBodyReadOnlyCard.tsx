import type { ProgressMeasurementItem } from '@/features/student/progress/hooks/useProgressViewModel'
import type { ProgressBodyComposition } from '@/shared/services/contracts/progress'
import { FqAlert, FqButton, FqCard, FqTag, FqText } from '@/shared/ui'

type ProgressBodyReadOnlyCardProps = {
  bodyComposition: ProgressBodyComposition
  measurementSummary: {
    lastUpdatedAt: string | null
    lastUpdatedByLabel: string
  }
  measurements: ProgressMeasurementItem[]
  onRequestUpdate: () => void
  isRequestPending: boolean
}

export function ProgressBodyReadOnlyCard({
  bodyComposition,
  measurementSummary,
  measurements,
  onRequestUpdate,
  isRequestPending,
}: ProgressBodyReadOnlyCardProps) {
  return (
    <FqCard
      title="Corpo e medidas"
      subtitle="Modo leitura para o aluno, com contexto suficiente para entender tendencia."
      className="border-border bg-card"
    >
      <div className="space-y-4">
        <FqAlert tone="secondary" title="Edicao bloqueada para aluno">
          Peso pode ser registrado pelo proprio aluno, mas medidas corporais seguem sob responsabilidade profissional.
        </FqAlert>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4">
            <FqText as="p" className="text-xs text-muted-foreground">
              Altura de referencia
            </FqText>
            <FqText as="p" className="mt-2 text-lg font-semibold text-foreground">
              {bodyComposition.heightCm} cm
            </FqText>
          </div>
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-2">
              <FqText as="p" className="text-xs text-muted-foreground">
                IMC atual
              </FqText>
              <FqTag tone="success">{bodyComposition.bmi.toFixed(1)}</FqTag>
            </div>
            <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
              {bodyComposition.bmiStatus === 'healthy'
                ? 'Faixa saudavel'
                : bodyComposition.bmiStatus === 'underweight'
                  ? 'Abaixo da faixa'
                  : bodyComposition.bmiStatus === 'overweight'
                    ? 'Acima da faixa'
                    : 'Faixa de obesidade'}
            </FqText>
          </div>
        </div>

        <FqText as="p" className="text-xs text-muted-foreground">
          Ultima atualizacao por {measurementSummary.lastUpdatedByLabel}
          {measurementSummary.lastUpdatedAt
            ? ` em ${new Date(measurementSummary.lastUpdatedAt).toLocaleString('pt-BR')}`
            : ''}
        </FqText>

        {measurements.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {measurements.map((measurement) => (
              <div
                key={measurement.id}
                className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4"
              >
                <FqText as="p" className="text-xs text-muted-foreground">
                  {measurement.label}
                </FqText>
                <FqText as="p" className="mt-2 text-lg font-semibold text-foreground">
                  {measurement.currentLabel}
                </FqText>
                <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                  {measurement.deltaLabel}
                </FqText>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[calc(var(--radius)+4px)] border border-dashed border-border/80 bg-muted/10 p-4">
            <FqText as="p" className="text-sm text-muted-foreground">
              Nenhuma avaliacao corporal registrada ainda.
            </FqText>
          </div>
        )}

        <FqButton variant="outline" tone="secondary" onClick={onRequestUpdate} isLoading={isRequestPending} className="w-full">
          Solicitar nova avaliacao
        </FqButton>
      </div>
    </FqCard>
  )
}
