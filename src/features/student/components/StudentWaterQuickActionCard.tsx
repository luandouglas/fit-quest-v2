import { useState, type ReactNode } from 'react'

import { FqButton, FqInput, FqText, useToast } from '@/shared/ui'
import type { WaterProgress } from '@/shared/services/contracts/student'

import { StudentMicroActionCard } from './StudentMicroActionCard'

type StudentWaterQuickActionCardProps = {
  waterProgress: WaterProgress
  onAddWater: (amountMl: number) => Promise<void>
  isPending?: boolean
  title?: string
  description?: string
  footer?: ReactNode
  className?: string
}

const presets = [200, 300, 500] as const

function getStatusLabel(waterProgress: WaterProgress) {
  if (waterProgress.status === 'completed') {
    return 'Meta batida'
  }

  if (waterProgress.status === 'in_progress') {
    return 'Parcial'
  }

  return 'Pendente'
}

function getRewardLabel(waterProgress: WaterProgress) {
  if (waterProgress.status === 'completed') {
    return 'Hidratacao concluida. Isso ja conta para progresso diario e gamificacao.'
  }

  if (waterProgress.status === 'in_progress') {
    return `Faltam ${waterProgress.remainingMl} ml para fechar a meta e manter a consistencia do dia.`
  }

  return 'Comece agora com um toque rapido para nao acumular a meta no fim do dia.'
}

export function StudentWaterQuickActionCard({
  waterProgress,
  onAddWater,
  isPending = false,
  title = 'Agua e microacoes',
  description = 'Registre pequenos volumes ao longo do dia e transforme consistencia em progresso.',
  footer,
  className,
}: StudentWaterQuickActionCardProps) {
  const { toast } = useToast()
  const [customAmount, setCustomAmount] = useState('')

  async function handleAddWater(amountMl: number) {
    if (!Number.isFinite(amountMl) || amountMl <= 0) {
      toast({
        title: 'Volume invalido',
        description: 'Informe um valor maior que zero para registrar agua.',
        tone: 'warning',
      })
      return
    }

    await onAddWater(amountMl)
  }

  async function handleSubmitCustomAmount() {
    const parsed = Number(customAmount.replace(',', '.'))

    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({
        title: 'Volume invalido',
        description: 'Use um valor numerico maior que zero.',
        tone: 'warning',
      })
      return
    }

    await handleAddWater(Math.round(parsed))
    setCustomAmount('')
  }

  return (
    <StudentMicroActionCard
      eyebrow="Microacao de hoje"
      title={title}
      description={description}
      statusLabel={getStatusLabel(waterProgress)}
      statusTone={waterProgress.status === 'completed' ? 'success' : waterProgress.status === 'in_progress' ? 'secondary' : 'warning'}
      progressPct={waterProgress.completionPct}
      summaryLabel={`${waterProgress.consumedMl}/${waterProgress.targetMl} ml • ${waterProgress.checkpointsCompleted}/${waterProgress.checkpointsTotal} checkpoints`}
      rewardLabel={getRewardLabel(waterProgress)}
      presets={presets.map((amountMl) => ({
        id: `water-${amountMl}`,
        label: `+${amountMl} ml`,
        icon: 'plus',
        onClick: () => {
          void handleAddWater(amountMl)
        },
        isDisabled: isPending,
      }))}
      customSlot={
        <div className="rounded-xl border border-border/70 bg-background/70 p-4">
          <FqText as="p" className="text-sm font-semibold text-foreground">
            Volume customizado
          </FqText>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <FqInput
              label="Quantidade em ml"
              type="number"
              min={1}
              step={50}
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="Ex.: 450"
            />
            <FqButton
              leftIcon="flask"
              onClick={() => {
                void handleSubmitCustomAmount()
              }}
              isLoading={isPending}
              className="sm:min-w-38"
            >
              Registrar
            </FqButton>
          </div>
        </div>
      }
      footer={footer}
      className={className}
    />
  )
}
