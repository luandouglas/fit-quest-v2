import type { ProfileGoal } from "@/shared/services/contracts/profile";
import type { IconName } from "@/shared/ui/primitives";
import type { AuthUserRole } from "@/shared/types";

export const MIN_PASSWORD_LENGTH = 6;
export const STUDENT_MAX_GOALS = 3;
export const STUDENT_MAX_FOCUS_AREAS = 3;

export type FlowStep = {
  id: string;
  label: string;
  title: string;
  hint: string;
};

export type StepState = {
  valid: boolean;
  message?: string;
};

export type RoleOption = {
  value: AuthUserRole;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconName;
};

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
  icon?: IconName;
};

export type StudentAnswers = {
  goals: string[];
  motivation: string;
  focusAreas: string[];
  fitnessLevel: string;
  activityLevel: string;
  gender: string;
  healthFlags: string[];
  equipment: string;
  workoutsPerWeek: string;
  trainingDays: string[];
};

export const roleOptions: RoleOption[] = [
  {
    value: "STUDENT",
    label: "Aluno",
    shortLabel: "Aluno",
    description: "Treinos, progresso e rotina em um fluxo guiado.",
    icon: "dumbbell",
  },
  {
    value: "PERSONAL",
    label: "Personal Trainer",
    shortLabel: "Personal",
    description: "Alunos, treinos e acompanhamento desde o primeiro acesso.",
    icon: "activity",
  },
  {
    value: "NUTRITIONIST",
    label: "Nutricionista",
    shortLabel: "Nutricionista",
    description: "Dietas e acompanhamento com um cadastro mais direto.",
    icon: "utensils",
  },
];

export const studentFlowSteps: FlowStep[] = [
  {
    id: "goals",
    label: "Objetivos",
    title: "Qual e seu foco agora?",
    hint: "Escolha metas e sua principal motivacao.",
  },
  {
    id: "profile",
    label: "Perfil",
    title: "Como esta seu ritmo hoje?",
    hint: "Foco corporal, nivel e atividade do dia a dia.",
  },
  {
    id: "context",
    label: "Contexto",
    title: "Existe algo importante para considerar?",
    hint: "Perfil inicial, cuidados e estrutura disponivel.",
  },
  {
    id: "routine",
    label: "Rotina",
    title: "Como vai funcionar sua semana?",
    hint: "Defina frequencia e dias preferidos.",
  },
  {
    id: "account",
    label: "Conta",
    title: "Criar sua conta",
    hint: "Faltam so seus dados de acesso.",
  },
];

export const professionalFlowSteps: FlowStep[] = [
  {
    id: "identity",
    label: "Dados",
    title: "Seus dados basicos",
    hint: "Nome e e-mail para comecar.",
  },
  {
    id: "access",
    label: "Acesso",
    title: "Defina sua senha",
    hint: "Uma ultima etapa para entrar no FitQuest.",
  },
];

export const studentGoalOptions: ChoiceOption[] = [
  { value: "ganhar_massa", label: "Ganhar massa", icon: "dumbbell" },
  { value: "perder_gordura", label: "Perder gordura", icon: "flame" },
  { value: "condicionamento", label: "Condicionamento", icon: "activity" },
  { value: "mobilidade", label: "Mobilidade", icon: "heart" },
  { value: "consistencia", label: "Consistencia", icon: "calendar" },
  { value: "bem_estar", label: "Bem-estar", icon: "star" },
];

export const studentMotivationOptions: ChoiceOption[] = [
  {
    value: "resultado",
    label: "Evolucao e resultado",
    description: "Quero ver progresso com clareza.",
    icon: "trophy",
  },
  {
    value: "saude",
    label: "Saude e energia",
    description: "Quero me sentir melhor no dia a dia.",
    icon: "heart",
  },
  {
    value: "constancia",
    label: "Disciplina e rotina",
    description: "Meu foco e manter o habito.",
    icon: "calendar",
  },
  {
    value: "performance",
    label: "Performance",
    description: "Quero render melhor nos treinos e esportes.",
    icon: "activity",
  },
];

