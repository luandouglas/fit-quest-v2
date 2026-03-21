import { ImageIcon, PlayCircle } from 'lucide-react'

import { cx } from '@/shared/utils'

import type { WorkoutExercise } from '../types'

type ExercisePreviewVisualProps = {
  exercise: WorkoutExercise
  className?: string
}

function getPreviewImage(exercise: WorkoutExercise) {
  const media = exercise.supportMedia

  if (!media) {
    return null
  }

  if (media.thumbnailUrl) {
    return media.thumbnailUrl
  }

  if (media.type === 'image' || media.type === 'gif') {
    return media.url
  }

  return null
}

function getPreviewLabel(exercise: WorkoutExercise) {
  if (exercise.muscleGroup) {
    return exercise.muscleGroup
  }

  if (exercise.equipment) {
    return exercise.equipment
  }

  return 'Catalogo do exercicio'
}

export function ExercisePreviewVisual({ exercise, className }: ExercisePreviewVisualProps) {
  const previewImage = getPreviewImage(exercise)
  const hasSupportMedia = Boolean(exercise.supportMedia)
  const supportMediaChipLabel = exercise.supportMedia?.label === 'Guia do exercicio' ? 'Guia' : 'Demo'

  return (
    <div
      className={cx(
        'relative overflow-hidden rounded-2xl border border-border/70 fq-bg-radial-nature shadow-overlay',
        className,
      )}
    >
      {previewImage ? (
        <img
          src={previewImage}
          alt={`Previa de ${exercise.name}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 fq-bg-radial-nature px-4 text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-muted-foreground shadow-elevated">
            <ImageIcon className="h-5 w-5" />
          </span>
          <p className="text-caption font-semibold uppercase tracking-caps-wide text-muted-foreground">
            Sem thumb no catalogo
          </p>
          <p className="text-xs leading-5 text-muted-foreground/80">
            Esse exercicio nao possui imagem associada no arquivo PT-BR.
          </p>
        </div>
      )}

      <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-foreground/80 px-2.5 py-1 text-caption font-semibold uppercase tracking-caps-wide text-background backdrop-blur-sm">
        #{exercise.order + 1}
      </div>

      {hasSupportMedia ? (
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-caption font-semibold text-foreground shadow-elevated">
          <PlayCircle className="h-3.5 w-3.5 text-destructive" />
          {supportMediaChipLabel}
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent p-3">
        
        <p className="mt-1 truncate text-sm font-semibold text-background">
          {getPreviewLabel(exercise)}
        </p>
      </div>
    </div>
  )
}
