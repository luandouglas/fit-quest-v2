import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";

import { appRoutePaths } from "@/app/router/routes/pathnames";
import { SignUpFlowHeader } from "@/features/auth/components/signup/SignUpFlowHeader";
import { SignUpRoleSelection } from "@/features/auth/components/signup/SignUpRoleSelection";
import { SignUpStepContent } from "@/features/auth/components/signup/SignUpStepContent";
import {
  defaultStudentAnswers,
  getCurrentStepState,
  getEquipmentLabel,
  getFlowSteps,
  isAuthUserRole,
  isEmailValid,
  mapStudentGoalToProfileGoal,
  type StudentAnswers,
} from "@/features/auth/components/signup/signUpFlow";
import { useAuth } from "@/shared/hooks";
import { profileService } from "@/shared/services/profileService";
import { relationshipService } from "@/shared/services/relationshipService";
import { FqButton, FqIcon, FqText } from "@/shared/ui/primitives";
import type { AuthUserRole } from "@/shared/types";

export function SignUpPage() {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const inviteCode = params.get("invite")?.trim() ?? "";
  const forcedRoleParam = params.get("role")?.trim().toUpperCase() ?? "";
  const forcedRole = isAuthUserRole(forcedRoleParam) ? forcedRoleParam : null;
  const roleLocked = Boolean(inviteCode || forcedRole);
  const [selectedRole, setSelectedRole] = useState<AuthUserRole | null>(
    inviteCode ? "STUDENT" : forcedRole,
  );
  const [hasConfirmedRole, setHasConfirmedRole] = useState(roleLocked);
  const [currentStep, setCurrentStep] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>(
    defaultStudentAnswers,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, clearError, error, status } = useAuth();

  const activeRole = selectedRole ?? "STUDENT";
  const steps = getFlowSteps(activeRole);
  const currentStepMeta = steps[currentStep];
  const currentStepState = useMemo(
    () =>
      getCurrentStepState({
        hasConfirmedRole,
        selectedRole,
        activeRole,
        currentStepId: currentStepMeta?.id,
        name,
        email,
        password,
        confirmPassword,
        studentAnswers,
      }),
    [
      activeRole,
      confirmPassword,
      currentStepMeta,
      email,
      hasConfirmedRole,
      name,
      password,
      selectedRole,
      studentAnswers,
    ],
  );
  const isLastStep = hasConfirmedRole && currentStep === steps.length - 1;
  const isBusy = status === "loading";

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!hasConfirmedRole) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep((currentValue) => Math.min(currentValue, steps.length - 1));
  }, [hasConfirmedRole, steps.length]);

  async function persistStudentSetup() {
    if (activeRole !== "STUDENT") {
      return;
    }

    try {
      await profileService.updateProfile({
        name: name.trim(),
        goal: mapStudentGoalToProfileGoal(studentAnswers.goals[0]),
        gym: studentAnswers.equipment
          ? getEquipmentLabel(studentAnswers.equipment)
          : undefined,
        goals: studentAnswers.workoutsPerWeek
          ? {
              workoutsPerWeek: Number(studentAnswers.workoutsPerWeek),
            }
          : undefined,
      });
    } catch {
      // Non-blocking: account creation should succeed even if onboarding persistence fails.
    }
  }

  async function handleSignUp() {
    if (!currentStepState.valid || !selectedRole) {
      return;
    }

    try {
      await register({
        name: name.trim(),
        role: inviteCode ? "STUDENT" : selectedRole,
        email: email.trim(),
        password: password.trim(),
      });

      await persistStudentSetup();

      if (inviteCode) {
        await relationshipService.acceptInviteByCodeOrId({
          codeOrId: inviteCode,
        });
        history.replace("/tabs/student/profile");
      }
    } catch {
      // AuthProvider already stores the error state.
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();

    if (!hasConfirmedRole) {
      if (selectedRole) {
        setHasConfirmedRole(true);
        setCurrentStep(0);
      }
      return;
    }

    if (!currentStepState.valid) {
      return;
    }

    if (isLastStep) {
      void handleSignUp();
      return;
    }

    setCurrentStep((currentValue) => currentValue + 1);
  }

  function handleBack() {
    clearError();

    if (!hasConfirmedRole) {
      history.push(appRoutePaths.login);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((currentValue) => currentValue - 1);
      return;
    }

    if (!roleLocked) {
      setHasConfirmedRole(false);
      return;
    }

    history.push(appRoutePaths.login);
  }

  return (
    <div className="flex min-h-dvh overflow-y-auto overscroll-y-contain bg-background px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-deep sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
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
                  Cadastro rapido
                </FqText>
              </div>
            </div>

            <Link
              to={appRoutePaths.login}
              className="text-sm font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </div>

          <div className="mt-6 space-y-6">
            {hasConfirmedRole && currentStepMeta ? (
              <SignUpFlowHeader
                role={activeRole}
                currentStep={currentStep}
                totalSteps={steps.length}
                title={currentStepMeta.title}
                hint={currentStepMeta.hint}
                onBack={handleBack}
              />
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <section className="rounded-2xl border border-border/80 bg-background/70 p-5 sm:p-6">
                {!hasConfirmedRole ? (
                  <SignUpRoleSelection
                    selectedRole={selectedRole}
                    roleLocked={roleLocked}
                    inviteCode={inviteCode}
                    forcedRole={forcedRole}
                    onSelectRole={setSelectedRole}
                  />
                ) : (
                  <SignUpStepContent
                    role={activeRole}
                    currentStepId={currentStepMeta?.id}
                    studentAnswers={studentAnswers}
                    setStudentAnswers={setStudentAnswers}
                    name={name}
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    showPassword={showPassword}
                    onNameChange={setName}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onConfirmPasswordChange={setConfirmPassword}
                    onToggleShowPassword={() =>
                      setShowPassword((currentValue) => !currentValue)
                    }
                    isEmailValid={isEmailValid}
                  />
                )}
              </section>

              {currentStepState.message ? (
                <div className="rounded-2xl border border-warning/25 bg-warning/10 p-4">
                  <FqText
                    as="p"
                    className="text-sm font-medium text-foreground"
                  >
                    {currentStepState.message}
                  </FqText>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                  <FqText
                    as="p"
                    className="text-sm font-medium text-destructive"
                  >
                    {error}
                  </FqText>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <FqButton
                  type="submit"
                  tone="primary"
                  size="lg"
                  isLoading={isBusy}
                  isDisabled={!currentStepState.valid || isBusy}
                  className="w-full min-w-55 text-sm sm:w-auto"
                >
                  {!hasConfirmedRole
                    ? "Continuar cadastro"
                    : isLastStep
                      ? inviteCode
                        ? "Criar conta e vincular"
                        : "Criar conta"
                      : "Continuar"}
                </FqButton>
              </div>

              {hasConfirmedRole && !roleLocked ? (
                <div className="sm:hidden">
                  <FqButton
                    type="button"
                    variant="ghost"
                    tone="neutral"
                    onClick={handleBack}
                    className="w-full"
                  >
                    Voltar
                  </FqButton>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
