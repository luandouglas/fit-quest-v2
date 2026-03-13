import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";

import {
  FqAlert,
  FqButton,
  FqCard,
  FqEmptyState,
  FqIcon,
  FqIconButton,
  FqInput,
  FqSelect,
  FqText,
  useToast,
} from "@/shared/ui";
import type {
  PersonalAssignedWorkout,
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
type StudentStatusFilter =
  | "all"
  | "with-active-workouts"
  | "without-active-workouts";
type StudentSortBy = "name" | "email" | "target" | "active";
type SortDirection = "asc" | "desc";

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
  const { section, workoutId } = useParams<{
    section?: string;
    workoutId?: string;
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
    getStudentWorkoutHistory,
    isCreatingWorkout,
    isUpdatingWorkout,
    isDeactivatingWorkout,
    isSendingMotivationalMessage,
    isGrantingSpecialAchievement,
    isUpdatingMeasurementsRequestStatus,
    isGeneratingStudentInviteLink,
  } = usePersonalDashboard();

  const tab = forcedTab ?? resolvePersonalTab(section);
  const basePath = location.pathname.startsWith("/tabs/personal")
    ? "/tabs/personal"
    : "/personal";
  const selectedWorkoutId =
    tab === "workouts" ? (forcedWorkoutId ?? workoutId ?? null) : null;
  const [isCreatingWorkoutFlow, setIsCreatingWorkoutFlow] = useState(false);
  const [workoutSearch, setWorkoutSearch] = useState("");
  const [workoutFilter, setWorkoutFilter] =
    useState<WorkoutCatalogFilter>("all");
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
  const [draggingExerciseId, setDraggingExerciseId] = useState<string | null>(
    null,
  );
  const [dragOverExerciseId, setDragOverExerciseId] = useState<string | null>(
    null,
  );
  const [historySnapshot, setHistorySnapshot] =
    useState<PersonalStudentWorkoutHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

  const filteredWorkouts = useMemo(() => {
    const workouts = overview?.workouts ?? [];
    const normalizedSearch = workoutSearch.trim().toLowerCase();

    return workouts
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
      });
  }, [overview?.workouts, workoutFilter, workoutSearch]);

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

  const selectedWorkout = useMemo(
    () =>
      (overview?.workouts ?? []).find(
        (workout) => workout.id === selectedWorkoutId,
      ) ?? null,
    [overview?.workouts, selectedWorkoutId],
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
    if (selectedWorkoutId) {
      return;
    }

    setIsEditingWorkoutDetails(false);
    setHistorySnapshot(null);
  }, [selectedWorkoutId]);

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
    history.push(`${basePath}/workouts/${workout.id}`);
    setIsEditingWorkoutDetails(false);
    setHistorySnapshot(null);
  }

  function closeWorkoutDetails() {
    history.push(`${basePath}/workouts`);
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
      setIsLoadingHistory(true);
      const history = await getStudentWorkoutHistory(studentId);
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
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function handleGenerateStudentInviteLink() {
    try {
      const invite = await generateStudentInviteLink();
      setStudentInviteCode(invite.code);
      setStudentInviteLink(invite.inviteLink);
      toast({
        title: "Link gerado",
        description:
          "Compartilhe o link com o aluno para ele enviar o convite.",
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
              <FqButton
                leftIcon="plus"
                onClick={() => void handleGenerateStudentInviteLink()}
                isLoading={isGeneratingStudentInviteLink}
              >
                Adicionar aluno
              </FqButton>
            </div>
          </div>

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
                    O aluno deve abrir o link e usar o codigo para solicitar o
                    vinculo.
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
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-sm text-muted-foreground"
                        >
                          Nenhum aluno encontrado para os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-4 py-3">
                            <FqText
                              as="p"
                              className="text-sm font-semibold text-foreground"
                            >
                              {student.name}
                            </FqText>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {student.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                              {student.workoutsPerWeekTarget} treinos
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${student.activeWorkouts > 0 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                            >
                              {student.activeWorkouts}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
                    onClick={() => setIsCreatingWorkoutFlow(false)}
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
                onCreated={() => setIsCreatingWorkoutFlow(false)}
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
                    onClick={() => setIsCreatingWorkoutFlow(true)}
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

                            <div className="flex flex-wrap gap-1.5">
                              {weekdayOrder.map((weekday) => {
                                const isScheduled =
                                  workout.weekdays?.includes(weekday);
                                return (
                                  <span
                                    key={`${workout.id}-${weekday}`}
                                    className={`
                                      inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold
                                      ${isScheduled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}
                                    `}
                                  >
                                    {weekdayCompactLabelMap[weekday]}
                                  </span>
                                );
                              })}
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
                          isLoading={isLoadingHistory}
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
