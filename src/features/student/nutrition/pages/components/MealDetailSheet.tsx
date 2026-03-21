import { useEffect, useState } from 'react'

import { FqAlert, FqButton, FqDivider, FqDrawer, FqTag, FqTextarea } from '@/shared/ui'
import type { Meal } from '@/shared/services/contracts/nutrition'

type MealDetailSheetProps = {
  open: boolean
  meal: Meal | null
  note: string
  isDisabled?: boolean
  onOpenChange: (open: boolean) => void
  onSaveNote: (note: string) => void
  onMarkDone: () => void
  onMarkSkipped: () => void
  onResetStatus: () => void
  isSaving?: boolean
}

const statusToneMap = {
  pending: 'warning',
  done: 'success',
  skipped: 'secondary',
} as const

const statusLabelMap = {
  pending: 'Pendente',
  done: 'Concluida',
  skipped: 'Pulada',
} as const

export function MealDetailSheet({
  open,
  meal,
  note,
  isDisabled = false,
  onOpenChange,
  onSaveNote,
  onMarkDone,
  onMarkSkipped,
  onResetStatus,
  isSaving = false,
}: MealDetailSheetProps) {
  const [noteValue, setNoteValue] = useState(note)

  useEffect(() => {
    setNoteValue(note)
  }, [note])

  if (!meal) {
    return null
  }

  return (
    <FqDrawer
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title={meal.name}
      description={`Horario planejado: ${meal.time}`}
      className="border-border bg-card"
    >
      <div className="space-y-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Status atual</p>
          <FqTag tone={statusToneMap[meal.status]} className="rounded-lg px-2 py-1 text-caption normal-case tracking-normal">
            {statusLabelMap[meal.status]}
          </FqTag>
        </div>

        <div className="rounded-xl bg-accent p-3 text-sm text-foreground">
          <p className="font-medium">Meta da refeicao</p>
          <p className="mt-1 text-muted-foreground">
            {meal.targetMacros.calories} kcal | P {meal.targetMacros.protein}g | C {meal.targetMacros.carbs}g | G {meal.targetMacros.fat}g
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Itens da refeicao</p>
          <div className="rounded-xl border border-border">
            {meal.items.map((item, index) => (
              <div key={item.id}>
                <div className="space-y-1 px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.qty ?? 'Porcao sugerida'}</p>
                  {item.macros ? (
                    <p className="text-xs text-muted-foreground">
                      {item.macros.calories} kcal | P {item.macros.protein}g | C {item.macros.carbs}g | G {item.macros.fat}g
                    </p>
                  ) : null}
                </div>
                {index < meal.items.length - 1 ? <FqDivider className="bg-border" /> : null}
              </div>
            ))}
          </div>
        </div>

        <FqTextarea
          label="Observacao"
          placeholder="Ex.: troquei o alimento, reduzi a porcao ou precisei ajustar o horario."
          value={noteValue}
          onChange={(event) => setNoteValue(event.target.value)}
          variant="outline"
          tone="secondary"
          isDisabled={isDisabled}
        />

        <FqAlert tone="neutral" title="Plano protegido">
          Voce pode registrar status e observacoes, mas nao altera a estrutura da dieta definida pelo profissional.
        </FqAlert>

        <div className="grid grid-cols-1 gap-2">
          <FqButton
            tone="secondary"
            variant="outline"
            onClick={() => onSaveNote(noteValue)}
            isDisabled={isDisabled}
            isLoading={isSaving}
          >
            Salvar observacao
          </FqButton>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FqButton leftIcon="check" onClick={onMarkDone} isDisabled={isDisabled}>
            Marcar como feita
          </FqButton>
          <FqButton tone="warning" variant="outline" onClick={onMarkSkipped} isDisabled={isDisabled}>
            Marcar como pulada
          </FqButton>
          <FqButton tone="neutral" variant="ghost" onClick={onResetStatus} isDisabled={isDisabled}>
            Voltar para pendente
          </FqButton>
        </div>
      </div>
    </FqDrawer>
  )
}
