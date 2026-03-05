import { useMemo, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { FqAlert, FqButton, FqCard, FqEmptyState, FqInput, FqSelect, FqText, useToast } from '@/shared/ui'
import type { CreateNutritionistDietInput } from '@/shared/services/contracts/nutritionist'
import type { ProgressOverview } from '@/shared/services/contracts/progress'

import { useNutritionistDashboard } from '../hooks/useNutritionistDashboard'

type NutritionistTab = 'dashboard' | 'students' | 'diets' | 'assessments' | 'progress'

type NutritionistSection = NutritionistTab

const sectionToTab: Record<NutritionistSection, NutritionistTab> = {
  dashboard: 'dashboard',
  students: 'students',
  diets: 'diets',
  assessments: 'assessments',
  progress: 'progress',
}

function resolveNutritionistTab(section?: string): NutritionistTab {
  if (!section) {
    return 'dashboard'
  }

  if (section in sectionToTab) {
    return sectionToTab[section as NutritionistSection]
  }

  return 'dashboard'
}

type MealDraft = {
  id: string
  name: string
  time: string
  calories: string
  protein: string
  carbs: string
  fat: string
}

function createMealDraft(partial?: Partial<MealDraft>): MealDraft {
  return {
    id: crypto.randomUUID(),
    name: partial?.name ?? '',
    time: partial?.time ?? '',
    calories: partial?.calories ?? '400',
    protein: partial?.protein ?? '25',
    carbs: partial?.carbs ?? '45',
    fat: partial?.fat ?? '12',
  }
}

export function NutritionistDashboardPage() {
  const history = useHistory()
  const location = useLocation()
  const { section } = useParams<{ section?: string }>()
  const { toast } = useToast()
  const {
    overview,
    uiState,
    error,
    refresh,
    createDiet,
    getStudentProgress,
    reviewStudentWeight,
    reviewStudentMeasurements,
    updateMeasurementsRequestStatus,
    sendMotivationalMessage,
    grantSpecialAchievement,
    isCreatingDiet,
    isReviewingWeight,
    isReviewingMeasurements,
    isUpdatingMeasurementsRequestStatus,
    isSendingMotivationalMessage,
    isGrantingSpecialAchievement,
  } = useNutritionistDashboard()

  const tab = resolveNutritionistTab(section)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [title, setTitle] = useState('Plano alimentar personalizado')
  const [dailyCalories, setDailyCalories] = useState('2200')
  const [proteinPct, setProteinPct] = useState('30')
  const [carbsPct, setCarbsPct] = useState('45')
  const [fatPct, setFatPct] = useState('25')
  const [meals, setMeals] = useState<MealDraft[]>([
    createMealDraft({ name: 'Cafe da manha', time: '07:30' }),
    createMealDraft({ name: 'Almoco', time: '12:30' }),
    createMealDraft({ name: 'Lanche', time: '16:30' }),
    createMealDraft({ name: 'Jantar', time: '20:00' }),
  ])
  const [assessmentStudentId, setAssessmentStudentId] = useState('')
  const [selectedWeightLogId, setSelectedWeightLogId] = useState('')
  const [reviewWeightKg, setReviewWeightKg] = useState('')
  const [selectedMeasurementLogId, setSelectedMeasurementLogId] = useState('')
  const [reviewMeasurements, setReviewMeasurements] = useState({
    chestCm: '',
    waistCm: '',
    hipsCm: '',
    armCm: '',
    thighCm: '',
  })
  const [reviewComment, setReviewComment] = useState('')
  const [studentProgress, setStudentProgress] = useState<ProgressOverview | null>(null)
  const [isLoadingStudentProgress, setIsLoadingStudentProgress] = useState(false)
  const [engagementStudentId, setEngagementStudentId] = useState('')
  const [motivationalMessage, setMotivationalMessage] = useState('')
  const [achievementTitle, setAchievementTitle] = useState('Conquista especial')
  const [achievementDescription, setAchievementDescription] = useState('')

  const studentOptions = useMemo(
    () => (overview?.students ?? []).map((student) => ({ value: student.id, label: student.name })),
    [overview?.students],
  )

  function handleChangeTab(nextTab: NutritionistTab) {
    const basePath = location.pathname.startsWith('/tabs/nutritionist') ? '/tabs/nutritionist' : '/nutritionist'
    history.replace(`${basePath}/${nextTab}`)
  }

  async function handleCreateDiet() {
    if (!selectedStudentId) {
      toast({
        title: 'Aluno obrigatorio',
        description: 'Selecione um aluno vinculado para criar o plano.',
        tone: 'warning',
      })
      return
    }

    const safeMeals = meals
      .map((meal) => ({
        name: meal.name.trim(),
        time: meal.time.trim(),
        calories: Number(meal.calories),
        protein: Number(meal.protein),
        carbs: Number(meal.carbs),
        fat: Number(meal.fat),
      }))
      .filter((meal) => meal.name && meal.time)

    if (!safeMeals.length) {
      toast({
        title: 'Refeicoes obrigatorias',
        description: 'Adicione ao menos uma refeicao valida com horario.',
        tone: 'warning',
      })
      return
    }

    const payload: CreateNutritionistDietInput = {
      studentId: selectedStudentId,
      title: title.trim() || 'Plano alimentar personalizado',
      dailyCalories: Math.max(1200, Math.round(Number(dailyCalories) || 0)),
      macroDistribution: {
        proteinPct: Math.max(5, Math.round(Number(proteinPct) || 0)),
        carbsPct: Math.max(5, Math.round(Number(carbsPct) || 0)),
        fatPct: Math.max(5, Math.round(Number(fatPct) || 0)),
      },
      meals: safeMeals.map((meal) => ({
        ...meal,
      })),
    }

    const totalMacroPct = payload.macroDistribution.proteinPct + payload.macroDistribution.carbsPct + payload.macroDistribution.fatPct
    if (totalMacroPct !== 100) {
      toast({
        title: 'Distribuicao invalida',
        description: 'A soma de proteina, carboidrato e gordura deve ser 100%.',
        tone: 'warning',
      })
      return
    }

    try {
      await createDiet(payload)
      toast({
        title: 'Plano alimentar vinculado',
        description: 'O aluno ja visualiza o novo plano automaticamente.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao criar plano',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleLoadStudentProgress(studentId: string) {
    if (!studentId) {
      return
    }

    try {
      setIsLoadingStudentProgress(true)
      const snapshot = await getStudentProgress(studentId)
      setStudentProgress(snapshot)
    } catch (requestError) {
      toast({
        title: 'Falha ao carregar historico',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    } finally {
      setIsLoadingStudentProgress(false)
    }
  }

  async function handleReviewWeight() {
    const parsedWeight = Number(reviewWeightKg)

    if (!assessmentStudentId || !selectedWeightLogId || !Number.isFinite(parsedWeight) || parsedWeight <= 0 || !reviewComment.trim()) {
      toast({
        title: 'Dados obrigatorios',
        description: 'Selecione um log de peso, informe valor valido e comentario tecnico.',
        tone: 'warning',
      })
      return
    }

    try {
      await reviewStudentWeight({
        studentId: assessmentStudentId,
        targetLogId: selectedWeightLogId,
        weightKg: parsedWeight,
        comment: reviewComment.trim(),
      })
      await handleLoadStudentProgress(assessmentStudentId)
      setReviewWeightKg('')
      setReviewComment('')
      toast({
        title: 'Peso revisado',
        description: 'Ajuste auditavel registrado no historico do aluno.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao revisar peso',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleReviewMeasurements() {
    const parsed = {
      chestCm: Number(reviewMeasurements.chestCm),
      waistCm: Number(reviewMeasurements.waistCm),
      hipsCm: Number(reviewMeasurements.hipsCm),
      armCm: Number(reviewMeasurements.armCm),
      thighCm: Number(reviewMeasurements.thighCm),
    }
    const values = [parsed.chestCm, parsed.waistCm, parsed.hipsCm, parsed.armCm, parsed.thighCm]

    if (!assessmentStudentId || !selectedMeasurementLogId || !reviewComment.trim() || values.some((value) => !Number.isFinite(value) || value <= 0)) {
      toast({
        title: 'Dados obrigatorios',
        description: 'Selecione um log de medidas, informe valores validos e comentario tecnico.',
        tone: 'warning',
      })
      return
    }

    try {
      await reviewStudentMeasurements({
        studentId: assessmentStudentId,
        targetLogId: selectedMeasurementLogId,
        measurements: {
          chestCm: Number(parsed.chestCm.toFixed(1)),
          waistCm: Number(parsed.waistCm.toFixed(1)),
          hipsCm: Number(parsed.hipsCm.toFixed(1)),
          armCm: Number(parsed.armCm.toFixed(1)),
          thighCm: Number(parsed.thighCm.toFixed(1)),
        },
        comment: reviewComment.trim(),
      })
      await handleLoadStudentProgress(assessmentStudentId)
      setReviewComment('')
      toast({
        title: 'Medidas revisadas',
        description: 'Ajuste auditavel de medidas foi registrado.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao revisar medidas',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleSendMotivation() {
    if (!engagementStudentId || !motivationalMessage.trim()) {
      toast({
        title: 'Aluno e mensagem obrigatorios',
        description: 'Selecione um aluno e escreva a mensagem motivacional.',
        tone: 'warning',
      })
      return
    }

    try {
      await sendMotivationalMessage({
        studentId: engagementStudentId,
        message: motivationalMessage.trim(),
      })
      setMotivationalMessage('')
      toast({
        title: 'Mensagem enviada',
        description: 'Notificacao enviada ao aluno.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao enviar mensagem',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleGrantAchievement() {
    if (!engagementStudentId || !achievementTitle.trim() || !achievementDescription.trim()) {
      toast({
        title: 'Dados obrigatorios',
        description: 'Selecione aluno, titulo e descricao da conquista.',
        tone: 'warning',
      })
      return
    }

    try {
      await grantSpecialAchievement({
        studentId: engagementStudentId,
        title: achievementTitle.trim(),
        description: achievementDescription.trim(),
      })
      setAchievementDescription('')
      toast({
        title: 'Conquista liberada',
        description: 'Conquista especial integrada com gamificacao e notificacoes.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao liberar conquista',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleUpdateMeasurementRequest(requestId: string, status: 'accepted' | 'done') {
    try {
      await updateMeasurementsRequestStatus({ requestId, status })
      toast({
        title: status === 'accepted' ? 'Solicitacao aceita' : 'Solicitacao concluida',
        description: 'Status atualizado e visivel para o aluno.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao atualizar solicitacao',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (uiState === 'loading') {
    return (
      <section className="fq-page-shell">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando painel do nutricionista...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell">
        <FqAlert tone="danger" title="Falha ao carregar painel do nutricionista">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar os dados agora.'}
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => void refresh()}>
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !overview) {
    return (
      <section className="fq-page-shell">
        <FqEmptyState icon="utensils" title="Sem dados do nutricionista" description="Nao foi possivel montar o painel." />
      </section>
    )
  }

  return (
    <section className="theme-nutritionist fq-page-shell">
      <header className="fq-page-header">
        <FqText as="h1" variant="title" className="role-heading text-lg">
          Painel do Nutricionista
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Gerencie alunos, dietas vinculadas e avaliacoes de adesao.
        </FqText>
      </header>

      <div className="flex flex-wrap gap-2">
        <FqButton
          size="sm"
          variant={tab === 'dashboard' ? 'solid' : 'outline'}
          tone={tab === 'dashboard' ? 'secondary' : 'neutral'}
          className={tab === 'dashboard' ? 'border-tertiary bg-tertiary text-tertiary-foreground hover:bg-tertiary/90' : undefined}
          onClick={() => handleChangeTab('dashboard')}
        >
          Dashboard
        </FqButton>
        <FqButton
          size="sm"
          variant={tab === 'students' ? 'solid' : 'outline'}
          tone={tab === 'students' ? 'secondary' : 'neutral'}
          className={tab === 'students' ? 'border-tertiary bg-tertiary text-tertiary-foreground hover:bg-tertiary/90' : undefined}
          onClick={() => handleChangeTab('students')}
        >
          Alunos
        </FqButton>
        <FqButton
          size="sm"
          variant={tab === 'diets' ? 'solid' : 'outline'}
          tone={tab === 'diets' ? 'secondary' : 'neutral'}
          className={tab === 'diets' ? 'border-tertiary bg-tertiary text-tertiary-foreground hover:bg-tertiary/90' : undefined}
          onClick={() => handleChangeTab('diets')}
        >
          Dietas
        </FqButton>
        <FqButton
          size="sm"
          variant={tab === 'assessments' ? 'solid' : 'outline'}
          tone={tab === 'assessments' ? 'secondary' : 'neutral'}
          className={tab === 'assessments' ? 'border-tertiary bg-tertiary text-tertiary-foreground hover:bg-tertiary/90' : undefined}
          onClick={() => handleChangeTab('assessments')}
        >
          Avaliacoes
        </FqButton>
        <FqButton
          size="sm"
          variant={tab === 'progress' ? 'solid' : 'outline'}
          tone={tab === 'progress' ? 'secondary' : 'neutral'}
          className={tab === 'progress' ? 'border-tertiary bg-tertiary text-tertiary-foreground hover:bg-tertiary/90' : undefined}
          onClick={() => handleChangeTab('progress')}
        >
          Progresso Nutricional
        </FqButton>
      </div>

      {tab === 'students' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {overview.students.map((student) => (
            <FqCard key={student.id} className="border-border bg-card">
              <div className="space-y-1">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {student.name}
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">{student.email}</FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  Plano ativo: {student.activeDietTitle ?? 'Nenhum'}
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  Meta calorica: {student.caloriesTarget} kcal
                </FqText>
              </div>
            </FqCard>
          ))}
        </div>
      ) : null}

      {tab === 'diets' ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <FqCard className="border-border bg-card lg:col-span-7" title="Criar plano alimentar" subtitle="Refeicoes por horario + meta calorica + macros.">
            <div className="space-y-3">
              <FqSelect
                label="Aluno"
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                options={studentOptions}
                placeholder="Selecione"
              />
              <FqInput label="Titulo da dieta" value={title} onChange={(event) => setTitle(event.target.value)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <FqInput label="Meta calorica diaria" type="number" min={1200} value={dailyCalories} onChange={(event) => setDailyCalories(event.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <FqInput label="% P" type="number" min={1} max={100} value={proteinPct} onChange={(event) => setProteinPct(event.target.value)} />
                  <FqInput label="% C" type="number" min={1} max={100} value={carbsPct} onChange={(event) => setCarbsPct(event.target.value)} />
                  <FqInput label="% G" type="number" min={1} max={100} value={fatPct} onChange={(event) => setFatPct(event.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  Refeicoes por horario
                </FqText>
                {meals.map((meal) => (
                  <div key={meal.id} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-6">
                    <FqInput
                      label="Refeicao"
                      value={meal.name}
                      onChange={(event) => setMeals((current) => current.map((item) => (item.id === meal.id ? { ...item, name: event.target.value } : item)))}
                    />
                    <FqInput
                      label="Horario"
                      value={meal.time}
                      onChange={(event) => setMeals((current) => current.map((item) => (item.id === meal.id ? { ...item, time: event.target.value } : item)))}
                    />
                    <FqInput
                      label="kcal"
                      type="number"
                      min={1}
                      value={meal.calories}
                      onChange={(event) => setMeals((current) => current.map((item) => (item.id === meal.id ? { ...item, calories: event.target.value } : item)))}
                    />
                    <FqInput
                      label="P (g)"
                      type="number"
                      min={0}
                      value={meal.protein}
                      onChange={(event) => setMeals((current) => current.map((item) => (item.id === meal.id ? { ...item, protein: event.target.value } : item)))}
                    />
                    <FqInput
                      label="C (g)"
                      type="number"
                      min={0}
                      value={meal.carbs}
                      onChange={(event) => setMeals((current) => current.map((item) => (item.id === meal.id ? { ...item, carbs: event.target.value } : item)))}
                    />
                    <FqInput
                      label="G (g)"
                      type="number"
                      min={0}
                      value={meal.fat}
                      onChange={(event) => setMeals((current) => current.map((item) => (item.id === meal.id ? { ...item, fat: event.target.value } : item)))}
                    />
                  </div>
                ))}

                <div className="flex gap-2">
                  <FqButton variant="outline" tone="neutral" onClick={() => setMeals((current) => [...current, createMealDraft()])}>
                    Adicionar refeicao
                  </FqButton>
                  <FqButton
                    variant="outline"
                    tone="warning"
                    onClick={() => setMeals((current) => (current.length > 1 ? current.slice(0, -1) : current))}
                    isDisabled={meals.length <= 1}
                  >
                    Remover ultima
                  </FqButton>
                </div>
              </div>

              <FqButton onClick={() => void handleCreateDiet()} isLoading={isCreatingDiet}>
                Vincular dieta ao aluno
              </FqButton>
            </div>
          </FqCard>

          <FqCard className="border-border bg-card lg:col-span-5" title="Dietas vinculadas" subtitle="Ultimos planos criados para alunos.">
            <div className="space-y-2">
              {overview.diets.length === 0 ? (
                <FqText as="p" className="text-sm text-muted-foreground">Nenhuma dieta vinculada ainda.</FqText>
              ) : (
                overview.diets.slice(0, 10).map((diet) => (
                  <div key={diet.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <FqText as="p" className="text-sm font-semibold text-foreground">{diet.title}</FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {diet.studentName} • {diet.dailyCalories} kcal • {diet.mealsCount} refeicoes
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      Macros: P {diet.macroDistribution.proteinPct}% • C {diet.macroDistribution.carbsPct}% • G {diet.macroDistribution.fatPct}%
                    </FqText>
                  </div>
                ))
              )}
            </div>
          </FqCard>
        </div>
      ) : null}

      {tab === 'dashboard' || tab === 'assessments' || tab === 'progress' ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FqCard className="border-border bg-card">
              <FqText as="p" className="text-xs text-muted-foreground">Consumo calorico medio (7d)</FqText>
              <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">
                {overview.assessments.length > 0
                  ? Math.round(overview.assessments.reduce((total, item) => total + item.avgCalories7d, 0) / overview.assessments.length)
                  : 0}{' '}
                kcal
              </FqText>
            </FqCard>
            <FqCard className="border-border bg-card">
              <FqText as="p" className="text-xs text-muted-foreground">Aderencia media (7d)</FqText>
              <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">
                {overview.assessments.length > 0
                  ? Math.round(overview.assessments.reduce((total, item) => total + item.adherencePct7d, 0) / overview.assessments.length)
                  : 0}
                %
              </FqText>
            </FqCard>
            <FqCard className="border-border bg-card">
              <FqText as="p" className="text-xs text-muted-foreground">Alunos fora da projecao</FqText>
              <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">
                {overview.assessments.filter((item) => item.alerts.some((alert) => alert.type === 'weight-off-track')).length}
              </FqText>
            </FqCard>
            <FqCard className="border-border bg-card">
              <FqText as="p" className="text-xs text-muted-foreground">Alertas ativos</FqText>
              <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">
                {overview.assessments.reduce((total, item) => total + item.alerts.length, 0)}
              </FqText>
            </FqCard>
          </div>

          <FqCard className="border-border bg-card" title="Visao nutricional por aluno" subtitle="Calculo automatico com consumo, dieta e progresso de peso.">
            {overview.assessments.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">Sem alunos vinculados.</FqText>
            ) : (
              <div className="space-y-2">
                {overview.assessments.map((assessment) => (
                  <div key={assessment.studentId} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <FqText as="p" className="text-sm font-semibold text-foreground">{assessment.studentName}</FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        Check-in: {assessment.lastCheckinAt ? new Date(assessment.lastCheckinAt).toLocaleString('pt-BR') : 'Sem registros'}
                      </FqText>
                    </div>
                    <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                      <FqText as="p" className="text-xs text-muted-foreground">
                        Consumo medio: {assessment.avgCalories7d} kcal (meta {assessment.calorieTargetDaily} kcal)
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        Aderencia dieta: {assessment.adherencePct7d}% • Calorias: {assessment.calorieAdherencePct7d}%
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        Peso atual: {assessment.weightCurrentKg !== null ? `${assessment.weightCurrentKg.toFixed(1)} kg` : 'Sem dado'}
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        Evolucao 30d: {assessment.weightDeltaKg30d !== null ? `${assessment.weightDeltaKg30d > 0 ? '+' : ''}${assessment.weightDeltaKg30d} kg` : 'Sem dado'}
                      </FqText>
                    </div>
                    <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                      Projecao: {assessment.projectedWeightKg !== null ? `${assessment.projectedWeightKg.toFixed(1)} kg` : 'Sem projecao'}{' '}
                      ({assessment.projectionDeltaKg !== null ? `${assessment.projectionDeltaKg > 0 ? '+' : ''}${assessment.projectionDeltaKg} kg` : 'n/a'})
                    </FqText>

                    {assessment.alerts.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {assessment.alerts.map((alert) => (
                          <FqText key={alert.id} as="p" className={`text-xs ${alert.severity === 'danger' ? 'text-rose-500' : 'text-amber-500'}`}>
                            {alert.type === 'goal-not-hit' ? 'Meta nao batida:' : 'Peso fora da projecao:'} {alert.message}
                          </FqText>
                        ))}
                      </div>
                    ) : (
                      <FqText as="p" className="mt-2 text-xs text-emerald-500">Sem alertas para este aluno.</FqText>
                    )}
                  </div>
                ))}
              </div>
            )}
          </FqCard>

          <FqCard className="border-border bg-card" title="Solicitacoes de medidas" subtitle="Requests de avaliacao enviados pelos alunos.">
            {overview.measurementRequests.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">Sem solicitacoes no momento.</FqText>
            ) : (
              <div className="space-y-2">
                {overview.measurementRequests.slice(0, 8).map((request) => (
                  <div key={request.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <FqText as="p" className="text-sm font-semibold text-foreground">{request.studentName}</FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleString('pt-BR')}</FqText>
                    </div>
                    <FqText as="p" className="text-xs text-muted-foreground">Status: {request.status}</FqText>
                    {request.note ? <FqText as="p" className="text-xs text-muted-foreground">Nota: {request.note}</FqText> : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="secondary"
                        onClick={() => void handleUpdateMeasurementRequest(request.id, 'accepted')}
                        isDisabled={request.status !== 'open'}
                        isLoading={isUpdatingMeasurementsRequestStatus}
                      >
                        Aceitar
                      </FqButton>
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="success"
                        onClick={() => void handleUpdateMeasurementRequest(request.id, 'done')}
                        isDisabled={request.status === 'done'}
                        isLoading={isUpdatingMeasurementsRequestStatus}
                      >
                        Marcar como concluida
                      </FqButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FqCard>

          <div className="grid gap-4 lg:grid-cols-12">
            <FqCard className="border-border bg-card lg:col-span-5" title="Revisao profissional" subtitle="Peso e medidas com trilha auditavel.">
            <div className="space-y-3">
              <FqSelect
                label="Aluno"
                value={assessmentStudentId}
                onChange={(event) => {
                  const studentId = event.target.value
                  setAssessmentStudentId(studentId)
                  setSelectedWeightLogId('')
                  setSelectedMeasurementLogId('')
                  void handleLoadStudentProgress(studentId)
                }}
                options={studentOptions}
                placeholder="Selecione"
              />

              <FqSelect
                label="Log de peso para revisar"
                value={selectedWeightLogId}
                onChange={(event) => setSelectedWeightLogId(event.target.value)}
                options={(studentProgress?.weightLogs ?? []).slice(0, 10).map((log) => ({
                  value: log.id,
                  label: `${log.date} • ${log.weightKg.toFixed(1)}kg • ${log.recordedByRole}`,
                }))}
                placeholder="Selecione"
              />
              <FqInput label="Peso ajustado (kg)" value={reviewWeightKg} onChange={(event) => setReviewWeightKg(event.target.value)} />

              <FqSelect
                label="Log de medidas para revisar"
                value={selectedMeasurementLogId}
                onChange={(event) => setSelectedMeasurementLogId(event.target.value)}
                options={(studentProgress?.bodyMeasurementLogs ?? []).slice(0, 10).map((log) => ({
                  value: log.id,
                  label: `${log.date} • cintura ${log.measurements.waistCm}cm • ${log.recordedByRole}`,
                }))}
                placeholder="Selecione"
              />
              <div className="grid grid-cols-2 gap-2">
                <FqInput label="Peito" value={reviewMeasurements.chestCm} onChange={(event) => setReviewMeasurements((current) => ({ ...current, chestCm: event.target.value }))} />
                <FqInput label="Cintura" value={reviewMeasurements.waistCm} onChange={(event) => setReviewMeasurements((current) => ({ ...current, waistCm: event.target.value }))} />
                <FqInput label="Quadril" value={reviewMeasurements.hipsCm} onChange={(event) => setReviewMeasurements((current) => ({ ...current, hipsCm: event.target.value }))} />
                <FqInput label="Braco" value={reviewMeasurements.armCm} onChange={(event) => setReviewMeasurements((current) => ({ ...current, armCm: event.target.value }))} />
                <FqInput label="Coxa" value={reviewMeasurements.thighCm} onChange={(event) => setReviewMeasurements((current) => ({ ...current, thighCm: event.target.value }))} />
              </div>
              <FqInput label="Comentario profissional" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} />

              <div className="flex flex-wrap gap-2">
                <FqButton onClick={() => void handleReviewWeight()} isLoading={isReviewingWeight}>
                  Validar/Ajustar peso
                </FqButton>
                <FqButton variant="outline" tone="secondary" onClick={() => void handleReviewMeasurements()} isLoading={isReviewingMeasurements}>
                  Validar/Ajustar medidas
                </FqButton>
              </div>

              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  Engajamento profissional
                </FqText>
                <FqSelect
                  label="Aluno para mensagem/conquista"
                  value={engagementStudentId}
                  onChange={(event) => setEngagementStudentId(event.target.value)}
                  options={studentOptions}
                  placeholder="Selecione"
                />
                <FqInput
                  label="Mensagem motivacional"
                  value={motivationalMessage}
                  onChange={(event) => setMotivationalMessage(event.target.value)}
                  placeholder="Ex.: Semana excelente de adesao, continue firme."
                />
                <FqButton onClick={() => void handleSendMotivation()} isLoading={isSendingMotivationalMessage}>
                  Enviar mensagem
                </FqButton>
                <FqInput label="Titulo da conquista" value={achievementTitle} onChange={(event) => setAchievementTitle(event.target.value)} />
                <FqInput
                  label="Descricao da conquista"
                  value={achievementDescription}
                  onChange={(event) => setAchievementDescription(event.target.value)}
                  placeholder="Ex.: Semana perfeita de dieta sob orientacao."
                />
                <FqButton variant="outline" tone="secondary" onClick={() => void handleGrantAchievement()} isLoading={isGrantingSpecialAchievement}>
                  Liberar conquista especial
                </FqButton>
              </div>
            </div>
          </FqCard>

            <FqCard className="border-border bg-card lg:col-span-7" title="Historico imutavel" subtitle="Cada ajuste gera nova entrada com referencia ao log original.">
            {isLoadingStudentProgress ? (
              <FqText as="p" className="text-sm text-muted-foreground">Carregando logs...</FqText>
            ) : (
              <div className="space-y-2">
                {(studentProgress?.weightLogs ?? []).slice(0, 8).map((log) => (
                  <div key={log.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      Peso {log.weightKg.toFixed(1)}kg • {log.recordedByRole}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                      {log.revisedFromLogId ? ` • revisao de ${log.revisedFromLogId}` : ''}
                    </FqText>
                    {log.comment ? <FqText as="p" className="text-xs text-muted-foreground">{log.comment}</FqText> : null}
                  </div>
                ))}
                {(studentProgress?.bodyMeasurementLogs ?? []).slice(0, 8).map((log) => (
                  <div key={log.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <FqText as="p" className="text-sm font-semibold text-foreground">
                      Medidas • cintura {log.measurements.waistCm}cm • peito {log.measurements.chestCm}cm
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                      {log.revisedFromLogId ? ` • revisao de ${log.revisedFromLogId}` : ''}
                    </FqText>
                    {log.comment ? <FqText as="p" className="text-xs text-muted-foreground">{log.comment}</FqText> : null}
                  </div>
                ))}
              </div>
            )}
            </FqCard>
          </div>
        </div>
      ) : null}
    </section>
  )
}
