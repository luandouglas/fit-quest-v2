export type ExerciseFocusId =
  | 'biceps'
  | 'triceps'
  | 'ombro'
  | 'dorcal'
  | 'panturrilhas'
  | 'adutores'
  | 'peitoral'
  | 'antebracos'
  | 'isquiotibiais'
  | 'flexores_do_quadril'
  | 'obliquos'
  | 'abdomen'
  | 'inferior_das_costas'
  | 'abdutores'
  | 'trapezio'
  | 'quadriceps'
  | 'superior_de_costas'
  | 'gluteos'

type ExerciseFocusDefinition = {
  id: ExerciseFocusId
  label: string
  terms: string[]
}

type ExerciseFocusInput = {
  id?: string
  name?: string
  muscleGroup?: string
  note?: string
  equipment?: string
}

const exerciseFocusDefinitions: ExerciseFocusDefinition[] = [
  {
    id: 'ombro',
    label: 'Ombros',
    terms: [
      'ombro',
      'ombros',
      'shoulder',
      'shoulder press',
      'arnold press',
      'lateral raise',
      'front raise',
      'rear delt',
      'desenvolvimento',
      'elevacao lateral',
      'elevacao frontal',
      'deltoide',
      'deltoides',
    ],
  },
  {
    id: 'peitoral',
    label: 'Peito',
    terms: [
      'peito',
      'peitoral',
      'chest',
      'bench press',
      'incline bench',
      'decline bench',
      'chest press',
      'supino',
      'push up',
      'push-up',
      'flexao',
      'fly',
      'crucifixo',
    ],
  },
  {
    id: 'triceps',
    label: 'Triceps',
    terms: [
      'triceps',
      'tricep',
      'tricep dip',
      'dip',
      'coice',
      'testa',
      'extensao de triceps',
      'triceps pulley',
    ],
  },
  {
    id: 'biceps',
    label: 'Biceps',
    terms: ['biceps', 'bicep', 'curl', 'rosca', 'hammer curl', 'scott'],
  },
  {
    id: 'dorcal',
    label: 'Costas',
    terms: [
      'costas',
      'dorsal',
      'dorsais',
      'lat',
      'lats',
      'dorcal',
      'pulldown',
      'pull up',
      'pull-up',
      'chin up',
      'chin-up',
      'remada',
      'row',
      'puxada',
    ],
  },
  {
    id: 'superior_de_costas',
    label: 'Costas superiores',
    terms: ['upper back', 'costas superior', 'superior de costas', 'face pull'],
  },
  {
    id: 'trapezio',
    label: 'Trapezio',
    terms: ['trapezio', 'trap', 'shrug', 'encolhimento'],
  },
  {
    id: 'antebracos',
    label: 'Antebracos',
    terms: ['antebraco', 'antebracos', 'forearm', 'wrist curl'],
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    terms: ['abdomen', 'abdominal', 'abs', 'core', 'crunch', 'sit up', 'sit-up', 'prancha', 'plank'],
  },
  {
    id: 'obliquos',
    label: 'Obliquos',
    terms: ['obliquo', 'obliquos', 'russian twist', 'woodchopper'],
  },
  {
    id: 'quadriceps',
    label: 'Quadriceps',
    terms: [
      'quadriceps',
      'quad',
      'coxa anterior',
      'squat',
      'agachamento',
      'leg press',
      'passada',
      'lunge',
      'hack squat',
      'cadeira extensora',
      'extensora',
    ],
  },
  {
    id: 'isquiotibiais',
    label: 'Posterior de coxa',
    terms: ['isquiotibiais', 'hamstring', 'posterior de coxa', 'leg curl', 'mesa flexora', 'stiff', 'romanian deadlift'],
  },
  {
    id: 'gluteos',
    label: 'Gluteos',
    terms: ['gluteo', 'gluteos', 'hip thrust', 'glute bridge', 'kickback'],
  },
  {
    id: 'panturrilhas',
    label: 'Panturrilhas',
    terms: ['panturrilha', 'panturrilhas', 'calf', 'calf raise'],
  },
  {
    id: 'adutores',
    label: 'Adutores',
    terms: ['adutor', 'adutores'],
  },
  {
    id: 'abdutores',
    label: 'Abdutores',
    terms: ['abdutor', 'abdutores'],
  },
  {
    id: 'flexores_do_quadril',
    label: 'Flexores do quadril',
    terms: ['flexor do quadril', 'flexores do quadril', 'hip flexor', 'quadril'],
  },
  {
    id: 'inferior_das_costas',
    label: 'Lombar',
    terms: ['lombar', 'lombares', 'lower back', 'inferior das costas', 'back extension'],
  },
]

export function normalizeExerciseText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function buildSearchText(input: ExerciseFocusInput) {
  return [
    input.muscleGroup,
    input.name,
    input.note,
    input.id,
    input.equipment,
  ]
    .filter(Boolean)
    .map((value) => normalizeExerciseText(String(value)))
    .join(' | ')
}

export function resolveExerciseFocusIds(input: ExerciseFocusInput): ExerciseFocusId[] {
  const searchText = buildSearchText(input)

  if (!searchText) {
    return []
  }

  return exerciseFocusDefinitions
    .filter((definition) => definition.terms.some((term) => searchText.includes(normalizeExerciseText(term))))
    .map((definition) => definition.id)
}

export function resolveExerciseMuscleGroupLabel(input: ExerciseFocusInput): string | undefined {
  const explicit = input.muscleGroup?.trim()
  if (explicit) {
    const explicitMatch = resolveExerciseFocusIds({ muscleGroup: explicit })[0]

    if (explicitMatch) {
      return exerciseFocusDefinitions.find((definition) => definition.id === explicitMatch)?.label
    }

    return explicit
  }

  const primary = resolveExerciseFocusIds(input)[0]
  if (!primary) {
    return undefined
  }

  return exerciseFocusDefinitions.find((definition) => definition.id === primary)?.label
}

export function deriveWorkoutMuscleGroups(
  exercises: ExerciseFocusInput[],
  fallback?: string[],
) {
  const explicit = (fallback ?? [])
    .map((group) => resolveExerciseMuscleGroupLabel({ muscleGroup: group }) ?? group.trim())
    .filter(Boolean)

  if (explicit.length > 0) {
    return Array.from(new Set(explicit))
  }

  const inferred = exercises
    .map((exercise) => resolveExerciseMuscleGroupLabel(exercise))
    .filter((group): group is string => Boolean(group))

  return Array.from(new Set(inferred))
}
