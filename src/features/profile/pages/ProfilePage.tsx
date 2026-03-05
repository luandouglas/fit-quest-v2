import { useEffect, useMemo, useState } from 'react'

import { FqAlert, FqButton, FqCard, FqEmptyState, FqInput, FqSelect, FqSwitch, FqText, useToast } from '@/shared/ui'
import type { ProfileGoal, ProfilePreferences, ThemePreference, UpdateProfilePayload } from '@/shared/services/contracts/profile'
import { useRole } from '@/shared/hooks'

import { useProfileSettings } from '../hooks/useProfileSettings'
import { useStudentRelationships } from '../hooks/useStudentRelationships'

const goalOptions: Array<{ label: string; value: ProfileGoal }> = [
  { label: 'Emagrecimento', value: 'lose_weight' },
  { label: 'Ganho de massa', value: 'gain_muscle' },
  { label: 'Manutencao', value: 'maintenance' },
  { label: 'Performance', value: 'performance' },
]

const measurementOptions: Array<{ label: string; value: ProfilePreferences['measurementSystem'] }> = [
  { label: 'Metrico (kg, km)', value: 'metric' },
  { label: 'Imperial (lb, mi)', value: 'imperial' },
]

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Escuro', value: 'dark' },
]

const gymOptions = [
  'Iron Temple Pinheiros',
  'Santos Dumont Performance',
  'Orla Fitness Hub',
  'Downtown Athletic Club',
  'Arena Norte Gym',
].map((gym) => ({ label: gym, value: gym }))

type ProfileFormState = {
  name: string
  city: string
  neighborhood: string
  gym: string
  goal: ProfileGoal
  waterMlDaily: string
  workoutsPerWeek: string
  notificationsEnabled: boolean
  remindersEnabled: boolean
  measurementSystem: ProfilePreferences['measurementSystem']
  themePreference: ThemePreference
}

function createEmptyForm(): ProfileFormState {
  return {
    name: '',
    city: '',
    neighborhood: '',
    gym: gymOptions[0]?.value ?? '',
    goal: 'maintenance',
    waterMlDaily: '2500',
    workoutsPerWeek: '5',
    notificationsEnabled: true,
    remindersEnabled: true,
    measurementSystem: 'metric',
    themePreference: 'system',
  }
}

