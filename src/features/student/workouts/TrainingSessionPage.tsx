import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Info } from "lucide-react";

import { studentRoutes } from "@/features/student/routes";
import {
  workoutService,
  type WorkoutSession,
  type WorkoutSessionSummary,
} from "@/shared/services";
import { FqAlert, FqButton, FqCard, FqText, useToast } from "@/shared/ui";
import { FqDrawer } from "@/shared/ui/navigation";
import type { ExerciseItem } from "./types";
import { ExerciseInsightModal } from "./components/ExerciseInsightModal";

type SessionUiState = "loading" | "ready" | "error" | "empty";

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function StorySetRing({
  totalSegments,
  filledSegments,
  size = 208,
  strokeWidth = 10,
  children,
}: {
  totalSegments: number;
  filledSegments: number;
  size?: number;
  strokeWidth?: number;
  children: ReactNode;
}) {
  const safeSegments = Math.max(totalSegments, 1);
  const safeFilledSegments = Math.min(
    Math.max(filledSegments, 0),
    safeSegments,
  );
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapLength = Math.min(12, circumference / (safeSegments * 2.4));
  const segmentLength = Math.max(
    (circumference - safeSegments * gapLength) / safeSegments,
    1,
  );
  const segmentAngle = 360 / safeSegments;
  const contentInset = strokeWidth + 8;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0 block"
        viewBox={`0 0 ${size} ${size}`}
      >
        {Array.from({ length: safeSegments }).map((_, index) => (
          <circle
            key={`track-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            transform={`rotate(${index * segmentAngle - 90} ${size / 2} ${size / 2})`}
            style={{ stroke: "var(--border)" }}
          />
        ))}

        {Array.from({ length: safeFilledSegments }).map((_, index) => (
          <circle
            key={`fill-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            transform={`rotate(${index * segmentAngle - 90} ${size / 2} ${size / 2})`}
            style={{ stroke: "var(--primary)" }}
          />
        ))}
      </svg>

      <div
        className="absolute flex items-center justify-center rounded-full border border-primary/10 bg-primary/5"
        style={{ inset: contentInset }}
      >
        {children}
      </div>
    </div>
  );
}

function syncExerciseStatuses(session: WorkoutSession): WorkoutSession {
  const requestedExercise = session.currentExerciseId
    ? session.exercises.find(
        (exercise) => exercise.id === session.currentExerciseId,
      )
    : undefined;
  const requestedExerciseDoneSets = requestedExercise
    ? (session.setsDoneByExerciseId[requestedExercise.id] ?? 0)
    : 0;
  const firstIncompleteExerciseId = session.exercises.find(
    (exercise) =>
      (session.setsDoneByExerciseId[exercise.id] ?? 0) < exercise.sets,
  )?.id;
  const activeExerciseId =
    requestedExercise && requestedExerciseDoneSets < requestedExercise.sets
      ? requestedExercise.id
      : firstIncompleteExerciseId;

  return {
    ...session,
    currentExerciseId: activeExerciseId,
    restTimerSec: activeExerciseId
      ? (session.exercises.find((exercise) => exercise.id === activeExerciseId)
          ?.restSec ?? session.restTimerSec)
      : 0,
    exercises: session.exercises.map((exercise) => {
      const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0;

      if (doneSets >= exercise.sets) {
        return {
          ...exercise,
          status: "done",
        };
      }

      if (exercise.id === activeExerciseId) {
        return {
          ...exercise,
          status: "current",
        };
      }

      return {
        ...exercise,
        status: "upcoming",
      };
    }),
  };
}

