import { FqCard, FqStatCard, FqTag, FqText } from '@/shared/ui'
import type { StudentDashboard } from '@/shared/services/contracts/student'

import type { StudentHomeViewModel } from '../hooks/useStudentHomeViewModel'

type StudentWeeklySummaryCardProps = {
  dashboard: StudentDashboard
  viewModel: StudentHomeViewModel
}

export function StudentWeeklySummaryCard({ dashboard, viewModel }: StudentWeeklySummaryCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <FqText as="h2" className="text-base font-semibold text-foreground">
              Resumo semanal
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Evolução acumulada para manter percepção de progresso real.
            </FqText>
          </div>
          <FqTag tone="secondary">{viewModel.weeklySummary.rankingLabel}</FqTag>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="XP semanal" value={dashboard.gamificationProfile.weeklyXp} delta={`${dashboard.gamificationProfile.weeklyXpTarget} alvo`} icon="star" />
          <FqStatCard label="Streak" value={`${dashboard.gamificationProfile.streakDays} dias`} helperText={viewModel.weeklySummary.completionLabel} icon="flame" />
          <FqStatCard label="Nutrição" value={viewModel.weeklySummary.nutritionLabel} icon="utensils" />
          <FqStatCard label="Hidratação" value={viewModel.weeklySummary.hydrationLabel} icon="flask" />
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Indicadores da semana
          </FqText>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <div className="rounded-2xl border border-border px-4 py-3">
              <FqText as="p" className="text-xs uppercase tracking-wide text-muted-foreground">
                Treinos
              </FqText>
              <FqText as="p" className="mt-1 text-sm font-semibold text-foreground">
                {viewModel.weeklySummary.workoutLabel}
              </FqText>
            </div>
            <div className="rounded-2xl border border-border px-4 py-3">
              <FqText as="p" className="text-xs uppercase tracking-wide text-muted-foreground">
                Consistência
              </FqText>
              <FqText as="p" className="mt-1 text-sm font-semibold text-foreground">
                {dashboard.metrics.consistencyScore}% de score
              </FqText>
            </div>
            <div className="rounded-2xl border border-border px-4 py-3">
              <FqText as="p" className="text-xs uppercase tracking-wide text-muted-foreground">
                Cardio
              </FqText>
              <FqText as="p" className="mt-1 text-sm font-semibold text-foreground">
                {dashboard.metrics.cardioMinutesMonth} min no mês
              </FqText>
            </div>
          </div>
        </div>
      </div>
    </FqCard>
  )
}
