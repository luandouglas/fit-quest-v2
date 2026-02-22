import { useEffect, useMemo, useRef, useState } from 'react'

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
import { cx } from '@/shared/utils'

import { DailySummaryCard } from './components/DailySummaryCard'
import { DateSwitcher } from './components/DateSwitcher'
import { MealDetailSheet } from './components/MealDetailSheet'
import { MealsList } from './components/MealsList'
import { NutritionHistory } from './components/NutritionHistory'
import { NutritionSkeleton } from './components/NutritionSkeleton'
import { WaterCard } from './components/WaterCard'

type Macros = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type MealItem = {
  id: string
  label: string
  qty?: string
  macros?: Macros
}

export type Meal = {
  id: string
  name: string
  time: string
  status: 'pending' | 'done' | 'skipped'
  targetMacros: Macros
  items: MealItem[]
  completedAt?: string
  note?: string
}

export type WaterLogEntry = {
  id: string
  ml: number
  at: string
}

export type WaterLog = {
  entries: WaterLogEntry[]
}

export type NutritionDay = {
  date: string
  goals: Macros & { waterMl: number }
  consumed: Macros & { waterMl: number }
  meals: Meal[]
  notes?: string
  starsEarned?: number
  waterLog: WaterLog
}

export type NutritionHistoryDay = {
  date: string
  mealsDonePct: number
  calories: number
  waterMl: number
  status: 'ok' | 'pending'
}

type UiState = 'loading' | 'ready' | 'empty' | 'error'
type MobileSection = 'plan' | 'history'

const LOAD_DELAY_MS = 320

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(isoDate: string, offset: number) {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + offset)

  return toIsoDate(date)
}

function getNowIso() {
  return new Date().toISOString()
}

function calculateMacrosFromMeals(meals: Meal[]) {
  return meals.reduce<Macros>(
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
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  )
}

function calculateWater(entries: WaterLogEntry[]) {
  return entries.reduce((total, entry) => total + entry.ml, 0)
}

function recalculateDay(day: NutritionDay): NutritionDay {
  const mealMacros = calculateMacrosFromMeals(day.meals)
  const waterMl = calculateWater(day.waterLog.entries)

  return {
    ...day,
    consumed: {
      calories: mealMacros.calories,
      protein: mealMacros.protein,
      carbs: mealMacros.carbs,
      fat: mealMacros.fat,
      waterMl,
    },
  }
}

function cloneDay(day: NutritionDay): NutritionDay {
  return {
    ...day,
    goals: { ...day.goals },
    consumed: { ...day.consumed },
    meals: day.meals.map((meal) => ({
      ...meal,
      targetMacros: { ...meal.targetMacros },
      items: meal.items.map((item) => ({
        ...item,
        macros: item.macros ? { ...item.macros } : undefined,
      })),
    })),
    waterLog: {
      entries: day.waterLog.entries.map((entry) => ({ ...entry })),
    },
  }
}

function calculateMealCompletionPct(day: NutritionDay) {
  if (!day.meals.length) {
    return 0
  }

  const doneCount = day.meals.filter((meal) => meal.status === 'done').length
  return Math.round((doneCount / day.meals.length) * 100)
}

function isDayComplete(day: NutritionDay) {
  const hasMeals = day.meals.length > 0
  const allMealsDone = hasMeals && day.meals.every((meal) => meal.status === 'done')
  const waterDone = day.consumed.waterMl >= day.goals.waterMl

  return allMealsDone && waterDone
}

