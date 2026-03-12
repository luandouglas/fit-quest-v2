import { FqAvatar, FqButton, FqLevelBadge, FqTag, FqText } from '@/shared/ui'
import type { DailyProgress, StudentProfile } from '@/shared/services/contracts/student'

type StudentOverviewHeaderProps = {
  profile: StudentProfile
  dailyProgress: DailyProgress
  selectedDate: string
  isTodaySelected: boolean
  onPreviousDay: () => void
  onNextDay: () => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function StudentOverviewHeader({
  profile,
  dailyProgress,
  selectedDate,
  isTodaySelected,
  onPreviousDay,
  onNextDay,
}: StudentOverviewHeaderProps) {
  return (
    <header className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <FqAvatar name={profile.fullName} src={profile.avatarUrl} size="lg" />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <FqText as="h1" variant="title" className="text-xl">
                Olá, {profile.firstName}
              </FqText>
              <FqLevelBadge level={Math.max(dailyProgress.streakDays, 1)} label="Streak" />
            </div>

            <FqText as="p" className="text-sm text-muted-foreground">
              {profile.headline}
            </FqText>

            <div className="flex flex-wrap items-center gap-2">
              <FqTag tone="secondary">{profile.primaryGoal}</FqTag>
              <FqTag tone={dailyProgress.status === 'completed' ? 'success' : 'warning'} leftIcon="flame">
                {dailyProgress.streakDays} dias em sequência
              </FqTag>
              <FqTag tone="neutral">
                {profile.city} • {profile.gym}
              </FqTag>
            </div>
          </div>
        </div>

        <div className="space-y-3 lg:text-right">
          <div>
            <FqText as="p" className="text-sm font-semibold text-foreground">
              {formatDate(selectedDate)}
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              {dailyProgress.focusLabel}
            </FqText>
          </div>

          <div className="flex items-center gap-2 lg:justify-end">
            <FqButton variant="outline" tone="neutral" size="sm" leftIcon="chevronLeft" onClick={onPreviousDay}>
              Dia anterior
            </FqButton>
            <FqButton
              variant="outline"
              tone="neutral"
              size="sm"
              rightIcon="chevronRight"
              onClick={onNextDay}
              isDisabled={isTodaySelected}
            >
              {isTodaySelected ? 'Hoje' : 'Próximo dia'}
            </FqButton>
          </div>
        </div>
      </div>
    </header>
  )
}
