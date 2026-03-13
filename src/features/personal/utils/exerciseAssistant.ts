import type { PersonalWorkoutIntensity } from '@/shared/services/contracts/personal'

// Browser-safe port of scripts/exercise-classifier.js.
export type AssistantExercise = {
  id: string
  name: string
  name_en?: string
  primary_muscle?: string
  secondary_muscles?: string[]
  equipment: string
  movement_type: string
  difficulty: string
  body_region: string
  mechanics: string
  instructions?: string
  tips?: string[]
  common_mistakes?: string[]
  thumbnail_url?: string
  source_url?: string
  overview?: string
  exercise_type?: string
  views?: number
  comments_count?: number
}

export type AssistantProfile = {
  porte_fisico?: string
  biotipo?: string
  sexo?: string
  objetivo?: string
  experiencia?: string
  foco_muscular?: string[]
  equipamentos_permitidos?: string[]
  equipamentos_restritos?: string[]
  regioes_restritas?: string[]
}

export type AssistantFilters = AssistantProfile & {
  limite?: number
}

export type RankedAssistantExercise = AssistantExercise & {
  score: number
  reasons: string[]
}

type ScorePayload = {
  value: number
  reasons: string[]
}

type RawPtbrExercise = {
  id?: string
  nome?: string
  url?: string
  video_thumbnail_url?: string
  visualizacoes?: number
  qtde_comentarios?: number
  grupo_muscular_principal?: string
  musculos_secundarios?: string[]
  tipo_de_exercicio?: string
  equipamento_necessario?: string
  mecanica?: string
  nivel_de_experiencia?: string
  tipo_de_forca?: string
  visao_geral?: string
  instrucoes?: string[] | string
  dicas?: string[]
}

const VALID_OBJECTIVES = new Set(['hipertrofia', 'forca', 'emagrecimento', 'resistencia', 'saude'])
const VALID_EXPERIENCE = new Set(['iniciante', 'intermediario', 'avancado'])

const PTBR_BODY_REGION_MAP: Record<string, string> = {
  abdomen: 'abdomen',
  abdutores: 'abdutores',
  adutores: 'adutores',
  antebracos: 'antebracos',
  banda_iliotibial: 'quadriceps',
  biceps: 'biceps',
  dorsal: 'dorcal',
  fascia_palmar: 'antebracos',
  fascia_plantar: 'panturrilhas',
  flexores_do_quadril: 'flexores_do_quadril',
  gluteos: 'gluteos',
  lombar: 'inferior_das_costas',
  obliquos: 'obliquos',
  ombros: 'ombro',
  panturrilhas: 'panturrilhas',
  parte_superior_das_costas: 'superior_de_costas',
  peito: 'peitoral',
  pescoco: 'trapezio',
  posteriores_de_coxa: 'isquiotibiais',
  quadriceps: 'quadriceps',
  trapezio: 'trapezio',
  triceps: 'triceps',
}

const PTBR_EQUIPMENT_MAP: Record<string, string> = {
  aneis: 'peso_corporal',
  banco: 'outro',
  barra: 'barra',
  barra_de_seguranca: 'barra',
  barra_ez: 'barra',
  barra_gorda: 'barra',
  barra_trap: 'barra',
  bola_de_exercicio: 'peso_corporal',
  bola_de_lacrosse: 'outro',
  bola_medicinal: 'outro',
  cabo_polia: 'cabo',
  caixa: 'outro',
  cauda_de_tigre: 'outro',
  corda: 'outro',
  correntes: 'outro',
  elasticos: 'elastico',
  halteres: 'halter',
  kettlebell: 'kettlebell',
  maquina: 'maquina',
  mina_terrestre: 'barra',
  outro: 'outro',
  peso_corporal: 'peso_corporal',
  pneu: 'outro',
  propulsor_de_quadril: 'maquina',
  pular_corda: 'peso_corporal',
  rolo_de_liberacao_miofascial: 'outro',
  treno: 'outro',
  valslide: 'peso_corporal',
}

