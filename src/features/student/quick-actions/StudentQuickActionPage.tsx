import { useState } from "react";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useHistory } from "react-router-dom";

import { homeQueryKeys } from "@/features/student/home/hooks/queryKeys";
import { studentRoutes } from "@/features/student/routes";
import { homeService, workoutService } from "@/shared/services";
import type { WorkoutPlanSnapshot } from "@/shared/services/contracts/workout";
import { FqButton, FqCard, FqTag, FqText, useToast } from "@/shared/ui";
import { canStudentStartWorkout, cx } from "@/shared/utils";

type StudentQuickActionKind = "workout" | "water" | "meal";

type StudentQuickActionPageProps = {
  kind: StudentQuickActionKind;
};

type AvailableWorkoutTarget = {
  id: string;
  title: string;
  date?: string;
};

type QuickActionMutationResult =
  | {
      kind: "workout";
      workoutId?: string;
      title: string;
      workoutDate?: string;
    }
  | {
      kind: "water";
      totalWaterMl: number;
      amountMl: number;
    }
  | {
      kind: "meal";
      mealId: string | null;
    };

const waterOptions = [250, 500, 750] as const;

const actionCopy: Record<
  StudentQuickActionKind,
  {
    eyebrow: string;
    title: string;
    description: string;
    helper: string;
    primaryLabel: string;
    secondaryLabel: string;
    accentClassName: string;
  }
> = {
  workout: {
    eyebrow: "Atalho central",
    title: "Registrar treino",
    description:
      "Abra sua sessao com contexto claro, pouca friccao e o treino certo ja na frente.",
    helper:
      "O aluno so pode iniciar treinos ainda validos no plano. Se a janela ja passou, use a agenda para consultar o restante da rotina.",
    primaryLabel: "Iniciar sessao",
    secondaryLabel: "Ver plano completo",
    accentClassName:
      "fq-accent-gamification",
  },
  water: {
    eyebrow: "Atalho central",
    title: "Registrar agua",
    description:
      "Atualize sua hidratacao em um toque e veja a meta do dia responder sem atrito.",
    helper:
      "Ideal para aquele registro rapido durante treino, trabalho ou deslocamento.",
    primaryLabel: "Salvar agua",
    secondaryLabel: "Abrir nutricao",
    accentClassName:
      "fq-accent-primary",
  },
  meal: {
    eyebrow: "Atalho central",
    title: "Registrar refeicao",
    description:
      "Marque a proxima refeicao pendente e mantenha o plano alimentar andando no ritmo do seu dia.",
    helper:
      "Quando nao houver refeicoes pendentes, voce cai direto em Nutricao com o restante do dia visivel.",
    primaryLabel: "Registrar agora",
    secondaryLabel: "Abrir nutricao",
    accentClassName:
      "fq-accent-secondary",
  },
};

function getAvailableWorkoutTarget(
  snapshot: WorkoutPlanSnapshot | undefined,
): AvailableWorkoutTarget | null {
  if (!snapshot) {
    return null;
  }

  if (
    snapshot.todayWorkout.workoutId &&
    canStudentStartWorkout(snapshot.todayWorkout.status)
  ) {
    return {
      id: snapshot.todayWorkout.workoutId,
      title: snapshot.todayWorkout.title,
    };
  }

  const nextWorkout = snapshot.workouts.find((workout) =>
    canStudentStartWorkout(workout.status),
  );

  return nextWorkout
    ? {
        id: nextWorkout.id,
        title: nextWorkout.title,
        date: nextWorkout.date,
      }
    : null;
}

async function invalidateStudentQuickActionQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: homeQueryKeys.dashboard }),
    queryClient.invalidateQueries({ queryKey: ["workouts", "plan"] }),
    queryClient.invalidateQueries({ queryKey: ["workouts", "active-session"] }),
    queryClient.invalidateQueries({ queryKey: ["progress"] }),
    queryClient.invalidateQueries({ queryKey: ["gamification", "overview"] }),
    queryClient.invalidateQueries({ queryKey: ["ranking"] }),
    queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    queryClient.invalidateQueries({ queryKey: ["layout", "student-level"] }),
  ]);
}

