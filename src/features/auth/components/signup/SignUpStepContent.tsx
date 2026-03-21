import type { Dispatch, ReactNode, SetStateAction } from "react";

import { FqSelect } from "@/shared/ui/form";
import { FqTag, FqText } from "@/shared/ui/primitives";
import type { AuthUserRole } from "@/shared/types";

import { SignUpChoiceChip, SignUpSelectionCard } from "./SignUpOptionControls";
import { SignUpIdentityFields } from "./SignUpIdentityFields";
import { SignUpPasswordFields } from "./SignUpPasswordFields";
import {
  MIN_PASSWORD_LENGTH,
  STUDENT_MAX_FOCUS_AREAS,
  STUDENT_MAX_GOALS,
  type StudentAnswers,
  sortTrainingDays,
  studentActivityLevelOptions,
  studentEquipmentOptions,
  studentFitnessLevelOptions,
  studentFocusAreaOptions,
  studentGenderOptions,
  studentGoalOptions,
  studentHealthOptions,
  studentMotivationOptions,
  toggleLimitedSelection,
  weekDayOptions,
  workoutFrequencyOptions,
} from "./signUpFlow";

function SectionBlock({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <FqText as="h2" className="text-card-title font-semibold text-foreground">
          {title}
        </FqText>
        {helper ? (
          <FqText className="text-sm leading-6 text-muted-foreground">
            {helper}
          </FqText>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SignUpStepContent({
  role,
  currentStepId,
  studentAnswers,
  setStudentAnswers,
  name,
  email,
  password,
  confirmPassword,
  showPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  isEmailValid,
}: {
  role: AuthUserRole;
  currentStepId: string | undefined;
  studentAnswers: StudentAnswers;
  setStudentAnswers: Dispatch<SetStateAction<StudentAnswers>>;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  isEmailValid: (value: string) => boolean;
}) {
  if (role !== "STUDENT") {
    if (currentStepId === "identity") {
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <FqText className="text-sm leading-6 text-muted-foreground">
              Cadastro rapido para liberar seu acesso inicial.
            </FqText>
          </div>
          <SignUpIdentityFields
            name={name}
            email={email}
            onNameChange={onNameChange}
            onEmailChange={onEmailChange}
            isEmailValid={isEmailValid}
          />
        </div>
      );
    }

    return (
      <SignUpPasswordFields
        password={password}
        confirmPassword={confirmPassword}
        showPassword={showPassword}
        onPasswordChange={onPasswordChange}
        onConfirmPasswordChange={onConfirmPasswordChange}
        onToggleShowPassword={onToggleShowPassword}
        minPasswordLength={MIN_PASSWORD_LENGTH}
      />
    );
  }

  switch (currentStepId) {
    case "goals":
      return (
        <div className="space-y-8">
          <SectionBlock
            title="Metas principais"
            helper={`Escolha ate ${STUDENT_MAX_GOALS}.`}
          >
            <div className="flex flex-wrap gap-3">
              {studentGoalOptions.map((option) => (
                <SignUpChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={studentAnswers.goals.includes(option.value)}
                  onClick={() =>
                    setStudentAnswers((currentValue) => ({
                      ...currentValue,
                      goals: toggleLimitedSelection(
                        currentValue.goals,
                        option.value,
                        STUDENT_MAX_GOALS,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Motivacao principal">
            <div className="grid gap-3 sm:grid-cols-2">
              {studentMotivationOptions.map((option) => (
                <SignUpSelectionCard
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  icon={option.icon}
                  selected={studentAnswers.motivation === option.value}
                  onClick={() =>
                    setStudentAnswers((currentValue) => ({
                      ...currentValue,
                      motivation: option.value,
                    }))
                  }
                />
              ))}
            </div>
          </SectionBlock>
        </div>
      );
    case "profile":
      return (
        <div className="space-y-8">
          <SectionBlock
            title="Foco corporal"
            helper={`Escolha ate ${STUDENT_MAX_FOCUS_AREAS}.`}
          >
            <div className="flex flex-wrap gap-3">
              {studentFocusAreaOptions.map((option) => (
                <SignUpChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={studentAnswers.focusAreas.includes(option.value)}
                  onClick={() =>
                    setStudentAnswers((currentValue) => {
                      const alreadySelected = currentValue.focusAreas.includes(
                        option.value,
                      );

                      if (option.value === "corpo_todo") {
                        return {
                          ...currentValue,
                          focusAreas: alreadySelected ? [] : ["corpo_todo"],
                        };
                      }

                      const withoutFullBody = currentValue.focusAreas.filter(
                        (entry) => entry !== "corpo_todo",
                      );

                      return {
                        ...currentValue,
                        focusAreas: alreadySelected
                          ? withoutFullBody.filter((entry) => entry !== option.value)
                          : toggleLimitedSelection(
                              withoutFullBody,
                              option.value,
                              STUDENT_MAX_FOCUS_AREAS,
                            ),
                      };
                    })
                  }
                />
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Nivel atual">
            <div className="grid gap-3 sm:grid-cols-2">
              {studentFitnessLevelOptions.map((option) => (
                <SignUpSelectionCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={studentAnswers.fitnessLevel === option.value}
                  onClick={() =>
                    setStudentAnswers((currentValue) => ({
                      ...currentValue,
                      fitnessLevel: option.value,
                    }))
                  }
                />
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Nivel de atividade">
            <div className="grid gap-3 sm:grid-cols-2">
              {studentActivityLevelOptions.map((option) => (
                <SignUpSelectionCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={studentAnswers.activityLevel === option.value}
                  onClick={() =>
                    setStudentAnswers((currentValue) => ({
                      ...currentValue,
                      activityLevel: option.value,
                    }))
                  }
                />
              ))}
            </div>
          </SectionBlock>
        </div>
      );
    case "context":
      return (
        <div className="space-y-8">
          <SectionBlock title="Perfil">
            <div className="grid gap-3 sm:grid-cols-2">
              {studentGenderOptions.map((option) => (
                <SignUpSelectionCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={studentAnswers.gender === option.value}
                  onClick={() =>
                    setStudentAnswers((currentValue) => ({
                      ...currentValue,
                      gender: option.value,
                    }))
                  }
                />
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Cuidados importantes" helper="Opcional.">
            <div className="flex flex-wrap gap-3">
              {studentHealthOptions.map((option) => (
                <SignUpChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={studentAnswers.healthFlags.includes(option.value)}
                  onClick={() =>
                    setStudentAnswers((currentValue) => {
                      const alreadySelected = currentValue.healthFlags.includes(
                        option.value,
                      );

                      if (option.value === "nenhuma") {
                        return {
                          ...currentValue,
                          healthFlags: alreadySelected ? [] : ["nenhuma"],
                        };
                      }

                      const cleanedValues = currentValue.healthFlags.filter(
                        (entry) => entry !== "nenhuma",
                      );

                      return {
                        ...currentValue,
                        healthFlags: alreadySelected
                          ? cleanedValues.filter((entry) => entry !== option.value)
                          : [...cleanedValues, option.value],
                      };
                    })
                  }
                />
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Estrutura de treino">
            <div className="grid gap-3 sm:grid-cols-2">
              {studentEquipmentOptions.map((option) => (
                <SignUpSelectionCard
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={studentAnswers.equipment === option.value}
                  onClick={() =>
                    setStudentAnswers((currentValue) => ({
                      ...currentValue,
                      equipment: option.value,
                    }))
                  }
                />
              ))}
            </div>
          </SectionBlock>
        </div>
      );
    case "routine":
      return (
        <div className="space-y-8">
          <SectionBlock title="Frequencia semanal">
            <FqSelect
              label="Quantas vezes por semana?"
              value={studentAnswers.workoutsPerWeek}
              onChange={(event) => {
                const nextWorkoutsPerWeek = event.currentTarget.value;

                setStudentAnswers((currentValue) => ({
                  ...currentValue,
                  workoutsPerWeek: nextWorkoutsPerWeek,
                  trainingDays:
                    currentValue.trainingDays.length <=
                    Number(nextWorkoutsPerWeek || 0)
                      ? currentValue.trainingDays
                      : currentValue.trainingDays.slice(
                          0,
                          Number(nextWorkoutsPerWeek || 0),
                        ),
                }));
              }}
              options={workoutFrequencyOptions}
              placeholder="Selecione"
              className="h-12 text-sm"
            />
          </SectionBlock>

          <SectionBlock
            title="Dias da semana"
            helper="Selecione a mesma quantidade definida acima."
          >
            <div className="flex flex-wrap gap-3">
              {weekDayOptions.map((option) => (
                <SignUpChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={studentAnswers.trainingDays.includes(option.value)}
                  onClick={() =>
                    setStudentAnswers((currentValue) => {
                      const maxDays = Number(currentValue.workoutsPerWeek || 0);
                      const alreadySelected = currentValue.trainingDays.includes(
                        option.value,
                      );

                      if (alreadySelected) {
                        return {
                          ...currentValue,
                          trainingDays: currentValue.trainingDays.filter(
                            (entry) => entry !== option.value,
                          ),
                        };
                      }

                      if (!maxDays || currentValue.trainingDays.length >= maxDays) {
                        return currentValue;
                      }

                      return {
                        ...currentValue,
                        trainingDays: sortTrainingDays([
                          ...currentValue.trainingDays,
                          option.value,
                        ]),
                      };
                    })
                  }
                />
              ))}
            </div>

            {studentAnswers.workoutsPerWeek ? (
              <FqTag tone="neutral">
                {studentAnswers.trainingDays.length}/{studentAnswers.workoutsPerWeek} dia(s)
              </FqTag>
            ) : null}
          </SectionBlock>
        </div>
      );
    case "account":
      return (
        <div className="space-y-6">
          <SignUpIdentityFields
            name={name}
            email={email}
            onNameChange={onNameChange}
            onEmailChange={onEmailChange}
            isEmailValid={isEmailValid}
          />
          <SignUpPasswordFields
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            onPasswordChange={onPasswordChange}
            onConfirmPasswordChange={onConfirmPasswordChange}
            onToggleShowPassword={onToggleShowPassword}
            minPasswordLength={MIN_PASSWORD_LENGTH}
          />
        </div>
      );
    default:
      return null;
  }
}
