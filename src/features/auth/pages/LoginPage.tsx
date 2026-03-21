import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import loginHero from "@/features/auth/assets/login-hero.svg";
import { appRoutePaths } from "@/app/router/routes";
import { useAuth } from "@/shared/hooks";
import { FqButton, FqIcon, FqIconButton, FqInput } from "@/shared/ui";

const MIN_PASSWORD_LENGTH = 6;
const heroFeatures = [
  {
    icon: "dumbbell" as const,
    title: "Treino guiado",
    description: "Sessao do dia, aquecimento e execucao no mesmo fluxo.",
  },
  {
    icon: "flask" as const,
    title: "Hidratacao leve",
    description: "Agua, refeicoes e micro-habitos com registro rapido.",
  },
  {
    icon: "chart" as const,
    title: "Progresso visivel",
    description: "Metas, consistencia e evolucao com leitura simples.",
  },
] as const;

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, clearError, error, status } = useAuth();

  const emailIsValid = useMemo(() => isEmailValid(email.trim()), [email]);
  const passwordIsValid = useMemo(
    () => password.trim().length >= MIN_PASSWORD_LENGTH,
    [password],
  );
  const isDisabled = !emailIsValid || !passwordIsValid || status === "loading";

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
    <div className="fq-login-bg min-h-dvh relative isolate flex flex-col items-stretch justify-start md:items-center md:justify-center md:overflow-hidden md:p-3">
      {/* Desktop-only decorative blurs */}
      <span className="pointer-events-none absolute -left-16 -top-16 hidden size-48 rounded-full bg-white/45 blur-3xl sm:size-72 lg:block" />
      <span className="pointer-events-none absolute -bottom-28 -right-20 hidden size-52 rounded-full bg-primary/20 blur-3xl sm:size-80 lg:block" />

      <div className="fq-login-card fq-login-layout relative z-10 mx-auto grid w-full max-w-[78rem] md:overflow-hidden border border-white/70 backdrop-blur-xl lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:bg-white/80">
        {/* ─── Aside: logo + hero (mobile) / full panel (desktop) ─── */}
        <aside className="fq-login-aside relative flex flex-col gap-4 overflow-hidden bg-transparent px-6 py-7 sm:px-8 sm:py-8 lg:fq-login-bg lg:min-h-[42rem] lg:gap-8 lg:px-10 lg:py-10">
          {/* Desktop-only glow accents */}
          <span className="pointer-events-none absolute -right-12 top-12 hidden size-40 rounded-full bg-white/60 blur-3xl lg:block" />
          <span className="pointer-events-none absolute -left-8 bottom-10 hidden size-28 rounded-full bg-secondary/20 blur-3xl lg:block" />

          {/* Logo */}
          <div className="relative z-10 space-y-3">
            <div className="fq-login-logo-pill inline-flex items-center rounded-full border border-white/80 bg-white/75 px-4 py-2 backdrop-blur">
              <span className="text-display font-black tracking-tighter text-foreground">
                fit<span className="text-primary">quest.</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground lg:hidden">
              Seu treino, sua hidratacao e sua rotina em uma entrada mais leve.
            </p>
          </div>

          {/* Desktop-only headline block */}
          <div className="relative z-10 hidden space-y-6 lg:block">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="fq-login-title max-w-lg text-screen-title font-black leading-none tracking-tight text-foreground sm:text-display">
                  Seu treino entra em uma rotina mais leve e bonita.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-description">
                  Inspiramos a entrada com um visual wellness, mais proximo do
                  mock que voce enviou: menta suave, blocos arredondados,
                  ilustracao fitness e foco no que importa logo no primeiro
                  acesso.
                </p>
              </div>
            </div>
          </div>

          {/* Hero illustration card */}
          <div className="fq-login-hero-wrap relative z-10 mx-auto flex w-full max-w-96 items-center justify-center sm:max-w-120 lg:flex-1">
            <div className="fq-login-hero-card relative w-full border border-white/80 bg-white p-4 lg:bg-white/70 lg:backdrop-blur sm:p-7">
              {/* Desktop-only inner glows */}
              <span className="pointer-events-none absolute left-6 top-6 hidden size-16 rounded-full bg-primary/15 blur-2xl lg:block" />
              <span className="pointer-events-none absolute bottom-8 right-6 hidden size-20 rounded-full bg-secondary/15 blur-2xl lg:block" />
              <img
                src={loginHero}
                alt="Ilustracao fitness de uma pessoa treinando com equipamentos"
                className="relative z-10 mx-auto w-full max-w-100"
                width="400"
                height="300"
              />
              <div className="fq-login-focus-bar hidden md:flex relative z-10 mt-4 items-center justify-between border border-border/70 bg-white/90 px-4 py-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-caps text-primary">
                    Dica de hoje
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    <span className="lg:hidden">
                      Seu plano de hoje te espera.
                    </span>
                    <span className="hidden lg:inline">
                      Seu plano de treino, hidratacao e habitos saudaveis te
                      esperam logo ali, com uma tela mais leve e clara para voce
                      entrar na rotina com foco e menos ruido.
                    </span>
                  </p>
                </div>
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FqIcon name="check" size={18} />
                </span>
              </div>
            </div>
          </div>

          {/* Desktop-only feature cards */}
          <div className="fq-login-features relative z-10 hidden gap-3 lg:grid lg:grid-cols-3">
            {heroFeatures.map((feature) => (
              <div
                key={feature.title}
                className="fq-login-feature-card border border-white/85 bg-white/70 px-4 py-4 backdrop-blur"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FqIcon name={feature.icon} size={18} />
                </span>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {feature.title}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Main: form (seamless on mobile, card on desktop) ─── */}
        <main className="fq-login-main flex items-center justify-center bg-transparent px-6 py-7 sm:px-8 sm:py-8 lg:bg-white/50 lg:px-10 lg:py-10">
          <div className="safe-top rounded-lg safe-bottom w-full max-w-md lg:my-auto lg:fq-login-form-card lg:border lg:border-border/70 lg:bg-white lg:px-5 lg:py-6 xl:px-8 xl:py-8">
            <header className="mb-6 py-2  space-y-4 sm:mb-8">
              <div className="hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-2xs font-semibold uppercase tracking-caps-wide text-primary lg:inline-flex">
                <FqIcon name="star" size={14} />
                Login
              </div>
              <div className="space-y-3">
                <h2 className="fq-login-form-title text-screen-title font-black leading-none tracking-tight text-foreground">
                  <span className="lg:hidden text-2xl">Login</span>
                  <span className="hidden lg:inline">Entre na sua rotina.</span>
                </h2>
                <p className="hidden text-sm leading-7 text-muted-foreground lg:block">
                  Vamos continuar de onde voce parou, com uma tela mais leve,
                  mais clara e com a paleta menta inspirada na referencia.
                </p>
              </div>
            </header>

            {/* Desktop-only tip card */}
            <div className="fq-login-tip-card mb-6 hidden border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-foreground lg:block">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FqIcon name="heart" size={16} />
                </span>
                <div>
                  <p className="font-semibold">Consistencia acima de pressa</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Seus treinos, metas e habitos continuam organizados no mesmo
                    lugar.
                  </p>
                </div>
              </div>
            </div>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <FqInput
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                autoComplete="email"
                leftIcon="mail"
                rightIcon={
                  email.length > 0 && emailIsValid ? "check" : undefined
                }
                className="fq-login-input h-14 rounded-2xl border border-input/80 bg-white/95 text-description placeholder:text-muted-foreground/70"
              />

              <div className="relative">
                <FqInput
                  type={showPassword ? "text" : "password"}
                  label="Senha"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  autoComplete="current-password"
                  leftIcon="lock"
                  className="fq-login-input h-14 rounded-2xl border border-input/80 bg-white/95 pr-14 text-description placeholder:text-muted-foreground/70"
                />
                <FqIconButton
                  icon={showPassword ? "eyeOff" : "eye"}
                  label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  size="sm"
                  tone="primary"
                  onClick={() =>
                    setShowPassword((currentValue) => !currentValue)
                  }
                  className="absolute right-3 top-10 rounded-xl text-muted-foreground hover:bg-primary/10"
                />
              </div>

              <div className="pt-1 text-right">
                <Link
                  to={appRoutePaths.resetPassword}
                  className="text-sm font-semibold text-primary transition hover:opacity-80 hover:underline"
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
                className="h-14 w-full rounded-2xl text-sm font-semibold tracking-tight"
              >
                Entrar
              </FqButton>

              {error ? (
                <div className="fq-login-error border border-destructive/25 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                </div>
              ) : null}

              <p className="py-4 text-center text-sm text-muted-foreground sm:pt-2">
                Nao tem conta?{" "}
                <Link
                  to={appRoutePaths.signup}
                  className="font-semibold text-primary transition hover:opacity-80 hover:underline"
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
