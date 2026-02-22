import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'

import {
  FqAlert,
  FqBadge,
  FqButton,
  FqCard,
  FqDatePicker,
  FqDrawer,
  FqEmptyState,
  FqIcon,
  FqInput,
  FqModal,
  FqTabs,
  useToast,
} from '@/shared/ui'

import {
  getIsoDateOffset,
  getTodayIsoDate,
  initialErroredDates,
  nutritionMockDataByDate,
  nutritionMockWaterLogsByDate,
} from './mockData'
import type { Meal, NutritionDay, NutritionUiState, WaterLogEntry } from './types'
import { DailySummaryCard } from './components/DailySummaryCard'
import { DateSwitcher } from './components/DateSwitcher'
import { MealDetailSheet } from './components/MealDetailSheet'
import { MealsList } from './components/MealsList'
import { NutritionHistory } from './components/NutritionHistory'
import { NutritionSkeleton } from './components/NutritionSkeleton'
import { WaterCard } from './components/WaterCard'

const LOAD_DELAY_MS = 360
const DAY_STARS = 3

function formatTitleDate(dateIso: string) {
  const date = new Date(`${dateIso}T00:00:00`)

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date)
}

function calcMacros(meals: Meal[]) {
  return meals.reduce(
    (acc, meal) => {
      if (meal.status !== 'done') {
        return acc
      }

      return {
        calories: acc.calories + meal.targetMacros.calories,
        protein: acc.protein + meal.targetMacros.protein,
        carbs: acc.carbs + meal.targetMacros.carbs,
        fat: acc.fat + meal.targetMacros.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

function isDayCompleted(day: NutritionDay) {
  const allMealsDone = day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done')
  const waterDone = day.consumed.waterMl >= day.goals.waterMl

  return allMealsDone && waterDone
}

function buildSyncedDay(day: NutritionDay, waterMl: number) {
  const macros = calcMacros(day.meals)
  const nextDay: NutritionDay = {
    ...day,
    consumed: {
      ...macros,
      waterMl,
    },
  }

  return {
    ...nextDay,
    starsEarned: isDayCompleted(nextDay) ? DAY_STARS : 0,
  }
}

function getBasePath(pathname: string) {
  return pathname.startsWith('/nutrition') ? '/nutrition' : '/tabs/nutrition'
}

export function NutritionPage() {
  const history = useHistory()
  const location = useLocation()
  const { toast } = useToast()

  const todayIso = getTodayIsoDate()
  const yesterdayIso = getIsoDateOffset(-1)
  const tomorrowIso = getIsoDateOffset(1)

  const historyMatch = useRouteMatch(['/tabs/nutrition/history', '/nutrition/history'])
  const mealMatch = useRouteMatch<{ mealId: string }>(['/tabs/nutrition/meal/:mealId', '/nutrition/meal/:mealId'])

  const [uiState, setUiState] = useState<NutritionUiState>('loading')
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [activeTab, setActiveTab] = useState<'plan' | 'history'>(historyMatch ? 'history' : 'plan')
  const [daysByDate, setDaysByDate] = useState<Record<string, NutritionDay>>(nutritionMockDataByDate)
  const [waterLogsByDate, setWaterLogsByDate] = useState(nutritionMockWaterLogsByDate)
  const [erroredDates, setErroredDates] = useState(initialErroredDates)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarDraft, setCalendarDraft] = useState(todayIso)
  const [isWaterEditorOpen, setIsWaterEditorOpen] = useState(false)
  const [customWaterMl, setCustomWaterMl] = useState('250')
  const [mealDetailOpen, setMealDetailOpen] = useState(false)
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false)
  const [observationsByMealId, setObservationsByMealId] = useState<Record<string, string>>({})
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)

  useEffect(() => {
    setActiveTab(historyMatch ? 'history' : 'plan')
  }, [historyMatch])

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)

    window.addEventListener('resize', onResize)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    setUiState('loading')

    const timeout = window.setTimeout(() => {
      if (erroredDates.has(selectedDate)) {
        setUiState('error')
        return
      }

      if (!daysByDate[selectedDate]) {
        setUiState('empty')
        return
      }

      setUiState('ready')
    }, LOAD_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [daysByDate, erroredDates, selectedDate])

  useEffect(() => {
    if (!mealMatch?.params.mealId) {
      return
    }

    setSelectedMealId(mealMatch.params.mealId)
    setMealDetailOpen(true)
  }, [mealMatch])

  const currentDay = daysByDate[selectedDate] ?? null

  const currentMeals = currentDay?.meals ?? []

  const selectedMeal = useMemo(() => {
    if (!selectedMealId) {
      return null
    }

    return currentMeals.find((meal) => meal.id === selectedMealId) ?? null
  }, [currentMeals, selectedMealId])

  const selectedPreset = useMemo<'yesterday' | 'today' | 'tomorrow' | null>(() => {
    if (selectedDate === yesterdayIso) {
      return 'yesterday'
    }

    if (selectedDate === todayIso) {
      return 'today'
    }

    if (selectedDate === tomorrowIso) {
      return 'tomorrow'
    }

    return null
  }, [selectedDate, todayIso, tomorrowIso, yesterdayIso])

  const historyDays = useMemo(() => {
    const items: NutritionDay[] = []

    for (let offset = 0; offset < 7; offset += 1) {
      const date = getIsoDateOffset(-offset)
      const day = daysByDate[date]
      if (day) {
        items.push(day)
      }
    }

    return items
  }, [daysByDate])

  const pendingMeals = useMemo(() => currentMeals.filter((meal) => meal.status === 'pending'), [currentMeals])

  const insight = useMemo(() => {
    if (!currentDay) {
      return 'Sem dados para gerar insights deste dia.'
    }

    const proteinGap = Math.max(currentDay.goals.protein - currentDay.consumed.protein, 0)
    const carbsGap = Math.max(currentDay.goals.carbs - currentDay.consumed.carbs, 0)

    if (proteinGap > 0) {
      return `Voce esta a ${proteinGap}g de proteina da meta.`
    }

    if (carbsGap > 0) {
      return `Carboidratos: faltam ${carbsGap}g para fechar o dia.`
    }

    return 'Boa consistencia nutricional. Mantenha o ritmo ate o fim do dia.'
  }, [currentDay])

  const isCompleted = currentDay ? isDayCompleted(currentDay) : false

  const selectedObservation = selectedMealId ? observationsByMealId[selectedMealId] ?? '' : ''

  function syncDayFromMeals(date: string, meals: Meal[]) {
    const waterEntries = waterLogsByDate[date]?.entries ?? []
    const waterMl = waterEntries.reduce((sum, entry) => sum + entry.ml, 0)

    setDaysByDate((prev) => {
      const day = prev[date]
      if (!day) {
        return prev
      }

      return {
        ...prev,
        [date]: buildSyncedDay({ ...day, meals }, waterMl),
      }
    })
  }

  function handleDateChange(date: string) {
    setSelectedDate(date)
    setCalendarDraft(date)
    setMealDetailOpen(false)
    setSelectedMealId(null)

    const basePath = getBasePath(location.pathname)
    if (location.pathname !== basePath) {
      history.replace(basePath)
    }
  }

  function handleTabChange(nextValue: string) {
    const nextTab = nextValue === 'history' ? 'history' : 'plan'
    setActiveTab(nextTab)

    const basePath = getBasePath(location.pathname)
    history.replace(nextTab === 'history' ? `${basePath}/history` : basePath)
  }

  function handleOpenMealDetails(mealId: string) {
    setSelectedMealId(mealId)
    setMealDetailOpen(true)

    const basePath = getBasePath(location.pathname)
    history.replace(`${basePath}/meal/${mealId}`)
  }

  function closeMealDetails() {
    setMealDetailOpen(false)
    setSelectedMealId(null)

    const basePath = getBasePath(location.pathname)
    history.replace(activeTab === 'history' ? `${basePath}/history` : basePath)
  }

  function handleRegisterMeal(mealId: string) {
    if (isOffline || !currentDay) {
      return
    }

    const previousDay = currentDay
    const meals = previousDay.meals.map((meal) => {
      if (meal.id !== mealId) {
        return meal
      }

      if (meal.status === 'done') {
        return meal
      }

      return {
        ...meal,
        status: 'done' as const,
        completedAt: new Date().toISOString(),
      }
    })

    syncDayFromMeals(previousDay.date, meals)

    toast({
      title: 'Refeicao registrada',
      description: 'Registro salvo no diario de nutricao.',
      tone: 'success',
    })

    const syncedPreview = buildSyncedDay({ ...previousDay, meals }, previousDay.consumed.waterMl)

    if (!isDayCompleted(previousDay) && isDayCompleted(syncedPreview)) {
      toast({
        title: `Dia completo +${DAY_STARS} estrelas`,
        description: 'Execucao excelente. Consistencia acima da media.',
        tone: 'secondary',
      })
    }
  }

  function handleMarkMealSkipped(mealId: string) {
    if (isOffline || !currentDay) {
      return
    }

    const meals = currentDay.meals.map((meal) => {
      if (meal.id !== mealId) {
        return meal
      }

      return {
        ...meal,
        status: 'skipped' as const,
        completedAt: undefined,
      }
    })

    syncDayFromMeals(currentDay.date, meals)

    toast({
      title: 'Refeicao marcada como pulada',
      description: 'Voce pode desfazer essa acao a qualquer momento.',
      tone: 'warning',
    })
  }

  function handleUndoSkippedMeal(mealId: string) {
    if (isOffline || !currentDay) {
      return
    }

    const meals = currentDay.meals.map((meal) => {
      if (meal.id !== mealId) {
        return meal
      }

      return {
        ...meal,
        status: 'pending' as const,
        completedAt: undefined,
      }
    })

    syncDayFromMeals(currentDay.date, meals)
  }

  function appendWaterEntry(ml: number) {
    if (!currentDay || ml <= 0 || isOffline) {
      return
    }

    const date = currentDay.date
    const currentEntries = waterLogsByDate[date]?.entries ?? []
    const nextEntry: WaterLogEntry = {
      id: `${date}-water-${crypto.randomUUID()}`,
      ml,
      at: new Date().toISOString(),
    }

    const nextEntries = [...currentEntries, nextEntry]

    setWaterLogsByDate((prev) => ({
      ...prev,
      [date]: { entries: nextEntries },
    }))

    const waterMl = nextEntries.reduce((sum, entry) => sum + entry.ml, 0)

    setDaysByDate((prev) => {
      const day = prev[date]
      if (!day) {
        return prev
      }

      const nextDay = buildSyncedDay(day, waterMl)

      return {
        ...prev,
        [date]: nextDay,
      }
    })

    toast({
      title: `+${ml} ml registrados`,
      description: 'Hidratacao atualizada com sucesso.',
      tone: 'secondary',
    })
  }

  function removeLastWaterEntry() {
    if (!currentDay || isOffline) {
      return
    }

    const date = currentDay.date
    const entries = waterLogsByDate[date]?.entries ?? []

    if (!entries.length) {
      return
    }

    const nextEntries = entries.slice(0, -1)

    setWaterLogsByDate((prev) => ({
      ...prev,
      [date]: { entries: nextEntries },
    }))

    const waterMl = nextEntries.reduce((sum, entry) => sum + entry.ml, 0)

    setDaysByDate((prev) => {
      const day = prev[date]
      if (!day) {
        return prev
      }

      return {
        ...prev,
        [date]: buildSyncedDay(day, waterMl),
      }
    })
  }

  function handleRetry() {
    setErroredDates((prev) => {
      const next = new Set(prev)
      next.delete(selectedDate)
      return next
    })

    setUiState('loading')
  }

  function handleSelectHistoryDate(date: string) {
    handleDateChange(date)
    setActiveTab('plan')
  }

  function handleSaveObservation(mealId: string) {
    toast({
      title: 'Observacao salva',
      description: `Observacao vinculada a refeicao ${mealId}.`,
      tone: 'neutral',
    })
  }

  const planSection =
    currentDay && uiState === 'ready' ? (
      <>
        <div className="space-y-3 lg:hidden">
          <DailySummaryCard day={currentDay} />
          <WaterCard day={currentDay} onQuickAdd={appendWaterEntry} onOpenEditor={() => setIsWaterEditorOpen(true)} isOffline={isOffline} />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Refeicoes</h2>
            <p className="text-sm text-muted-foreground">{currentDay.meals.length} refeicoes planejadas</p>
          </div>
          <MealsList
            meals={currentDay.meals}
            isOffline={isOffline}
            onRegisterMeal={handleRegisterMeal}
            onUndoSkipMeal={handleUndoSkippedMeal}
            onOpenMealDetails={handleOpenMealDetails}
          />
        </section>
      </>
    ) : null

  return (
    <section className="space-y-4 lg:space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Nutricao</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seu plano alimentar e sua hidratacao diaria.</p>
        </div>

        <FqButton
          size="md"
          tone="primary"
          leftIcon="check"
          className="min-h-11 lg:hidden"
          onClick={() => setQuickRegisterOpen(true)}
          isDisabled={isOffline || !pendingMeals.length}
        >
          Registrar refeicao
        </FqButton>
      </header>

      {isOffline ? (
        <FqAlert tone="warning" title="Voce esta offline">
          Algumas acoes estao temporariamente indisponiveis. Conecte-se para registrar refeicoes e agua.
        </FqAlert>
      ) : null}

      <DateSwitcher
        selectedDateLabel={formatTitleDate(selectedDate)}
        selectedPreset={selectedPreset}
        onPresetChange={(preset) => {
          if (preset === 'today') {
            handleDateChange(todayIso)
            return
          }
          if (preset === 'yesterday') {
            handleDateChange(yesterdayIso)
            return
          }
          handleDateChange(tomorrowIso)
        }}
        onOpenCalendar={() => {
          setCalendarDraft(selectedDate)
          setIsCalendarOpen(true)
        }}
      />

      {uiState === 'loading' ? <NutritionSkeleton /> : null}

      {uiState === 'error' ? (
        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <FqAlert tone="danger" title="Falha ao carregar plano do dia">
              Nao foi possivel carregar os dados de nutricao. Tente novamente.
            </FqAlert>
            <FqButton tone="danger" onClick={handleRetry} className="min-h-11">
              Tentar novamente
            </FqButton>
          </div>
        </FqCard>
      ) : null}

      {uiState === 'empty' ? (
        <FqEmptyState
          icon="utensils"
          title="Sem plano alimentar atribuido"
          description="Seu nutricionista ainda nao disponibilizou refeicoes para esta data."
          actionLabel="Solicitar plano ao nutricionista"
          onAction={() => {
            toast({
              title: 'Solicitacao enviada',
              description: 'Aviso registrado para o nutricionista responsavel.',
              tone: 'secondary',
            })
          }}
          secondaryAction={
            <FqButton variant="outline" tone="secondary" onClick={() => setUiState('loading')} className="min-h-11">
              Atualizar
            </FqButton>
          }
        />
      ) : null}

      {uiState === 'ready' && currentDay ? (
        <>
          <div className="hidden gap-6 lg:grid lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {planSection}

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Historico (7 dias)</h2>
                  <FqButton
                    variant="ghost"
                    tone="secondary"
                    className="min-h-11"
                    onClick={() => handleTabChange('history')}
                  >
                    Ver no modo historico
                  </FqButton>
                </div>
                <NutritionHistory days={historyDays} selectedDate={selectedDate} onSelectDate={handleSelectHistoryDate} />
              </section>
            </div>

            <aside className="space-y-4 lg:col-span-4">
              <DailySummaryCard day={currentDay} />
              <WaterCard day={currentDay} onQuickAdd={appendWaterEntry} onOpenEditor={() => setIsWaterEditorOpen(true)} isOffline={isOffline} />

              <FqCard className="border-border bg-card">
                <div className="space-y-2">
                  <p className="text-base font-semibold text-foreground">Insights</p>
                  <p className="text-sm text-muted-foreground">{insight}</p>
                </div>
              </FqCard>

              {isCompleted ? (
                <FqCard className="border-border bg-card">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-foreground">Conquista do dia</p>
                    <p className="inline-flex items-center gap-1 text-sm text-tertiary">
                      <FqIcon name="star" className="text-tertiary" ariaLabel="Estrelas" />+{currentDay.starsEarned ?? DAY_STARS} estrelas
                    </p>
                    <FqBadge tone="success">Dia completo</FqBadge>
                    <p className="text-sm text-muted-foreground">Excelente disciplina. Continue consistente para manter a sequencia.</p>
                  </div>
                </FqCard>
              ) : null}
            </aside>
          </div>

          <div className="space-y-4 lg:hidden">
            <FqTabs
              value={activeTab}
              onValueChange={handleTabChange}
              items={[
                { value: 'plan', label: 'Plano do dia', content: <div className="space-y-4">{planSection}</div> },
                {
                  value: 'history',
                  label: 'Historico',
                  content: <NutritionHistory days={historyDays} selectedDate={selectedDate} onSelectDate={handleSelectHistoryDate} />,
                },
              ]}
            />

            {isCompleted ? (
              <FqCard className="border-border bg-card">
                <div className="space-y-2">
                  <p className="text-base font-semibold text-foreground">Conquista do dia</p>
                  <p className="inline-flex items-center gap-1 text-sm text-tertiary">
                    <FqIcon name="star" className="text-tertiary" ariaLabel="Estrelas" />+{currentDay.starsEarned ?? DAY_STARS} estrelas
                  </p>
                  <FqBadge tone="success">Dia completo</FqBadge>
                </div>
              </FqCard>
            ) : null}
          </div>
        </>
      ) : null}

      <MealDetailSheet
        meal={selectedMeal}
        open={mealDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeMealDetails()
            return
          }

          setMealDetailOpen(true)
        }}
        isMobile={isMobile}
        observation={selectedObservation}
        isOffline={isOffline}
        onMarkDone={(mealId) => {
          handleRegisterMeal(mealId)
          setMealDetailOpen(false)
        }}
        onMarkSkipped={(mealId) => {
          handleMarkMealSkipped(mealId)
          setMealDetailOpen(false)
        }}
        onSaveObservation={handleSaveObservation}
        onChangeObservation={(value) => {
          if (!selectedMealId) {
            return
          }

          setObservationsByMealId((prev) => ({
            ...prev,
            [selectedMealId]: value,
          }))
        }}
      />

      <FqModal
        open={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        title="Selecionar data"
        description="Navegue para ontem, hoje, amanha ou qualquer dia especifico"
        footer={
          <div className="flex justify-end gap-2">
            <FqButton variant="ghost" tone="neutral" onClick={() => setIsCalendarOpen(false)} className="min-h-11">
              Cancelar
            </FqButton>
            <FqButton
              tone="secondary"
              onClick={() => {
                handleDateChange(calendarDraft)
                setIsCalendarOpen(false)
              }}
              className="min-h-11"
            >
              Aplicar
            </FqButton>
          </div>
        }
      >
        <FqDatePicker label="Data" value={calendarDraft} onChange={(event) => setCalendarDraft(event.target.value)} />
      </FqModal>

      <FqModal
        open={isWaterEditorOpen}
        onOpenChange={setIsWaterEditorOpen}
        title="Editar hidratacao"
        description="Registre um valor customizado ou remova o ultimo registro"
        footer={
          <div className="flex justify-end gap-2">
            <FqButton variant="ghost" tone="neutral" onClick={() => setIsWaterEditorOpen(false)} className="min-h-11">
              Fechar
            </FqButton>
            <FqButton
              tone="primary"
              onClick={() => {
                const parsed = Number(customWaterMl)
                if (!Number.isNaN(parsed) && parsed > 0) {
                  appendWaterEntry(parsed)
                  setIsWaterEditorOpen(false)
                }
              }}
              className="min-h-11"
              isDisabled={isOffline}
            >
              Registrar valor
            </FqButton>
          </div>
        }
      >
        <div className="space-y-4">
          <FqInput
            type="number"
            label="Quantidade em ml"
            min={50}
            step={50}
            value={customWaterMl}
            onChange={(event) => setCustomWaterMl(event.target.value)}
          />

          <FqButton
            variant="outline"
            tone="warning"
            leftIcon="minus"
            className="min-h-11 w-full"
            onClick={removeLastWaterEntry}
            isDisabled={isOffline}
          >
            Remover ultimo registro
          </FqButton>
        </div>
      </FqModal>

      <FqDrawer
        open={quickRegisterOpen}
        onOpenChange={setQuickRegisterOpen}
        title="Registrar refeicao"
        description="Escolha uma refeicao pendente para check-in rapido"
        side="right"
      >
        <div className="space-y-2">
          {pendingMeals.length ? (
            pendingMeals.map((meal) => (
              <FqCard key={meal.id} className="border-border bg-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{meal.name}</p>
                    <p className="text-sm text-muted-foreground">{meal.time}</p>
                  </div>
                  <FqButton
                    tone="primary"
                    size="md"
                    className="min-h-11"
                    onClick={() => {
                      handleRegisterMeal(meal.id)
                      setQuickRegisterOpen(false)
                    }}
                    isDisabled={isOffline}
                  >
                    Registrar
                  </FqButton>
                </div>
              </FqCard>
            ))
          ) : (
            <FqEmptyState
              icon="check"
              title="Nenhuma refeicao pendente"
              description="Todas as refeicoes do dia ja foram registradas."
            />
          )}
        </div>
      </FqDrawer>
    </section>
  )
}
