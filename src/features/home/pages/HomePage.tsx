import { FqButton, FqCard, FqIcon, FqText, FqXPBar } from '@/shared/ui'

type ToneKey = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'warning'

type DailyMetric = {
  title: string
  icon: 'utensils' | 'flask' | 'moon' | 'flame'
  tone: ToneKey
  value: number
  target: number
  unit: string
  buttonLabel: string
}

type Achievement = {
  title: string
  description: string
  date: string
  icon: 'trophy' | 'flask' | 'sun'
  showNewTag?: boolean
}

const toneClasses: Record<ToneKey, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary', text: 'text-primary' },
  secondary: { bg: 'bg-secondary', text: 'text-secondary' },
  tertiary: { bg: 'bg-gamification', text: 'text-gamification' },
  destructive: { bg: 'bg-destructive', text: 'text-destructive' },
  warning: { bg: 'bg-warning', text: 'text-warning' },
}

const dailyMetrics: DailyMetric[] = [
  {
    title: 'Refeicoes',
    icon: 'utensils',
    tone: 'secondary',
    value: 3,
    target: 5,
    unit: 'refeicoes',
    buttonLabel: 'Registrar Refeicao',
  },
  {
    title: 'Treinos',
    icon: 'flame',
    tone: 'primary',
    value: 1,
    target: 1,
    unit: 'treinos',
    buttonLabel: 'Ver Treinos',
  },
  {
    title: 'Agua',
    icon: 'flask',
    tone: 'secondary',
    value: 1500,
    target: 2500,
    unit: 'ml',
    buttonLabel: 'Registrar Agua',
  },
  {
    title: 'Sono',
    icon: 'moon',
    tone: 'tertiary',
    value: 7,
    target: 8,
    unit: 'horas',
    buttonLabel: 'Registrar Sono',
  },
  {
    title: 'Sequencia',
    icon: 'flame',
    tone: 'destructive',
    value: 12,
    target: 30,
    unit: 'dias',
    buttonLabel: 'Manter Sequencia',
  },
]

const achievements: Achievement[] = [
  {
    title: 'Primeira Semana Completa',
    description: 'Completou todos os treinos da semana pela primeira vez',
    date: '18/02/2026',
    icon: 'trophy',
    showNewTag: true,
  },
  {
    title: 'Mestre da Hidratacao',
    description: 'Atingiu a meta de agua por 7 dias consecutivos',
    date: '15/02/2026',
    icon: 'flask',
    showNewTag: true,
  },
  {
    title: 'Guerreiro Matinal',
    description: 'Completou 10 treinos antes das 8h da manha',
    date: '10/02/2026',
    icon: 'sun',
  },
]