export const studentFocusAreaOptions: ChoiceOption[] = [
  { value: "corpo_todo", label: "Corpo todo" },
  { value: "costas", label: "Costas" },
  { value: "peito", label: "Peito" },
  { value: "pernas", label: "Pernas" },
  { value: "gluteos", label: "Gluteos" },
  { value: "ombros", label: "Ombros" },
  { value: "bracos", label: "Bracos" },
  { value: "abdomen", label: "Core" },
];

export const studentFitnessLevelOptions: ChoiceOption[] = [
  { value: "iniciante", label: "Iniciante", icon: "play" },
  { value: "basico", label: "Basico", icon: "target" },
  { value: "intermediario", label: "Intermediario", icon: "activity" },
  { value: "avancado", label: "Avancado", icon: "star" },
];

export const studentActivityLevelOptions: ChoiceOption[] = [
  { value: "sedentario", label: "Mais sedentario", icon: "clock" },
  { value: "leve", label: "Levemente ativo", icon: "mapPin" },
  { value: "moderado", label: "Moderadamente ativo", icon: "activity" },
  { value: "alto", label: "Bem ativo", icon: "flame" },
];

export const studentGenderOptions: ChoiceOption[] = [
  { value: "mulher", label: "Mulher", icon: "user" },
  { value: "homem", label: "Homem", icon: "user" },
  { value: "nao_binario", label: "Nao binario", icon: "users" },
  { value: "prefiro_nao_informar", label: "Prefiro nao informar", icon: "info" },
];

export const studentHealthOptions: ChoiceOption[] = [
  { value: "nenhuma", label: "Nenhuma observacao" },
  { value: "coluna", label: "Coluna ou lombar" },
  { value: "joelhos", label: "Joelhos" },
  { value: "quadril", label: "Quadril" },
  { value: "ombros", label: "Ombros ou bracos" },
];

export const studentEquipmentOptions: ChoiceOption[] = [
  { value: "academia_completa", label: "Academia completa", icon: "dumbbell" },
  { value: "academia_basica", label: "Academia compacta", icon: "home" },
  { value: "halteres_basicos", label: "Casa com halteres", icon: "activity" },
  { value: "peso_corporal", label: "Peso corporal", icon: "user" },
];

