import { AlertTriangle, Dumbbell } from "lucide-react";

import { FqButton, FqSkeleton, FqText } from "@/shared/ui";

type FeedbackStateProps = {
  onBack: () => void;
};

type ErrorStateProps = {
  onRetry: () => void;
};

type EmptyStateProps = FeedbackStateProps;

export function TrainingPlanLoadingState() {
  return (
    <section className="fq-page-shell space-y-5">
      <div className="fq-gradient-hero-mix overflow-hidden rounded-2xl border border-border/70 bg-card p-6 md:p-8">
        <div className="grid gap-5 lg:fq-grid-main-sidebar-md">
          <div className="space-y-4">
            <FqSkeleton className="h-4 w-28" rounded="full" />
            <FqSkeleton className="h-14 w-full max-w-popover" rounded="lg" />
            <FqSkeleton className="h-5 w-full max-w-popover-lg" rounded="full" />
            <FqSkeleton className="h-3 w-full" rounded="full" />
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-overlay">
            <FqSkeleton className="h-4 w-32" rounded="full" />
            <FqSkeleton className="mt-4 h-8 w-40" rounded="lg" />
            <FqSkeleton className="mt-3 h-16 w-full" rounded="lg" />
            <div className="mt-5 flex gap-2">
              <FqSkeleton className="h-10 flex-1" rounded="full" />
              <FqSkeleton className="h-10 flex-1" rounded="full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:fq-grid-main-sidebar-55-300">
        <div className="space-y-5">
          <FqSkeleton className="h-75 w-full rounded-2xl" />
          <FqSkeleton className="h-105 w-full rounded-2xl" />
        </div>

        <div className="space-y-5">
          <FqSkeleton className="h-52.5 w-full rounded-2xl" />
          <FqSkeleton className="h-40 w-full rounded-2xl" />
          <FqSkeleton className="h-65 w-full rounded-2xl" />
        </div>
      </div>
    </section>
  );
}

export function TrainingPlanErrorState({ onRetry }: ErrorStateProps) {
  return (
    <section className="fq-page-shell">
      <div className="fq-gradient-hero-danger overflow-hidden rounded-2xl border border-destructive/20 bg-card p-6 shadow-deep md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <FqText
                as="p"
                className="text-xs font-semibold uppercase tracking-caps-wide text-destructive"
              >
                Training plan
              </FqText>
              <FqText
                as="h1"
                className="text-card-title font-semibold tracking-tight text-foreground"
              >
                Nao foi possivel carregar seus treinos
              </FqText>
              <FqText
                as="p"
                className="max-w-2xl text-sm leading-relaxed text-muted-foreground"
              >
                A experiencia foi redesenhada, mas os dados ainda nao chegaram.
                Tente recarregar para montar sua agenda novamente.
              </FqText>
            </div>
          </div>

          <FqButton onClick={onRetry} rightIcon="arrowRight">
            Tentar novamente
          </FqButton>
        </div>
      </div>
    </section>
  );
}

export function TrainingPlanEmptyState({ onBack }: EmptyStateProps) {
  return (
    <section className="fq-page-shell flex fq-min-h-page flex-col justify-between gap-8">
      <div className="fq-gradient-hero-mix overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-deep md:p-8">
        <div className="grid gap-6 lg:fq-grid-main-sidebar-narrow-xs lg:items-end">
          <div className="space-y-4 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-overlay md:border-0 md:bg-transparent md:p-0 md:shadow-none">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-btn-primary">
              <Dumbbell className="h-6 w-6" />
            </div>

            <FqText
              as="p"
              className="text-xs font-semibold uppercase tracking-caps-wide text-primary"
            >
              Plano de treino
            </FqText>
            <FqText as="h1" className="fq-display text-screen-title text-foreground">
              Nenhum treino atribuido para voce
            </FqText>
            <FqText
              as="p"
              className="max-w-2xl text-sm leading-relaxed text-muted-foreground"
            >
              Ainda nao existem treinos atribuidos para voce. Entre em contato
              com um personal para montar sua rotina e liberar seu plano por
              aqui.
            </FqText>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-overlay">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <FqText as="p" className="text-sm font-semibold text-foreground">
                Assim que um personal atribuir seu plano, ele aparece aqui.
              </FqText>
            </div>

            <FqButton variant="outline" tone="neutral" onClick={onBack}>
              Voltar para o hub
            </FqButton>
          </div>
        </div>
      </div>
    </section>
  );
}
