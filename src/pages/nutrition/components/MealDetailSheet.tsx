import { FqAlert, FqBadge, FqButton, FqDivider, FqDrawer, FqModal, FqTextarea } from '@/shared/ui'

import type { Meal } from '../types'

type MealDetailSheetProps = {
  meal: Meal | null
  open: boolean
  isMobile: boolean
  observation: string
  isOffline: boolean
  onOpenChange: (open: boolean) => void
  onMarkDone: (mealId: string) => void
  onMarkSkipped: (mealId: string) => void
  onSaveObservation: (mealId: string) => void
  onChangeObservation: (value: string) => void
}

function MealDetailContent({
  meal,
  observation,
  isOffline,
  onMarkDone,
  onMarkSkipped,
  onSaveObservation,
  onChangeObservation,
}: Omit<MealDetailSheetProps, 'open' | 'isMobile' | 'onOpenChange'>) {
  if (!meal) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{meal.name}</p>
          <p className="text-sm text-muted-foreground">Horario planejado: {meal.time}</p>
        </div>
        <FqBadge tone={meal.status === 'done' ? 'success' : meal.status === 'skipped' ? 'danger' : 'warning'}>
          {meal.status === 'done' ? 'Concluida' : meal.status === 'skipped' ? 'Pulada' : 'Pendente'}
        </FqBadge>
      </div>

      <FqAlert tone="neutral" title="Plano em modo leitura">
        Somente seu nutricionista pode alterar itens, porcoes ou macros do plano.
      </FqAlert>

      <div className="rounded-xl border border-border bg-muted/40 p-3">
        <p className="mb-2 text-sm font-semibold text-foreground">Itens da refeicao</p>
        <ul className="space-y-2">
          {meal.items.map((item) => (
            <li key={item.id} className="text-sm text-foreground">
              {item.label}
              {item.qty ? <span className="text-muted-foreground"> · {item.qty}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Meta da refeicao: {meal.targetMacros.calories} kcal · P {meal.targetMacros.protein}g · C {meal.targetMacros.carbs}g · G {meal.targetMacros.fat}g
      </p>

      <FqDivider />

      <div className="grid gap-2 sm:grid-cols-2">
        <FqButton
          tone="primary"
          leftIcon="check"
          onClick={() => onMarkDone(meal.id)}
          className="min-h-11"
          isDisabled={isOffline}
        >
          Marcar como feita
        </FqButton>
        <FqButton
          variant="outline"
          tone="warning"
          onClick={() => onMarkSkipped(meal.id)}
          className="min-h-11"
          isDisabled={isOffline}
        >
          Marcar como pulada
        </FqButton>
      </div>

      <FqTextarea
        label="Observacao"
        placeholder="Ex.: precisei ajustar horario por causa do trabalho"
        value={observation}
        onChange={(event) => onChangeObservation(event.target.value)}
      />

      <FqButton
        variant="outline"
        tone="secondary"
        onClick={() => onSaveObservation(meal.id)}
        className="min-h-11 w-full"
        isDisabled={isOffline}
      >
        Salvar observacao
      </FqButton>
    </div>
  )
}

export function MealDetailSheet(props: MealDetailSheetProps) {
  if (props.isMobile) {
    return (
      <FqDrawer
        open={props.open}
        onOpenChange={props.onOpenChange}
        title={props.meal ? `${props.meal.name} · ${props.meal.time}` : 'Detalhes da refeicao'}
        description="Confira os itens e registre seu status"
        side="right"
      >
        <MealDetailContent {...props} />
      </FqDrawer>
    )
  }

  return (
    <FqModal
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={props.meal ? `${props.meal.name} · ${props.meal.time}` : 'Detalhes da refeicao'}
      description="Confira os itens e registre seu status"
    >
      <MealDetailContent {...props} />
    </FqModal>
  )
}
