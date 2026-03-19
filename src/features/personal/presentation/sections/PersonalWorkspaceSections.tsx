import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";

import {
  FqAlert,
  FqButton,
  FqCalendarHeatmap,
  FqCard,
  FqCheckbox,
  FqEmptyState,
  FqIcon,
  FqIconButton,
  FqInput,
  FqModal,
  FqProgressBar,
  FqProgressRing,
  FqSelect,
  FqText,
  FqTextarea,
  useToast,
} from "@/shared/ui";
import type {
  CreatePersonalStudentInput,
  PersonalAssignedWorkout,
  PersonalStudent,
  PersonalStudentAnamnesis,
  PersonalStudentWorkoutHistory,
  PersonalWorkoutIntensity,
  PersonalWorkoutWeekday,
} from "@/shared/services/contracts/personal";
import type { WorkoutSupportMedia } from "@/shared/services/contracts/workout";
import { PersonalWorkoutWizardCard } from "@/features/personal/components/PersonalWorkoutWizardCard";
import { usePersonalDashboard } from "../../hooks/usePersonalDashboard";

type PersonalTab =
  | "dashboard"
  | "students"
  | "workouts"
  | "metrics"
  | "messages";

type PersonalSection = PersonalTab;

const sectionToTab: Record<PersonalSection, PersonalTab> = {
  dashboard: "dashboard",
  students: "students",
  workouts: "workouts",
  metrics: "metrics",
  messages: "messages",
};

function resolvePersonalTab(section?: string): PersonalTab {
  if (!section) {
    return "dashboard";
  }

  if (section in sectionToTab) {
    return sectionToTab[section as PersonalSection];
  }

  return "dashboard";
}

type WorkoutCatalogFilter = "all" | "active" | "draft";
type WorkoutIntensityFilter = PersonalWorkoutIntensity | "all";
type StudentStatusFilter =
  | "all"
  | "with-active-workouts"
  | "without-active-workouts";
type StudentSortBy = "name" | "email" | "target" | "active";
type SortDirection = "asc" | "desc";
type StudentAnamnesisLifestyle = "sedentario" | "leve" | "moderado" | "ativo";
type StudentAnamnesisGoal =
  | "emagrecimento"
  | "hipertrofia"
  | "saude"
  | "condicionamento"
  | "reabilitacao";

type StudentAnamnesisForm = PersonalStudentAnamnesis;
type StudentRegistrationMode = "invite" | "direct" | "direct-with-anamnesis";
type StudentAnamnesisAvailabilityField =
  | "availabilitySeg"
  | "availabilityTer"
  | "availabilityQua"
  | "availabilityQui"
  | "availabilitySex"
  | "availabilitySab"
  | "availabilityDom";

const workoutFilterOptions: Array<{
  value: WorkoutCatalogFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "draft", label: "Rascunhos" },
];

const studentStatusFilterOptions: Array<{
  value: StudentStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "with-active-workouts", label: "Com treino ativo" },
  { value: "without-active-workouts", label: "Sem treino ativo" },
];

const studentSortOptions: Array<{
  value: StudentSortBy;
  label: string;
}> = [
  { value: "name", label: "Nome" },
  { value: "email", label: "Email" },
  { value: "target", label: "Meta semanal" },
  { value: "active", label: "Treinos ativos" },
];

const sortDirectionOptions: Array<{
  value: SortDirection;
  label: string;
}> = [
  { value: "asc", label: "Crescente" },
  { value: "desc", label: "Decrescente" },
];

const anamnesisSexOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
  { value: "prefiro-nao-informar", label: "Prefiro nao informar" },
];

const anamnesisYesNoOptions = [
  { value: "nao", label: "Nao" },
  { value: "sim", label: "Sim" },
];

const anamnesisLifestyleOptions: Array<{
  value: StudentAnamnesisLifestyle;
  label: string;
}> = [
  { value: "sedentario", label: "Sedentario" },
  { value: "leve", label: "Levemente ativo" },
  { value: "moderado", label: "Moderadamente ativo" },
  { value: "ativo", label: "Muito ativo" },
];

const anamnesisGoalOptions: Array<{
  value: StudentAnamnesisGoal;
  label: string;
}> = [
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "saude", label: "Saude e qualidade de vida" },
  { value: "condicionamento", label: "Condicionamento fisico" },
  { value: "reabilitacao", label: "Reabilitacao e retorno" },
];

const anamnesisAvailabilityFields: Array<{
  field: StudentAnamnesisAvailabilityField;
  label: string;
}> = [
  { field: "availabilitySeg", label: "Segunda" },
  { field: "availabilityTer", label: "Terca" },
  { field: "availabilityQua", label: "Quarta" },
  { field: "availabilityQui", label: "Quinta" },
  { field: "availabilitySex", label: "Sexta" },
  { field: "availabilitySab", label: "Sabado" },
  { field: "availabilityDom", label: "Domingo" },
];

function createInitialAnamnesisForm(student?: {
  name?: string;
  email?: string;
}): StudentAnamnesisForm {
  return {
    fullName: student?.name ?? "",
    sex: "prefiro-nao-informar",
    birthDate: "",
    email: student?.email ?? "",
    phone: "",
    occupation: "",
    weight: "",
    height: "",
    chronicDiseases: "",
    injuriesHistory: "",
    surgeriesHistory: "",
    familyHistory: "",
    medications: "",
    painHistory: "",
    smoker: "nao",
    alcoholUse: "nao",
    sleepQuality: "",
    lifestyleLevel: "sedentario",
    exerciseHistory: "",
    hasNutritionist: "nao",
    routineDiet: "",
    mainGoal: "saude",
    specificGoals: "",
    preferredActivity: "",
    preferredTrainingStyle: "",
    academyAccess: "sim",
    homeEquipment: "",
    availabilitySeg: false,
    availabilityTer: false,
    availabilityQua: false,
    availabilityQui: false,
    availabilitySex: false,
    availabilitySab: false,
    availabilityDom: false,
    availabilityFlexibility: "",
    photoConsent: "nao",
    responsibilityAccepted: false,
    signatureName: student?.name ?? "",
  };
}

function normalizeAvailabilityValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (!normalizedValue) {
      return false;
    }

    return !["nao", "não", "false", "0", "off"].includes(normalizedValue);
  }

  return Boolean(value);
}

function normalizeAnamnesisForm(
  anamnesis?: Partial<StudentAnamnesisForm> | null,
  student?: {
    name?: string;
    email?: string;
  },
): StudentAnamnesisForm {
  const baseForm = createInitialAnamnesisForm(student);

  if (!anamnesis) {
    return baseForm;
  }

  const mergedForm = {
    ...baseForm,
    ...anamnesis,
  };

  return {
    ...mergedForm,
    availabilitySeg: normalizeAvailabilityValue(mergedForm.availabilitySeg),
    availabilityTer: normalizeAvailabilityValue(mergedForm.availabilityTer),
    availabilityQua: normalizeAvailabilityValue(mergedForm.availabilityQua),
    availabilityQui: normalizeAvailabilityValue(mergedForm.availabilityQui),
    availabilitySex: normalizeAvailabilityValue(mergedForm.availabilitySex),
    availabilitySab: normalizeAvailabilityValue(mergedForm.availabilitySab),
    availabilityDom: normalizeAvailabilityValue(mergedForm.availabilityDom),
  };
}

