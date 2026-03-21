import { FqCard, FqTag, FqText } from '@/shared/ui'

type ProfileAccountCardProps = {
  memberSinceLabel: string
  cityLabel: string
  gym: string
  supportCount: number
}

export function ProfileAccountCard({
  memberSinceLabel,
  cityLabel,
  gym,
  supportCount,
}: ProfileAccountCardProps) {
  return (
    <FqCard
      title="Historico da conta"
      subtitle="Resumo leve para reforcar pertencimento e contexto dentro da jornada."
      className="border-border bg-card"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <FqTag tone="secondary">Desde {memberSinceLabel}</FqTag>
          <FqTag tone="success">{supportCount} profissional(is) ligado(s)</FqTag>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <FqText as="p" className="text-xs text-muted-foreground">
            Cidade e bairro
          </FqText>
          <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
            {cityLabel}
          </FqText>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <FqText as="p" className="text-xs text-muted-foreground">
            Academia atual
          </FqText>
          <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
            {gym}
          </FqText>
        </div>
      </div>
    </FqCard>
  )
}
