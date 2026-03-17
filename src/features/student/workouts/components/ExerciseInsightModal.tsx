import { startTransition, useEffect, useRef, useState } from "react";

import { CirclePlay, Dumbbell, Flame, Info, TimerReset, X } from "lucide-react";

import { FqModal } from "@/shared/ui/feedback";
import { FqDrawer } from "@/shared/ui/navigation";
import { cx } from "@/shared/utils";

import type { WorkoutExercise } from "../types";

type ExerciseInsightModalProps = {
  open: boolean;
  exercise: WorkoutExercise | null;
  onOpenChange: (open: boolean) => void;
};

function formatLoad(exercise: WorkoutExercise) {
  return typeof exercise.suggestedLoadKg === "number"
    ? `${exercise.suggestedLoadKg} kg`
    : "Carga livre";
}

function buildExecutionSteps(exercise: WorkoutExercise) {
  return [
    exercise.equipment
      ? `Prepare ${exercise.equipment.toLowerCase()} e ajuste a base antes de iniciar a primeira serie.`
      : "Prepare o espaco e estabilize o corpo antes da primeira repeticao.",
    exercise.note ??
      "Busque uma execucao limpa, com ritmo constante e postura alinhada.",
    `Execute ${exercise.sets} series de ${exercise.reps} repeticoes, mantendo amplitude controlada do inicio ao fim.`,
    typeof exercise.suggestedLoadKg === "number"
      ? `Use ${exercise.suggestedLoadKg} kg como referencia e reduza a carga se perder controle tecnico.`
      : "Ajuste a carga para preservar tecnica e ritmo sem compensacoes.",
    `Respeite ${exercise.restSec}s de descanso entre as series antes de avancar para a proxima rodada.`,
  ];
}

function buildCoachTips(exercise: WorkoutExercise) {
  return [
    exercise.muscleGroup
      ? `Mantenha a tensao principal em ${exercise.muscleGroup.toLowerCase()} durante toda a serie.`
      : "Mantenha tensao continua no musculo alvo durante toda a serie.",
    "Use a primeira serie para calibrar amplitude, respiracao e velocidade de execucao.",
    exercise.supportMedia
      ? "Se surgir duvida de forma, abra a demonstracao antes da primeira serie pesada."
      : "Se a execucao variar demais, reduza a carga antes de continuar.",
  ];
}

function buildCommonMistakes(exercise: WorkoutExercise) {
  return [
    typeof exercise.suggestedLoadKg === "number"
      ? "Subir a carga acima do que voce consegue controlar com postura estavel."
      : "Acelerar demais a repeticao e perder controle na volta.",
    "Encurtar a amplitude para terminar a serie mais rapido.",
    `Ignorar o descanso de ${exercise.restSec}s e deixar a tecnica cair nas ultimas series.`,
  ];
}

function getIsMobileViewport() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

