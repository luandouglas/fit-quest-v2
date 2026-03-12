import { useMemo } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { notificationsPushRuntimeService, type NotificationItem, type NotificationPushState } from '@/shared/services'
import type { NotificationUrgency, NotificationTrigger } from '@/shared/services/contracts/notifications'
import type { FqTone, IconName } from '@/shared/ui'

import { useNotificationsInbox } from './useNotificationsInbox'
import { notificationsQueryKeys } from './queryKeys'

export type NotificationsContextItem = {
  id: string
  title: string
  description: string
  tone: FqTone
  icon: IconName
  tagLabel: string
  metaLabel: string
  actionLabel?: string
  actionRoute?: string
  urgency: NotificationUrgency
  trigger: NotificationTrigger
  isUnread: boolean
}

export type NotificationsCenterViewModel = {
  headline: string
  subheadline: string
  spotlight: NotificationsContextItem | null
  reminders: NotificationsContextItem[]
  opportunities: NotificationsContextItem[]
  celebrations: NotificationsContextItem[]
  inbox: NotificationsContextItem[]
  homeAlerts: NotificationsContextItem[]
  profileDigest: {
    headline: string
    supportLabel: string
    unreadCount: number
    reminderCount: number
    celebrationCount: number
  }
  contextSummary: {
    unreadCount: number
    criticalCount: number
    attentionCount: number
    celebrationCount: number
  }
}

const urgencyOrder: Record<NotificationUrgency, number> = {
  critical: 0,
  attention: 1,
  opportunity: 2,
  celebration: 3,
}

function formatDateTime(isoDate: string) {
  const date = new Date(isoDate)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()

  return new Intl.DateTimeFormat('pt-BR', sameDay ? { hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: '2-digit' }).format(date)
}

function getNotificationTone(urgency: NotificationUrgency): FqTone {
  if (urgency === 'critical') {
    return 'danger'
  }

  if (urgency === 'attention') {
    return 'warning'
  }

  if (urgency === 'celebration') {
    return 'success'
  }

  return 'primary'
}

function getNotificationTagLabel(urgency: NotificationUrgency) {
  if (urgency === 'critical') {
    return 'Em risco'
  }

  if (urgency === 'attention') {
    return 'Hoje'
  }

  if (urgency === 'celebration') {
    return 'Evolucao'
  }

  return 'Oportunidade'
}

function getNotificationIcon(trigger: NotificationTrigger): IconName {
  switch (trigger) {
    case 'workout_pending':
    case 'workout_assigned':
      return 'dumbbell'
    case 'meal_pending':
    case 'nutrition_plan_updated':
      return 'utensils'
    case 'water_incomplete':
    case 'goal_reached':
      return 'flask'
    case 'achievement_unlocked':
      return 'trophy'
    case 'level_up':
      return 'star'
    case 'streak_risk':
      return 'flame'
    case 'mission_completed':
      return 'target'
    default:
      return 'bell'
  }
}

function getDefaultAction(trigger: NotificationTrigger) {
  switch (trigger) {
    case 'workout_pending':
      return { label: 'Iniciar treino', route: '/tabs/workouts/session' }
    case 'workout_assigned':
      return { label: 'Ver treino', route: '/tabs/workouts' }
    case 'meal_pending':
    case 'nutrition_plan_updated':
      return { label: 'Abrir nutricao', route: '/tabs/nutrition' }
    case 'water_incomplete':
      return { label: 'Registrar agua', route: '/tabs/nutrition' }
    case 'streak_risk':
      return { label: 'Salvar o dia', route: '/tabs/student' }
    case 'achievement_unlocked':
    case 'level_up':
    case 'mission_completed':
      return { label: 'Ver gamificacao', route: '/tabs/gamification' }
    case 'goal_reached':
      return { label: 'Ver progresso', route: '/tabs/progress' }
    default:
      return undefined
  }
}

function toContextItem(item: NotificationItem): NotificationsContextItem {
  const fallbackAction = getDefaultAction(item.trigger)

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    tone: getNotificationTone(item.urgency),
    icon: getNotificationIcon(item.trigger),
    tagLabel: getNotificationTagLabel(item.urgency),
    metaLabel: formatDateTime(item.at),
    actionLabel: item.action?.label ?? fallbackAction?.label,
    actionRoute: item.action?.route ?? fallbackAction?.route,
    urgency: item.urgency,
    trigger: item.trigger,
    isUnread: !item.read,
  }
}

