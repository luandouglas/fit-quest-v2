import { useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

import { studentRoutes } from "@/features/student/routes";
import {
  buildCatalogSupportMedia,
  findPtbrCatalogEntry,
  loadPtbrExerciseCatalog,
} from "@/shared/services/exerciseCatalog";
import { workoutService } from "@/shared/services";
import { FqAlert, FqButton } from "@/shared/ui";
import { canStudentStartWorkout, cx } from "@/shared/utils";

import { ExercisePreviewVisual } from "./components/ExercisePreviewVisual";
import { ExerciseInsightModal } from "./components/ExerciseInsightModal";

type WorkoutDetailRouteParams = {
  workoutId: string;
};

type WorkoutDetailLocationState = {
  workoutDate?: string;
  workoutStatus?: "completed" | "pending" | "late";
};

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    ...options,
  }).format(new Date(`${date}T12:00:00`));
}

function formatLoad(load?: number) {
  return typeof load === "number" ? `${load} kg` : "Carga livre";
}

function getStatusClasses(status: "completed" | "pending" | "late") {
  if (status === "completed") {
    return "bg-primary text-primary-foreground shadow-btn-primary";
  }

  if (status === "late") {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-secondary/15 text-secondary";
}

function getExerciseStatusClasses(status: "done" | "current" | "upcoming") {
  if (status === "done") {
    return "border-primary/20 bg-primary/10";
  }

  if (status === "current") {
    return "border-secondary/20 bg-secondary/10";
  }

  return "border-border/70 bg-white/70";
}

export function WorkoutDetailPage() {
  const history = useHistory();
  const location = useLocation<WorkoutDetailLocationState | undefined>();
  const { workoutId } = useParams<WorkoutDetailRouteParams>();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );

  const detailQuery = useQuery({
    queryKey: ["workouts", "detail", workoutId],
    queryFn: () => workoutService.getWorkoutDetail(workoutId),
    staleTime: 10_000,
  });
  const catalogQuery = useQuery({
    queryKey: ["exercise-catalog", "ptbr"],
    queryFn: loadPtbrExerciseCatalog,
    staleTime: 1000 * 60 * 60,
  });

  const workout = detailQuery.data;
  const exercises =
    workout?.exercises.map((exercise) => {
      const catalogEntry = catalogQuery.data
        ? findPtbrCatalogEntry(exercise, catalogQuery.data)
        : null;
      const catalogSupportMedia = buildCatalogSupportMedia(
        exercise,
        catalogEntry,
      );

      return {
        ...exercise,
        supportMedia: exercise.supportMedia ?? catalogSupportMedia,
      };
    }) ?? [];
  const selectedExercise =
    exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;
  const workoutStatus =
    location.state?.workoutStatus ?? workout?.status ?? "pending";
  const workoutDate = location.state?.workoutDate ?? workout?.date ?? "";
  const canStartSelectedWorkout = canStudentStartWorkout(workoutStatus);

  function startWorkout() {
    if (!canStartSelectedWorkout) {
      return;
    }

    history.push(studentRoutes.workoutSession, { workoutId, workoutDate });
  }

  if (detailQuery.isPending) {
    return (
      <section className="fq-page-shell space-y-5">
        <div className="h-65 animate-pulse rounded-2xl border border-border/70 bg-white/60" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`detail-skeleton-stat-${index}`}
              className="h-34.5 animate-pulse rounded-2xl border border-border/70 bg-white/60"
            />
          ))}
        </div>
        <div className="grid gap-5 xl:fq-grid-main-sidebar">
          <div className="h-140 animate-pulse rounded-2xl border border-border/70 bg-white/60" />
          <div className="space-y-5">
            <div className="h-55 animate-pulse rounded-2xl border border-border/70 bg-white/60" />
            <div className="h-80 animate-pulse rounded-2xl border border-border/70 bg-white/60" />
          </div>
        </div>
      </section>
    );
  }

  if (detailQuery.isError || !workout) {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqAlert tone="danger" title="Treino não encontrado">
          Não foi possível abrir os detalhes deste treino.
        </FqAlert>
        <FqButton
          variant="outline"
          tone="neutral"
          onClick={() => history.push(studentRoutes.workouts)}
        >
          Voltar para Treinos
        </FqButton>
      </section>
    );
  }

  return (
    <section className="fq-page-shell space-y-5">
      <div className="fq-gradient-hero-mix overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-deep md:p-8">
        <button
          type="button"
          onClick={() => history.push(studentRoutes.workouts)}
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="space-y-3">
              <h1 className="fq-display text-screen-title text-foreground">
                {workout.title}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {workout.personalNote}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cx(
                  "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-caps-wide",
                  getStatusClasses(workoutStatus),
                )}
              >
                {workoutStatus === "completed"
                  ? "concluido"
                  : workoutStatus === "late"
                    ? "expirado"
                    : "programado"}
              </span>
              <span className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-caps-wide text-muted-foreground">
                {workout.intensity ?? "ritmo guiado"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated">
                {formatDate(workoutDate, { weekday: "long" })}
              </span>
              <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated">
                {workout.exercises.length} exercicios
              </span>
              <div className="inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated">
                <div className=" text-warning">
                  <Trophy className="h-5 w-5" />
                </div>
                +{workout.starsReward ?? 0} estrelas
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <FqButton
              variant="outline"
              tone="neutral"
              onClick={() => history.push(studentRoutes.workouts)}
            >
              Voltar para a agenda
            </FqButton>
            <FqButton
              leftIcon="play"
              onClick={startWorkout}
              isDisabled={!canStartSelectedWorkout}
            >
              {workoutStatus === "completed"
                ? "Treino concluido"
                : workoutStatus === "late"
                  ? "Treino expirado"
                  : "Iniciar treino"}
            </FqButton>
          </div>
        </div>
      </div>

      {workoutStatus === "late" ? (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm font-medium text-warning-foreground">
          A janela deste treino foi encerrada. O aluno pode consultar os
          detalhes, mas nao iniciar a sessao.
        </div>
      ) : null}

      <div className="grid gap-5 xl:fq-grid-main-sidebar">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 shadow-deep">
          <div className="border-b border-border/70 px-5 py-5 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-caps-wide text-primary">
                  Detalhes do treino
                </p>
                <h2 className="text-section-title font-semibold tracking-tight text-foreground">
                  Ordem do treino
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Cada exercicio recebeu uma leitura visual nova para facilitar
                  a execucao, revisar detalhes e entrar em sessao sem atrito.
                </p>
              </div>

              <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                {exercises.length} blocos de execucao
              </div>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5 md:px-6">
            {exercises.map((exercise) => (
              <article
                key={exercise.id}
                className={cx(
                  "rounded-2xl border p-4 shadow-overlay transition duration-200 hover:-translate-y-0.5 hover:shadow-deep md:p-5",
                  getExerciseStatusClasses(exercise.status),
                )}
              >
                <div className="flex md:flex-row gap-4 lg:fq-grid-thumb-content xl:fq-grid-thumb-content-auto xl:items-start">
                  <ExercisePreviewVisual
                    exercise={exercise}
                    className="h-44 w-full lg:h-43 lg:w-33"
                  />

                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-card-title font-semibold tracking-tight text-foreground">
                          {exercise.name}
                        </h3>
                      </div>

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {exercise.note ??
                          "Execucao limpa, ritmo constante e descanso respeitado."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
                        {exercise.sets} series
                      </span>
                      <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
                        {exercise.reps} reps
                      </span>
                      <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
                        {formatLoad(exercise.suggestedLoadKg)}
                      </span>
                      <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
                        {exercise.restSec}s descanso
                      </span>
                      {exercise.muscleGroup ? (
                        <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
                          {exercise.muscleGroup}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:flex-col xl:items-end">
                    <button
                      type="button"
                      onClick={() => setSelectedExerciseId(exercise.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated transition hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Sparkles className="h-4 w-4" />
                      Detalhes
                    </button>

                    {exercise.supportMedia ? (
                      <a
                        href={exercise.supportMedia.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-elevated transition hover:-translate-y-0.5 hover:border-destructive/25 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <PlayCircle className="h-4 w-4" />
                        {exercise.supportMedia.label === "Guia do exercicio"
                          ? "Guia"
                          : "Demo"}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/80 p-5 shadow-deep">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-secondary" />
              Nota do personal trainer
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {workout.personalNote}
            </p>
          </div>
        </aside>
      </div>

      <ExerciseInsightModal
        open={Boolean(selectedExercise)}
        exercise={selectedExercise}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedExerciseId(null);
          }
        }}
      />
    </section>
  );
}
