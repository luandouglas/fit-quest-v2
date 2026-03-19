import { FqCard } from '@/shared/ui/layout'
import { FqBadge, FqText } from '@/shared/ui/primitives'
import type { FqBaseProps } from '@/shared/ui/types'

type AchievementCardProps = FqBaseProps & {
  title: string
  description: string
  unlocked?: boolean
}

export function AchievementCard({
  title,
  description,
  unlocked = false,
  className,
  testId,
}: AchievementCardProps) {
  return (
    <FqCard
      title={title}
      subtitle={unlocked ? 'Conquista desbloqueada' : 'Conquista bloqueada'}
      className={className}
      testId={testId}
      footer={<FqBadge tone={unlocked ? 'success' : 'neutral'}>{unlocked ? 'Unlocked' : 'Locked'}</FqBadge>}
    >
      <FqText>{description}</FqText>
    </FqCard>
  )
}
