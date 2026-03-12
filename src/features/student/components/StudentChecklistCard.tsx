import { FqBadge, FqCard, FqProgressBar, FqText } from '@/shared/ui'

import type { StudentHomeViewModel } from '../hooks/useStudentHomeViewModel'

type StudentChecklistCardProps = {
  checklist: StudentHomeViewModel['checklist']
}

function getStatusTone(status: StudentHomeViewModel['checklist'][number]['status']) {
  if (status === 'completed') {
    return 'success' as const
  }

  if (status === 'in_progress') {
    return 'primary' as const
  }

  return 'warning' as const
}

function getProgressValue(status: StudentHomeViewModel['checklist'][number]['status']) {
  if (status === 'completed') {
    return 100
  }

  if (status === 'in_progress') {
    return 55
  }

  return 15
}

export function StudentChecklistCard({ checklist }: StudentChecklistCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div>
          <FqText as="h2" className="text-base font-semibold text-foreground">
            Checklist do dia
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            O que já foi concluído e o que ainda precisa ser finalizado hoje.
          </FqText>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {item.title}
                  </FqText>
                  <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </FqText>
                </div>
                <FqBadge tone={getStatusTone(item.status)}>
                  {item.status === 'completed' ? 'Concluído' : item.status === 'in_progress' ? 'Em progresso' : 'Pendente'}
                </FqBadge>
              </div>

              <div className="mt-3">
                <FqProgressBar value={getProgressValue(item.status)} tone={getStatusTone(item.status)} />
              </div>

              <FqText as="p" className="mt-2 text-xs text-muted-foreground">
                {item.progressLabel}
              </FqText>
            </div>
          ))}
        </div>
      </div>
    </FqCard>
  )
}
