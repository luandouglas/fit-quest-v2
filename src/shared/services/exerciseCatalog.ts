import type { WorkoutExercise, WorkoutSupportMedia } from '@/shared/services/contracts/workout'

export type PtbrExerciseCatalogEntry = {
  id?: string
  nome?: string
  url?: string
  video_thumbnail_url?: string
  grupo_muscular_principal?: string
  equipamento_necessario?: string
}

let catalogPromise: Promise<PtbrExerciseCatalogEntry[]> | null = null

function normalizeCatalogText(value: unknown) {
  if (!value) {
    return ''
  }

  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenize(value: string) {
  return normalizeCatalogText(value)
    .split(' ')
    .filter((token) => token.length > 2)
}

function scoreCatalogEntry(exercise: WorkoutExercise, entry: PtbrExerciseCatalogEntry) {
  const normalizedExerciseId = normalizeCatalogText(exercise.id)
  const normalizedEntryId = normalizeCatalogText(entry.id)
  const normalizedExerciseName = normalizeCatalogText(exercise.name)
  const normalizedEntryName = normalizeCatalogText(entry.nome)
  const normalizedExerciseGroup = normalizeCatalogText(exercise.muscleGroup)
  const normalizedEntryGroup = normalizeCatalogText(entry.grupo_muscular_principal)
  const normalizedExerciseEquipment = normalizeCatalogText(exercise.equipment)
  const normalizedEntryEquipment = normalizeCatalogText(entry.equipamento_necessario)

  let score = 0

  if (normalizedExerciseId && normalizedEntryId && normalizedExerciseId === normalizedEntryId) {
    score += 1200
  }

  if (normalizedExerciseName && normalizedEntryName && normalizedExerciseName === normalizedEntryName) {
    score += 900
  } else if (
    normalizedExerciseName &&
    normalizedEntryName &&
    (normalizedEntryName.includes(normalizedExerciseName) || normalizedExerciseName.includes(normalizedEntryName))
  ) {
    score += 260
  }

  const exerciseTokens = tokenize(exercise.name)
  const entryTokens = tokenize(entry.nome ?? '')
  const overlappingTokens = exerciseTokens.filter((token) => entryTokens.includes(token))
  score += overlappingTokens.length * 40

  if (normalizedExerciseGroup && normalizedEntryGroup && normalizedExerciseGroup === normalizedEntryGroup) {
    score += 120
  }

  if (normalizedExerciseEquipment && normalizedEntryEquipment && normalizedExerciseEquipment === normalizedEntryEquipment) {
    score += 40
  }

  return score
}

export async function loadPtbrExerciseCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch('/exercises_all_ptbr.json')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Nao foi possivel carregar exercises_all_ptbr.json')
        }

        const payload = await response.json() as PtbrExerciseCatalogEntry[]

        if (!Array.isArray(payload)) {
          throw new Error('Catalogo PT-BR invalido')
        }

        return payload
      })
  }

  return catalogPromise
}

export function findPtbrCatalogEntry(
  exercise: WorkoutExercise,
  catalog: PtbrExerciseCatalogEntry[],
) {
  let bestEntry: PtbrExerciseCatalogEntry | null = null
  let bestScore = 0

  for (const entry of catalog) {
    const score = scoreCatalogEntry(exercise, entry)

    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  return bestScore >= 160 ? bestEntry : null
}

export function buildCatalogSupportMedia(
  exercise: WorkoutExercise,
  entry: PtbrExerciseCatalogEntry | null,
): WorkoutSupportMedia | null {
  if (!entry?.video_thumbnail_url && !entry?.url) {
    return null
  }

  return {
    id: `${exercise.id}-catalog-media`,
    type: 'image',
    url: entry.url ?? entry.video_thumbnail_url ?? '#',
    thumbnailUrl: entry.video_thumbnail_url ?? undefined,
    label: 'Guia do exercicio',
  }
}