function buildPushFallbackState(): NotificationPushState {
  return {
    permission: 'unsupported',
    platform: 'web',
    isRegistered: false,
    token: null,
  }
}

function buildHeadline(reminderCount: number, celebrationCount: number, unreadCount: number) {
  if (reminderCount > 0) {
    return {
      headline: 'Sua rotina pede poucas acoes, mas no momento certo.',
      subheadline: `${reminderCount} lembrete(s) estao puxando a execucao de hoje para frente sem virar ruido.`,
    }
  }

  if (celebrationCount > 0) {
    return {
      headline: 'Seu progresso esta sendo reconhecido.',
      subheadline: `${celebrationCount} conquista(s) recente(s) reforcam consistencia, nivel e retorno diario.`,
    }
  }

  if (unreadCount > 0) {
    return {
      headline: 'Existem sinais novos para manter sua rotina afiada.',
      subheadline: 'A inbox esta organizada por urgencia para voce resolver primeiro o que move o dia.',
    }
  }

  return {
    headline: 'Tudo sob controle por agora.',
    subheadline: 'Quando algo realmente importar hoje, ele aparece aqui com contexto e proxima acao.',
  }
}

export function useNotificationsCenter() {
  const queryClient = useQueryClient()
  const {
    inbox,
    uiState,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
  } = useNotificationsInbox()

  const pushQuery = useQuery({
    queryKey: notificationsQueryKeys.pushState,
    queryFn: () => notificationsPushRuntimeService.getState(),
    staleTime: 60_000,
  })

  const enablePushMutation = useMutation({
    mutationFn: () => notificationsPushRuntimeService.register(),
    onSuccess: (pushState) => {
      queryClient.setQueryData(notificationsQueryKeys.pushState, pushState)
    },
  })

  const viewModel = useMemo<NotificationsCenterViewModel>(() => {
    const sortedItems = [...(inbox?.items ?? [])]
      .sort((left, right) => {
        if (left.read !== right.read) {
          return Number(left.read) - Number(right.read)
        }

        const urgencyDelta = urgencyOrder[left.urgency] - urgencyOrder[right.urgency]
        if (urgencyDelta !== 0) {
          return urgencyDelta
        }

        return new Date(right.at).getTime() - new Date(left.at).getTime()
      })
      .map(toContextItem)

    const reminders = sortedItems.filter((item) => item.urgency === 'critical' || item.urgency === 'attention')
    const opportunities = sortedItems.filter((item) => item.urgency === 'opportunity')
    const celebrations = sortedItems.filter((item) => item.urgency === 'celebration')
    const spotlight = reminders[0] ?? opportunities[0] ?? celebrations[0] ?? sortedItems[0] ?? null
    const headline = buildHeadline(reminders.length, celebrations.length, inbox?.unreadCount ?? 0)

    return {
      ...headline,
      spotlight,
      reminders,
      opportunities,
      celebrations,
      inbox: sortedItems,
      homeAlerts: (reminders.length > 0 ? reminders : sortedItems).slice(0, 4),
      profileDigest: {
        headline:
          reminders.length > 0
            ? `${reminders.length} lembrete(s) podem mexer no seu dia agora`
            : celebrations.length > 0
              ? `${celebrations.length} ganho(s) recente(s) reforcam sua jornada`
              : 'Rotina alinhada e sem pendencias relevantes',
        supportLabel:
          spotlight?.title ?? 'Push, inbox e avisos contextuais continuam prontos para Web, Android e iOS.',
        unreadCount: inbox?.unreadCount ?? 0,
        reminderCount: reminders.length,
        celebrationCount: celebrations.length,
      },
      contextSummary: {
        unreadCount: inbox?.unreadCount ?? 0,
        criticalCount: reminders.filter((item) => item.urgency === 'critical').length,
        attentionCount: reminders.filter((item) => item.urgency === 'attention').length,
        celebrationCount: celebrations.length,
      },
    }
  }, [inbox])

  const pushState = pushQuery.data ?? buildPushFallbackState()

  return {
    inbox,
    uiState,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
    viewModel,
    pushState,
    isPushStateLoading: pushQuery.isPending,
    enablePush: enablePushMutation.mutateAsync,
    isEnablingPush: enablePushMutation.isPending,
  }
}
