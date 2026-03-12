import { FqCard, FqInput, FqSelect } from '@/shared/ui'
import type { ProfileGoal } from '@/shared/services/contracts/profile'

const goalOptions: Array<{ label: string; value: ProfileGoal }> = [
  { label: 'Emagrecimento', value: 'lose_weight' },
  { label: 'Ganho de massa', value: 'gain_muscle' },
  { label: 'Manutencao', value: 'maintenance' },
  { label: 'Performance', value: 'performance' },
]

const gymOptions = [
  'Iron Temple Pinheiros',
  'Santos Dumont Performance',
  'Orla Fitness Hub',
  'Downtown Athletic Club',
  'Arena Norte Gym',
].map((gym) => ({ label: gym, value: gym }))

type ProfileBasicsCardProps = {
  name: string
  city: string
  neighborhood: string
  gym: string
  goal: ProfileGoal
  onChange: (patch: Partial<{
    name: string
    city: string
    neighborhood: string
    gym: string
    goal: ProfileGoal
  }>) => void
}

export function ProfileBasicsCard({
  name,
  city,
  neighborhood,
  gym,
  goal,
  onChange,
}: ProfileBasicsCardProps) {
  return (
    <FqCard
      title="Identidade e contexto"
      subtitle="Dados simples que personalizam o app sem transformar o perfil em um formulario frio."
      className="border-border bg-card"
    >
      <div className="space-y-3">
        <FqInput label="Nome" value={name} onChange={(event) => onChange({ name: event.target.value })} />
        <FqInput label="Cidade" value={city} onChange={(event) => onChange({ city: event.target.value })} />
        <FqInput
          label="Bairro"
          value={neighborhood}
          onChange={(event) => onChange({ neighborhood: event.target.value })}
        />
        <FqSelect label="Academia" value={gym} onChange={(event) => onChange({ gym: event.target.value })} options={gymOptions} />
        <FqSelect
          label="Objetivo"
          value={goal}
          onChange={(event) => onChange({ goal: event.target.value as ProfileGoal })}
          options={goalOptions}
        />
      </div>
    </FqCard>
  )
}
