import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import {
  FqAlert,
  FqButton,
  FqCard,
  FqEmptyState,
  FqIcon,
  FqInput,
  FqProgressBar,
  FqStatCard,
  FqTag,
  FqText,
  FqTooltip,
  useToast,
} from '@/shared/ui'
import { nutritionService, type Meal } from '@/shared/services'

import { useNutritionSummary } from '../hooks/useNutritionSummary'
import { addDays, calculateMealCompletionPct, toIsoDate } from '../hooks/nutritionUtils'

export type { Macros, Meal, MealItem, NutritionDay, NutritionHistoryDay, WaterLogEntry } from '@/shared/services'

type NutritionTab = 'plan' | 'logging' | 'adherence'

const portionOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
] as const

function getNutritionBasePath(pathname: string) {
  return pathname.startsWith('/nutrition') ? '/nutrition' : '/tabs/nutrition'
}

function getInitialTab(pathname: string): NutritionTab {
  if (pathname.includes('/history')) {
    return 'adherence'
  }

  if (pathname.includes('/meal/')) {
    return 'logging'
  }

  return 'plan'
}

function parseTimeToNumber(time: string) {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function NutritionPage() {
  const history = useHistory()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const mealMatch = useRouteMatch<{ mealId: string }>(['/tabs/nutrition/meal/:mealId', '/nutrition/meal/:mealId'])

  const todayDate = useMemo(() => toIsoDate(new Date()), [])
  const { daysByDate, currentDay, uiState, refresh, permissions, updateDaysByDate, invalidate } = useNutritionSummary({
    anchorDate: todayDate,
    selectedDate: todayDate,
  })

  const [activeTab, setActiveTab] = useState<NutritionTab>(() => getInitialTab(location.pathname))
  const [selectedMealId, setSelectedMealId] = useState<string | null>(mealMatch?.params.mealId ?? null)
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1)
  const [extraItem, setExtraItem] = useState('')
  const [isSavingLog, setIsSavingLog] = useState(false)

  useEffect(() => {
    setActiveTab(getInitialTab(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    if (mealMatch?.params.mealId) {
      setSelectedMealId(mealMatch.params.mealId)
    }
  }, [mealMatch?.params.mealId])

  const meals = useMemo(() => {
    if (!currentDay) {
      return []
    }

    return [...currentDay.meals].sort((left, right) => parseTimeToNumber(left.time) - parseTimeToNumber(right.time))
  }, [currentDay])

  const selectedMeal = useMemo(
    () => meals.find((meal) => meal.id === selectedMealId) ?? meals[0] ?? null,
    [meals, selectedMealId],
  )

  const dailyAdherencePct = useMemo(
    () => (currentDay ? calculateMealCompletionPct(currentDay) : 0),
    [currentDay],
  )

  const weeklyAdherence = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, index) => addDays(todayDate, -index))
    const dayPcts = dates.map((date) => {
      const day = daysByDate[date]
      return day ? calculateMealCompletionPct(day) : 0
    })

    const average = Math.round(dayPcts.reduce((total, value) => total + value, 0) / Math.max(dayPcts.length, 1))

    return {
      average,
      rows: dates.map((date) => ({
        date,
        pct: dayPcts[dates.indexOf(date)] ?? 0,
      })),
    }
  }, [daysByDate, todayDate])

  const adherenceStreakDays = useMemo(() => {
    let streak = 0
    for (let index = 0; index < 30; index += 1) {
      const date = addDays(todayDate, -index)
      const day = daysByDate[date]
      if (!day || calculateMealCompletionPct(day) < 100) {
        break
      }
      streak += 1
    }
    return streak
  }, [daysByDate, todayDate])

  const missingMeal = useMemo(
    () => currentDay?.meals.find((meal) => meal.status !== 'done') ?? null,
    [currentDay],
  )

  const waterSummary = useMemo(() => {
    if (!currentDay) {
      return { consumed: 0, goal: 0, pct: 0 }
    }

    const consumed = currentDay.consumed.waterMl
    const goal = currentDay.goals.waterMl
    const pct = Math.min(Math.round((consumed / Math.max(goal, 1)) * 100), 100)

    return { consumed, goal, pct }
  }, [currentDay])

  function syncUpdatedDay(updatedDay: NonNullable<typeof currentDay>) {
    updateDaysByDate((previous) => ({
      ...previous,
      [updatedDay.date]: updatedDay,
    }))
  }

  async function refreshCrossFeatureProgress() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['progress', 'overview'] }),
      queryClient.invalidateQueries({ queryKey: ['gamification', 'overview'] }),
      queryClient.invalidateQueries({ queryKey: ['ranking'] }),
    ])
  }

  function navigateToTab(nextTab: NutritionTab, mealId?: string | null) {
    const basePath = getNutritionBasePath(location.pathname)
    setActiveTab(nextTab)

    if (nextTab === 'adherence') {
      history.replace(`${basePath}/history`)
      return
    }

    if (nextTab === 'logging' && mealId) {
      history.replace(`${basePath}/meal/${mealId}`)
      return
    }

    history.replace(basePath)
  }

  function handleOpenLogging(meal: Meal) {
    setSelectedMealId(meal.id)
    navigateToTab('logging', meal.id)
  }

  async function handleSaveLog() {
    if (!currentDay || !selectedMeal) {
      return
    }

    setIsSavingLog(true)
    try {
      const updatedDay = await nutritionService.updateMealStatus({
        date: todayDate,
        mealId: selectedMeal.id,
        status: 'done',
      })

      syncUpdatedDay(updatedDay)
      await invalidate()
      await refreshCrossFeatureProgress()

      toast({
        title: 'Registro salvo',
        description: `${selectedMeal.name} registrado em ${portionMultiplier}x${extraItem.trim() ? ` + ${extraItem.trim()}` : ''}.`,
        tone: 'success',
      })
      setExtraItem('')
    } catch (error) {
      toast({
        title: 'Falha ao salvar registro',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        tone: 'danger',
      })
    } finally {
      setIsSavingLog(false)
    }
  }

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando nutricao...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell">
        <FqAlert tone="danger" title="Falha ao carregar nutricao">
          Nao foi possivel carregar os dados agora.
        </FqAlert>
        <FqButton onClick={() => void refresh()} variant="outline" tone="neutral">
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !currentDay) {
    return (
      <section className="fq-page-shell">
        <FqEmptyState icon="utensils" title="Sem plano de nutricao" description="Aguarde o plano do nutricionista para comecar." />
      </section>
    )
  }

  return (
    <section className="fq-page-shell">
      <header className="fq-page-header">
        <FqText as="h1" variant="title" className="text-lg">
          Nutricao
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Plano do dia, registro rapido de refeicoes e aderencia clara em um fluxo unico.
        </FqText>
      </header>

      <FqCard className="border-border bg-card">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FqText as="p" className="text-sm font-semibold text-foreground">
                Resumo de Agua (Hydration V2)
              </FqText>
              <FqTag tone={waterSummary.pct >= 100 ? 'success' : 'warning'}>{waterSummary.pct}%</FqTag>
            </div>
            <FqProgressBar value={waterSummary.pct} tone={waterSummary.pct >= 100 ? 'success' : 'primary'} />
            <FqText as="p" className="text-xs text-muted-foreground">
              {waterSummary.consumed}ml de {waterSummary.goal}ml.
            </FqText>
          </div>
          <div className="flex items-end justify-start lg:justify-end">
            <FqButton variant="outline" tone="neutral" onClick={() => history.push('/tabs/home')}>
              Registrar agua no Inicio
            </FqButton>
          </div>
        </div>
      </FqCard>

      <div className="flex flex-wrap gap-2">
        <FqButton variant={activeTab === 'plan' ? 'solid' : 'outline'} tone={activeTab === 'plan' ? 'primary' : 'neutral'} onClick={() => navigateToTab('plan')}>
          Plano
        </FqButton>
        <FqButton
          variant={activeTab === 'logging' ? 'solid' : 'outline'}
          tone={activeTab === 'logging' ? 'primary' : 'neutral'}
          onClick={() => navigateToTab('logging', selectedMeal?.id ?? null)}
        >
          Registrar
        </FqButton>
        <FqButton
          variant={activeTab === 'adherence' ? 'solid' : 'outline'}
          tone={activeTab === 'adherence' ? 'primary' : 'neutral'}
          onClick={() => navigateToTab('adherence')}
        >
          Aderencia
        </FqButton>
      </div>

      {activeTab === 'plan' ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <FqCard className="border-border bg-card lg:col-span-7">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FqText as="h2" className="text-sm font-semibold text-foreground">
                  Plano do Nutricionista
                </FqText>
                <FqTag tone="secondary">Somente leitura</FqTag>
              </div>
              <FqText as="p" className="text-xs text-muted-foreground">
                {permissions.hasActiveNutritionist ? 'Plano gerenciado por nutricionista.' : 'Plano base do dia.'}
              </FqText>
              <div className="space-y-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <FqText as="p" className="text-sm font-semibold text-foreground">
                          {meal.time} • {meal.name}
                        </FqText>
                        <FqText as="p" className="text-xs text-muted-foreground">
                          {meal.targetMacros.calories} kcal • P {meal.targetMacros.protein}g • C {meal.targetMacros.carbs}g • G {meal.targetMacros.fat}g
                        </FqText>
                      </div>
                      <div className="flex items-center gap-2">
                        <FqTag tone={meal.status === 'done' ? 'success' : 'warning'}>
                          {meal.status === 'done' ? 'Registrada' : 'Pendente'}
                        </FqTag>
                        <FqButton size="sm" variant="outline" onClick={() => handleOpenLogging(meal)}>
                          Registrar
                        </FqButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FqCard>

          <FqCard className="border-border bg-card lg:col-span-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FqText as="h2" className="text-sm font-semibold text-foreground">
                  Metas de macro e calorias
                </FqText>
                <FqTooltip content="Metas definidas para orientar performance, recuperacao e controle de composicao corporal.">
                  <button type="button" className="inline-flex items-center text-muted-foreground">
                    <FqIcon name="info" size={14} />
                  </button>
                </FqTooltip>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <FqStatCard label="Calorias" value={`${currentDay.goals.calories} kcal`} />
                <FqStatCard label="Proteina" value={`${currentDay.goals.protein} g`} />
                <FqStatCard label="Carboidrato" value={`${currentDay.goals.carbs} g`} />
                <FqStatCard label="Gordura" value={`${currentDay.goals.fat} g`} />
              </div>
            </div>
          </FqCard>
        </div>
      ) : null}

      {activeTab === 'logging' ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <FqCard className="border-border bg-card lg:col-span-5">
            <div className="space-y-3">
              <FqText as="h2" className="text-sm font-semibold text-foreground">
                Escolha a refeicao do plano
              </FqText>
              <div className="grid gap-2">
                {meals.map((meal) => (
                  <FqButton
                    key={meal.id}
                    variant={selectedMeal?.id === meal.id ? 'solid' : 'outline'}
                    tone={selectedMeal?.id === meal.id ? 'primary' : 'neutral'}
                    className="justify-start"
                    onClick={() => handleOpenLogging(meal)}
                  >
                    {meal.time} • {meal.name}
                  </FqButton>
                ))}
              </div>
            </div>
          </FqCard>

          <FqCard className="border-border bg-card lg:col-span-7">
            {selectedMeal ? (
              <div className="space-y-4">
                <div>
                  <FqText as="h2" className="text-sm font-semibold text-foreground">
                    Registro rapido
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    1 toque para registrar sua refeicao do plano.
                  </FqText>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-3">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {selectedMeal.time} • {selectedMeal.name}
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    Porcao alvo: {selectedMeal.targetMacros.calories} kcal
                  </FqText>
                </div>

                <div className="space-y-2">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    Porcao
                  </FqText>
                  <div className="flex gap-2">
                    {portionOptions.map((option) => (
                      <FqButton
                        key={option.value}
                        size="sm"
                        variant={portionMultiplier === option.value ? 'solid' : 'outline'}
                        tone={portionMultiplier === option.value ? 'primary' : 'neutral'}
                        onClick={() => setPortionMultiplier(option.value)}
                      >
                        {option.label}
                      </FqButton>
                    ))}
                  </div>
                </div>

                <FqInput
                  label="Item extra (opcional)"
                  placeholder="Ex.: banana, whey, castanhas..."
                  value={extraItem}
                  onChange={(event) => setExtraItem(event.target.value)}
                />

                <FqButton onClick={() => void handleSaveLog()} isLoading={isSavingLog}>
                  Salvar registro
                </FqButton>
              </div>
            ) : (
              <FqEmptyState icon="utensils" title="Selecione uma refeicao" description="Escolha uma refeicao do plano para registrar." />
            )}
          </FqCard>
        </div>
      ) : null}

      {activeTab === 'adherence' ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <FqStatCard label="Aderencia diaria" value={`${dailyAdherencePct}%`} icon="target" />
            <FqStatCard label="Aderencia semanal" value={`${weeklyAdherence.average}%`} icon="chart" />
            <FqStatCard label="Streak" value={`${adherenceStreakDays} dia(s)`} icon="flame" />
          </div>

          <FqCard className="border-border bg-card">
            <div className="space-y-2">
              <FqText as="h2" className="text-sm font-semibold text-foreground">
                Refeicao faltante
              </FqText>
              {missingMeal ? (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-3">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {missingMeal.time} • {missingMeal.name}
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    Priorize esse check-in para fechar sua aderencia de hoje.
                  </FqText>
                  <div className="mt-2">
                    <FqButton size="sm" onClick={() => handleOpenLogging(missingMeal)}>
                      Registrar agora
                    </FqButton>
                  </div>
                </div>
              ) : (
                <FqText as="p" className="text-sm text-muted-foreground">
                  Nenhuma refeicao faltante hoje. Excelente consistencia.
                </FqText>
              )}
            </div>
          </FqCard>

          <FqCard className="border-border bg-card">
            <div className="space-y-3">
              <FqText as="h2" className="text-sm font-semibold text-foreground">
                Ultimos 7 dias
              </FqText>
              <div className="space-y-2">
                {weeklyAdherence.rows.map((row) => (
                  <div key={row.date} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <FqText as="p" className="text-xs font-medium text-foreground">
                        {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${row.date}T12:00:00`))}
                      </FqText>
                      <FqTag tone={row.pct >= 100 ? 'success' : row.pct >= 70 ? 'warning' : 'danger'}>{row.pct}%</FqTag>
                    </div>
                    <FqProgressBar value={row.pct} tone={row.pct >= 100 ? 'success' : 'primary'} showLabel={false} className="mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </FqCard>
        </div>
      ) : null}
    </section>
  )
}
