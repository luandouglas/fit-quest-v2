import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { useRole } from '@/shared/hooks'
import {
  useToast,
} from '@/shared/ui'
import type { ProfileGoal, ProfilePreferences, ThemePreference, UpdateProfilePayload } from '@/shared/services/contracts/profile'

import { useNotificationsCenter } from '@/features/student/notifications'
import { StudentModuleState, StudentPageHeader } from '@/features/student/components'

import {
  ProfileAccountCard,
  ProfileAchievementsCard,
  ProfileBasicsCard,
  ProfileHeroCard,
  ProfileNotificationsCard,
  ProfilePageSkeleton,
  ProfilePreferencesCard,
  ProfileReadOnlyBodyCard,
  ProfileRelationshipsCard,
} from '../components'
import { useProfileHubViewModel } from '../hooks/useProfileHubViewModel'

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
    gym: '',
    goal: 'maintenance',
    waterMlDaily: '2500',
    workoutsPerWeek: '5',
    notificationsEnabled: true,
    remindersEnabled: true,
    measurementSystem: 'metric',
    themePreference: 'system',
  }
}

function getProfilePreferencesDefaults() {
  return {
    notificationsEnabled: true,
    remindersEnabled: true,
    measurementSystem: 'metric' as const,
    themePreference: 'system' as const,
  }
}