export function StudentQuickActionPage({
  kind,
}: StudentQuickActionPageProps) {
  const history = useHistory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedWaterMl, setSelectedWaterMl] = useState<number>(500);

  const copy = actionCopy[kind];

  const homeOverviewQuery = useQuery({
    queryKey: homeQueryKeys.dashboard,
    queryFn: () => homeService.getDashboardOverview(),
    enabled: kind !== "workout",
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const workoutPlanQuery = useQuery({
    queryKey: ["workouts", "plan"],
    queryFn: () => workoutService.getPlanSnapshot(),
    enabled: kind === "workout",
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const actionMutation = useMutation<QuickActionMutationResult, Error>({
    mutationFn: async () => {
      if (kind === "workout") {
        const snapshot = await workoutService.getPlanSnapshot();
        const availableWorkout = getAvailableWorkoutTarget(snapshot);

        const workoutId = availableWorkout?.id;

        if (!workoutId) {
          throw new Error("Nao existe treino disponivel para iniciar agora.");
        }

        return {
          kind,
          workoutId,
          workoutDate: availableWorkout.date,
          title: availableWorkout.title,
        };
      }

      if (kind === "water") {
        const response = await homeService.registerWaterQuick(selectedWaterMl);
        return {
          kind,
          totalWaterMl: response.totalWaterMl,
          amountMl: selectedWaterMl,
        };
      }

      const response = await homeService.registerMealQuick();
      return {
        kind,
        mealId: response.mealId,
      };
    },
    onSuccess: async (result) => {
      await invalidateStudentQuickActionQueries(queryClient);

      if (result.kind === "workout") {
        toast({
          title: "Sessao pronta para comecar",
          description:
            "Voce caiu direto no fluxo principal de treino pelo atalho central.",
          tone: "success",
        });
        history.push(
          studentRoutes.workoutSession,
          result.workoutId
            ? { workoutId: result.workoutId, workoutDate: result.workoutDate }
            : undefined,
        );
        return;
      }

      if (result.kind === "water") {
        toast({
          title: "Hidratacao atualizada",
          description: `+${result.amountMl} ml registrados. Total do dia: ${result.totalWaterMl} ml.`,
          tone: "success",
        });
        history.push(studentRoutes.nutrition);
        return;
      }

      if (!result.mealId) {
        toast({
          title: "Sem refeicao pendente",
          description: "Seu plano alimentar ja esta em dia por enquanto.",
          tone: "warning",
        });
        history.push(studentRoutes.nutrition);
        return;
      }

      toast({
        title: "Refeicao registrada",
        description: "Seu check-in foi salvo e o plano alimentar foi atualizado.",
        tone: "success",
      });
      history.push(`${studentRoutes.nutrition}/meal/${result.mealId}`);
    },
    onError: (error) => {
      toast({
        title:
          kind === "workout"
            ? "Nao foi possivel abrir o treino"
            : kind === "water"
              ? "Falha ao registrar agua"
              : "Falha ao registrar refeicao",
        description: error.message,
        tone: "danger",
      });
    },
  });

  const homeOverview = homeOverviewQuery.data;
  const workoutPlan = workoutPlanQuery.data;
  const waterProgressPct = homeOverview
    ? Math.round(
        (homeOverview.summary.waterConsumedMl /
          Math.max(homeOverview.summary.waterGoalMl, 1)) *
          100,
      )
    : 0;
  const mealProgressPct = homeOverview
    ? Math.round(
        (homeOverview.summary.mealsLogged /
          Math.max(homeOverview.summary.mealsTotal, 1)) *
          100,
      )
    : 0;
  const availableWorkout =
    kind === "workout" ? getAvailableWorkoutTarget(workoutPlan) : null;

  return (
    <section className="fq-page-shell space-y-5">
      <header className="fq-page-header">
        <FqText as="h1" variant="title">
          {copy.title}
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          {copy.description}
        </FqText>
      </header>

      <FqCard className="overflow-hidden border-border/80 bg-card/95">
        <div className="relative space-y-5">
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-32 rounded-xl bg-gradient-to-br opacity-90 blur-2xl",
              copy.accentClassName,
            )}
          />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <FqTag tone="secondary">{copy.eyebrow}</FqTag>
              <div className="space-y-2">
                <FqText as="h2" className="text-sm font-semibold text-foreground">
                  {copy.title}
                </FqText>
                <FqText as="p" className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  {copy.helper}
                </FqText>
              </div>
            </div>

            <div className="grid min-w-55 gap-2 sm:grid-cols-2 md:grid-cols-1">
              {kind === "workout" ? (
                <>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-float">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-caps-wide text-muted-foreground">
                      Hoje
                    </FqText>
                    <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                      {workoutPlan?.todayWorkout.title ?? "Treino do dia"}
                    </FqText>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-float">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-caps-wide text-muted-foreground">
                      Ritmo
                    </FqText>
                    <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                      {workoutPlan?.todayWorkout.durationMin ?? 0} min planejados
                    </FqText>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-float">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-caps-wide text-muted-foreground">
                      Progresso
                    </FqText>
                    <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                      {kind === "water"
                        ? `${homeOverview?.summary.waterConsumedMl ?? 0}/${homeOverview?.summary.waterGoalMl ?? 0} ml`
                        : `${homeOverview?.summary.mealsLogged ?? 0}/${homeOverview?.summary.mealsTotal ?? 0} refeicoes`}
                    </FqText>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 shadow-float">
                    <FqText as="p" className="text-xs font-semibold uppercase tracking-caps-wide text-muted-foreground">
                      Aderencia
                    </FqText>
                    <FqText as="p" className="mt-2 text-sm font-semibold text-foreground">
                      {kind === "water" ? `${waterProgressPct}% da meta` : `${mealProgressPct}% do plano`}
                    </FqText>
                  </div>
                </>
              )}
            </div>
          </div>

          {kind === "water" ? (
            <div className="relative flex flex-wrap gap-2">
              {waterOptions.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  aria-pressed={selectedWaterMl === amount}
                  className={cx(
                    "inline-flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                    selectedWaterMl === amount
                      ? "border-primary/30 bg-primary/10 text-primary shadow-float"
                      : "border-border/70 bg-background/80 text-foreground",
                  )}
                  onClick={() => setSelectedWaterMl(amount)}
                >
                  {amount} ml
                </button>
              ))}
            </div>
          ) : null}

          <div className="relative grid gap-3 sm:grid-cols-2">
            <FqButton
              leftIcon={kind === "workout" ? "play" : kind === "water" ? "plus" : "check"}
              isLoading={actionMutation.isPending}
              isDisabled={kind === "workout" && !availableWorkout}
              onClick={() => actionMutation.mutate()}
            >
              {copy.primaryLabel}
            </FqButton>

            <FqButton
              variant="outline"
              tone="neutral"
              leftIcon={kind === "workout" ? "dumbbell" : "utensils"}
              onClick={() =>
                history.push(
                  kind === "workout" ? studentRoutes.workouts : studentRoutes.nutrition,
                )
              }
            >
              {copy.secondaryLabel}
            </FqButton>
          </div>
        </div>
      </FqCard>
    </section>
  );
}