function createMealBlueprints() {
  return [
    {
      id: 'breakfast',
      name: 'Cafe da manha',
      time: '07:30',
      targetMacros: { calories: 430, protein: 30, carbs: 48, fat: 14 },
      items: [
        {
          id: 'breakfast-1',
          label: 'Omelete com 2 ovos e queijo branco',
          qty: '2 unidades',
          macros: { calories: 250, protein: 22, carbs: 4, fat: 16 },
        },
        {
          id: 'breakfast-2',
          label: 'Pao integral com fruta',
          qty: '1 porcao',
          macros: { calories: 180, protein: 8, carbs: 44, fat: 2 },
        },
      ],
    },
    {
      id: 'lunch',
      name: 'Almoco',
      time: '12:30',
      targetMacros: { calories: 680, protein: 44, carbs: 76, fat: 20 },
      items: [
        {
          id: 'lunch-1',
          label: 'Frango grelhado, arroz e feijao',
          qty: '150g + 120g + 80g',
          macros: { calories: 540, protein: 40, carbs: 70, fat: 12 },
        },
        {
          id: 'lunch-2',
          label: 'Salada com azeite',
          qty: '1 prato',
          macros: { calories: 140, protein: 4, carbs: 6, fat: 8 },
        },
      ],
    },
    {
      id: 'snack',
      name: 'Lanche',
      time: '16:30',
      targetMacros: { calories: 320, protein: 20, carbs: 28, fat: 10 },
      items: [
        {
          id: 'snack-1',
          label: 'Iogurte natural com aveia',
          qty: '1 pote + 30g',
          macros: { calories: 220, protein: 16, carbs: 22, fat: 6 },
        },
        {
          id: 'snack-2',
          label: 'Castanhas',
          qty: '20g',
          macros: { calories: 100, protein: 4, carbs: 6, fat: 4 },
        },
      ],
    },
    {
      id: 'dinner',
      name: 'Jantar',
      time: '20:00',
      targetMacros: { calories: 570, protein: 36, carbs: 56, fat: 18 },
      items: [
        {
          id: 'dinner-1',
          label: 'Peixe com batata doce e legumes',
          qty: '160g + 140g + 100g',
          macros: { calories: 520, protein: 34, carbs: 52, fat: 16 },
        },
        {
          id: 'dinner-2',
          label: 'Iogurte light',
          qty: '1 unidade',
          macros: { calories: 50, protein: 2, carbs: 4, fat: 2 },
        },
      ],
    },
  ]
}

function createMealsWithStatuses(statuses: Array<Meal['status']>): Meal[] {
  const blueprints = createMealBlueprints()

  return blueprints.map((blueprint, index) => ({
    ...blueprint,
    status: statuses[index] ?? 'pending',
    completedAt: statuses[index] === 'done' ? getNowIso() : undefined,
    note: '',
  }))
}

function createDay(date: string, statuses: Array<Meal['status']>, waterEntries: Array<{ ml: number }>, starsEarned = 12): NutritionDay {
  const goals = {
    calories: 2200,
    protein: 130,
    carbs: 250,
    fat: 70,
    waterMl: 2500,
  }

  const day: NutritionDay = {
    date,
    goals,
    consumed: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      waterMl: 0,
    },
    meals: createMealsWithStatuses(statuses),
    starsEarned,
    waterLog: {
      entries: waterEntries.map((entry, index) => ({
        id: `${date}-water-${index + 1}`,
        ml: entry.ml,
        at: getNowIso(),
      })),
    },
  }

  return recalculateDay(day)
}

function createMockNutritionDays(todayDate: string): Record<string, NutritionDay> {
  const map: Record<string, NutritionDay> = {}

  map[todayDate] = createDay(todayDate, ['done', 'pending', 'pending', 'pending'], [{ ml: 300 }, { ml: 300 }, { ml: 500 }], 15)
  map[addDays(todayDate, -1)] = createDay(addDays(todayDate, -1), ['done', 'done', 'done', 'done'], [{ ml: 500 }, { ml: 500 }, { ml: 500 }, { ml: 500 }, { ml: 500 }], 15)
  map[addDays(todayDate, 1)] = createDay(addDays(todayDate, 1), ['pending', 'pending', 'pending', 'pending'], [{ ml: 0 }], 12)
  map[addDays(todayDate, -2)] = createDay(addDays(todayDate, -2), ['done', 'done', 'pending', 'done'], [{ ml: 500 }, { ml: 300 }, { ml: 300 }], 8)
  map[addDays(todayDate, -3)] = createDay(addDays(todayDate, -3), ['done', 'done', 'done', 'pending'], [{ ml: 500 }, { ml: 500 }, { ml: 300 }], 10)
  map[addDays(todayDate, -4)] = createDay(addDays(todayDate, -4), ['done', 'pending', 'pending', 'pending'], [{ ml: 300 }, { ml: 300 }], 6)
  map[addDays(todayDate, -5)] = createDay(addDays(todayDate, -5), ['done', 'done', 'done', 'pending'], [{ ml: 500 }, { ml: 500 }, { ml: 500 }], 10)
  map[addDays(todayDate, -6)] = createDay(addDays(todayDate, -6), ['pending', 'pending', 'pending', 'pending'], [{ ml: 300 }], 4)

  return map
}