export function ProfilePage() {
  const history = useHistory()
  const location = useLocation()
  const { toast } = useToast()
  const { isStudent, role } = useRole()
  const notificationsCenter = useNotificationsCenter()
  const {
    uiState,
    data,
    error,
    refresh,
    saveProfile,
    isSaving,
    sendInvite,
    respondInvite,
    isSendingInvite,
    isRespondingInvite,
    relationshipsUiState,
  } = useProfileHubViewModel(isStudent, isStudent)
  const [form, setForm] = useState<ProfileFormState>(createEmptyForm)
  const [inviteCodeOrId, setInviteCodeOrId] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const inviteCode = params.get('invite')
    if (inviteCode) {
      setInviteCodeOrId(inviteCode)
      params.delete('invite')
      const nextSearch = params.toString()
      history.replace({
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      })
    }
  }, [history, location.pathname, location.search])

  useEffect(() => {
    if (!data) {
      return
    }

    const preferences = {
      ...getProfilePreferencesDefaults(),
      ...(data.profile.preferences ?? {}),
    }

    setForm({
      name: data.profile.name,
      city: data.profile.city,
      neighborhood: data.profile.neighborhood,
      gym: data.profile.gym,
      goal: data.profile.goal,
      waterMlDaily: String(data.profile.goals.waterMlDaily),
      workoutsPerWeek: String(data.profile.goals.workoutsPerWeek),
      notificationsEnabled: preferences.notificationsEnabled,
      remindersEnabled: preferences.remindersEnabled,
      measurementSystem: preferences.measurementSystem,
      themePreference: preferences.themePreference,
    })
  }, [data])

  const hasChanges = useMemo(() => {
    if (!data) {
      return false
    }

    const preferences = {
      ...getProfilePreferencesDefaults(),
      ...(data.profile.preferences ?? {}),
    }

    return (
      form.name.trim() !== data.profile.name ||
      form.city.trim() !== data.profile.city ||
      form.neighborhood.trim() !== data.profile.neighborhood ||
      form.gym !== data.profile.gym ||
      form.goal !== data.profile.goal ||
      Number(form.waterMlDaily) !== data.profile.goals.waterMlDaily ||
      Number(form.workoutsPerWeek) !== data.profile.goals.workoutsPerWeek ||
      form.notificationsEnabled !== preferences.notificationsEnabled ||
      form.remindersEnabled !== preferences.remindersEnabled ||
      form.measurementSystem !== preferences.measurementSystem ||
      form.themePreference !== preferences.themePreference
    )
  }, [data, form])

  async function handleSave() {
    if (!data) {
      return
    }

    const name = form.name.trim()
    const city = form.city.trim()
    const neighborhood = form.neighborhood.trim()
    const gym = form.gym.trim()
    const waterMlDaily = Number(form.waterMlDaily)
    const workoutsPerWeek = Number(form.workoutsPerWeek)

    if (!name || !city || !neighborhood || !gym) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha nome, cidade, bairro e academia.',
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
        description: 'Seu hub pessoal foi atualizado com sucesso.',
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
    return <ProfilePageSkeleton />
  }

  if (uiState === 'error') {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao carregar perfil"
        description={error instanceof Error ? error.message : 'Nao foi possivel carregar os dados do perfil.'}
        actionLabel="Tentar novamente"
        onAction={() => void refresh()}
        shellClassName="fq-page-shell"
      />
    )
  }

  if (uiState === 'empty' || !data) {
    return (
      <StudentModuleState
        state="empty"
        icon="user"
        title="Perfil indisponivel por enquanto"
        description="Assim que seus dados pessoais e preferencias forem carregados, este hub volta a centralizar identidade, ajustes e conquistas."
        actionLabel="Voltar para Home"
        onAction={() => history.push('/tabs/student')}
        shellClassName="fq-page-shell"
      />
    )
  }

  return (
    <section className="fq-page-shell">
      <StudentPageHeader
        eyebrow="Hub pessoal"
        title="Perfil"
        description="Seu hub pessoal com identidade, configurações, profissionais, sinais do corpo e conquistas da jornada."
        tags={
          isStudent
            ? [
                {
                  id: 'goal-profile',
                  label: data.hero.goalLabel,
                  tone: 'primary',
                  icon: 'target',
                },
                {
                  id: 'streak-profile',
                  label: `${data.hero.streakDays} dias de streak`,
                  tone: 'warning',
                  icon: 'flame',
                },
              ]
            : [
                {
                  id: 'goal-profile',
                  label: data.hero.goalLabel,
                  tone: 'primary',
                  icon: 'target',
                },
                {
                  id: 'role-profile',
                  label: role === 'PERSONAL' ? 'Personal trainer' : 'Nutricionista',
                  tone: 'secondary',
                  icon: role === 'PERSONAL' ? 'activity' : 'utensils',
                },
              ]
        }
      />

      <ProfileHeroCard
        name={data.hero.name}
        avatarUrl={data.hero.avatarUrl}
        goalLabel={data.hero.goalLabel}
        headline={data.hero.headline}
        level={data.hero.level}
        stars={data.hero.stars}
        streakDays={data.hero.streakDays}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ProfileBasicsCard
          name={form.name}
          city={form.city}
          neighborhood={form.neighborhood}
          gym={form.gym}
          goal={form.goal}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        />
        <ProfilePreferencesCard
          waterMlDaily={form.waterMlDaily}
          workoutsPerWeek={form.workoutsPerWeek}
          notificationsEnabled={form.notificationsEnabled}
          remindersEnabled={form.remindersEnabled}
          measurementSystem={form.measurementSystem}
          themePreference={form.themePreference}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onSave={() => void handleSave()}
          isSaving={isSaving}
          isDisabled={!hasChanges}
        />
      </div>

      {isStudent ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <ProfileRelationshipsCard
            overview={data.relationships ?? null}
            uiState={relationshipsUiState}
            error={error}
            inviteCodeOrId={inviteCodeOrId}
            onInviteCodeChange={setInviteCodeOrId}
            onSendInvite={() => void handleSendInvite()}
            onRespondInvite={(inviteId, action) => void handleRespondInvite(inviteId, action)}
            isSendingInvite={isSendingInvite}
            isRespondingInvite={isRespondingInvite}
          />
          <div className="space-y-4">
            <ProfileNotificationsCard
              headline={notificationsCenter.viewModel.profileDigest.headline}
              supportLabel={notificationsCenter.viewModel.profileDigest.supportLabel}
              unreadCount={notificationsCenter.viewModel.profileDigest.unreadCount}
              reminderCount={notificationsCenter.viewModel.profileDigest.reminderCount}
              celebrationCount={notificationsCenter.viewModel.profileDigest.celebrationCount}
              pushState={notificationsCenter.pushState}
              onOpenInbox={() => history.push('/tabs/notifications')}
            />
            <ProfileAccountCard
              memberSinceLabel={data.account.memberSinceLabel}
              cityLabel={data.account.cityLabel}
              gym={data.account.gym}
              supportCount={data.account.supportCount}
            />
          </div>
        </div>
      ) : null}

      {isStudent && data.progress ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ProfileReadOnlyBodyCard progress={data.progress} />
          <ProfileAchievementsCard achievements={data.achievements} />
        </div>
      ) : (
        <ProfileAccountCard
          memberSinceLabel={data.account.memberSinceLabel}
          cityLabel={data.account.cityLabel}
          gym={data.account.gym}
          supportCount={data.account.supportCount}
        />
      )}
    </section>
  )
}
