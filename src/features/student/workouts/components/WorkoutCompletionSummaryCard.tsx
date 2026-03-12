import { FqCard, FqLevelBadge, FqStatCard, FqTag, FqText, FqXPBar } from '@/shared/ui'

import type { WorkoutSessionSummary } from '@/shared/services/contracts/workout'

type WorkoutCompletionSummaryCardProps = {
  summary: WorkoutSessionSummary
}

export function WorkoutCompletionSummaryCard({ summary }: WorkoutCompletionSummaryCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <FqText as="p" className="text-sm text-muted-foreground">
                Treino concluído
              </FqText>
              <FqText as="h1" className="text-2xl font-semibold text-foreground">
                {summary.title}
              </FqText>
            </div>
            <FqLevelBadge level={summary.currentLevel} label="Level" />
          </div>

          <FqText as="p" className="text-sm text-muted-foreground">
            {summary.completionMessage}
          </FqText>

          <div className="flex flex-wrap gap-2">
            <FqTag tone="success">+{summary.rewardStars} estrelas hoje</FqTag>
            <FqTag tone="secondary">Streak {summary.streakDays} dias</FqTag>
            <FqTag tone="neutral">{summary.completedSets}/{summary.totalSets} séries</FqTag>
          </div>
        </div>

        <FqXPBar
          currentXP={summary.currentLevelStars}
          targetXP={summary.nextLevelStars}
          label={`Nível ${summary.currentLevel} → ${summary.nextLevel}`}
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="Exercícios" value={`${summary.completedExercises}/${summary.totalExercises}`} icon="list" />
          <FqStatCard label="Volume" value={`${summary.loadVolumeKg} kg`} icon="dumbbell" />
          <FqStatCard label="Faltam para subir" value={`${summary.starsToNextLevel}`} icon="star" helperText="estrelas para o próximo nível" />
          <FqStatCard label="Semana" value={`${summary.weeklyCompletedWorkouts}/${summary.weeklyTargetWorkouts}`} icon="chart" helperText="treinos concluídos nesta semana" />
        </div>
      </div>
    </FqCard>
  )
}
