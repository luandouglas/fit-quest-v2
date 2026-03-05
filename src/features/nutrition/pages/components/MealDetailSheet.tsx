import { useState } from 'react'

import { FqAlert, FqButton, FqDivider, FqDrawer, FqInput, FqTag, FqTextarea } from '@/shared/ui'

import type { Meal } from '../NutritionPage'

type MealDetailSheetProps = {
  open: boolean
  meal: Meal | null
  note: string
  isOffline?: boolean
  isDateLocked?: boolean
  isPlanEditingLocked?: boolean
  onOpenChange: (open: boolean) => void
  onSaveMeal: (patch: { name: string; time: string; note?: string }) => void
  onDeleteMeal: () => void
  onMarkDone: () => void
  onMarkSkipped: () => void
  isSaving?: boolean
  isDeleting?: boolean
}

const statusToneMap = {
  pending: 'warning',
  done: 'success',
  skipped: 'danger',
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
  isOffline = false,
  isDateLocked = false,
  isPlanEditingLocked = false,
  onOpenChange,
  onSaveMeal,
  onDeleteMeal,
  onMarkDone,
  onMarkSkipped,
  isSaving = false,
  isDeleting = false,
}: MealDetailSheetProps) {
  const [name, setName] = useState(meal?.name ?? '')
  const [time, setTime] = useState(meal?.time ?? '')
  const [noteValue, setNoteValue] = useState(note)

  if (!meal) {
    return null
  }

  return (
    <FqDrawer
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title={meal.name}
      description={`Horario: ${meal.time}`}
      className="border-border bg-card"
    >
      <div className="space-y-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Status atual</p>
          <FqTag tone={statusToneMap[meal.status]} className="rounded-lg px-2 py-1 text-[11px] normal-case tracking-normal">
            {statusLabelMap[meal.status]}
          </FqTag>
        </div>

        <div className="rounded-xl bg-accent p-3 text-sm text-foreground">
          <p className="font-medium">Macros alvo</p>
          <p className="mt-1 text-muted-foreground">
            {meal.targetMacros.calories} kcal | P {meal.targetMacros.protein}g | C {meal.targetMacros.carbs}g | G {meal.targetMacros.fat}g
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <FqInput
            label="Nome da refeicao"
            value={name}
            onChange={(event) => setName(event.target.value)}
            isDisabled={isOffline || isDateLocked || isPlanEditingLocked}
          />
          <FqInput
            label="Horario"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            placeholder="Ex.: 12:30"
            isDisabled={isOffline || isDateLocked || isPlanEditingLocked}
          />
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
          placeholder="Ex.: ajustei a porcao de carboidrato."
          value={noteValue}
          onChange={(event) => setNoteValue(event.target.value)}
          variant="outline"
          tone="secondary"
          isDisabled={isOffline || isDateLocked || isPlanEditingLocked}
        />

        <FqAlert tone="neutral" title="Plano somente leitura">
          Macros e itens do plano continuam protegidos.
        </FqAlert>

        {isPlanEditingLocked ? (
          <FqAlert tone="secondary" title="Edicao bloqueada">
            Este plano foi definido pelo nutricionista. Voce pode apenas registrar consumo.
          </FqAlert>
        ) : null}

        {isDateLocked ? (
          <FqAlert tone="warning" title="Registro bloqueado">
            Voce pode registrar refeicoes somente no dia de hoje.
          </FqAlert>
        ) : null}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <FqButton
            tone="secondary"
            variant="outline"
            onClick={() => onSaveMeal({ name, time, note: noteValue })}
            isDisabled={isOffline || isDateLocked || isPlanEditingLocked}
            isLoading={isSaving}
          >
            Salvar edicao
          </FqButton>
          <FqButton
            tone="danger"
            variant="outline"
            onClick={onDeleteMeal}
            isDisabled={isOffline || isDateLocked || isPlanEditingLocked}
            isLoading={isDeleting}
          >
            Excluir refeicao
          </FqButton>
          <FqButton leftIcon="check" onClick={onMarkDone} isDisabled={isOffline || isDateLocked}>
            Marcar como feita
          </FqButton>
          <FqButton tone="warning" variant="outline" onClick={onMarkSkipped} isDisabled={isOffline || isDateLocked}>
            Marcar como pulada
          </FqButton>
        </div>
      </div>
    </FqDrawer>
  )
}
