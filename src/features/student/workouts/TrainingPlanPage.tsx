import { useHistory } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Star,
  TimerReset,
  Zap,
} from "lucide-react";

import { FqButton } from "@/shared/ui";
import { studentRoutes } from "@/features/student/routes";
import { canStudentStartWorkout, cx } from "@/shared/utils";

import {
  TrainingPlanEmptyState,
  TrainingPlanErrorState,
  TrainingPlanLoadingState,
} from "./components";
import { useTrainingPlanState } from "./hooks/useTrainingPlanState";
import type { TrainingPlanDay, WorkoutPlanItem } from "./types";

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    ...options,
  }).format(new Date(`${date}T12:00:00`));
}

function getWorkoutStatusClasses(status: WorkoutPlanItem["status"]) {
  if (status === "completed") {
    return "bg-primary/10 text-primary";
  }

  if (status === "late") {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-secondary/15 text-secondary";
}

function getDayStatusClasses(isSelected: boolean) {
  const ring = isSelected ? "ring-2 ring-primary/25 shadow-overlay" : "";

  return cx("border-border/70", ring);
}

function getDayStatusLabel(day: TrainingPlanDay) {
  if (day.status === "completed") {
    return "Concluido";
  }

  if (day.status === "late") {
    return "Não realizado";
  }

  if (day.status === "pending") {
    return day.isToday ? "Hoje" : "Planejado";
  }

  return "Recuperacao";
}

function getDayNarrative(day: TrainingPlanDay, workoutsCount: number) {
  if (day.status === "completed") {
    return workoutsCount > 1
      ? `${workoutsCount} blocos finalizados nesse dia.`
      : "Treino finalizado com consistencia.";
  }

  if (day.status === "late") {
    return workoutsCount > 0
      ? "A janela desse treino ja foi encerrada para o aluno."
      : "Dia sem treino registrado e sem execucao disponivel.";
  }

  if (day.status === "pending") {
    return workoutsCount > 0
      ? `${workoutsCount} treino${workoutsCount > 1 ? "s" : ""} esperando execucao.`
      : "Dia selecionado com rotina planejada.";
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
  workoutStatus?: WorkoutPlanItem["status"];
  hasWorkoutToday: boolean;
}) {
  if (params.hasActiveSession) {
    return "Retomar sessao";
  }

  if (params.workoutStatus === "completed") {
    return "Treino concluido";
  }

  if (params.workoutStatus === "late") {
    return "Treino expirado";
  }

  if (params.hasWorkoutToday) {
    return "Iniciar treino";
  }

  return "Aguardando treino";
}

export function TrainingPlanPage() {
  const history = useHistory();
  const {
    uiState,
    allWorkouts,
    week,
    selectedDate,
    selectedDay,
    activeSession,
    todayWorkout,
    setSelectedDate,
    retryLoad,
  } = useTrainingPlanState();

  const workoutsByDate = groupWorkoutsByDate(allWorkouts);
  const visibleWeek = week.filter(
    (day) => (workoutsByDate[day.date] ?? []).length > 0,
  );
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
    allWorkouts.find((workout) => canStudentStartWorkout(workout.status)) ??
    allWorkouts[0];
  const hasWorkoutToday = Boolean(
    todayWorkout.workoutId || todayWorkout.durationMin > 0,
  );
  const canStartTodayWorkout = canStudentStartWorkout(todayWorkout.status);
  const heroActionLabel = getHeroActionLabel({
    hasActiveSession: Boolean(activeSession),
    workoutStatus: todayWorkout.status,
    hasWorkoutToday,
  });

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

    if (todayWorkout.workoutId && canStartTodayWorkout) {
      history.push(studentRoutes.workoutSession, {
        workoutId: todayWorkout.workoutId,
      });
    }
  }

  function openWorkoutDetail(
    workoutId: string,
    workoutDate?: string,
    workoutStatus?: WorkoutPlanItem["status"],
  ) {
    history.push(`${studentRoutes.workouts}/${workoutId}`, {
      workoutDate,
      workoutStatus,
    });
  }

  if (uiState === "loading") {
    return <TrainingPlanLoadingState />;
  }

  if (uiState === "error") {
    return <TrainingPlanErrorState onRetry={() => void retryLoad()} />;
  }

  if (uiState === "empty") {
    return (
      <TrainingPlanEmptyState onBack={() => history.push(studentRoutes.hub)} />
    );
  }

  return (
    <section className="fq-page-shell space-y-5">
      <div className="flex md:flex-row sm:flex-col gap-5 lg:gap-8">
        <div className="space-y-5">
          <div className="fq-gradient-hero-mix overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-deep md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-caps-wide text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  {activeSession ? "agora" : "hoje"}
                </div>

                <div className="space-y-2">
                  <h2 className="text-screen-title font-semibold tracking-tight text-foreground">
                    {todayWorkout.title}
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {activeSession
                      ? "Sua sessao continua guardada. Retome do ponto em que parou com o mesmo contexto visual."
                      : (todayWorkout.estimatedStartLabel ??
                        "A rotina do dia aparece aqui com prioridade total.")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated">
                    {todayWorkout.durationMin} min
                  </span>
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated">
                    +{todayWorkout.stars}
                    <Star className="ml-1 h-3.5 w-3.5 text-star inline" />
                  </span>
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated">
                    {todayWorkout.completedCount}/{todayWorkout.totalCount}{" "}
                    feitos
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-55">
                <FqButton
                  leftIcon="play"
                  onClick={handleHeroAction}
                  isDisabled={
                    !activeSession &&
                    (!todayWorkout.workoutId || !canStartTodayWorkout)
                  }
                >
                  {heroActionLabel}
                </FqButton>
                <FqButton
                  variant="outline"
                  tone="neutral"
                  onClick={() => {
                    if (todayWorkout.workoutId) {
                      openWorkoutDetail(
                        todayWorkout.workoutId,
                        undefined,
                        todayWorkout.status,
                      );
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
              <div className="h-3 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full fq-progress-xp transition-all duration-500"
                  style={{
                    width: `${Math.max(todayWorkout.progressPct, hasWorkoutToday ? 8 : 0)}%`,
                  }}
                />
              </div>
              <p className="text-xs leading-6 text-muted-foreground">
                {todayWorkout.status === "late"
                  ? "A janela desse treino ja foi encerrada. Consulte o plano e siga para o proximo bloco valido."
                  : todayWorkout.progressPct >= 100
                    ? "Treino do dia concluido. Agora voce pode revisar os detalhes da sessao."
                    : todayWorkout.totalCount > 0
                      ? `${Math.max(todayWorkout.totalCount - todayWorkout.completedCount, 0)} exercicios ainda faltam para fechar o treino do dia.`
                      : "Nenhum exercicio carregado ainda para hoje."}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 shadow-deep">
            <div className="border-b border-border/70 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-caps-wide text-primary">
                    Agenda da semana
                  </p>
                  <h2 className="text-section-title font-semibold tracking-tight text-foreground">
                    Planejamento da semana
                  </h2>
                </div>

                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {weeklyScheduled} dias com treino
                </div>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5 md:px-6">
              {visibleWeek.map((day) => {
                const dayWorkouts = workoutsByDate[day.date] ?? [];
                const isSelected = selectedDate === day.date;
                const badgeStatus =
                  day.status === "rest" ? "pending" : day.status;

                return (
                  <article
                    key={day.date}
                    className={cx(
                      "rounded-2xl border-2 p-4  transition duration-200 hover:-translate-y-0.5 hover:shadow-overlay md:p-5",
                      getDayStatusClasses(isSelected),
                    )}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <button
                          type="button"
                          onClick={() => setSelectedDate(day.date)}
                          className="text-left focus-visible:outline-none"
                        >
                          <p className="text-xs font-semibold uppercase tracking-caps-wide text-muted-foreground">
                            {formatDate(day.date, { weekday: "long" })}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold tracking-tight text-foreground">
                            {dayWorkouts[0]?.title ??
                              (day.hasWorkout
                                ? "Treino em aberto"
                                : "Recuperação ativa")}
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            {getDayNarrative(day, dayWorkouts.length)}
                          </p>
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cx(
                              "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-caps-wide",
                              getWorkoutStatusClasses(badgeStatus),
                            )}
                          >
                            {getDayStatusLabel(day)}
                          </span>
                          {day.isToday && getDayStatusLabel(day) !== "Hoje" ? (
                            <span className="rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-caps-wide text-foreground">
                              Hoje
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <FqButton
                        onClick={() =>
                          openWorkoutDetail(
                            dayWorkouts[0].id,
                            dayWorkouts[0].date,
                            dayWorkouts[0].status,
                          )
                        }
                        variant="ghost"
                        className="inline-flex items-center justify-center"
                      >
                        Ver treino
                        <ChevronRight className="inline-flex ml-2 h-4 w-4" />
                      </FqButton>

                      {canStudentStartWorkout(dayWorkouts[0]?.status) ? (
                        <FqButton
                          onClick={() =>
                            history.push(studentRoutes.workoutSession, {
                              workoutId: dayWorkouts[0].id,
                              workoutDate: dayWorkouts[0].date,
                            })
                          }
                        >
                          Iniciar
                        </FqButton>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 p-5 shadow-deep">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Activity className="size-4 text-primary" />
                <span className="text-section-title">Semana em foco</span>
              </div>

              {selectedDay ? (
                <span
                  className={cx(
                    "rounded-full px-3 py-1.5 text-caption font-semibold uppercase tracking-caps-wide",
                    getWorkoutStatusClasses(
                      selectedDay.status === "rest"
                        ? "pending"
                        : selectedDay.status,
                    ),
                  )}
                >
                  {getDayStatusLabel(selectedDay)}
                </span>
              ) : null}
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CalendarDays className="size-4 text-secondary" />
                  <span>Dia em foco</span>
                </div>

                <div className="mt-4 space-y-2">
                  <h2 className="text-card-title font-semibold tracking-tight text-foreground">
                    {getSelectedDateLabel(selectedDate)}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedDay
                      ? getDayNarrative(selectedDay, selectedWorkouts.length)
                      : "Selecione um dia da semana para destacar a agenda."}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                    <p className="text-caption font-semibold uppercase tracking-caps-wide text-muted-foreground">
                      Treinos do dia
                    </p>
                    <p className="mt-2 text-card-title font-semibold tracking-tight text-foreground">
                      {selectedWorkouts.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                    <p className="text-caption font-semibold uppercase tracking-caps-wide text-muted-foreground">
                      Disponibilidade
                    </p>
                    <p className="mt-2 text-body font-semibold text-foreground">
                      {selectedWorkouts[0]
                        ? canStudentStartWorkout(selectedWorkouts[0].status)
                          ? "Pronto para iniciar"
                          : selectedWorkouts[0].status === "completed"
                            ? "Dia concluido"
                            : "Fora da janela"
                        : "Sem treino planejado"}
                    </p>
                  </div>
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
                            "text-xs font-semibold uppercase  transition-colors",
                            isSelected
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {day.weekday.slice(0, 3)}
                        </span>
                        <span
                          className={cx(
                            "flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200",
                            isSelected
                              ? "bg-foreground text-background shadow-float"
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
                    className="sm:flex-1 lg:w-full"
                    variant="outline"
                    tone="neutral"
                    onClick={() => {
                      if (selectedWorkouts[0]) {
                        openWorkoutDetail(
                          selectedWorkouts[0].id,
                          selectedWorkouts[0].date,
                          selectedWorkouts[0].status,
                        );
                      } else if (upcomingWorkout) {
                        openWorkoutDetail(
                          upcomingWorkout.id,
                          upcomingWorkout.date,
                          upcomingWorkout.status,
                        );
                      }
                    }}
                    isDisabled={!selectedWorkouts[0] && !upcomingWorkout}
                  >
                    Ver treino
                  </FqButton>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 p-5 shadow-deep">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-caption font-semibold uppercase tracking-caps-wide text-muted-foreground">
                  Resumo semanal
                </p>
                <p className="mt-2 text-card-title font-semibold tracking-tight text-foreground">
                  {weeklyCompletionPct}% concluido
                </p>
              </div>

              <CheckCircle2 className="size-8 text-primary" />
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full border border-primary bg-white/70">
              <div
                className="h-full rounded-full fq-progress-primary transition-all duration-500"
                style={{
                  width:
                    weeklyScheduled > 0
                      ? `${Math.max(weeklyCompletionPct, 6)}%`
                      : "0%",
                }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-caption font-semibold uppercase tracking-caps-wide text-muted-foreground">
                  Dias concluidos
                </p>
                <p className="mt-2 text-card-title font-semibold tracking-tight text-foreground">
                  {weeklyCompleted}/{weeklyScheduled || 0}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TimerReset className="size-4 text-destructive" />
                  <span>Pendencias</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {lateCount > 0
                    ? `${lateCount} treino${lateCount > 1 ? "s" : ""} ja passaram da janela de execucao do aluno.`
                    : "Nenhum treino atrasado no momento."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
