import { useMemo, useState } from 'react'

import { useRole } from '@/shared/hooks'
import { FqAlert, FqButton, FqCard, FqEmptyState, FqInput, FqModal, FqStatCard, FqTag, FqText, useToast } from '@/shared/ui'
import type { ProgressRange } from '@/shared/services'

import { useProgressOverview } from '../hooks/useProgressOverview'

const rangeOptions: Array<{ label: string; value: ProgressRange }> = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
]

function formatWeekday(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
}

function formatWeekdayShort(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date)
}

export function ProgressPage() {
  const { toast } = useToast()
  const { isStudent } = useRole()
  const [selectedRange, setSelectedRange] = useState<ProgressRange>('30d')
  const [weightInput, setWeightInput] = useState('')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestNote, setRequestNote] = useState('')

  const {
    overview,
    uiState,
    refresh,
    error,
    registerWeight,
    requestMeasurementsUpdate,
    isRegisteringWeight,
    isRequestingMeasurementsUpdate,
  } = useProgressOverview(selectedRange)

  const maxWeeklyVolume = useMemo(() => {
    if (!overview?.strengthWeeklyVolume.length) {
      return 1
    }

    return Math.max(...overview.strengthWeeklyVolume.map((item) => item.volumeKg), 1)
  }, [overview?.strengthWeeklyVolume])

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
        description: 'Atualizacao salva com sucesso.',
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
        description: 'Seu profissional recebeu um pedido de atualizacao das medidas.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao solicitar atualizacao',
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
            Carregando progresso...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (uiState === 'error') {
    return (
      <section className="fq-page-shell">
        <FqAlert tone="danger" title="Falha ao carregar progresso">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar os dados agora.'}
        </FqAlert>
        <FqButton onClick={() => void refresh()} variant="outline" tone="neutral">
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (uiState === 'empty' || !overview) {
    return (
      <section className="fq-page-shell">
        <FqEmptyState
          icon="chart"
          title="Sem progresso registrado"
          description="Conclua seu primeiro treino para liberar resumo e evidencias de evolucao."
        />
      </section>
    )
  }

  return (
    <section className="theme-progress fq-page-shell">
      <header className="fq-page-header">
        <FqText as="h1" variant="title" className="role-heading text-lg">
          Progresso
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Evidencias reais da sua evolucao com foco no mes atual.
        </FqText>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </header>

      <FqCard className="border-border bg-card" title="Resumo do mes" subtitle="Voce esta evoluindo? Aqui esta a foto do periodo.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FqStatCard label="Treinos concluidos" value={overview.monthSummary.completedWorkouts} icon="dumbbell" />
          <FqStatCard label="Tempo total treinando" value={`${overview.monthSummary.totalTrainingMin} min`} icon="clock" />
          <FqStatCard
            label="Corridas e km"
            value={`${overview.monthSummary.completedRuns} corridas`}
            helperText={`${overview.monthSummary.totalRunKm.toFixed(1)} km no mes`}
            icon="mapPin"
          />
          <FqStatCard
            label="Aderencia de agua"
            value={`${overview.monthSummary.hydrationAdherencePct}%`}
            helperText="dias com meta batida"
            icon="flask"
          />
        </div>
      </FqCard>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-7" title="Evolucao de forca" subtitle="PRs por exercicio e volume semanal.">
          <div className="space-y-4">
            {overview.strengthPrs.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Sem dados suficientes para PRs de exercicio ainda.
              </FqText>
            ) : (
              <div className="space-y-2">
                {overview.strengthPrs.map((pr, index) => (
                  <div key={`${pr.exerciseName}-${index}`} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {index + 1}. {pr.exerciseName}
                      </FqText>
                      <FqTag tone="success">PR {pr.bestLoadVolumeKg.toFixed(1)} kg</FqTag>
                    </div>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      Melhor marca em {new Date(pr.achievedAt).toLocaleDateString('pt-BR')}
                    </FqText>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <FqText as="p" className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Volume semanal (kg)
              </FqText>
              {overview.strengthWeeklyVolume.length === 0 ? (
                <FqText as="p" className="text-sm text-muted-foreground">
                  Sem volume semanal disponivel.
                </FqText>
              ) : (
                <div className="space-y-2">
                  {overview.strengthWeeklyVolume.map((item) => (
                    <div key={item.weekStart} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{formatWeekday(item.weekStart)}</span>
                        <span>{item.volumeKg.toFixed(1)} kg</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-muted">
                        <div
                          className="h-full rounded bg-secondary"
                          style={{ width: `${Math.round((item.volumeKg / maxWeeklyVolume) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card lg:col-span-5" title="Peso" subtitle="Registro livre de peso e tendencia de evolucao.">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <FqStatCard
                label="Tendencia 7 dias"
                value={`${overview.weightTrend.trend7dKg > 0 ? '+' : ''}${overview.weightTrend.trend7dKg.toFixed(1)} kg`}
                icon="activity"
              />
              <FqStatCard
                label="Tendencia 30 dias"
                value={`${overview.weightTrend.trend30dKg > 0 ? '+' : ''}${overview.weightTrend.trend30dKg.toFixed(1)} kg`}
                icon="chart"
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <FqText as="p" className="text-sm font-semibold text-foreground">
                Registrar peso de hoje
              </FqText>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <FqInput
                  label="Peso (kg)"
                  type="number"
                  step={0.1}
                  min={1}
                  value={weightInput}
                  onChange={(event) => setWeightInput(event.target.value)}
                  placeholder="Ex.: 78.4"
                />
                <div className="flex items-end">
                  <FqButton onClick={() => void handleRegisterWeight()} isLoading={isRegisteringWeight}>
                    Salvar peso
                  </FqButton>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <FqText as="p" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ultimos registros
              </FqText>
              {overview.weightLogs.length === 0 ? (
                <FqText as="p" className="text-sm text-muted-foreground">
                  Nenhum peso registrado ainda.
                </FqText>
              ) : (
                <div className="space-y-2">
                  {overview.weightLogs.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-border bg-muted/20 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <FqText as="p" className="text-sm font-semibold text-foreground">
                          {entry.weightKg.toFixed(1)} kg
                        </FqText>
                        <FqText as="p" className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                        </FqText>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FqCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-5" title="Medidas corporais" subtitle="Somente visualizacao para aluno.">
          <div className="space-y-3">
            <FqAlert tone="secondary" title="Edicao bloqueada para aluno">
              As medidas corporais sao atualizadas apenas por profissionais.
            </FqAlert>

            <FqText as="p" className="text-xs text-muted-foreground">
              Ultima atualizacao por: {overview.measurementSummary.lastUpdatedByLabel}
              {overview.measurementSummary.lastUpdatedAt
                ? ` em ${new Date(overview.measurementSummary.lastUpdatedAt).toLocaleString('pt-BR')}`
                : ''}
            </FqText>

            {overview.bodyMeasurementLogs.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Nenhuma medida registrada ainda.
              </FqText>
            ) : (
              <div className="space-y-2">
                {overview.bodyMeasurementLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="rounded-xl border border-border bg-muted/20 p-3">
                    <FqText as="p" className="text-sm text-foreground">
                      Peito {log.measurements.chestCm} cm | Cintura {log.measurements.waistCm} cm | Quadril {log.measurements.hipsCm} cm
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                    </FqText>
                  </div>
                ))}
              </div>
            )}

            <FqButton
              variant="outline"
              tone="secondary"
              onClick={() => setIsRequestModalOpen(true)}
              isLoading={isRequestingMeasurementsUpdate}
              className="w-full"
            >
              Solicitar avaliacao
            </FqButton>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card lg:col-span-7" title="Insights" subtitle="Regras simples para orientar sua proxima semana.">
          <div className="space-y-2">
            {overview.insights.map((insight, index) => (
              <div key={`${insight}-${index}`} className="rounded-xl border border-border bg-muted/20 p-3">
                <FqText as="p" className="text-sm text-foreground">
                  {insight}
                </FqText>
              </div>
            ))}
          </div>
        </FqCard>
      </div>

      <FqCard className="border-border bg-card" title="Historico recente" subtitle="Ultimas sessoes e registros de peso no periodo.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            {overview.recentHistory.slice(0, 4).map((session) => (
              <div key={session.sessionId} className="rounded-xl border border-border bg-muted/20 p-3">
                <FqText as="p" className="text-sm font-semibold text-foreground">
                  {session.title}
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  {new Date(session.completedAt).toLocaleString('pt-BR')} | {Math.round(session.durationSec / 60)} min
                </FqText>
                <FqText as="p" className="text-xs text-muted-foreground">
                  Series {session.completedSets}/{session.totalSets}
                </FqText>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {overview.weightHistory.slice(-6).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <FqText as="p" className="text-sm font-semibold text-foreground">
                    {entry.weightKg.toFixed(1)} kg
                  </FqText>
                  <FqText as="p" className="text-xs text-muted-foreground">
                    {formatWeekdayShort(entry.date)}
                  </FqText>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FqCard>

      {!isStudent ? (
        <FqAlert tone="warning" title="Modo aluno">
          Este painel foi otimizado para o fluxo de aluno.
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
          placeholder="Ex.: Gostaria de reavaliar medidas desta semana."
        />
      </FqModal>
    </section>
  )
}
