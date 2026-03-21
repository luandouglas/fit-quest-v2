import { FqButton, FqIcon, FqTag, FqText } from "@/shared/ui/primitives";
import type { AuthUserRole } from "@/shared/types";

import { getRoleOption, roleTones } from "./signUpFlow";

export function SignUpFlowHeader({
  role,
  currentStep,
  totalSteps,
  title,
  hint,
  onBack,
}: {
  role: AuthUserRole;
  currentStep: number;
  totalSteps: number;
  title: string;
  hint: string;
  onBack: () => void;
}) {
  const roleOption = getRoleOption(role);
  const progressPct = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <FqButton
          type="button"
          variant="outline"
          tone="neutral"
          onClick={onBack}
          aria-label="Voltar"
          className="h-11 w-11 shrink-0 rounded-2xl px-0"
        >
          <FqIcon name="arrowLeft" size={18} />
        </FqButton>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <FqTag tone={roleTones[role]}>{roleOption?.shortLabel ?? "Perfil"}</FqTag>
            <FqTag tone="neutral">
              Etapa {currentStep + 1} de {totalSteps}
            </FqTag>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-width duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <FqText
          as="h1"
          className="fq-display text-screen-title leading-tight text-foreground"
        >
          {title}
        </FqText>
        <FqText className="text-body leading-relaxed text-muted-foreground">
          {hint}
        </FqText>
      </div>
    </div>
  );
}
