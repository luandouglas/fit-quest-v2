import { useMemo, useState } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { StudentModuleState, StudentPageHeader } from '@/features/student/components'
import { invalidateStudentExperienceQueries } from '@/features/student/hooks/invalidateStudentExperienceQueries'
import {
  FqAlert,
  FqCard,
  FqQuickActions,
  FqTag,
  FqText,
  useToast,
} from '@/shared/ui'
import { nutritionService } from '@/shared/services'
import type { Meal, NutritionDay } from '@/shared/services/contracts/nutrition'

import { nutritionQueryKeys } from '../hooks/queryKeys'
import { useNutritionSummary } from '../hooks/useNutritionSummary'
import { buildHistory, calculateMealCompletionPct, isDayComplete, toIsoDate } from '../hooks/nutritionUtils'
import {
  DailySummaryCard,
  MealDetailSheet,
  MealsList,
  NutritionFeedbackCard,
  NutritionHistory,
  WaterCard,
  type NutritionFeedbackItem,
} from './components'

function getNutritionBasePath(pathname: string) {
  return pathname.startsWith('/nutrition') ? '/nutrition' : '/tabs/nutrition'
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

function buildSearch(date: string, todayDate: string, returnTo?: 'history') {
  const search = new URLSearchParams()

  if (date !== todayDate) {
    search.set('date', date)
  }

  if (returnTo) {
    search.set('return', returnTo)
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}

function getSelectedDate(search: string, todayDate: string) {
  const params = new URLSearchParams(search)
  return params.get('date') ?? todayDate
}

function getReturnTarget(search: string) {
  const params = new URLSearchParams(search)
  return params.get('return') === 'history' ? 'history' : null
}

function parseTimeToMinutes(time: string) {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
}

function buildFeedbackItems(day: NutritionDay, todayDate: string): NutritionFeedbackItem[] {
  const todayMinutes = new Date().getHours() * 60 + new Date().getMinutes()
  const selectedIsToday = day.date === todayDate
  const pendingMeals = day.meals.filter((meal) => meal.status === 'pending')
  const overdueMeal =
    selectedIsToday
      ? pendingMeals.find((meal) => parseTimeToMinutes(meal.time) <= todayMinutes) ?? pendingMeals[0] ?? null
      : pendingMeals[0] ?? null
  const proteinLeft = Math.max(day.goals.protein - day.consumed.protein, 0)
  const waterLeft = Math.max(day.goals.waterMl - day.consumed.waterMl, 0)
  const remainingMeals = pendingMeals.length
  const items: NutritionFeedbackItem[] = []

  if (overdueMeal) {
    items.push({
      id: 'meal',
      title: `${overdueMeal.name} ainda nao registrado`,
      description: `Planejado para ${overdueMeal.time}. Marque a refeicao, pule ou deixe uma observacao rapida.`,
      tone: 'warning',
      icon: 'utensils',
    })
  }

  if (proteinLeft > 0) {
    items.push({
      id: 'protein',
      title: `Faltam ${proteinLeft}g de proteina`,
      description: 'As proximas refeicoes podem puxar sua meta e melhorar a recuperacao do treino.',
      tone: 'primary',
      icon: 'target',
    })
  }

  if (waterLeft > 0) {
    items.push({
      id: 'water',
      title: `Faltam ${waterLeft} ml de agua`,
      description: 'Use os atalhos de hidratacao para bater a meta sem atrito.',
      tone: 'secondary',
      icon: 'flask',
    })
  }

  if (remainingMeals > 0) {
    items.push({
      id: 'remaining-meals',
      title: `Falta${remainingMeals > 1 ? 'm' : ''} registrar ${remainingMeals} ${pluralize(remainingMeals, 'refeicao', 'refeicoes')}`,
      description: 'Fechar o plano alimentar completo melhora aderencia, progresso diario e consistencia.',
      tone: 'neutral',
      icon: 'clock',
    })
  }

  if (!items.length) {
    items.push({
      id: 'done',
      title: 'Dia alimentar redondo',
      description: 'Metas de refeicoes e hidratacao estao no alvo. Continue protegendo a consistencia.',
      tone: 'success',
      icon: 'star',
    })
  }

  return items.slice(0, 4)
}

export function NutritionPage() {
  const history = useHistory()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const mealMatch = useRouteMatch<{ mealId: string }>(['/tabs/nutrition/meal/:mealId', '/nutrition/meal/:mealId'])

  const todayDate = useMemo(() => toIsoDate(new Date()), [])
  const selectedDate = useMemo(() => getSelectedDate(location.search, todayDate), [location.search, todayDate])
  const basePath = useMemo(() => getNutritionBasePath(location.pathname), [location.pathname])
  const returnTarget = useMemo(() => getReturnTarget(location.search), [location.search])
  const isHistoryRoute = location.pathname.endsWith('/history') || returnTarget === 'history'

  const { daysByDate, currentDay, uiState, refresh, permissions, updateDaysByDate, invalidate } = useNutritionSummary({
    anchorDate: todayDate,
    selectedDate,
  })

  const [historyFilter, setHistoryFilter] = useState<'all' | 'ok' | 'pending'>('all')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isApplyingAction, setIsApplyingAction] = useState(false)

  const meals = useMemo(() => {
    if (!currentDay) {
      return []
    }

    return [...currentDay.meals].sort((left, right) => parseTimeToMinutes(left.time) - parseTimeToMinutes(right.time))
  }, [currentDay])

  const selectedMeal = useMemo(
    () => meals.find((meal) => meal.id === mealMatch?.params.mealId) ?? null,
    [mealMatch?.params.mealId, meals],
  )

  const mealCompletionPct = useMemo(() => (currentDay ? calculateMealCompletionPct(currentDay) : 0), [currentDay])
  const completedMealsCount = useMemo(() => meals.filter((meal) => meal.status === 'done').length, [meals])
  const pendingMealsCount = useMemo(() => meals.filter((meal) => meal.status === 'pending').length, [meals])
  const selectedDayComplete = useMemo(() => (currentDay ? isDayComplete(currentDay) : false), [currentDay])
  const feedbackItems = useMemo(() => (currentDay ? buildFeedbackItems(currentDay, todayDate) : []), [currentDay, todayDate])
  const historyDays = useMemo(() => buildHistory(daysByDate, todayDate), [daysByDate, todayDate])
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') {
      return historyDays
    }

    return historyDays.filter((day) => day.status === historyFilter)
  }, [historyDays, historyFilter])

  const isReadonlyDay = selectedDate !== todayDate
  const isInteractionDisabled =
    uiState !== 'ready' || !permissions.canRegisterConsumption || isReadonlyDay

  function syncUpdatedDay(updatedDay: NutritionDay) {
    updateDaysByDate((previous) => ({
      ...previous,
      [updatedDay.date]: updatedDay,
    }))
  }

  async function refreshCrossFeatureProgress() {
    await Promise.all([
      invalidateStudentExperienceQueries(queryClient),
      queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.days(todayDate) }),
    ])
  }

  function navigateToDate(date: string) {
    history.replace({
      pathname: isHistoryRoute ? `${basePath}/history` : basePath,
      search: buildSearch(date, todayDate, isHistoryRoute ? 'history' : undefined),
    })
  }

  function openMeal(mealId: string) {
    history.replace({
      pathname: `${basePath}/meal/${mealId}`,
      search: buildSearch(selectedDate, todayDate, isHistoryRoute ? 'history' : undefined),
    })
  }

  function closeMeal() {
    history.replace({
      pathname: isHistoryRoute ? `${basePath}/history` : basePath,
      search: buildSearch(selectedDate, todayDate, isHistoryRoute ? 'history' : undefined),
    })
  }

  async function handleMealStatus(mealId: string, status: Meal['status']) {
    setIsApplyingAction(true)

    try {
      const updatedDay = await nutritionService.updateMealStatus({
        date: selectedDate,
        mealId,
        status,
      })

      syncUpdatedDay(updatedDay)
      await invalidate()
      if (!isReadonlyDay) {
        await refreshCrossFeatureProgress()
      }

      toast({
        title: status === 'done' ? 'Refeicao concluida' : status === 'skipped' ? 'Refeicao marcada como pulada' : 'Refeicao voltou para pendente',
        description: 'Seu plano alimentar foi atualizado com sucesso.',
        tone: 'success',
      })
    } catch (error) {
      toast({
        title: 'Falha ao atualizar refeicao',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    } finally {
      setIsApplyingAction(false)
    }
  }

  async function handleSaveMealNote(note: string) {
    if (!selectedMeal) {
      return
    }

    setIsSavingNote(true)

    try {
      const updatedDay = await nutritionService.updateMeal({
        date: selectedDate,
        mealId: selectedMeal.id,
        patch: { note },
      })

      syncUpdatedDay(updatedDay)
      await invalidate()
      if (!isReadonlyDay) {
        await refreshCrossFeatureProgress()
      }

      toast({
        title: 'Observacao salva',
        description: 'Sua anotacao ficou registrada na refeicao.',
        tone: 'success',
      })
    } catch (error) {
      toast({
        title: 'Falha ao salvar observacao',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    } finally {
      setIsSavingNote(false)
    }
  }

  async function handleAddWater(ml: number) {
    setIsApplyingAction(true)

    try {
      const updatedDay = await nutritionService.addWaterEntry({
        date: selectedDate,
        ml,
      })

      syncUpdatedDay(updatedDay)
      await invalidate()
      if (!isReadonlyDay) {
        await refreshCrossFeatureProgress()
      }

      toast({
        title: 'Hidratacao registrada',
        description: `+${ml} ml adicionados ao seu dia.`,
        tone: 'success',
      })
    } catch (error) {
      toast({
        title: 'Falha ao registrar agua',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    } finally {
      setIsApplyingAction(false)
    }
  }

  async function handleUndoWater() {
    setIsApplyingAction(true)

    try {
      const updatedDay = await nutritionService.removeLastWaterEntry({
        date: selectedDate,
      })

      syncUpdatedDay(updatedDay)
      await invalidate()
      if (!isReadonlyDay) {
        await refreshCrossFeatureProgress()
      }

      toast({
        title: 'Ultimo registro removido',
        description: 'A hidratacao voltou ao valor anterior.',
        tone: 'success',
      })
    } catch (error) {
      toast({
        title: 'Falha ao desfazer hidratacao',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    } finally {
      setIsApplyingAction(false)
    }
  }

  if (uiState === 'loading') {
    return (
      <StudentModuleState
        state="loading"
        title="Montando seu plano alimentar do dia"
        description="Estamos organizando refeicoes, metas, agua e feedbacks acionaveis para voce agir com poucos toques."
        shellClassName="fq-page-shell"
      />
    )
  }

  if (uiState === 'error') {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao carregar nutricao"
        description="Nao foi possivel abrir seu plano alimentar agora."
        actionLabel="Tentar novamente"
        onAction={() => void refresh()}
        shellClassName="fq-page-shell"
      />
    )
  }

  if (uiState === 'empty' || !currentDay) {
    return (
      <StudentModuleState
        state="empty"
        icon="utensils"
        title="Sem plano de nutricao por enquanto"
        description="Assim que a dieta do dia estiver liberada, voce vai conseguir registrar refeicoes, agua e aderencia daqui."
        actionLabel="Voltar para Home"
        onAction={() => history.push('/tabs/student')}
        shellClassName="fq-page-shell"
      />
    )
  }

  return (
    <>
      <section className="fq-page-shell space-y-5">
        <StudentPageHeader
          eyebrow="Rotina alimentar"
          title="Nutrição"
          description="Plano alimentar, hidratação e aderência organizados para o que importa hoje, com leitura clara também no histórico."
          tags={[
            {
              id: 'selected-day',
              label: selectedDate === todayDate ? 'Hoje em foco' : 'Histórico em leitura',
              tone: selectedDate === todayDate ? 'primary' : 'neutral',
              icon: selectedDate === todayDate ? 'target' : 'clock',
            },
            {
              id: 'pending-meals',
              label:
                pendingMealsCount > 0
                  ? `${pendingMealsCount} ${pluralize(pendingMealsCount, 'refeicao pendente', 'refeicoes pendentes')}`
                  : 'Plano alimentar encaminhado',
              tone: pendingMealsCount > 0 ? 'warning' : 'success',
            },
          ]}
        />

        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <FqText as="p" className="text-sm font-medium text-muted-foreground">
                  {selectedDate === todayDate ? 'Hoje' : 'Historico selecionado'}
                </FqText>
                <FqText as="h2" className="text-xl font-semibold text-foreground capitalize">
                  {formatDateLabel(selectedDate)}
                </FqText>
                <FqText as="p" className="text-sm text-muted-foreground">
                  {selectedDate === todayDate
                    ? 'Abra o app, veja o que falta e registre refeicoes e agua com poucos toques.'
                    : 'Leitura do dia anterior para acompanhar consistencia, calorias, macros e hidratacao.'}
                </FqText>
              </div>

              <div className="flex flex-wrap gap-2">
                <FqTag tone="secondary">{completedMealsCount}/{meals.length} refeicoes</FqTag>
                <FqTag tone="primary">{currentDay.consumed.protein}g proteina</FqTag>
                <FqTag tone="success">{currentDay.consumed.waterMl} ml agua</FqTag>
              </div>
            </div>

            {isReadonlyDay ? (
              <FqAlert tone="neutral" title="Historico em modo leitura">
                Refeicoes e hidratacao so podem ser registradas no dia atual. Use esta visao para acompanhar aderencia.
              </FqAlert>
            ) : null}
          </div>
        </FqCard>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
          <DailySummaryCard
            day={currentDay}
            mealCompletionPct={mealCompletionPct}
            isDayComplete={selectedDayComplete}
            pendingMealsCount={pendingMealsCount}
          />

          <div className="space-y-5">
            <NutritionFeedbackCard items={feedbackItems} />
            <WaterCard
              consumedMl={currentDay.consumed.waterMl}
              goalMl={currentDay.goals.waterMl}
              onQuickAdd={(ml) => void handleAddWater(ml)}
              onUndoLast={() => void handleUndoWater()}
              isDisabled={isInteractionDisabled || !permissions.canUpdateWater}
            />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
          <MealsList
            meals={meals}
            completedCount={completedMealsCount}
            pendingCount={pendingMealsCount}
            isDisabled={isInteractionDisabled}
            onRegisterMeal={(mealId) => void handleMealStatus(mealId, 'done')}
            onToggleMealSkipped={(mealId) => {
              const meal = meals.find((entry) => entry.id === mealId)
              const nextStatus: Meal['status'] = meal?.status === 'skipped' ? 'pending' : 'skipped'
              void handleMealStatus(mealId, nextStatus)
            }}
            onOpenMeal={openMeal}
          />

          <NutritionHistory
            days={filteredHistory}
            selectedDate={selectedDate}
            filter={historyFilter}
            onFilterChange={setHistoryFilter}
            onOpenDay={navigateToDate}
          />
        </div>
      </section>

      <MealDetailSheet
        open={Boolean(selectedMeal)}
        meal={selectedMeal}
        note={selectedMeal?.note ?? ''}
        isDisabled={isInteractionDisabled || !permissions.canAddMealNotes}
        onOpenChange={(open) => {
          if (!open) {
            closeMeal()
          }
        }}
        onSaveNote={(note) => void handleSaveMealNote(note)}
        onMarkDone={() => void handleMealStatus(selectedMeal?.id ?? '', 'done')}
        onMarkSkipped={() => void handleMealStatus(selectedMeal?.id ?? '', 'skipped')}
        onResetStatus={() => void handleMealStatus(selectedMeal?.id ?? '', 'pending')}
        isSaving={isSavingNote || isApplyingAction}
      />

      <FqQuickActions
        actions={[
          {
            id: 'water-300',
            label: 'Agua +300 ml',
            icon: 'flask',
            tone: 'secondary',
            onClick: () => void handleAddWater(300),
            disabled: isInteractionDisabled,
          },
          {
            id: 'next-meal',
            label: pendingMealsCount > 0 ? 'Registrar proxima refeicao' : 'Ver historico alimentar',
            icon: pendingMealsCount > 0 ? 'utensils' : 'chart',
            onClick: () => {
              const nextMeal = meals.find((meal) => meal.status === 'pending')
              if (nextMeal) {
                openMeal(nextMeal.id)
                return
              }

              history.replace({
                pathname: `${basePath}/history`,
                search: buildSearch(selectedDate, todayDate, 'history'),
              })
            },
            disabled: pendingMealsCount === 0 && historyDays.length === 0,
          },
        ]}
      />
    </>
  )
}

export type { Meal, NutritionDay, NutritionHistoryDay } from '@/shared/services/contracts/nutrition'
