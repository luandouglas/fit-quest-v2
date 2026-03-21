import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'

import { useToast, FqButton, FqIcon, FqProgressBar, FqProgressRing } from '@/shared/ui'
import type { IconName } from '@/shared/ui'

import { studentRoutes } from '@/features/student/routes'

import { StudentHomeSkeleton, StudentModuleState } from '../components'
import { useStudentHub } from '../hooks/useStudentHub'
import { useStudentHomeViewModel } from '../hooks/useStudentHomeViewModel'
import { StudentWorkspaceProvider, useStudentWorkspace } from '../store/StudentWorkspaceContext'

/* ── helpers ────────────────────────────────────────────────── */

function formatSelectedDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

type NextAction = {
  key: 'workout' | 'meal' | 'water' | 'cardio' | 'rewards'
  label: string
  icon: IconName
  route: string
}

/* ── page content ───────────────────────────────────────────── */

function StudentHubPageContent() {
  const history = useHistory()
  const { toast } = useToast()
  const {
    selectedDate,
    goToPreviousDay,
    goToNextDay,
    isTodaySelected,
  } = useStudentWorkspace()
  const {
    dashboard,
    uiState,
    error,
    refresh,
    registerMeal,
    registerWater,
    isRegisterMealPending,
    isRegisterWaterPending,
  } = useStudentHub(selectedDate)
  const viewModel = useStudentHomeViewModel(dashboard)

  /* ── derived data ──────────────────────────────────────── */

  const checklist = useMemo(() => {
    if (!dashboard || !viewModel) return []
    return viewModel.checklist.map((item) => {
      const iconMap: Record<string, IconName> = {
        'checklist-workout': 'dumbbell',
        'checklist-nutrition': 'utensils',
        'checklist-water': 'flask',
        'checklist-cardio': 'activity',
      }
      const pctMap: Record<string, number> = {
        completed: 100,
        in_progress: 55,
        pending: 10,
      }
      return {
        ...item,
        icon: iconMap[item.id] ?? ('target' as IconName),
        pct: pctMap[item.status] ?? 10,
      }
    })
  }, [dashboard, viewModel])

  const allDone = checklist.length > 0 && checklist.every((c) => c.status === 'completed')

  const nextAction = useMemo<NextAction | null>(() => {
    if (!dashboard) return null
    const w = dashboard.todayWorkout
    if (w && (w.status === 'scheduled' || w.status === 'in_progress')) {
      return { key: 'workout', label: w.status === 'in_progress' ? 'Retomar treino' : 'Iniciar treino', icon: 'play', route: studentRoutes.workoutSession }
    }
    const pendingMeal = dashboard.nutritionPlan.meals.find((m) => m.status === 'pending')
    if (pendingMeal) {
      return { key: 'meal', label: `Registrar ${pendingMeal.name.toLowerCase()}`, icon: 'check', route: studentRoutes.nutrition }
    }
    if (dashboard.waterProgress.remainingMl > 0) {
      return { key: 'water', label: 'Adicionar agua', icon: 'plus', route: studentRoutes.nutrition }
    }
    const c = dashboard.cardioSession
    if (c && c.status !== 'completed') {
      return { key: 'cardio', label: 'Registrar cardio', icon: 'activity', route: studentRoutes.cardio }
    }
    return { key: 'rewards', label: 'Ver recompensas do dia', icon: 'trophy', route: studentRoutes.rewards }
  }, [dashboard])

  /* ── actions ────────────────────────────────────────────── */

  async function handleRegisterMeal() {
    try {
      const response = await registerMeal()
      toast({
        title: response.mealId ? 'Refeicao registrada' : 'Nenhuma refeicao pendente',
        description: response.mealId
          ? 'O plano alimentar foi atualizado com sucesso.'
          : 'Todas as refeicoes planejadas deste dia ja foram executadas.',
        tone: response.mealId ? 'success' : 'warning',
      })
    } catch (requestError) {
      toast({ title: 'Falha ao registrar refeicao', description: requestError instanceof Error ? requestError.message : 'Tente novamente.', tone: 'danger' })
    }
  }

  async function handleRegisterWater(amountMl = 300) {
    if (!dashboard) return
    try {
      const prev = dashboard.waterProgress
      const response = await registerWater(amountMl)
      const next = response.totalWaterMl
      const reachedGoal = next >= prev.targetMl
      toast({
        title: reachedGoal ? 'Meta de agua batida' : 'Hidratacao atualizada',
        description: reachedGoal
          ? `${next} ml acumulados. Progresso diario e gamificacao reforcados.`
          : `${next} ml acumulados no dia selecionado.`,
        tone: reachedGoal ? 'success' : 'secondary',
      })
    } catch (requestError) {
      toast({ title: 'Falha ao registrar agua', description: requestError instanceof Error ? requestError.message : 'Tente novamente.', tone: 'danger' })
    }
  }

  function handleNextAction() {
    if (!nextAction) return
    if (nextAction.key === 'meal') { void handleRegisterMeal(); return }
    if (nextAction.key === 'water') { void handleRegisterWater(); return }
    history.push(nextAction.route)
  }

  /* ── loading / error / empty ────────────────────────────── */

  if (uiState === 'loading') {
    return <StudentHomeSkeleton />
  }

  if (uiState === 'error') {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao carregar sua rotina"
        description={error instanceof Error ? error.message : 'Nao foi possivel montar o hub diario agora.'}
        actionLabel="Tentar novamente"
        onAction={() => void refresh()}
      />
    )
  }

  if (uiState === 'empty' || !dashboard || !viewModel) {
    return (
      <StudentModuleState
        state="empty"
        icon="user"
        title="Sua rotina ainda esta vazia"
        description="Assim que treino, nutricao, agua ou cardio entrarem em movimento, a Home vira o centro do seu dia."
        actionLabel="Abrir perfil"
        onAction={() => history.push(studentRoutes.profile)}
      />
    )
  }

  /* ── render ─────────────────────────────────────────────── */

  return (
    <section className="fq-page-shell-narrow">
      {/* ─── 1. Greeting + overall ring ───────────────────── */}
      <div className="fq-soft-reveal flex flex-col items-center gap-1.5 pt-2 text-center sm:flex-row sm:gap-6 sm:text-left">
        <FqProgressRing
          value={dashboard.dailyProgress.completionPct}
          size={96}
          strokeWidth={8}
          tone={allDone ? 'success' : 'primary'}
          label="do dia"
        />
        <div className="mt-2 sm:mt-0">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            {viewModel.salutation}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{dashboard.dailyProgress.focusLabel}</p>
        </div>
      </div>

      {/* ─── 1b. Day navigation (subtle) ──────────────────── */}
      {!isTodaySelected && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-3.5 py-2">
          <p className="text-sm font-medium text-foreground capitalize">{formatSelectedDate(selectedDate)}</p>
          <div className="flex items-center gap-1.5">
            <FqButton variant="ghost" tone="neutral" size="xs" leftIcon="chevronLeft" onClick={goToPreviousDay}>
              Anterior
            </FqButton>
            <FqButton variant="ghost" tone="neutral" size="xs" rightIcon="chevronRight" onClick={goToNextDay}>
              Hoje
            </FqButton>
          </div>
        </div>
      )}

      {/* ─── 2. Today's checklist ─────────────────────────── */}
      <div className="space-y-2.5">
        <h2 className="fq-subtle-label">Seu dia</h2>

        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-float">
          {checklist.map((item) => {
            const done = item.status === 'completed'
            const inProgress = item.status === 'in_progress'
            return (
              <li key={item.id} className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
                <span
                  className={
                    done
                      ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success'
                      : inProgress
                        ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'
                        : 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning'
                  }
                >
                  <FqIcon name={done ? 'check' : item.icon} size={16} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                    <span
                      className={`shrink-0 text-xs font-semibold ${done ? 'text-success' : inProgress ? 'text-primary' : 'text-warning'}`}
                    >
                      {item.progressLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
                  <div className="mt-1.5">
                    <FqProgressBar
                      value={item.pct}
                      tone={done ? 'success' : inProgress ? 'primary' : 'warning'}
                      showLabel={false}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ─── 3. Smart next action ─────────────────────────── */}
      {nextAction && nextAction.key !== 'rewards' && (
        <div className="fq-soft-reveal">
          <FqButton
            size="lg"
            tone="primary"
            leftIcon={nextAction.icon}
            className="w-full"
            onClick={handleNextAction}
            isLoading={
              (nextAction.key === 'meal' && isRegisterMealPending) ||
              (nextAction.key === 'water' && isRegisterWaterPending)
            }
          >
            {nextAction.label}
          </FqButton>
        </div>
      )}

      {/* ─── 3b. Day complete celebration ─────────────────── */}
      {allDone && (
        <div className="fq-soft-reveal flex flex-col items-center gap-1.5 rounded-2xl border border-success/20 bg-success/5 px-5 py-5 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
            <FqIcon name="check" size={20} />
          </span>
          <p className="text-sm font-semibold text-success">Dia completo!</p>
          <p className="text-xs text-muted-foreground">
            Voce cumpriu todas as metas de hoje. Descanse e se prepare para amanha.
          </p>
          <FqButton
            variant="outline"
            tone="success"
            size="sm"
            className="mt-2"
            onClick={() => history.push(studentRoutes.rewards)}
          >
            Ver recompensas
          </FqButton>
        </div>
      )}

      {/* ─── 4. Quick micro-actions (water + meal) ────────── */}
      {!allDone && (
        <div className="grid grid-cols-2 gap-2.5">
          <FqButton
            variant="outline"
            tone="neutral"
            size="sm"
            leftIcon="plus"
            onClick={() => void handleRegisterWater(300)}
            isLoading={isRegisterWaterPending}
          >
            +300 ml agua
          </FqButton>
          <FqButton
            variant="outline"
            tone="neutral"
            size="sm"
            leftIcon="check"
            onClick={() => void handleRegisterMeal()}
            isLoading={isRegisterMealPending}
          >
            Registrar refeicao
          </FqButton>
        </div>
      )}

      {/* ─── 5. Footer: streak + XP + level ──────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card/90 px-3 py-3 shadow-card">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${dashboard.gamificationProfile.streakDays > 0 ? 'bg-success/10 text-success' : 'bg-muted/60 text-muted-foreground'}`}
          >
            <FqIcon name="flame" size={16} />
          </span>
          <p className="text-sm font-semibold leading-tight text-foreground">{dashboard.gamificationProfile.streakDays}</p>
          <p className="text-caption text-muted-foreground">Streak</p>
        </div>

        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card/90 px-3 py-3 shadow-card">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-star/10 text-star">
            <FqIcon name="star" size={16} />
          </span>
          <p className="text-sm font-semibold leading-tight text-foreground">{dashboard.dailyProgress.xpEarned}</p>
          <p className="text-caption text-muted-foreground">XP hoje</p>
        </div>

        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card/90 px-3 py-3 shadow-card">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gamification/10 text-gamification">
            <FqIcon name="trophy" size={16} />
          </span>
          <p className="text-sm font-semibold leading-tight text-foreground">Lv {dashboard.gamificationProfile.level}</p>
          <p className="text-caption text-muted-foreground">{viewModel.nextLevelXpRemaining} XP p/ subir</p>
        </div>
      </div>

      {/* ─── 6. Subtle navigation row ─────────────────────── */}
      <nav className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <FqButton variant="ghost" tone="neutral" size="xs" leftIcon="dumbbell" onClick={() => history.push(studentRoutes.workouts)}>
          Treinos
        </FqButton>
        <FqButton variant="ghost" tone="neutral" size="xs" leftIcon="utensils" onClick={() => history.push(studentRoutes.nutrition)}>
          Nutricao
        </FqButton>
        <FqButton variant="ghost" tone="neutral" size="xs" leftIcon="chart" onClick={() => history.push(studentRoutes.progress)}>
          Progresso
        </FqButton>
        <FqButton variant="ghost" tone="neutral" size="xs" leftIcon="trophy" onClick={() => history.push(studentRoutes.rewards)}>
          Gamificacao
        </FqButton>
      </nav>
    </section>
  )
}

export function StudentHubPage() {
  return (
    <StudentWorkspaceProvider>
      <StudentHubPageContent />
    </StudentWorkspaceProvider>
  )
}
