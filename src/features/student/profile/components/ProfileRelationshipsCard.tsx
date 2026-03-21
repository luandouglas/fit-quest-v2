import type { StudentRelationshipsOverview } from '@/shared/services/contracts/relationship'
import { FqAlert, FqButton, FqCard, FqInput, FqTag, FqText } from '@/shared/ui'

type ProfileRelationshipsCardProps = {
  overview: StudentRelationshipsOverview | null
  uiState: 'hidden' | 'loading' | 'ready' | 'empty' | 'error'
  error: unknown
  inviteCodeOrId: string
  onInviteCodeChange: (value: string) => void
  onSendInvite: () => void
  onRespondInvite: (inviteId: string, action: 'accept' | 'reject') => void
  isSendingInvite: boolean
  isRespondingInvite: boolean
}

function LinkedProfessionalCard({
  title,
  value,
}: {
  title: string
  value: StudentRelationshipsOverview['personal']
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <FqText as="p" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </FqText>
      <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
        {value ? value.name : 'Nao vinculado'}
      </FqText>
      <FqText as="p" className="mt-1 text-xs text-muted-foreground">
        {value ? `Codigo ${value.code}` : 'Use convite por codigo ou ID'}
      </FqText>
    </div>
  )
}

export function ProfileRelationshipsCard({
  overview,
  uiState,
  error,
  inviteCodeOrId,
  onInviteCodeChange,
  onSendInvite,
  onRespondInvite,
  isSendingInvite,
  isRespondingInvite,
}: ProfileRelationshipsCardProps) {
  return (
    <FqCard
      title="Profissionais vinculados"
      subtitle="O perfil tambem reforca o time que acompanha a jornada do aluno."
      className="border-border bg-card"
    >
      {uiState === 'error' ? (
        <FqAlert tone="danger" title="Falha ao carregar vinculos">
          {error instanceof Error ? error.message : 'Tente novamente mais tarde.'}
        </FqAlert>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <LinkedProfessionalCard title="Personal vinculado" value={overview?.personal ?? null} />
            <LinkedProfessionalCard title="Nutricionista vinculado" value={overview?.nutritionist ?? null} />
          </div>

          <div className="rounded-xl border border-border/70 bg-background/70 p-4">
            <FqInput
              label="Codigo ou ID do profissional"
              value={inviteCodeOrId}
              onChange={(event) => onInviteCodeChange(event.target.value)}
              placeholder="Ex.: PT-PERSONA1 ou NT-NUTRITIO"
            />
            <div className="mt-3 flex justify-end">
              <FqButton onClick={onSendInvite} isLoading={isSendingInvite}>
                Buscar convite
              </FqButton>
            </div>
          </div>

          <div className="space-y-2">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Convites pendentes
            </FqText>
            {uiState === 'loading' ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Carregando convites...
              </FqText>
            ) : overview?.pendingInvites.length ? (
              overview.pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-xl border border-border/70 bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {invite.professionalName}
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        {invite.professionalRole} | {invite.professionalCode}
                      </FqText>
                    </div>
                    <FqTag tone="secondary">Pendente</FqTag>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <FqButton size="sm" onClick={() => onRespondInvite(invite.id, 'accept')} isLoading={isRespondingInvite}>
                      Aceitar
                    </FqButton>
                    <FqButton
                      size="sm"
                      variant="outline"
                      tone="warning"
                      onClick={() => onRespondInvite(invite.id, 'reject')}
                      isLoading={isRespondingInvite}
                    >
                      Rejeitar
                    </FqButton>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-4">
                <FqText as="p" className="text-sm text-muted-foreground">
                  Sem convites pendentes.
                </FqText>
              </div>
            )}
          </div>
        </div>
      )}
    </FqCard>
  )
}