export function normalizeText(value: unknown): string {
  if (!value) {
    return ''
  }

  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function toSlug(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function mapPtbrBodyRegion(group: string | undefined): string {
  const key = normalizeText(group).replace(/\s+/g, '_')
  return PTBR_BODY_REGION_MAP[key] ?? 'fullbody'
}

function mapPtbrEquipment(equipment: string | undefined): string {
  const key = normalizeText(equipment).replace(/\s+/g, '_')
  return PTBR_EQUIPMENT_MAP[key] ?? 'outro'
}

function mapPtbrMovementType(mechanics: string | undefined): string {
  return normalizeText(mechanics) === 'isolado' ? 'isolado' : 'composto'
}

function mapPtbrDifficulty(level: string | undefined): string {
  const normalized = normalizeText(level)
  if (normalized === 'avancado') return 'avancado'
  if (normalized === 'intermediario') return 'intermediario'
  return 'iniciante'
}

function mapPtbrMechanics(forceType: string | undefined, exerciseName: string | undefined): string {
  const normalizedForceType = normalizeText(forceType)
  const normalizedExerciseName = normalizeText(exerciseName)

  if (normalizedForceType.includes('empurrar') || normalizedForceType.includes('imprensa')) {
    return 'empurrar'
  }
  if (normalizedForceType.includes('puxar')) {
    return 'puxar'
  }
  if (normalizedForceType.includes('dobradica')) {
    return 'hinge'
  }
  if (normalizedExerciseName.includes('agach')) {
    return 'agachar'
  }
  return 'estabilizacao'
}

function mapPtbrExercise(rawExercise: RawPtbrExercise, index: number): AssistantExercise | null {
  const exerciseName = rawExercise.nome?.trim()
  if (!exerciseName) {
    return null
  }

  const normalizedSecondaryMuscles = Array.isArray(rawExercise.musculos_secundarios)
    ? rawExercise.musculos_secundarios
      .map((muscle) => muscle?.trim())
      .filter((muscle): muscle is string => Boolean(muscle) && normalizeText(muscle) !== 'nenhum')
    : []

  const movementType = mapPtbrMovementType(rawExercise.mecanica)
  const bodyRegion = mapPtbrBodyRegion(rawExercise.grupo_muscular_principal)
  const instructions = Array.isArray(rawExercise.instrucoes)
    ? rawExercise.instrucoes.map((line) => line.trim()).filter(Boolean).join(' ')
    : rawExercise.instrucoes?.trim()

  return {
    id: rawExercise.id?.trim() || `${bodyRegion}_${toSlug(exerciseName)}_${index}`,
    name: exerciseName,
    primary_muscle: rawExercise.grupo_muscular_principal?.trim(),
    secondary_muscles: normalizedSecondaryMuscles,
    equipment: mapPtbrEquipment(rawExercise.equipamento_necessario),
    movement_type: movementType,
    difficulty: mapPtbrDifficulty(rawExercise.nivel_de_experiencia),
    body_region: bodyRegion,
    mechanics: mapPtbrMechanics(rawExercise.tipo_de_forca, exerciseName),
    instructions,
    tips: Array.isArray(rawExercise.dicas) ? rawExercise.dicas.map((line) => line.trim()).filter(Boolean) : undefined,
    thumbnail_url: rawExercise.video_thumbnail_url?.trim() || undefined,
    source_url: rawExercise.url?.trim() || undefined,
    overview: rawExercise.visao_geral?.trim() || undefined,
    exercise_type: rawExercise.tipo_de_exercicio?.trim() || undefined,
    views: typeof rawExercise.visualizacoes === 'number' ? rawExercise.visualizacoes : undefined,
    comments_count: typeof rawExercise.qtde_comentarios === 'number' ? rawExercise.qtde_comentarios : undefined,
  }
}

async function loadAssistantCatalog(): Promise<AssistantExercise[]> {
  const { default: ptbrCatalog } = await import('@/data-final/exercises_all_ptbr.json')
  const ptbrCatalogPayload = ptbrCatalog as unknown as RawPtbrExercise[]

  if (!Array.isArray(ptbrCatalogPayload)) {
    throw new Error('Arquivo de exercicios PT-BR invalido.')
  }

  const mappedCatalog = ptbrCatalogPayload
    .map((exercise, index) => mapPtbrExercise(exercise, index))
    .filter((exercise): exercise is AssistantExercise => Boolean(exercise))

  if (mappedCatalog.length === 0) {
    throw new Error('Nao foi possivel carregar o catalogo de exercicios.')
  }

  return mappedCatalog
}

function scoreObjective(exercise: AssistantExercise, objective: string): ScorePayload {
  const score: ScorePayload = { value: 0, reasons: [] }

  if (!objective) {
    return score
  }

  if (objective === 'forca') {
    if (exercise.movement_type === 'composto') {
      score.value += 20
      score.reasons.push('composto favorece ganho de forca')
    }
    if (['barra', 'halter', 'smith'].includes(exercise.equipment)) {
      score.value += 10
      score.reasons.push('equipamento livre util para sobrecarga progressiva')
    }
    if (['agachar', 'hinge', 'empurrar', 'puxar'].includes(exercise.mechanics)) {
      score.value += 10
      score.reasons.push('padrao mecanico relevante para forca')
    }
  }

  if (objective === 'hipertrofia') {
    if (exercise.movement_type === 'composto') {
      score.value += 12
      score.reasons.push('composto ajuda no volume total')
    }
    if (exercise.movement_type === 'isolado') {
      score.value += 8
      score.reasons.push('isolado ajuda a enfatizar grupos especificos')
    }
    if (['maquina', 'cabo', 'halter', 'barra'].includes(exercise.equipment)) {
      score.value += 8
      score.reasons.push('equipamento favoravel para controle de tensao')
    }
  }

  if (objective === 'emagrecimento') {
    if (exercise.movement_type === 'composto') {
      score.value += 18
      score.reasons.push('composto aumenta demanda energetica')
    }
    if (['fullbody', 'pernas', 'costas'].includes(exercise.body_region)) {
      score.value += 12
      score.reasons.push('grandes grupos musculares elevam gasto calorico')
    }
    if (exercise.mechanics === 'estabilizacao') {
      score.value += 4
      score.reasons.push('estabilizacao melhora controle corporal')
    }
  }

  if (objective === 'resistencia') {
    if (exercise.difficulty === 'iniciante' || exercise.difficulty === 'intermediario') {
      score.value += 10
      score.reasons.push('dificuldade adequada para maior repeticao')
    }
    if (exercise.movement_type === 'composto') {
      score.value += 10
      score.reasons.push('composto facilita circuitos e blocos longos')
    }
    if (['peso_corporal', 'elastico', 'cabo', 'kettlebell'].includes(exercise.equipment)) {
      score.value += 8
      score.reasons.push('equipamento pratico para volume de treino')
    }
  }

  if (objective === 'saude') {
    if (exercise.difficulty === 'iniciante') {
      score.value += 12
      score.reasons.push('dificuldade inicial adequada para adesao')
    }
    if (['estabilizacao', 'agachar', 'hinge'].includes(exercise.mechanics)) {
      score.value += 10
      score.reasons.push('padrao util para funcionalidade geral')
    }
    if (exercise.movement_type === 'composto') {
      score.value += 6
      score.reasons.push('composto melhora eficiencia de treino')
    }
  }

  return score
}

function scoreProfile(exercise: AssistantExercise, profile: AssistantFilters = {}) {
  const reasons: string[] = []
  let score = 0

  const objective = normalizeText(profile.objetivo)
  const experience = normalizeText(profile.experiencia)
  const bodyType = normalizeText(profile.biotipo)
  const bodySize = normalizeText(profile.porte_fisico)
  const focusAreas = (profile.foco_muscular ?? []).map(normalizeText)
  const allowedEquipment = (profile.equipamentos_permitidos ?? []).map(normalizeText)
  const blockedEquipment = (profile.equipamentos_restritos ?? []).map(normalizeText)
  const restrictedRegions = (profile.regioes_restritas ?? []).map(normalizeText)

  const objectiveScore = scoreObjective(exercise, objective)
  score += objectiveScore.value
  reasons.push(...objectiveScore.reasons)

  if (focusAreas.length > 0 && focusAreas.includes(normalizeText(exercise.body_region))) {
    score += 30
    reasons.push('alinhado com foco muscular informado')
  }

  if (restrictedRegions.includes(normalizeText(exercise.body_region))) {
    score -= 1000
    reasons.push('regiao corporal restrita no perfil')
  }

  if (allowedEquipment.length > 0 && !allowedEquipment.includes(normalizeText(exercise.equipment))) {
    score -= 120
    reasons.push('fora dos equipamentos permitidos')
  }

  if (blockedEquipment.includes(normalizeText(exercise.equipment))) {
    score -= 120
    reasons.push('equipamento restrito')
  }

  if (experience === 'iniciante') {
    if (exercise.difficulty === 'iniciante') score += 16
    if (exercise.difficulty === 'intermediario') score += 4
    if (exercise.difficulty === 'avancado') score -= 30
  }
  if (experience === 'intermediario') {
    if (exercise.difficulty === 'intermediario') score += 10
    if (exercise.difficulty === 'iniciante') score += 2
    if (exercise.difficulty === 'avancado') score += 4
  }
  if (experience === 'avancado') {
    if (exercise.difficulty === 'avancado') score += 14
    if (exercise.difficulty === 'intermediario') score += 6
  }

  if (bodyType === 'ectomorfo') {
    if (exercise.movement_type === 'composto') score += 8
    if (['barra', 'halter'].includes(exercise.equipment)) score += 6
  }
  if (bodyType === 'endomorfo') {
    if (exercise.movement_type === 'composto') score += 10
    if (['fullbody', 'pernas', 'costas'].includes(exercise.body_region)) score += 6
  }
  if (bodyType === 'mesomorfo') {
    score += 2
  }

  if (bodySize === 'leve') {
    if (exercise.difficulty === 'iniciante') score += 8
    if (['peso_corporal', 'elastico', 'halter'].includes(exercise.equipment)) score += 6
  }
  if (bodySize === 'medio') {
    score += 2
  }
  if (bodySize === 'grande') {
    if (['barra', 'maquina', 'smith'].includes(exercise.equipment)) score += 8
    if (exercise.movement_type === 'composto') score += 4
  }

  return {
    score,
    reasons: Array.from(new Set(reasons)),
  }
}

export function classifyExercises(catalog: AssistantExercise[], filters: AssistantFilters, limit = 8): RankedAssistantExercise[] {
  const objective = normalizeText(filters.objetivo)
  const experience = normalizeText(filters.experiencia)
  const safeLimit = Math.max(1, Math.round(limit || filters.limite || 8))

  if (objective && !VALID_OBJECTIVES.has(objective)) {
    throw new Error(`Objetivo invalido: ${filters.objetivo}`)
  }

  if (experience && !VALID_EXPERIENCE.has(experience)) {
    throw new Error(`Experiencia invalida: ${filters.experiencia}`)
  }

  return catalog
    .map((exercise) => {
      const { score, reasons } = scoreProfile(exercise, filters)
      return { ...exercise, score, reasons }
    })
    .filter((exercise) => exercise.score > -500)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'pt-BR'))
    .slice(0, safeLimit)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function createExercisePrescription(input: {
  exercise: AssistantExercise
  intensity?: PersonalWorkoutIntensity
}) {
  const difficulty = normalizeText(input.intensity ?? input.exercise.difficulty)
  const movementType = normalizeText(input.exercise.movement_type)
  const equipment = normalizeText(input.exercise.equipment)

  let sets = 3
  let reps = 12
  let restSec = 60
  let suggestedLoadKg = 20

  if (difficulty === 'intermediario') {
    sets = 4
    reps = 10
    restSec = 75
    suggestedLoadKg = 26
  }

  if (difficulty === 'avancado') {
    sets = 5
    reps = 8
    restSec = 90
    suggestedLoadKg = 34
  }

  if (movementType === 'isolado') {
    reps += 2
    restSec = Math.max(45, restSec - 10)
    suggestedLoadKg -= 5
  }

  if (movementType === 'composto') {
    suggestedLoadKg += 4
  }

  if (['barra', 'smith'].includes(equipment)) {
    suggestedLoadKg += 6
  }

  if (['peso_corporal', 'elastico'].includes(equipment)) {
    suggestedLoadKg -= 8
  }

  return {
    sets: clamp(Math.round(sets), 2, 6),
    reps: clamp(Math.round(reps), 6, 20),
    restSec: clamp(Math.round(restSec), 30, 180),
    suggestedLoadKg: clamp(Math.round(suggestedLoadKg), 0, 120),
  }
}

export function mergeFocusAreas(selectedGroups: string[], profile?: AssistantProfile | null): string[] {
  const mappedSelected = selectedGroups.map(normalizeText).filter(Boolean)
  const mappedProfile = (profile?.foco_muscular ?? []).map(normalizeText).filter(Boolean)
  const unique = new Set([...mappedSelected, ...mappedProfile])
  return Array.from(unique)
}

export async function loadExerciseAssistantAssets() {
  const [catalog, profileModule] = await Promise.all([
    loadAssistantCatalog(),
    import('@/data-final/exercises_all_ptbr.json').then(() =>
      // perfil.json is still a small static asset
      fetch(`${import.meta.env.BASE_URL ?? '/'}perfil.json`).then(async (r) => {
        if (!r.ok) throw new Error('Nao foi possivel carregar perfil.json')
        return r.json() as Promise<AssistantProfile>
      })
    ),
  ])

  return {
    exercises: catalog,
    profile: profileModule,
    classifierSignature: catalog.length,
  }
}
