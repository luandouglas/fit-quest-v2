import type { IconName } from '@/shared/ui'

import { studentRoutes } from './routes'

export type StudentSectionKey =
  | 'home'
  | 'workouts'
  | 'cardio'
  | 'nutrition'
  | 'progress'
  | 'gamification'
  | 'profile'
  | 'ranking'
  | 'notifications'

export type StudentNavigationItem = {
  key: StudentSectionKey
  label: string
  shortLabel: string
  description: string
  icon: IconName
  path: string
  exact?: boolean
  primary: boolean
  mobileDock: boolean
  matches: (pathname: string) => boolean
}

export const studentNavigationItems: StudentNavigationItem[] = [
  {
    key: 'home',
    label: 'Home',
    shortLabel: 'Home',
    description: 'Hoje e prioridades do aluno',
    icon: 'home',
    path: studentRoutes.hub,
    exact: true,
    primary: true,
    mobileDock: true,
    matches: (pathname) => pathname === studentRoutes.hub || pathname === studentRoutes.legacyHome,
  },
  {
    key: 'workouts',
    label: 'Treinos',
    shortLabel: 'Treinos',
    description: 'Plano, execução e sessão ativa',
    icon: 'dumbbell',
    path: studentRoutes.workouts,
    exact: true,
    primary: true,
    mobileDock: true,
    matches: (pathname) => pathname.startsWith(studentRoutes.workouts),
  },
  {
    key: 'cardio',
    label: 'Corrida',
    shortLabel: 'Corrida',
    description: 'Corrida e caminhada',
    icon: 'mapPin',
    path: studentRoutes.cardio,
    exact: true,
    primary: true,
    mobileDock: true,
    matches: (pathname) => pathname.startsWith(studentRoutes.cardio),
  },
  {
    key: 'nutrition',
    label: 'Nutrição',
    shortLabel: 'Nutrição',
    description: 'Plano alimentar e água',
    icon: 'utensils',
    path: studentRoutes.nutrition,
    primary: true,
    mobileDock: true,
    matches: (pathname) => pathname.startsWith(studentRoutes.nutrition),
  },
  {
    key: 'progress',
    label: 'Progresso',
    shortLabel: 'Progresso',
    description: 'Métricas, histórico e evolução',
    icon: 'chart',
    path: studentRoutes.progress,
    exact: true,
    primary: true,
    mobileDock: true,
    matches: (pathname) => pathname === studentRoutes.progress,
  },
  {
    key: 'gamification',
    label: 'Gamificação',
    shortLabel: 'XP',
    description: 'Nível, streak e conquistas',
    icon: 'gamepad',
    path: studentRoutes.rewards,
    exact: true,
    primary: true,
    mobileDock: false,
    matches: (pathname) => pathname === studentRoutes.rewards,
  },
  {
    key: 'profile',
    label: 'Perfil',
    shortLabel: 'Perfil',
    description: 'Preferências e dados pessoais',
    icon: 'user',
    path: studentRoutes.profile,
    exact: true,
    primary: true,
    mobileDock: false,
    matches: (pathname) => pathname === studentRoutes.profile,
  },
  {
    key: 'ranking',
    label: 'Ranking',
    shortLabel: 'Ranking',
    description: 'Competição e posição semanal',
    icon: 'trophy',
    path: studentRoutes.ranking,
    exact: true,
    primary: false,
    mobileDock: false,
    matches: (pathname) => pathname === studentRoutes.ranking,
  },
  {
    key: 'notifications',
    label: 'Notificações',
    shortLabel: 'Inbox',
    description: 'Alertas, lembretes e mensagens',
    icon: 'bell',
    path: studentRoutes.notifications,
    exact: true,
    primary: false,
    mobileDock: false,
    matches: (pathname) => pathname === studentRoutes.notifications,
  },
]

export const studentPrimaryNavigationItems = studentNavigationItems.filter(
  (item) => item.primary,
)

export const studentDockNavigationItems = studentPrimaryNavigationItems.filter(
  (item) => item.mobileDock,
)

export const studentUtilityNavigationItems = studentNavigationItems.filter(
  (item) => !item.primary,
)

export function getStudentNavigationItem(pathname: string) {
  return studentNavigationItems.find((item) => item.matches(pathname)) ?? null
}

export function isStudentExperiencePath(pathname: string) {
  return getStudentNavigationItem(pathname) !== null
}

export function shouldHideStudentExperienceChrome(pathname: string) {
  return (
    pathname === studentRoutes.workoutSession ||
    pathname.startsWith(studentRoutes.workoutCompletionBase) ||
    pathname === studentRoutes.cardioSession ||
    pathname.startsWith(studentRoutes.cardioSummaryBase)
  )
}