export function TrainingSessionPage() {
  const history = useHistory();
  const location = useLocation<{ workoutId?: string } | undefined>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [uiState, setUiState] = useState<SessionUiState>("loading");
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExecutionStarted, setIsExecutionStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [restRemainingSec, setRestRemainingSec] = useState(0);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const [shouldRestoreQueueAfterHowTo, setShouldRestoreQueueAfterHowTo] =
    useState(false);
  const [selectedHowToExerciseId, setSelectedHowToExerciseId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      setUiState("loading");
      setErrorMessage(null);

      try {
        const selectedWorkoutId = location.state?.workoutId;
        const activeSession = await workoutService.startSession(
          selectedWorkoutId ? { workoutId: selectedWorkoutId } : undefined,
        );

        if (!mounted) {
          return;
        }

        const preparedSession = syncExerciseStatuses(activeSession);

        setSession(preparedSession);
        setIsExecutionStarted(activeSession.totalElapsedSec > 0);
        setIsPaused(activeSession.status === "paused");
        setRestRemainingSec(preparedSession.restTimerSec);
        setIsQueueOpen(false);
        setIsHowToOpen(false);
        setShouldRestoreQueueAfterHowTo(false);
        setSelectedHowToExerciseId(null);
        setUiState(preparedSession.exercises.length ? "ready" : "empty");
      } catch (error) {
        if (!mounted) {
          return;
        }

        setUiState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar a sessao.",
        );
      }
    }

    void loadSession();

    return () => {
      mounted = false;
    };
  }, [location.state]);

  useEffect(() => {
    if (
      !session ||
      !isExecutionStarted ||
      isPaused ||
      session.status === "completed"
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setSession((currentSession) => {
        if (!currentSession) {
          return currentSession;
        }

        return {
          ...currentSession,
          totalElapsedSec: currentSession.totalElapsedSec + 1,
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isExecutionStarted, isPaused, session]);

  useEffect(() => {
    if (!isRestRunning || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setRestRemainingSec((currentValue) => {
        if (currentValue <= 1) {
          setIsRestRunning(false);
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPaused, isRestRunning]);

  const completedSets = useMemo(() => {
    if (!session) {
      return 0;
    }

    return session.exercises.reduce((total, exercise) => {
      const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0;
      return total + Math.min(doneSets, exercise.sets);
    }, 0);
  }, [session]);

  const totalSets = useMemo(() => {
    if (!session) {
      return 0;
    }

    return session.exercises.reduce(
      (total, exercise) => total + exercise.sets,
      0,
    );
  }, [session]);

  const pendingExercises = useMemo(() => {
    if (!session) {
      return [];
    }

    return session.exercises.filter((exercise) => {
      const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0;
      return doneSets < exercise.sets;
    });
  }, [session]);

  const completionPct =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const activeExercise =
    session?.exercises.find(
      (exercise) => exercise.id === session.currentExerciseId,
    ) ?? null;

  async function refreshWorkoutQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workouts"] }),
      queryClient.invalidateQueries({ queryKey: ["progress"] }),
      queryClient.invalidateQueries({ queryKey: ["gamification", "overview"] }),
      queryClient.invalidateQueries({ queryKey: ["home", "dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["ranking"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  }

  async function persistProgress(nextSession: WorkoutSession) {
    const preparedSession = syncExerciseStatuses(nextSession);
    setSession(preparedSession);
    setErrorMessage(null);

    try {
      await workoutService.saveSessionProgress(preparedSession);
      await refreshWorkoutQueries();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Falha ao salvar progresso da sessao.",
      );
      toast({
        title: "Falha ao salvar progresso",
        description:
          "Seu treino continua ativo. Tente salvar novamente em alguns segundos.",
        tone: "danger",
      });
    }
  }

  function handleStartSession() {
    if (!session) {
      return;
    }

    setIsExecutionStarted(true);
    setIsPaused(false);

    void persistProgress({
      ...session,
      status: "active",
      pausedAt: undefined,
    });
    toast({
      title: "Sessao iniciada",
      description: "Siga exercício por exercício e marque cada série.",
      tone: "success",
    });
  }

  function handleTogglePauseResume() {
    if (!session || !isExecutionStarted) {
      return;
    }

    const nextPaused = !isPaused;
    setIsPaused(nextPaused);

    void persistProgress({
      ...session,
      status: nextPaused ? "paused" : "active",
      pausedAt: nextPaused ? new Date().toISOString() : undefined,
    });
    toast({
      title: nextPaused ? "Sessão pausada" : "Sessão retomada",
      description: nextPaused
        ? "Seu progresso ficou salvo."
        : "Continue de onde você parou.",
      tone: "secondary",
    });
  }

  function handleFocusExercise(exerciseId: string) {
    if (!session) {
      return;
    }

    const targetExercise = session.exercises.find(
      (exercise) => exercise.id === exerciseId,
    );

    if (!targetExercise) {
      return;
    }

    setRestRemainingSec(targetExercise.restSec);
    setIsRestRunning(false);
    setIsQueueOpen(false);

    if (!isExecutionStarted || isPaused) {
      setSession(
        syncExerciseStatuses({
          ...session,
          currentExerciseId: exerciseId,
          restTimerSec: targetExercise.restSec,
        }),
      );
      return;
    }

    void persistProgress({
      ...session,
      currentExerciseId: exerciseId,
      restTimerSec: targetExercise.restSec,
      pausedAt: undefined,
    });
  }

  function handleOpenHowTo(exerciseId: string) {
    setShouldRestoreQueueAfterHowTo(false);
    setSelectedHowToExerciseId(exerciseId);
    setIsHowToOpen(true);
  }

  function handleMarkSetDone(exerciseId: string) {
    if (!session || !isExecutionStarted || isPaused) {
      return;
    }

    const exercise = session.exercises.find((item) => item.id === exerciseId);

    if (!exercise) {
      return;
    }

    const currentDone = session.setsDoneByExerciseId[exerciseId] ?? 0;

    if (currentDone >= exercise.sets) {
      return;
    }

    const nextSetsDoneByExerciseId = {
      ...session.setsDoneByExerciseId,
      [exerciseId]: currentDone + 1,
    };
    const nextIncompleteExercise = session.exercises.find((item) => {
      if (item.id === exerciseId) {
        return currentDone + 1 < item.sets;
      }

      return (nextSetsDoneByExerciseId[item.id] ?? 0) < item.sets;
    });
    const nextSession: WorkoutSession = {
      ...session,
      status: "active",
      setsDoneByExerciseId: nextSetsDoneByExerciseId,
      pausedAt: undefined,
      currentExerciseId: nextIncompleteExercise?.id,
      restTimerSec: nextIncompleteExercise?.restSec ?? 0,
    };

    setRestRemainingSec(nextIncompleteExercise ? exercise.restSec : 0);
    setIsRestRunning(
      currentDone + 1 < exercise.sets || Boolean(nextIncompleteExercise),
    );

    void persistProgress(nextSession);

    if (currentDone + 1 >= exercise.sets) {
      toast({
        title: "Exercício concluído",
        description: `${exercise.name} finalizado.`,
        tone: "success",
      });
    }
  }

  function handleSkipRest() {
    setIsRestRunning(false);
    setRestRemainingSec(0);
    toast({
      title: "Descanso pulado",
      description: "Você pode seguir para a próxima série.",
      tone: "secondary",
    });
  }

  async function handleCompleteSession() {
    if (!session) {
      return;
    }

    setErrorMessage(null);

    try {
      const summaryResponse: WorkoutSessionSummary =
        await workoutService.completeSession({
          ...session,
          status: "completed",
        });

      toast({
        title: "Sessão concluída",
        description: "Seu treino fechou com sucesso.",
        tone: "success",
      });

      await refreshWorkoutQueries();
      history.replace(
        `${studentRoutes.workouts}/completed/${summaryResponse.sessionId}`,
        {
          summary: summaryResponse,
        },
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir a sessao.",
      );
      toast({
        title: "Falha ao concluir sessão",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  if (uiState === "loading") {
    return (
      <section className="fq-page-shell-medium">
        <FqCard className="border-border bg-card">
          <FqText as="h1" className="text-lg font-semibold text-foreground">
            Carregando sessão de treino...
          </FqText>
        </FqCard>
      </section>
    );
  }

  if (uiState === "error") {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqAlert tone="danger" title="Falha ao carregar a sessao">
          {errorMessage ?? "Tente novamente para continuar seu treino."}
        </FqAlert>
        <FqButton
          onClick={() => history.push(studentRoutes.workouts)}
          variant="outline"
          tone="neutral"
        >
          Voltar para Treinos
        </FqButton>
      </section>
    );
  }

  if (uiState === "empty" || !session) {
    return (
      <section className="fq-page-shell-medium space-y-4">
        <FqCard className="border-border bg-card">
          <FqText as="h1" className="text-lg font-semibold text-foreground">
            Nenhum exercício disponível para esta sessão
          </FqText>
        </FqCard>
        <FqButton
          onClick={() => history.push(studentRoutes.workouts)}
          variant="outline"
          tone="neutral"
        >
          Voltar para Treinos
        </FqButton>
      </section>
    );
  }

  const remainingSets = Math.max(totalSets - completedSets, 0);
  const nextExercise =
    pendingExercises.find((exercise) => exercise.id !== activeExercise?.id) ??
    null;
  const activeExerciseDoneSets = activeExercise
    ? (session.setsDoneByExerciseId[activeExercise.id] ?? 0)
    : 0;
  const canCompleteSession = isExecutionStarted && completedSets > 0;
  const sessionStatus =
    completionPct >= 100
      ? "Pronta para finalizar"
      : isPaused
        ? "Pausada"
        : isExecutionStarted
          ? "Em execução"
          : "Pronta para iniciar";
  const sessionHeadline = activeExercise
    ? `${activeExercise.order}. ${activeExercise.name}`
    : completionPct >= 100
      ? "Sessao pronta para concluir"
      : session.title;
  const sessionDescription = activeExercise
    ? `Serie ${Math.min(activeExerciseDoneSets + 1, activeExercise.sets)} de ${activeExercise.sets}`
    : !isExecutionStarted
      ? "Inicie quando estiver pronto."
      : isPaused
        ? "Seu progresso esta salvo."
        : "Finalize a sessao quando terminar.";
  const timerLabel = isRestRunning ? "Descanso" : "Tempo";
  const timerValue = formatSeconds(
    isRestRunning ? restRemainingSec : session.totalElapsedSec,
  );
  const ringTotalSegments = totalSets;
  const ringFilledSegments = completedSets;
  const fallbackHowToExercise: ExerciseItem | null =
    activeExercise ?? session.exercises[0] ?? null;
  const howToExercise: ExerciseItem | null =
    session.exercises.find((exercise) => exercise.id === selectedHowToExerciseId) ??
    fallbackHowToExercise;

  return (
    <section className="fq-page-shell-medium max-w-md space-y-4">
      <header className="space-y-1">
        <FqText
          as="h1"
          className="text-2xl font-semibold text-foreground md:text-3xl"
        >
          Sessao de treino
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          {session.title} • {sessionStatus}
        </FqText>
      </header>

      {errorMessage ? (
        <FqAlert tone="danger" title="Falha ao salvar a sessao">
          {errorMessage}
        </FqAlert>
      ) : null}

      <FqCard className="border-border bg-card">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <FqText
                as="h2"
                className="truncate text-3xl font-semibold leading-tight text-foreground"
              >
                {sessionHeadline}
              </FqText>
            </div>
            <div className="rounded-[18px] border border-border/70 px-4 py-2 text-right">
              <FqText
                as="p"
                className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
              >
                Progresso
              </FqText>
              <FqText
                as="p"
                className="mt-1 text-2xl font-semibold leading-none text-foreground"
              >
                {completedSets}/{totalSets}
              </FqText>
            </div>
          </div>

          <div className="mx-auto flex justify-center">
            <StorySetRing
              totalSegments={ringTotalSegments}
              filledSegments={ringFilledSegments}
            >
              <div className="space-y-2 text-center">
                <FqText
                  as="p"
                  className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {timerLabel}
                </FqText>
                <FqText
                  as="p"
                  className="text-5xl font-semibold leading-none text-foreground"
                >
                  {timerValue}
                </FqText>
              </div>
            </StorySetRing>
          </div>

          <div className="space-y-1 text-center">
            <FqText
              as="p"
              className="text-4xl font-semibold leading-none text-foreground"
            >
              {activeExercise
                ? `${activeExerciseDoneSets}/${activeExercise.sets}`
                : `${completedSets}/${totalSets}`}
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              {sessionDescription}
            </FqText>
            {activeExercise ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                {activeExercise.reps} reps
                {activeExercise.suggestedLoadKg
                  ? ` • ${activeExercise.suggestedLoadKg} kg`
                  : ""}
              </FqText>
            ) : null}
          </div>

          {nextExercise ? (
            <div className="rounded-[18px] border border-border/70 px-4 py-3">
              <FqText
                as="p"
                className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
              >
                Proximo
              </FqText>
              <FqText
                as="p"
                className="mt-1 text-base font-semibold text-foreground"
              >
                {`${nextExercise.order}. ${nextExercise.name}`}
              </FqText>
            </div>
          ) : null}

          <div className="space-y-3">
            {!isExecutionStarted ? (
              <FqButton
                className="w-full"
                onClick={handleStartSession}
                leftIcon="play"
              >
                Iniciar sessao
              </FqButton>
            ) : isPaused ? (
              <FqButton
                className="w-full"
                onClick={handleTogglePauseResume}
                tone="secondary"
                leftIcon="play"
              >
                Retomar sessao
              </FqButton>
            ) : activeExercise ? (
              <FqButton
                className="w-full"
                onClick={() => handleMarkSetDone(activeExercise.id)}
                leftIcon="check"
              >
                Concluir série
              </FqButton>
            ) : (
              <FqButton
                className="w-full"
                onClick={handleCompleteSession}
                tone="success"
                leftIcon="check"
                isDisabled={!canCompleteSession}
              >
                Concluir sessao
              </FqButton>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FqButton
                className="w-full"
                variant="outline"
                tone="neutral"
                onClick={() =>
                  fallbackHowToExercise
                    ? handleOpenHowTo(fallbackHowToExercise.id)
                    : undefined
                }
                isDisabled={!howToExercise}
              >
                Detalhes
              </FqButton>
              <FqButton
                className="w-full"
                variant="outline"
                tone="neutral"
                onClick={() => setIsQueueOpen(true)}
              >
                Fila
              </FqButton>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isExecutionStarted && !isPaused ? (
                <FqButton
                  className="w-full"
                  onClick={handleTogglePauseResume}
                  variant="outline"
                  tone="warning"
                >
                  Pausar
                </FqButton>
              ) : (
                <span />
              )}

              {isRestRunning && !isPaused ? (
                <FqButton
                  className="w-full"
                  onClick={handleSkipRest}
                  variant="outline"
                  tone="neutral"
                >
                  Pular descanso
                </FqButton>
              ) : (
                <span />
              )}
            </div>

            {canCompleteSession && (activeExercise || isPaused) ? (
              <FqButton
                className="w-full"
                onClick={handleCompleteSession}
                variant="outline"
                tone="success"
                leftIcon="check"
              >
                Concluir sessao
              </FqButton>
            ) : null}

            <FqButton
              className="w-full"
              variant="ghost"
              tone="neutral"
              onClick={() => history.push(studentRoutes.workouts)}
            >
              Voltar
            </FqButton>
          </div>
        </div>
      </FqCard>

      <ExerciseInsightModal
        open={isHowToOpen}
        exercise={howToExercise}
        onOpenChange={(open) => {
          setIsHowToOpen(open);

          if (!open) {
            if (shouldRestoreQueueAfterHowTo) {
              setIsQueueOpen(true);
              setShouldRestoreQueueAfterHowTo(false);
            }

            setSelectedHowToExerciseId(null);
          }
        }}
      />
      <FqDrawer
        open={isQueueOpen}
        onOpenChange={setIsQueueOpen}
        side="bottom"
        title="Fila"
        description="Veja a ordem do treino, mude o foco ou abra a execução."
        className="h-[min(78vh,720px)] max-w-md"
      >
        <div className="space-y-4 px-1 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <FqText
                as="p"
                className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
              >
                Progresso
              </FqText>
              <FqText
                as="p"
                className="mt-1 text-3xl font-semibold leading-none text-foreground"
              >
                {completedSets}/{totalSets}
              </FqText>
            </div>
            <FqText as="p" className="text-sm text-muted-foreground">
              {remainingSets === 0
                ? "Tudo registrado."
                : `${remainingSets} series restantes.`}
            </FqText>
          </div>

          <div className="space-y-2">
            {session.exercises.map((exercise) => {
              const doneSets = session.setsDoneByExerciseId[exercise.id] ?? 0;
              const isDone = doneSets >= exercise.sets;
              const isCurrent = exercise.id === session.currentExerciseId;
              const statusLabel = isDone
                ? "Concluído"
                : isCurrent
                  ? "Em foco"
                  : "Na fila";
              const statusClassName = isDone
                ? "bg-tertiary/12 text-tertiary"
                : isCurrent
                  ? "bg-primary/12 text-primary"
                  : "bg-muted text-muted-foreground";

              return (
                <div
                  key={exercise.id}
                  className={
                    isCurrent
                      ? "rounded-[22px] border border-primary/20 bg-primary/5 px-4 py-4"
                      : "rounded-[22px] border border-border/70 bg-background/70 px-4 py-4"
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-card text-sm font-semibold text-foreground">
                      {exercise.order}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <FqText as="p" className="truncate font-semibold text-foreground">
                            {exercise.name}
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-1 text-sm text-muted-foreground"
                          >
                            {doneSets}/{exercise.sets} series • {exercise.reps} reps •{" "}
                            {exercise.restSec}s
                          </FqText>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName}`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {exercise.note ? (
                        <FqText
                          as="p"
                          className="mt-3 text-sm leading-6 text-muted-foreground"
                        >
                          {exercise.note}
                        </FqText>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsQueueOpen(false);
                            setShouldRestoreQueueAfterHowTo(true);
                            setSelectedHowToExerciseId(exercise.id);
                            setIsHowToOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition hover:text-primary"
                        >
                          <Info className="h-4 w-4" />
                          Ver execução
                        </button>

                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleFocusExercise(exercise.id)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                          >
                            Trazer ao foco
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            Exercício atual
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FqDrawer>
    </section>
  );
}
