import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { appRoutePaths } from "@/app/router/routes";
import { useAuth } from "@/shared/hooks";
import {
  FqButton,
  FqIcon,
  FqIconButton,
  FqInput,
  FqSelect,
  FqTag,
  FqText,
} from "@/shared/ui";
import type { AuthUserRole } from "@/shared/types";

const MIN_PASSWORD_LENGTH = 6;

const roleOptions = [
  { label: "Aluno", value: "STUDENT" },
  { label: "Personal", value: "PERSONAL" },
  { label: "Nutricionista", value: "NUTRITIONIST" },
];

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SignUpPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<AuthUserRole>("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, clearError, error, status } = useAuth();

  const passwordMismatch =
    confirmPassword.trim().length > 0 && password !== confirmPassword;

  const isDisabled = useMemo(() => {
    return (
      name.trim().length < 3 ||
      !isEmailValid(email.trim()) ||
      password.trim().length < MIN_PASSWORD_LENGTH ||
      password !== confirmPassword ||
      status === "loading"
    );
  }, [confirmPassword, email, name, password, status]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function handleSignUp() {
    if (isDisabled) return;

    try {
      await register({
        name: name.trim(),
        role,
        email: email.trim(),
        password: password.trim(),
      });
    } catch {
      // AuthProvider already stores the error state.
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    void handleSignUp();
  }

  return (
    <div className="h-svh overflow-y-auto overscroll-y-contain bg-background px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-6xl overflow-visible rounded-[32px] border border-border/70 bg-card shadow-[0_20px_60px_rgba(36,49,44,0.12)] lg:min-h-[calc(100dvh-2rem)] lg:overflow-hidden lg:grid-cols-[1fr_0.95fr]">
        <aside
          className="relative hidden border-r border-border/60 px-10 py-10 lg:flex lg:flex-col lg:justify-between"
          style={{
            backgroundImage:
              "linear-gradient(180deg, color-mix(in srgb, var(--primary) 10%, var(--card)), color-mix(in srgb, var(--background) 94%, transparent))",
          }}
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 text-primary">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-foreground text-background">
                <FqIcon name="star" size={18} className="text-star" />
              </span>

              <div className="space-y-0.5">
                <FqText as="p" className="fq-subtle-label">
                  FitQuest
                </FqText>
                <FqText
                  as="p"
                  className="text-sm font-semibold text-foreground"
                >
                  Simples para começar, forte para evoluir
                </FqText>
              </div>
            </div>

            <div className="max-w-[28rem] space-y-4">
              <FqTag tone="primary">Cadastro rápido</FqTag>

              <FqText
                as="h3"
                className="fq-display text-[42px] leading-[1] text-foreground"
              >
                Seu primeiro passo em uma rotina mais consistente.
              </FqText>

              <FqText className="max-w-[34ch] text-base leading-7 text-muted-foreground">
                Crie sua conta, escolha seu perfil e entre em uma experiência
                organizada, clara e pronta para acompanhar sua evolução.
              </FqText>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="fq-soft-block px-4 py-4">
              <FqText as="p" className="fq-subtle-label">
                Perfil definido
              </FqText>
              <FqText
                as="p"
                className="mt-2 text-sm font-semibold leading-6 text-foreground"
              >
                A experiência inicial já começa ajustada para aluno, personal ou
                nutricionista.
              </FqText>
            </div>

            <div className="fq-soft-block px-4 py-4">
              <FqText as="p" className="fq-subtle-label">
                Acesso direto
              </FqText>
              <FqText
                as="p"
                className="mt-2 text-sm font-semibold leading-6 text-foreground"
              >
                Cadastro enxuto, sem excesso de informação e com foco em começar
                rápido.
              </FqText>
            </div>
          </div>
        </aside>

        <main className="flex min-h-full items-start justify-center px-5 py-6 sm:px-8 sm:py-8 lg:items-center lg:px-12 lg:py-12">
          <div className="safe-bottom w-full max-w-[440px] space-y-6 pb-4 sm:space-y-8 sm:pb-0">
            <div className="flex items-center gap-3 text-primary lg:hidden">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-foreground text-background">
                <FqIcon name="star" size={18} className="text-star" />
              </span>

              <div className="space-y-0.5">
                <FqText as="p" className="fq-subtle-label">
                  FitQuest
                </FqText>
                <FqText
                  as="p"
                  className="text-sm font-semibold text-foreground"
                >
                  Simples para começar, forte para evoluir
                </FqText>
              </div>
            </div>

            <header className="space-y-3">
              <FqTag tone="secondary">Novo acesso</FqTag>

              <FqText
                as="h1"
                className="fq-display text-[clamp(2.2rem,4vw,3.2rem)] leading-[0.95] text-foreground"
              >
                Crie sua conta
              </FqText>

              <FqText className="text-base leading-7 text-muted-foreground">
                Escolha seu perfil e comece sua jornada no FitQuest de forma
                leve, rápida e organizada.
              </FqText>
            </header>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <FqInput
                label="Nome"
                placeholder="Seu nome completo"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                autoComplete="name"
                className="h-14 text-base"
                errorMessage={
                  name.trim().length > 0 && name.trim().length < 3
                    ? "Informe pelo menos 3 caracteres."
                    : undefined
                }
              />

              <FqSelect
                label="Perfil"
                value={role}
                onChange={(event) =>
                  setRole(event.currentTarget.value as AuthUserRole)
                }
                options={roleOptions}
                className="h-14 text-base"
                helperText="Isso define sua área inicial após o login."
              />

              <FqInput
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                autoComplete="email"
                className="h-14 text-base"
                errorMessage={
                  email.trim().length > 0 && !isEmailValid(email.trim())
                    ? "Informe um e-mail válido."
                    : undefined
                }
              />

              <div className="relative">
                <FqInput
                  type={showPassword ? "text" : "password"}
                  label="Senha"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  autoComplete="new-password"
                  className="h-14 pr-12 text-base"
                  errorMessage={
                    password.trim().length > 0 &&
                    password.trim().length < MIN_PASSWORD_LENGTH
                      ? "Use 6 ou mais caracteres."
                      : undefined
                  }
                />

                <FqIconButton
                  icon={showPassword ? "eyeOff" : "eye"}
                  label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() =>
                    setShowPassword((currentValue) => !currentValue)
                  }
                  className="absolute right-2 top-[40px] text-muted-foreground hover:bg-accent"
                />
              </div>

              <FqInput
                type={showPassword ? "text" : "password"}
                label="Confirmar senha"
                placeholder="********"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.currentTarget.value)
                }
                autoComplete="new-password"
                className="h-14 text-base"
                errorMessage={
                  passwordMismatch ? "As senhas não coincidem." : undefined
                }
              />

              {error ? (
                <div className="rounded-[calc(var(--radius)+4px)] border border-destructive/30 bg-destructive/8 p-4">
                  <FqText
                    as="p"
                    className="text-sm font-medium text-destructive"
                  >
                    {error}
                  </FqText>
                </div>
              ) : null}

              <div className="space-y-4 pt-2">
                <FqButton
                  type="submit"
                  tone="primary"
                  size="lg"
                  isLoading={status === "loading"}
                  isDisabled={isDisabled}
                  className="w-full text-base"
                >
                  Criar conta
                </FqButton>

                <p className="text-center text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <Link
                    to={appRoutePaths.login}
                    className="font-medium text-primary hover:underline"
                  >
                    Entrar
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
