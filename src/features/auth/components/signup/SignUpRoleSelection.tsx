import { FqIcon, FqTag, FqText } from "@/shared/ui/primitives";
import { cx } from "@/shared/utils";
import type { AuthUserRole } from "@/shared/types";

import { roleOptions } from "./signUpFlow";

function SignUpRoleCard({
  role,
  selected,
  disabled,
  onSelect,
}: {
  role: (typeof roleOptions)[number];
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const titleId = `signup-role-${role.value.toLowerCase()}-title`;
  const descriptionId = `signup-role-${role.value.toLowerCase()}-description`;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cx(
        "w-full rounded-2xl border p-5 text-left transition",
        selected
          ? "border-primary/35 bg-primary/10 shadow-overlay"
          : "border-border bg-card hover:border-primary/20 hover:bg-muted/40",
        disabled ? "cursor-not-allowed opacity-60" : null,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cx(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
              selected
                ? "border-primary/20 bg-primary text-primary-foreground"
                : "border-border/70 bg-muted/70 text-foreground",
            )}
          >
            <FqIcon name={role.icon} size={18} />
          </span>

          <div className="space-y-1">
            <FqText
              as="p"
              id={titleId}
              className="text-card-title font-semibold text-foreground"
            >
              {role.label}
            </FqText>
            <FqText
              id={descriptionId}
              className="text-sm leading-6 text-muted-foreground"
            >
              {role.description}
            </FqText>
          </div>
        </div>

        <span
          className={cx(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-transparent",
          )}
        >
          <FqIcon name="check" size={13} />
        </span>
      </div>
    </button>
  );
}

export function SignUpRoleSelection({
  selectedRole,
  roleLocked,
  inviteCode,
  forcedRole,
  onSelectRole,
}: {
  selectedRole: AuthUserRole | null;
  roleLocked: boolean;
  inviteCode: string;
  forcedRole: AuthUserRole | null;
  onSelectRole: (role: AuthUserRole) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <FqTag tone="primary">Primeiro passo</FqTag>
          <FqTag tone="neutral">Escolha o perfil</FqTag>
        </div>

        <div className="space-y-2">
          <FqText
            as="h1"
            className="fq-display text-screen-title leading-tight text-foreground"
          >
            Escolha seu perfil
          </FqText>
          <FqText className="text-body leading-relaxed text-muted-foreground">
            Depois disso, o restante do cadastro aparece em etapas.
          </FqText>
        </div>
      </div>

      {inviteCode ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <FqText as="p" className="text-sm font-medium text-primary">
            Cadastro por convite: o perfil de aluno ja esta definido.
          </FqText>
        </div>
      ) : null}

      {forcedRole && !inviteCode ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <FqText as="p" className="text-sm font-medium text-primary">
            Este link ja veio com um perfil predefinido.
          </FqText>
        </div>
      ) : null}

      <div className="grid gap-3">
        {roleOptions.map((role) => {
          const disabled =
            roleLocked && selectedRole !== null && role.value !== selectedRole;

          return (
            <SignUpRoleCard
              key={role.value}
              role={role}
              selected={selectedRole === role.value}
              disabled={disabled}
              onSelect={() => {
                if (!disabled) {
                  onSelectRole(role.value);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
