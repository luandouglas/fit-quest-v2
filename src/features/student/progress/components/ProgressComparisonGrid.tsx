import type { ProgressComparisonCardItem } from '@/features/student/progress/hooks/useProgressViewModel'
import { FqCard, FqTag, FqText } from '@/shared/ui'

type ProgressComparisonGridProps = {
  items: ProgressComparisonCardItem[]
}

export function ProgressComparisonGrid({ items }: ProgressComparisonGridProps) {
  return (
    <FqCard
      title="Comparativos de evolucao"
      subtitle="Semana contra semana e mes contra mes, sem poluir a leitura."
      className="border-border bg-card"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <FqText as="p" className="text-sm font-semibold text-foreground">
                {item.title}
              </FqText>
              <FqTag tone={item.tone}>{item.deltaLabel}</FqTag>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <FqText as="p" className="text-xs text-muted-foreground">
                  Agora
                </FqText>
                <FqText as="p" className="text-lg font-semibold text-foreground">
                  {item.currentLabel}
                </FqText>
              </div>
              <div className="text-right">
                <FqText as="p" className="text-xs text-muted-foreground">
                  Periodo anterior
                </FqText>
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {item.previousLabel}
                </FqText>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FqCard>
  )
}
