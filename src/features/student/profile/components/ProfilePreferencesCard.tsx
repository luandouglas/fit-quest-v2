import { FqButton, FqCard, FqInput, FqSelect, FqSwitch } from '@/shared/ui'
import type { ProfilePreferences, ThemePreference } from '@/shared/services/contracts/profile'

const measurementOptions: Array<{ label: string; value: ProfilePreferences['measurementSystem'] }> = [
  { label: 'Metrico (kg, km)', value: 'metric' },
  { label: 'Imperial (lb, mi)', value: 'imperial' },
]

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Escuro', value: 'dark' },
]

type ProfilePreferencesCardProps = {
  waterMlDaily: string
  workoutsPerWeek: string
  notificationsEnabled: boolean
  remindersEnabled: boolean
  measurementSystem: ProfilePreferences['measurementSystem']
  themePreference: ThemePreference
  onChange: (patch: Partial<{
    waterMlDaily: string
    workoutsPerWeek: string
    notificationsEnabled: boolean
    remindersEnabled: boolean
    measurementSystem: ProfilePreferences['measurementSystem']
    themePreference: ThemePreference
  }>) => void
  onSave: () => void
  isSaving: boolean
  isDisabled: boolean
}

export function ProfilePreferencesCard({
  waterMlDaily,
  workoutsPerWeek,
  notificationsEnabled,
  remindersEnabled,
  measurementSystem,
  themePreference,
  onChange,
  onSave,
  isSaving,
  isDisabled,
}: ProfilePreferencesCardProps) {
  return (
    <FqCard
      title="Preferencias, metas e lembretes"
      subtitle="Ajustes que mudam o ritmo da experiencia diaria do aluno."
      className="border-border bg-card"
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FqInput
            label="Meta de agua (ml)"
            type="number"
            min={500}
            step={50}
            value={waterMlDaily}
            onChange={(event) => onChange({ waterMlDaily: event.target.value })}
          />
          <FqInput
            label="Treinos por semana"
            type="number"
            min={1}
            max={14}
            step={1}
            value={workoutsPerWeek}
            onChange={(event) => onChange({ workoutsPerWeek: event.target.value })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FqSelect
            label="Sistema de medidas"
            value={measurementSystem}
            onChange={(event) => onChange({ measurementSystem: event.target.value as ProfilePreferences['measurementSystem'] })}
            options={measurementOptions}
          />
          <FqSelect
            label="Tema do app"
            value={themePreference}
            onChange={(event) => onChange({ themePreference: event.target.value as ThemePreference })}
            options={themeOptions}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4">
            <FqSwitch
              label="Notificacoes gerais"
              checked={notificationsEnabled}
              onCheckedChange={(checked) => onChange({ notificationsEnabled: checked })}
              tone="success"
            />
          </div>
          <div className="rounded-[calc(var(--radius)+4px)] border border-border/75 bg-muted/20 p-4">
            <FqSwitch
              label="Lembretes de rotina"
              checked={remindersEnabled}
              onCheckedChange={(checked) => onChange({ remindersEnabled: checked })}
              tone="primary"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <FqButton onClick={onSave} isLoading={isSaving} isDisabled={isDisabled}>
            Salvar preferencias
          </FqButton>
        </div>
      </div>
    </FqCard>
  )
}
