import { useEffect, useMemo, useState } from "react";

import { cx } from "@/shared/utils";
import maleBodySvgRaw from "@/shared/assets/shape/male/male.svg?raw";
import maleBodyPng from "@/shared/assets/shape/male/male.png";
import femaleBodySvgRaw from "@/shared/assets/shape/female/female.svg?raw";
import femaleBodyPng from "@/shared/assets/shape/female/female.png";
import {
  FqAlert,
  FqBadge,
  FqButton,
  FqCard,
  FqIcon,
  FqIconButton,
  FqInput,
  FqModal,
  FqSelect,
  FqSlider,
  FqText,
  FqTextarea,
  useToast,
} from "@/shared/ui";
import type {
  CreatePersonalWorkoutInput,
  PersonalWorkoutIntensity,
} from "@/shared/services/contracts/personal";
import type { WorkoutSupportMedia } from "@/shared/services/contracts/workout";
import {
  classifyExercises,
  createExercisePrescription,
  loadExerciseAssistantAssets,
  mergeFocusAreas,
  normalizeText,
  type AssistantExercise,
  type AssistantFilters,
  type AssistantProfile,
  type RankedAssistantExercise,
} from "@/features/personal/utils/exerciseAssistant";
import { InteractiveBodySvg } from "./InteractiveBodySvg";

type WorkoutExerciseDraft = {
  id: string;
  name: string;
  bodyRegion: string;
  equipment: string;
  sets: number;
  reps: number;
  restSec: number;
  suggestedLoadKg: number;
  source: "assistant" | "manual";
  score?: number;
  supportMedia?: WorkoutSupportMedia | null;
};

type PersonalWorkoutWizardCardProps = {
  onCreateWorkout: (input: CreatePersonalWorkoutInput) => Promise<unknown>;
  isCreatingWorkout: boolean;
  studentOptions: Array<{ value: string; label: string }>;
  onClose?: () => void;
  onCreated?: () => void;
};

const wizardSteps = [
  "Nome do treino",
  "Grupos musculares",
  "Intensidade",
  "Exercicios",
] as const;
const MANUAL_NEW_OPTION = "__manual_new__";

const muscleGroupOptions = [
  { value: "biceps", label: "Biceps", icon: "dumbbell" as const },
  { value: "triceps", label: "Triceps", icon: "dumbbell" as const },
  { value: "ombro", label: "Ombro", icon: "target" as const },
  { value: "dorcal", label: "Dorcal", icon: "dumbbell" as const },
  { value: "panturrilhas", label: "Panturrilhas", icon: "activity" as const },
  { value: "adutores", label: "Adutores", icon: "activity" as const },
  { value: "peitoral", label: "Peitoral", icon: "dumbbell" as const },
  { value: "antebracos", label: "Antebracos", icon: "dumbbell" as const },
  { value: "isquiotibiais", label: "Isquiotibiais", icon: "activity" as const },
  {
    value: "flexores_do_quadril",
    label: "Flexores do quadril",
    icon: "activity" as const,
  },
  { value: "obliquos", label: "Obliquos", icon: "target" as const },
  { value: "abdomen", label: "Abdomen", icon: "target" as const },
  {
    value: "inferior_das_costas",
    label: "Inferior das costas",
    icon: "dumbbell" as const,
  },
  { value: "abdutores", label: "Abdutores", icon: "activity" as const },
  { value: "trapezio", label: "Trapezio", icon: "target" as const },
  { value: "quadriceps", label: "Quadriceps", icon: "activity" as const },
  {
    value: "superior_de_costas",
    label: "Superior de costas",
    icon: "dumbbell" as const,
  },
  { value: "gluteos", label: "Gluteos", icon: "target" as const },
] as const;

const intensityOptions: Array<{
  value: PersonalWorkoutIntensity;
  label: string;
  description: string;
  icon: "flame" | "target" | "dumbbell";
}> = [
  {
    value: "iniciante",
    label: "Iniciante",
    description: "Para quem esta comecando.",
    icon: "target",
  },
  {
    value: "intermediario",
    label: "Intermediario",
    description: "Ja tem alguma experiencia.",
    icon: "dumbbell",
  },
  {
    value: "avancado",
    label: "Avancado",
    description: "Treino mais exigente.",
    icon: "flame",
  },
];

const targetGenderOptions = [
  { value: "masculino", label: "Homem" },
  { value: "feminino", label: "Mulher" },
] as const;

const maleSvgMuscleMap: Record<string, string[]> = {
  biceps: ["biceps"],
  triceps: ["triceps"],
  ombro: ["ombro"],
  dorcal: ["dorcal"],
  panturrilhas: ["panturrilhas"],
  adutores: ["adutores"],
  peitoral: ["peitoral"],
  antebracos: ["antebracos"],
  isquiotibiais: ["isquiotibiais"],
  flexores_do_quadril: ["flexores_do_quadril"],
  obliquos: ["obliquos"],
  abdomen: ["abdomen"],
  inferior_das_costas: ["inferior_das_costas"],
  abdutores: ["abdutores"],
  trapezio: ["trapezio"],
  quadriceps: ["quadriceps"],
  superior_de_costas: ["superior_de_costas"],
  gluteos: ["gluteos"],
};

const femaleSvgMuscleMap: Record<string, string[]> = {
  biceps: ["biceps"],
  triceps: ["triceps"],
  ombro: ["ombro"],
  dorcal: ["dorcal"],
  panturrilhas: ["panturrilhas"],
  adutores: ["adutores"],
  peitoral: ["peitorais_maior"],
  antebracos: ["antebraco"],
  isquiotibiais: ["isquiotibiais"],
  flexores_do_quadril: ["flexores_de_quadril"],
  obliquos: ["obliquos"],
  abdomen: ["abdomen"],
  inferior_das_costas: ["inferior_de_costas"],
  abdutores: ["abdutores"],
  trapezio: ["trapezio"],
  quadriceps: ["quadriceps"],
  superior_de_costas: ["superior_de_costas"],
  gluteos: ["gluteos"],
};

const defaultAssistantFilters: AssistantFilters = {
  porte_fisico: "medio",
  biotipo: "ectomorfo",
  sexo: "masculino",
  objetivo: "hipertrofia",
  experiencia: "iniciante",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function nextExerciseId() {
  return crypto.randomUUID();
}

function getEquipmentLabel(equipment: string) {
  const normalized = equipment.toLowerCase();
  if (normalized === "peso_corporal") return "Peso corporal";
  if (normalized === "maquina") return "Maquina";
  return equipment.charAt(0).toUpperCase() + equipment.slice(1);
}

function getMuscleGroupLabel(group: string) {
  const match = muscleGroupOptions.find((option) => option.value === group);
  return match?.label ?? group;
}

function parseNumberInput(
  value: string,
  current: number,
  min: number,
  max: number,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return current;
  }

  return clamp(Math.round(parsed), min, max);
}