function formatDateLabel(value?: string | null): string {
  if (!value) {
    return "Nao informado";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("pt-BR");
}

function formatDateTimeLabel(value?: string | null): string {
  if (!value) {
    return "Nao informado";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatOnboardingSourceLabel(
  source?: PersonalStudent["onboardingSource"],
): string {
  if (source === "invite") {
    return "Via link";
  }

  if (source === "direct") {
    return "Cadastro direto";
  }

  return "Nao iniciado";
}

function formatGoalLabel(goal?: StudentAnamnesisGoal | string): string {
  return (
    anamnesisGoalOptions.find((option) => option.value === goal)?.label ??
    "Nao informado"
  );
}

function formatLifestyleLabel(
  lifestyle?: StudentAnamnesisLifestyle | string,
): string {
  return (
    anamnesisLifestyleOptions.find((option) => option.value === lifestyle)
      ?.label ?? "Nao informado"
  );
}

function formatRequestStatusLabel(
  status: "open" | "accepted" | "done",
): string {
  if (status === "done") {
    return "Concluida";
  }

  if (status === "accepted") {
    return "Em andamento";
  }

  return "Aberta";
}

function parseDecimalValue(value?: string): number | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function calculateBodyMassIndex(
  weight?: string,
  height?: string,
): string | null {
  const parsedWeight = parseDecimalValue(weight);
  const parsedHeight = parseDecimalValue(height);

  if (!parsedWeight || !parsedHeight) {
    return null;
  }

  const heightInMeters = parsedHeight > 3 ? parsedHeight / 100 : parsedHeight;

  if (heightInMeters <= 0) {
    return null;
  }

  return (parsedWeight / (heightInMeters * heightInMeters)).toFixed(1);
}

function toLocalDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const workoutDurationRange = { min: 10, max: 240 };
const workoutStarsRange = { min: 50, max: 200 };
const workoutExercisesRange = { min: 1, max: 20 };

const weekdayOrder: PersonalWorkoutWeekday[] = [
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sab",
  "Dom",
];
const weekdayCompactLabelMap: Record<PersonalWorkoutWeekday, string> = {
  Seg: "S",
  Ter: "T",
  Qua: "Q",
  Qui: "Q",
  Sex: "S",
  Sab: "S",
  Dom: "D",
};
const weekdayLabelMap: Record<PersonalWorkoutWeekday, string> = {
  Seg: "Segunda",
  Ter: "Terca",
  Qua: "Quarta",
  Qui: "Quinta",
  Sex: "Sexta",
  Sab: "Sabado",
  Dom: "Domingo",
};

function WorkoutDaySectionHeader({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  const hasWorkouts = count > 0;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
        hasWorkouts
          ? "border-primary/15 bg-primary/[0.04]"
          : "border-dashed border-border/80 bg-muted/15"
      }`}
    >
      <div className="space-y-0.5">
        <FqText
          as="p"
          className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Dia da semana
        </FqText>
        <FqText as="h3" className="text-sm font-semibold text-foreground">
          {label}
        </FqText>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          hasWorkouts
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {hasWorkouts
          ? `${count} treino${count !== 1 ? "s" : ""}`
          : "Day off"}
      </span>
    </div>
  );
}

function WorkoutDayOffState({ label }: { label: string }) {
  return (
    <FqCard className="border-dashed border-border/80 bg-muted/10 shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Day off
          </FqText>
          <FqText as="p" className="text-sm text-muted-foreground">
            Nenhum treino programado para {label.toLowerCase()}.
          </FqText>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Off
        </span>
      </div>
    </FqCard>
  );
}

const workoutIntensityOptions: Array<{
  value: PersonalWorkoutIntensity;
  label: string;
}> = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediario" },
  { value: "avancado", label: "Avancado" },
];

const workoutMuscleGroupOptions = [
  { value: "peito", label: "Peito" },
  { value: "costas", label: "Costas" },
  { value: "ombros", label: "Ombros" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "pernas", label: "Pernas" },
  { value: "gluteos", label: "Gluteos" },
  { value: "abdomen", label: "Abdomen" },
  { value: "cardio", label: "Cardio" },
  { value: "fullbody", label: "Full Body" },
] as const;

type EditableWorkoutExercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restSec: number;
  suggestedLoadKg: number;
  muscleGroup?: string;
  equipment?: string;
  durationMin: number;
  supportMedia?: WorkoutSupportMedia | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseNumericInput(
  value: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(Math.round(parsed), min, max);
}

type PersonalWorkspaceSectionsProps = {
  forcedTab?: PersonalTab;
  forcedWorkoutId?: string | null;
};

export function PersonalWorkspaceSections({
  forcedTab,
  forcedWorkoutId,
}: PersonalWorkspaceSectionsProps) {
  const history = useHistory();
  const location = useLocation();
  const { section, workoutId, studentId: routeStudentIdParam, studentView } =
    useParams<{
    section?: string;
    workoutId?: string;
    studentId?: string;
    studentView?: string;
  }>();
  const { toast } = useToast();
  const {
    overview,
    uiState,
    error,
    refresh,
    createWorkout,
    updateWorkout,
    deactivateWorkout,
    sendMotivationalMessage,
    grantSpecialAchievement,
    updateMeasurementsRequestStatus,
    generateStudentInviteLink,
    createStudentAccount,
    saveStudentAnamnesis,
    getStudentAnamnesis,
    getStudentWorkoutHistory,
    isCreatingWorkout,
    isUpdatingWorkout,
    isDeactivatingWorkout,
    isSendingMotivationalMessage,
    isGrantingSpecialAchievement,
    isUpdatingMeasurementsRequestStatus,
    isGeneratingStudentInviteLink,
    isCreatingStudentAccount,
    isSavingStudentAnamnesis,
  } = usePersonalDashboard();

  const tab = forcedTab ?? resolvePersonalTab(section);
  const basePath = location.pathname.startsWith("/tabs/personal")
    ? "/tabs/personal"
    : "/personal";
  const selectedWorkoutId =
    tab === "workouts" ? (forcedWorkoutId ?? workoutId ?? null) : null;
  const selectedStudentRouteId =
    tab === "students" ? routeStudentIdParam ?? null : null;
  const selectedStudentRouteView =
    tab === "students" && selectedStudentRouteId
      ? studentView === "workouts" || studentView === "anamnesis"
        ? studentView
        : "overview"
      : null;
  const [isCreatingWorkoutFlow, setIsCreatingWorkoutFlow] = useState(false);
  const [prefilledStudentId, setPrefilledStudentId] = useState("");
  const [studentAnamnesisViewId, setStudentAnamnesisViewId] = useState<
    string | null
  >(null);
  const [anamnesisFormsByStudent, setAnamnesisFormsByStudent] = useState<
    Record<string, StudentAnamnesisForm>
  >({});
  const [currentAnamnesisForm, setCurrentAnamnesisForm] =
    useState<StudentAnamnesisForm>(createInitialAnamnesisForm());
  const [isStudentRegistrationModalOpen, setIsStudentRegistrationModalOpen] =
    useState(false);
  const [studentRegistrationMode, setStudentRegistrationMode] =
    useState<StudentRegistrationMode>("invite");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [studentWorkoutsViewId, setStudentWorkoutsViewId] = useState<string | null>(null);
  const [studentWorkoutSearch, setStudentWorkoutSearch] = useState("");
  const [workoutSearch, setWorkoutSearch] = useState("");
  const [workoutFilter, setWorkoutFilter] =
    useState<WorkoutCatalogFilter>("all");
  const [isWorkoutFiltersOpen, setIsWorkoutFiltersOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [workoutMuscleGroupFilters, setWorkoutMuscleGroupFilters] = useState<
    string[]
  >([]);
  const [workoutLevelFilter, setWorkoutLevelFilter] =
    useState<WorkoutIntensityFilter>("all");
  const [workoutMinDuration, setWorkoutMinDuration] = useState(
    workoutDurationRange.min,
  );
  const [workoutMaxDuration, setWorkoutMaxDuration] = useState(
    workoutDurationRange.max,
  );
  const [workoutMinStars, setWorkoutMinStars] = useState(
    workoutStarsRange.min,
  );
  const [workoutMaxStars, setWorkoutMaxStars] = useState(
    workoutStarsRange.max,
  );
  const [workoutMinExercises, setWorkoutMinExercises] = useState(
    workoutExercisesRange.min,
  );
  const [workoutMaxExercises, setWorkoutMaxExercises] = useState(
    workoutExercisesRange.max,
  );
  const [
    draftWorkoutMuscleGroupFilters,
    setDraftWorkoutMuscleGroupFilters,
  ] = useState<string[]>([]);
  const [draftWorkoutLevelFilter, setDraftWorkoutLevelFilter] =
    useState<WorkoutIntensityFilter>("all");
  const [draftWorkoutMinDuration, setDraftWorkoutMinDuration] = useState(
    workoutDurationRange.min,
  );
  const [draftWorkoutMaxDuration, setDraftWorkoutMaxDuration] = useState(
    workoutDurationRange.max,
  );
  const [draftWorkoutMinStars, setDraftWorkoutMinStars] = useState(
    workoutStarsRange.min,
  );
  const [draftWorkoutMaxStars, setDraftWorkoutMaxStars] = useState(
    workoutStarsRange.max,
  );
  const [draftWorkoutMinExercises, setDraftWorkoutMinExercises] = useState(
    workoutExercisesRange.min,
  );
  const [draftWorkoutMaxExercises, setDraftWorkoutMaxExercises] = useState(
    workoutExercisesRange.max,
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] =
    useState<StudentStatusFilter>("all");
  const [studentSortBy, setStudentSortBy] = useState<StudentSortBy>("name");
  const [studentSortDirection, setStudentSortDirection] =
    useState<SortDirection>("asc");
  const [studentInviteLink, setStudentInviteLink] = useState("");
  const [studentInviteCode, setStudentInviteCode] = useState("");
  const [editingStudentId, setEditingStudentId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [editingFrequencyWeekly, setEditingFrequencyWeekly] = useState("4");
  const [editingIntensity, setEditingIntensity] =
    useState<PersonalWorkoutIntensity>("intermediario");
  const [editingStarsReward, setEditingStarsReward] = useState("90");
  const [editingEstimatedDurationMin, setEditingEstimatedDurationMin] =
    useState("45");
  const [editingWeekdays, setEditingWeekdays] = useState<
    PersonalWorkoutWeekday[]
  >(["Seg", "Qua", "Sex"]);
  const [editingMuscleGroups, setEditingMuscleGroups] = useState<string[]>([]);
  const [editingExercises, setEditingExercises] = useState<
    EditableWorkoutExercise[]
  >([]);
  const [isEditingWorkoutDetails, setIsEditingWorkoutDetails] = useState(false);
  const [expandedStudentWorkoutIds, setExpandedStudentWorkoutIds] = useState<
    string[]
  >([]);
  const [draggingExerciseId, setDraggingExerciseId] = useState<string | null>(
    null,
  );
  const [dragOverExerciseId, setDragOverExerciseId] = useState<string | null>(
    null,
  );
  const [studentHistoryByStudent, setStudentHistoryByStudent] = useState<
    Record<string, PersonalStudentWorkoutHistory>
  >({});
  const [historySnapshot, setHistorySnapshot] =
    useState<PersonalStudentWorkoutHistory | null>(null);
  const [loadingStudentHistoryId, setLoadingStudentHistoryId] = useState<
    string | null
  >(null);
  const [loadingStudentAnamnesisId, setLoadingStudentAnamnesisId] = useState<
    string | null
  >(null);
  const [engagementStudentId, setEngagementStudentId] = useState("");
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [achievementTitle, setAchievementTitle] =
    useState("Conquista especial");
  const [achievementDescription, setAchievementDescription] = useState("");

  const studentOptions = useMemo(
    () =>
      (overview?.students ?? []).map((student) => ({
        value: student.id,
        label: student.name,
      })),
    [overview?.students],
  );

  const workoutStudentFilterOptions = useMemo(
    () => [
      { value: "all", label: "Todos os alunos" },
      ...studentOptions,
    ],
    [studentOptions],
  );

  const workoutStudentFilter = useMemo(() => {
    const studentId = new URLSearchParams(location.search).get("studentId");

    if (!studentId) {
      return "all";
    }

    if (!overview) {
      return studentId;
    }

    return overview.students.some((student) => student.id === studentId)
      ? studentId
      : "all";
  }, [location.search, overview]);

  const workoutStudentFilterLabel = useMemo(() => {
    if (workoutStudentFilter === "all") {
      return "Todos os alunos";
    }

    return (
      overview?.students.find((student) => student.id === workoutStudentFilter)
        ?.name ?? "Aluno selecionado"
    );
  }, [overview?.students, workoutStudentFilter]);

  const shouldOpenWorkoutCreateFlow = useMemo(
    () => new URLSearchParams(location.search).get("createWorkout") === "1",
    [location.search],
  );

  const routeStudentId = useMemo(
    () => new URLSearchParams(location.search).get("studentId") ?? "",
    [location.search],
  );

  const hasAdvancedWorkoutFilters = useMemo(
    () =>
      workoutMuscleGroupFilters.length > 0 ||
      workoutLevelFilter !== "all" ||
      workoutMinDuration !== workoutDurationRange.min ||
      workoutMaxDuration !== workoutDurationRange.max ||
      workoutMinStars !== workoutStarsRange.min ||
      workoutMaxStars !== workoutStarsRange.max ||
      workoutMinExercises !== workoutExercisesRange.min ||
      workoutMaxExercises !== workoutExercisesRange.max,
    [
      workoutLevelFilter,
      workoutMaxDuration,
      workoutMaxExercises,
      workoutMaxStars,
      workoutMinDuration,
      workoutMinExercises,
      workoutMinStars,
      workoutMuscleGroupFilters,
    ],
  );

  const workoutAdvancedFilterCount = useMemo(() => {
    let count = 0;

    if (workoutMuscleGroupFilters.length > 0) {
      count += 1;
    }

    if (workoutLevelFilter !== "all") {
      count += 1;
    }

    if (
      workoutMinDuration !== workoutDurationRange.min ||
      workoutMaxDuration !== workoutDurationRange.max
    ) {
      count += 1;
    }

    if (
      workoutMinStars !== workoutStarsRange.min ||
      workoutMaxStars !== workoutStarsRange.max
    ) {
      count += 1;
    }

    if (
      workoutMinExercises !== workoutExercisesRange.min ||
      workoutMaxExercises !== workoutExercisesRange.max
    ) {
      count += 1;
    }

    return count;
  }, [
    workoutLevelFilter,
    workoutMaxDuration,
    workoutMaxExercises,
    workoutMaxStars,
    workoutMinDuration,
    workoutMinExercises,
    workoutMinStars,
    workoutMuscleGroupFilters.length,
  ]);

  const matchesWorkoutAdvancedFilters = useCallback(
    (workout: PersonalAssignedWorkout) => {
      if (
        workoutMuscleGroupFilters.length > 0 &&
        !workoutMuscleGroupFilters.some((group) =>
          workout.muscleGroups?.includes(group),
        )
      ) {
        return false;
      }

      if (
        workoutLevelFilter !== "all" &&
        (workout.intensity ?? "intermediario") !== workoutLevelFilter
      ) {
        return false;
      }

      const duration = workout.estimatedDurationMin ?? 0;
      if (duration < workoutMinDuration || duration > workoutMaxDuration) {
        return false;
      }

      const stars = workout.starsReward ?? 0;
      if (stars < workoutMinStars || stars > workoutMaxStars) {
        return false;
      }

      const exercises = workout.exercisesCount ?? 0;
      if (exercises < workoutMinExercises || exercises > workoutMaxExercises) {
        return false;
      }

      return true;
    },
    [
      workoutLevelFilter,
      workoutMaxDuration,
      workoutMaxExercises,
      workoutMaxStars,
      workoutMinDuration,
      workoutMinExercises,
      workoutMinStars,
      workoutMuscleGroupFilters,
    ],
  );

  const filteredWorkouts = useMemo(() => {
    const workouts = overview?.workouts ?? [];
    const normalizedSearch = workoutSearch.trim().toLowerCase();

    return workouts
      .filter((workout) => {
        if (workoutStudentFilter === "all") {
          return true;
        }

        return workout.studentId === workoutStudentFilter;
      })
      .filter((workout) => {
        if (workoutFilter === "active") {
          return workout.isActive;
        }

        if (workoutFilter === "draft") {
          return workout.assignmentScope === "personal" || !workout.isActive;
        }

        return true;
      })
      .filter((workout) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = [
          workout.title,
          workout.description ?? "",
          workout.studentName,
          ...(workout.muscleGroups ?? []),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .filter(matchesWorkoutAdvancedFilters);
  }, [
    overview?.workouts,
    workoutFilter,
    matchesWorkoutAdvancedFilters,
    workoutSearch,
    workoutStudentFilter,
  ]);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = studentSearch.trim().toLowerCase();
    const students = [...(overview?.students ?? [])]
      .filter((student) => {
        if (studentStatusFilter === "with-active-workouts") {
          return student.activeWorkouts > 0;
        }

        if (studentStatusFilter === "without-active-workouts") {
          return student.activeWorkouts === 0;
        }

        return true;
      })
      .filter((student) => {
        if (!normalizedSearch) {
          return true;
        }

        return [student.name, student.email]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      });

    students.sort((left, right) => {
      const direction = studentSortDirection === "asc" ? 1 : -1;

      if (studentSortBy === "name") {
        return left.name.localeCompare(right.name, "pt-BR") * direction;
      }

      if (studentSortBy === "email") {
        return left.email.localeCompare(right.email, "pt-BR") * direction;
      }

      if (studentSortBy === "target") {
        return (
          (left.workoutsPerWeekTarget - right.workoutsPerWeekTarget) * direction
        );
      }

      return (left.activeWorkouts - right.activeWorkouts) * direction;
    });

    return students;
  }, [
    overview?.students,
    studentSearch,
    studentSortBy,
    studentSortDirection,
    studentStatusFilter,
  ]);

  function toggleStudentSort(nextSortBy: StudentSortBy) {
    setStudentSortBy((currentSortBy) => {
      if (currentSortBy === nextSortBy) {
        setStudentSortDirection((currentDirection) =>
          currentDirection === "asc" ? "desc" : "asc",
        );
        return currentSortBy;
      }

      setStudentSortDirection("asc");
      return nextSortBy;
    });
  }

  function toggleWorkoutMuscleGroupFilter(group: string) {
    setDraftWorkoutMuscleGroupFilters((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group],
    );
  }

  function resetWorkoutDraftFilters() {
    setDraftWorkoutMuscleGroupFilters([]);
    setDraftWorkoutLevelFilter("all");
    setDraftWorkoutMinDuration(workoutDurationRange.min);
    setDraftWorkoutMaxDuration(workoutDurationRange.max);
    setDraftWorkoutMinStars(workoutStarsRange.min);
    setDraftWorkoutMaxStars(workoutStarsRange.max);
    setDraftWorkoutMinExercises(workoutExercisesRange.min);
    setDraftWorkoutMaxExercises(workoutExercisesRange.max);
  }

  function applyWorkoutDraftFilters() {
    setWorkoutMuscleGroupFilters(draftWorkoutMuscleGroupFilters);
    setWorkoutLevelFilter(draftWorkoutLevelFilter);
    setWorkoutMinDuration(draftWorkoutMinDuration);
    setWorkoutMaxDuration(draftWorkoutMaxDuration);
    setWorkoutMinStars(draftWorkoutMinStars);
    setWorkoutMaxStars(draftWorkoutMaxStars);
    setWorkoutMinExercises(draftWorkoutMinExercises);
    setWorkoutMaxExercises(draftWorkoutMaxExercises);
    setIsWorkoutFiltersOpen(false);
  }

  function openWorkoutFiltersPanel() {
    setDraftWorkoutMuscleGroupFilters(workoutMuscleGroupFilters);
    setDraftWorkoutLevelFilter(workoutLevelFilter);
    setDraftWorkoutMinDuration(workoutMinDuration);
    setDraftWorkoutMaxDuration(workoutMaxDuration);
    setDraftWorkoutMinStars(workoutMinStars);
    setDraftWorkoutMaxStars(workoutMaxStars);
    setDraftWorkoutMinExercises(workoutMinExercises);
    setDraftWorkoutMaxExercises(workoutMaxExercises);
    setIsWorkoutFiltersOpen(true);
  }

  function resetWorkoutAdvancedFilters() {
    setWorkoutMuscleGroupFilters([]);
    setWorkoutLevelFilter("all");
    setWorkoutMinDuration(workoutDurationRange.min);
    setWorkoutMaxDuration(workoutDurationRange.max);
    setWorkoutMinStars(workoutStarsRange.min);
    setWorkoutMaxStars(workoutStarsRange.max);
    setWorkoutMinExercises(workoutExercisesRange.min);
    setWorkoutMaxExercises(workoutExercisesRange.max);
    resetWorkoutDraftFilters();
  }

  const selectedWorkout = useMemo(
    () =>
      (overview?.workouts ?? []).find(
        (workout) => workout.id === selectedWorkoutId,
      ) ?? null,
    [overview?.workouts, selectedWorkoutId],
  );

  const loadStudentAnamnesisIntoCache = useCallback(
    async (
      studentId: string,
      student?: {
        name?: string;
        email?: string;
      },
    ) => {
      try {
        setLoadingStudentAnamnesisId(studentId);
        const savedAnamnesis = await getStudentAnamnesis(studentId);

        if (!savedAnamnesis) {
          return null;
        }

        const normalizedAnamnesis = normalizeAnamnesisForm(
          savedAnamnesis,
          student,
        );

        setAnamnesisFormsByStudent((current) => ({
          ...current,
          [studentId]: normalizedAnamnesis,
        }));

        return normalizedAnamnesis;
      } finally {
        setLoadingStudentAnamnesisId((current) =>
          current === studentId ? null : current,
        );
      }
    },
    [getStudentAnamnesis],
  );

  const loadStudentHistoryIntoCache = useCallback(
    async (studentId: string) => {
      try {
        setLoadingStudentHistoryId(studentId);
        const history = await getStudentWorkoutHistory(studentId);

        setStudentHistoryByStudent((current) => ({
          ...current,
          [studentId]: history,
        }));

        return history;
      } finally {
        setLoadingStudentHistoryId((current) =>
          current === studentId ? null : current,
        );
      }
    },
    [getStudentWorkoutHistory],
  );

  useEffect(() => {
    if (!selectedWorkout || isEditingWorkoutDetails) {
      return;
    }

    setEditingStudentId(selectedWorkout.studentId);
    setEditingTitle(selectedWorkout.title);
    setEditingDescription(selectedWorkout.description ?? "");
    setEditingDate(selectedWorkout.date);
    setEditingFrequencyWeekly(String(selectedWorkout.frequencyWeekly));
    setEditingIntensity(selectedWorkout.intensity ?? "intermediario");
    setEditingStarsReward(String(selectedWorkout.starsReward ?? 90));
    setEditingEstimatedDurationMin(
      String(selectedWorkout.estimatedDurationMin ?? 45),
    );
    setEditingWeekdays(
      selectedWorkout.weekdays && selectedWorkout.weekdays.length > 0
        ? [...selectedWorkout.weekdays]
        : ["Seg", "Qua", "Sex"],
    );
    setEditingMuscleGroups(
      selectedWorkout.muscleGroups && selectedWorkout.muscleGroups.length > 0
        ? [...selectedWorkout.muscleGroups]
        : [],
    );
    setEditingExercises(normalizeWorkoutExercises(selectedWorkout));
  }, [isEditingWorkoutDetails, selectedWorkout]);

  useEffect(() => {
    if (!studentAnamnesisViewId) {
      return;
    }

    const student = (overview?.students ?? []).find(
      (item) => item.id === studentAnamnesisViewId,
    );

    const cachedForm = anamnesisFormsByStudent[studentAnamnesisViewId];

    if (cachedForm) {
      setCurrentAnamnesisForm(normalizeAnamnesisForm(cachedForm, student));
      return;
    }

    setCurrentAnamnesisForm(createInitialAnamnesisForm(student));

    void loadStudentAnamnesisIntoCache(studentAnamnesisViewId, student)
      .then((normalizedAnamnesis) => {
        if (!normalizedAnamnesis) {
          return;
        }

        setCurrentAnamnesisForm(normalizedAnamnesis);
      })
      .catch(() => undefined);
  }, [
    anamnesisFormsByStudent,
    loadStudentAnamnesisIntoCache,
    overview?.students,
    studentAnamnesisViewId,
  ]);

  useEffect(() => {
    if (
      tab !== "students" ||
      selectedStudentRouteView !== "overview" ||
      !selectedStudentRouteId
    ) {
      return;
    }

    const student = (overview?.students ?? []).find(
      (item) => item.id === selectedStudentRouteId,
    );

    if (!student) {
      return;
    }

    if (!anamnesisFormsByStudent[selectedStudentRouteId]) {
      void loadStudentAnamnesisIntoCache(
        selectedStudentRouteId,
        student,
      ).catch(() => undefined);
    }

    if (!studentHistoryByStudent[selectedStudentRouteId]) {
      void loadStudentHistoryIntoCache(selectedStudentRouteId).catch(
        () => undefined,
      );
    }
  }, [
    anamnesisFormsByStudent,
    loadStudentAnamnesisIntoCache,
    loadStudentHistoryIntoCache,
    overview?.students,
    selectedStudentRouteId,
    selectedStudentRouteView,
    studentHistoryByStudent,
    tab,
  ]);

  useEffect(() => {
    if (tab !== "students" || !selectedStudentRouteId) {
      setStudentWorkoutsViewId(null);
      setStudentAnamnesisViewId(null);
      return;
    }

    if (selectedStudentRouteView === "workouts") {
      setStudentWorkoutsViewId(selectedStudentRouteId);
      setStudentAnamnesisViewId(null);
      return;
    }

    if (selectedStudentRouteView === "anamnesis") {
      setStudentAnamnesisViewId(selectedStudentRouteId);
      setStudentWorkoutsViewId(null);
      return;
    }

    setStudentWorkoutsViewId(null);
    setStudentAnamnesisViewId(null);
  }, [selectedStudentRouteId, selectedStudentRouteView, tab]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = (matches: boolean) => setIsMobileViewport(matches);

    syncViewport(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      syncViewport(event.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (selectedWorkoutId) {
      return;
    }

    setIsEditingWorkoutDetails(false);
    setHistorySnapshot(null);
  }, [selectedWorkoutId]);

  useEffect(() => {
    if (tab !== "workouts" || selectedWorkoutId || !shouldOpenWorkoutCreateFlow) {
      return;
    }

    setPrefilledStudentId(routeStudentId);
    setIsCreatingWorkoutFlow(true);
  }, [routeStudentId, selectedWorkoutId, shouldOpenWorkoutCreateFlow, tab]);

  function resolveWorkoutStatusMeta(workout: PersonalAssignedWorkout) {
    if (!workout.isActive) {
      return { label: "Inativo", className: "bg-muted text-muted-foreground" };
    }

    if (workout.assignmentScope === "personal") {
      return { label: "Rascunho", className: "bg-secondary/20 text-secondary" };
    }

    return { label: "Ativo", className: "bg-success/20 text-success" };
  }

  function resolveWorkoutIntensityLabel(workout: PersonalAssignedWorkout) {
    if (!workout.intensity) {
      return "Sem nivel";
    }

    return (
      workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)
    );
  }

  function normalizeWorkoutExercises(
    workout: PersonalAssignedWorkout,
  ): EditableWorkoutExercise[] {
    if (workout.exercises && workout.exercises.length > 0) {
      return workout.exercises.map((exercise) => ({
        id: exercise.id || crypto.randomUUID(),
        name: exercise.name,
        sets: Math.max(1, Math.round(exercise.sets)),
        reps: Math.max(1, Math.round(exercise.reps)),
        restSec: clamp(Math.round(exercise.restSec ?? 60), 20, 300),
        suggestedLoadKg: Math.max(0, Number(exercise.suggestedLoadKg ?? 0)),
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        durationMin: clamp(Math.round(exercise.durationMin ?? 6), 2, 30),
        supportMedia: exercise.supportMedia ?? null,
      }));
    }

    return Array.from({ length: workout.exercisesCount }, (_, index) => ({
      id: crypto.randomUUID(),
      name: `Exercicio ${index + 1}`,
      sets: 3,
      reps: 10,
      restSec: 60,
      suggestedLoadKg: 20,
      durationMin: 6,
    }));
  }

  function selectWorkoutForDetails(workout: PersonalAssignedWorkout) {
    history.push({
      pathname: `${basePath}/workouts/${workout.id}`,
      search: location.search,
    });
    setIsEditingWorkoutDetails(false);
    setHistorySnapshot(null);
  }

  function closeWorkoutDetails() {
    history.push({
      pathname: `${basePath}/workouts`,
      search: location.search,
    });
    setEditingStudentId("");
    setEditingTitle("");
    setEditingDescription("");
    setEditingDate("");
    setEditingFrequencyWeekly("4");
    setEditingIntensity("intermediario");
    setEditingStarsReward("90");
    setEditingEstimatedDurationMin("45");
    setEditingWeekdays(["Seg", "Qua", "Sex"]);
    setEditingMuscleGroups([]);
    setEditingExercises([]);
    setIsEditingWorkoutDetails(false);
    setHistorySnapshot(null);
  }

  function handleCreateWorkoutForStudent(studentId: string) {
    history.push({
      pathname: `${basePath}/workouts`,
      search: `?studentId=${studentId}&createWorkout=1`,
    });
  }

  function openStudentDetails(
    studentId: string,
    view: "overview" | "workouts" | "anamnesis" = "overview",
  ) {
    history.push({
      pathname:
        view === "overview"
          ? `${basePath}/students/${studentId}`
          : `${basePath}/students/${studentId}/${view}`,
    });
  }

  function handleViewStudentWorkouts(studentId: string) {
    setExpandedStudentWorkoutIds([]);
    setStudentWorkoutSearch("");
    openStudentDetails(studentId, "workouts");
  }

  function handleBackToStudentsList() {
    history.push({
      pathname: `${basePath}/students`,
    });
  }

  function handleBackToStudentOverview(studentId: string) {
    openStudentDetails(studentId, "overview");
  }

  function handleOpenStudentAnamnesis(studentId: string) {
    setStudentWorkoutsViewId(null);
    openStudentDetails(studentId, "anamnesis");
  }

  function handleCloseStudentAnamnesis() {
    if (!studentAnamnesisViewId) {
      handleBackToStudentsList();
      return;
    }

    handleBackToStudentOverview(studentAnamnesisViewId);
  }

  function handleCloseStudentWorkouts() {
    if (!studentWorkoutsViewId) {
      handleBackToStudentsList();
      return;
    }

    handleBackToStudentOverview(studentWorkoutsViewId);
  }

  function handleOpenStudentDashboardActions(studentId: string) {
    setExpandedStudentWorkoutIds([]);
    setStudentWorkoutSearch("");
    openStudentDetails(studentId, "overview");
  }

  function updateCurrentAnamnesisField<K extends keyof StudentAnamnesisForm>(
    field: K,
    value: StudentAnamnesisForm[K],
  ) {
    setCurrentAnamnesisForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveStudentAnamnesis() {
    if (!studentAnamnesisViewId || !anamnesisStudent) {
      return;
    }

    if (
      !currentAnamnesisForm.fullName.trim() ||
      !currentAnamnesisForm.mainGoal ||
      !currentAnamnesisForm.responsibilityAccepted ||
      !currentAnamnesisForm.signatureName.trim()
    ) {
      toast({
        title: "Complete os campos obrigatorios",
        description:
          "Preencha nome, objetivo principal, termo de responsabilidade e assinatura.",
        tone: "warning",
      });
      return;
    }

    try {
      await saveStudentAnamnesis({
        studentId: studentAnamnesisViewId,
        anamnesis: {
          ...currentAnamnesisForm,
          updatedAt: new Date().toISOString(),
        },
      });

      setAnamnesisFormsByStudent((current) => ({
        ...current,
        [studentAnamnesisViewId]: {
          ...currentAnamnesisForm,
          updatedAt: new Date().toISOString(),
        },
      }));

      toast({
        title: "Anamnese salva",
        description: `A ficha de ${anamnesisStudent.name} foi atualizada com sucesso.`,
        tone: "success",
      });
    } catch (requestError) {
      toast({
        title: "Falha ao salvar anamnese",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  function openStudentRegistrationModal() {
    setStudentRegistrationMode("invite");
    setNewStudentName("");
    setNewStudentEmail("");
    setIsStudentRegistrationModalOpen(true);
  }

  async function handleCreateStudentDirectly(
    mode: "direct" | "direct-with-anamnesis",
  ) {
    const input: CreatePersonalStudentInput = {
      name: newStudentName.trim(),
      email: newStudentEmail.trim(),
    };

    if (!input.name || !input.email) {
      toast({
        title: "Dados obrigatorios",
        description: "Informe nome e e-mail do aluno para continuar.",
        tone: "warning",
      });
      return;
    }

    try {
      const result = await createStudentAccount(input);
      setIsStudentRegistrationModalOpen(false);
      setNewStudentName("");
      setNewStudentEmail("");

      toast({
        title: "Aluno cadastrado",
        description:
          "Conta criada com sucesso. O aluno recebeu o e-mail de redefinicao de senha.",
        tone: "success",
      });

      if (mode === "direct-with-anamnesis") {
        openStudentDetails(result.studentId, "anamnesis");
      }
    } catch (requestError) {
      toast({
        title: "Falha ao cadastrar aluno",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  function toggleStudentWorkoutExpanded(workoutId: string) {
    setExpandedStudentWorkoutIds((currentIds) =>
      currentIds.includes(workoutId)
        ? currentIds.filter((id) => id !== workoutId)
        : [...currentIds, workoutId],
    );
  }

  function updateWorkoutStudentFilter(
    nextStudentId: string,
    mode: "push" | "replace" = "replace",
  ) {
    const params = new URLSearchParams(location.search);

    if (!nextStudentId || nextStudentId === "all") {
      params.delete("studentId");
    } else {
      params.set("studentId", nextStudentId);
    }

    const nextSearch = params.toString();
    const target = {
      pathname: selectedWorkoutId
        ? `${basePath}/workouts/${selectedWorkoutId}`
        : `${basePath}/workouts`,
      search: nextSearch ? `?${nextSearch}` : "",
    };

    if (mode === "push") {
      history.push(target);
      return;
    }

    history.replace(target);
  }

  function openWorkoutFiltersForStudent(studentId: string) {
    setStudentWorkoutsViewId(null);
    history.push({
      pathname: `${basePath}/workouts`,
      search: `?studentId=${studentId}`,
    });
  }

  function clearWorkoutCreateMode() {
    const params = new URLSearchParams(location.search);
    params.delete("createWorkout");

    const nextSearch = params.toString();

    history.replace({
      pathname: `${basePath}/workouts`,
      search: nextSearch ? `?${nextSearch}` : "",
    });
  }

  const studentWorkoutsForView = useMemo(() => {
    if (!studentWorkoutsViewId) return [];
    return (overview?.workouts ?? []).filter(
      (workout) => workout.studentId === studentWorkoutsViewId,
    );
  }, [overview?.workouts, studentWorkoutsViewId]);

  const filteredStudentWorkoutsForView = useMemo(() => {
    const normalizedSearch = studentWorkoutSearch.trim().toLowerCase();

    return studentWorkoutsForView
      .filter((workout) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          workout.title,
          workout.description ?? "",
          ...(workout.muscleGroups ?? []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .filter(matchesWorkoutAdvancedFilters);
  }, [
    matchesWorkoutAdvancedFilters,
    studentWorkoutSearch,
    studentWorkoutsForView,
  ]);

  const studentWorkoutsActiveCount = useMemo(
    () => studentWorkoutsForView.filter((workout) => workout.isActive).length,
    [studentWorkoutsForView],
  );

  const hasStudentWorkoutsScopedFilters = useMemo(
    () =>
      studentWorkoutSearch.trim().length > 0 || hasAdvancedWorkoutFilters,
    [hasAdvancedWorkoutFilters, studentWorkoutSearch],
  );

  const studentWorkoutsByWeekday = useMemo(() => {
    const sections: Array<{
      id: string;
      label: string;
      workouts: PersonalAssignedWorkout[];
    }> = weekdayOrder
      .map((weekday) => ({
        id: weekday,
        label: weekdayLabelMap[weekday],
        workouts: filteredStudentWorkoutsForView
          .filter((workout) => workout.weekdays?.includes(weekday))
          .sort((left, right) => left.title.localeCompare(right.title, "pt-BR")),
      }));

    const unscheduledWorkouts = filteredStudentWorkoutsForView
      .filter((workout) => !workout.weekdays || workout.weekdays.length === 0)
      .sort((left, right) => left.title.localeCompare(right.title, "pt-BR"));

    if (unscheduledWorkouts.length > 0) {
      sections.push({
        id: "unscheduled",
        label: "Sem dia definido",
        workouts: unscheduledWorkouts,
      });
    }

    return hasStudentWorkoutsScopedFilters
      ? sections.filter((section) => section.workouts.length > 0)
      : sections;
  }, [filteredStudentWorkoutsForView, hasStudentWorkoutsScopedFilters]);

  const studentWorkoutsViewName = useMemo(() => {
    if (!studentWorkoutsViewId) return "";
    const student = (overview?.students ?? []).find(
      (s) => s.id === studentWorkoutsViewId,
    );
    return student?.name ?? "Aluno";
  }, [overview?.students, studentWorkoutsViewId]);

  const studentWorkoutsViewEmail = useMemo(() => {
    if (!studentWorkoutsViewId) return "";
    const student = (overview?.students ?? []).find(
      (s) => s.id === studentWorkoutsViewId,
    );
    return student?.email ?? "";
  }, [overview?.students, studentWorkoutsViewId]);

  const anamnesisStudent = useMemo(() => {
    if (!studentAnamnesisViewId) return null;
    return (
      (overview?.students ?? []).find(
        (student) => student.id === studentAnamnesisViewId,
      ) ?? null
    );
  }, [overview?.students, studentAnamnesisViewId]);

  const selectedStudentRoute = useMemo(() => {
    if (!selectedStudentRouteId) {
      return null;
    }

    return (
      (overview?.students ?? []).find(
        (student) => student.id === selectedStudentRouteId,
      ) ?? null
    );
  }, [overview?.students, selectedStudentRouteId]);

  const selectedStudentRouteAnamnesis = useMemo(() => {
    if (!selectedStudentRouteId) {
      return null;
    }

    return anamnesisFormsByStudent[selectedStudentRouteId] ?? null;
  }, [anamnesisFormsByStudent, selectedStudentRouteId]);

  const selectedStudentRouteHistory = useMemo(() => {
    if (!selectedStudentRouteId) {
      return null;
    }

    return studentHistoryByStudent[selectedStudentRouteId] ?? null;
  }, [selectedStudentRouteId, studentHistoryByStudent]);

  const selectedStudentRouteWorkouts = useMemo(() => {
    if (!selectedStudentRouteId) {
      return [];
    }

    return (overview?.workouts ?? [])
      .filter((workout) => workout.studentId === selectedStudentRouteId)
      .sort((left, right) => {
        if (left.isActive !== right.isActive) {
          return left.isActive ? -1 : 1;
        }

        return right.createdAt.localeCompare(left.createdAt);
      });
  }, [overview?.workouts, selectedStudentRouteId]);

  const selectedStudentRouteActiveWorkouts = useMemo(
    () => selectedStudentRouteWorkouts.filter((workout) => workout.isActive),
    [selectedStudentRouteWorkouts],
  );

  const selectedStudentRouteFrequencyMetric = useMemo(
    () =>
      (overview?.metrics.studentFrequency ?? []).find(
        (item) => item.studentId === selectedStudentRouteId,
      ) ?? null,
    [overview?.metrics.studentFrequency, selectedStudentRouteId],
  );

  const selectedStudentRouteLoadMetric = useMemo(
    () =>
      (overview?.metrics.loadEvolution ?? []).find(
        (item) => item.studentId === selectedStudentRouteId,
      ) ?? null,
    [overview?.metrics.loadEvolution, selectedStudentRouteId],
  );

  const selectedStudentRouteAlerts = useMemo(
    () =>
      (overview?.metrics.alerts ?? []).filter(
        (alert) => alert.studentId === selectedStudentRouteId,
      ),
    [overview?.metrics.alerts, selectedStudentRouteId],
  );

  const selectedStudentRouteMeasurementRequests = useMemo(
    () =>
      (overview?.measurementRequests ?? [])
        .filter((request) => request.studentId === selectedStudentRouteId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [overview?.measurementRequests, selectedStudentRouteId],
  );

  const selectedStudentRouteRecentSessions = useMemo(
    () => selectedStudentRouteHistory?.sessions.slice(0, 6) ?? [],
    [selectedStudentRouteHistory],
  );

  const selectedStudentRouteHistorySummary = useMemo(() => {
    const sessions = selectedStudentRouteHistory?.sessions ?? [];
    const totalMinutes = Math.round(
      sessions.reduce((total, session) => total + session.durationSec / 60, 0),
    );
    const averageDurationMinutes =
      sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : null;
    const averageCompletionRate =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((total, session) => {
              if (session.totalSets <= 0) {
                return total;
              }

              return total + (session.completedSets / session.totalSets) * 100;
            }, 0) / sessions.length,
          )
        : null;

    return {
      totalSessions: sessions.length,
      totalMinutes,
      averageDurationMinutes,
      averageCompletionRate,
      latestSession: sessions[0] ?? null,
    };
  }, [selectedStudentRouteHistory]);

  const selectedStudentRouteAvailability = useMemo(() => {
    if (!selectedStudentRouteAnamnesis) {
      return [];
    }

    return anamnesisAvailabilityFields
      .filter(({ field }) => selectedStudentRouteAnamnesis[field])
      .map(({ label }) => label);
  }, [selectedStudentRouteAnamnesis]);

  const selectedStudentRouteMuscleGroups = useMemo(() => {
    const muscleGroupsCount = new Map<string, number>();

    selectedStudentRouteActiveWorkouts.forEach((workout) => {
      (workout.muscleGroups ?? []).forEach((muscleGroup) => {
        muscleGroupsCount.set(
          muscleGroup,
          (muscleGroupsCount.get(muscleGroup) ?? 0) + 1,
        );
      });
    });

    return [...muscleGroupsCount.entries()]
      .sort(
        (left, right) =>
          right[1] - left[1] || left[0].localeCompare(right[0], "pt-BR"),
      )
      .slice(0, 5);
  }, [selectedStudentRouteActiveWorkouts]);

  const selectedStudentRouteTrainingDays = useMemo(() => {
    const days = new Set<PersonalWorkoutWeekday>();

    selectedStudentRouteActiveWorkouts.forEach((workout) => {
      (workout.weekdays ?? []).forEach((weekday) => {
        days.add(weekday);
      });
    });

    return weekdayOrder
      .filter((weekday) => days.has(weekday))
      .map((weekday) => weekdayLabelMap[weekday]);
  }, [selectedStudentRouteActiveWorkouts]);

  const selectedStudentRouteBodyMassIndex = useMemo(
    () =>
      calculateBodyMassIndex(
        selectedStudentRouteAnamnesis?.weight,
        selectedStudentRouteAnamnesis?.height,
      ),
    [selectedStudentRouteAnamnesis],
  );

  const selectedStudentRouteMaxMuscleGroupCount = useMemo(
    () => Math.max(1, ...selectedStudentRouteMuscleGroups.map(([, count]) => count)),
    [selectedStudentRouteMuscleGroups],
  );

  const selectedStudentRouteFrequencyProgress = useMemo(() => {
    if (selectedStudentRouteFrequencyMetric) {
      return selectedStudentRouteFrequencyMetric.frequencyPct;
    }

    const workoutsPerWeekTarget = selectedStudentRoute?.workoutsPerWeekTarget ?? 0;

    if (workoutsPerWeekTarget <= 0) {
      return 0;
    }

    return Math.round(
      (selectedStudentRouteHistorySummary.totalSessions / workoutsPerWeekTarget) *
        100,
    );
  }, [
    selectedStudentRoute,
    selectedStudentRouteFrequencyMetric,
    selectedStudentRouteHistorySummary.totalSessions,
  ]);

  const selectedStudentRouteWeekdayDistribution = useMemo(
    () =>
      weekdayOrder.map((weekday) => ({
        weekday,
        label: weekdayLabelMap[weekday],
        count: selectedStudentRouteActiveWorkouts.filter((workout) =>
          workout.weekdays?.includes(weekday),
        ).length,
      })),
    [selectedStudentRouteActiveWorkouts],
  );

  const selectedStudentRouteMaxWeekdayCount = useMemo(
    () => Math.max(1, ...selectedStudentRouteWeekdayDistribution.map((item) => item.count)),
    [selectedStudentRouteWeekdayDistribution],
  );

  const selectedStudentRouteLoadChart = useMemo(() => {
    const series = selectedStudentRouteLoadMetric?.series.slice(-6) ?? [];
    const maxValue = Math.max(
      1,
      ...series.map((point) => point.averageLoadVolumeKg),
    );

    return {
      maxValue,
      points: series.map((point) => ({
        ...point,
        label: formatDateLabel(point.weekStart),
        heightPct: Math.max(
          12,
          Math.round((point.averageLoadVolumeKg / maxValue) * 100),
        ),
      })),
    };
  }, [selectedStudentRouteLoadMetric]);

  const selectedStudentRouteHistoryHeatmap = useMemo(() => {
    const sessions = selectedStudentRouteHistory?.sessions ?? [];
    const sessionsByDate = new Map<string, number>();

    sessions.forEach((session) => {
      const sessionDate = new Date(session.completedAt);

      if (Number.isNaN(sessionDate.getTime())) {
        return;
      }

      const dateKey = toLocalDateKey(sessionDate);
      sessionsByDate.set(dateKey, (sessionsByDate.get(dateKey) ?? 0) + 1);
    });

    const data = Array.from({ length: 14 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (13 - index));

      const dateKey = toLocalDateKey(day);

      return {
        date: formatDateLabel(dateKey),
        value: sessionsByDate.get(dateKey) ?? 0,
      };
    });

    return {
      data,
      maxValue: Math.max(1, ...data.map((point) => point.value)),
    };
  }, [selectedStudentRouteHistory]);

  const workoutFiltersSummary = useMemo(() => {
    const summary: string[] = [];

    if (workoutLevelFilter !== "all") {
      summary.push(
        `Nivel: ${
          workoutIntensityOptions.find(
            (option) => option.value === workoutLevelFilter,
          )?.label ?? workoutLevelFilter
        }`,
      );
    }

    if (workoutMuscleGroupFilters.length > 0) {
      summary.push(`Grupos: ${workoutMuscleGroupFilters.join(", ")}`);
    }

    if (
      workoutMinDuration !== workoutDurationRange.min ||
      workoutMaxDuration !== workoutDurationRange.max
    ) {
      summary.push(`Tempo: ${workoutMinDuration}-${workoutMaxDuration} min`);
    }

    if (
      workoutMinStars !== workoutStarsRange.min ||
      workoutMaxStars !== workoutStarsRange.max
    ) {
      summary.push(`Estrelas: ${workoutMinStars}-${workoutMaxStars}`);
    }

    if (
      workoutMinExercises !== workoutExercisesRange.min ||
      workoutMaxExercises !== workoutExercisesRange.max
    ) {
      summary.push(
        `Exercicios: ${workoutMinExercises}-${workoutMaxExercises}`,
      );
    }

    return summary;
  }, [
    workoutLevelFilter,
    workoutMaxDuration,
    workoutMaxExercises,
    workoutMaxStars,
    workoutMinDuration,
    workoutMinExercises,
    workoutMinStars,
    workoutMuscleGroupFilters,
  ]);

  function toggleEditingWeekday(weekday: PersonalWorkoutWeekday) {
    setEditingWeekdays((current) => {
      if (current.includes(weekday)) {
        return current.filter((item) => item !== weekday);
      }

      return [...current, weekday];
    });
  }

  function toggleEditingMuscleGroup(muscleGroup: string) {
    setEditingMuscleGroups((current) => {
      if (current.includes(muscleGroup)) {
        return current.filter((item) => item !== muscleGroup);
      }
      return [...current, muscleGroup];
    });
  }

  function updateEditingExerciseNumeric(
    exerciseId: string,
    field: "sets" | "reps" | "restSec" | "suggestedLoadKg" | "durationMin",
    value: string,
  ) {
    setEditingExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (field === "sets") {
          return {
            ...exercise,
            sets: parseNumericInput(value, exercise.sets, 1, 8),
          };
        }

        if (field === "reps") {
          return {
            ...exercise,
            reps: parseNumericInput(value, exercise.reps, 1, 30),
          };
        }

        if (field === "restSec") {
          return {
            ...exercise,
            restSec: parseNumericInput(value, exercise.restSec, 20, 300),
          };
        }

        if (field === "durationMin") {
          return {
            ...exercise,
            durationMin: parseNumericInput(value, exercise.durationMin, 2, 30),
          };
        }

        const parsed = Number(value);
        return {
          ...exercise,
          suggestedLoadKg: Number.isFinite(parsed)
            ? Math.max(0, parsed)
            : exercise.suggestedLoadKg,
        };
      }),
    );
  }

  function moveEditingExercise(fromExerciseId: string, toExerciseId: string) {
    if (fromExerciseId === toExerciseId) {
      return;
    }

    setEditingExercises((current) => {
      const fromIndex = current.findIndex(
        (exercise) => exercise.id === fromExerciseId,
      );
      const toIndex = current.findIndex(
        (exercise) => exercise.id === toExerciseId,
      );

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function addEmptyExercise() {
    setEditingExercises((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: 3,
        reps: 10,
        restSec: 60,
        suggestedLoadKg: 20,
        durationMin: 6,
      },
    ]);
  }

  async function handleEditWorkout() {
    if (!selectedWorkoutId || !editingStudentId) {
      toast({
        title: "Selecao obrigatoria",
        description: "Selecione um treino para editar.",
        tone: "warning",
      });
      return;
    }

    const normalizedTitle = editingTitle.trim();
    if (!normalizedTitle) {
      toast({
        title: "Titulo obrigatorio",
        description: "Informe o nome da ficha antes de salvar.",
        tone: "warning",
      });
      return;
    }

    if (editingExercises.length === 0) {
      toast({
        title: "Exercicios obrigatorios",
        description: "Adicione pelo menos um exercicio no treino.",
        tone: "warning",
      });
      return;
    }

    const hasUnnamedExercise = editingExercises.some(
      (exercise) => !exercise.name.trim(),
    );
    if (hasUnnamedExercise) {
      toast({
        title: "Exercicio sem nome",
        description: "Preencha o nome de todos os exercicios antes de salvar.",
        tone: "warning",
      });
      return;
    }

    const safeStarsReward = clamp(
      Math.round(Number(editingStarsReward) || 90),
      50,
      200,
    );
    const safeEstimatedDurationMin = clamp(
      Math.round(Number(editingEstimatedDurationMin) || 45),
      10,
      240,
    );
    const safeFrequencyWeekly =
      Number.isFinite(Number(editingFrequencyWeekly)) &&
      Number(editingFrequencyWeekly) > 0
        ? Math.max(1, Math.round(Number(editingFrequencyWeekly)))
        : Math.max(1, editingWeekdays.length);

    const sortedWeekdays = [...editingWeekdays].sort(
      (left, right) => weekdayOrder.indexOf(left) - weekdayOrder.indexOf(right),
    );

    try {
      await updateWorkout({
        studentId: editingStudentId,
        workoutId: selectedWorkoutId,
        title: normalizedTitle,
        description: editingDescription,
        date: editingDate || undefined,
        frequencyWeekly: safeFrequencyWeekly,
        muscleGroups: editingMuscleGroups,
        intensity: editingIntensity,
        starsReward: safeStarsReward,
        estimatedDurationMin: safeEstimatedDurationMin,
        weekdays: sortedWeekdays,
        exercises: editingExercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name.trim(),
          sets: exercise.sets,
          reps: exercise.reps,
          restSec: exercise.restSec,
          suggestedLoadKg: Math.max(0, Number(exercise.suggestedLoadKg)),
          muscleGroup: exercise.muscleGroup?.trim()
            ? exercise.muscleGroup.trim()
            : undefined,
          equipment: exercise.equipment?.trim()
            ? exercise.equipment.trim()
            : undefined,
          durationMin: exercise.durationMin,
          supportMedia: exercise.supportMedia ?? null,
        })),
      });
      toast({
        title: "Treino atualizado",
        description: "Alteracoes salvas com sucesso.",
        tone: "success",
      });
      setIsEditingWorkoutDetails(false);
    } catch (requestError) {
      toast({
        title: "Falha ao editar treino",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  async function handleDeactivateWorkout() {
    if (!selectedWorkoutId || !editingStudentId) {
      toast({
        title: "Selecao obrigatoria",
        description: "Selecione um treino para desativar.",
        tone: "warning",
      });
      return;
    }

    try {
      await deactivateWorkout({
        studentId: editingStudentId,
        workoutId: selectedWorkoutId,
      });
      toast({
        title: "Treino desativado",
        description: "O aluno nao pode mais executar esse treino.",
        tone: "success",
      });
      closeWorkoutDetails();
    } catch (requestError) {
      toast({
        title: "Falha ao desativar treino",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  async function handleLoadStudentHistory(studentId: string) {
    try {
      const history = await loadStudentHistoryIntoCache(studentId);
      setHistorySnapshot(history);
    } catch (requestError) {
      toast({
        title: "Falha ao carregar historico",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  async function handleGenerateStudentInviteLink() {
    try {
      const invite = await generateStudentInviteLink();
      setStudentInviteCode(invite.code);
      setStudentInviteLink(invite.inviteLink);
      setIsStudentRegistrationModalOpen(false);
      toast({
        title: "Link gerado",
        description:
          "Compartilhe o link com o aluno para ele criar a conta e ficar com a anamnese pendente.",
        tone: "success",
      });
    } catch (requestError) {
      toast({
        title: "Falha ao gerar link",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  async function handleCopyInviteLink() {
    if (!studentInviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(studentInviteLink);
      toast({
        title: "Link copiado",
        description: "Link de convite copiado para a area de transferencia.",
        tone: "success",
      });
    } catch {
      toast({
        title: "Falha ao copiar",
        description: "Copie manualmente o link exibido.",
        tone: "warning",
      });
    }
  }

  async function handleSendMotivation() {
    if (!engagementStudentId || !motivationalMessage.trim()) {
      toast({
        title: "Aluno e mensagem obrigatorios",
        description: "Selecione um aluno e escreva uma mensagem motivacional.",
        tone: "warning",
      });
      return;
    }

    try {
      await sendMotivationalMessage({
        studentId: engagementStudentId,
        message: motivationalMessage.trim(),
      });
      setMotivationalMessage("");
      toast({
        title: "Mensagem enviada",
        description: "O aluno recebeu a notificacao motivacional.",
        tone: "success",
      });
    } catch (requestError) {
      toast({
        title: "Falha ao enviar mensagem",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  async function handleGrantAchievement() {
    if (
      !engagementStudentId ||
      !achievementTitle.trim() ||
      !achievementDescription.trim()
    ) {
      toast({
        title: "Dados obrigatorios",
        description: "Selecione aluno, titulo e descricao da conquista.",
        tone: "warning",
      });
      return;
    }

    try {
      await grantSpecialAchievement({
        studentId: engagementStudentId,
        title: achievementTitle.trim(),
        description: achievementDescription.trim(),
      });
      setAchievementDescription("");
      toast({
        title: "Conquista liberada",
        description:
          "A conquista especial foi enviada ao aluno e integrada na gamificacao.",
        tone: "success",
      });
    } catch (requestError) {
      toast({
        title: "Falha ao liberar conquista",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  async function handleUpdateMeasurementRequest(
    requestId: string,
    status: "accepted" | "done",
  ) {
    try {
      await updateMeasurementsRequestStatus({ requestId, status });
      toast({
        title:
          status === "accepted"
            ? "Solicitacao aceita"
            : "Solicitacao concluida",
        description: "Status atualizado para o aluno.",
        tone: "success",
      });
    } catch (requestError) {
      toast({
        title: "Falha ao atualizar solicitacao",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  const workoutFiltersContent = (
    <div className="space-y-5">
      <div className="space-y-3">
        <FqText as="p" className="text-sm font-semibold text-foreground">
          Grupo muscular
        </FqText>
        <div className="flex flex-wrap gap-2">
          {workoutMuscleGroupOptions.map((option) => {
            const isSelected = draftWorkoutMuscleGroupFilters.includes(
              option.value,
            );
            return (
              <button
                type="button"
                key={`workout-filter-${option.value}`}
                onClick={() => toggleWorkoutMuscleGroupFilter(option.value)}
                className={`
                  rounded-full border px-3 py-2 text-sm font-semibold transition
                  ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <FqSelect
        label="Nivel"
        value={draftWorkoutLevelFilter}
        onChange={(event) =>
          setDraftWorkoutLevelFilter(
            event.target.value as WorkoutIntensityFilter,
          )
        }
        options={[
          { value: "all", label: "Todos os niveis" },
          ...workoutIntensityOptions,
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-muted/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Tempo
            </FqText>
            <span className="text-xs font-semibold text-muted-foreground">
              {draftWorkoutMinDuration} - {draftWorkoutMaxDuration} min
            </span>
          </div>
          <div className="space-y-3">
            <FqSlider
              label="Minimo"
              min={workoutDurationRange.min}
              max={workoutDurationRange.max}
              step={5}
              value={draftWorkoutMinDuration}
              onChange={(event) =>
                setDraftWorkoutMinDuration(
                  Math.min(Number(event.target.value), draftWorkoutMaxDuration),
                )
              }
            />
            <FqSlider
              label="Maximo"
              min={workoutDurationRange.min}
              max={workoutDurationRange.max}
              step={5}
              value={draftWorkoutMaxDuration}
              onChange={(event) =>
                setDraftWorkoutMaxDuration(
                  Math.max(Number(event.target.value), draftWorkoutMinDuration),
                )
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <FqText as="p" className="text-sm font-semibold text-foreground">
              Estrelas
            </FqText>
            <span className="text-xs font-semibold text-muted-foreground">
              {draftWorkoutMinStars} - {draftWorkoutMaxStars}
            </span>
          </div>
          <div className="space-y-3">
            <FqSlider
              label="Minimo"
              min={workoutStarsRange.min}
              max={workoutStarsRange.max}
              step={5}
              value={draftWorkoutMinStars}
              onChange={(event) =>
                setDraftWorkoutMinStars(
                  Math.min(Number(event.target.value), draftWorkoutMaxStars),
                )
              }
            />
            <FqSlider
              label="Maximo"
              min={workoutStarsRange.min}
              max={workoutStarsRange.max}
              step={5}
              value={draftWorkoutMaxStars}
              onChange={(event) =>
                setDraftWorkoutMaxStars(
                  Math.max(Number(event.target.value), draftWorkoutMinStars),
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/10 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Quantidade de exercicios
          </FqText>
          <span className="text-xs font-semibold text-muted-foreground">
            {draftWorkoutMinExercises} - {draftWorkoutMaxExercises}
          </span>
        </div>
        <div className="space-y-3">
          <FqSlider
            label="Minimo"
            min={workoutExercisesRange.min}
            max={workoutExercisesRange.max}
            step={1}
            value={draftWorkoutMinExercises}
            onChange={(event) =>
              setDraftWorkoutMinExercises(
                Math.min(Number(event.target.value), draftWorkoutMaxExercises),
              )
            }
          />
          <FqSlider
            label="Maximo"
            min={workoutExercisesRange.min}
            max={workoutExercisesRange.max}
            step={1}
            value={draftWorkoutMaxExercises}
            onChange={(event) =>
              setDraftWorkoutMaxExercises(
                Math.max(Number(event.target.value), draftWorkoutMinExercises),
              )
            }
          />
        </div>
      </div>
    </div>
  );

  const workoutFiltersOverlay = isMobileViewport ? (
    <FqDrawer
      open={isWorkoutFiltersOpen}
      onOpenChange={setIsWorkoutFiltersOpen}
      side="bottom"
      title="Filtros dos treinos"
      description="Refine a lista por grupo muscular, nivel e metricas."
    >
      <div className="space-y-5">
        {workoutFiltersContent}
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <FqButton
            variant="outline"
            tone="neutral"
            onClick={resetWorkoutDraftFilters}
          >
            Limpar filtros
          </FqButton>
          <FqButton onClick={applyWorkoutDraftFilters}>
            Aplicar filtros
          </FqButton>
        </div>
      </div>
    </FqDrawer>
  ) : (
    <FqModal
      open={isWorkoutFiltersOpen}
      onOpenChange={setIsWorkoutFiltersOpen}
      title="Filtros dos treinos"
      description="Refine a lista por grupo muscular, nivel e metricas."
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <FqButton
            variant="outline"
            tone="neutral"
            onClick={resetWorkoutDraftFilters}
          >
            Limpar filtros
          </FqButton>
          <FqButton onClick={applyWorkoutDraftFilters}>Aplicar filtros</FqButton>
        </div>
      }
    >
      {workoutFiltersContent}
    </FqModal>
  );

  if (uiState === "loading") {
    return (
      <section className="fq-page-shell">
        <FqCard className="border-border bg-card">
          <FqText as="h1" variant="title" className="text-lg">
            Carregando painel do personal...
          </FqText>
        </FqCard>
      </section>
    );
  }

  if (uiState === "error") {
    return (
      <section className="fq-page-shell">
        <FqAlert tone="danger" title="Falha ao carregar painel do personal">
          {error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os dados agora."}
        </FqAlert>
        <FqButton
          variant="outline"
          tone="neutral"
          onClick={() => void refresh()}
        >
          Tentar novamente
        </FqButton>
      </section>
    );
  }

  if (uiState === "empty" || !overview) {
    return (
      <section className="fq-page-shell">
        <FqEmptyState
          icon="dumbbell"
          title="Sem dados do personal"
          description="Nao foi possivel montar o painel."
        />
      </section>
    );
  }

  return (
    <section className="theme-personal fq-page-shell">
      {tab === "students" ? (
        <div className="space-y-4">
          {selectedStudentRouteId && !selectedStudentRoute ? (
            <FqCard className="border-border bg-card shadow-sm">
              <div className="space-y-4">
                <FqButton
                  variant="ghost"
                  tone="neutral"
                  leftIcon="arrowLeft"
                  onClick={handleBackToStudentsList}
                  className="min-h-11 w-11 px-0"
                  aria-label="Voltar para alunos"
                />
                <FqEmptyState
                  icon="users"
                  title="Aluno nao encontrado"
                  description="Nao foi possivel localizar esse aluno no painel."
                />
              </div>
            </FqCard>
          ) : selectedStudentRoute && selectedStudentRouteView === "overview" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FqButton
                    variant="ghost"
                    tone="neutral"
                    leftIcon="arrowLeft"
                    onClick={handleBackToStudentsList}
                    className="min-h-11 w-11 px-0"
                    aria-label="Voltar para alunos"
                  />

                  <div className="space-y-1">
                    <FqText
                      as="h2"
                      className="text-2xl font-semibold text-foreground"
                    >
                      {selectedStudentRoute.name}
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      {selectedStudentRoute.email}
                    </FqText>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedStudentRoute.anamnesisStatus === "completed"
                        ? "bg-success/20 text-success"
                        : selectedStudentRoute.anamnesisStatus === "pending"
                          ? "bg-warning/20 text-warning"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedStudentRoute.anamnesisStatus === "completed"
                      ? "Anamnese completa"
                      : selectedStudentRoute.anamnesisStatus === "pending"
                        ? "Anamnese pendente"
                        : "Sem anamnese"}
                  </span>
                  {selectedStudentRoute.requiresPasswordReset ? (
                    <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                      Reset de senha pendente
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
                <FqCard className="border-border bg-card shadow-sm">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
                        <FqText
                          as="p"
                          className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          Meta semanal
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-2 text-sm font-semibold text-foreground"
                        >
                          {selectedStudentRoute.workoutsPerWeekTarget} treinos
                        </FqText>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
                        <FqText
                          as="p"
                          className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          Treinos ativos
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-2 text-sm font-semibold text-foreground"
                        >
                          {selectedStudentRouteActiveWorkouts.length}
                        </FqText>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
                        <FqText
                          as="p"
                          className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          Concluidos na semana
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-2 text-sm font-semibold text-foreground"
                        >
                          {selectedStudentRouteFrequencyMetric
                            ?.completedWorkoutsThisWeek ?? 0}
                        </FqText>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
                        <FqText
                          as="p"
                          className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          Historico total
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-2 text-sm font-semibold text-foreground"
                        >
                          {selectedStudentRouteHistorySummary.totalSessions}{" "}
                          sessoes
                        </FqText>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-background px-4 py-4">
                        <FqText
                          as="p"
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Resumo do aluno
                        </FqText>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Objetivo
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedStudentRouteAnamnesis
                                ? formatGoalLabel(
                                    selectedStudentRouteAnamnesis.mainGoal,
                                  )
                                : "Anamnese pendente"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Perfil de rotina
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedStudentRouteAnamnesis
                                ? formatLifestyleLabel(
                                    selectedStudentRouteAnamnesis.lifestyleLevel,
                                  )
                                : "Nao informado"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Disponibilidade
                            </span>
                            <span className="text-right font-medium text-foreground">
                              {selectedStudentRouteAvailability.length > 0
                                ? selectedStudentRouteAvailability.join(", ")
                                : "Nao informada"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Ultima anamnese
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedStudentRouteAnamnesis?.updatedAt
                                ? formatDateLabel(
                                    selectedStudentRouteAnamnesis.updatedAt,
                                  )
                                : "Nao preenchida"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-background px-4 py-4">
                        <FqText
                          as="p"
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Plano atual
                        </FqText>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Onboarding
                            </span>
                            <span className="font-medium text-foreground">
                              {formatOnboardingSourceLabel(
                                selectedStudentRoute.onboardingSource,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Dias com treino
                            </span>
                            <span className="text-right font-medium text-foreground">
                              {selectedStudentRouteTrainingDays.length > 0
                                ? selectedStudentRouteTrainingDays.join(", ")
                                : "Sem agenda definida"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Grupos principais
                            </span>
                            <span className="text-right font-medium text-foreground">
                              {selectedStudentRouteMuscleGroups.length > 0
                                ? selectedStudentRouteMuscleGroups
                                    .map(([group]) => group)
                                    .join(", ")
                                : "Ainda sem foco dominante"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Ultima sessao
                            </span>
                            <span className="text-right font-medium text-foreground">
                              {selectedStudentRouteHistorySummary.latestSession
                                ? formatDateTimeLabel(
                                    selectedStudentRouteHistorySummary
                                      .latestSession.completedAt,
                                  )
                                : "Sem historico"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FqCard>

                <FqCard
                  className="border-border bg-card shadow-sm"
                  title="Acoes rapidas"
                  subtitle="Fluxos principais e pendencias imediatas."
                >
                  <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                      <FqButton
                        size="sm"
                        leftIcon="plus"
                        onClick={() =>
                          handleCreateWorkoutForStudent(selectedStudentRoute.id)
                        }
                      >
                        Criar treino
                      </FqButton>
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="neutral"
                        onClick={() =>
                          handleViewStudentWorkouts(selectedStudentRoute.id)
                        }
                      >
                        Ver treinos
                      </FqButton>
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="neutral"
                        onClick={() =>
                          handleOpenStudentAnamnesis(selectedStudentRoute.id)
                        }
                      >
                        {selectedStudentRoute.anamnesisStatus === "completed"
                          ? "Ver anamnese"
                          : selectedStudentRoute.anamnesisStatus === "pending"
                            ? "Continuar anamnese"
                            : "Criar anamnese"}
                      </FqButton>
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="neutral"
                        leftIcon="activity"
                        onClick={() => {
                          void refresh();
                          void loadStudentHistoryIntoCache(selectedStudentRoute.id);
                          if (!selectedStudentRouteAnamnesis) {
                            void loadStudentAnamnesisIntoCache(
                              selectedStudentRoute.id,
                              selectedStudentRoute,
                            );
                          }
                        }}
                      >
                        Atualizar painel
                      </FqButton>
                    </div>

                    {selectedStudentRoute.requiresPasswordReset ? (
                      <FqAlert
                        tone="warning"
                        title="Reset de senha pendente"
                      >
                        O aluno ainda precisa concluir a redefinicao da senha
                        para finalizar o acesso.
                      </FqAlert>
                    ) : null}

                    {!selectedStudentRouteAnamnesis &&
                    loadingStudentAnamnesisId !== selectedStudentRoute.id ? (
                      <FqAlert tone="neutral" title="Ficha inicial pendente">
                        Preencha a anamnese para liberar contexto de saude,
                        objetivos e disponibilidade semanal.
                      </FqAlert>
                    ) : null}
                  </div>
                </FqCard>
              </div>

              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
                <FqCard
                  className="border-border bg-card shadow-sm"
                  title="Treinos ativos"
                  subtitle="Fichas em uso e foco da rotina atual."
                >
                  {selectedStudentRouteActiveWorkouts.length === 0 ? (
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Esse aluno ainda nao possui treinos ativos.
                    </FqText>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-3 lg:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Distribuicao da semana
                          </FqText>
                          <div className="mt-4 grid grid-cols-7 gap-2">
                            {selectedStudentRouteWeekdayDistribution.map(
                              (item) => (
                                <div
                                  key={item.weekday}
                                  className="space-y-2 text-center"
                                >
                                  <div className="flex h-24 items-end justify-center rounded-xl border border-border bg-background px-2 py-2">
                                    <div
                                      className={`w-full rounded-lg transition-all ${
                                        item.count > 0
                                          ? "bg-primary/80"
                                          : "bg-muted"
                                      }`}
                                      style={{
                                        height: `${Math.max(
                                          14,
                                          Math.round(
                                            (item.count /
                                              selectedStudentRouteMaxWeekdayCount) *
                                              100,
                                          ),
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="text-[0.7rem] font-semibold uppercase text-muted-foreground">
                                    {weekdayCompactLabelMap[item.weekday]}
                                  </div>
                                  <div className="text-xs font-medium text-foreground">
                                    {item.count}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Foco por grupo muscular
                          </FqText>
                          {selectedStudentRouteMuscleGroups.length === 0 ? (
                            <FqText
                              as="p"
                              className="mt-3 text-sm text-muted-foreground"
                            >
                              Ainda nao ha grupos musculares suficientes para
                              consolidar foco.
                            </FqText>
                          ) : (
                            <div className="mt-3 space-y-3">
                              {selectedStudentRouteMuscleGroups.map(
                                ([group, count]) => (
                                  <div key={group} className="space-y-1">
                                    <div className="flex items-center justify-between gap-3 text-xs">
                                      <span className="font-medium text-foreground">
                                        {group}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {count} treino
                                        {count !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                    <FqProgressBar
                                      value={Math.round(
                                        (count /
                                          selectedStudentRouteMaxMuscleGroupCount) *
                                          100,
                                      )}
                                      showLabel={false}
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedStudentRouteActiveWorkouts
                        .slice(0, 4)
                        .map((workout) => (
                          <div
                            key={workout.id}
                            className="rounded-2xl border border-border bg-muted/10 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1">
                                <FqText
                                  as="p"
                                  className="text-sm font-semibold text-foreground"
                                >
                                  {workout.title}
                                </FqText>
                                <FqText
                                  as="p"
                                  className="text-sm text-muted-foreground"
                                >
                                  {workout.description || "Sem descricao"}
                                </FqText>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {workout.intensity ? (
                                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                    {workoutIntensityOptions.find(
                                      (option) =>
                                        option.value === workout.intensity,
                                    )?.label ?? workout.intensity}
                                  </span>
                                ) : null}
                                <span className="rounded-full bg-success/20 px-2.5 py-1 text-xs font-semibold text-success">
                                  Ativo
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {(workout.muscleGroups ?? [])
                                .slice(0, 4)
                                .map((muscleGroup) => (
                                  <span
                                    key={`${workout.id}-${muscleGroup}`}
                                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                                  >
                                    {muscleGroup}
                                  </span>
                                ))}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                              <span>{workout.exercisesCount} exercicios</span>
                              <span>{workout.estimatedDurationMin ?? 0} min</span>
                              <span>{workout.starsReward ?? 0} estrelas</span>
                              <span>
                                {(workout.weekdays ?? []).length > 0
                                  ? workout.weekdays
                                      ?.map((weekday) => weekdayLabelMap[weekday])
                                      .join(", ")
                                  : "Sem agenda definida"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </FqCard>

                <div className="space-y-4">
                  <FqCard
                    className="border-border bg-card shadow-sm"
                    title="Perfil e objetivo"
                    subtitle="Contexto basico do aluno para guiar a prescricao."
                  >
                    {selectedStudentRouteAnamnesis ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Objetivo principal
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm font-medium text-foreground"
                          >
                            {formatGoalLabel(
                              selectedStudentRouteAnamnesis.mainGoal,
                            )}
                          </FqText>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Estilo de vida
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm font-medium text-foreground"
                          >
                            {formatLifestyleLabel(
                              selectedStudentRouteAnamnesis.lifestyleLevel,
                            )}
                          </FqText>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Peso / altura / IMC
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm font-medium text-foreground"
                          >
                            {selectedStudentRouteAnamnesis.weight || "?"} kg •{" "}
                            {selectedStudentRouteAnamnesis.height || "?"} • IMC{" "}
                            {selectedStudentRouteBodyMassIndex ?? "--"}
                          </FqText>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Contato e contexto
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm font-medium text-foreground"
                          >
                            {selectedStudentRouteAnamnesis.phone ||
                              "Sem telefone"}
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-1 text-xs text-muted-foreground"
                          >
                            {selectedStudentRouteAnamnesis.occupation ||
                              "Ocupacao nao informada"}{" "}
                            • nascimento{" "}
                            {formatDateLabel(
                              selectedStudentRouteAnamnesis.birthDate,
                            )}
                          </FqText>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/10 p-4 sm:col-span-2">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Preferencias
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm text-foreground"
                          >
                            {selectedStudentRouteAnamnesis.preferredTrainingStyle ||
                              "Sem preferencia registrada"}
                          </FqText>
                        </div>
                      </div>
                    ) : loadingStudentAnamnesisId === selectedStudentRoute.id ? (
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Carregando dados da anamnese...
                      </FqText>
                    ) : (
                      <FqAlert tone="neutral" title="Sem anamnese preenchida">
                        Esse painel vai mostrar objetivo, disponibilidade,
                        perfil e contexto de saude assim que a ficha for
                        preenchida.
                      </FqAlert>
                    )}
                  </FqCard>

                  <FqCard
                    className="border-border bg-card shadow-sm"
                    title="Saude e restricoes"
                    subtitle="Pontos clinicos para considerar nos treinos."
                  >
                    {selectedStudentRouteAnamnesis ? (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Doencas, lesoes e dores
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm text-foreground"
                          >
                            {[
                              selectedStudentRouteAnamnesis.chronicDiseases,
                              selectedStudentRouteAnamnesis.injuriesHistory,
                              selectedStudentRouteAnamnesis.painHistory,
                            ]
                              .filter(Boolean)
                              .join(" • ") || "Nenhum ponto critico informado"}
                          </FqText>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                          >
                            Medicamentos e historico familiar
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm text-foreground"
                          >
                            {[
                              selectedStudentRouteAnamnesis.medications,
                              selectedStudentRouteAnamnesis.familyHistory,
                              selectedStudentRouteAnamnesis.surgeriesHistory,
                            ]
                              .filter(Boolean)
                              .join(" • ") || "Sem observacoes registradas"}
                          </FqText>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-border bg-muted/10 p-4">
                            <FqText
                              as="p"
                              className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                            >
                              Habitos
                            </FqText>
                            <FqText
                              as="p"
                              className="mt-2 text-sm text-foreground"
                            >
                              Sono {selectedStudentRouteAnamnesis.sleepQuality ||
                                "nao informado"}{" "}
                              • tabagismo{" "}
                              {selectedStudentRouteAnamnesis.smoker} • alcool{" "}
                              {selectedStudentRouteAnamnesis.alcoholUse}
                            </FqText>
                          </div>
                          <div className="rounded-2xl border border-border bg-muted/10 p-4">
                            <FqText
                              as="p"
                              className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                            >
                              Estrutura para treinar
                            </FqText>
                            <FqText
                              as="p"
                              className="mt-2 text-sm text-foreground"
                            >
                              Academia {selectedStudentRouteAnamnesis.academyAccess}{" "}
                              • equipamentos em casa{" "}
                              {selectedStudentRouteAnamnesis.homeEquipment ||
                                "nao informado"}
                            </FqText>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Sem contexto clinico registrado ate o momento.
                      </FqText>
                    )}
                  </FqCard>
                </div>
              </div>

              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <FqCard
                  className="border-border bg-card shadow-sm"
                  title="Historico recente"
                  subtitle="Ultimas sessoes concluidas pelo aluno."
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
                      <FqText
                        as="p"
                        className="text-xs text-muted-foreground"
                      >
                        Sessoes concluidas
                      </FqText>
                      <FqText
                        as="p"
                        className="mt-1 text-base font-semibold text-foreground"
                      >
                        {selectedStudentRouteHistorySummary.totalSessions}
                      </FqText>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
                      <FqText
                        as="p"
                        className="text-xs text-muted-foreground"
                      >
                        Tempo medio
                      </FqText>
                      <FqText
                        as="p"
                        className="mt-1 text-base font-semibold text-foreground"
                      >
                        {selectedStudentRouteHistorySummary.averageDurationMinutes ??
                          0}{" "}
                        min
                      </FqText>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/10 px-4 py-3">
                      <FqText
                        as="p"
                        className="text-xs text-muted-foreground"
                      >
                        Adesao media
                      </FqText>
                      <FqText
                        as="p"
                        className="mt-1 text-base font-semibold text-foreground"
                      >
                        {selectedStudentRouteHistorySummary.averageCompletionRate ??
                          0}
                        %
                      </FqText>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-border bg-muted/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <FqText
                        as="p"
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Atividade nos ultimos 14 dias
                      </FqText>
                      <FqText
                        as="p"
                        className="text-xs text-muted-foreground"
                      >
                        Mais escuro = mais sessoes
                      </FqText>
                    </div>
                    <div className="mt-3">
                      <FqCalendarHeatmap
                        className="border-border bg-background"
                        data={selectedStudentRouteHistoryHeatmap.data}
                        maxValue={selectedStudentRouteHistoryHeatmap.maxValue}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {loadingStudentHistoryId === selectedStudentRoute.id &&
                    !selectedStudentRouteHistory ? (
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Carregando historico do aluno...
                      </FqText>
                    ) : selectedStudentRouteRecentSessions.length === 0 ? (
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Nenhuma sessao concluida ate agora.
                      </FqText>
                    ) : (
                      selectedStudentRouteRecentSessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className="rounded-2xl border border-border bg-muted/10 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <FqText
                                as="p"
                                className="text-sm font-semibold text-foreground"
                              >
                                {session.title}
                              </FqText>
                              <FqText
                                as="p"
                                className="text-xs text-muted-foreground"
                              >
                                {formatDateTimeLabel(session.completedAt)}
                              </FqText>
                            </div>

                            <div className="text-right text-xs text-muted-foreground">
                              <div>{Math.round(session.durationSec / 60)} min</div>
                              <div>
                                {session.completedSets}/{session.totalSets} sets
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </FqCard>

                <div className="space-y-4">
                  <FqCard
                    className="border-border bg-card shadow-sm"
                    title="Acompanhamento"
                    subtitle="Leitura rapida de adesao, carga e solicitacoes."
                  >
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-border bg-muted/10 p-4">
                        <FqText
                          as="p"
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Frequencia semanal
                        </FqText>
                        <div className="mt-3 grid items-center gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
                          <div className="flex justify-center">
                            <FqProgressRing
                              value={selectedStudentRouteFrequencyProgress}
                              size={92}
                              strokeWidth={8}
                              tone={
                                selectedStudentRouteFrequencyProgress >= 100
                                  ? "success"
                                  : selectedStudentRouteFrequencyProgress >= 70
                                    ? "primary"
                                    : "warning"
                              }
                              label="meta"
                            />
                          </div>

                          <div className="space-y-2">
                            <FqProgressBar
                              value={selectedStudentRouteFrequencyProgress}
                              tone={
                                selectedStudentRouteFrequencyProgress >= 100
                                  ? "success"
                                  : selectedStudentRouteFrequencyProgress >= 70
                                    ? "primary"
                                    : "warning"
                              }
                            />
                            <FqText
                              as="p"
                              className="text-sm text-foreground"
                            >
                              {selectedStudentRouteFrequencyMetric
                                ? `${selectedStudentRouteFrequencyMetric.completedWorkoutsThisWeek}/${selectedStudentRouteFrequencyMetric.targetWorkoutsPerWeek} concluidos na semana`
                                : "Sem metricas de frequencia ainda"}
                            </FqText>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-muted/10 p-4">
                        <FqText
                          as="p"
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Evolucao de carga
                        </FqText>
                        {selectedStudentRouteLoadMetric ? (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-medium text-foreground">
                                Atual {selectedStudentRouteLoadMetric.currentWeekAverageLoadKg} kg
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  selectedStudentRouteLoadMetric.trend === "up"
                                    ? "text-emerald-600"
                                    : selectedStudentRouteLoadMetric.trend === "down"
                                      ? "text-rose-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {selectedStudentRouteLoadMetric.deltaPct > 0
                                  ? "+"
                                  : ""}
                                {selectedStudentRouteLoadMetric.deltaPct}%
                              </span>
                            </div>

                            <div className="flex h-28 items-end gap-2">
                              {selectedStudentRouteLoadChart.points.map((point) => (
                                <div
                                  key={point.weekStart}
                                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                                >
                                  <div className="flex h-full w-full items-end rounded-xl border border-border bg-background px-2 py-2">
                                    <div
                                      className="w-full rounded-lg bg-secondary/80 transition-all"
                                      style={{ height: `${point.heightPct}%` }}
                                    />
                                  </div>
                                  <div className="text-center">
                                    <FqText
                                      as="p"
                                      className="text-[0.68rem] font-medium text-muted-foreground"
                                    >
                                      {point.label}
                                    </FqText>
                                    <FqText
                                      as="p"
                                      className="text-[0.68rem] text-foreground"
                                    >
                                      {point.averageLoadVolumeKg} kg
                                    </FqText>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <FqText
                            as="p"
                            className="mt-2 text-sm text-foreground"
                          >
                            Sem sessoes suficientes para comparar carga.
                          </FqText>
                        )}
                      </div>

                      <div className="rounded-2xl border border-border bg-muted/10 p-4">
                        <FqText
                          as="p"
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Solicitacoes de medidas
                        </FqText>
                        {selectedStudentRouteMeasurementRequests.length === 0 ? (
                          <FqText
                            as="p"
                            className="mt-2 text-sm text-muted-foreground"
                          >
                            Nenhuma solicitacao registrada.
                          </FqText>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {selectedStudentRouteMeasurementRequests
                              .slice(0, 3)
                              .map((request) => (
                                <div
                                  key={request.id}
                                  className="rounded-xl border border-border bg-card p-3"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <FqText
                                      as="p"
                                      className="text-sm font-medium text-foreground"
                                    >
                                      {formatRequestStatusLabel(request.status)}
                                    </FqText>
                                    <FqText
                                      as="p"
                                      className="text-xs text-muted-foreground"
                                    >
                                      {formatDateLabel(request.createdAt)}
                                    </FqText>
                                  </div>
                                  {request.note ? (
                                    <FqText
                                      as="p"
                                      className="mt-1 text-xs text-muted-foreground"
                                    >
                                      {request.note}
                                    </FqText>
                                  ) : null}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </FqCard>

                  <FqCard
                    className="border-border bg-card shadow-sm"
                    title="Alertas e pendencias"
                    subtitle="Itens que pedem sua atencao."
                  >
                    <div className="space-y-3">
                      {selectedStudentRouteAlerts.length === 0 &&
                      !selectedStudentRoute.requiresPasswordReset &&
                      selectedStudentRoute.anamnesisStatus === "completed" ? (
                        <FqText as="p" className="text-sm text-muted-foreground">
                          Nenhuma pendencia critica para esse aluno no momento.
                        </FqText>
                      ) : null}

                      {selectedStudentRouteAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="rounded-2xl border border-border bg-muted/10 p-4"
                        >
                          <FqText
                            as="p"
                            className={`text-sm font-semibold ${alert.severity === "danger" ? "text-rose-500" : "text-amber-500"}`}
                          >
                            {alert.type === "missed-workout"
                              ? "Faltando treino"
                              : "Baixa consistencia"}
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-1 text-sm text-muted-foreground"
                          >
                            {alert.message}
                          </FqText>
                        </div>
                      ))}

                      {selectedStudentRoute.requiresPasswordReset ? (
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-sm font-semibold text-foreground"
                          >
                            Acesso aguardando senha
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-1 text-sm text-muted-foreground"
                          >
                            O aluno ainda nao concluiu o reset da senha no
                            Firebase.
                          </FqText>
                        </div>
                      ) : null}

                      {selectedStudentRoute.anamnesisStatus !== "completed" ? (
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-sm font-semibold text-foreground"
                          >
                            Anamnese pendente
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-1 text-sm text-muted-foreground"
                          >
                            Preencha a ficha para ter contexto de saude,
                            objetivos e disponibilidade.
                          </FqText>
                        </div>
                      ) : null}
                    </div>
                  </FqCard>
                </div>
              </div>
            </div>
          ) : studentAnamnesisViewId && anamnesisStudent ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FqButton
                    variant="ghost"
                    tone="neutral"
                    leftIcon="arrowLeft"
                    onClick={handleCloseStudentAnamnesis}
                    className="min-h-11 w-11 px-0"
                    aria-label="Voltar para aluno"
                  />

                  <div>
                    <FqText
                      as="h2"
                      className="text-2xl font-semibold text-foreground"
                    >
                      Anamnese de {anamnesisStudent.name}
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Questionario inicial para apoiar a prescricao do treino e
                      manter rastreabilidade do aluno.
                    </FqText>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {anamnesisFormsByStudent[anamnesisStudent.id]?.updatedAt
                      ? `Atualizada em ${new Date(
                          anamnesisFormsByStudent[
                            anamnesisStudent.id
                          ].updatedAt as string,
                        ).toLocaleDateString("pt-BR")}`
                      : anamnesisStudent.anamnesisStatus === "pending"
                        ? "Anamnese pendente"
                        : "Ainda nao preenchida"}
                  </span>
                  <FqButton
                    onClick={() => void handleSaveStudentAnamnesis()}
                    isLoading={isSavingStudentAnamnesis}
                  >
                    Salvar anamnese
                  </FqButton>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="space-y-4">
                  <FqCard className="border-border bg-card shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <FqText
                          as="h3"
                          className="text-base font-semibold text-foreground"
                        >
                          Dados pessoais
                        </FqText>
                        <FqText
                          as="p"
                          className="text-sm text-muted-foreground"
                        >
                          Informacoes basicas para identificacao e contato.
                        </FqText>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <FqInput
                          label="Nome"
                          value={currentAnamnesisForm.fullName}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "fullName",
                              event.target.value,
                            )
                          }
                        />
                        <FqSelect
                          label="Sexo"
                          value={currentAnamnesisForm.sex}
                          onChange={(event) =>
                            updateCurrentAnamnesisField("sex", event.target.value)
                          }
                          options={anamnesisSexOptions}
                        />
                        <FqInput
                          label="Data de nascimento"
                          type="date"
                          value={currentAnamnesisForm.birthDate}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "birthDate",
                              event.target.value,
                            )
                          }
                        />
                        <FqInput
                          label="Contato"
                          value={currentAnamnesisForm.phone}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "phone",
                              event.target.value,
                            )
                          }
                        />
                        <FqInput
                          label="Email"
                          type="email"
                          value={currentAnamnesisForm.email}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "email",
                              event.target.value,
                            )
                          }
                        />
                        <FqInput
                          label="Ocupacao"
                          value={currentAnamnesisForm.occupation}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "occupation",
                              event.target.value,
                            )
                          }
                        />
                        <FqInput
                          label="Peso (kg)"
                          type="number"
                          value={currentAnamnesisForm.weight}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "weight",
                              event.target.value,
                            )
                          }
                        />
                        <FqInput
                          label="Altura (cm)"
                          type="number"
                          value={currentAnamnesisForm.height}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "height",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </FqCard>

                  <FqCard className="border-border bg-card shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <FqText
                          as="h3"
                          className="text-base font-semibold text-foreground"
                        >
                          Historico clinico
                        </FqText>
                        <FqText
                          as="p"
                          className="text-sm text-muted-foreground"
                        >
                          Riscos, lesoes, medicamentos e contexto de saude.
                        </FqText>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <FqTextarea
                          label="Doencas cronicas"
                          rows={3}
                          value={currentAnamnesisForm.chronicDiseases}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "chronicDiseases",
                              event.target.value,
                            )
                          }
                        />
                        <FqTextarea
                          label="Medicamentos em uso"
                          rows={3}
                          value={currentAnamnesisForm.medications}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "medications",
                              event.target.value,
                            )
                          }
                        />
                        <FqTextarea
                          label="Historico de lesoes"
                          rows={3}
                          value={currentAnamnesisForm.injuriesHistory}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "injuriesHistory",
                              event.target.value,
                            )
                          }
                        />
                        <FqTextarea
                          label="Historico de dores"
                          rows={3}
                          value={currentAnamnesisForm.painHistory}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "painHistory",
                              event.target.value,
                            )
                          }
                        />
                        <FqTextarea
                          label="Historico de cirurgias"
                          rows={3}
                          value={currentAnamnesisForm.surgeriesHistory}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "surgeriesHistory",
                              event.target.value,
                            )
                          }
                        />
                        <FqTextarea
                          label="Historico familiar"
                          rows={3}
                          value={currentAnamnesisForm.familyHistory}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "familyHistory",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </FqCard>

                  <FqCard className="border-border bg-card shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <FqText
                          as="h3"
                          className="text-base font-semibold text-foreground"
                        >
                          Estilo de vida e experiencia
                        </FqText>
                        <FqText
                          as="p"
                          className="text-sm text-muted-foreground"
                        >
                          Habitos, sono, alimentacao e historico com exercicios.
                        </FqText>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <FqSelect
                          label="Tabagismo"
                          value={currentAnamnesisForm.smoker}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "smoker",
                              event.target.value,
                            )
                          }
                          options={anamnesisYesNoOptions}
                        />
                        <FqSelect
                          label="Consome alcool"
                          value={currentAnamnesisForm.alcoholUse}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "alcoholUse",
                              event.target.value,
                            )
                          }
                          options={anamnesisYesNoOptions}
                        />
                        <FqInput
                          label="Qualidade do sono"
                          placeholder="Ex: dorme 6h, acorda cansado"
                          value={currentAnamnesisForm.sleepQuality}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "sleepQuality",
                              event.target.value,
                            )
                          }
                        />
                        <FqSelect
                          label="Nivel de atividade atual"
                          value={currentAnamnesisForm.lifestyleLevel}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "lifestyleLevel",
                              event.target.value as StudentAnamnesisLifestyle,
                            )
                          }
                          options={anamnesisLifestyleOptions}
                        />
                        <FqSelect
                          label="Acompanhamento com nutricionista"
                          value={currentAnamnesisForm.hasNutritionist}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "hasNutritionist",
                              event.target.value,
                            )
                          }
                          options={anamnesisYesNoOptions}
                        />
                        <FqSelect
                          label="Possui acesso a academia"
                          value={currentAnamnesisForm.academyAccess}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "academyAccess",
                              event.target.value,
                            )
                          }
                          options={anamnesisYesNoOptions}
                        />
                      </div>

                      <FqTextarea
                        label="Rotina alimentar"
                        rows={3}
                        value={currentAnamnesisForm.routineDiet}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "routineDiet",
                            event.target.value,
                          )
                        }
                      />
                      <FqTextarea
                        label="Historico com exercicios"
                        rows={4}
                        value={currentAnamnesisForm.exerciseHistory}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "exerciseHistory",
                            event.target.value,
                          )
                        }
                      />
                      <FqTextarea
                        label="Equipamentos para treinar em casa"
                        rows={3}
                        value={currentAnamnesisForm.homeEquipment}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "homeEquipment",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </FqCard>

                  <FqCard className="border-border bg-card shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <FqText
                          as="h3"
                          className="text-base font-semibold text-foreground"
                        >
                          Objetivos e preferencias
                        </FqText>
                        <FqText
                          as="p"
                          className="text-sm text-muted-foreground"
                        >
                          Metas principais e gosto do aluno para personalizacao
                          do plano.
                        </FqText>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <FqSelect
                          label="Objetivo principal"
                          value={currentAnamnesisForm.mainGoal}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "mainGoal",
                              event.target.value as StudentAnamnesisGoal,
                            )
                          }
                          options={anamnesisGoalOptions}
                        />
                        <FqInput
                          label="Tipo fisico ou foco desejado"
                          placeholder="Ex: definicao, volume, saude"
                          value={currentAnamnesisForm.preferredActivity}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "preferredActivity",
                              event.target.value,
                            )
                          }
                        />
                      </div>

                      <FqTextarea
                        label="Metas especificas"
                        rows={3}
                        value={currentAnamnesisForm.specificGoals}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "specificGoals",
                            event.target.value,
                          )
                        }
                      />
                      <FqTextarea
                        label="Tipo de treino que mais gosta"
                        rows={3}
                        value={currentAnamnesisForm.preferredTrainingStyle}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "preferredTrainingStyle",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </FqCard>

                  <FqCard className="border-border bg-card shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <FqText
                          as="h3"
                          className="text-base font-semibold text-foreground"
                        >
                          Disponibilidade semanal
                        </FqText>
                        <FqText
                          as="p"
                          className="text-sm text-muted-foreground"
                        >
                          Marque os dias em que o aluno consegue treinar e use
                          o campo abaixo para complementar com horarios ou
                          observacoes.
                        </FqText>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {anamnesisAvailabilityFields.map(({ field, label }) => (
                          <div
                            key={field}
                            className={`rounded-2xl border px-4 py-3 transition-colors ${
                              currentAnamnesisForm[field]
                                ? "border-primary/25 bg-primary/[0.04]"
                                : "border-border bg-background"
                            }`}
                          >
                            <FqCheckbox
                              className="w-full"
                              checked={currentAnamnesisForm[field]}
                              label={label}
                              onChange={(event) =>
                                updateCurrentAnamnesisField(
                                  field,
                                  event.target.checked,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <FqTextarea
                        label="Sua disponibilidade varia ou e fixa?"
                        rows={3}
                        value={currentAnamnesisForm.availabilityFlexibility}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "availabilityFlexibility",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </FqCard>
                </div>

                <div className="space-y-4">
                  <FqCard className="border-border bg-card shadow-sm">
                    <div className="space-y-3">
                      <FqText
                        as="h3"
                        className="text-base font-semibold text-foreground"
                      >
                        Resumo rapido
                      </FqText>
                      <div className="grid gap-3">
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                          >
                            Objetivo
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm font-semibold text-foreground"
                          >
                            {
                              anamnesisGoalOptions.find(
                                (option) =>
                                  option.value === currentAnamnesisForm.mainGoal,
                              )?.label
                            }
                          </FqText>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                          >
                            Nivel atual
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm font-semibold text-foreground"
                          >
                            {
                              anamnesisLifestyleOptions.find(
                                (option) =>
                                  option.value ===
                                  currentAnamnesisForm.lifestyleLevel,
                              )?.label
                            }
                          </FqText>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/10 p-4">
                          <FqText
                            as="p"
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                          >
                            Contato
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-2 text-sm text-foreground"
                          >
                            {currentAnamnesisForm.email || "Nao informado"}
                          </FqText>
                          <FqText
                            as="p"
                            className="mt-1 text-sm text-muted-foreground"
                          >
                            {currentAnamnesisForm.phone || "Sem telefone"}
                          </FqText>
                        </div>
                      </div>
                    </div>
                  </FqCard>

                  <FqCard className="border-border bg-card shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <FqText
                          as="h3"
                          className="text-base font-semibold text-foreground"
                        >
                          Termo de responsabilidade
                        </FqText>
                        <FqText
                          as="p"
                          className="text-sm text-muted-foreground"
                        >
                          O aluno confirma que as informacoes prestadas sao
                          verdadeiras.
                        </FqText>
                      </div>

                      <FqSelect
                        label="Autoriza uso de fotos para resultados"
                        value={currentAnamnesisForm.photoConsent}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "photoConsent",
                            event.target.value,
                          )
                        }
                        options={anamnesisYesNoOptions}
                      />

                      <FqInput
                        label="Assinatura do aluno"
                        placeholder="Digite o nome completo"
                        value={currentAnamnesisForm.signatureName}
                        onChange={(event) =>
                          updateCurrentAnamnesisField(
                            "signatureName",
                            event.target.value,
                          )
                        }
                      />

                      <label className="flex items-start gap-3 rounded-2xl border border-border bg-muted/10 p-4">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-border"
                          checked={currentAnamnesisForm.responsibilityAccepted}
                          onChange={(event) =>
                            updateCurrentAnamnesisField(
                              "responsibilityAccepted",
                              event.target.checked,
                            )
                          }
                        />
                        <div>
                          <FqText
                            as="p"
                            className="text-sm font-semibold text-foreground"
                          >
                            Confirmacao do termo
                          </FqText>
                          <FqText
                            as="p"
                            className="text-sm text-muted-foreground"
                          >
                            Declaro que as informacoes desta anamnese sao
                            verdadeiras e posso ser orientado com base nelas.
                          </FqText>
                        </div>
                      </label>

                      <div className="flex flex-col gap-2">
                        <FqButton
                          onClick={() => void handleSaveStudentAnamnesis()}
                          isLoading={isSavingStudentAnamnesis}
                        >
                          Salvar anamnese
                        </FqButton>
                        <FqButton
                          variant="outline"
                          tone="neutral"
                          onClick={handleCloseStudentAnamnesis}
                        >
                          Voltar para aluno
                        </FqButton>
                      </div>
                    </div>
                  </FqCard>
                </div>
              </div>
            </div>
          ) : studentWorkoutsViewId ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FqButton
                    variant="ghost"
                    tone="neutral"
                    leftIcon="arrowLeft"
                    onClick={handleCloseStudentWorkouts}
                    className="min-h-11 w-11 px-0"
                    aria-label="Voltar para aluno"
                  />

                  <div>
                    <FqText
                      as="h2"
                      className="text-2xl font-semibold text-foreground"
                    >
                      Treinos de {studentWorkoutsViewName}
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Total de {studentWorkoutsActiveCount} treino
                      {studentWorkoutsActiveCount !== 1 ? "s" : ""} ativo
                      {studentWorkoutsActiveCount !== 1 ? "s" : ""}
                      {studentWorkoutsViewEmail
                        ? ` • ${studentWorkoutsViewEmail}`
                        : ""}
                    </FqText>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <FqButton
                    variant="outline"
                    tone="neutral"
                    onClick={() =>
                      openWorkoutFiltersForStudent(studentWorkoutsViewId)
                    }
                  >
                    Abrir em Treinos Gerais
                  </FqButton>
                  <FqButton
                    leftIcon="plus"
                    onClick={() =>
                      handleCreateWorkoutForStudent(studentWorkoutsViewId)
                    }
                  >
                    Criar novo treino
                  </FqButton>
                </div>
              </div>

              <div className="max-w-md">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <FqInput
                      leftIcon="search"
                      placeholder="Buscar nos treinos"
                      value={studentWorkoutSearch}
                      onChange={(event) =>
                        setStudentWorkoutSearch(event.target.value)
                      }
                    />
                  </div>
                  <FqButton
                    variant="outline"
                    tone="neutral"
                    onClick={openWorkoutFiltersPanel}
                    className="w-full sm:w-auto"
                  >
                    Filtros
                    {workoutAdvancedFilterCount > 0
                      ? ` (${workoutAdvancedFilterCount})`
                      : ""}
                  </FqButton>
                </div>
              </div>

              {hasAdvancedWorkoutFilters ? (
                <div className="flex flex-wrap items-center gap-2">
                  {workoutFiltersSummary.map((item) => (
                    <span
                      key={`student-${item}`}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary transition hover:opacity-80"
                    onClick={resetWorkoutAdvancedFilters}
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : null}

              {workoutFiltersOverlay}

              {studentWorkoutsForView.length === 0 ? (
                <FqCard className="border-border bg-card">
                  <FqText as="p" className="text-sm text-muted-foreground">
                    Nenhum treino atribuido para esse aluno ainda.
                  </FqText>
                </FqCard>
              ) : filteredStudentWorkoutsForView.length === 0 ? (
                <FqCard className="border-border bg-card">
                  <FqText as="p" className="text-sm text-muted-foreground">
                    Nenhum treino encontrado para essa busca.
                  </FqText>
                </FqCard>
              ) : (
                <>
                  <div className="space-y-4 md:hidden">
                    {studentWorkoutsByWeekday.map((section) => (
                      <div key={section.id} className="space-y-3">
                        <WorkoutDaySectionHeader
                          label={section.label}
                          count={section.workouts.length}
                        />

                        {section.workouts.length === 0 ? (
                          <WorkoutDayOffState label={section.label} />
                        ) : (
                          <div className="grid gap-3">
                            {section.workouts.map((workout) => {
                            const statusMeta = resolveWorkoutStatusMeta(workout);
                            const isExpanded =
                              expandedStudentWorkoutIds.includes(workout.id);

                            return (
                              <article
                                key={workout.id}
                                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <FqText
                                        as="h3"
                                        className="text-base font-semibold text-foreground"
                                      >
                                        {workout.title}
                                      </FqText>
                                      <FqText
                                        as="p"
                                        className="text-sm text-muted-foreground"
                                      >
                                        {workout.description || "Sem descricao"}
                                      </FqText>
                                    </div>
                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                      {resolveWorkoutIntensityLabel(workout)}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {(workout.muscleGroups ?? [])
                                      .slice(0, 4)
                                      .map((group) => (
                                        <span
                                          key={`${workout.id}-${group}`}
                                          className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                                        >
                                          {group}
                                        </span>
                                      ))}
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                                      <FqText
                                        as="p"
                                        className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                                      >
                                        Exercicios
                                      </FqText>
                                      <FqText
                                        as="p"
                                        className="mt-2 text-sm font-semibold text-foreground"
                                      >
                                        {workout.exercisesCount} exercicios
                                      </FqText>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                                      <FqText
                                        as="p"
                                        className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                                      >
                                        Duracao
                                      </FqText>
                                      <FqText
                                        as="p"
                                        className="mt-2 text-sm font-semibold text-foreground"
                                      >
                                        {workout.estimatedDurationMin ?? 0} min
                                      </FqText>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                      <FqIcon name="star" size={14} />
                                      {workout.starsReward ?? 0} estrelas
                                    </span>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}
                                    >
                                      {statusMeta.label}
                                    </span>
                                  </div>

                                  {isExpanded ? (
                                    <div className="rounded-xl border border-border bg-muted/10 p-3">
                                      <FqText
                                        as="p"
                                        className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                      >
                                        Exercicios
                                      </FqText>
                                      {workout.exercises && workout.exercises.length > 0 ? (
                                        <ul className="space-y-1.5">
                                          {workout.exercises.map((exercise, exIdx) => (
                                            <li
                                              key={exercise.id}
                                              className="flex items-start gap-2"
                                            >
                                              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-success/15 text-[0.65rem] font-semibold text-success">
                                                {exIdx + 1}
                                              </span>
                                              <div>
                                                <FqText
                                                  as="p"
                                                  className="text-sm font-medium text-foreground"
                                                >
                                                  {exercise.name}
                                                </FqText>
                                                <FqText
                                                  as="p"
                                                  className="text-xs text-muted-foreground"
                                                >
                                                  {exercise.sets}x{exercise.reps} •{" "}
                                                  {exercise.restSec ?? 60}s descanso •{" "}
                                                  {exercise.suggestedLoadKg}kg
                                                </FqText>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <FqText
                                          as="p"
                                          className="text-sm text-muted-foreground"
                                        >
                                          Nenhum exercicio detalhado foi cadastrado.
                                        </FqText>
                                      )}
                                    </div>
                                  ) : null}

                                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
                                      onClick={() =>
                                        toggleStudentWorkoutExpanded(workout.id)
                                      }
                                    >
                                      {isExpanded ? "Ocultar exercicios" : "Ver exercicios"}
                                      <FqIcon
                                        name={isExpanded ? "chevronUp" : "chevronDown"}
                                        size={14}
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
                                      onClick={() => selectWorkoutForDetails(workout)}
                                    >
                                      Ver detalhes
                                      <FqIcon name="chevronRight" size={14} />
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="hidden gap-5 md:grid">
                    {studentWorkoutsByWeekday.map((section) => (
                      <div key={section.id} className="space-y-3">
                        <WorkoutDaySectionHeader
                          label={section.label}
                          count={section.workouts.length}
                        />

                        {section.workouts.length === 0 ? (
                          <WorkoutDayOffState label={section.label} />
                        ) : (
                          <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
                            {section.workouts.map((workout) => {
                            const statusMeta = resolveWorkoutStatusMeta(workout);
                            const isExpanded =
                              expandedStudentWorkoutIds.includes(workout.id);

                            return (
                              <Fragment key={workout.id}>
                                <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <FqText
                                          as="h3"
                                          className="text-lg font-semibold text-foreground"
                                        >
                                          {workout.title}
                                        </FqText>
                                        <FqText
                                          as="p"
                                          className="text-sm text-muted-foreground"
                                        >
                                          {workout.description || "Sem descricao"}
                                        </FqText>
                                      </div>
                                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                        {resolveWorkoutIntensityLabel(workout)}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {(workout.muscleGroups ?? [])
                                        .slice(0, 4)
                                        .map((group) => (
                                          <span
                                            key={`${workout.id}-${group}`}
                                            className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                                          >
                                            {group}
                                          </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <FqIcon name="list" size={14} />
                                        {workout.exercisesCount} exercicios
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <FqIcon name="star" size={14} />
                                        {workout.starsReward ?? 0} estrelas
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <FqIcon name="clock" size={14} />
                                        {workout.estimatedDurationMin ?? 0} min
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}
                                      >
                                        {statusMeta.label}
                                      </span>
                                      <div className="flex items-center gap-3">
                                        <button
                                          type="button"
                                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
                                          onClick={() =>
                                            toggleStudentWorkoutExpanded(workout.id)
                                          }
                                        >
                                          {isExpanded ? "Ocultar exercicios" : "Ver exercicios"}
                                          <FqIcon
                                            name={isExpanded ? "chevronUp" : "chevronDown"}
                                            size={14}
                                          />
                                        </button>
                                        <button
                                          type="button"
                                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
                                          onClick={() =>
                                            selectWorkoutForDetails(workout)
                                          }
                                        >
                                          Ver detalhes
                                          <FqIcon name="chevronRight" size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </article>

                                {isExpanded ? (
                                  <FqCard className="border-border bg-muted/10 sm:col-span-2 2xl:col-span-3">
                                    <div className="space-y-3">
                                      <FqText
                                        as="p"
                                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                      >
                                        Exercicios da ficha
                                      </FqText>
                                      {workout.exercises && workout.exercises.length > 0 ? (
                                        <div className="grid gap-2 xl:grid-cols-2">
                                          {workout.exercises.map((exercise, exIdx) => (
                                            <div
                                              key={exercise.id}
                                              className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3"
                                            >
                                              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-semibold text-success">
                                                {exIdx + 1}
                                              </span>
                                              <div>
                                                <FqText
                                                  as="p"
                                                  className="text-sm font-medium text-foreground"
                                                >
                                                  {exercise.name}
                                                </FqText>
                                                <FqText
                                                  as="p"
                                                  className="text-xs text-muted-foreground"
                                                >
                                                  {exercise.sets}x{exercise.reps} •{" "}
                                                  {exercise.restSec ?? 60}s descanso •{" "}
                                                  {exercise.suggestedLoadKg}kg
                                                </FqText>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <FqText
                                          as="p"
                                          className="text-sm text-muted-foreground"
                                        >
                                          Nenhum exercicio detalhado foi cadastrado.
                                        </FqText>
                                      )}
                                    </div>
                                  </FqCard>
                                ) : null}
                              </Fragment>
                            );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <FqText
                    as="h2"
                    className="text-2xl font-semibold text-foreground"
                  >
                    Alunos vinculados
                  </FqText>
                  <FqText as="p" className="text-sm text-muted-foreground">
                    Acompanhe metas e carga ativa dos seus alunos.
                  </FqText>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
                  {filteredStudents.length} de {overview.students.length} alunos
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <FqInput
                    leftIcon="search"
                    placeholder="Buscar por nome ou email..."
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                  />
                  <FqSelect
                    value={studentStatusFilter}
                    onChange={(event) =>
                      setStudentStatusFilter(
                        event.target.value as StudentStatusFilter,
                      )
                    }
                    options={studentStatusFilterOptions}
                  />
                </div>
                <div className="flex items-center justify-start xl:justify-end">
                  <FqButton leftIcon="plus" onClick={openStudentRegistrationModal}>
                    Adicionar aluno
                  </FqButton>
                </div>
              </div>

              <div className="grid gap-3 md:hidden sm:grid-cols-2">
                <FqSelect
                  label="Ordenar por"
                  value={studentSortBy}
                  onChange={(event) =>
                    setStudentSortBy(event.target.value as StudentSortBy)
                  }
                  options={studentSortOptions}
                  size="sm"
                />
                <FqSelect
                  label="Direcao"
                  value={studentSortDirection}
                  onChange={(event) =>
                    setStudentSortDirection(event.target.value as SortDirection)
                  }
                  options={sortDirectionOptions}
                  size="sm"
                />
              </div>

              <FqModal
                open={isStudentRegistrationModalOpen}
                onOpenChange={setIsStudentRegistrationModalOpen}
                title="Cadastrar aluno"
                description="Escolha como deseja iniciar o onboarding do aluno."
                footer={
                  <div className="flex flex-wrap justify-end gap-2">
                    <FqButton
                      variant="outline"
                      tone="neutral"
                      onClick={() => setIsStudentRegistrationModalOpen(false)}
                    >
                      Fechar
                    </FqButton>
                  </div>
                }
              >
                <div className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setStudentRegistrationMode("invite")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        studentRegistrationMode === "invite"
                          ? "border-primary bg-primary/8"
                          : "border-border bg-card"
                      }`}
                    >
                      <FqText
                        as="p"
                        className="text-sm font-semibold text-foreground"
                      >
                        Enviar link
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                        O aluno cria a propria conta e entra com anamnese pendente.
                      </FqText>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentRegistrationMode("direct")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        studentRegistrationMode === "direct"
                          ? "border-primary bg-primary/8"
                          : "border-border bg-card"
                      }`}
                    >
                      <FqText
                        as="p"
                        className="text-sm font-semibold text-foreground"
                      >
                        Cadastrar agora
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                        O personal cria a conta e o aluno redefine a senha depois.
                      </FqText>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStudentRegistrationMode("direct-with-anamnesis")
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        studentRegistrationMode === "direct-with-anamnesis"
                          ? "border-primary bg-primary/8"
                          : "border-border bg-card"
                      }`}
                    >
                      <FqText
                        as="p"
                        className="text-sm font-semibold text-foreground"
                      >
                        Cadastrar e iniciar anamnese
                      </FqText>
                      <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                        Cria a conta, envia reset de senha e ja abre a ficha.
                      </FqText>
                    </button>
                  </div>

                  {studentRegistrationMode === "invite" ? (
                    <div className="space-y-3 rounded-2xl border border-border bg-muted/10 p-4">
                      <FqText as="p" className="text-sm text-muted-foreground">
                        O convite leva o aluno para o cadastro publico do FitQuest
                        como `Aluno`. Depois do cadastro, a anamnese fica marcada
                        como pendente para o personal concluir.
                      </FqText>
                      <FqButton
                        onClick={() => void handleGenerateStudentInviteLink()}
                        isLoading={isGeneratingStudentInviteLink}
                      >
                        Gerar link de cadastro
                      </FqButton>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <FqInput
                        label="Nome do aluno"
                        value={newStudentName}
                        onChange={(event) => setNewStudentName(event.target.value)}
                      />
                      <FqInput
                        label="E-mail do aluno"
                        type="email"
                        value={newStudentEmail}
                        onChange={(event) => setNewStudentEmail(event.target.value)}
                      />
                      <FqText as="p" className="text-sm text-muted-foreground">
                        O sistema cria a conta com senha temporaria e envia o link
                        de redefinicao via Firebase para o aluno.
                      </FqText>
                      <FqButton
                        onClick={() =>
                          void handleCreateStudentDirectly(
                            studentRegistrationMode ===
                              "direct-with-anamnesis"
                              ? "direct-with-anamnesis"
                              : "direct",
                          )
                        }
                        isLoading={isCreatingStudentAccount}
                      >
                        {studentRegistrationMode === "direct-with-anamnesis"
                          ? "Cadastrar e abrir anamnese"
                          : "Cadastrar aluno"}
                      </FqButton>
                    </div>
                  )}
                </div>
              </FqModal>

              {studentInviteLink ? (
                <FqCard className="border-border bg-card shadow-sm">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <FqText
                        as="p"
                        className="text-sm font-semibold text-foreground"
                      >
                        Link de convite gerado
                      </FqText>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        Codigo: {studentInviteCode}
                      </span>
                    </div>
                    <FqInput readOnly value={studentInviteLink} />
                    <div className="flex flex-wrap gap-2">
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="neutral"
                        leftIcon="copy"
                        onClick={() => void handleCopyInviteLink()}
                      >
                        Copiar link
                      </FqButton>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        O aluno deve abrir o link, criar a conta e seguir para o
                        onboarding com anamnese pendente.
                      </FqText>
                    </div>
                  </div>
                </FqCard>
              ) : null}

              {overview.students.length === 0 ? (
                <FqCard className="border-border bg-card">
                  <FqText as="p" className="text-sm text-muted-foreground">
                    Nenhum aluno vinculado ao seu perfil no momento.
                  </FqText>
                </FqCard>
              ) : (
                <>
                  {filteredStudents.length === 0 ? (
                    <FqCard className="border-border bg-card md:hidden">
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Nenhum aluno encontrado para os filtros aplicados.
                      </FqText>
                    </FqCard>
                  ) : (
                    <div className="space-y-3 md:hidden">
                      {filteredStudents.map((student) => (
                        <FqCard
                          key={student.id}
                          className="border-border bg-card shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <FqText
                                  as="p"
                                  className="truncate text-sm font-semibold text-foreground"
                                >
                                  {student.name}
                                </FqText>
                                <FqText
                                  as="p"
                                  className="mt-0.5 break-all text-xs text-muted-foreground"
                                >
                                  {student.email}
                                </FqText>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[0.68rem] font-semibold ${student.activeWorkouts > 0 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                              >
                                {student.activeWorkouts > 0
                                  ? `${student.activeWorkouts} ativo${student.activeWorkouts > 1 ? "s" : ""}`
                                  : "Sem ativos"}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-[0.68rem] font-semibold ${
                                  student.anamnesisStatus === "completed"
                                    ? "bg-success/20 text-success"
                                    : student.anamnesisStatus === "pending"
                                      ? "bg-warning/20 text-warning"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {student.anamnesisStatus === "completed"
                                  ? "Anamnese completa"
                                  : student.anamnesisStatus === "pending"
                                    ? "Anamnese pendente"
                                    : "Sem anamnese"}
                              </span>
                              {student.requiresPasswordReset ? (
                                <span className="rounded-full bg-secondary/15 px-2 py-1 text-[0.68rem] font-semibold text-secondary">
                                  Reset de senha pendente
                                </span>
                              ) : null}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-2xl border border-border/70 bg-muted/10 px-3 py-2.5">
                                <FqText
                                  as="p"
                                  className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                                >
                                  Meta semanal
                                </FqText>
                                <FqText
                                  as="p"
                                  className="mt-2 text-sm font-semibold text-foreground"
                                >
                                  {student.workoutsPerWeekTarget} treinos
                                </FqText>
                              </div>

                              <div className="rounded-2xl border border-border/70 bg-muted/10 px-3 py-2.5">
                                <FqText
                                  as="p"
                                  className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                                >
                                  Treinos ativos
                                </FqText>
                                <FqText
                                  as="p"
                                  className="mt-2 text-sm font-semibold text-foreground"
                                >
                                  {student.activeWorkouts}
                                </FqText>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <FqButton
                                size="sm"
                                variant="outline"
                                tone="neutral"
                                className="w-full"
                                onClick={() =>
                                  handleOpenStudentDashboardActions(student.id)
                                }
                              >
                                Abrir aluno
                              </FqButton>
                            </div>
                          </div>
                        </FqCard>
                      ))}
                    </div>
                  )}

                  <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="border-b border-border bg-muted/20">
                          <tr>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-left"
                                onClick={() => toggleStudentSort("name")}
                              >
                                Nome
                                <FqIcon
                                  name={
                                    studentSortBy === "name" &&
                                    studentSortDirection === "asc"
                                      ? "chevronUp"
                                      : "chevronDown"
                                  }
                                  size={14}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-left"
                                onClick={() => toggleStudentSort("email")}
                              >
                                Email
                                <FqIcon
                                  name={
                                    studentSortBy === "email" &&
                                    studentSortDirection === "asc"
                                      ? "chevronUp"
                                      : "chevronDown"
                                  }
                                  size={14}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-left"
                                onClick={() => toggleStudentSort("target")}
                              >
                                Meta semanal
                                <FqIcon
                                  name={
                                    studentSortBy === "target" &&
                                    studentSortDirection === "asc"
                                      ? "chevronUp"
                                      : "chevronDown"
                                  }
                                  size={14}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-left"
                                onClick={() => toggleStudentSort("active")}
                              >
                                Treinos ativos
                                <FqIcon
                                  name={
                                    studentSortBy === "active" &&
                                    studentSortDirection === "asc"
                                      ? "chevronUp"
                                      : "chevronDown"
                                  }
                                  size={14}
                                />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Anamnese
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Detalhe
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-6 text-sm text-muted-foreground"
                              >
                                Nenhum aluno encontrado para os filtros
                                aplicados.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((student) => (
                              <tr
                                key={student.id}
                                className="border-b border-border last:border-b-0"
                              >
                                <td className="px-4 py-2.5">
                                  <FqText
                                    as="p"
                                    className="text-sm font-semibold text-foreground"
                                  >
                                    {student.name}
                                  </FqText>
                                </td>
                                <td className="px-4 py-2.5 text-sm text-muted-foreground">
                                  {student.email}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[0.72rem] font-semibold text-muted-foreground">
                                    {student.workoutsPerWeekTarget} treinos
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${student.activeWorkouts > 0 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                                  >
                                    {student.activeWorkouts}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-wrap gap-2">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${
                                        student.anamnesisStatus === "completed"
                                          ? "bg-success/20 text-success"
                                          : student.anamnesisStatus === "pending"
                                            ? "bg-warning/20 text-warning"
                                            : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {student.anamnesisStatus === "completed"
                                        ? "Completa"
                                        : student.anamnesisStatus === "pending"
                                          ? "Pendente"
                                          : "Nao iniciada"}
                                    </span>
                                    {student.requiresPasswordReset ? (
                                      <span className="rounded-full bg-secondary/15 px-2 py-1 text-xs font-semibold text-secondary">
                                        Reset
                                      </span>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <FqButton
                                    size="sm"
                                    variant="outline"
                                    tone="neutral"
                                    onClick={() =>
                                      handleOpenStudentDashboardActions(student.id)
                                    }
                                  >
                                    Abrir
                                  </FqButton>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : null}

      {tab === "workouts" ? (
        isCreatingWorkoutFlow ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-row gap-2">
                  <FqIcon
                    className="cursor-pointer "
                    name="arrowLeft"
                    size={28}
                    onClick={() => {
                      setIsCreatingWorkoutFlow(false);
                      setPrefilledStudentId("");
                      clearWorkoutCreateMode();
                    }}
                  />
                  <div className="">
                    <FqText
                      as="h2"
                      className="text-2xl font-semibold text-foreground"
                    >
                      Criar Treino
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Monte uma nova ficha e depois atribua para aluno ou salve
                      na base pessoal.
                    </FqText>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <PersonalWorkoutWizardCard
                onCreateWorkout={createWorkout}
                isCreatingWorkout={isCreatingWorkout}
                studentOptions={studentOptions}
                prefilledStudentId={prefilledStudentId}
                onCreated={() => {
                  setIsCreatingWorkoutFlow(false);
                  setPrefilledStudentId("");
                  clearWorkoutCreateMode();
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!selectedWorkoutId ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <FqText
                      as="h2"
                      className="text-2xl font-semibold text-foreground"
                    >
                      Fichas de Treino
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Crie e gerencie seus treinos.
                    </FqText>
                  </div>
                  <FqButton
                    leftIcon="plus"
                    onClick={() => {
                      setPrefilledStudentId(
                        workoutStudentFilter === "all"
                          ? ""
                          : workoutStudentFilter,
                      );
                      setIsCreatingWorkoutFlow(true);
                    }}
                  >
                    Criar Treino
                  </FqButton>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex-1">
                    <FqInput
                      leftIcon="search"
                      placeholder="Buscar treino..."
                      value={workoutSearch}
                      onChange={(event) => setWorkoutSearch(event.target.value)}
                    />
                  </div>
                  <div className="w-full lg:w-[280px]">
                    <FqSelect
                      value={workoutStudentFilter}
                      onChange={(event) =>
                        updateWorkoutStudentFilter(event.target.value)
                      }
                      options={workoutStudentFilterOptions}
                    />
                  </div>
                  <FqButton
                    variant="outline"
                    tone="neutral"
                    onClick={openWorkoutFiltersPanel}
                    className="w-full lg:w-auto"
                  >
                    Filtros
                    {workoutAdvancedFilterCount > 0
                      ? ` (${workoutAdvancedFilterCount})`
                      : ""}
                  </FqButton>
                  <div className="flex flex-wrap gap-2">
                    {workoutFilterOptions.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={`
                          rounded-xl border px-4 py-2 text-sm font-semibold transition
                          ${workoutFilter === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}
                        `}
                        onClick={() => setWorkoutFilter(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {workoutStudentFilter !== "all" || hasAdvancedWorkoutFilters ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {workoutStudentFilter !== "all" ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Aluno: {workoutStudentFilterLabel}
                      </span>
                    ) : null}
                    {workoutFiltersSummary.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                    {workoutStudentFilter !== "all" ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-primary transition hover:opacity-80"
                        onClick={() => updateWorkoutStudentFilter("all")}
                      >
                        Limpar aluno
                      </button>
                    ) : null}
                    {hasAdvancedWorkoutFilters ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-primary transition hover:opacity-80"
                        onClick={resetWorkoutAdvancedFilters}
                      >
                        Limpar filtros
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {workoutFiltersOverlay}

                {filteredWorkouts.length === 0 ? (
                  <FqCard className="border-border bg-card">
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Nenhuma ficha encontrada para os filtros aplicados.
                    </FqText>
                  </FqCard>
                ) : (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {filteredWorkouts.map((workout) => {
                      const statusMeta = resolveWorkoutStatusMeta(workout);
                      return (
                        <article
                          key={workout.id}
                          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <FqText
                                  as="h3"
                                  className="text-lg font-semibold text-foreground"
                                >
                                  {workout.title}
                                </FqText>
                                <FqText
                                  as="p"
                                  className="text-sm text-muted-foreground"
                                >
                                  {workout.description || "Sem descricao"}
                                </FqText>
                              </div>
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                {resolveWorkoutIntensityLabel(workout)}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {(workout.muscleGroups ?? [])
                                .slice(0, 4)
                                .map((group) => (
                                  <span
                                    key={`${workout.id}-${group}`}
                                    className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                                  >
                                    {group}
                                  </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <FqIcon name="list" size={14} />
                                {workout.exercisesCount} exercicios
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <FqIcon name="star" size={14} />
                                {workout.starsReward ?? 0} estrelas
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <FqIcon name="clock" size={14} />
                                {workout.estimatedDurationMin ?? 0} min
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-border pt-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}
                              >
                                {statusMeta.label}
                              </span>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
                                onClick={() => selectWorkoutForDetails(workout)}
                              >
                                Ver detalhes
                                <FqIcon name="chevronRight" size={14} />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}

            {selectedWorkoutId && selectedWorkout ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <FqButton
                    variant="outline"
                    tone="neutral"
                    leftIcon="arrowLeft"
                    onClick={closeWorkoutDetails}
                    className="min-h-11 px-5 text-base font-semibold"
                  >
                    Voltar para fichas
                  </FqButton>

                  {isEditingWorkoutDetails ? (
                    <div className="flex flex-wrap gap-2">
                      <FqButton
                        variant="outline"
                        tone="neutral"
                        onClick={() => {
                          selectWorkoutForDetails(selectedWorkout);
                        }}
                        className="min-h-11 px-5 text-base font-semibold"
                      >
                        Cancelar
                      </FqButton>
                      <FqButton
                        onClick={() => void handleEditWorkout()}
                        isLoading={isUpdatingWorkout}
                        className="min-h-11 px-5 text-base font-semibold"
                      >
                        Salvar alteracoes
                      </FqButton>
                    </div>
                  ) : (
                    <FqButton
                      tone="secondary"
                      leftIcon="file"
                      onClick={() => setIsEditingWorkoutDetails(true)}
                      className="min-h-11 px-6 text-base font-semibold"
                    >
                      Editar ficha
                    </FqButton>
                  )}
                </div>

                <FqCard className="border-border bg-card">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <FqText
                          as="h3"
                          className="text-3xl font-semibold text-foreground"
                        >
                          {selectedWorkout.title}
                        </FqText>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resolveWorkoutStatusMeta(selectedWorkout).className}`}
                        >
                          {resolveWorkoutStatusMeta(selectedWorkout).label}
                        </span>
                      </div>
                      <FqText
                        as="p"
                        className="text-base text-muted-foreground"
                      >
                        {selectedWorkout.description ||
                          "Sem descricao cadastrada"}
                      </FqText>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-border bg-muted/15 p-3">
                        <FqText
                          as="p"
                          className="text-xs text-muted-foreground"
                        >
                          Estrelas
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-1 text-2xl font-semibold text-warning"
                        >
                          {selectedWorkout.starsReward ?? 0}
                        </FqText>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/15 p-3">
                        <FqText
                          as="p"
                          className="text-xs text-muted-foreground"
                        >
                          Minutos
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-1 text-2xl font-semibold text-primary"
                        >
                          {selectedWorkout.estimatedDurationMin ?? 0}
                        </FqText>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/15 p-3">
                        <FqText
                          as="p"
                          className="text-xs text-muted-foreground"
                        >
                          Exercicios
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-1 text-2xl font-semibold text-success"
                        >
                          {selectedWorkout.exercisesCount}
                        </FqText>
                      </div>
                      <div className="rounded-2xl border border-border bg-muted/15 p-3">
                        <FqText
                          as="p"
                          className="text-xs text-muted-foreground"
                        >
                          Destino
                        </FqText>
                        <FqText
                          as="p"
                          className="mt-1 text-sm font-semibold text-foreground"
                        >
                          {selectedWorkout.assignmentScope === "personal"
                            ? "Base pessoal"
                            : selectedWorkout.studentName}
                        </FqText>
                      </div>
                    </div>

                    {isEditingWorkoutDetails ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <FqInput
                          label="Nome"
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(event.target.value)
                          }
                        />
                        <FqInput
                          label="Descricao"
                          value={editingDescription}
                          onChange={(event) =>
                            setEditingDescription(event.target.value)
                          }
                        />
                        <FqInput
                          label="Data"
                          type="date"
                          value={editingDate}
                          onChange={(event) =>
                            setEditingDate(event.target.value)
                          }
                        />
                        <FqInput
                          label="Frequencia semanal"
                          type="number"
                          min={1}
                          max={14}
                          value={editingFrequencyWeekly}
                          onChange={(event) =>
                            setEditingFrequencyWeekly(event.target.value)
                          }
                        />
                        <FqSelect
                          label="Intensidade"
                          value={editingIntensity}
                          onChange={(event) =>
                            setEditingIntensity(
                              event.target.value as PersonalWorkoutIntensity,
                            )
                          }
                          options={workoutIntensityOptions}
                        />
                        <FqInput
                          label="Estrelas (50-200)"
                          type="number"
                          min={50}
                          max={200}
                          value={editingStarsReward}
                          onChange={(event) =>
                            setEditingStarsReward(event.target.value)
                          }
                        />
                        <FqInput
                          label="Duracao estimada (min)"
                          type="number"
                          min={10}
                          max={240}
                          value={editingEstimatedDurationMin}
                          onChange={(event) =>
                            setEditingEstimatedDurationMin(event.target.value)
                          }
                        />
                      </div>
                    ) : null}

                    <div className="rounded-2xl border border-border bg-muted/10 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <FqText
                            as="p"
                            className="text-sm font-semibold text-foreground"
                          >
                            Grupos musculares 12
                          </FqText>
                          <div className="flex flex-wrap gap-2">
                            {workoutMuscleGroupOptions.map((option) => {
                              const isSelected = editingMuscleGroups.includes(
                                option.value,
                              );
                              if (!isEditingWorkoutDetails && !isSelected) {
                                return null;
                              }
                              return (
                                <button
                                  type="button"
                                  key={option.value}
                                  onClick={() =>
                                    isEditingWorkoutDetails &&
                                    toggleEditingMuscleGroup(option.value)
                                  }
                                  className={`
                                  rounded-full px-3 py-1 text-xs font-semibold transition
                                  ${isSelected ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}
                                  ${isEditingWorkoutDetails ? "cursor-pointer hover:opacity-85" : "cursor-default"}
                                `}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                            {!isEditingWorkoutDetails &&
                            editingMuscleGroups.length === 0 ? (
                              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                Sem grupos definidos
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <FqText
                            as="p"
                            className="text-sm font-semibold text-foreground"
                          >
                            Dias da semana
                          </FqText>
                          <div className="flex flex-wrap gap-1.5">
                            {weekdayOrder.map((weekday) => {
                              const isSelected =
                                editingWeekdays.includes(weekday);
                              return (
                                <button
                                  type="button"
                                  key={`${selectedWorkout.id}-${weekday}-details`}
                                  onClick={() =>
                                    isEditingWorkoutDetails &&
                                    toggleEditingWeekday(weekday)
                                  }
                                  className={`
                                  inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition
                                  ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                                  ${isEditingWorkoutDetails ? "cursor-pointer hover:opacity-85" : "cursor-default"}
                                `}
                                >
                                  {weekdayCompactLabelMap[weekday]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <FqText
                          as="p"
                          className="text-base font-semibold text-foreground"
                        >
                          Exercicios ({editingExercises.length})
                        </FqText>
                        {isEditingWorkoutDetails ? (
                          <FqButton
                            size="sm"
                            variant="outline"
                            tone="secondary"
                            leftIcon="plus"
                            onClick={addEmptyExercise}
                          >
                            Adicionar
                          </FqButton>
                        ) : null}
                      </div>

                      {editingExercises.length === 0 ? (
                        <div className="p-4">
                          <FqText
                            as="p"
                            className="text-sm text-muted-foreground"
                          >
                            Nenhum exercicio cadastrado.
                          </FqText>
                        </div>
                      ) : (
                        <ul className="divide-y divide-border">
                          {editingExercises.map((exercise, index) => (
                            <li
                              key={exercise.id}
                              draggable={isEditingWorkoutDetails}
                              onDragStart={(event) => {
                                if (!isEditingWorkoutDetails) {
                                  return;
                                }
                                event.dataTransfer.effectAllowed = "move";
                                setDraggingExerciseId(exercise.id);
                              }}
                              onDragOver={(event) => {
                                if (!isEditingWorkoutDetails) {
                                  return;
                                }
                                event.preventDefault();
                                if (
                                  draggingExerciseId &&
                                  draggingExerciseId !== exercise.id
                                ) {
                                  setDragOverExerciseId(exercise.id);
                                }
                              }}
                              onDrop={(event) => {
                                if (!isEditingWorkoutDetails) {
                                  return;
                                }
                                event.preventDefault();
                                if (draggingExerciseId) {
                                  moveEditingExercise(
                                    draggingExerciseId,
                                    exercise.id,
                                  );
                                }
                                setDraggingExerciseId(null);
                                setDragOverExerciseId(null);
                              }}
                              onDragEnd={() => {
                                setDraggingExerciseId(null);
                                setDragOverExerciseId(null);
                              }}
                              className={`
                              px-4 py-3 transition-colors
                              ${dragOverExerciseId === exercise.id ? "bg-primary/5" : ""}
                            `}
                            >
                              {isEditingWorkoutDetails ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-muted text-muted-foreground"
                                      aria-label="Arrastar exercicio"
                                    >
                                      <FqIcon name="list" size={14} />
                                    </button>
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                                      {index + 1}
                                    </span>
                                    <div className="flex-1">
                                      <FqInput
                                        label="Nome do exercicio"
                                        size="sm"
                                        value={exercise.name}
                                        onChange={(event) =>
                                          setEditingExercises((current) =>
                                            current.map((item) =>
                                              item.id === exercise.id
                                                ? {
                                                    ...item,
                                                    name: event.target.value,
                                                  }
                                                : item,
                                            ),
                                          )
                                        }
                                      />
                                    </div>
                                    <FqIconButton
                                      icon="trash"
                                      label="Remover exercicio"
                                      tone="danger"
                                      onClick={() =>
                                        setEditingExercises((current) =>
                                          current.filter(
                                            (item) => item.id !== exercise.id,
                                          ),
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                                    <FqInput
                                      label="Series"
                                      size="sm"
                                      type="number"
                                      min={1}
                                      max={8}
                                      value={exercise.sets}
                                      onChange={(event) =>
                                        updateEditingExerciseNumeric(
                                          exercise.id,
                                          "sets",
                                          event.target.value,
                                        )
                                      }
                                    />
                                    <FqInput
                                      label="Reps"
                                      size="sm"
                                      type="number"
                                      min={1}
                                      max={30}
                                      value={exercise.reps}
                                      onChange={(event) =>
                                        updateEditingExerciseNumeric(
                                          exercise.id,
                                          "reps",
                                          event.target.value,
                                        )
                                      }
                                    />
                                    <FqInput
                                      label="Descanso (s)"
                                      size="sm"
                                      type="number"
                                      min={20}
                                      max={300}
                                      value={exercise.restSec}
                                      onChange={(event) =>
                                        updateEditingExerciseNumeric(
                                          exercise.id,
                                          "restSec",
                                          event.target.value,
                                        )
                                      }
                                    />
                                    <FqInput
                                      label="Carga (kg)"
                                      size="sm"
                                      type="number"
                                      min={0}
                                      max={400}
                                      value={exercise.suggestedLoadKg}
                                      onChange={(event) =>
                                        updateEditingExerciseNumeric(
                                          exercise.id,
                                          "suggestedLoadKg",
                                          event.target.value,
                                        )
                                      }
                                    />
                                    <FqInput
                                      label="Duracao (min)"
                                      size="sm"
                                      type="number"
                                      min={2}
                                      max={30}
                                      value={exercise.durationMin}
                                      onChange={(event) =>
                                        updateEditingExerciseNumeric(
                                          exercise.id,
                                          "durationMin",
                                          event.target.value,
                                        )
                                      }
                                    />
                                    <FqInput
                                      label="Equipamento"
                                      size="sm"
                                      value={exercise.equipment ?? ""}
                                      onChange={(event) =>
                                        setEditingExercises((current) =>
                                          current.map((item) =>
                                            item.id === exercise.id
                                              ? {
                                                  ...item,
                                                  equipment: event.target.value,
                                                }
                                              : item,
                                          ),
                                        )
                                      }
                                    />
                                    <FqSelect
                                      label="Grupo"
                                      value={exercise.muscleGroup ?? ""}
                                      onChange={(event) =>
                                        setEditingExercises((current) =>
                                          current.map((item) =>
                                            item.id === exercise.id
                                              ? {
                                                  ...item,
                                                  muscleGroup:
                                                    event.target.value ||
                                                    undefined,
                                                }
                                              : item,
                                          ),
                                        )
                                      }
                                      options={[
                                        { value: "", label: "Nao definido" },
                                        ...workoutMuscleGroupOptions.map(
                                          (option) => ({
                                            value: option.value,
                                            label: option.label,
                                          }),
                                        ),
                                      ]}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-3">
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-success/15 text-xs font-semibold text-success">
                                    {index + 1}
                                  </span>
                                  <div className="space-y-1">
                                    <FqText
                                      as="p"
                                      className="text-base font-semibold text-foreground"
                                    >
                                      {exercise.name}
                                    </FqText>
                                    <FqText
                                      as="p"
                                      className="text-sm text-muted-foreground"
                                    >
                                      {exercise.sets} series x {exercise.reps}{" "}
                                      reps • {exercise.restSec}s descanso •{" "}
                                      {exercise.suggestedLoadKg}kg
                                    </FqText>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                      <span className="rounded-md bg-muted px-2 py-0.5">
                                        Duracao {exercise.durationMin} min
                                      </span>
                                      {exercise.equipment ? (
                                        <span className="rounded-md bg-muted px-2 py-0.5">
                                          {exercise.equipment}
                                        </span>
                                      ) : null}
                                      {exercise.muscleGroup ? (
                                        <span className="rounded-md bg-muted px-2 py-0.5">
                                          {exercise.muscleGroup}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {selectedWorkout.assignmentScope === "personal" ? (
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Esta ficha pertence a sua base pessoal e nao possui
                        historico de aluno.
                      </FqText>
                    ) : historySnapshot ? (
                      <div className="space-y-2 rounded-xl border border-border bg-muted/15 p-3">
                        <FqText
                          as="p"
                          className="text-sm font-semibold text-foreground"
                        >
                          Historico de {historySnapshot.studentName}
                        </FqText>
                        {historySnapshot.sessions.length === 0 ? (
                          <FqText
                            as="p"
                            className="text-sm text-muted-foreground"
                          >
                            Sem sessoes concluidas.
                          </FqText>
                        ) : (
                          historySnapshot.sessions
                            .slice(0, 5)
                            .map((session) => (
                              <div
                                key={session.sessionId}
                                className="rounded-xl border border-border bg-card p-3"
                              >
                                <FqText
                                  as="p"
                                  className="text-sm font-semibold text-foreground"
                                >
                                  {session.title}
                                </FqText>
                                <FqText
                                  as="p"
                                  className="text-xs text-muted-foreground"
                                >
                                  {new Date(session.completedAt).toLocaleString(
                                    "pt-BR",
                                  )}{" "}
                                  • {Math.round(session.durationSec / 60)} min
                                </FqText>
                              </div>
                            ))
                        )}
                      </div>
                    ) : (
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Clique em “Carregar historico do aluno” para revisar
                        sessoes recentes.
                      </FqText>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {!isEditingWorkoutDetails &&
                      selectedWorkout.assignmentScope !== "personal" ? (
                        <FqButton
                          size="sm"
                          variant="outline"
                          tone="secondary"
                          onClick={() =>
                            void handleLoadStudentHistory(
                              selectedWorkout.studentId,
                            )
                          }
                          isLoading={
                            loadingStudentHistoryId === selectedWorkout.studentId
                          }
                        >
                          Carregar historico do aluno
                        </FqButton>
                      ) : null}
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="warning"
                        onClick={() => void handleDeactivateWorkout()}
                        isLoading={isDeactivatingWorkout}
                      >
                        Desativar treino
                      </FqButton>
                    </div>
                  </div>
                </FqCard>
              </div>
            ) : selectedWorkoutId ? (
              <div className="space-y-4">
                <FqButton
                  variant="outline"
                  tone="neutral"
                  leftIcon="arrowLeft"
                  onClick={closeWorkoutDetails}
                  className="w-fit min-h-11 px-5 text-base font-semibold"
                >
                  Voltar para fichas
                </FqButton>
                <FqCard className="border-border bg-card">
                  <div className="space-y-3">
                    <FqText
                      as="h3"
                      className="text-lg font-semibold text-foreground"
                    >
                      Ficha nao encontrada
                    </FqText>
                    <FqText as="p" className="text-sm text-muted-foreground">
                      Essa ficha nao existe mais ou voce nao tem permissao para
                      visualiza-la.
                    </FqText>
                  </div>
                </FqCard>
              </div>
            ) : null}
          </div>
        )
      ) : null}

      {tab === "dashboard" || tab === "metrics" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <FqText
                as="h2"
                className="text-2xl font-semibold text-foreground"
              >
                {tab === "dashboard"
                  ? "Dashboard do Personal"
                  : "Metricas de acompanhamento"}
              </FqText>
              <FqText as="p" className="text-sm text-muted-foreground">
                {tab === "dashboard"
                  ? "Visao consolidada da sua operacao semanal."
                  : "Leitura detalhada de frequencia, carga e alertas dos alunos."}
              </FqText>
            </div>
            <FqButton
              variant="outline"
              tone="neutral"
              leftIcon="activity"
              onClick={() => void refresh()}
            >
              Atualizar dados
            </FqButton>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FqCard className="border-border bg-card shadow-sm">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FqIcon name="users" size={16} />
              </div>
              <FqText as="p" className="text-xs text-muted-foreground">
                Alunos vinculados
              </FqText>
              <FqText
                as="p"
                className="mt-1 text-lg font-semibold text-foreground"
              >
                {overview.metrics.linkedStudents}
              </FqText>
            </FqCard>
            <FqCard className="border-border bg-card shadow-sm">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <FqIcon name="dumbbell" size={16} />
              </div>
              <FqText as="p" className="text-xs text-muted-foreground">
                Treinos atribuidos (semana)
              </FqText>
              <FqText
                as="p"
                className="mt-1 text-lg font-semibold text-foreground"
              >
                {overview.metrics.workoutsAssignedThisWeek}
              </FqText>
            </FqCard>
            <FqCard className="border-border bg-card shadow-sm">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/20 text-success">
                <FqIcon name="check" size={16} />
              </div>
              <FqText as="p" className="text-xs text-muted-foreground">
                Treinos concluidos (semana)
              </FqText>
              <FqText
                as="p"
                className="mt-1 text-lg font-semibold text-foreground"
              >
                {overview.metrics.completedWorkoutsThisWeek}
              </FqText>
            </FqCard>
            <FqCard className="border-border bg-card shadow-sm">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20 text-warning">
                <FqIcon name="chart" size={16} />
              </div>
              <FqText as="p" className="text-xs text-muted-foreground">
                Frequencia media semanal
              </FqText>
              <FqText
                as="p"
                className="mt-1 text-lg font-semibold text-foreground"
              >
                {overview.metrics.avgFrequencyWeekly.toFixed(1)}
              </FqText>
            </FqCard>
          </div>

          <FqCard
            className="border-border bg-card"
            title="Frequencia por aluno"
            subtitle="Com base em sessoes concluidas na semana atual."
          >
            {overview.metrics.studentFrequency.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Sem alunos vinculados.
              </FqText>
            ) : (
              <div className="space-y-2">
                {overview.metrics.studentFrequency.map((item) => (
                  <div
                    key={item.studentId}
                    className="rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <FqText
                        as="p"
                        className="text-sm font-semibold text-foreground"
                      >
                        {item.studentName}
                      </FqText>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {item.frequencyPct}% da meta
                      </span>
                    </div>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      Concluidos: {item.completedWorkoutsThisWeek}/
                      {item.targetWorkoutsPerWeek} na semana
                    </FqText>
                  </div>
                ))}
              </div>
            )}
          </FqCard>

          <FqCard
            className="border-border bg-card"
            title="Evolucao de carga"
            subtitle="Volume medio por sessao (kg) na semana atual vs anterior."
          >
            {overview.metrics.loadEvolution.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Sem sessoes suficientes para calcular evolucao.
              </FqText>
            ) : (
              <div className="space-y-2">
                {overview.metrics.loadEvolution.map((item) => (
                  <div
                    key={item.studentId}
                    className="rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <FqText
                        as="p"
                        className="text-sm font-semibold text-foreground"
                      >
                        {item.studentName}
                      </FqText>
                      <FqText
                        as="p"
                        className={`text-xs ${item.trend === "up" ? "text-emerald-500" : item.trend === "down" ? "text-rose-500" : "text-muted-foreground"}`}
                      >
                        {item.deltaPct > 0 ? "+" : ""}
                        {item.deltaPct}% (
                        {item.trend === "up"
                          ? "subindo"
                          : item.trend === "down"
                            ? "caindo"
                            : "estavel"}
                        )
                      </FqText>
                    </div>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      Semana atual: {item.currentWeekAverageLoadKg} kg • Semana
                      anterior: {item.previousWeekAverageLoadKg} kg
                    </FqText>
                  </div>
                ))}
              </div>
            )}
          </FqCard>

          <FqCard
            className="border-border bg-card"
            title="Alertas de acompanhamento"
            subtitle="Gerados automaticamente a partir do historico de sessoes."
          >
            {overview.metrics.alerts.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Nenhum alerta no momento.
              </FqText>
            ) : (
              <div className="space-y-2">
                {overview.metrics.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <FqText
                      as="p"
                      className={`text-sm font-semibold ${alert.severity === "danger" ? "text-rose-500" : "text-amber-500"}`}
                    >
                      {alert.studentName} •{" "}
                      {alert.type === "missed-workout"
                        ? "Faltando treino"
                        : "Baixa consistencia"}
                    </FqText>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      {alert.message}
                    </FqText>
                  </div>
                ))}
              </div>
            )}
          </FqCard>

          <FqCard
            className="border-border bg-card"
            title="Solicitacoes de medidas"
            subtitle="Pedidos de avaliacao corporal enviados por alunos."
          >
            {overview.measurementRequests.length === 0 ? (
              <FqText as="p" className="text-sm text-muted-foreground">
                Sem solicitacoes no momento.
              </FqText>
            ) : (
              <div className="space-y-2">
                {overview.measurementRequests.slice(0, 8).map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <FqText
                        as="p"
                        className="text-sm font-semibold text-foreground"
                      >
                        {request.studentName}
                      </FqText>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleString("pt-BR")}
                      </FqText>
                    </div>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      Status: {request.status}
                    </FqText>
                    {request.note ? (
                      <FqText as="p" className="text-xs text-muted-foreground">
                        Nota: {request.note}
                      </FqText>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="secondary"
                        onClick={() =>
                          void handleUpdateMeasurementRequest(
                            request.id,
                            "accepted",
                          )
                        }
                        isDisabled={request.status !== "open"}
                        isLoading={isUpdatingMeasurementsRequestStatus}
                      >
                        Aceitar
                      </FqButton>
                      <FqButton
                        size="sm"
                        variant="outline"
                        tone="success"
                        onClick={() =>
                          void handleUpdateMeasurementRequest(
                            request.id,
                            "done",
                          )
                        }
                        isDisabled={request.status === "done"}
                        isLoading={isUpdatingMeasurementsRequestStatus}
                      >
                        Marcar como concluida
                      </FqButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FqCard>
        </div>
      ) : null}

      {tab === "messages" ? (
        <div className="space-y-4">
          <div>
            <FqText as="h2" className="text-2xl font-semibold text-foreground">
              Mensagens e engajamento
            </FqText>
            <FqText as="p" className="text-sm text-muted-foreground">
              Dispare mensagens motivacionais e conquistas especiais para seus
              alunos.
            </FqText>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <FqCard
              className="border-border bg-card shadow-sm"
              title="Mensagem motivacional"
              subtitle="Contato rapido para reforcar consistencia."
            >
              <div className="space-y-3">
                <FqSelect
                  label="Aluno"
                  value={engagementStudentId}
                  onChange={(event) =>
                    setEngagementStudentId(event.target.value)
                  }
                  options={studentOptions}
                  placeholder="Selecione"
                />
                <FqInput
                  label="Mensagem motivacional"
                  value={motivationalMessage}
                  onChange={(event) =>
                    setMotivationalMessage(event.target.value)
                  }
                  placeholder="Ex.: Excelente consistencia esta semana, mantenha o ritmo."
                />
                <FqButton
                  onClick={() => void handleSendMotivation()}
                  isLoading={isSendingMotivationalMessage}
                  className="w-full"
                >
                  Enviar mensagem
                </FqButton>
              </div>
            </FqCard>

            <FqCard
              className="border-border bg-card shadow-sm"
              title="Conquista especial"
              subtitle="Liberacao manual de badge para destaque no app."
            >
              <div className="space-y-3">
                <FqSelect
                  label="Aluno"
                  value={engagementStudentId}
                  onChange={(event) =>
                    setEngagementStudentId(event.target.value)
                  }
                  options={studentOptions}
                  placeholder="Selecione"
                />
                <FqInput
                  label="Titulo da conquista"
                  value={achievementTitle}
                  onChange={(event) => setAchievementTitle(event.target.value)}
                />
                <FqInput
                  label="Descricao da conquista"
                  value={achievementDescription}
                  onChange={(event) =>
                    setAchievementDescription(event.target.value)
                  }
                  placeholder="Ex.: Execucao impecavel no plano da semana."
                />
                <FqButton
                  variant="outline"
                  tone="secondary"
                  onClick={() => void handleGrantAchievement()}
                  isLoading={isGrantingSpecialAchievement}
                  className="w-full"
                >
                  Liberar conquista especial
                </FqButton>
              </div>
            </FqCard>
          </div>
        </div>
      ) : null}
    </section>
  );
}