export function ProfilePage() {
  const { toast } = useToast()
  const { isStudent } = useRole()
  const { profile, uiState, error, refresh, saveProfile, isSaving } = useProfileSettings()
  const {
    overview: relationshipsOverview,
    uiState: relationshipsUiState,
    error: relationshipsError,
    sendInvite,
    respondInvite,
    isSendingInvite,
    isRespondingInvite,
  } = useStudentRelationships(isStudent)
  const [form, setForm] = useState<ProfileFormState>(createEmptyForm)
  const [inviteCodeOrId, setInviteCodeOrId] = useState('')

  useEffect(() => {
    if (!profile) {
      return
    }

    setForm({
      name: profile.name,
      city: profile.city,
      neighborhood: profile.neighborhood,
      gym: profile.gym,
      goal: profile.goal,
      waterMlDaily: String(profile.goals.waterMlDaily),
      workoutsPerWeek: String(profile.goals.workoutsPerWeek),
      notificationsEnabled: profile.preferences.notificationsEnabled,
      remindersEnabled: profile.preferences.remindersEnabled,
      measurementSystem: profile.preferences.measurementSystem,
      themePreference: profile.preferences.themePreference,
    })
  }, [profile])

  const hasChanges = useMemo(() => {
    if (!profile) {
      return false
    }

    return (
      form.name.trim() !== profile.name ||
      form.city.trim() !== profile.city ||
      form.neighborhood.trim() !== profile.neighborhood ||
      form.gym !== profile.gym ||
      form.goal !== profile.goal ||
      Number(form.waterMlDaily) !== profile.goals.waterMlDaily ||
      Number(form.workoutsPerWeek) !== profile.goals.workoutsPerWeek ||
      form.notificationsEnabled !== profile.preferences.notificationsEnabled ||
      form.remindersEnabled !== profile.preferences.remindersEnabled ||
      form.measurementSystem !== profile.preferences.measurementSystem ||
      form.themePreference !== profile.preferences.themePreference
    )
  }, [form, profile])

  async function handleSave() {
    if (!profile) {
      return
    }

    const name = form.name.trim()
    const city = form.city.trim()
    const neighborhood = form.neighborhood.trim()
    const gym = form.gym.trim()
    const waterMlDaily = Number(form.waterMlDaily)
    const workoutsPerWeek = Number(form.workoutsPerWeek)

    if (!name) {
      toast({
        title: 'Nome obrigatorio',
        description: 'Informe um nome para salvar o perfil.',
        tone: 'warning',
      })
      return
    }

    if (!Number.isFinite(waterMlDaily) || waterMlDaily < 500) {
      toast({
        title: 'Meta de agua invalida',
        description: 'Use um valor maior ou igual a 500 ml.',
        tone: 'warning',
      })
      return
    }

    if (!Number.isFinite(workoutsPerWeek) || workoutsPerWeek < 1) {
      toast({
        title: 'Meta de treinos invalida',
        description: 'Use um valor maior ou igual a 1 treino/semana.',
        tone: 'warning',
      })
      return
    }

    if (!city || !neighborhood || !gym) {
      toast({
        title: 'Localizacao incompleta',
        description: 'Preencha cidade, bairro e academia.',
        tone: 'warning',
      })
      return
    }

    const payload: UpdateProfilePayload = {
      name,
      city,
      neighborhood,
      gym,
      goal: form.goal,
      goals: {
        waterMlDaily,
        workoutsPerWeek,
      },
      preferences: {
        notificationsEnabled: form.notificationsEnabled,
        remindersEnabled: form.remindersEnabled,
        measurementSystem: form.measurementSystem,
        themePreference: form.themePreference,
      },
    }

    try {
      await saveProfile(payload)
      toast({
        title: 'Perfil atualizado',
        description: 'As alteracoes ja foram refletidas nas demais abas.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao salvar perfil',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleSendInvite() {
    const codeOrId = inviteCodeOrId.trim()

    if (!codeOrId) {
      toast({
        title: 'Codigo ou ID obrigatorio',
        description: 'Informe o codigo ou ID do profissional.',
        tone: 'warning',
      })
      return
    }

    try {
      await sendInvite({ codeOrId })
      setInviteCodeOrId('')
      toast({
        title: 'Convite registrado',
        description: 'Agora voce pode aceitar ou rejeitar na lista de convites.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao registrar convite',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleRespondInvite(inviteId: string, action: 'accept' | 'reject') {
    try {
      await respondInvite({ inviteId, action })
      toast({
        title: action === 'accept' ? 'Convite aceito' : 'Convite rejeitado',
        description: action === 'accept' ? 'Vinculo atualizado com sucesso.' : 'Convite removido da pendencia.',
        tone: action === 'accept' ? 'success' : 'neutral',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao responder convite',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell">
        <FqCard className="border-border bg-card">
          <FqText variant="title" as="h1" className="text-3xl">
            Perfil
          </FqText>
          <FqText className="mt-1 text-muted-foreground">Carregando configuracoes do aluno...</FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell">
        <FqAlert tone="danger" title="Falha ao carregar perfil">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar os dados do perfil.'}
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => void refresh()}>
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !profile) {
    return (
      <section className="fq-page-shell">
        <FqEmptyState icon="user" title="Perfil indisponivel" description="Nao foi possivel recuperar seus dados agora." />
      </section>
    )
  }

  return (
    <section className="fq-page-shell">
      <header className="fq-page-header">
        <FqText variant="title" as="h1" className="text-3xl">
          Perfil
        </FqText>
        <FqText className="mt-1 text-muted-foreground">Edite seus dados, metas e preferencias.</FqText>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <FqCard className="border-border bg-card" title="Dados pessoais" subtitle="Nome, objetivo e contexto de ranking.">
          <div className="space-y-3">
            <FqInput
              label="Nome"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <FqInput
              label="Cidade"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              placeholder="Ex.: Sao Paulo"
            />
            <FqInput
              label="Bairro"
              value={form.neighborhood}
              onChange={(event) => setForm((current) => ({ ...current, neighborhood: event.target.value }))}
              placeholder="Ex.: Pinheiros"
            />
            <FqSelect
              label="Academia"
              value={form.gym}
              onChange={(event) => setForm((current) => ({ ...current, gym: event.target.value }))}
              options={gymOptions}
            />
            <FqSelect
              label="Objetivo"
              value={form.goal}
              onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value as ProfileGoal }))}
              options={goalOptions}
            />
          </div>
        </FqCard>

        <FqCard className="border-border bg-card" title="Metas" subtitle="Usadas por Nutricao, Inicio e Progresso.">
          <div className="space-y-3">
            <FqInput
              label="Agua por dia (ml)"
              type="number"
              min={500}
              step={50}
              value={form.waterMlDaily}
              onChange={(event) => setForm((current) => ({ ...current, waterMlDaily: event.target.value }))}
            />
            <FqInput
              label="Treinos por semana"
              type="number"
              min={1}
              max={14}
              step={1}
              value={form.workoutsPerWeek}
              onChange={(event) => setForm((current) => ({ ...current, workoutsPerWeek: event.target.value }))}
            />
          </div>
        </FqCard>

        <FqCard className="border-border bg-card" title="Preferencias" subtitle="Controle de lembretes e unidade de medidas.">
          <div className="space-y-3">
            <FqSelect
              label="Sistema de medidas"
              value={form.measurementSystem}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  measurementSystem: event.target.value as ProfilePreferences['measurementSystem'],
                }))
              }
              options={measurementOptions}
            />
            <div className="flex flex-col gap-2">
              <FqSwitch
                label="Notificacoes"
                checked={form.notificationsEnabled}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, notificationsEnabled: checked }))}
              />
              <FqSwitch
                label="Lembretes de rotina"
                checked={form.remindersEnabled}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, remindersEnabled: checked }))}
              />
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card" title="Aparencia" subtitle="Tema aplicado em todo o app.">
          <div className="space-y-3">
            <FqSelect
              label="Preferencia de tema"
              value={form.themePreference}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  themePreference: event.target.value as ThemePreference,
                }))
              }
              options={themeOptions}
            />
          </div>
        </FqCard>
      </div>

      {isStudent ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <FqCard className="border-border bg-card" title="Meu Personal" subtitle="Vinculo profissional ativo.">
            {relationshipsUiState === 'error' ? (
              <FqAlert tone="danger" title="Falha ao carregar vinculos">
                {relationshipsError instanceof Error ? relationshipsError.message : 'Tente novamente mais tarde.'}
              </FqAlert>
            ) : (
              <div className="space-y-2">
                <FqText as="p" className="text-sm text-muted-foreground">
                  {relationshipsOverview?.personal
                    ? `${relationshipsOverview.personal.name} (${relationshipsOverview.personal.code})`
                    : 'Nenhum personal vinculado'}
                </FqText>
              </div>
            )}
          </FqCard>

          <FqCard className="border-border bg-card" title="Meu Nutricionista" subtitle="Vinculo profissional ativo.">
            {relationshipsUiState === 'error' ? (
              <FqAlert tone="danger" title="Falha ao carregar vinculos">
                {relationshipsError instanceof Error ? relationshipsError.message : 'Tente novamente mais tarde.'}
              </FqAlert>
            ) : (
              <div className="space-y-2">
                <FqText as="p" className="text-sm text-muted-foreground">
                  {relationshipsOverview?.nutritionist
                    ? `${relationshipsOverview.nutritionist.name} (${relationshipsOverview.nutritionist.code})`
                    : 'Nenhum nutricionista vinculado'}
                </FqText>
              </div>
            )}
          </FqCard>

          <FqCard className="border-border bg-card lg:col-span-2" title="Vincular profissional" subtitle="Convite por codigo ou ID do profissional.">
            <div className="space-y-3">
              <FqInput
                label="Codigo ou ID"
                value={inviteCodeOrId}
                onChange={(event) => setInviteCodeOrId(event.target.value)}
                placeholder="Ex.: PT-PERSONA1, personal-1, NT-NUTRITIO"
              />
              <FqButton onClick={() => void handleSendInvite()} isLoading={isSendingInvite}>
                Buscar convite
              </FqButton>
            </div>
          </FqCard>

          <FqCard className="border-border bg-card lg:col-span-2" title="Convites pendentes" subtitle="Aceite ou rejeite para atualizar permissoes automaticamente.">
            {relationshipsUiState === 'loading' ? (
              <FqText as="p" className="text-sm text-muted-foreground">Carregando convites...</FqText>
            ) : relationshipsOverview?.pendingInvites.length ? (
              <div className="space-y-2">
                {relationshipsOverview.pendingInvites.map((invite) => (
                  <div key={invite.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      {invite.professionalName} ({invite.professionalRole})
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      Codigo: {invite.professionalCode}
                    </FqText>
                    <div className="mt-2 flex gap-2">
                      <FqButton size="sm" onClick={() => void handleRespondInvite(invite.id, 'accept')} isLoading={isRespondingInvite}>
                        Aceitar
                      </FqButton>
                      <FqButton size="sm" variant="outline" tone="warning" onClick={() => void handleRespondInvite(invite.id, 'reject')} isLoading={isRespondingInvite}>
                        Rejeitar
                      </FqButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <FqText as="p" className="text-sm text-muted-foreground">Sem convites pendentes.</FqText>
            )}
          </FqCard>
        </div>
      ) : null}

      <div className="flex justify-end">
        <FqButton onClick={() => void handleSave()} isLoading={isSaving} isDisabled={!hasChanges}>
          Salvar alteracoes
        </FqButton>
      </div>
    </section>
  )
}