function buildHistory(daysByDate: Record<string, NutritionDay>, anchorDate: string): NutritionHistoryDay[] {
  return Array.from({ length: 7 }, (_, index) => addDays(anchorDate, -index)).map((date) => {
    const day = daysByDate[date]

    if (!day) {
      return {
        date,
        mealsDonePct: 0,
        calories: 0,
        waterMl: 0,
        status: 'pending',
      }
    }

    const mealsDonePct = calculateMealCompletionPct(day)
    const status = isDayComplete(day) ? 'ok' : 'pending'

    return {
      date,
      mealsDonePct,
      calories: day.consumed.calories,
      waterMl: day.consumed.waterMl,
      status,
    }
  })
}

function getInsightMessage(day: NutritionDay) {
  const proteinLeft = Math.max(day.goals.protein - day.consumed.protein, 0)
  const waterLeft = Math.max(day.goals.waterMl - day.consumed.waterMl, 0)

  if (proteinLeft > 0) {
    return `Voce esta a ${proteinLeft}g de proteina da meta diaria.`
  }

  if (waterLeft > 0) {
    return `Faltam ${waterLeft} ml de agua para bater sua hidratacao.`
  }

  return 'Otimo ritmo hoje. Continue consistente nas proximas refeicoes.'
}

export function NutritionPage() {
  const todayDate = useMemo(() => toIsoDate(new Date()), [])
  const yesterdayDate = useMemo(() => addDays(todayDate, -1), [todayDate])
  const tomorrowDate = useMemo(() => addDays(todayDate, 1), [todayDate])
  const transientErrorDate = useMemo(() => addDays(todayDate, -5), [todayDate])

  const [daysByDate, setDaysByDate] = useState<Record<string, NutritionDay>>(() => createMockNutritionDays(todayDate))
  const [selectedDate, setSelectedDate] = useState(todayDate)
  const [uiState, setUiState] = useState<UiState>('loading')
  const [currentDay, setCurrentDay] = useState<NutritionDay | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [failedDates, setFailedDates] = useState<string[]>([])
  const [mobileSection, setMobileSection] = useState<MobileSection>('plan')

  const [isMealSheetOpen, setIsMealSheetOpen] = useState(false)
  const [activeMealId, setActiveMealId] = useState<string | null>(null)
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false)

  const [isWaterEditorOpen, setIsWaterEditorOpen] = useState(false)
  const [customWaterValue, setCustomWaterValue] = useState('')

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarDraftDate, setCalendarDraftDate] = useState(todayDate)

  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)

  const [toastItem, setToastItem] = useState<FqToastItem | null>(null)

  const loadTimerRef = useRef<number | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const failedDatesRef = useRef<string[]>(failedDates)
  const daysByDateRef = useRef<Record<string, NutritionDay>>(daysByDate)

  useEffect(() => {
    daysByDateRef.current = daysByDate
  }, [daysByDate])

  useEffect(() => {
    failedDatesRef.current = failedDates
  }, [failedDates])

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
    if (loadTimerRef.current) {
      window.clearTimeout(loadTimerRef.current)
    }

    loadTimerRef.current = window.setTimeout(() => {
      if (selectedDate === transientErrorDate && !failedDatesRef.current.includes(selectedDate)) {
        setFailedDates((prev) => [...prev, selectedDate])
        setCurrentDay(null)
        setUiState('error')
        return
      }

      const storedDay = daysByDateRef.current[selectedDate]

      if (!storedDay) {
        setCurrentDay(null)
        setUiState('empty')
        return
      }

      const normalizedDay = recalculateDay(cloneDay(storedDay))
      setCurrentDay(normalizedDay)
      setUiState(normalizedDay.meals.length ? 'ready' : 'empty')
    }, LOAD_DELAY_MS)

    return () => {
      if (loadTimerRef.current) {
        window.clearTimeout(loadTimerRef.current)
      }
    }
  }, [reloadKey, selectedDate, transientErrorDate])

  useEffect(() => {
    if (!toastItem) {
      return
    }

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    const duration = toastItem.duration ?? 2600

    toastTimerRef.current = window.setTimeout(() => {
      setToastItem(null)
    }, duration)

    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [toastItem])

  const historyDays = useMemo(() => buildHistory(daysByDate, todayDate), [daysByDate, todayDate])

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

    setCurrentDay(updated)
    setDaysByDate((prev) => ({
      ...prev,
      [updated.date]: updated,
    }))
    setUiState(updated.meals.length ? 'ready' : 'empty')

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
    setUiState('loading')
    setSelectedDate(date)
    setMobileSection('plan')
  }

  function handleRetry() {
    setUiState('loading')
    setReloadKey((value) => value + 1)
  }

  function handleRegisterMeal(mealId: string) {
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
      return
    }

    pushToast('Refeicao registrada', 'Registro salvo para o plano de hoje.', 'success')
  }

  function handleToggleMealSkipped(mealId: string) {
    if (!currentDay) {
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
  }

  function handleOpenMealDetails(mealId: string) {
    setActiveMealId(mealId)
    setIsMealSheetOpen(true)
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
  }

  function handleApplyCalendarDate() {
    setIsCalendarOpen(false)
    setUiState('loading')
    setSelectedDate(calendarDraftDate)
    setMobileSection('plan')
  }

  if (uiState === 'loading') {
    return (
      <section className="space-y-5">
        <header className="space-y-1">
          <FqText as="h1" variant="title" className="text-lg text-foreground">
            Nutricao
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Plano do dia, macros e hidratacao.
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
            Plano do dia, macros e hidratacao.
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
            Plano do dia, macros e hidratacao.
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
            Registre refeicoes, acompanhe macros e hidrate-se melhor.
          </FqText>
        </div>

        <div className="lg:hidden">
          <FqButton
            leftIcon="plus"
            tone="primary"
            onClick={() => setIsQuickRegisterOpen(true)}
            isDisabled={isOffline}
          >
            Registrar refeicao
          </FqButton>
        </div>
      </header>

      {isOffline ? (
        <FqAlert tone="warning" title="Voce esta offline">
          Algumas acoes serao bloqueadas ate a conexao voltar.
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
          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <FqButton
              variant={mobileSection === 'plan' ? 'solid' : 'outline'}
              tone={mobileSection === 'plan' ? 'primary' : 'neutral'}
              onClick={() => setMobileSection('plan')}
            >
              Plano
            </FqButton>
            <FqButton
              variant={mobileSection === 'history' ? 'solid' : 'outline'}
              tone={mobileSection === 'history' ? 'secondary' : 'neutral'}
              onClick={() => setMobileSection('history')}
            >
              Historico
            </FqButton>
          </div>

          <div className={cx(mobileSection === 'plan' ? 'block' : 'hidden', 'lg:block')}>
            <MealsList
              meals={currentDay.meals}
              isOffline={isOffline}
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
                setUiState('loading')
                setSelectedDate(date)
                setMobileSection('plan')
              }}
            />
          </div>
        </div>

        <aside className="order-1 space-y-4 lg:order-2 lg:col-span-4 lg:sticky lg:top-5 lg:h-fit">
          <DailySummaryCard day={currentDay} mealCompletionPct={mealCompletionPct} isDayComplete={dayCompleted} />

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
        onOpenChange={(open) => {
          setIsMealSheetOpen(open)
          if (!open) {
            setActiveMealId(null)
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
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-3 text-left transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
