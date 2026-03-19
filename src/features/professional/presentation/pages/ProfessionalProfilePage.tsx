import { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";

import { getDefaultTabsPathByRole } from "@/app/router/guards/Guards";
import { useAuth, useRole } from "@/shared/hooks";
import { FqButton, FqCard, FqPage, FqText } from "@/shared/ui";

const roleLabelMap = {
  PERSONAL: "Personal trainer",
  NUTRITIONIST: "Nutricionista",
  STUDENT: "Aluno",
} as const;

function resolveProfessionalSummary(role: "PERSONAL" | "NUTRITIONIST") {
  if (role === "PERSONAL") {
    return "Gerencie sua conta profissional e revise os dados ativos na sessao.";
  }

  return "Confira os dados da sua conta profissional e acesse o workspace principal.";
}

export function ProfessionalProfilePage() {
  const history = useHistory();
  const { user, logout } = useAuth();
  const { role, isStudent } = useRole();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (isStudent) {
    return <Redirect to={getDefaultTabsPathByRole(role)} />;
  }

  const professionalRole = role === "PERSONAL" ? "PERSONAL" : "NUTRITIONIST";
  const professionalProfile = user.professionalProfile;
  const specialties = professionalProfile?.specialties ?? [];
  const professionalTitle =
    professionalProfile?.title?.trim() || roleLabelMap[professionalRole];
  const license = professionalProfile?.license?.trim();

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <FqPage className="min-h-full bg-transparent">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-2 md:py-4">
        <section className="rounded-[32px] border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(120,146,174,0.18),_transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,247,243,0.94))] px-6 py-7 shadow-[0_24px_60px_rgba(60,73,66,0.08)] md:px-8 md:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex w-fit items-center rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                {roleLabelMap[professionalRole]}
              </span>
              <div className="space-y-2">
                <FqText as="h1" variant="title" className="text-3xl text-foreground md:text-4xl">
                  {user.name}
                </FqText>
                <FqText variant="subtitle" className="text-foreground/80">
                  {professionalTitle}
                </FqText>
              </div>
              <FqText className="max-w-2xl text-sm text-muted-foreground">
                {resolveProfessionalSummary(professionalRole)}
              </FqText>
            </div>

            <div className="flex flex-wrap gap-3">
              <FqButton onClick={() => history.push(getDefaultTabsPathByRole(role))}>
                Ir para o painel
              </FqButton>
              <FqButton
                variant="outline"
                tone="neutral"
                onClick={() => void handleSignOut()}
                isLoading={isSigningOut}
              >
                Encerrar sessao
              </FqButton>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.95fr)]">
          <FqCard
            title="Dados da conta"
            subtitle="Informacoes ativas no momento para a sua sessao autenticada."
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Nome
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">{user.name}</dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Papel
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">
                  {roleLabelMap[professionalRole]}
                </dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Titulo profissional
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">{professionalTitle}</dd>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  ID da conta
                </dt>
                <dd className="mt-2 break-all text-sm font-medium text-foreground">{user.id}</dd>
              </div>
            </dl>
          </FqCard>

          <FqCard
            title="Credenciais"
            subtitle="Resumo rapido do perfil profissional associado ao login."
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Registro
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {license || "Nenhum registro profissional informado nesta sessao."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Especialidades
                </p>
                {specialties.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhuma especialidade cadastrada na sessao atual.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-4">
                <p className="text-sm font-medium text-foreground">
                  A pagina de perfil profissional agora respeita o seu papel autenticado.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Se precisarmos expandir para edicao completa de conta, o melhor ponto de partida
                  agora ja esta separado do perfil de aluno.
                </p>
              </div>
            </div>
          </FqCard>
        </div>
      </div>
    </FqPage>
  );
}