export const workoutFrequencyOptions = Array.from({ length: 7 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}x por semana`,
}));

export const weekDayOptions: ChoiceOption[] = [
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sab" },
  { value: "dom", label: "Dom" },
];

export const defaultStudentAnswers: StudentAnswers = {
  goals: [],
  motivation: "",
  focusAreas: [],
  fitnessLevel: "",
  activityLevel: "",
  gender: "",
  healthFlags: [],
  equipment: "",
  workoutsPerWeek: "",
  trainingDays: [],
};

export const roleTones = {
  STUDENT: "primary",
  PERSONAL: "secondary",
  NUTRITIONIST: "success",
} as const;

type AccountStateArgs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type StepStateArgs = AccountStateArgs & {
  hasConfirmedRole: boolean;
  selectedRole: AuthUserRole | null;
  activeRole: AuthUserRole;
  currentStepId: string | undefined;
  studentAnswers: StudentAnswers;
};

export function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isAuthUserRole(value: string | null): value is AuthUserRole {
  return (
    value === "STUDENT" || value === "PERSONAL" || value === "NUTRITIONIST"
  );
}

export function getFlowSteps(role: AuthUserRole) {
  return role === "STUDENT" ? studentFlowSteps : professionalFlowSteps;
}

export function getRoleOption(role: AuthUserRole | null) {
  return role ? roleOptions.find((option) => option.value === role) ?? null : null;
}

export function getAccountState({
  name,
  email,
  password,
  confirmPassword,
}: AccountStateArgs): StepState {
  if (name.trim().length < 3) {
    return {
      valid: false,
      message: "Informe seu nome para continuar.",
    };
  }

  if (!isEmailValid(email.trim())) {
    return {
      valid: false,
      message: "Informe um e-mail valido.",
    };
  }

  if (password.trim().length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: "Use pelo menos 6 caracteres na senha.",
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      message: "As senhas precisam coincidir.",
    };
  }

  return { valid: true };
}

export function getCurrentStepState(args: StepStateArgs): StepState {
  const {
    hasConfirmedRole,
    selectedRole,
    activeRole,
    currentStepId,
    studentAnswers,
  } = args;
  const accountState = getAccountState(args);

  if (!hasConfirmedRole) {
    return {
      valid: Boolean(selectedRole),
      message: selectedRole ? undefined : "Escolha um perfil para continuar.",
    };
  }

  if (activeRole !== "STUDENT") {
    if (currentStepId === "identity") {
      if (args.name.trim().length < 3) {
        return {
          valid: false,
          message: "Informe seu nome para continuar.",
        };
      }

      if (!isEmailValid(args.email.trim())) {
        return {
          valid: false,
          message: "Informe um e-mail valido.",
        };
      }

      return { valid: true };
    }

    return accountState;
  }

  switch (currentStepId) {
    case "goals":
      return {
        valid:
          studentAnswers.goals.length > 0 &&
          studentAnswers.motivation.trim().length > 0,
        message:
          studentAnswers.goals.length === 0
            ? "Selecione pelo menos uma meta."
            : studentAnswers.motivation.trim().length === 0
              ? "Escolha sua principal motivacao."
              : undefined,
      };
    case "profile":
      return {
        valid:
          studentAnswers.focusAreas.length > 0 &&
          studentAnswers.fitnessLevel.trim().length > 0 &&
          studentAnswers.activityLevel.trim().length > 0,
        message:
          studentAnswers.focusAreas.length === 0
            ? "Selecione ao menos um foco corporal."
            : studentAnswers.fitnessLevel.trim().length === 0
              ? "Escolha seu nivel atual."
              : studentAnswers.activityLevel.trim().length === 0
                ? "Escolha seu nivel de atividade."
                : undefined,
      };
    case "context":
      return {
        valid:
          studentAnswers.gender.trim().length > 0 &&
          studentAnswers.equipment.trim().length > 0,
        message:
          studentAnswers.gender.trim().length === 0
            ? "Escolha uma opcao de perfil."
            : studentAnswers.equipment.trim().length === 0
              ? "Selecione sua estrutura de treino."
              : undefined,
      };
    case "routine": {
      const expectedDays = Number(studentAnswers.workoutsPerWeek);

      if (!studentAnswers.workoutsPerWeek) {
        return {
          valid: false,
          message: "Defina quantas vezes quer treinar por semana.",
        };
      }

      if (studentAnswers.trainingDays.length !== expectedDays) {
        return {
          valid: false,
          message: `Selecione ${expectedDays} dia${expectedDays > 1 ? "s" : ""}.`,
        };
      }

      return { valid: true };
    }
    case "account":
      return accountState;
    default:
      return { valid: true };
  }
}

export function toggleLimitedSelection(
  currentValues: string[],
  value: string,
  limit?: number,
) {
  if (currentValues.includes(value)) {
    return currentValues.filter((entry) => entry !== value);
  }

  if (limit && currentValues.length >= limit) {
    return currentValues;
  }

  return [...currentValues, value];
}

export function sortTrainingDays(values: string[]) {
  return [...values].sort(
    (left, right) =>
      weekDayOptions.findIndex((option) => option.value === left) -
      weekDayOptions.findIndex((option) => option.value === right),
  );
}

export function getEquipmentLabel(value: string) {
  return (
    studentEquipmentOptions.find((option) => option.value === value)?.label ?? value
  );
}

export function mapStudentGoalToProfileGoal(goal: string | undefined): ProfileGoal {
  if (goal === "ganhar_massa") {
    return "gain_muscle";
  }

  if (goal === "perder_gordura") {
    return "lose_weight";
  }

  if (goal === "condicionamento") {
    return "performance";
  }

  return "maintenance";
}