export function ExerciseInsightModal({
  open,
  exercise,
  onOpenChange,
}: ExerciseInsightModalProps) {
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
  const [videoActive, setVideoActive] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handlePlay = () => {
    setVideoActive(true);
    setTimeout(() => {
      const el = overlayRef.current;
      if (!el) return;
      const reqFS =
        el.requestFullscreen?.bind(el) ??
        (
          el as unknown as { webkitRequestFullscreen?: () => Promise<void> }
        ).webkitRequestFullscreen?.bind(el);
      reqFS?.()
        ?.then(() =>
          (
            screen.orientation as unknown as {
              lock?: (o: string) => Promise<void>;
            }
          ).lock?.("landscape"),
        )
        ?.catch(() => {});
    }, 0);
  };

  const handleCloseVideo = () => {
    setVideoActive(false);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    (screen.orientation as unknown as { unlock?: () => void }).unlock?.();
  };

  useEffect(() => {
    if (!open) {
      startTransition(() => setVideoActive(false));
      (screen.orientation as unknown as { unlock?: () => void }).unlock?.();
    }
  }, [open]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      startTransition(() => setIsMobileViewport(false));
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleViewportChange = (
      event: MediaQueryListEvent | MediaQueryList,
    ) => {
      setIsMobileViewport(event.matches);
    };

    handleViewportChange(mediaQuery);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleViewportChange);
    } else {
      mediaQuery.addListener(handleViewportChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleViewportChange);
      } else {
        mediaQuery.removeListener(handleViewportChange);
      }
    };
  }, []);

  if (!exercise) {
    return null;
  }

  const videoOverlay =
    videoActive && exercise?.supportMedia ? (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black"
      >
        <button
          type="button"
          onClick={handleCloseVideo}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
          aria-label="Fechar video"
        >
          <X className="h-5 w-5" />
        </button>
        <iframe
          src={`https://drive.google.com/file/d/1_xVgBk0-boikmqzc7HgSY7rhN6Zza8PH/preview`}
          title="Video demonstrativo do exercicio"
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    ) : null;

  const executionSteps = buildExecutionSteps(exercise);
  const coachTips = buildCoachTips(exercise);
  const commonMistakes = buildCommonMistakes(exercise);
  const content = (
    <div className="space-y-5 px-1 pb-2">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <span>Exercise detail</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>
            {exercise.status === "done"
              ? "feito"
              : exercise.status === "current"
                ? "em foco"
                : "planejado"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
            {exercise.sets} series
          </span>
          <span className="rounded-full bg-secondary/12 px-3 py-1 text-xs font-semibold text-secondary">
            {exercise.reps} reps
          </span>
          <span className="rounded-full bg-tertiary/18 px-3 py-1 text-xs font-semibold text-foreground">
            {formatLoad(exercise)}
          </span>
          {exercise.muscleGroup ? (
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              {exercise.muscleGroup}
            </span>
          ) : null}
        </div>
      </div>

      {exercise.supportMedia ? (
        <section className="fq-gradient-soft-danger overflow-hidden rounded-[28px] border border-destructive/18 shadow-[0_18px_40px_rgba(198,90,88,0.08)]">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <CirclePlay className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Demonstracao em video
                </p>
                <p className="text-xs text-muted-foreground">
                  {exercise.supportMedia.label ??
                    "Veja o movimento antes de comecar a serie."}
                </p>
              </div>
            </div>
            <a
              href={exercise.supportMedia.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-semibold text-destructive underline-offset-2 hover:underline"
            >
              Abrir no Drive
            </a>
          </div>
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={handlePlay}
              className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-black/85"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur-sm transition group-hover:bg-white/30 group-active:scale-95">
                <CirclePlay className="h-8 w-8 text-white" />
              </div>
              <span className="absolute bottom-3 left-0 right-0 text-center text-xs font-medium text-white/60">
                Toque para assistir em tela cheia
              </span>
            </button>
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-border/70 bg-white/76 p-5 shadow-[0_18px_40px_rgba(36,49,44,0.06)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Dumbbell className="h-4 w-4 text-primary" />
          Foco do movimento
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-muted/45 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Grupo alvo
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {exercise.muscleGroup ?? "Full body"}
            </p>
          </div>

          <div className="rounded-2xl bg-muted/45 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Equipamento
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {exercise.equipment ?? "Peso corporal / livre"}
            </p>
          </div>

          <div className="rounded-2xl bg-muted/45 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Descanso
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {exercise.restSec}s entre series
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-white/76 p-5 shadow-[0_18px_40px_rgba(36,49,44,0.06)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Info className="h-4 w-4 text-secondary" />
          Como executar
        </div>

        <ol className="mt-5 space-y-4">
          {executionSteps.map((step, index) => (
            <li
              key={`${exercise.id}-step-${index}`}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/14 text-sm font-semibold text-secondary">
                {index + 1}
              </span>
              <p className="text-sm leading-7 text-foreground/88">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="fq-gradient-soft-warning rounded-[28px] border border-warning/28 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Flame className="h-4 w-4 text-warning" />
            Coach tips
          </div>

          <ul className="mt-4 space-y-3">
            {coachTips.map((tip, index) => (
              <li
                key={`${exercise.id}-tip-${index}`}
                className="flex items-start gap-3 text-sm leading-6 text-foreground/88"
              >
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-warning" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="fq-gradient-soft-danger rounded-[28px] border border-destructive/18 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TimerReset className="h-4 w-4 text-destructive" />
            Evite isso
          </div>

          <ul className="mt-4 space-y-3">
            {commonMistakes.map((mistake, index) => (
              <li
                key={`${exercise.id}-mistake-${index}`}
                className="flex items-start gap-3 text-sm leading-6 text-foreground/88"
              >
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {exercise.note ? (
        <section className="fq-gradient-soft-primary rounded-[28px] border border-primary/16 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Info className="h-4 w-4 text-primary" />
            Nota rapida
          </div>
          <p className={cx("mt-3 text-sm leading-7 text-foreground/88")}>
            {exercise.note}
          </p>
        </section>
      ) : null}
    </div>
  );

  if (isMobileViewport) {
    return (
      <>
        {videoOverlay}
        <FqDrawer
          open={open}
          onOpenChange={onOpenChange}
          side="bottom"
          title={exercise.name}
          description="Tudo o que voce precisa para executar com mais confianca, ritmo e consistencia."
          className="h-[min(88vh,860px)] max-w-md sm:max-w-2xl"
        >
          {content}
        </FqDrawer>
      </>
    );
  }

  return (
    <>
      {videoOverlay}
      <FqModal
        open={open}
        onOpenChange={onOpenChange}
        title={exercise.name}
        description="Tudo o que voce precisa para executar com mais confianca, ritmo e consistencia."
        className="max-h-[88vh] w-[min(920px,92vw)] rounded-[28px] border-border/70 bg-card p-5 shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
        bodyClassName="max-h-[calc(88vh-96px)]"
      >
        {content}
      </FqModal>
    </>
  );
}
