import type { ProgressAnswerItem } from '@/features/student/progress/hooks/useProgressViewModel'
import { FqCard, FqLevelBadge, FqStatCard, FqTag, FqText } from '@/shared/ui'

type ProgressHeroCardProps = {
  stars: number
  level: number
  nextLevelRemaining: number
  currentWeightKg: number
  bmi: number
  bmiLabel: string
  answers: ProgressAnswerItem[]
  feedback: string[]
}

export function ProgressHeroCard({
  stars,
  level,
  nextLevelRemaining,
  currentWeightKg,
  bmi,
  bmiLabel,
  answers,
  feedback,
}: ProgressHeroCardProps) {
  return (
    <FqCard className="overflow-hidden border-border bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_36%),linear-gradient(180deg,_rgba(15,23,42,0.02),_rgba(15,23,42,0.08))]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <FqLevelBadge level={level} label="Nivel" />
          <FqTag tone="secondary" leftIcon="star">{stars} estrelas</FqTag>
          <FqTag tone="success" leftIcon="activity">{bmiLabel}</FqTag>
        </div>

        <div className="space-y-2">
          <FqText as="h2" variant="title" className="text-xl sm:text-2xl">
            Progresso precisa responder com clareza se voce esta melhorando.
          </FqText>
          <FqText as="p" className="max-w-2xl text-sm text-muted-foreground">
            Peso, IMC, consistencia, cardio, agua e gamificacao aparecem aqui como sinais simples, comparaveis e acionaveis.
          </FqText>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="Peso atual" value={`${currentWeightKg.toFixed(1)} kg`} icon="activity" />
          <FqStatCard label="IMC atual" value={bmi.toFixed(1)} helperText={bmiLabel} icon="heart" />
          <FqStatCard label="Estrelas acumuladas" value={stars} helperText="Saldo visivel do aluno" icon="star" />
          <FqStatCard
            label="Proximo nivel"
            value={nextLevelRemaining > 0 ? `${nextLevelRemaining} XP` : 'Liberado'}
            helperText="Leitura de gamificacao integrada"
            icon="target"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-background/75 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <FqText as="p" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {answer.label}
                </FqText>
                <FqTag tone={answer.tone}>
                  {answer.tone === 'success' ? 'Melhora' : answer.tone === 'warning' ? 'Atencao' : 'Estavel'}
                </FqTag>
              </div>
              <FqText as="p" className="mt-3 text-sm font-semibold text-foreground">
                {answer.value}
              </FqText>
              <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                {answer.helper}
              </FqText>
            </div>
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {feedback.map((item) => (
            <div
              key={item}
              className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-background/72 px-4 py-3"
            >
              <FqText as="p" className="text-sm text-foreground">
                {item}
              </FqText>
            </div>
          ))}
        </div>
      </div>
    </FqCard>
  )
}