function MetricCard({ title, icon, tone, value, target, unit, buttonLabel }: DailyMetric) {
  const toneConfig = toneClasses[tone]

  return (
    <FqCard className="border-border bg-card">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${toneConfig.bg}`}>
            <FqIcon name={icon} size={16} />
          </span>
          <p className="text-lg font-semibold text-foreground">{title}</p>
        </div>

        <p className="text-lg font-semibold text-foreground">
          {value}
          <span className="text-sm font-medium text-muted-foreground"> / {target} {unit}</span>
        </p>

        <progress
          max={target}
          value={Math.min(value, target)}
          className={[
            'h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted',
            '[&::-webkit-progress-value]:rounded-full',
            tone === 'primary' ? '[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary' : '',
            tone === 'secondary' ? '[&::-webkit-progress-value]:bg-secondary [&::-moz-progress-bar]:bg-secondary' : '',
            tone === 'tertiary' ? '[&::-webkit-progress-value]:bg-gamification [&::-moz-progress-bar]:bg-gamification' : '',
            tone === 'destructive' ? '[&::-webkit-progress-value]:bg-destructive [&::-moz-progress-bar]:bg-destructive' : '',
            tone === 'warning' ? '[&::-webkit-progress-value]:bg-warning [&::-moz-progress-bar]:bg-warning' : '',
          ].join(' ')}
        />

        <button type="button" className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
          {buttonLabel}
        </button>
      </div>
    </FqCard>
  )
}

export function HomePage() {
  return (
    <section className="space-y-6 lg:space-y-8">
      <header className="space-y-1">
        <FqText variant="title" as="h1" className="text-lg leading-tight">
          Bem-vindo de volta!
        </FqText>
        <FqText className="text-base text-muted-foreground">
          Continue sua jornada fitness e alcance seus objetivos
        </FqText>
      </header>

      <FqCard className="border-border bg-card">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-7">
          <div className="relative flex items-center gap-4 md:pr-6 md:after:absolute md:after:right-0 md:after:top-1/2 md:after:h-12 md:after:w-px md:after:-translate-y-1/2 md:after:bg-border">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              8
            </span>
            <FqXPBar currentXP={340} targetXP={500} label="XP semanal" showPercent={false} className="w-full min-w-52 p-2.5" />
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <FqIcon name="star" className="text-star" />
              <div>
                <p className="text-sm text-muted-foreground">Estrelas</p>
                <p className="text-lg font-semibold text-foreground">127</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FqIcon name="flame" className="text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Sequencia</p>
                <p className="text-lg font-semibold text-foreground">12 dias</p>
              </div>
            </div>
          </div>
        </div>
      </FqCard>

      <div className="grid gap-4 md:grid-cols-3">
        <button type="button" className="rounded-xl bg-primary px-5 py-7 text-center text-primary-foreground shadow-sm transition hover:bg-primary/90">
          <FqIcon name="flame" className="mx-auto mb-3" />
          <p className="text-lg font-semibold">Iniciar Treino</p>
        </button>
        <button type="button" className="rounded-xl bg-secondary px-5 py-7 text-center text-secondary-foreground shadow-sm transition hover:bg-secondary/90">
          <FqIcon name="mapPin" className="mx-auto mb-3" />
          <p className="text-lg font-semibold">Corrida/Caminhada</p>
        </button>
        <button type="button" className="rounded-xl bg-gamification px-5 py-7 text-center text-gamification-foreground shadow-sm transition hover:bg-gamification/90">
          <FqIcon name="chart" className="mx-auto mb-3" />
          <p className="text-lg font-semibold">Ver Progresso</p>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dailyMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FqCard className="overflow-hidden border-border bg-card p-0">
          <div className="relative h-72 bg-muted">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80"
              alt="Treino de peito e triceps"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/65 p-4">
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-lg font-semibold text-card">Treino de Peito e Triceps</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-card">
                  <span className="inline-flex items-center gap-1">
                    <FqIcon name="flame" size={14} />8 exercicios
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FqIcon name="clock" size={14} />45 min
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <p className="inline-flex items-center gap-2 text-base font-medium text-warning">
              <FqIcon name="chart" size={16} />
              Intermediario
            </p>
            <FqButton className="w-full text-base" leftIcon="play">
              Iniciar Treino
            </FqButton>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-foreground">Nutricao de Hoje</p>
              <FqIcon name="flask" className="text-success" />
            </div>

            <div className="rounded-xl bg-accent p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-foreground">Calorias</p>
                <p className="text-lg font-semibold text-foreground">
                  1450 <span className="text-sm font-medium text-muted-foreground">/ 2200 kcal</span>
                </p>
              </div>
              <progress
                max={2200}
                value={1450}
                className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-lg font-semibold text-destructive-foreground">
                  85
                </span>
                <p className="mt-2 text-sm text-muted-foreground">150g</p>
                <p className="text-base font-semibold text-foreground">Proteina</p>
              </div>
              <div>
                <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning text-lg font-semibold text-warning-foreground">
                  120
                </span>
                <p className="mt-2 text-sm text-muted-foreground">250g</p>
                <p className="text-base font-semibold text-foreground">Carboidratos</p>
              </div>
              <div>
                <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">
                  45
                </span>
                <p className="mt-2 text-sm text-muted-foreground">70g</p>
                <p className="text-base font-semibold text-foreground">Gorduras</p>
              </div>
            </div>

            <FqButton className="w-full text-base" tone="secondary" leftIcon="plus">
              Registrar Refeicao
            </FqButton>
          </div>
        </FqCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-foreground">Progresso Semanal</p>
            <div className="relative h-64 rounded-xl border border-border bg-surface-subtle p-3">
              <svg viewBox="0 0 700 220" className="h-full w-full">
                <g className="text-border" stroke="currentColor" strokeDasharray="4 4">
                  <line x1="70" y1="20" x2="70" y2="190" />
                  <line x1="150" y1="20" x2="150" y2="190" />
                  <line x1="230" y1="20" x2="230" y2="190" />
                  <line x1="310" y1="20" x2="310" y2="190" />
                  <line x1="390" y1="20" x2="390" y2="190" />
                  <line x1="470" y1="20" x2="470" y2="190" />
                  <line x1="550" y1="20" x2="550" y2="190" />
                </g>
                <polyline
                  className="text-success"
                  points="70,20 150,20 230,20 310,20 390,20 470,20 550,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <polyline
                  className="text-info"
                  points="70,20 150,20 230,190 310,20 390,20 470,20 550,190"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </FqCard>

        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-foreground">Conquistas Recentes</p>
              <FqIcon name="trophy" className="text-star" />
            </div>

            <div className="space-y-3">
              {achievements.map((achievement) => (
                <article key={achievement.title} className="rounded-xl bg-accent p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gamification text-gamification-foreground">
                      <FqIcon name={achievement.icon} size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-foreground">{achievement.title}</p>
                        {achievement.showNewTag ? (
                          <span className="rounded-md bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground">
                            Novo
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button type="button" className="w-full py-1 text-center text-base font-semibold text-primary hover:underline">
              Ver Todas as Conquistas
            </button>
          </div>
        </FqCard>
      </div>
    </section>
  )
}
