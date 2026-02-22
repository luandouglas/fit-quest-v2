import { useAuth } from '@/shared/hooks'
import { FqText, StatusCard } from '@/shared/ui'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <section className="space-y-5">
      <header>
        <FqText variant="title" as="h1" className="text-3xl">
          Perfil
        </FqText>
        <FqText className="mt-1 text-zinc-500">Resumo da sua conta e dados do atleta.</FqText>
      </header>

      <StatusCard title="Atleta" tone="neutral">
        <p>
          Nome atual: <strong>{user?.name ?? 'Nao definido'}</strong>
        </p>
      </StatusCard>

      <StatusCard title="Conta" tone="warning">
        Logout limpa estado local (localStorage) para facilitar testes de fluxo.
      </StatusCard>
    </section>
  )
}
