import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { appRoutePaths } from "@/app/router/routes";
import { useAuth } from "@/shared/hooks";
import { FqButton, FqInput, FqText } from "@/shared/ui";

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { requestPasswordReset, clearError, error, status } = useAuth();

  const isDisabled = useMemo(
    () => !isEmailValid(email.trim()) || status === "loading",
    [email, status],
  );

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    clearError();

    try {
      await requestPasswordReset(email.trim());
      setSuccessMessage(
        "Enviamos um link de redefinicao de senha para o e-mail informado.",
      );
    } catch {
      setSuccessMessage("");
    }
  }

  return (
    <div className="flex min-h-dvh items-center overflow-y-auto bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-120 rounded-2xl border border-border/70 bg-card px-6 py-6 shadow-deep sm:px-8 sm:py-8">
        <div className="space-y-3">
          <FqText
            as="h1"
            className="fq-display text-screen-title leading-tight text-foreground"
          >
            Redefinir senha
          </FqText>
          <FqText className="text-body text-muted-foreground">
            Informe seu e-mail para receber o link de recuperacao via Firebase.
          </FqText>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FqInput
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            autoComplete="email"
            className="h-12 text-sm"
          />

          {successMessage ? (
            <div className="rounded-xl border border-success/30 bg-success/10 p-4">
              <FqText as="p" className="text-sm font-medium text-success">
                {successMessage}
              </FqText>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <FqText as="p" className="text-sm font-medium text-destructive">
                {error}
              </FqText>
            </div>
          ) : null}

          <div className="space-y-3 pt-2">
            <FqButton
              type="submit"
              tone="primary"
              size="lg"
              isLoading={status === "loading"}
              isDisabled={isDisabled}
              className="w-full text-sm"
            >
              Enviar link de recuperacao
            </FqButton>

            <p className="text-center text-sm text-muted-foreground">
              Lembrou a senha?{" "}
              <Link
                to={appRoutePaths.login}
                className="font-medium text-primary hover:underline"
              >
                Voltar para o login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
