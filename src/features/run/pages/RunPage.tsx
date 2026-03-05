import { useEffect, useMemo, useState } from 'react'

import { FqAlert, FqButton, FqCard, FqEmptyState, FqInput, FqProgressBar, FqTag, FqText, useToast } from '@/shared/ui'
import type { RunSession } from '@/shared/services'

import { useRunDashboard } from '../hooks/useRunDashboard'

function formatDuration(totalSec: number) {
  const safe = Math.max(totalSec, 0)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatPace(paceSecPerKm: number | null) {
  if (!paceSecPerKm || paceSecPerKm <= 0) {
    return '--:-- /km'
  }

  const minutes = Math.floor(paceSecPerKm / 60)
  const seconds = paceSecPerKm % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} /km`
}

export function RunPage() {
  const { toast } = useToast()
  const {
    overview,
    ranking,
    isLoading,
    isError,
    error,
    refresh,
    startRun,
    updateRun,
    finishRun,
    isStartingRun,
    isUpdatingRun,
    isFinishingRun,
  } = useRunDashboard()

  const [draftSession, setDraftSession] = useState<RunSession | null>(null)
  const [distanceInput, setDistanceInput] = useState('0')
  const active = draftSession ?? overview?.activeSession ?? null
  const activeSessionId = active?.sessionId ?? null
  const activeStatus = active?.status ?? null

  useEffect(() => {
    if (!active || activeStatus !== 'active' || !activeSessionId) {
      return
    }

    setDraftSession((current) => current ?? active)

    const interval = window.setInterval(() => {
      setDraftSession((current) => {
        if (!current || current.sessionId !== activeSessionId) {
          return current
        }

        if (current.status !== 'active') {
          return current
        }

        return {
          ...current,
          elapsedSec: current.elapsedSec + 1,
          paceSecPerKm:
            current.distanceKm > 0
              ? Math.round((current.elapsedSec + 1) / Math.max(current.distanceKm, 0.01))
              : 0,
        }
      })
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [activeSessionId, activeStatus])

  const sortedHistory = useMemo(
    () => (overview?.history ?? []).slice().sort((left, right) => Date.parse(right.endedAt ?? right.startedAt) - Date.parse(left.endedAt ?? left.startedAt)),
    [overview?.history],
  )
  const distanceValue = draftSession ? distanceInput : String(active?.distanceKm ?? 0)

  async function handleStartRun() {
    try {
      const session = await startRun()
      setDraftSession(session)
      setDistanceInput(String(session.distanceKm))
      toast({
        title: 'Corrida iniciada',
        description: 'Timer ativo. Atualize a distancia manualmente conforme avanca.',
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao iniciar corrida',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleSaveProgress() {
    const sessionBase = draftSession ?? overview?.activeSession ?? null

    if (!sessionBase) {
      return
    }

    const distance = Number(distanceValue.replace(',', '.'))

    if (!Number.isFinite(distance) || distance < 0) {
      toast({
        title: 'Distancia invalida',
        description: 'Informe uma distancia valida em km.',
        tone: 'warning',
      })
      return
    }

    const sessionToPersist: RunSession = {
      ...sessionBase,
      distanceKm: Number(distance.toFixed(2)),
      calories: Math.max(Math.round(distance * 62), 0),
      paceSecPerKm: distance > 0 ? Math.round(sessionBase.elapsedSec / Math.max(distance, 0.01)) : 0,
    }

    try {
      const updated = await updateRun(sessionToPersist)
      setDraftSession(updated)
      setDistanceInput(String(updated.distanceKm))
      toast({
        title: 'Progresso salvo',
        description: 'Distancia e calorias atualizadas.',
        tone: 'secondary',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao salvar progresso',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  async function handleFinishRun() {
    const sessionBase = draftSession ?? overview?.activeSession ?? null

    if (!sessionBase) {
      return
    }

    const distance = Number(distanceValue.replace(',', '.'))

    if (!Number.isFinite(distance) || distance <= 0) {
      toast({
        title: 'Distancia insuficiente',
        description: 'Informe distancia maior que 0 km para finalizar.',
        tone: 'warning',
      })
      return
    }

    const sessionToFinish: RunSession = {
      ...sessionBase,
      distanceKm: Number(distance.toFixed(2)),
      calories: Math.max(Math.round(distance * 62), 0),
      paceSecPerKm: Math.round(sessionBase.elapsedSec / Math.max(distance, 0.01)),
    }

    try {
      const finished = await finishRun(sessionToFinish)
      setDraftSession(null)
      setDistanceInput('0')
      toast({
        title: 'Corrida finalizada',
        description: `${finished.distanceKm.toFixed(2)} km salvos no historico.`,
        tone: 'success',
      })
    } catch (requestError) {
      toast({
        title: 'Falha ao finalizar corrida',
        description: requestError instanceof Error ? requestError.message : 'Tente novamente.',
        tone: 'danger',
      })
    }
  }

  if (isLoading) {
    return (
      <section className="fq-page-shell-medium">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando corrida...
          </FqText>
        </FqCard>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="fq-page-shell-medium">
        <FqAlert tone="danger" title="Falha ao carregar corrida">
          {error instanceof Error ? error.message : 'Nao foi possivel carregar os dados.'}
        </FqAlert>
        <FqButton variant="outline" tone="neutral" onClick={() => void refresh()}>
          Tentar novamente
        </FqButton>
      </section>
    )
  }

  if (!overview) {
    return (
      <section className="fq-page-shell-medium">
        <FqEmptyState icon="mapPin" title="Corrida indisponivel" description="Nao foi possivel montar seu painel de corrida." />
      </section>
    )
  }

  const totalRunsMonth = overview.history.filter((run) => {
    const date = new Date(run.endedAt ?? run.startedAt)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  return (
    <section className="fq-page-shell-medium">
      <header className="fq-page-header">
        <FqText as="h1" variant="title" className="text-lg text-foreground">
          Corrida
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          Inicie corrida manual, registre distancia e acompanhe metricas.
        </FqText>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FqCard className="border-border bg-card">
          <FqText as="p" className="text-xs text-muted-foreground">Total km no mes</FqText>
          <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">{overview.metrics.totalKmMonth.toFixed(2)} km</FqText>
        </FqCard>
        <FqCard className="border-border bg-card">
          <FqText as="p" className="text-xs text-muted-foreground">Melhor pace</FqText>
          <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">{formatPace(overview.metrics.bestPaceSecPerKm)}</FqText>
        </FqCard>
        <FqCard className="border-border bg-card">
          <FqText as="p" className="text-xs text-muted-foreground">Total calorias</FqText>
          <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">{overview.metrics.totalCalories} kcal</FqText>
        </FqCard>
        <FqCard className="border-border bg-card">
          <FqText as="p" className="text-xs text-muted-foreground">Ranking</FqText>
          <FqText as="p" className="mt-1 text-lg font-semibold text-foreground">#{ranking?.position ?? '--'}</FqText>
          <FqText as="p" className="text-xs text-muted-foreground">{ranking?.points ?? 0} pts</FqText>
        </FqCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <FqCard className="border-border bg-card lg:col-span-7">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <FqText as="h2" className="text-sm font-semibold text-foreground">
                Corrida manual
              </FqText>
              <FqTag tone={active ? 'success' : 'neutral'}>{active ? 'Em andamento' : 'Parada'}</FqTag>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">Timer</FqText>
                <FqText as="p" className="text-base font-semibold text-foreground">{formatDuration(active?.elapsedSec ?? 0)}</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">Distancia</FqText>
                <FqText as="p" className="text-base font-semibold text-foreground">{(active?.distanceKm ?? 0).toFixed(2)} km</FqText>
              </FqCard>
              <FqCard className="border-border bg-muted/20">
                <FqText as="p" className="text-xs text-muted-foreground">Calorias</FqText>
                <FqText as="p" className="text-base font-semibold text-foreground">{active?.calories ?? 0} kcal</FqText>
              </FqCard>
            </div>

            <FqInput
              label="Distancia manual (km)"
              value={distanceValue}
              onChange={(event) => {
                setDraftSession((current) => current ?? active)
                setDistanceInput(event.target.value)
              }}
              inputMode="decimal"
              placeholder="Ex: 3.50"
              isDisabled={!active}
            />

            <FqProgressBar
              value={Math.min(Math.round(((active?.distanceKm ?? 0) / 5) * 100), 100)}
              tone={(active?.distanceKm ?? 0) >= 5 ? 'success' : 'primary'}
            />

            <div className="flex flex-wrap gap-2">
              <FqButton leftIcon="play" onClick={() => void handleStartRun()} isLoading={isStartingRun} isDisabled={Boolean(active)}>
                Iniciar corrida
              </FqButton>
              <FqButton
                variant="outline"
                tone="secondary"
                onClick={() => void handleSaveProgress()}
                isLoading={isUpdatingRun}
                isDisabled={!active}
              >
                Salvar progresso
              </FqButton>
              <FqButton tone="success" leftIcon="check" onClick={() => void handleFinishRun()} isLoading={isFinishingRun} isDisabled={!active}>
                Finalizar e salvar
              </FqButton>
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card lg:col-span-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <FqText as="h2" className="text-sm font-semibold text-foreground">
                Historico de corridas
              </FqText>
              <FqTag tone="neutral">{totalRunsMonth} no mes</FqTag>
            </div>

            {sortedHistory.length === 0 ? (
              <FqEmptyState
                icon="mapPin"
                title="Sem corridas registradas"
                description="Inicie sua primeira corrida para gerar historico e metricas."
                actionLabel="Iniciar corrida"
                onAction={() => void handleStartRun()}
              />
            ) : (
              <ul className="space-y-2">
                {sortedHistory.slice(0, 10).map((run) => (
                  <li key={run.sessionId} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <FqText as="p" className="text-sm font-semibold text-foreground">
                        {run.distanceKm.toFixed(2)} km
                      </FqText>
                      <FqTag tone="secondary">{formatPace(run.paceSecPerKm)}</FqTag>
                    </div>
                    <FqText as="p" className="mt-1 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(run.endedAt ?? run.startedAt))}
                      {' • '}
                      {formatDuration(run.elapsedSec)}
                      {' • '}
                      {run.calories} kcal
                    </FqText>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FqCard>
      </div>
    </section>
  )
}
