import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { appRoutePaths } from "@/app/router/routes";
import { useAuth } from "@/shared/hooks";
import {
  FqButton,
  FqIcon,
  FqIconButton,
  FqInput,
  FqTag,
  FqText,
} from "@/shared/ui";

const MIN_PASSWORD_LENGTH = 6;

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, clearError, error, status } = useAuth();

  const isDisabled = useMemo(() => {
    return (
      !isEmailValid(email.trim()) ||
      password.trim().length < MIN_PASSWORD_LENGTH ||
      status === "loading"
    );
  }, [email, password, status]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function handleLogin() {
    if (isDisabled) {
      return;
    }

    try {
      await login({
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
    void handleLogin();
  }

  return (
    <div className="h-full overflow-y-auto overscroll-y-contain bg-background px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid max-w-6xl overflow-visible rounded-[38px] border border-border/80 bg-card/76 shadow-[0_28px_70px_rgba(36,49,44,0.14)] backdrop-blur lg:min-h-[calc(100dvh-4rem-var(--sat,0px))] lg:overflow-hidden lg:grid-cols-[1.02fr_0.98fr]">
        <aside
          className="relative hidden border-r border-border/70 px-10 py-10 lg:flex lg:flex-col lg:justify-between lg:gap-10 xl:gap-14"
          style={{
            backgroundImage:
              "linear-gradient(180deg, color-mix(in srgb, var(--primary) 14%, var(--card)), color-mix(in srgb, var(--background) 92%, transparent))",
          }}
        >
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 text-primary">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] bg-foreground text-background">
                <FqIcon name="star" size={18} className="text-star" />
              </span>
              <div>
                <FqText as="p" className="fq-subtle-label">
                  FitQuest
                </FqText>
                <FqText
                  as="p"
                  className="text-sm font-semibold text-foreground"
                >
                  Rotina clara, leve e consistente
                </FqText>
              </div>
            </div>

            <div className="space-y-4">
              <FqTag tone="primary">Experiencia tranquila</FqTag>
              <FqText
                as="h1"
                className="fq-display max-w-[11ch] text-4xl leading-[0.9] text-foreground"
              >
                Seu treino cabe em uma interface mais calma.
              </FqText>
              <FqText className="max-w-md text-base leading-relaxed text-muted-foreground">
                FitQuest organiza treino, nutricao, corrida e progresso em uma
                jornada simples, com menos ruido e mais foco no que realmente
                importa hoje.
              </FqText>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="fq-soft-block px-4 py-4">
              <FqText as="p" className="fq-subtle-label">
                Treino
              </FqText>
              <FqText
                as="p"
                className="mt-2 text-base font-semibold text-foreground"
              >
                Sessao do dia sempre visivel
              </FqText>
            </div>
            <div className="fq-soft-block px-4 py-4">
              <FqText as="p" className="fq-subtle-label">
                Nutricao
              </FqText>
              <FqText
                as="p"
                className="mt-2 text-base font-semibold text-foreground"
              >
                Registro rapido de refeicao e agua
              </FqText>
            </div>
            <div className="fq-soft-block px-4 py-4">
              <FqText as="p" className="fq-subtle-label">
                Progresso
              </FqText>
              <FqText
                as="p"
                className="mt-2 text-base font-semibold text-foreground"
              >
                Metas claras e recompensas sem excesso
              </FqText>
            </div>
          </div>
        </aside>

        <main className="flex items-start justify-center px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12">
          <div className="safe-bottom w-full max-w-[430px] pb-4 sm:pb-0">
            <div className="mb-6 flex items-center gap-3 text-primary sm:mb-8 lg:hidden">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] bg-foreground text-background">
                <FqIcon name="star" size={18} className="text-star" />
              </span>
              <div>
                <FqText as="p" className="fq-subtle-label">
                  FitQuest
                </FqText>
                <FqText
                  as="p"
                  className="text-sm font-semibold text-foreground"
                >
                  Rotina clara, leve e consistente
                </FqText>
              </div>
            </div>

            <header className="mb-6 space-y-3 sm:mb-8">
              <FqText
                as="h1"
                className="fq-display text-[clamp(2.4rem,4vw,3.2rem)] leading-[0.92] text-foreground"
              >
                Bem-vindo
              </FqText>
              <FqText className="text-base text-muted-foreground">
                Entre para continuar sua jornada com foco e menos distracoes.
              </FqText>
            </header>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <FqInput
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                autoComplete="email"
                className="h-14 text-base"
              />

              <div className="relative">
                <FqInput
                  type={showPassword ? "text" : "password"}
                  label="Senha"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  autoComplete="current-password"
                  className="h-14 pr-12 text-base"
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

              <div className="pt-1 text-right">
                <Link
                  to={appRoutePaths.resetPassword}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <FqButton
                type="submit"
                tone="primary"
                size="lg"
                isLoading={status === "loading"}
                isDisabled={isDisabled}
                className="w-full text-base"
              >
                Entrar
              </FqButton>

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

              <p className="pt-3 text-center text-sm text-muted-foreground sm:pt-5">
                Nao tem conta?{" "}
                <Link
                  to={appRoutePaths.signup}
                  className="font-medium text-primary hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
