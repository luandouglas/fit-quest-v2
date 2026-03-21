import { FqCard, FqIcon, FqTag } from '@/shared/ui'

export type NutritionFeedbackItem = {
  id: string
  title: string
  description: string
  tone: 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'
  icon: 'star' | 'utensils' | 'flask' | 'target' | 'clock'
}

type NutritionFeedbackCardProps = {
  items: NutritionFeedbackItem[]
}

export function NutritionFeedbackCard({ items }: NutritionFeedbackCardProps) {
  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div>
          <h2 className="text-card-title font-semibold text-foreground">Feedback acionavel</h2>
          <p className="text-sm text-muted-foreground">O que ainda move seu dia alimentar agora.</p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border/80 bg-background/80 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-foreground">
                    <FqIcon name={item.icon} size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <FqTag tone={item.tone}>{item.tone === 'success' ? 'No alvo' : 'Hoje'}</FqTag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FqCard>
  )
}
