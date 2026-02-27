import {
  type DragEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import menMusclesFront from '@/assets/MEN-muscles-front.svg'
import womenMuscles from '@/assets/Women-muscles.svg'
import { FqButton, FqCard, FqIcon, FqInput, FqProgressRing, FqSwitch, FqTag, type IconName } from '@/shared/ui'
import { cx } from '@/shared/utils'

type FitQuestExperiencePageProps = {
  mode?: 'full' | 'landing'
}

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type WorkoutFocus = 'all' | 'strength' | 'cardio' | 'mobility'
type CoachRole = 'personal' | 'nutritionist'
type LibraryCategory = 'All' | 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Core'

type CatalogExercise = {
  id: string
  name: string
  muscle: Exclude<LibraryCategory, 'All'>
  focus: Exclude<WorkoutFocus, 'all'>
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  equipment: 'Bodyweight' | 'Dumbbells' | 'Bands' | 'Machine'
  durationMin: number
}

type ChatMessage = {
  id: string
  sender: 'coach' | 'student'
  text: string
  time: string
}

type SectionShellProps = {
  id: string
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

type SelectableCardProps = {
  icon: IconName
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

const screenLinks = [
  { id: 'landing', label: 'Pagina Inicial' },
  { id: 'coach-dashboard', label: 'Painel de Treinadores' },
  { id: 'onboarding', label: 'Cadastro Inicial' },
  { id: 'mobile-workout', label: 'Treino Mobile' },
  { id: 'analytics', label: 'Analise de Progresso' },
  { id: 'plan-builder', label: 'Construtor de Plano' },
  { id: 'exercise-library', label: 'Biblioteca de Exercicios' },
  { id: 'ai-chat', label: 'Chat com IA' },
  { id: 'rewards-shop', label: 'Loja de Recompensas' },
  { id: 'profile-settings', label: 'Perfil e Configuracoes' },
] as const

const landingFeatureCards = [
  {
    title: 'Motor de sequencia gamificada',
    description: 'Missoes diarias e multiplicadores de estrelas mantem alunos ativos mesmo em dias de baixa energia.',
    icon: 'flame' as const,
  },
  {
    title: 'Central do treinador',
    description: 'Gerencie planos, adesao e presenca em um painel com prioridades claras.',
    icon: 'users' as const,
  },
  {
    title: 'Nutricao e treinos em sincronia',
    description: 'Planos se adaptam automaticamente quando a adesao cai, o sono muda ou o objetivo e ajustado.',
    icon: 'utensils' as const,
  },
]

const coachStudents = [
  { name: 'Ariana Silva', goal: 'Emagrecimento', adherence: 91, streak: 18, status: 'No ritmo' },
  { name: 'Mateo Lima', goal: 'Hipertrofia', adherence: 84, streak: 11, status: 'Precisa de contato' },
  { name: 'Julia Costa', goal: 'Recomposicao', adherence: 95, streak: 27, status: 'No ritmo' },
  { name: 'Noah Almeida', goal: 'Performance', adherence: 72, streak: 5, status: 'Em risco' },
]

const pendingPlanActions = [
  {
    student: 'Mateo Lima',
    action: 'Ajustar volume de membros inferiores (+2 series)',
    due: 'Hoje',
  },
  {
    student: 'Noah Almeida',
    action: 'Trocar protocolo de esteira por bicicleta',
    due: 'Amanha',
  },
  {
    student: 'Ariana Silva',
    action: 'Publicar plano da semana de deload',
    due: 'Sexta-feira',
  },
]

const onboardingSteps = [
  'Meta',
  'Biotipo',
  'Nivel',
  'Equipamentos',
] as const

const goalOptions = [
  {
    value: 'fat-loss',
    title: 'Emagrecimento',
    description: 'Plano com controle calorico, cadencia de cardio e checagem semanal de cintura.',
    icon: 'target' as const,
  },
  {
    value: 'muscle-gain',
    title: 'Ganho muscular',
    description: 'Foco em sobrecarga progressiva com lembretes de superavit nutricional.',
    icon: 'dumbbell' as const,
  },
  {
    value: 'performance',
    title: 'Performance',
    description: 'Divisao de resistencia, velocidade e condicionamento com base na modalidade.',
    icon: 'activity' as const,
  },
]

const bodyTypeOptions = [
  {
    value: 'ectomorph',
    title: 'Ectomorfo',
    description: 'Maior tolerancia a volume, com foco em recuperacao e ingestao calorica.',
    icon: 'flame' as const,
  },
  {
    value: 'mesomorph',
    title: 'Mesomorfo',
    description: 'Resposta equilibrada para blocos de forca e metabolismo.',
    icon: 'user' as const,
  },
  {
    value: 'endomorph',
    title: 'Endomorfo',
    description: 'Volume controlado e progressao de cardio com reforco de adesao.',
    icon: 'heart' as const,
  },
]

const levelOptions = [
  {
    value: 'beginner',
    title: 'Iniciante',
    description: 'Divisao de 3 dias, sessoes focadas em tecnica e acompanhamento simplificado.',
    icon: 'star' as const,
  },
  {
    value: 'intermediate',
    title: 'Intermediario',
    description: '4-5 sessoes por semana com progressao de carga e semanas de deload.',
    icon: 'chart' as const,
  },
  {
    value: 'advanced',
    title: 'Avancado',
    description: 'Mesociclos periodizados, metas de velocidade e controle mais rigido de recuperacao.',
    icon: 'trophy' as const,
  },
]

const equipmentOptions = [
  { value: 'bodyweight', label: 'Apenas peso corporal' },
  { value: 'dumbbells', label: 'Halteres' },
  { value: 'bands', label: 'Bandas elasticas' },
  { value: 'machine', label: 'Maquinas de academia' },
  { value: 'barbell', label: 'Barra + rack' },
]

const progressLabels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5', 'Semana 6']
const weightSeries = [84.2, 83.4, 82.6, 81.9, 81.1, 80.3]
const imcSeries = [27.8, 27.5, 27.1, 26.8, 26.3, 25.9]

const bodyMeasures = [
  { label: 'Cintura', previous: 92, current: 85, unit: 'cm' },
  { label: 'Peito', previous: 101, current: 104, unit: 'cm' },
  { label: 'Quadril', previous: 104, current: 99, unit: 'cm' },
  { label: 'Braco', previous: 34, current: 36, unit: 'cm' },
]

const adherenceByWeek = [68, 74, 81, 86, 89, 92]

const catalogExercises: CatalogExercise[] = [
  {
    id: 'ex-1',
    name: 'Supino inclinado com halteres',
    muscle: 'Chest',
    focus: 'strength',
    level: 'Intermediate',
    equipment: 'Dumbbells',
    durationMin: 12,
  },
  {
    id: 'ex-2',
    name: 'Levantamento terra romeno',
    muscle: 'Legs',
    focus: 'strength',
    level: 'Intermediate',
    equipment: 'Dumbbells',
    durationMin: 14,
  },
  {
    id: 'ex-3',
    name: 'Puxada frontal',
    muscle: 'Back',
    focus: 'strength',
    level: 'Beginner',
    equipment: 'Machine',
    durationMin: 10,
  },
  {
    id: 'ex-4',
    name: 'Intervalos de corda',
    muscle: 'Legs',
    focus: 'cardio',
    level: 'Beginner',
    equipment: 'Bodyweight',
    durationMin: 8,
  },
  {
    id: 'ex-5',
    name: 'Face pull com banda',
    muscle: 'Shoulders',
    focus: 'mobility',
    level: 'Beginner',
    equipment: 'Bands',
    durationMin: 6,
  },
  {
    id: 'ex-6',
    name: 'Prancha com alcance',
    muscle: 'Core',
    focus: 'mobility',
    level: 'Intermediate',
    equipment: 'Bodyweight',
    durationMin: 7,
  },
  {
    id: 'ex-7',
    name: 'Remada sentada',
    muscle: 'Back',
    focus: 'strength',
    level: 'Beginner',
    equipment: 'Machine',
    durationMin: 11,
  },
  {
    id: 'ex-8',
    name: 'Agachamento bulgaro',
    muscle: 'Legs',
    focus: 'strength',
    level: 'Advanced',
    equipment: 'Dumbbells',
    durationMin: 13,
  },
  {
    id: 'ex-9',
    name: 'Flexao + toque no ombro',
    muscle: 'Chest',
    focus: 'cardio',
    level: 'Intermediate',
    equipment: 'Bodyweight',
    durationMin: 9,
  },
]

const builderDays = [
  { key: 'mon', label: 'Seg' },
  { key: 'tue', label: 'Ter' },
  { key: 'wed', label: 'Qua' },
  { key: 'thu', label: 'Qui' },
  { key: 'fri', label: 'Sex' },
  { key: 'sat', label: 'Sab' },
  { key: 'sun', label: 'Dom' },
] as const satisfies Array<{ key: DayKey; label: string }>

const initialPlanBoard: Record<DayKey, string[]> = {
  mon: ['ex-1', 'ex-3'],
  tue: ['ex-4', 'ex-6'],
  wed: ['ex-2'],
  thu: ['ex-7'],
  fri: ['ex-8', 'ex-9'],
  sat: [],
  sun: [],
}

const libraryCategories: LibraryCategory[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Core']

const coachConversations: Record<CoachRole, ChatMessage[]> = {
  personal: [
    {
      id: 'p-1',
      sender: 'coach',
      text: 'Sua adesao de membros inferiores caiu esta semana. Posso reduzir o volume de sexta em 15%?',
      time: '09:14',
    },
    {
      id: 'p-2',
      sender: 'student',
      text: 'Sim, e troque avanco por sprint na bike. O joelho esta sobrecarregado.',
      time: '09:16',
    },
    {
      id: 'p-3',
      sender: 'coach',
      text: 'Feito. Plano atualizado com intervalos de bike e superserie de ponte de gluteo.',
      time: '09:17',
    },
  ],
  nutritionist: [
    {
      id: 'n-1',
      sender: 'coach',
      text: 'Proteina abaixo da meta por tres dias. Aumentamos 25g de proteina magra no almoco?',
      time: '08:05',
    },
    {
      id: 'n-2',
      sender: 'student',
      text: 'Sim, e sugira um cafe da manha rapido antes dos treinos da manha.',
      time: '08:07',
    },
    {
      id: 'n-3',
      sender: 'coach',
      text: 'Adicionei iogurte grego com aveia no pre-treino e ajustei os macros da semana.',
      time: '08:09',
    },
  ],
}

const quickPrompts = [
  'Ajustar volume de cardio desta semana',
  'Revisar horario das refeicoes em torno do treino',
  'Gerar recomendacao para semana de deload',
]

const weeklyChallenges = [
  {
    title: 'Sequencia de 7 dias',
    description: 'Concluir ao menos uma tarefa de treino por dia.',
    progress: 5,
    target: 7,
    rewardPoints: 450,
    rewardStars: 4,
  },
  {
    title: 'Consistencia de hidratacao',
    description: 'Bater 2,5L de agua em 6 dias.',
    progress: 4,
    target: 6,
    rewardPoints: 300,
    rewardStars: 3,
  },
  {
    title: 'Dominio de recuperacao',
    description: 'Dormir 7h+ em 5 noites.',
    progress: 3,
    target: 5,
    rewardPoints: 250,
    rewardStars: 2,
  },
]

const rewardsCatalog = [
  {
    id: 'rw-1',
    title: 'Kit premium de shaker',
    details: 'Shaker de inox da marca + mini funil.',
    points: 900,
    stars: 8,
  },
  {
    id: 'rw-2',
    title: 'Revisao tecnica com treinador',
    details: 'Revisao 1:1 de 30 minutos sobre forma e progressao.',
    points: 1200,
    stars: 12,
  },
  {
    id: 'rw-3',
    title: 'Pacote de modelos de nutricao',
    details: 'Template de marmitas para 7 dias com macros pre-definidos.',
    points: 650,
    stars: 5,
  },
  {
    id: 'rw-4',
    title: 'Aula de mobilidade para recuperacao',
    details: 'Sessao ao vivo de mobilidade com orientacao profissional.',
    points: 780,
    stars: 6,
  },
]

const workoutFocusLabelMap: Record<WorkoutFocus, string> = {
  all: 'Todos',
  strength: 'Forca',
  cardio: 'Cardio',
  mobility: 'Mobilidade',
}

const libraryCategoryLabelMap: Record<LibraryCategory, string> = {
  All: 'Todos',
  Chest: 'Peito',
  Back: 'Costas',
  Legs: 'Pernas',
  Shoulders: 'Ombros',
  Core: 'Core',
}

const exerciseLevelLabelMap: Record<CatalogExercise['level'], string> = {
  Beginner: 'Iniciante',
  Intermediate: 'Intermediario',
  Advanced: 'Avancado',
}

const exerciseEquipmentLabelMap: Record<CatalogExercise['equipment'], string> = {
  Bodyweight: 'Peso corporal',
  Dumbbells: 'Halteres',
  Bands: 'Bandas elasticas',
  Machine: 'Maquina',
}

function buildPolyline(values: number[], width: number, height: number, min: number, max: number) {
  if (values.length === 0) {
    return ''
  }

  const horizontalPadding = 32
  const verticalPadding = 22
  const safeRange = Math.max(max - min, 1)

  return values
    .map((value, index) => {
      const x =
        horizontalPadding +
        (index / Math.max(values.length - 1, 1)) * (width - horizontalPadding * 2)
      const normalized = (value - min) / safeRange
      const y = height - verticalPadding - normalized * (height - verticalPadding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

function SectionShell({ id, eyebrow, title, description, children }: SectionShellProps) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_22px_70px_-40px_rgba(2,6,23,0.65)]"
    >
      <header className="border-b border-border/80 bg-gradient-to-r from-surface-subtle to-card px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}

function SelectableCard({ icon, title, description, selected, onClick }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'w-full rounded-2xl border px-4 py-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
      )}
    >
      <span
        className={cx(
          'inline-flex h-9 w-9 items-center justify-center rounded-xl',
          selected ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground',
        )}
      >
        <FqIcon name={icon} size={16} />
      </span>
      <p className="mt-3 text-base font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  )
}

function renderAdherenceTone(value: number) {
  if (value >= 88) {
    return 'text-success'
  }

  if (value >= 78) {
    return 'text-warning'
  }

  return 'text-destructive'
}

function LandingSection({ isStandalone }: { isStandalone: boolean }) {
  return (
    <SectionShell
      id="landing"
      eyebrow="Pagina Inicial"
      title="FitQuest: o app fitness que transforma consistencia em jogo"
      description="Destaque no estilo loja de apps, prova de progresso e botoes de download claros para conversao."
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-[#ebf3ff] via-card to-[#fff2dd] p-5 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -left-12 top-6 h-28 w-28 rounded-full bg-primary/10 blur-xl" />
        <div className="pointer-events-none absolute bottom-2 right-10 h-24 w-24 rounded-full bg-warning/20 blur-xl" />

        <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <FqTag tone="primary" leftIcon="star" className="bg-primary/15 text-primary">
              Nota 4.9/5 por 28 mil atletas
            </FqTag>

            <h3 className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
              Construa sequencias. Ganhe estrelas. Cumpra seu plano.
            </h3>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              FitQuest combina treino guiado por treinador, inteligencia nutricional e ciclos de recompensa para manter alunos consistentes semana apos semana.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <FqButton size="lg" leftIcon="play" className="rounded-xl px-6">
                Baixar na App Store
              </FqButton>
              <FqButton size="lg" tone="secondary" variant="outline" leftIcon="star" className="rounded-xl px-6">
                Baixar no Google Play
              </FqButton>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <FqIcon name="users" size={14} className="text-primary" />
                12 mil planos ativos neste mes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <FqIcon name="trophy" size={14} className="text-warning" />
                Media de 93% de adesao semanal
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {['Sequencias de treino', 'Painel do treinador', 'Loja de recompensas'].map((label, index) => (
              <div
                key={label}
                className={cx(
                  'rounded-2xl border border-border/80 bg-background/90 p-3 shadow-sm',
                  index === 1 ? 'sm:-translate-y-2 lg:translate-y-0' : '',
                )}
                >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tela {index + 1}</span>
                  <FqIcon name="star" size={13} className="text-star" />
                </div>
                <div className="rounded-xl bg-gradient-to-br from-primary/15 to-secondary/20 p-3">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Espaco para screenshot real do app</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {landingFeatureCards.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-border/80 bg-card p-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FqIcon name={feature.icon} size={16} />
              </span>
              <h4 className="mt-3 text-base font-semibold text-foreground">{feature.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>

        {isStandalone ? (
          <div className="mt-7 flex flex-wrap gap-3 border-t border-border/70 pt-5">
            <Link to="/login">
              <FqButton size="lg" leftIcon="arrowRight" className="rounded-xl px-6">
                Entrar no app FitQuest
              </FqButton>
            </Link>
            <Link to="/tabs/home">
              <FqButton size="lg" variant="outline" tone="neutral" className="rounded-xl px-6">
                Abrir colecao de telas
              </FqButton>
            </Link>
          </div>
        ) : null}
      </div>
    </SectionShell>
  )
}

export function FitQuestExperiencePage({ mode = 'full' }: FitQuestExperiencePageProps) {
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState({
    goal: goalOptions[0].value,
    bodyType: bodyTypeOptions[1].value,
    level: levelOptions[1].value,
    equipment: ['bodyweight', 'dumbbells'],
  })

  const [planSearch, setPlanSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<WorkoutFocus>('all')
  const [draggedExerciseId, setDraggedExerciseId] = useState<string | null>(null)
  const [hoveredDay, setHoveredDay] = useState<DayKey | null>(null)
  const [planBoard, setPlanBoard] = useState<Record<DayKey, string[]>>(initialPlanBoard)

  const [libraryCategory, setLibraryCategory] = useState<LibraryCategory>('All')
  const [librarySearch, setLibrarySearch] = useState('')
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>(['ex-1', 'ex-6'])
  const [muscleMapView, setMuscleMapView] = useState<'male' | 'female'>('male')

  const [activeCoachRole, setActiveCoachRole] = useState<CoachRole>('personal')
  const [chatInput, setChatInput] = useState('')
  const [messagesByRole, setMessagesByRole] = useState<Record<CoachRole, ChatMessage[]>>(coachConversations)

  const [fitPoints, setFitPoints] = useState(2460)
  const [fitStars, setFitStars] = useState(38)
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([])

  const [profileData, setProfileData] = useState({
    name: 'Treinador Lucas Douglas',
    email: 'coach@fitquest.app',
    timezone: 'America/Sao_Paulo',
  })
  const [notificationSettings, setNotificationSettings] = useState({
    workoutReminders: true,
    mealAlerts: true,
    lowAdherenceAlerts: true,
    weeklyReports: false,
  })
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof document === 'undefined') {
      return false
    }

    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.documentElement.classList.toggle('dark', isDarkTheme)
  }, [isDarkTheme])

  const exercisesById = useMemo(() => {
    return new Map(catalogExercises.map((exercise) => [exercise.id, exercise]))
  }, [])

  const filteredCatalogExercises = useMemo(() => {
    return catalogExercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(planSearch.toLowerCase().trim())
      const matchesFilter = planFilter === 'all' ? true : exercise.focus === planFilter
      return matchesSearch && matchesFilter
    })
  }, [planSearch, planFilter])

  const filteredLibraryExercises = useMemo(() => {
    return catalogExercises.filter((exercise) => {
      const matchesCategory = libraryCategory === 'All' ? true : exercise.muscle === libraryCategory
      const matchesSearch = exercise.name.toLowerCase().includes(librarySearch.toLowerCase().trim())
      return matchesCategory && matchesSearch
    })
  }, [libraryCategory, librarySearch])

  const weightMin = Math.min(...weightSeries) - 1.1
  const weightMax = Math.max(...weightSeries) + 1.1
  const imcMin = Math.min(...imcSeries) - 0.6
  const imcMax = Math.max(...imcSeries) + 0.6

  const weightLinePoints = useMemo(() => {
    return buildPolyline(weightSeries, 640, 220, weightMin, weightMax)
  }, [weightMax, weightMin])

  const imcLinePoints = useMemo(() => {
    return buildPolyline(imcSeries, 640, 140, imcMin, imcMax)
  }, [imcMax, imcMin])

  function handleOnboardingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (currentOnboardingStep < onboardingSteps.length - 1) {
      setCurrentOnboardingStep((currentStep) => currentStep + 1)
    }
  }

  function handleBackOnboardingStep() {
    if (currentOnboardingStep === 0) {
      return
    }

    setCurrentOnboardingStep((currentStep) => currentStep - 1)
  }

  function handleToggleEquipment(value: string) {
    setOnboardingData((currentValue) => {
      const hasEquipment = currentValue.equipment.includes(value)
      return {
        ...currentValue,
        equipment: hasEquipment
          ? currentValue.equipment.filter((equipment) => equipment !== value)
          : [...currentValue.equipment, value],
      }
    })
  }

  function handleDropExercise(day: DayKey) {
    if (!draggedExerciseId) {
      return
    }

    setPlanBoard((currentBoard) => {
      if (currentBoard[day].includes(draggedExerciseId)) {
        return currentBoard
      }

      return {
        ...currentBoard,
        [day]: [...currentBoard[day], draggedExerciseId],
      }
    })
    setDraggedExerciseId(null)
    setHoveredDay(null)
  }

  function handleRemoveExerciseFromDay(day: DayKey, exerciseId: string) {
    setPlanBoard((currentBoard) => ({
      ...currentBoard,
      [day]: currentBoard[day].filter((itemId) => itemId !== exerciseId),
    }))
  }

  function handleDropAreaDragOver(event: DragEvent<HTMLDivElement>, day: DayKey) {
    event.preventDefault()
    setHoveredDay(day)
  }

  function handleDropAreaDragLeave(day: DayKey) {
    if (hoveredDay === day) {
      setHoveredDay(null)
    }
  }

  function toggleFavoriteExercise(exerciseId: string) {
    setFavoriteExercises((currentFavorites) => {
      if (currentFavorites.includes(exerciseId)) {
        return currentFavorites.filter((favoriteId) => favoriteId !== exerciseId)
      }

      return [...currentFavorites, exerciseId]
    })
  }

  function handleSendChatMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = chatInput.trim()

    if (!trimmed) {
      return
    }

    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`

    setMessagesByRole((currentMessages) => ({
      ...currentMessages,
      [activeCoachRole]: [
        ...currentMessages[activeCoachRole],
        {
          id: crypto.randomUUID(),
          sender: 'student',
          text: trimmed,
          time,
        },
      ],
    }))

    setChatInput('')
  }

  function handleQuickPrompt(prompt: string) {
    setChatInput(prompt)
  }

  function handleRedeemReward(rewardId: string, pointsCost: number, starsCost: number) {
    if (redeemedRewards.includes(rewardId)) {
      return
    }

    if (fitPoints < pointsCost || fitStars < starsCost) {
      return
    }

    setRedeemedRewards((currentRewards) => [...currentRewards, rewardId])
    setFitPoints((currentPoints) => currentPoints - pointsCost)
    setFitStars((currentStars) => currentStars - starsCost)
  }

  function updateNotificationSetting(setting: keyof typeof notificationSettings, value: boolean) {
    setNotificationSettings((currentSettings) => ({
      ...currentSettings,
      [setting]: value,
    }))
  }

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <LandingSection isStandalone />
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-7 pb-10 lg:space-y-8">
      <header className="relative overflow-hidden rounded-[30px] border border-border/70 bg-gradient-to-br from-[#ecf5ff] via-card to-[#fff0d7] p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.8)] sm:p-8">
        <div className="pointer-events-none absolute -left-14 top-0 h-36 w-36 rounded-full bg-primary/15 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-warning/25 blur-2xl" />

        <div className="relative">
          <FqTag tone="secondary" leftIcon="star" className="bg-secondary/15 text-secondary">
            Suite de produto FitQuest
          </FqTag>
          <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Entrega completa de UI para landing, coaching, onboarding, analytics, recompensas e configuracoes de perfil.
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Cada secao abaixo e uma tela dedicada com interacoes reais, desenhada com linguagem visual vibrante e responsiva.
          </p>
        </div>
      </header>

      <nav className="scrollbar-hide -mx-1 overflow-x-auto px-1" aria-label="Navegacao das telas FitQuest">
        <div className="inline-flex min-w-full gap-2 rounded-2xl border border-border/70 bg-card p-2 sm:min-w-fit">
          {screenLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-transparent bg-background px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground transition hover:border-primary/35 hover:text-primary sm:text-sm"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <LandingSection isStandalone={false} />

      <SectionShell
        id="coach-dashboard"
        eyebrow="Painel de Treinadores"
        title="Painel do coach para gerenciar alunos e planos"
        description="Fila centralizada de alunos, visao de adesao e atualizacoes praticas de plano para cada atleta."
      >
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
            <FqCard className="border-border bg-background">
              <p className="text-sm text-muted-foreground">Alunos ativos</p>
              <p className="mt-2 text-3xl font-black text-foreground">42</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-success">
                <FqIcon name="arrowRight" size={14} />
                +6 nesta semana
              </p>
            </FqCard>
            <FqCard className="border-border bg-background">
              <p className="text-sm text-muted-foreground">Adesao media</p>
              <p className="mt-2 text-3xl font-black text-foreground">88%</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-warning">
                <FqIcon name="chart" size={14} />
                4 alunos abaixo de 75%
              </p>
            </FqCard>
            <FqCard className="border-border bg-background">
              <p className="text-sm text-muted-foreground">Planos para revisar</p>
              <p className="mt-2 text-3xl font-black text-foreground">9</p>
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-secondary">
                <FqIcon name="clock" size={14} />
                3 para hoje
              </p>
            </FqCard>
          </div>

          <FqCard className="border-border bg-background lg:col-span-4">
            <p className="text-base font-semibold text-foreground">Foco do coach para hoje</p>
            <ul className="mt-3 space-y-3">
              {pendingPlanActions.map((item) => (
                <li key={item.student} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-sm font-semibold text-foreground">{item.student}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.action}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{item.due}</p>
                </li>
              ))}
            </ul>
          </FqCard>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <table className="w-full min-w-[680px] border-collapse bg-card text-left">
            <thead className="bg-accent/70 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Aluno</th>
                <th className="px-4 py-3 font-semibold">Meta</th>
                <th className="px-4 py-3 font-semibold">Adesao</th>
                <th className="px-4 py-3 font-semibold">Sequencia</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Acao</th>
              </tr>
            </thead>
            <tbody>
              {coachStudents.map((student) => (
                <tr key={student.name} className="border-t border-border text-sm text-foreground">
                  <td className="px-4 py-3 font-semibold">{student.name}</td>
                  <td className="px-4 py-3">{student.goal}</td>
                  <td className={cx('px-4 py-3 font-semibold', renderAdherenceTone(student.adherence))}>
                    {student.adherence}%
                  </td>
                  <td className="px-4 py-3">{student.streak} dias</td>
                  <td className="px-4 py-3">{student.status}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/35 hover:text-primary"
                    >
                      Abrir plano
                      <FqIcon name="arrowRight" size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>

      <SectionShell
        id="onboarding"
        eyebrow="Cadastro Inicial"
        title="Fluxo inicial para meta, biotipo, nivel e equipamentos"
        description="Fluxo em etapas com controles de pular/voltar, selecoes claras e saida legivel para o coach."
      >
        <div className="grid gap-5 lg:grid-cols-[0.34fr_0.66fr]">
          <aside className="rounded-2xl border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Progresso das etapas</p>
            <ol className="mt-4 space-y-3">
              {onboardingSteps.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={cx(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold',
                      index <= currentOnboardingStep
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className={cx('text-sm font-medium', index <= currentOnboardingStep ? 'text-foreground' : 'text-muted-foreground')}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-5 rounded-xl border border-dashed border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Resumo</p>
              <p className="mt-2 text-sm text-foreground">
                Meta: <strong>{goalOptions.find((item) => item.value === onboardingData.goal)?.title}</strong>
              </p>
              <p className="text-sm text-foreground">
                Biotipo: <strong>{bodyTypeOptions.find((item) => item.value === onboardingData.bodyType)?.title}</strong>
              </p>
              <p className="text-sm text-foreground">
                Nivel: <strong>{levelOptions.find((item) => item.value === onboardingData.level)?.title}</strong>
              </p>
            </div>
          </aside>

          <form className="space-y-5" onSubmit={handleOnboardingSubmit}>
            {currentOnboardingStep === 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {goalOptions.map((option) => (
                  <SelectableCard
                    key={option.value}
                    icon={option.icon}
                    title={option.title}
                    description={option.description}
                    selected={onboardingData.goal === option.value}
                    onClick={() => setOnboardingData((currentData) => ({ ...currentData, goal: option.value }))}
                  />
                ))}
              </div>
            ) : null}

            {currentOnboardingStep === 1 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {bodyTypeOptions.map((option) => (
                  <SelectableCard
                    key={option.value}
                    icon={option.icon}
                    title={option.title}
                    description={option.description}
                    selected={onboardingData.bodyType === option.value}
                    onClick={() => setOnboardingData((currentData) => ({ ...currentData, bodyType: option.value }))}
                  />
                ))}
              </div>
            ) : null}

            {currentOnboardingStep === 2 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {levelOptions.map((option) => (
                  <SelectableCard
                    key={option.value}
                    icon={option.icon}
                    title={option.title}
                    description={option.description}
                    selected={onboardingData.level === option.value}
                    onClick={() => setOnboardingData((currentData) => ({ ...currentData, level: option.value }))}
                  />
                ))}
              </div>
            ) : null}

            {currentOnboardingStep === 3 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {equipmentOptions.map((option) => {
                  const isSelected = onboardingData.equipment.includes(option.value)

                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleToggleEquipment(option.value)}
                      className={cx(
                        'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/35',
                      )}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      {isSelected ? <FqIcon name="check" size={16} className="text-primary" /> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
              <div className="flex gap-2">
                <FqButton variant="outline" tone="neutral" onClick={handleBackOnboardingStep} isDisabled={currentOnboardingStep === 0}>
                  Voltar
                </FqButton>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
                  onClick={() => setCurrentOnboardingStep(onboardingSteps.length - 1)}
                >
                  Pular para a etapa final
                </button>
              </div>

              <FqButton type="submit" rightIcon={currentOnboardingStep === onboardingSteps.length - 1 ? 'check' : 'arrowRight'}>
                {currentOnboardingStep === onboardingSteps.length - 1 ? 'Criar perfil' : 'Proxima etapa'}
              </FqButton>
            </div>
          </form>
        </div>
      </SectionShell>

      <SectionShell
        id="mobile-workout"
        eyebrow="Treino Mobile"
        title="UI mobile de treinos com sequencia, estrelas e conquistas"
        description="Layout compacto focado em mobile, com sessao em destaque, retorno de recompensas e marcos."
      >
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.44fr_0.56fr]">
          <div className="mx-auto w-full max-w-[350px] rounded-[34px] border border-border bg-background p-3 shadow-[0_20px_55px_-35px_rgba(2,6,23,0.75)]">
            <div className="rounded-[28px] border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Treino de hoje</p>
                <button type="button" className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-accent text-foreground">
                  <FqIcon name="bell" size={14} />
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/10 to-warning/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Missao de membros superiores</p>
                <p className="mt-1 text-xl font-black text-foreground">Sessao de 42 min</p>
                <div className="mt-3 flex items-center gap-2">
                  <FqTag tone="danger" leftIcon="flame">
                    Sequencia de 18 dias
                  </FqTag>
                  <FqTag tone="warning" leftIcon="star">
                    132 estrelas
                  </FqTag>
                </div>
                <FqButton className="mt-4 w-full" leftIcon="play">
                  Iniciar treino
                </FqButton>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Conquistas de hoje</p>
                <article className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Dia sem falha</p>
                    <p className="text-xs text-muted-foreground">Concluir 1 tarefa de treino</p>
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/20 text-success">
                    <FqIcon name="check" size={14} />
                  </span>
                </article>
                <article className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sequencia de hidratacao</p>
                    <p className="text-xs text-muted-foreground">Progresso da meta de 2,5L</p>
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                    <FqIcon name="flask" size={14} />
                  </span>
                </article>
              </div>
            </div>
          </div>

          <div className="grid content-start gap-3 sm:grid-cols-2">
            <FqCard className="border-border bg-background">
              <p className="text-sm text-muted-foreground">Estrelas semanais</p>
              <p className="mt-1 text-2xl font-black text-foreground">248</p>
              <p className="mt-1 text-sm text-warning">+36 desde segunda</p>
            </FqCard>
            <FqCard className="border-border bg-background">
              <p className="text-sm text-muted-foreground">Sequencia atual</p>
              <p className="mt-1 text-2xl font-black text-foreground">18 dias</p>
              <p className="mt-1 text-sm text-destructive">Continue ativo para proteger a sequencia</p>
            </FqCard>
            <article className="rounded-2xl border border-border bg-background p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-foreground">Linha do tempo de conquistas</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Desbloqueado</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Rookie da consistencia</p>
                  <p className="text-xs text-muted-foreground">Sequencia de 7 dias atingida</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Em progresso</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Guardiao da execucao</p>
                  <p className="text-xs text-muted-foreground">6 de 10 series perfeitas</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Proxima recompensa</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Selo elite</p>
                  <p className="text-xs text-muted-foreground">Ganhe mais 40 estrelas</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="analytics"
        eyebrow="Analise de Progresso"
        title="Analise de peso, IMC, medidas e adesao"
        description="Layout analitico focado em tendencia com snapshots de graficos e metricas corporais para revisao."
      >
        <div className="grid gap-4 xl:grid-cols-12">
          <article className="rounded-2xl border border-border bg-background p-4 xl:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-base font-semibold text-foreground">Tendencia de peso (kg)</p>
              <FqTag tone="success" leftIcon="check">
                -3,9 kg em 6 semanas
              </FqTag>
            </div>

            <div className="mt-4 overflow-x-auto">
              <svg viewBox="0 0 640 220" className="h-[220px] min-w-[640px] w-full" role="img" aria-label="Grafico de linha de tendencia de peso">
                <defs>
                  <linearGradient id="weightStroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--secondary)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((index) => (
                  <line
                    key={index}
                    x1="32"
                    x2="608"
                    y1={24 + index * 42}
                    y2={24 + index * 42}
                    stroke="var(--border)"
                    strokeDasharray="5 6"
                    strokeWidth="1"
                  />
                ))}
                <polyline
                  fill="none"
                  stroke="url(#weightStroke)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weightLinePoints}
                />
                {progressLabels.map((label, index) => {
                  const x = 32 + (index / Math.max(progressLabels.length - 1, 1)) * 576
                  return (
                    <g key={label}>
                      <text x={x} y="212" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
                        {label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">IMC atual</p>
              <p className="mt-1 text-3xl font-black text-foreground">25.9</p>
              <p className="mt-1 text-sm text-success">Movendo para a faixa saudavel</p>

              <div className="mt-4 overflow-x-auto">
                <svg viewBox="0 0 640 140" className="h-[120px] min-w-[640px] w-full" role="img" aria-label="Grafico de linha de tendencia de IMC">
                  <polyline
                    fill="none"
                    stroke="var(--warning)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={imcLinePoints}
                  />
                </svg>
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Pontuacao de adesao</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <FqProgressRing value={adherenceByWeek[adherenceByWeek.length - 1]} max={100} tone="success" size={100} label="Semanal" />
                <div className="flex-1 space-y-2">
                  {adherenceByWeek.slice(-3).map((value, index) => (
                    <div key={`${value}-${index}`}>
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Semana {index + 4}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${value}%` }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {bodyMeasures.map((measure) => {
            const delta = measure.current - measure.previous
            const isPositive = delta >= 0

            return (
              <article key={measure.label} className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">{measure.label}</p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {measure.current}
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">{measure.unit}</span>
                </p>
                <p className={cx('mt-1 text-sm font-semibold', isPositive ? 'text-success' : 'text-destructive')}>
                  {isPositive ? '+' : ''}
                  {delta.toFixed(1)} {measure.unit}
                </p>
              </article>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell
        id="plan-builder"
        eyebrow="Construtor de Plano"
        title="Construtor de plano com busca, filtros e arraste de dias"
        description="Encontre exercicios rapido, arraste cards para a semana e ajuste a estrutura em segundos."
      >
        <div className="grid gap-4 xl:grid-cols-12">
          <aside className="space-y-3 rounded-2xl border border-border bg-background p-4 xl:col-span-4">
            <FqInput
              label="Buscar exercicio"
              placeholder="Digite um movimento ou musculo"
              value={planSearch}
              onChange={(event) => setPlanSearch(event.currentTarget.value)}
              leftIcon="search"
            />

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: 'all', label: workoutFocusLabelMap.all },
                  { key: 'strength', label: workoutFocusLabelMap.strength },
                  { key: 'cardio', label: workoutFocusLabelMap.cardio },
                  { key: 'mobility', label: workoutFocusLabelMap.mobility },
                ] as const
              ).map((filterOption) => (
                <button
                  type="button"
                  key={filterOption.key}
                  onClick={() => setPlanFilter(filterOption.key)}
                  className={cx(
                    'inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    planFilter === filterOption.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-primary',
                  )}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredCatalogExercises.map((exercise) => (
                <article
                  key={exercise.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'copy'
                    setDraggedExerciseId(exercise.id)
                  }}
                  onDragEnd={() => {
                    setDraggedExerciseId(null)
                    setHoveredDay(null)
                  }}
                  className="cursor-grab rounded-xl border border-border bg-card p-3 active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{exercise.name}</p>
                    <FqIcon name="list" size={14} className="text-muted-foreground" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <FqTag tone="secondary">{workoutFocusLabelMap[exercise.focus]}</FqTag>
                    <FqTag tone="neutral">{libraryCategoryLabelMap[exercise.muscle]}</FqTag>
                    <FqTag tone="warning">{exercise.durationMin} min</FqTag>
                  </div>
                </article>
              ))}

              {filteredCatalogExercises.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Nenhum exercicio corresponde aos filtros atuais.
                </p>
              ) : null}
            </div>
          </aside>

          <div className="xl:col-span-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {builderDays.map((day) => (
                <div
                  key={day.key}
                  onDragOver={(event) => handleDropAreaDragOver(event, day.key)}
                  onDragLeave={() => handleDropAreaDragLeave(day.key)}
                  onDrop={(event) => {
                    event.preventDefault()
                    handleDropExercise(day.key)
                  }}
                  className={cx(
                    'min-h-[190px] rounded-xl border p-3 transition',
                    hoveredDay === day.key ? 'border-primary bg-primary/5' : 'border-border bg-background',
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{day.label}</p>
                    <span className="text-xs font-semibold text-muted-foreground">{planBoard[day.key].length}</span>
                  </div>

                  <div className="space-y-2">
                    {planBoard[day.key].map((exerciseId) => {
                      const exercise = exercisesById.get(exerciseId)

                      if (!exercise) {
                        return null
                      }

                      return (
                        <article key={`${day.key}-${exerciseId}`} className="rounded-lg border border-border bg-card p-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground">{exercise.name}</p>
                            <button
                              type="button"
                              className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-accent text-muted-foreground transition hover:text-destructive"
                              onClick={() => handleRemoveExerciseFromDay(day.key, exerciseId)}
                              aria-label={`Remover ${exercise.name}`}
                            >
                              <FqIcon name="x" size={12} />
                            </button>
                          </div>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{workoutFocusLabelMap[exercise.focus]}</p>
                        </article>
                      )
                    })}

                    {planBoard[day.key].length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-2 text-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Solte o exercicio aqui
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="exercise-library"
        eyebrow="Biblioteca de Exercicios"
        title="Biblioteca com mapa muscular, categorias e favoritos"
        description="Alvo muscular visual, filtros por categoria e favoritos rapidos para curadoria da biblioteca."
      >
        <div className="grid gap-4 lg:grid-cols-[0.34fr_0.66fr]">
          <aside className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Mapa muscular</p>
              <div className="inline-flex rounded-full border border-border bg-card p-1">
                <button
                  type="button"
                  className={cx(
                    'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition',
                    muscleMapView === 'male' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                  onClick={() => setMuscleMapView('male')}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  className={cx(
                    'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition',
                    muscleMapView === 'female' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                  onClick={() => setMuscleMapView('female')}
                >
                  Feminino
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card p-3">
              <img
                src={muscleMapView === 'male' ? menMusclesFront : womenMuscles}
                alt={muscleMapView === 'male' ? 'Mapa muscular masculino vista frontal' : 'Mapa muscular feminino vista frontal'}
                className="mx-auto h-72 w-auto object-contain"
              />
            </div>
          </aside>

          <div className="space-y-3">
            <FqInput
              label="Buscar na biblioteca"
              placeholder="Buscar por exercicio ou musculo"
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.currentTarget.value)}
              leftIcon="search"
            />

            <div className="flex flex-wrap gap-2">
              {libraryCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setLibraryCategory(category)}
                  className={cx(
                    'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    libraryCategory === category
                      ? 'border-secondary bg-secondary text-secondary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-secondary/40 hover:text-secondary',
                  )}
                >
                  {libraryCategoryLabelMap[category]}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {filteredLibraryExercises.map((exercise) => {
                const isFavorite = favoriteExercises.includes(exercise.id)

                return (
                  <article key={exercise.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{exercise.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                          {libraryCategoryLabelMap[exercise.muscle]} | {exerciseLevelLabelMap[exercise.level]}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavoriteExercise(exercise.id)}
                        className={cx(
                          'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition',
                          isFavorite
                            ? 'border-warning bg-warning/20 text-warning'
                            : 'border-border bg-card text-muted-foreground hover:border-warning/50 hover:text-warning',
                        )}
                        aria-label={isFavorite ? `Remover ${exercise.name} dos favoritos` : `Adicionar ${exercise.name} aos favoritos`}
                      >
                        <FqIcon name="star" size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <FqTag tone="primary">{workoutFocusLabelMap[exercise.focus]}</FqTag>
                      <FqTag tone="neutral">{exerciseEquipmentLabelMap[exercise.equipment]}</FqTag>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="ai-chat"
        eyebrow="Chat com IA"
        title="Chat de IA para suporte de personal e nutricionista"
        description="Duas conversas por papel, com sugestoes rapidas, campo controlado e contexto do historico."
      >
        <div className="grid gap-4 lg:grid-cols-[0.3fr_0.7fr]">
          <aside className="rounded-2xl border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Modo de assistente</p>
            <div className="mt-3 space-y-2">
              {(
                [
                  { key: 'personal', label: 'Treinador', icon: 'dumbbell' },
                  { key: 'nutritionist', label: 'Nutricionista', icon: 'utensils' },
                ] as const
              ).map((assistant) => (
                <button
                  key={assistant.key}
                  type="button"
                  onClick={() => setActiveCoachRole(assistant.key)}
                  className={cx(
                    'flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-left transition',
                    activeCoachRole === assistant.key
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-primary',
                  )}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <FqIcon name={assistant.icon} size={15} />
                    {assistant.label}
                  </span>
                  {activeCoachRole === assistant.key ? <FqIcon name="check" size={14} className="text-primary" /> : null}
                </button>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Prompts rapidos</p>
            <div className="mt-2 space-y-2">
              {quickPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground transition hover:border-secondary/40 hover:text-secondary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </aside>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="text-base font-semibold text-foreground">
                {activeCoachRole === 'personal' ? 'IA do Treinador' : 'IA da Nutricionista'}
              </p>
              <FqTag tone="success" leftIcon="activity">
                Suporte ao vivo
              </FqTag>
            </div>

            <div className="mt-4 max-h-[320px] space-y-2 overflow-y-auto pr-1">
              {messagesByRole[activeCoachRole].map((message) => (
                <article
                  key={message.id}
                  className={cx('max-w-[84%] rounded-2xl px-3 py-2.5 text-sm', message.sender === 'coach' ? 'bg-secondary/15 text-foreground' : 'ml-auto bg-primary text-primary-foreground')}
                >
                  <p>{message.text}</p>
                  <p className={cx('mt-1 text-[11px] uppercase tracking-[0.16em]', message.sender === 'coach' ? 'text-muted-foreground' : 'text-primary-foreground/80')}>
                    {message.time}
                  </p>
                </article>
              ))}
            </div>

            <form className="mt-4 flex items-end gap-2" onSubmit={handleSendChatMessage}>
              <div className="flex-1">
                <FqInput
                  label="Mensagem"
                  placeholder="Digite uma instrucao para o assistente do plano"
                  value={chatInput}
                  onChange={(event) => setChatInput(event.currentTarget.value)}
                />
              </div>
              <FqButton type="submit" leftIcon="arrowRight">
                Enviar
              </FqButton>
            </form>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="rewards-shop"
        eyebrow="Loja de Recompensas"
        title="Loja de recompensas com pontos/estrelas e desafios semanais"
        description="Progressao de desafios com catalogo resgatavel, checagem de saldo e retorno imediato."
      >
        <div className="grid gap-4 xl:grid-cols-12">
          <aside className="space-y-3 rounded-2xl border border-border bg-background p-4 xl:col-span-4">
            <div className="rounded-xl bg-gradient-to-br from-primary/20 via-secondary/15 to-warning/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Saldo atual</p>
              <p className="mt-2 text-3xl font-black text-foreground">{fitPoints} pts</p>
              <p className="text-sm font-semibold text-warning">{fitStars} estrelas</p>
            </div>

            <div className="space-y-2">
              {weeklyChallenges.map((challenge) => {
                const percentage = Math.min((challenge.progress / challenge.target) * 100, 100)

                return (
                  <article key={challenge.title} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-sm font-semibold text-foreground">{challenge.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{challenge.description}</p>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-secondary" style={{ width: `${percentage}%` }} aria-hidden />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>
                        {challenge.progress}/{challenge.target}
                      </span>
                      <span>
                        +{challenge.rewardPoints} pts | +{challenge.rewardStars} estrelas
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          </aside>

          <div className="grid gap-3 sm:grid-cols-2 xl:col-span-8">
            {rewardsCatalog.map((reward) => {
              const isRedeemed = redeemedRewards.includes(reward.id)
              const isAffordable = fitPoints >= reward.points && fitStars >= reward.stars

              return (
                <article key={reward.id} className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-base font-semibold text-foreground">{reward.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{reward.details}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <FqTag tone="primary" leftIcon="star">
                      {reward.points} pts
                    </FqTag>
                    <FqTag tone="warning" leftIcon="trophy">
                      {reward.stars} estrelas
                    </FqTag>
                  </div>

                  <div className="mt-4">
                    <FqButton
                      className="w-full"
                      tone={isRedeemed ? 'neutral' : 'primary'}
                      variant={isRedeemed ? 'outline' : 'solid'}
                      isDisabled={isRedeemed || !isAffordable}
                      onClick={() => handleRedeemReward(reward.id, reward.points, reward.stars)}
                    >
                      {isRedeemed ? 'Resgatado' : isAffordable ? 'Resgatar recompensa' : 'Saldo insuficiente'}
                    </FqButton>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="profile-settings"
        eyebrow="Perfil e Configuracoes"
        title="Perfil e configuracoes com tema claro/escuro"
        description="Gestao de perfil do coach, preferencias de notificacao e troca instantanea de tema."
      >
        <div className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
          <aside className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {profileData.name.charAt(0)}
              </span>
              <div>
                <p className="text-base font-semibold text-foreground">{profileData.name}</p>
                <p className="text-sm text-muted-foreground">Treinador principal</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <article className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tema</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{isDarkTheme ? 'Modo escuro ativo' : 'Modo claro ativo'}</p>
                  <FqSwitch
                    checked={isDarkTheme}
                    onCheckedChange={setIsDarkTheme}
                    label={isDarkTheme ? 'Tema escuro' : 'Tema claro'}
                    tone="neutral"
                  />
                </div>
              </article>

              <article className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Nivel da conta</p>
                <p className="mt-2 text-2xl font-black text-foreground">Treinador Pro</p>
                <p className="text-sm text-muted-foreground">Renova em 24 dias</p>
              </article>
            </div>
          </aside>

          <div className="space-y-4">
            <form className="grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FqInput
                  label="Nome de exibicao"
                  value={profileData.name}
                  onChange={(event) => setProfileData((current) => ({ ...current, name: event.currentTarget.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <FqInput
                  type="email"
                  label="Email"
                  value={profileData.email}
                  onChange={(event) => setProfileData((current) => ({ ...current, email: event.currentTarget.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <FqInput
                  label="Fuso horario"
                  value={profileData.timezone}
                  onChange={(event) => setProfileData((current) => ({ ...current, timezone: event.currentTarget.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <FqButton type="button" className="w-full" leftIcon="check">
                  Salvar alteracoes do perfil
                </FqButton>
              </div>
            </form>

            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-base font-semibold text-foreground">Configuracoes de notificacao</p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
                  <p className="text-sm text-foreground">Lembretes de treino</p>
                  <FqSwitch
                    checked={notificationSettings.workoutReminders}
                    onCheckedChange={(value) => updateNotificationSetting('workoutReminders', value)}
                    tone="primary"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
                  <p className="text-sm text-foreground">Alertas de refeicao</p>
                  <FqSwitch
                    checked={notificationSettings.mealAlerts}
                    onCheckedChange={(value) => updateNotificationSetting('mealAlerts', value)}
                    tone="primary"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
                  <p className="text-sm text-foreground">Alertas de baixa adesao</p>
                  <FqSwitch
                    checked={notificationSettings.lowAdherenceAlerts}
                    onCheckedChange={(value) => updateNotificationSetting('lowAdherenceAlerts', value)}
                    tone="danger"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5">
                  <p className="text-sm text-foreground">Relatorios semanais por email</p>
                  <FqSwitch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(value) => updateNotificationSetting('weeklyReports', value)}
                    tone="neutral"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </section>
  )
}
