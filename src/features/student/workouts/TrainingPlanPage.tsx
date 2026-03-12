import { useHistory } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  PlayCircle,
  Sparkles,
  TimerReset,
  Trophy,
  Zap,
} from "lucide-react";

import { FqButton, useToast } from "@/shared/ui";
import { studentRoutes } from "@/features/student/routes";
import { cx } from "@/shared/utils";

import {
  TrainingPlanEmptyState,
  TrainingPlanErrorState,
  TrainingPlanLoadingState,
} from "./components";
import { useTrainingPlanState } from "./hooks/useTrainingPlanState";
import type {
  TrainingPlanDay,
  WorkoutHistoryEntry,
  WorkoutPlanItem,
} from "./types";

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    ...options,
  }).format(new Date(`${date}T12:00:00`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDuration(totalSec: number) {
  return `${Math.max(Math.round(totalSec / 60), 1)} min`;
}

function getWorkoutStatusClasses(status: WorkoutPlanItem["status"]) {
  if (status === "completed") {
    return "bg-primary/12 text-primary";
  }

  if (status === "late") {
    return "bg-destructive/12 text-destructive";
  }

  return "bg-secondary/14 text-secondary";
}

function getDayStatusClasses(
  status: TrainingPlanDay["status"],
  isSelected: boolean,
) {
  const ring = isSelected
    ? "ring-2 ring-primary/24 shadow-[0_18px_42px_rgba(36,49,44,0.1)]"
    : "";

  return cx("border-border/70", ring);
}

function getDayStatusLabel(day: TrainingPlanDay) {
  if (day.status === "completed") {
    return "concluido";
  }

  if (day.status === "late") {
    return "pendente";
  }

  if (day.status === "pending") {
    return day.isToday ? "hoje" : "planejado";
  }

  return "recuperacao";
}

function getDayNarrative(day: TrainingPlanDay, workoutsCount: number) {
  if (day.status === "completed") {
    return workoutsCount > 1
      ? `${workoutsCount} blocos finalizados nesse dia.`
      : "Treino finalizado com consistencia.";
  }

  if (day.status === "late") {
    return workoutsCount > 0
      ? "Ainda da para recuperar esse treino e proteger a semana."
      : "Dia sem treino registrado, mas com janela atrasada.";
  }

  if (day.status === "pending") {
    return workoutsCount > 0
      ? `${workoutsCount} treino${workoutsCount > 1 ? "s" : ""} esperando execucao.`
      : "Dia selecionado pronto para receber um treino rapido.";
  }

  return "Dia leve para recuperar energia e manter ritmo.";
}

function groupWorkoutsByDate(workouts: WorkoutPlanItem[]) {
  return workouts.reduce<Record<string, WorkoutPlanItem[]>>(
    (accumulator, workout) => {
      const current = accumulator[workout.date] ?? [];
      current.push(workout);
      accumulator[workout.date] = current;
      return accumulator;
    },
    {},
  );
}

function getSelectedDateLabel(selectedDate: string | null) {
  if (!selectedDate) {
    return "Dia selecionado";
  }

  return formatDate(selectedDate, { weekday: "long" });
}

function getHeroActionLabel(params: {
  hasActiveSession: boolean;
  hasWorkoutToday: boolean;
  canCreateQuickWorkout: boolean;
}) {
  if (params.hasActiveSession) {
    return "Retomar sessao";
  }

  if (params.hasWorkoutToday) {
    return "Iniciar treino";
  }

  if (params.canCreateQuickWorkout) {
    return "Criar treino rapido";
  }

  return "Aguardando treino";
}

export function TrainingPlanPage() {
  const history = useHistory();
  const { toast } = useToast();
  const {
    uiState,
    allWorkouts,
    week,
    selectedDate,
    selectedDay,
    permissions,
    history: workoutHistory,
    activeSession,
    lastSummary,
    todayWorkout,
    isCreatingQuickWorkout,
    createQuickWorkout,
    setSelectedDate,
    retryLoad,
  } = useTrainingPlanState();

  const workoutsByDate = groupWorkoutsByDate(allWorkouts);
  const weeklyCompleted = week.filter(
    (day) => day.status === "completed",
  ).length;
  const weeklyScheduled = week.filter((day) => day.hasWorkout).length;
  const weeklyCompletionPct =
    weeklyScheduled > 0
      ? Math.round((weeklyCompleted / weeklyScheduled) * 100)
      : 0;
  const lateCount = allWorkouts.filter(
    (workout) => workout.status === "late",
  ).length;
  const selectedWorkouts = selectedDate
    ? (workoutsByDate[selectedDate] ?? [])
    : [];
  const upcomingWorkout =
    allWorkouts.find((workout) => workout.status !== "completed") ??
    allWorkouts[0];
  const hasWorkoutToday = Boolean(
    todayWorkout.workoutId || todayWorkout.durationMin > 0,
  );
  const heroActionLabel = getHeroActionLabel({
    hasActiveSession: Boolean(activeSession),
    hasWorkoutToday,
    canCreateQuickWorkout: permissions.canCreateQuickWorkout,
  });

  async function handleCreateQuickWorkout(date?: string) {
    try {
      await createQuickWorkout(date);
      toast({
        title: "Treino rapido pronto",
        description: "Seu treino foi adicionado a rotina de hoje.",
        tone: "success",
      });
    } catch (error) {
      toast({
        title: "Nao foi possivel criar treino rapido",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  function handleHeroAction() {
    if (activeSession) {
      history.push(
        studentRoutes.workoutSession,
        activeSession.workoutId
          ? { workoutId: activeSession.workoutId }
          : undefined,
      );
      return;
    }

    if (todayWorkout.workoutId) {
      history.push(studentRoutes.workoutSession, {
        workoutId: todayWorkout.workoutId,
      });
      return;
    }

    if (permissions.canCreateQuickWorkout) {
      void handleCreateQuickWorkout(selectedDate ?? undefined);
    }
  }

  function openWorkoutDetail(workoutId: string) {
    history.push(`${studentRoutes.workouts}/${workoutId}`);
  }

  function openCompletion(sessionId: string) {
    history.push(`${studentRoutes.workouts}/completed/${sessionId}`);
  }

  if (uiState === "loading") {
    return <TrainingPlanLoadingState />;
  }

  if (uiState === "error") {
    return <TrainingPlanErrorState onRetry={() => void retryLoad()} />;
  }

  if (uiState === "empty") {
    return (
      <TrainingPlanEmptyState
        onBack={() => history.push(studentRoutes.hub)}
        onShowPlans={handleCreateQuickWorkout}
        canShowPlans={permissions.canCreateQuickWorkout}
        showPlansReason="Treino rapido bloqueado para aluno com personal ativo."
      />
    );
  }

  return (
    <section className="fq-page-shell space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <div className="space-y-5">
          <div className="fq-gradient-hero-mix overflow-hidden rounded-[32px] border border-border/70 bg-card p-5 shadow-[0_22px_52px_rgba(36,49,44,0.08)] md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  {activeSession ? "agora" : "hoje"}
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    {todayWorkout.title}
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    {activeSession
                      ? "Sua sessao continua guardada. Retome do ponto em que parou com o mesmo contexto visual."
                      : (todayWorkout.estimatedStartLabel ??
                        "A rotina do dia aparece aqui com prioridade total.")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.05)]">
                    {todayWorkout.durationMin} min
                  </span>
                  <span className="rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.05)]">
                    {todayWorkout.calories} kcal
                  </span>
                  <span className="rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.05)]">
                    +{todayWorkout.stars} estrelas
                  </span>
                  <span className="rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.05)]">
                    {todayWorkout.completedCount}/{todayWorkout.totalCount}{" "}
                    feitos
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[220px]">
                <FqButton
                  leftIcon="play"
                  onClick={handleHeroAction}
                  isDisabled={
                    !activeSession &&
                    !todayWorkout.workoutId &&
                    !permissions.canCreateQuickWorkout
                  }
                >
                  {heroActionLabel}
                </FqButton>
                <FqButton
                  variant="outline"
                  tone="neutral"
                  onClick={() => {
                    if (todayWorkout.workoutId) {
                      openWorkoutDetail(todayWorkout.workoutId);
                    }
                  }}
                  isDisabled={!todayWorkout.workoutId}
                >
                  Abrir detalhes
                </FqButton>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
                <span>Execucao do treino</span>
                <span>{todayWorkout.progressPct}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/72">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_srgb,var(--secondary)_34%,var(--primary))_100%)] transition-all duration-500"
                  style={{
                    width: `${Math.max(todayWorkout.progressPct, hasWorkoutToday ? 8 : 0)}%`,
                  }}
                />
              </div>
              <p className="text-xs leading-6 text-muted-foreground">
                {todayWorkout.progressPct >= 100
                  ? "Treino do dia concluido. Agora voce pode revisar o resultado ou repetir a sessao."
                  : todayWorkout.totalCount > 0
                    ? `${Math.max(todayWorkout.totalCount - todayWorkout.completedCount, 0)} exercicios ainda faltam para fechar o treino do dia.`
                    : "Nenhum exercicio carregado ainda para hoje."}
              </p>
            </div>

            {todayWorkout.muscleGroups?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {todayWorkout.muscleGroups.map((group) => (
                  <span
                    key={`today-group-${group}`}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {group}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[32px] border border-border/70 bg-white/76 shadow-[0_22px_52px_rgba(36,49,44,0.08)]">
            <div className="border-b border-border/70 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Week agenda
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Planejamento da semana
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    Cada dia virou um bloco claro de execucao, com status,
                    resumo e chamadas diretas para abrir ou iniciar o treino.
                  </p>
                </div>

                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {weeklyScheduled} dias com treino
                </div>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5 md:px-6">
              {week.map((day) => {
                const dayWorkouts = workoutsByDate[day.date] ?? [];
                const isSelected = selectedDate === day.date;
                const badgeStatus =
                  day.status === "rest" ? "pending" : day.status;

                return (
                  <article
                    key={day.date}
                    className={cx(
                      "rounded-[28px] border-2 p-4  transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(36,49,44,0.08)] md:p-5",
                      getDayStatusClasses(day.status, isSelected),
                    )}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedDate(day.date)}
                          className="text-left focus-visible:outline-none"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            {formatDate(day.date, { weekday: "long" })}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                            {dayWorkouts[0]?.title ??
                              (day.hasWorkout
                                ? "Treino em aberto"
                                : "Active recovery")}
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                            {getDayNarrative(day, dayWorkouts.length)}
                          </p>
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cx(
                              "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
                              getWorkoutStatusClasses(badgeStatus),
                            )}
                          >
                            {getDayStatusLabel(day)}
                          </span>
                          {day.isToday ? (
                            <span className="rounded-full bg-foreground/6 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                              hoje
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {dayWorkouts.length === 0 ? (
                        <div className="rounded-[24px] border border-dashed border-border/70 bg-white/62 p-4">
                          <p className="text-sm leading-7 text-muted-foreground">
                            {day.status === "rest"
                              ? "Dia pensado para recuperar. Se quiser manter volume, voce pode gerar um treino rapido."
                              : "Nenhum treino carregado para esse dia ainda."}
                          </p>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <FqButton
                              onClick={() => {
                                setSelectedDate(day.date);
                                void handleCreateQuickWorkout(day.date);
                              }}
                              isLoading={
                                isCreatingQuickWorkout &&
                                selectedDate === day.date
                              }
                              isDisabled={!permissions.canCreateQuickWorkout}
                            >
                              Criar treino rapido
                            </FqButton>
                            <FqButton
                              variant="outline"
                              tone="neutral"
                              onClick={() => setSelectedDate(day.date)}
                            >
                              Selecionar dia
                            </FqButton>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayWorkouts.map((workout) => (
                            <div
                              key={workout.id}
                              className="rounded-[24px] border border-border/70 bg-white/70 p-4 shadow-[0_12px_28px_rgba(36,49,44,0.04)]"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-lg font-semibold tracking-tight text-foreground">
                                      {workout.title}
                                    </p>
                                    <p className="mt-1 text-sm leading-7 text-muted-foreground">
                                      {workout.description ??
                                        workout.personalNote ??
                                        "Sessao pronta para ser aberta e executada com contexto completo."}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-muted/56 px-3 py-1.5 text-xs font-semibold text-foreground">
                                      {workout.estimatedDurationMin} min
                                    </span>
                                    {workout.exerciseCount ? (
                                      <span className="rounded-full bg-muted/56 px-3 py-1.5 text-xs font-semibold text-foreground">
                                        {workout.exerciseCount} exercicios
                                      </span>
                                    ) : null}
                                    {workout.starsReward ? (
                                      <span className="rounded-full bg-warning/14 px-3 py-1.5 text-xs font-semibold text-warning">
                                        +{workout.starsReward} estrelas
                                      </span>
                                    ) : null}
                                    {workout.muscleGroups
                                      ?.slice(0, 2)
                                      .map((group) => (
                                        <span
                                          key={`${workout.id}-${group}`}
                                          className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                                        >
                                          {group}
                                        </span>
                                      ))}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openWorkoutDetail(workout.id)
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(36,49,44,0.06)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    Ver treino
                                    <ChevronRight className="h-4 w-4" />
                                  </button>

                                  <FqButton
                                    onClick={() =>
                                      history.push(
                                        studentRoutes.workoutSession,
                                        { workoutId: workout.id },
                                      )
                                    }
                                  >
                                    {workout.status === "completed"
                                      ? "Repetir"
                                      : "Iniciar"}
                                  </FqButton>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-[30px] border border-border/70 bg-white/76 p-5 shadow-[0_20px_48px_rgba(36,49,44,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xl">Leitura da semana</span>
            </div>

            <div className="mt-5 space-y-2">
              <div className="rounded-[24px] bg-muted/45 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarDays className="h-4 w-4 text-secondary" />
                  Dia em foco
                </div>

                <div className="mt-4 space-y-2">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {getSelectedDateLabel(selectedDate)}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {selectedDay
                      ? getDayNarrative(selectedDay, selectedWorkouts.length)
                      : "Selecione um dia da semana para destacar a agenda."}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-1">
                  {week.map((day) => {
                    const isSelected = selectedDate === day.date;
                    const statusDotClass =
                      day.status === "completed"
                        ? "bg-primary"
                        : day.status === "late"
                          ? "bg-destructive"
                          : day.status === "pending"
                            ? "bg-secondary"
                            : "bg-transparent";

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDate(day.date)}
                        aria-pressed={isSelected}
                        className="group flex flex-col items-center gap-1 focus-visible:outline-none"
                      >
                        <span
                          className={cx(
                            "text-[0.62rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {day.weekday.slice(0, 3)}
                        </span>
                        <span
                          className={cx(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200",
                            isSelected
                              ? "bg-foreground text-background shadow-[0_6px_18px_rgba(36,49,44,0.22)]"
                              : "text-foreground hover:bg-muted/60",
                            day.isToday && !isSelected
                              ? "ring-2 ring-primary/40"
                              : "",
                          )}
                        >
                          {day.date.slice(-2)}
                        </span>
                        <span
                          className={cx(
                            "h-1.5 w-1.5 rounded-full transition-opacity",
                            day.status !== "rest"
                              ? statusDotClass
                              : "bg-transparent",
                            isSelected ? "opacity-100" : "opacity-70",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <FqButton
                    className="sm:flex-1"
                    variant="outline"
                    tone="neutral"
                    onClick={() => {
                      if (selectedWorkouts[0]) {
                        openWorkoutDetail(selectedWorkouts[0].id);
                      } else if (upcomingWorkout) {
                        openWorkoutDetail(upcomingWorkout.id);
                      }
                    }}
                    isDisabled={!selectedWorkouts[0] && !upcomingWorkout}
                  >
                    Ver treino
                  </FqButton>
                </div>

                {!permissions.canCreateQuickWorkout ? (
                  <p className="mt-4 text-xs leading-6 text-muted-foreground">
                    Criacao manual bloqueada enquanto existir treino atribuido
                    por um profissional.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] bg-muted/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Progresso semanal
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                      {weeklyCompletionPct}%
                    </p>
                  </div>

                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="h-3 mt-2 border border-primary overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_srgb,var(--primary)_58%,var(--card))_100%)] transition-all duration-500"
                    style={{
                      width:
                        weeklyScheduled > 0
                          ? `${Math.max(weeklyCompletionPct, 6)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[24px] bg-muted/45 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <TimerReset className="h-4 w-4 text-destructive" />
                    Pendencias
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {lateCount > 0
                      ? `${lateCount} treino${lateCount > 1 ? "s" : ""} precisam ser recuperados.`
                      : "Nenhum treino atrasado no momento."}
                  </p>
                </div>

                <div className="rounded-[24px] bg-muted/45 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Trophy className="h-4 w-4 text-warning" />
                    Recompensa
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {lastSummary
                      ? `Ultima sessao entregou +${lastSummary.rewardStars} estrelas.`
                      : "As estrelas liberadas na conclusao aparecem aqui."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-border/70 bg-white/76 p-5 shadow-[0_20px_48px_rgba(36,49,44,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Flame className="h-4 w-4 text-warning" />
              Ultima sessao
            </div>

            {lastSummary ? (
              <div className="mt-5 space-y-4">
                <div className="fq-gradient-soft-primary rounded-[24px] p-4">
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {lastSummary.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {lastSummary.completionMessage}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[24px] bg-muted/45 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock3 className="h-4 w-4 text-secondary" />
                      Duracao
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {formatDuration(lastSummary.durationSec)}
                    </p>
                  </div>

                  <div className="rounded-[24px] bg-muted/45 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <PlayCircle className="h-4 w-4 text-primary" />
                      Sets concluidos
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {lastSummary.completedSets}/{lastSummary.totalSets}
                    </p>
                  </div>
                </div>

                <FqButton
                  variant="outline"
                  tone="neutral"
                  onClick={() => openCompletion(lastSummary.sessionId)}
                >
                  Ver resumo final
                </FqButton>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-border bg-muted/35 p-4 text-sm leading-7 text-muted-foreground">
                Assim que a primeira sessao for concluida, esta area mostra a
                mensagem final, duracao e progresso registrado.
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[30px] border border-border/70 bg-white/76 p-5 shadow-[0_20px_48px_rgba(36,49,44,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Trophy className="h-4 w-4 text-warning" />
              Historico recente
            </div>

            <div className="mt-5 space-y-3">
              {workoutHistory.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border bg-muted/35 p-4 text-sm leading-7 text-muted-foreground">
                  Seu historico de treino vai aparecer aqui com horario, duracao
                  e aderencia assim que houver sessoes concluidas.
                </div>
              ) : (
                workoutHistory
                  .slice(0, 4)
                  .map((entry) => (
                    <HistoryCard
                      key={entry.sessionId}
                      entry={entry}
                      onOpen={openCompletion}
                    />
                  ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function HistoryCard({
  entry,
  onOpen,
}: {
  entry: WorkoutHistoryEntry;
  onOpen: (sessionId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry.sessionId)}
      className="block w-full rounded-[24px] border border-border/70 bg-white/74 p-4 text-left shadow-[0_12px_28px_rgba(36,49,44,0.05)] transition hover:-translate-y-0.5 hover:border-primary/22 hover:shadow-[0_18px_36px_rgba(36,49,44,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{entry.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(entry.completedAt)} •{" "}
            {formatDuration(entry.durationSec)}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {entry.adherencePct}%
        </span>
      </div>
    </button>
  );
}
