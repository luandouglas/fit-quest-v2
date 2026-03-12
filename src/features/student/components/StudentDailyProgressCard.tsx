import { FqCard, FqProgressBar, FqProgressRing, FqTag, FqText } from '@/shared/ui'
import type { DailyProgress, NutritionDayPlan, StudentHabit, WaterProgress } from '@/shared/services/contracts/student'

type StudentDailyProgressCardProps = {
  dailyProgress: DailyProgress
  nutritionPlan: NutritionDayPlan
  waterProgress: WaterProgress
  habits: StudentHabit[]
}

export function StudentDailyProgressCard({
  dailyProgress,
  nutritionPlan,
  waterProgress,
  habits,
}: StudentDailyProgressCardProps) {
  const completedMeals = nutritionPlan.meals.filter((meal) => meal.status === 'completed').length

  return (
    <FqCard className="border-border bg-card">
      <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex items-center justify-center">
          <FqProgressRing
            value={dailyProgress.completionPct}
            size={152}
            label={`${dailyProgress.completedBlocks}/${dailyProgress.totalBlocks} blocos`}
            tone={dailyProgress.status === 'completed' ? 'success' : 'primary'}
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <FqText as="h2" className="text-base font-semibold text-foreground">
                Progresso diário
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                Execução, hábitos e consistência em um único fluxo.
              </FqText>
            </div>
            <FqTag tone={dailyProgress.status === 'completed' ? 'success' : 'warning'}>
              {dailyProgress.starsEarned} estrelas hoje
            </FqTag>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-border bg-muted/10 p-4">
              <FqText as="p" className="text-sm font-semibold text-foreground">
                Nutrição do dia
              </FqText>
              <FqProgressBar value={nutritionPlan.adherencePct} tone={nutritionPlan.status === 'completed' ? 'success' : 'warning'} />
              <FqText as="p" className="text-xs text-muted-foreground">
                {completedMeals}/{nutritionPlan.meals.length} refeições registradas
              </FqText>
            </div>

            <div className="space-y-2 rounded-2xl border border-border bg-muted/10 p-4">
              <FqText as="p" className="text-sm font-semibold text-foreground">
                Hidratação
              </FqText>
              <FqProgressBar value={waterProgress.completionPct} tone={waterProgress.status === 'completed' ? 'success' : 'primary'} />
              <FqText as="p" className="text-xs text-muted-foreground">
                {waterProgress.consumedMl}/{waterProgress.targetMl} ml • {waterProgress.checkpointsCompleted}/
                {waterProgress.checkpointsTotal} checkpoints
              </FqText>
            </div>
          </div>

          <div className="space-y-3">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Hábitos operacionais
            </FqText>

            <div className="grid gap-3 md:grid-cols-3">
              {habits.map((habit) => {
                const habitValue = Math.round((habit.current / Math.max(habit.target, 1)) * 100)

                return (
                  <div key={habit.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-2">
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {habit.title}
                      </FqText>
                      <FqTag tone={habit.status === 'completed' ? 'success' : 'neutral'}>{habit.streakDays}d</FqTag>
                    </div>
                    <div className="mt-3">
                      <FqProgressBar value={habitValue} tone={habit.status === 'completed' ? 'success' : 'primary'} />
                    </div>
                    <FqText as="p" className="mt-2 text-xs text-muted-foreground">
                      {habit.current}/{habit.target} {habit.unit}
                    </FqText>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </FqCard>
  )
}
