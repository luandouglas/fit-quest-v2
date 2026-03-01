import { useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'

import {
  FqAlert,
  FqButton,
  FqCard,
  FqDatePicker,
  FqDivider,
  FqDrawer,
  FqEmptyState,
  FqInput,
  FqModal,
  FqTag,
  FqText,
  FqToast,
  type FqToastItem,
} from '@/shared/ui'
import { type Meal, type NutritionDay } from '@/shared/services'
import { cx } from '@/shared/utils'

import { useMealsHistory } from '../hooks/useMealsHistory'
import { useNutritionSummary } from '../hooks/useNutritionSummary'
import {
  addDays,
  calculateMealCompletionPct,
  cloneDay,
  getInsightMessage,
  getNowIso,
  isDayComplete,
  recalculateDay,
  toIsoDate,
} from '../hooks/nutritionUtils'
import { DailySummaryCard } from './components/DailySummaryCard'
import { DateSwitcher } from './components/DateSwitcher'
import { MealDetailSheet } from './components/MealDetailSheet'
import { MealsList } from './components/MealsList'
import { NutritionHistory } from './components/NutritionHistory'
import { NutritionSkeleton } from './components/NutritionSkeleton'
import { WaterCard } from './components/WaterCard'

export type { Macros, Meal, MealItem, NutritionDay, NutritionHistoryDay, WaterLogEntry } from '@/shared/services'

type MobileSection = 'plan' | 'history'

function getNutritionBasePath(pathname: string) {
  return pathname.startsWith('/nutrition') ? '/nutrition' : '/tabs/nutrition'
}


export function NutritionPage() {
  const history = useHistory()
  const location = useLocation()
  const historyMatch = useRouteMatch(['/tabs/nutrition/history', '/nutrition/history'])
  const mealMatch = useRouteMatch<{ mealId: string }>(['/tabs/nutrition/meal/:mealId', '/nutrition/meal/:mealId'])

  const todayDate = useMemo(() => toIsoDate(new Date()), [])
  const yesterdayDate = useMemo(() => addDays(todayDate, -1), [todayDate])
  const tomorrowDate = useMemo(() => addDays(todayDate, 1), [todayDate])
  const [selectedDate, setSelectedDate] = useState(todayDate)
  const [mobileSectionState, setMobileSectionState] = useState<MobileSection>('plan')

  const [isMealSheetOpenState, setIsMealSheetOpenState] = useState(false)
  const [activeMealIdState, setActiveMealIdState] = useState<string | null>(null)
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false)

  const [isWaterEditorOpen, setIsWaterEditorOpen] = useState(false)
  const [customWaterValue, setCustomWaterValue] = useState('')

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarDraftDate, setCalendarDraftDate] = useState(todayDate)

  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)

  const [toastItem, setToastItem] = useState<FqToastItem | null>(null)
  const { daysByDate, currentDay, uiState, refresh, updateDaysByDate, invalidate } = useNutritionSummary({
    anchorDate: todayDate,
    selectedDate,
  })

  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    if (!toastItem) {
      return
    }

    const duration = toastItem.duration ?? 2600

    const timeoutId = window.setTimeout(() => {
      setToastItem(null)
    }, duration)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toastItem])

  const historyDays = useMealsHistory(daysByDate, todayDate)
  const routeMealId = mealMatch?.params.mealId ?? null
  const activeMealId = routeMealId ?? activeMealIdState
  const isMealSheetOpen = routeMealId ? true : isMealSheetOpenState
  const mobileSection = historyMatch ? 'history' : mobileSectionState

  const selectedMeal = useMemo(() => {
    if (!currentDay || !activeMealId) {
      return null
    }

    return currentDay.meals.find((meal) => meal.id === activeMealId) ?? null
  }, [activeMealId, currentDay])

  const pendingMeals = useMemo(() => {
    if (!currentDay) {
      return []
    }

    return currentDay.meals.filter((meal) => meal.status === 'pending')
  }, [currentDay])

  const mealCompletionPct = useMemo(() => {
    if (!currentDay) {
      return 0
    }

    return calculateMealCompletionPct(currentDay)
  }, [currentDay])

  const dayCompleted = useMemo(() => {
    if (!currentDay) {
      return false
    }

    return isDayComplete(currentDay)
  }, [currentDay])
  const isTodaySelected = selectedDate === todayDate
  const isMealRegistrationLocked = !isTodaySelected

  const insightMessage = useMemo(() => {
    if (!currentDay) {
      return 'Carregando insights do dia.'
    }

    return getInsightMessage(currentDay)
  }, [currentDay])

  function pushToast(title: string, description: string, tone: FqToastItem['tone'] = 'neutral') {
    setToastItem({
      id: crypto.randomUUID(),
      title,
      description,
      tone,
      duration: 2600,
    })
  }

  function applySelectedDayUpdate(mutator: (day: NutritionDay) => NutritionDay) {
    if (!currentDay) {
      return null
    }

    const draft = cloneDay(currentDay)
    const updated = recalculateDay(mutator(draft))

    updateDaysByDate((previous) => ({
      ...previous,
      [updated.date]: updated,
    }))

    return updated
  }

  function setMealStatus(mealId: string, nextStatus: Meal['status']) {
    return applySelectedDayUpdate((day) => ({
      ...day,
      meals: day.meals.map((meal) => {
        if (meal.id !== mealId) {
          return meal
        }

        return {
          ...meal,
          status: nextStatus,
          completedAt: nextStatus === 'done' ? getNowIso() : undefined,
        }
      }),
    }))
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setMobileSectionState('plan')

    const basePath = getNutritionBasePath(location.pathname)
    if (location.pathname !== basePath) {
      history.replace(basePath)
    }
  }

  function handleRetry() {
    void refresh()
  }

  function handleRegisterMeal(mealId: string) {
    if (isMealRegistrationLocked) {
      pushToast('Registro indisponivel', 'Voce so pode registrar refeicoes do dia de hoje.', 'warning')
      return
    }

    if (isOffline) {
      pushToast('Sem conexao', 'Conecte-se para registrar refeicoes.', 'warning')
      return
    }

    const updatedDay = setMealStatus(mealId, 'done')

    if (!updatedDay) {
      return
    }

    if (isDayComplete(updatedDay)) {
      pushToast('Dia completo', `Parabens. +${updatedDay.starsEarned ?? 0} estrelas liberadas.`, 'success')
      void invalidate()
      return
    }

    pushToast('Refeicao registrada', 'Registro salvo para o plano de hoje.', 'success')
    void invalidate()
  }

  function handleToggleMealSkipped(mealId: string) {
    if (!currentDay) {
      return
    }

    if (isMealRegistrationLocked) {
      pushToast('Registro indisponivel', 'Voce so pode registrar refeicoes do dia de hoje.', 'warning')
      return
    }

    if (isOffline) {
      pushToast('Sem conexao', 'Nao foi possivel alterar o status agora.', 'warning')
      return
    }

    const meal = currentDay.meals.find((item) => item.id === mealId)

    if (!meal) {
      return
    }

    const nextStatus: Meal['status'] = meal.status === 'skipped' ? 'pending' : 'skipped'
    const updatedDay = setMealStatus(mealId, nextStatus)

    if (!updatedDay) {
      return
    }

    pushToast(
      nextStatus === 'skipped' ? 'Refeicao marcada como pulada' : 'Refeicao reaberta',
      nextStatus === 'skipped' ? 'Voce pode retomar esse check-in a qualquer momento.' : 'Status voltou para pendente.',
      nextStatus === 'skipped' ? 'warning' : 'neutral',
    )
    void invalidate()
  }

  function handleOpenMealDetails(mealId: string) {
    setActiveMealIdState(mealId)
    setIsMealSheetOpenState(true)

    const basePath = getNutritionBasePath(location.pathname)
    history.replace(`${basePath}/meal/${mealId}`)
  }

  function handleMealNoteChange(value: string) {
    if (!activeMealId) {
      return
    }

    applySelectedDayUpdate((day) => ({
      ...day,
      meals: day.meals.map((meal) => (meal.id === activeMealId ? { ...meal, note: value } : meal)),
    }))
  }

  function handleQuickAddWater(ml: number) {
    if (isOffline) {
      pushToast('Sem conexao', 'Conecte-se para registrar agua.', 'warning')
      return
    }

    const updatedDay = applySelectedDayUpdate((day) => ({
      ...day,
      waterLog: {
        entries: [
          ...day.waterLog.entries,
          {
            id: crypto.randomUUID(),
            ml,
            at: getNowIso(),
          },
        ],
      },
    }))

    if (!updatedDay) {
      return
    }

    pushToast('Hidratacao registrada', `+${ml} ml adicionados.`, 'secondary')
    void invalidate()
  }

  function handleAddCustomWater() {
    if (isOffline) {
      pushToast('Sem conexao', 'Conecte-se para registrar agua.', 'warning')
      return
    }

    const numericValue = Number(customWaterValue)

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      pushToast('Valor invalido', 'Informe um valor de agua maior que zero.', 'warning')
      return
    }

    handleQuickAddWater(Math.round(numericValue))
    setCustomWaterValue('')
  }

  function handleRemoveLastWaterEntry() {
    if (!currentDay || !currentDay.waterLog.entries.length) {
      return
    }

    if (isOffline) {
      pushToast('Sem conexao', 'Conecte-se para editar hidratacao.', 'warning')
      return
    }

    const updatedDay = applySelectedDayUpdate((day) => ({
      ...day,
      waterLog: {
        entries: day.waterLog.entries.slice(0, -1),
      },
    }))

    if (!updatedDay) {
      return
    }

    pushToast('Ultimo registro removido', 'A hidratacao foi ajustada.', 'neutral')
    void invalidate()
  }

  function handleApplyCalendarDate() {
    setIsCalendarOpen(false)
    setSelectedDate(calendarDraftDate)
    setMobileSectionState('plan')
  }

  if (uiState === 'loading') {
    return (
      <section className="space-y-5">
        <header className="space-y-1">
          <FqText as="h1" variant="title" className="text-lg text-foreground">
            Nutricao
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Acompanhe sua alimentacao diaria.
          </FqText>
        </header>

        <DateSwitcher
          selectedDate={selectedDate}
          todayDate={todayDate}
          yesterdayDate={yesterdayDate}
          tomorrowDate={tomorrowDate}
          onSelectDate={handleSelectDate}
          onOpenCalendar={() => {
            setCalendarDraftDate(selectedDate)
            setIsCalendarOpen(true)
          }}
          isLoading
        />

        <NutritionSkeleton />
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="space-y-5">
        <header className="space-y-1">
          <FqText as="h1" variant="title" className="text-lg text-foreground">
            Nutricao
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Acompanhe sua alimentacao diaria.
          </FqText>
        </header>

        <DateSwitcher
          selectedDate={selectedDate}
          todayDate={todayDate}
          yesterdayDate={yesterdayDate}
          tomorrowDate={tomorrowDate}
          onSelectDate={handleSelectDate}
          onOpenCalendar={() => {
            setCalendarDraftDate(selectedDate)
            setIsCalendarOpen(true)
          }}
        />

        <FqAlert tone="danger" title="Falha ao carregar seu plano alimentar">
          Tente novamente em instantes para recuperar os dados do dia.
        </FqAlert>

        <FqButton onClick={handleRetry} leftIcon="arrowRight">
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty') {
    return (
      <section className="space-y-5">
        <header className="space-y-1">
          <FqText as="h1" variant="title" className="text-lg text-foreground">
            Nutricao
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Acompanhe sua alimentacao diaria.
          </FqText>
        </header>

        <DateSwitcher
          selectedDate={selectedDate}
          todayDate={todayDate}
          yesterdayDate={yesterdayDate}
          tomorrowDate={tomorrowDate}
          onSelectDate={handleSelectDate}
          onOpenCalendar={() => {
            setCalendarDraftDate(selectedDate)
            setIsCalendarOpen(true)
          }}
        />

        <FqEmptyState
          icon="utensils"
          title="Sem plano alimentar para este dia"
          description="Selecione outra data ou solicite o plano ao seu nutricionista para continuar seus registros."
          actionLabel="Solicitar plano ao nutricionista"
          onAction={() => pushToast('Solicitacao enviada', 'Seu nutricionista recebera a solicitacao em breve.', 'secondary')}
          secondaryAction={
            <FqButton variant="outline" tone="neutral" onClick={handleRetry}>
              Atualizar
            </FqButton>
          }
        />
      </section>
    )
  }

  if (!currentDay) {
    return null
  }

  return (
    <section className="space-y-5 pb-2">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <FqText as="h1" variant="title" className="text-lg text-foreground">
            Nutricao
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Acompanhe sua alimentacao diaria.
          </FqText>
        </div>

        <FqButton
          leftIcon="plus"
          tone="primary"
          onClick={() => setIsQuickRegisterOpen(true)}
          isDisabled={isOffline || isMealRegistrationLocked}
          className="min-h-11"
        >
          Registrar
        </FqButton>
      </header>

      {isOffline ? (
        <FqAlert tone="warning" title="Voce esta offline">
          Algumas acoes serao bloqueadas ate a conexao voltar.
        </FqAlert>
      ) : null}

      {isMealRegistrationLocked ? (
        <FqAlert tone="warning" title="Registro bloqueado para esta data">
          O aluno pode registrar refeicoes somente no dia atual.
        </FqAlert>
      ) : null}

      <DateSwitcher
        selectedDate={selectedDate}
        todayDate={todayDate}
        yesterdayDate={yesterdayDate}
        tomorrowDate={tomorrowDate}
        onSelectDate={handleSelectDate}
        onOpenCalendar={() => {
          setCalendarDraftDate(selectedDate)
          setIsCalendarOpen(true)
        }}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-8">
          <DailySummaryCard day={currentDay} mealCompletionPct={mealCompletionPct} isDayComplete={dayCompleted} />

          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <FqButton
              variant={mobileSection === 'plan' ? 'solid' : 'outline'}
              tone={mobileSection === 'plan' ? 'primary' : 'neutral'}
              onClick={() => {
                setMobileSectionState('plan')
                const basePath = getNutritionBasePath(location.pathname)
                if (location.pathname !== basePath) {
                  history.replace(basePath)
                }
              }}
            >
              Plano
            </FqButton>
            <FqButton
              variant={mobileSection === 'history' ? 'solid' : 'outline'}
              tone={mobileSection === 'history' ? 'secondary' : 'neutral'}
              onClick={() => {
                setMobileSectionState('history')
                const basePath = getNutritionBasePath(location.pathname)
                if (location.pathname !== `${basePath}/history`) {
                  history.replace(`${basePath}/history`)
                }
              }}
            >
              Historico
            </FqButton>
          </div>

          <div className={cx(mobileSection === 'plan' ? 'block' : 'hidden', 'lg:block')}>
            <MealsList
              meals={currentDay.meals}
              isOffline={isOffline}
              isDateLocked={isMealRegistrationLocked}
              onRegisterMeal={handleRegisterMeal}
              onToggleMealSkipped={handleToggleMealSkipped}
              onOpenMeal={handleOpenMealDetails}
            />
          </div>

          <div className={cx(mobileSection === 'history' ? 'block' : 'hidden', 'lg:block')}>
            <NutritionHistory
              days={historyDays}
              selectedDate={selectedDate}
              onOpenDay={(date) => {
                setSelectedDate(date)
                setMobileSectionState('plan')
                const basePath = getNutritionBasePath(location.pathname)
                if (location.pathname !== basePath) {
                  history.replace(basePath)
                }
              }}
            />
          </div>
        </div>

        <aside className="order-1 space-y-4 lg:order-2 lg:col-span-4 lg:sticky lg:top-5 lg:h-fit">
          <WaterCard
            consumedMl={currentDay.consumed.waterMl}
            goalMl={currentDay.goals.waterMl}
            onQuickAdd={handleQuickAddWater}
            onOpenEditor={() => setIsWaterEditorOpen(true)}
            isDisabled={isOffline}
          />

          <FqCard className="border-border bg-card">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Insights</p>
              <p className="text-sm text-foreground">{insightMessage}</p>
              <FqDivider className="bg-border" />
              <p className="text-xs text-muted-foreground">
                Foque em manter consistencia. Pequenos check-ins diarios acumulam grandes resultados.
              </p>
            </div>
          </FqCard>

          <FqCard className="border-border bg-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">Conquista do dia</p>
                <FqTag tone="neutral" className="rounded-lg px-2 py-1 text-[11px] normal-case tracking-normal">
                  Estrelas
                </FqTag>
              </div>

              {dayCompleted ? (
                <p className="text-sm text-foreground">
                  Dia completo: refeicoes registradas + meta de agua. <span className="font-semibold text-gamification">+{currentDay.starsEarned ?? 0} estrelas</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete refeicoes e agua para liberar as estrelas de hoje.
                </p>
              )}
            </div>
          </FqCard>
        </aside>
      </div>

      <MealDetailSheet
        open={isMealSheetOpen}
        meal={selectedMeal}
        note={selectedMeal?.note ?? ''}
        isOffline={isOffline}
        isDateLocked={isMealRegistrationLocked}
        onOpenChange={(open) => {
          setIsMealSheetOpenState(open)
          if (!open) {
            setActiveMealIdState(null)
            const basePath = getNutritionBasePath(location.pathname)
            const nextPath = mobileSection === 'history' ? `${basePath}/history` : basePath
            if (location.pathname !== nextPath) {
              history.replace(nextPath)
            }
          }
        }}
        onNoteChange={handleMealNoteChange}
        onMarkDone={() => {
          if (!selectedMeal) {
            return
          }

          handleRegisterMeal(selectedMeal.id)
        }}
        onMarkSkipped={() => {
          if (!selectedMeal) {
            return
          }

          handleToggleMealSkipped(selectedMeal.id)
        }}
      />

      <FqDrawer
        open={isQuickRegisterOpen}
        onOpenChange={setIsQuickRegisterOpen}
        side="right"
        title="Registrar refeicao"
        description="Selecione uma refeicao pendente para check-in rapido."
        className="border-border bg-card"
      >
        <div className="space-y-2 pb-4">
          {pendingMeals.length ? (
            pendingMeals.map((meal) => (
              <button
                key={meal.id}
                type="button"
                onClick={() => {
                  handleRegisterMeal(meal.id)
                  setIsQuickRegisterOpen(false)
                }}
                disabled={isOffline || isMealRegistrationLocked}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-3 text-left transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Registrar ${meal.name}`}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.time}</p>
                </div>
                <FqTag tone="warning" className="rounded-lg px-2 py-1 text-[11px] normal-case tracking-normal">
                  Pendente
                </FqTag>
              </button>
            ))
          ) : (
            <FqEmptyState
              icon="check"
              title="Sem refeicoes pendentes"
              description="Todas as refeicoes deste dia ja foram registradas."
            />
          )}
        </div>
      </FqDrawer>

      <FqModal
        open={isWaterEditorOpen}
        onOpenChange={setIsWaterEditorOpen}
        title="Editar agua do dia"
        description="Registre um valor customizado ou remova o ultimo lancamento."
      >
        <div className="space-y-3">
          <FqInput
            label="Quantidade (ml)"
            type="number"
            value={customWaterValue}
            onChange={(event) => setCustomWaterValue(event.target.value)}
            placeholder="Ex.: 250"
            min={1}
            variant="outline"
            tone="secondary"
          />

          <div className="flex flex-wrap gap-2">
            <FqButton onClick={handleAddCustomWater} isDisabled={isOffline}>
              Adicionar valor
            </FqButton>
            <FqButton
              tone="neutral"
              variant="outline"
              onClick={handleRemoveLastWaterEntry}
              isDisabled={isOffline || currentDay.waterLog.entries.length === 0}
            >
              Remover ultimo
            </FqButton>
          </div>
        </div>
      </FqModal>

      <FqModal
        open={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        title="Selecionar data"
        description="Escolha um dia para visualizar o plano alimentar."
        footer={
          <div className="flex justify-end gap-2">
            <FqButton variant="outline" tone="neutral" onClick={() => setIsCalendarOpen(false)}>
              Cancelar
            </FqButton>
            <FqButton onClick={handleApplyCalendarDate}>Aplicar</FqButton>
          </div>
        }
      >
        <FqDatePicker
          label="Data"
          value={calendarDraftDate}
          onChange={(event) => setCalendarDraftDate(event.target.value)}
          max={addDays(todayDate, 30)}
          min={addDays(todayDate, -30)}
        />
      </FqModal>

      {toastItem ? (
        <div className="pointer-events-none fixed right-3 top-3 z-[90]">
          <div className="pointer-events-auto">
            <FqToast item={toastItem} onDismiss={() => setToastItem(null)} />
          </div>
        </div>
      ) : null}
    </section>
  )
}
