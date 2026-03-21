import { useState } from 'react'
import { useHistory } from 'react-router-dom'

import { useRole } from '@/shared/hooks'
import { StudentModuleState, StudentPageHeader, StudentWaterQuickActionCard } from '@/features/student/components'
import { FqButton, FqInput, FqModal, FqStatCard, FqText, useToast } from '@/shared/ui'
import type { ProgressRange } from '@/shared/services'
import { studentRoutes } from '@/features/student/routes'

import {
  ProgressActivityChartCard,
  ProgressBodyReadOnlyCard,
  ProgressComparisonGrid,
  ProgressHeroCard,
  ProgressHistoryCard,
  ProgressPageSkeleton,
} from '../components'
import { useProgressViewModel } from '../hooks/useProgressViewModel'

const rangeOptions: Array<{ label: string; value: ProgressRange }> = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
]

export function ProgressPage() {
  const history = useHistory()
  const { toast } = useToast()
  const { isStudent } = useRole()
  const [selectedRange, setSelectedRange] = useState<ProgressRange>('30d')
  const [weightInput, setWeightInput] = useState('')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestNote, setRequestNote] = useState('')
  const {
    data,
    dashboard,
    viewState,
    refresh,
    error,
    isDashboardReady,
    registerWater,
    isRegisterWaterPending,
    registerWeight,
    requestMeasurementsUpdate,
    isRegisteringWeight,
    isRequestingMeasurementsUpdate,
  } = useProgressViewModel(selectedRange)

  async function handleRegisterWater(amountMl: number) {
    if (!dashboard) {
      return
    }

    try {
      const previous = dashboard.waterProgress
      const response = await registerWater(amountMl)
      const nextTotal = response.totalWaterMl
      const reachedGoal = nextTotal >= previous.targetMl

      toast({
        title: reachedGoal ? 'Meta de agua batida' : 'Agua registrada',
        description: reachedGoal
          ? `${nextTotal} ml acumulados. Sua consistencia semanal acabou de subir.`
          : `${nextTotal} ml acumulados hoje.`,
        tone: reachedGoal ? 'success' : 'secondary',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao registrar agua',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleRegisterWeight() {
    const parsed = Number(weightInput.replace(',', '.'))

    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({
        title: 'Peso invalido',
        description: 'Informe um peso valido maior que zero.',
        tone: 'warning',
      })
      return
    }

    try {
      await registerWeight({ weightKg: parsed })
      setWeightInput('')
      toast({
        title: 'Peso registrado',
        description: 'O historico foi atualizado com sucesso.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao registrar peso',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleRequestMeasurementsUpdate() {
    try {
      await requestMeasurementsUpdate({
        note: requestNote.trim() || undefined,
      })
      setRequestNote('')
      setIsRequestModalOpen(false)
      toast({
        title: 'Solicitacao enviada',
        description: 'Seu profissional recebeu o pedido de nova avaliacao.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao solicitar avaliacao',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (viewState === 'loading') {
    return <ProgressPageSkeleton />
  }

  if (viewState === 'error') {
    return (
      <StudentModuleState
        state="error"
        tone="danger"
        title="Falha ao carregar progresso"
        description={error instanceof Error ? error.message : 'Nao foi possivel carregar seus dados de progresso agora.'}
        actionLabel="Tentar novamente"
        onAction={() => void refresh()}
        shellClassName="fq-page-shell"
      />
    )
  }

  if (viewState === 'empty' || !data) {
    return (
      <StudentModuleState
        state="empty"
        icon="chart"
        title="Sem progresso registrado ainda"
        description="Seu primeiro treino, cardio ou registro corporal ja libera comparativos, tendencias e leitura real da jornada."
        actionLabel="Voltar para Home"
        onAction={() => history.push(studentRoutes.hub)}
        shellClassName="fq-page-shell"
      />
    )
  }

  return (
    <section className="theme-progress fq-page-shell">
      <StudentPageHeader
        eyebrow="Leitura de evolução"
        title="Progresso"
        description="Leitura clara de peso, IMC, consistência, cardio e evolução de nível em uma narrativa única."
        tags={[
          {
            id: 'level-progress',
            label: `Nível ${data.level}`,
            tone: 'secondary',
            icon: 'target',
          },
          {
            id: 'stars-progress',
            label: `${data.stars} estrelas`,
            tone: 'warning',
            icon: 'star',
          },
        ]}
        actions={
          <>
            {rangeOptions.map((option) => (
              <FqButton
                key={option.value}
                variant={selectedRange === option.value ? 'solid' : 'outline'}
                tone={selectedRange === option.value ? 'success' : 'neutral'}
                size="sm"
                onClick={() => setSelectedRange(option.value)}
              >
                {option.label}
              </FqButton>
            ))}
          </>
        }
      />

      <ProgressHeroCard
        stars={data.stars}
        level={data.level}
        nextLevelRemaining={data.nextLevelRemaining}
        currentWeightKg={data.overview.metrics.currentWeightKg}
        bmi={data.overview.metrics.bmi}
        bmiLabel={data.bmiLabel}
        answers={data.answers}
        feedback={data.heroFeedback}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <FqStatCard
          label="Frequencia de treinos"
          value={`${data.overview.metrics.workoutsPerWeek}/sem`}
          helperText={`${data.overview.weeklySummary.completedTrainings} blocos concluidos no periodo`}
          icon="dumbbell"
        />
        <FqStatCard
          label="Constancia alimentar"
          value={`${data.overview.monthSummary.nutritionConsistencyPct}%`}
          helperText={`${data.overview.weeklySummary.nutritionConsistencyPct}% nesta semana`}
          icon="utensils"
        />
        <FqStatCard
          label="Agua"
          value={`${data.overview.metrics.avgWaterMl} ml`}
          helperText={`${data.overview.monthSummary.hydrationAdherencePct}% de adesao no mes`}
          icon="flask"
        />
        <FqStatCard
          label="Cardio no mes"
          value={`${data.overview.monthSummary.totalRunKm.toFixed(1)} km`}
          helperText={`${data.overview.monthSummary.completedRuns} sessoes`}
          icon="mapPin"
        />
        <FqStatCard
          label="Dias ativos"
          value={data.overview.monthSummary.activeDays}
          helperText="Volume acumulado no mes"
          icon="activity"
        />
      </div>

      {isStudent && isDashboardReady && dashboard ? (
        <StudentWaterQuickActionCard
          waterProgress={dashboard.waterProgress}
          onAddWater={handleRegisterWater}
          isPending={isRegisterWaterPending}
          title="Agua refletindo no progresso"
          description="Registro rapido de hidratacao para nao perder aderencia, streak e leitura real do dia."
        />
      ) : null}

      <ProgressComparisonGrid items={data.comparisonCards} />

      <div className="grid gap-4 xl:fq-grid-balanced-wide">
        <ProgressActivityChartCard
          points={data.activityPoints}
          weightHistory={data.overview.weightHistory}
        />
        <ProgressBodyReadOnlyCard
          bodyComposition={data.overview.bodyComposition}
          measurementSummary={data.overview.measurementSummary}
          measurements={data.measurementItems}
          onRequestUpdate={() => setIsRequestModalOpen(true)}
          isRequestPending={isRequestingMeasurementsUpdate}
        />
      </div>

      <div className="grid gap-4 xl:fq-grid-balanced-wider-inverse">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-overlay">
          <FqText as="h2" className="text-sm font-semibold text-foreground">
            Controle de peso
          </FqText>
          <FqText as="p" className="mt-1 text-sm text-muted-foreground">
            Registro rapido para manter a curva de acompanhamento atualizada.
          </FqText>
          <div className="mt-4 flex flex-col gap-3">
            <FqInput
              label="Peso (kg)"
              type="number"
              step={0.1}
              min={1}
              value={weightInput}
              onChange={(event) => setWeightInput(event.target.value)}
              placeholder="Ex.: 78.4"
            />
            <FqButton onClick={() => void handleRegisterWeight()} isLoading={isRegisteringWeight}>
              Salvar peso
            </FqButton>
          </div>
        </div>

        <ProgressHistoryCard
          workouts={data.overview.recentHistory}
          cardio={data.overview.cardioHistory}
        />
      </div>

      {!isStudent ? (
        <FqAlert tone="warning" title="Modo aluno">
          Este painel foi otimizado para o fluxo de progresso do aluno.
        </FqAlert>
      ) : null}

      <FqModal
        open={isRequestModalOpen}
        onOpenChange={setIsRequestModalOpen}
        title="Solicitar avaliacao de medidas"
        description="Seu pedido sera enviado para os profissionais vinculados."
        footer={
          <div className="flex justify-end gap-2">
            <FqButton variant="outline" tone="neutral" onClick={() => setIsRequestModalOpen(false)}>
              Cancelar
            </FqButton>
            <FqButton onClick={() => void handleRequestMeasurementsUpdate()} isLoading={isRequestingMeasurementsUpdate}>
              Enviar solicitacao
            </FqButton>
          </div>
        }
      >
        <FqInput
          label="Mensagem (opcional)"
          value={requestNote}
          onChange={(event) => setRequestNote(event.target.value)}
          placeholder="Ex.: Gostaria de atualizar minhas medidas desta semana."
        />
      </FqModal>
    </section>
  )
}