function formatCompactNumber(value: number) {
  return Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getExerciseDisplayName(exercise: AssistantExercise) {
  return exercise.name_en?.trim() || exercise.name;
}

function buildExerciseSupportMedia(
  exercise: AssistantExercise,
): WorkoutSupportMedia | null {
  const thumbnailUrl = exercise.thumbnail_url?.trim();
  const sourceUrl = exercise.source_url?.trim();

  if (!thumbnailUrl && !sourceUrl) {
    return null;
  }

  return {
    id: `${exercise.id}-preview`,
    type: "image",
    url: sourceUrl || thumbnailUrl || "#",
    thumbnailUrl: thumbnailUrl || undefined,
    label: "Guia do exercicio",
  };
}

export function PersonalWorkoutWizardCard({
  onCreateWorkout,
  isCreatingWorkout,
  studentOptions,
  onClose: _onClose,
  onCreated,
}: PersonalWorkoutWizardCardProps) {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetGender, setTargetGender] = useState<"masculino" | "feminino">(
    "masculino",
  );
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [hoveredMuscleGroup, setHoveredMuscleGroup] = useState<string | null>(
    null,
  );
  const [intensity, setIntensity] =
    useState<PersonalWorkoutIntensity>("intermediario");
  const [starsReward, setStarsReward] = useState(90);
  const [estimatedDurationMin, setEstimatedDurationMin] = useState("45");
  const [selectedExercises, setSelectedExercises] = useState<
    WorkoutExerciseDraft[]
  >([]);

  const [draggingExerciseId, setDraggingExerciseId] = useState<string | null>(
    null,
  );
  const [dragOverExerciseId, setDragOverExerciseId] = useState<string | null>(
    null,
  );

  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [assistantModalStep, setAssistantModalStep] = useState<
    "filters" | "results"
  >("filters");
  const [assistantProfile, setAssistantProfile] =
    useState<AssistantProfile | null>(null);
  const [assistantFilters, setAssistantFilters] = useState<AssistantFilters>(
    defaultAssistantFilters,
  );
  const [assistantFiltersHydrated, setAssistantFiltersHydrated] =
    useState(false);
  const [assistantCatalog, setAssistantCatalog] = useState<AssistantExercise[]>(
    [],
  );
  const [classifierSignature, setClassifierSignature] = useState<number | null>(
    null,
  );
  const [assistantSuggestions, setAssistantSuggestions] = useState<
    RankedAssistantExercise[]
  >([]);
  const [isLoadingAssistantAssets, setIsLoadingAssistantAssets] =
    useState(true);
  const [assistantAssetsError, setAssistantAssetsError] = useState<
    string | null
  >(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualExerciseValue, setManualExerciseValue] = useState("");
  const [manualCustomExerciseName, setManualCustomExerciseName] = useState("");
  const [manualMuscleGroup, setManualMuscleGroup] = useState("peitoral");
  const [manualEquipment, setManualEquipment] = useState("halter");
  const [manualSets, setManualSets] = useState("3");
  const [manualReps, setManualReps] = useState("12");
  const [manualRestSec, setManualRestSec] = useState("60");
  const [manualSuggestedLoadKg, setManualSuggestedLoadKg] = useState("20");
  const [librarySearchValue, setLibrarySearchValue] = useState("");
  const [libraryMuscleGroup, setLibraryMuscleGroup] = useState("");
  const [libraryEquipment, setLibraryEquipment] = useState("");
  const [libraryVisibleCount, setLibraryVisibleCount] = useState(12);
  const [selectedLibraryExerciseIds, setSelectedLibraryExerciseIds] = useState<
    string[]
  >([]);

  const bodySvgRaw =
    targetGender === "feminino" ? femaleBodySvgRaw : maleBodySvgRaw;
  const bodyPng = targetGender === "feminino" ? femaleBodyPng : maleBodyPng;
  const bodyMuscleMap =
    targetGender === "feminino" ? femaleSvgMuscleMap : maleSvgMuscleMap;

  useEffect(() => {
    let mounted = true;

    async function loadAssets() {
      try {
        setIsLoadingAssistantAssets(true);
        const assets = await loadExerciseAssistantAssets();
        if (!mounted) {
          return;
        }

        setAssistantCatalog(assets.exercises);
        setAssistantProfile(assets.profile);
        setClassifierSignature(assets.classifierSignature);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setAssistantAssetsError(
          error instanceof Error
            ? error.message
            : "Falha ao carregar assistente.",
        );
      } finally {
        if (mounted) {
          setIsLoadingAssistantAssets(false);
        }
      }
    }

    void loadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!assistantProfile || assistantFiltersHydrated) {
      return;
    }

    const profileGender =
      assistantProfile.sexo === "feminino" ? "feminino" : "masculino";
    setTargetGender(profileGender);

    setAssistantFilters((current) => ({
      ...current,
      porte_fisico: assistantProfile.porte_fisico ?? current.porte_fisico,
      biotipo: assistantProfile.biotipo ?? current.biotipo,
      sexo: profileGender,
      objetivo: assistantProfile.objetivo ?? current.objetivo,
      experiencia: assistantProfile.experiencia ?? current.experiencia,
      equipamentos_permitidos: assistantProfile.equipamentos_permitidos,
      equipamentos_restritos: assistantProfile.equipamentos_restritos,
      regioes_restritas: assistantProfile.regioes_restritas,
    }));
    setAssistantFiltersHydrated(true);
  }, [assistantFiltersHydrated, assistantProfile]);

  useEffect(() => {
    setAssistantFilters((current) => ({
      ...current,
      sexo: targetGender,
    }));
  }, [targetGender]);

  const selectedMuscleGroupSet = useMemo(
    () => new Set(muscleGroups),
    [muscleGroups],
  );

  const catalogBySelectedMuscles = useMemo(
    () =>
      assistantCatalog.filter((exercise) =>
        selectedMuscleGroupSet.has(exercise.body_region),
      ),
    [assistantCatalog, selectedMuscleGroupSet],
  );

  const manualMuscleGroupOptions = useMemo(() => {
    const selectedOptions = muscleGroupOptions.filter((option) =>
      selectedMuscleGroupSet.has(option.value),
    );
    if (selectedOptions.length > 0) {
      return selectedOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }));
    }
    return muscleGroupOptions.map((option) => ({
      value: option.value,
      label: option.label,
    }));
  }, [selectedMuscleGroupSet]);

  const manualCatalogByMuscleGroup = useMemo(() => {
    if (!manualMuscleGroup) {
      return catalogBySelectedMuscles;
    }
    return catalogBySelectedMuscles.filter(
      (exercise) => exercise.body_region === manualMuscleGroup,
    );
  }, [catalogBySelectedMuscles, manualMuscleGroup]);

  const equipmentOptions = useMemo(() => {
    const set = new Set<string>();
    manualCatalogByMuscleGroup.forEach((exercise) =>
      set.add(exercise.equipment),
    );
    if (set.size === 0) {
      catalogBySelectedMuscles.forEach((exercise) =>
        set.add(exercise.equipment),
      );
    }
    if (set.size === 0) {
      set.add("halter");
      set.add("barra");
      set.add("maquina");
      set.add("cabo");
    }

    return Array.from(set)
      .sort((left, right) => left.localeCompare(right))
      .map((equipment) => ({
        value: equipment,
        label: getEquipmentLabel(equipment),
      }));
  }, [catalogBySelectedMuscles, manualCatalogByMuscleGroup]);

  const manualExerciseOptions = useMemo(() => {
    const filtered = manualCatalogByMuscleGroup.filter(
      (exercise) => !manualEquipment || exercise.equipment === manualEquipment,
    );

    return [
      {
        value: MANUAL_NEW_OPTION,
        label: "Nao encontrei - criar novo exercicio",
      },
      ...filtered
        .map((exercise) => ({
          value: exercise.id,
          label: exercise.name_en?.trim() || exercise.name,
        }))
        .sort((left, right) => left.label.localeCompare(right.label, "pt-BR")),
    ];
  }, [manualCatalogByMuscleGroup, manualEquipment]);

  const selectedManualCatalogExercise = useMemo(
    () =>
      manualCatalogByMuscleGroup.find(
        (exercise) =>
          exercise.id === manualExerciseValue &&
          (!manualEquipment || exercise.equipment === manualEquipment),
      ) ?? null,
    [manualCatalogByMuscleGroup, manualEquipment, manualExerciseValue],
  );

  const libraryMuscleGroupOptions = useMemo(
    () => [
      { value: "", label: "Todos os grupos" },
      ...manualMuscleGroupOptions,
    ],
    [manualMuscleGroupOptions],
  );

  const libraryCatalogByMuscleGroup = useMemo(() => {
    if (!libraryMuscleGroup) {
      return catalogBySelectedMuscles;
    }
    return catalogBySelectedMuscles.filter(
      (exercise) => exercise.body_region === libraryMuscleGroup,
    );
  }, [catalogBySelectedMuscles, libraryMuscleGroup]);

  const libraryEquipmentOptions = useMemo(() => {
    const set = new Set<string>();
    libraryCatalogByMuscleGroup.forEach((exercise) =>
      set.add(exercise.equipment),
    );
    return [
      { value: "", label: "Todos os equipamentos" },
      ...Array.from(set)
        .sort((left, right) => left.localeCompare(right))
        .map((equipment) => ({
          value: equipment,
          label: getEquipmentLabel(equipment),
        })),
    ];
  }, [libraryCatalogByMuscleGroup]);

  const libraryFilteredExercises = useMemo(() => {
    const searchTerm = normalizeText(librarySearchValue);

    return libraryCatalogByMuscleGroup
      .filter(
        (exercise) =>
          !libraryEquipment || exercise.equipment === libraryEquipment,
      )
      .filter((exercise) => {
        if (!searchTerm) {
          return true;
        }

        const searchableText = [
          exercise.name,
          exercise.name_en,
          exercise.primary_muscle,
          exercise.instructions,
          exercise.overview,
          getMuscleGroupLabel(exercise.body_region),
          getEquipmentLabel(exercise.equipment),
        ]
          .filter(Boolean)
          .map((value) => normalizeText(value))
          .join(" ");

        return searchableText.includes(searchTerm);
      })
      .sort(
        (left, right) =>
          (right.views ?? 0) - (left.views ?? 0) ||
          (left.name_en?.trim() || left.name).localeCompare(
            right.name_en?.trim() || right.name,
            "pt-BR",
          ),
      );
  }, [libraryCatalogByMuscleGroup, libraryEquipment, librarySearchValue]);

  const visibleLibraryExercises = useMemo(
    () => libraryFilteredExercises.slice(0, libraryVisibleCount),
    [libraryFilteredExercises, libraryVisibleCount],
  );
  const hasMoreLibraryExercises =
    libraryFilteredExercises.length > libraryVisibleCount;
  const selectedLibraryExerciseIdSet = useMemo(
    () => new Set(selectedLibraryExerciseIds),
    [selectedLibraryExerciseIds],
  );
  const selectedVisibleLibraryCount = useMemo(
    () =>
      visibleLibraryExercises.filter((exercise) =>
        selectedLibraryExerciseIdSet.has(exercise.id),
      ).length,
    [selectedLibraryExerciseIdSet, visibleLibraryExercises],
  );
  const isAllVisibleLibrarySelected =
    visibleLibraryExercises.length > 0 &&
    selectedVisibleLibraryCount === visibleLibraryExercises.length;

  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return Boolean(selectedStudentId.trim()) && Boolean(title.trim());
    }
    if (currentStep === 1) {
      return muscleGroups.length > 0;
    }
    if (currentStep === 2) {
      const parsedDuration = Number(estimatedDurationMin);
      return Number.isFinite(parsedDuration) && parsedDuration >= 10;
    }
    return selectedExercises.length > 0;
  }, [
    currentStep,
    estimatedDurationMin,
    muscleGroups.length,
    selectedExercises.length,
    selectedStudentId,
    title,
  ]);

  const isAssistantDisabled =
    isLoadingAssistantAssets || Boolean(assistantAssetsError);

  useEffect(() => {
    if (!isManualModalOpen) {
      return;
    }

    const availableIds = manualExerciseOptions
      .filter((option) => option.value !== MANUAL_NEW_OPTION)
      .map((option) => option.value);

    if (manualExerciseValue && availableIds.includes(manualExerciseValue)) {
      return;
    }

    if (availableIds.length > 0) {
      handleSelectManualExercise(availableIds[0]);
      return;
    }

    handleSelectManualExercise(MANUAL_NEW_OPTION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManualModalOpen, manualExerciseValue, manualExerciseOptions]);

  useEffect(() => {
    if (manualMuscleGroupOptions.length === 0) {
      return;
    }

    if (
      manualMuscleGroupOptions.some(
        (option) => option.value === manualMuscleGroup,
      )
    ) {
      return;
    }

    setManualMuscleGroup(manualMuscleGroupOptions[0].value);
  }, [manualMuscleGroup, manualMuscleGroupOptions]);

  useEffect(() => {
    if (equipmentOptions.length === 0) {
      return;
    }

    if (equipmentOptions.some((option) => option.value === manualEquipment)) {
      return;
    }

    setManualEquipment(equipmentOptions[0].value);
  }, [equipmentOptions, manualEquipment]);

  useEffect(() => {
    if (!libraryMuscleGroup) {
      return;
    }

    if (
      libraryMuscleGroupOptions.some(
        (option) => option.value === libraryMuscleGroup,
      )
    ) {
      return;
    }

    setLibraryMuscleGroup("");
  }, [libraryMuscleGroup, libraryMuscleGroupOptions]);

  useEffect(() => {
    if (
      libraryEquipmentOptions.some(
        (option) => option.value === libraryEquipment,
      )
    ) {
      return;
    }

    setLibraryEquipment("");
  }, [libraryEquipment, libraryEquipmentOptions]);

  useEffect(() => {
    setLibraryVisibleCount(12);
  }, [librarySearchValue, libraryMuscleGroup, libraryEquipment]);

  useEffect(() => {
    const availableIds = new Set(
      libraryFilteredExercises.map((exercise) => exercise.id),
    );
    setSelectedLibraryExerciseIds((current) =>
      current.filter((id) => availableIds.has(id)),
    );
  }, [libraryFilteredExercises]);

  function toggleMuscleGroup(group: string) {
    setMuscleGroups((current) => {
      if (current.includes(group)) {
        return current.filter((item) => item !== group);
      }
      return [...current, group];
    });
  }

  function handleNextStep() {
    if (!canProceed) {
      toast({
        title: "Complete o passo atual",
        description: "Preencha os campos obrigatorios para continuar.",
        tone: "warning",
      });
      return;
    }

    setCurrentStep((step) => step + 1);
  }

  function handlePreviousStep() {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  }

  function handleSelectManualExercise(value: string) {
    setManualExerciseValue(value);

    if (value === MANUAL_NEW_OPTION) {
      setManualCustomExerciseName("");
      return;
    }

    const selected = catalogBySelectedMuscles.find(
      (exercise) => exercise.id === value,
    );
    if (!selected) {
      return;
    }

    const prescription = createExercisePrescription({
      exercise: selected,
      intensity,
    });
    const hasMappedGroup = manualMuscleGroupOptions.some(
      (group) => group.value === selected.body_region,
    );
    const hasMappedEquipment = equipmentOptions.some(
      (equipment) => equipment.value === selected.equipment,
    );

    setManualCustomExerciseName(selected.name_en?.trim() || selected.name);
    setManualMuscleGroup(
      hasMappedGroup ? selected.body_region : manualMuscleGroup,
    );
    setManualEquipment(
      hasMappedEquipment ? selected.equipment : manualEquipment,
    );
    setManualSets(String(prescription.sets));
    setManualReps(String(prescription.reps));
    setManualRestSec(String(prescription.restSec));
    setManualSuggestedLoadKg(String(prescription.suggestedLoadKg));
  }

  function handleAddCatalogExercise(
    exercise: AssistantExercise,
    source: "assistant" | "manual",
  ) {
    const exerciseName = getExerciseDisplayName(exercise);
    const prescription = createExercisePrescription({ exercise, intensity });

    let wasAdded = false;
    setSelectedExercises((current) => {
      const hasDuplicate = current.some(
        (item) => item.name.toLowerCase() === exerciseName.toLowerCase(),
      );
      if (hasDuplicate) {
        return current;
      }

      wasAdded = true;
      return [
        ...current,
        {
          id: nextExerciseId(),
          name: exerciseName,
          bodyRegion: exercise.body_region,
          equipment: exercise.equipment,
          sets: prescription.sets,
          reps: prescription.reps,
          restSec: prescription.restSec,
          suggestedLoadKg: prescription.suggestedLoadKg,
          source,
          supportMedia: buildExerciseSupportMedia(exercise),
        },
      ];
    });

    if (!wasAdded) {
      toast({
        title: "Exercicio ja adicionado",
        description: "Esse exercicio ja esta na lista do treino.",
        tone: "warning",
      });
      return false;
    }

    toast({
      title: "Exercicio adicionado",
      description: `${exerciseName} foi incluido no treino.`,
      tone: "success",
    });
    return true;
  }

  function handleToggleLibraryExercise(exerciseId: string) {
    setSelectedLibraryExerciseIds((current) => {
      if (current.includes(exerciseId)) {
        return current.filter((id) => id !== exerciseId);
      }
      return [...current, exerciseId];
    });
  }

  function handleToggleSelectVisibleLibraryExercises() {
    setSelectedLibraryExerciseIds((current) => {
      const next = new Set(current);
      const shouldSelectAllVisible =
        selectedVisibleLibraryCount !== visibleLibraryExercises.length;

      if (shouldSelectAllVisible) {
        visibleLibraryExercises.forEach((exercise) => next.add(exercise.id));
      } else {
        visibleLibraryExercises.forEach((exercise) => next.delete(exercise.id));
      }

      return Array.from(next);
    });
  }

  function handleAddSelectedLibraryExercises() {
    if (selectedLibraryExerciseIds.length === 0) {
      toast({
        title: "Selecione exercicios",
        description: "Escolha pelo menos um card para adicionar em lote.",
        tone: "warning",
      });
      return;
    }

    const selectedIdSet = new Set(selectedLibraryExerciseIds);
    const selectedCatalogExercises = catalogBySelectedMuscles.filter(
      (exercise) => selectedIdSet.has(exercise.id),
    );

    if (selectedCatalogExercises.length === 0) {
      toast({
        title: "Nenhum exercicio disponivel",
        description: "Refine os filtros e tente novamente.",
        tone: "warning",
      });
      return;
    }

    let addedCount = 0;
    let duplicatedCount = 0;
    const addedExerciseIds: string[] = [];

    setSelectedExercises((current) => {
      const next = [...current];
      const existingNames = new Set(
        current.map((exercise) => exercise.name.toLowerCase()),
      );

      selectedCatalogExercises.forEach((exercise) => {
        const exerciseName = getExerciseDisplayName(exercise);
        if (existingNames.has(exerciseName.toLowerCase())) {
          duplicatedCount += 1;
          return;
        }

        const prescription = createExercisePrescription({
          exercise,
          intensity,
        });
        existingNames.add(exerciseName.toLowerCase());
        addedCount += 1;
        addedExerciseIds.push(exercise.id);
        next.push({
          id: nextExerciseId(),
          name: exerciseName,
          bodyRegion: exercise.body_region,
          equipment: exercise.equipment,
          sets: prescription.sets,
          reps: prescription.reps,
          restSec: prescription.restSec,
          suggestedLoadKg: prescription.suggestedLoadKg,
          source: "manual",
          supportMedia: buildExerciseSupportMedia(exercise),
        });
      });

      return next;
    });

    if (addedCount > 0) {
      toast({
        title: "Exercicios adicionados",
        description: `${addedCount} exercicio(s) foram incluidos no treino.`,
        tone: "success",
      });
      const addedIdSet = new Set(addedExerciseIds);
      setSelectedLibraryExerciseIds((current) =>
        current.filter((id) => !addedIdSet.has(id)),
      );
    }

    if (duplicatedCount > 0) {
      toast({
        title: "Alguns ja existiam",
        description: `${duplicatedCount} exercicio(s) nao foram adicionados por duplicidade.`,
        tone: "warning",
      });
    }
  }

  async function handleGenerateSuggestions() {
    if (!catalogBySelectedMuscles.length) {
      toast({
        title: "Catalogo indisponivel",
        description:
          "Nao ha exercicios para os grupos musculares selecionados.",
        tone: "warning",
      });
      return;
    }

    try {
      setIsGeneratingSuggestions(true);
      const suggestions = classifyExercises(
        catalogBySelectedMuscles,
        {
          ...assistantFilters,
          sexo: targetGender,
          foco_muscular: mergeFocusAreas(muscleGroups, assistantProfile),
        },
        8,
      );
      setAssistantSuggestions(suggestions);
      setAssistantModalStep("results");
    } catch (error) {
      toast({
        title: "Falha ao gerar sugestoes",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        tone: "danger",
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }

  function handleAddSuggestion(exercise: RankedAssistantExercise) {
    const wasAdded = handleAddCatalogExercise(exercise, "assistant");
    if (!wasAdded) {
      return;
    }

    setAssistantSuggestions((current) =>
      current.filter((item) => item.id !== exercise.id),
    );
  }

  function handleAddManualExercise() {
    const selectedName =
      manualExerciseValue === MANUAL_NEW_OPTION
        ? manualCustomExerciseName.trim()
        : selectedManualCatalogExercise?.name_en?.trim() ||
          selectedManualCatalogExercise?.name ||
          "";

    if (!selectedName) {
      toast({
        title: "Selecione um exercicio",
        description: "Escolha um exercicio existente ou crie um novo.",
        tone: "warning",
      });
      return;
    }

    const parsedSets = parseNumberInput(manualSets, 3, 1, 8);
    const parsedReps = parseNumberInput(manualReps, 12, 1, 30);
    const parsedRest = parseNumberInput(manualRestSec, 60, 20, 240);
    const parsedLoad = parseNumberInput(manualSuggestedLoadKg, 20, 0, 250);

    let wasAdded = false;
    setSelectedExercises((current) => {
      const hasDuplicate = current.some(
        (item) => item.name.toLowerCase() === selectedName.toLowerCase(),
      );
      if (hasDuplicate) {
        return current;
      }

      wasAdded = true;
      return [
        ...current,
        {
          id: nextExerciseId(),
          name: selectedName,
          bodyRegion: manualMuscleGroup,
          equipment: manualEquipment,
          sets: parsedSets,
          reps: parsedReps,
          restSec: parsedRest,
          suggestedLoadKg: parsedLoad,
          source: "manual",
          supportMedia: selectedManualCatalogExercise
            ? buildExerciseSupportMedia(selectedManualCatalogExercise)
            : null,
        },
      ];
    });

    if (!wasAdded) {
      toast({
        title: "Exercicio ja adicionado",
        description: "Esse exercicio ja esta na lista do treino.",
        tone: "warning",
      });
      return;
    }

    setManualCustomExerciseName("");
    setManualSets("3");
    setManualReps("12");
    setManualRestSec("60");
    setManualSuggestedLoadKg("20");
    setIsManualModalOpen(false);

    toast({
      title: "Exercicio adicionado",
      description: "Exercicio manual incluido no treino.",
      tone: "success",
    });
  }

  function updateExerciseNumeric(
    exerciseId: string,
    field: "sets" | "reps" | "restSec" | "suggestedLoadKg",
    value: string,
  ) {
    setSelectedExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (field === "sets") {
          return {
            ...exercise,
            sets: parseNumberInput(value, exercise.sets, 1, 8),
          };
        }

        if (field === "reps") {
          return {
            ...exercise,
            reps: parseNumberInput(value, exercise.reps, 1, 30),
          };
        }

        if (field === "restSec") {
          return {
            ...exercise,
            restSec: parseNumberInput(value, exercise.restSec, 20, 240),
          };
        }

        return {
          ...exercise,
          suggestedLoadKg: parseNumberInput(
            value,
            exercise.suggestedLoadKg,
            0,
            250,
          ),
        };
      }),
    );
  }

  function moveExercise(fromExerciseId: string, toExerciseId: string) {
    if (fromExerciseId === toExerciseId) {
      return;
    }

    setSelectedExercises((current) => {
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

  async function handleFinalizeWorkout() {
    if (!selectedStudentId.trim()) {
      toast({
        title: "Aluno obrigatorio",
        description: "Selecione um aluno do sistema antes de criar o treino.",
        tone: "warning",
      });
      return;
    }

    if (selectedExercises.length === 0) {
      toast({
        title: "Adicione exercicios",
        description: "Inclua pelo menos um exercicio antes de finalizar.",
        tone: "warning",
      });
      return;
    }

    const parsedDuration = Number(estimatedDurationMin);
    if (!Number.isFinite(parsedDuration) || parsedDuration < 10) {
      toast({
        title: "Duracao invalida",
        description:
          "Informe uma duracao estimada maior ou igual a 10 minutos.",
        tone: "warning",
      });
      return;
    }

    const safeStars = clamp(Math.round(starsReward), 50, 200);
    const hasAssistantExercise = selectedExercises.some(
      (exercise) => exercise.source === "assistant",
    );

    const payload: CreatePersonalWorkoutInput = {
      studentId: selectedStudentId.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      frequencyWeekly: 3,
      muscleGroups,
      intensity,
      starsReward: safeStars,
      estimatedDurationMin: Math.round(parsedDuration),
      source: hasAssistantExercise ? "assistant" : "manual",
      exercises: selectedExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        restSec: exercise.restSec,
        suggestedLoadKg: exercise.suggestedLoadKg,
        muscleGroup: exercise.bodyRegion,
        equipment: exercise.equipment,
        durationMin: 6,
        supportMedia: exercise.supportMedia ?? null,
      })),
    };

    try {
      await onCreateWorkout(payload);
      toast({
        title: "Treino criado com sucesso",
        description: "Treino salvo e pronto para uso.",
        tone: "success",
      });

      setCurrentStep(0);
      setSelectedStudentId("");
      setTitle("");
      setDescription("");
      setTargetGender("masculino");
      setMuscleGroups([]);
      setIntensity("intermediario");
      setStarsReward(90);
      setEstimatedDurationMin("45");
      setAssistantSuggestions([]);
      setSelectedExercises([]);
      onCreated?.();
    } catch (error) {
      toast({
        title: "Falha ao criar treino",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        tone: "danger",
      });
    }
  }

  return (
    <>
      <FqCard className="border-border bg-card lg:col-span-12 dark:border-primary/25 dark:bg-card/95 dark:shadow-[0_18px_48px_rgba(2,8,20,0.5)]">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {wizardSteps.map((step, index) => (
              <span
                key={step}
                className={cx(
                  "h-1.5 rounded-full transition-colors",
                  index <= currentStep
                    ? "bg-primary shadow-[0_0_10px_rgba(249,115,22,0.45)]"
                    : "bg-border/80 dark:bg-border",
                )}
              />
            ))}
            <FqText as="p" className="text-sm text-muted-foreground">
              {`Passo ${currentStep + 1} de ${wizardSteps.length}`}
            </FqText>
          </div>

          <div className="rounded-2xl border border-border bg-muted/15 p-4 md:p-6 dark:border-primary/20 dark:bg-gradient-to-b dark:from-slate-900/40 dark:to-slate-800/25">
            {currentStep === 0 ? (
              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                    <FqIcon name="dumbbell" size={22} />
                  </div>
                  <FqText
                    as="p"
                    className="text-xl font-semibold text-foreground"
                  >
                    Nome do treino
                  </FqText>
                  <FqText
                    as="p"
                    className="text-sm text-muted-foreground dark:text-foreground/75"
                  >
                    Defina nome, descricao e para qual sexo o treino foi
                    pensado.
                  </FqText>
                </div>

                <FqInput
                  label="Nome"
                  placeholder="Ex: Treino A - Peito e Triceps"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <FqSelect
                  label="Aluno"
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  options={studentOptions}
                  placeholder="Selecione um aluno"
                  helperText="Lista carregada diretamente do sistema."
                />
                <FqTextarea
                  label="Descricao"
                  placeholder="Descreva brevemente o objetivo deste treino..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  size="sm"
                />
                <FqSelect
                  label="Treino para"
                  value={targetGender}
                  onChange={(event) =>
                    setTargetGender(
                      event.target.value as "masculino" | "feminino",
                    )
                  }
                  options={targetGenderOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                />
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <FqText
                    as="p"
                    className="text-xl font-semibold text-foreground"
                  >
                    Grupos musculares
                  </FqText>
                  <FqText
                    as="p"
                    className="text-sm text-muted-foreground dark:text-foreground/75"
                  >
                    Clique no corpo ou nos botoes abaixo para selecionar.
                  </FqText>
                </div>

                <div className="flex flex-row justify-between">
                  <div className="h-[420px] mx-3 w-full rounded-2xl border border-border/70 bg-white ">
                    <InteractiveBodySvg
                      svgRaw={bodySvgRaw}
                      shadingPngSrc={bodyPng}
                      muscleMap={bodyMuscleMap}
                      hoverColor="#0066FF"
                      hoverOpacity={0.52}
                      selectedColor="#0066FF"
                      selectedOpacity={0.82}
                      selectedIds={muscleGroups}
                      onSelectedIdsChange={(ids) => setMuscleGroups(ids)}
                      onHoverIdChange={(id) => setHoveredMuscleGroup(id)}
                      getLabel={getMuscleGroupLabel}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {muscleGroupOptions.map((group) => {
                      const isSelected = muscleGroups.includes(group.value);
                      const isHovered = hoveredMuscleGroup === group.value;
                      return (
                        <button
                          type="button"
                          key={group.value}
                          className={cx(
                            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : isHovered
                                ? "border-primary/60 bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground dark:border-border dark:bg-slate-900/55 dark:text-foreground/80 dark:hover:border-primary/70 dark:hover:bg-primary/15 dark:hover:text-foreground",
                          )}
                          onClick={() => toggleMuscleGroup(group.value)}
                        >
                          {group.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {muscleGroups.length > 0 ? (
                  <div className="rounded-xl border border-primary/25 bg-primary/8 p-3 dark:bg-primary/12">
                    <FqText
                      as="p"
                      className="mb-2 text-xs font-medium text-muted-foreground dark:text-foreground/80"
                    >
                      Selecionados ({muscleGroups.length})
                    </FqText>
                    <div className="flex flex-wrap gap-1.5">
                      {muscleGroups.map((group) => (
                        <button
                          key={`sel-${group}`}
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition hover:opacity-80"
                          onClick={() => toggleMuscleGroup(group)}
                        >
                          {getMuscleGroupLabel(group)}
                          <FqIcon name="x" size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                    <FqIcon name="star" size={22} />
                  </div>
                  <FqText
                    as="p"
                    className="text-xl font-semibold text-foreground"
                  >
                    Intensidade
                  </FqText>
                  <FqText
                    as="p"
                    className="text-sm text-muted-foreground dark:text-foreground/75"
                  >
                    Ajuste nivel, estrelas e duracao estimada.
                  </FqText>
                </div>

                <div className="space-y-2">
                  {intensityOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={cx(
                        "w-full rounded-xl border p-3 text-left transition",
                        intensity === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                      onClick={() => setIntensity(option.value)}
                    >
                      <div className="flex items-center gap-2">
                        <FqIcon
                          name={option.icon}
                          size={16}
                          className="text-primary"
                        />
                        <FqText
                          as="p"
                          className="text-sm font-semibold text-foreground"
                        >
                          {option.label}
                        </FqText>
                      </div>
                      <FqText as="p" className="text-xs text-muted-foreground">
                        {option.description}
                      </FqText>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FqText
                      as="p"
                      className="text-sm font-medium text-foreground"
                    >
                      Estrelas do treino
                    </FqText>
                    <FqBadge tone="warning">{starsReward}</FqBadge>
                  </div>
                  <FqSlider
                    min={50}
                    max={200}
                    step={5}
                    value={starsReward}
                    onChange={(event) =>
                      setStarsReward(clamp(Number(event.target.value), 50, 200))
                    }
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Minimo 50</span>
                    <span>Maximo 200</span>
                  </div>
                </div>

                <FqInput
                  label="Duracao estimada (minutos)"
                  type="number"
                  min={10}
                  max={240}
                  value={estimatedDurationMin}
                  onChange={(event) =>
                    setEstimatedDurationMin(event.target.value)
                  }
                />
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="space-y-4">
                <div className="space-y-1 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                    <FqIcon name="flask" size={22} />
                  </div>
                  <FqText
                    as="p"
                    className="text-xl font-semibold text-foreground"
                  >
                    Exercicios
                  </FqText>
                  <FqText
                    as="p"
                    className="text-sm text-muted-foreground dark:text-foreground/75"
                  >
                    Selecione exercicios com IA ou adicione manualmente.
                  </FqText>
                </div>

                <div className="rounded-xl border border-primary/25 bg-primary/8 p-3 text-sm text-foreground dark:bg-primary/12">
                  Mostrando exercicios apenas para os grupos selecionados:{" "}
                  {muscleGroups.length > 0
                    ? muscleGroups.map(getMuscleGroupLabel).join(", ")
                    : "nenhum"}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className={cx(
                      "rounded-2xl border px-4 py-4 text-sm font-semibold transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isAssistantDisabled
                        ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                        : "border-primary bg-primary text-primary-foreground hover:opacity-95",
                    )}
                    disabled={isAssistantDisabled}
                    onClick={() => {
                      setAssistantModalStep("filters");
                      setIsAssistantModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FqIcon name="flask" size={16} />
                      <span>Assistente IA</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-border bg-card px-4 py-4 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
                    onClick={() => setIsManualModalOpen(true)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FqIcon name="plus" size={16} />
                      <span>Adicionar manual</span>
                    </div>
                  </button>
                </div>

                {assistantAssetsError ? (
                  <FqAlert tone="warning" title="Assistente IA indisponivel">
                    {assistantAssetsError}
                  </FqAlert>
                ) : null}

                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <FqText
                        as="p"
                        className="text-base font-semibold text-foreground"
                      >
                        Biblioteca de exercicios
                      </FqText>
                      <div className="flex items-center gap-2">
                        <FqBadge tone="secondary">
                          {libraryFilteredExercises.length} encontrados
                        </FqBadge>
                        <FqBadge tone="primary">
                          {selectedLibraryExerciseIds.length} selecionados
                        </FqBadge>
                      </div>
                    </div>
                    <FqText as="p" className="text-xs text-muted-foreground">
                      Conteudo enriquecido da base PT-BR com foto, tipo, nivel e
                      instrucoes.
                    </FqText>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <FqInput
                        label="Buscar exercicio"
                        placeholder="Ex: supino, remada, agachamento..."
                        value={librarySearchValue}
                        onChange={(event) =>
                          setLibrarySearchValue(event.target.value)
                        }
                      />
                      <FqSelect
                        label="Grupo muscular"
                        value={libraryMuscleGroup}
                        onChange={(event) =>
                          setLibraryMuscleGroup(event.target.value)
                        }
                        options={libraryMuscleGroupOptions}
                      />
                      <FqSelect
                        label="Equipamento"
                        value={libraryEquipment}
                        onChange={(event) =>
                          setLibraryEquipment(event.target.value)
                        }
                        options={libraryEquipmentOptions}
                      />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <FqButton
                        variant="outline"
                        tone="neutral"
                        onClick={handleToggleSelectVisibleLibraryExercises}
                        leftIcon={isAllVisibleLibrarySelected ? "x" : "check"}
                        isDisabled={visibleLibraryExercises.length === 0}
                      >
                        {isAllVisibleLibrarySelected
                          ? "Limpar selecao visivel"
                          : "Selecionar visiveis"}
                      </FqButton>
                      <FqButton
                        onClick={handleAddSelectedLibraryExercises}
                        isDisabled={selectedLibraryExerciseIds.length === 0}
                        leftIcon="plus"
                      >
                        Adicionar selecionados (
                        {selectedLibraryExerciseIds.length})
                      </FqButton>
                    </div>

                    {libraryFilteredExercises.length === 0 ? (
                      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                        Nenhum exercicio encontrado para os filtros atuais.
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {visibleLibraryExercises.map((exercise) => {
                            const summary =
                              exercise.instructions || exercise.overview || "";
                            const isAlreadySelected = selectedExercises.some(
                              (item) =>
                                item.name.toLowerCase() ===
                                getExerciseDisplayName(exercise).toLowerCase(),
                            );
                            const isMarked = selectedLibraryExerciseIdSet.has(
                              exercise.id,
                            );

                            return (
                              <article
                                key={`library-${exercise.id}`}
                                className={cx(
                                  "overflow-hidden rounded-xl border bg-card transition hover:border-primary/45 hover:shadow-sm",
                                  isMarked
                                    ? "border-primary shadow-[0_0_0_1px_rgba(249,115,22,0.35)]"
                                    : "border-border",
                                )}
                              >
                                <div className="relative aspect-video w-full bg-muted/45">
                                  {exercise.thumbnail_url ? (
                                    <img
                                      src={exercise.thumbnail_url}
                                      alt={getExerciseDisplayName(exercise)}
                                      loading="lazy"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                      <FqIcon name="image" size={20} />
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    className={cx(
                                      "absolute right-2 top-2 inline-flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition",
                                      isMarked
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border/80 bg-background/90 text-foreground hover:border-primary/45 hover:text-primary",
                                    )}
                                    onClick={() =>
                                      handleToggleLibraryExercise(exercise.id)
                                    }
                                  >
                                    <FqIcon
                                      name={isMarked ? "check" : "plus"}
                                      size={12}
                                    />
                                    {isMarked ? "Selecionado" : "Selecionar"}
                                  </button>
                                </div>
                                <div className="space-y-2 p-3">
                                  <FqText
                                    as="p"
                                    className="text-sm font-semibold text-foreground"
                                  >
                                    {getExerciseDisplayName(exercise)}
                                  </FqText>
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                      {getMuscleGroupLabel(
                                        exercise.body_region,
                                      )}
                                    </span>
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                      {getEquipmentLabel(exercise.equipment)}
                                    </span>
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                      {exercise.difficulty}
                                    </span>
                                    {exercise.exercise_type ? (
                                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        {exercise.exercise_type}
                                      </span>
                                    ) : null}
                                  </div>
                                  {summary ? (
                                    <FqText
                                      as="p"
                                      className="text-xs text-muted-foreground"
                                    >
                                      {summary.length > 120
                                        ? `${summary.slice(0, 120)}...`
                                        : summary}
                                    </FqText>
                                  ) : null}
                                  <div className="flex items-center justify-between gap-2">
                                    <FqText
                                      as="p"
                                      className="text-[11px] text-muted-foreground"
                                    >
                                      {exercise.views
                                        ? `${formatCompactNumber(exercise.views)} visualizacoes`
                                        : "Sem metricas"}
                                      {typeof exercise.comments_count ===
                                      "number"
                                        ? ` • ${exercise.comments_count} comentarios`
                                        : ""}
                                    </FqText>
                                    <div className="flex items-center gap-1.5">
                                      {exercise.source_url ? (
                                        <a
                                          href={exercise.source_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/35 hover:text-primary"
                                          onClick={(event) =>
                                            event.stopPropagation()
                                          }
                                        >
                                          Fonte
                                        </a>
                                      ) : null}
                                      <button
                                        type="button"
                                        className={cx(
                                          "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                                          isAlreadySelected
                                            ? "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                                            : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
                                        )}
                                        disabled={isAlreadySelected}
                                        onClick={() => {
                                          const wasAdded =
                                            handleAddCatalogExercise(
                                              exercise,
                                              "manual",
                                            );
                                          if (wasAdded) {
                                            setSelectedLibraryExerciseIds(
                                              (current) =>
                                                current.filter(
                                                  (id) => id !== exercise.id,
                                                ),
                                            );
                                          }
                                        }}
                                      >
                                        {isAlreadySelected
                                          ? "Adicionado"
                                          : "Adicionar"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>

                        {hasMoreLibraryExercises ? (
                          <FqButton
                            variant="outline"
                            tone="neutral"
                            className="w-full"
                            onClick={() =>
                              setLibraryVisibleCount((current) => current + 12)
                            }
                          >
                            Mostrar mais exercicios
                          </FqButton>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <FqText
                      as="p"
                      className="text-base font-semibold text-foreground"
                    >
                      Exercicios ({selectedExercises.length})
                    </FqText>
                  </div>

                  {selectedExercises.length === 0 ? (
                    <div className="flex min-h-44 flex-col items-center justify-center gap-2 p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                        <FqIcon
                          name="flask"
                          size={24}
                          className="text-muted-foreground"
                        />
                      </div>
                      <FqText
                        as="p"
                        className="text-lg font-semibold text-foreground"
                      >
                        Nenhum exercicio ainda
                      </FqText>
                      <FqText as="p" className="text-sm text-muted-foreground">
                        Use o assistente IA ou adicione manualmente.
                      </FqText>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {selectedExercises.map((exercise, index) => (
                        <li
                          key={exercise.id}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move";
                            setDraggingExerciseId(exercise.id);
                          }}
                          onDragOver={(event) => {
                            event.preventDefault();
                            if (
                              draggingExerciseId &&
                              draggingExerciseId !== exercise.id
                            ) {
                              setDragOverExerciseId(exercise.id);
                            }
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggingExerciseId) {
                              moveExercise(draggingExerciseId, exercise.id);
                            }
                            setDraggingExerciseId(null);
                            setDragOverExerciseId(null);
                          }}
                          onDragEnd={() => {
                            setDraggingExerciseId(null);
                            setDragOverExerciseId(null);
                          }}
                          className={cx(
                            "px-4 py-3 transition-colors",
                            dragOverExerciseId === exercise.id
                              ? "bg-primary/5"
                              : "",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              className="mt-0.5 inline-flex h-6 w-6 cursor-grab items-center justify-center rounded-md bg-muted text-muted-foreground active:cursor-grabbing"
                              aria-label="Arrastar exercicio"
                            >
                              <FqIcon name="list" size={14} />
                            </button>
                            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                              {index + 1}
                            </span>
                            <div className="flex-1 space-y-2">
                              <FqText
                                as="p"
                                className="text-base font-semibold text-foreground"
                              >
                                {exercise.name}
                              </FqText>
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {getMuscleGroupLabel(exercise.bodyRegion)}
                                </span>
                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {getEquipmentLabel(exercise.equipment)}
                                </span>
                                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {exercise.source === "assistant"
                                    ? "IA"
                                    : "Manual"}
                                </span>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-4">
                                <FqInput
                                  label="Series"
                                  size="sm"
                                  type="number"
                                  min={1}
                                  max={8}
                                  value={exercise.sets}
                                  onChange={(event) =>
                                    updateExerciseNumeric(
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
                                    updateExerciseNumeric(
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
                                  max={240}
                                  value={exercise.restSec}
                                  onChange={(event) =>
                                    updateExerciseNumeric(
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
                                  max={250}
                                  value={exercise.suggestedLoadKg}
                                  onChange={(event) =>
                                    updateExerciseNumeric(
                                      exercise.id,
                                      "suggestedLoadKg",
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <FqIconButton
                              icon="trash"
                              label="Remover exercicio"
                              tone="danger"
                              onClick={() =>
                                setSelectedExercises((current) =>
                                  current.filter(
                                    (item) => item.id !== exercise.id,
                                  ),
                                )
                              }
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <FqButton
              variant="outline"
              tone="neutral"
              onClick={handlePreviousStep}
              isDisabled={currentStep === 0}
              leftIcon="arrowLeft"
            >
              Voltar
            </FqButton>
            {currentStep === wizardSteps.length - 1 ? (
              <FqButton
                onClick={() => void handleFinalizeWorkout()}
                isLoading={isCreatingWorkout}
                isDisabled={!canProceed}
                leftIcon="check"
              >
                Finalizar e ativar treino
              </FqButton>
            ) : (
              <FqButton
                onClick={handleNextStep}
                isDisabled={!canProceed}
                rightIcon="arrowRight"
              >
                Continuar
              </FqButton>
            )}
          </div>
        </div>
      </FqCard>

      <FqModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
        title="Adicionar exercicio"
        description="Selecione um exercicio existente ou crie um novo."
      >
        <div className="space-y-3">
          <FqSelect
            label="Exercicio"
            value={manualExerciseValue}
            onChange={(event) => handleSelectManualExercise(event.target.value)}
            options={manualExerciseOptions}
            placeholder="Selecione"
          />

          {manualExerciseValue === MANUAL_NEW_OPTION ? (
            <FqInput
              label="Novo nome do exercicio"
              value={manualCustomExerciseName}
              placeholder="Ex: Supino reto com barra"
              onChange={(event) =>
                setManualCustomExerciseName(event.target.value)
              }
            />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <FqSelect
              label="Grupo muscular"
              value={manualMuscleGroup}
              onChange={(event) => setManualMuscleGroup(event.target.value)}
              options={manualMuscleGroupOptions}
            />
            <FqSelect
              label="Equipamento"
              value={manualEquipment}
              onChange={(event) => setManualEquipment(event.target.value)}
              options={equipmentOptions}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <FqInput
              label="Series"
              type="number"
              min={1}
              max={8}
              value={manualSets}
              onChange={(event) => setManualSets(event.target.value)}
            />
            <FqInput
              label="Reps"
              type="number"
              min={1}
              max={30}
              value={manualReps}
              onChange={(event) => setManualReps(event.target.value)}
            />
            <FqInput
              label="Descanso (s)"
              type="number"
              min={20}
              max={240}
              value={manualRestSec}
              onChange={(event) => setManualRestSec(event.target.value)}
            />
            <FqInput
              label="Carga (kg)"
              type="number"
              min={0}
              max={250}
              value={manualSuggestedLoadKg}
              onChange={(event) => setManualSuggestedLoadKg(event.target.value)}
            />
          </div>
          <FqButton className="w-full" onClick={handleAddManualExercise}>
            Adicionar exercicio
          </FqButton>
        </div>
      </FqModal>

      <FqModal
        open={isAssistantModalOpen}
        onOpenChange={setIsAssistantModalOpen}
        title="Assistente de exercicios"
        description={
          assistantModalStep === "filters"
            ? "Configure os filtros para gerar sugestoes personalizadas."
            : "Clique em um exercicio para adicionar ao treino."
        }
        className="w-[min(740px,94vw)]"
      >
        {assistantModalStep === "filters" ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <FqSelect
                label="Biotipo"
                value={assistantFilters.biotipo ?? ""}
                onChange={(event) =>
                  setAssistantFilters((current) => ({
                    ...current,
                    biotipo: event.target.value,
                  }))
                }
                options={[
                  { value: "ectomorfo", label: "Ectomorfo" },
                  { value: "mesomorfo", label: "Mesomorfo" },
                  { value: "endomorfo", label: "Endomorfo" },
                ]}
              />
              <FqSelect
                label="Sexo"
                value={assistantFilters.sexo ?? ""}
                onChange={(event) =>
                  setTargetGender(
                    event.target.value as "masculino" | "feminino",
                  )
                }
                options={[
                  { value: "masculino", label: "Male" },
                  { value: "feminino", label: "Female" },
                ]}
              />
            </div>
            <FqSelect
              label="Objetivo"
              value={assistantFilters.objetivo ?? ""}
              onChange={(event) =>
                setAssistantFilters((current) => ({
                  ...current,
                  objetivo: event.target.value,
                }))
              }
              options={[
                { value: "hipertrofia", label: "Ganho de massa" },
                { value: "forca", label: "Forca" },
                { value: "emagrecimento", label: "Emagrecimento" },
                { value: "resistencia", label: "Resistencia" },
                { value: "saude", label: "Saude" },
              ]}
            />
            <FqSelect
              label="Experiencia"
              value={assistantFilters.experiencia ?? ""}
              onChange={(event) =>
                setAssistantFilters((current) => ({
                  ...current,
                  experiencia: event.target.value,
                }))
              }
              options={[
                { value: "iniciante", label: "Iniciante" },
                { value: "intermediario", label: "Intermediario" },
                { value: "avancado", label: "Avancado" },
              ]}
            />
            <FqButton
              className="w-full"
              isLoading={isGeneratingSuggestions}
              onClick={() => void handleGenerateSuggestions()}
            >
              Gerar sugestoes
            </FqButton>
            {classifierSignature ? (
              <FqText
                as="p"
                className="text-center text-xs text-muted-foreground"
              >
                Classificador carregado • assinatura {classifierSignature}
              </FqText>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {assistantSuggestions.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                Sem mais sugestoes disponiveis. Gere novas sugestoes.
              </div>
            ) : (
              <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
                {assistantSuggestions.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    className="w-full rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => handleAddSuggestion(exercise)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
                        {exercise.thumbnail_url ? (
                          <img
                            src={exercise.thumbnail_url}
                            alt={exercise.name_en?.trim() || exercise.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <FqIcon name="flask" size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <FqText
                          as="p"
                          className="text-base font-semibold text-foreground"
                        >
                          {exercise.name_en?.trim() || exercise.name}
                        </FqText>
                        <FqText
                          as="p"
                          className="text-sm text-muted-foreground"
                        >
                          {getMuscleGroupLabel(exercise.body_region)} •{" "}
                          {getEquipmentLabel(exercise.equipment)} • score{" "}
                          {exercise.score}
                        </FqText>
                        {exercise.exercise_type ? (
                          <FqText
                            as="p"
                            className="text-xs text-muted-foreground"
                          >
                            {exercise.exercise_type}
                          </FqText>
                        ) : null}
                        {exercise.views ? (
                          <FqText
                            as="p"
                            className="text-xs text-muted-foreground"
                          >
                            {formatCompactNumber(exercise.views)} visualizacoes
                          </FqText>
                        ) : null}
                        {exercise.instructions ? (
                          <FqText
                            as="p"
                            className="mt-1 text-xs text-muted-foreground"
                          >
                            {exercise.instructions}
                          </FqText>
                        ) : null}
                      </div>
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FqIcon name="plus" size={16} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <FqButton
              variant="outline"
              tone="neutral"
              className="w-full"
              onClick={() => {
                setAssistantModalStep("filters");
                setAssistantSuggestions([]);
              }}
            >
              Gerar novas sugestoes
            </FqButton>
          </div>
        )}
      </FqModal>
    </>
  );
}
