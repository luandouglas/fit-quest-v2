export type NotificationType = 'goal' | 'mission' | 'workout' | 'badge' | 'nutrition' | 'gamification' | 'system'

export type NotificationTrigger =
  | 'workout_pending'
  | 'meal_pending'
  | 'water_incomplete'
  | 'streak_risk'
  | 'achievement_unlocked'
  | 'level_up'
  | 'workout_assigned'
  | 'nutrition_plan_updated'
  | 'goal_reached'
  | 'mission_completed'
  | 'system'

export type NotificationUrgency = 'critical' | 'attention' | 'opportunity' | 'celebration'

export type NotificationOrigin = 'workout' | 'nutrition' | 'hydration' | 'gamification' | 'routine' | 'system'

export type NotificationDeliveryChannel = 'in_app' | 'push' | 'local'

export type NotificationAction = {
  label: string
  route?: string
  intent?: string
}

export type NotificationDeliveryState = {
  deliveredAt?: string
  readAt?: string
  surfacedAt?: string
}

export type NotificationPushPermission = 'prompt' | 'granted' | 'denied' | 'unsupported'

export type NotificationPushPlatform = 'web' | 'android' | 'ios'

export type NotificationPushState = {
  permission: NotificationPushPermission
  platform: NotificationPushPlatform
  isRegistered: boolean
  token?: string | null
  lastSyncedAt?: string
}

export type NotificationItem = {
  id: string
  entityKey: string
  title: string
  description: string
  at: string
  type: NotificationType
  trigger: NotificationTrigger
  urgency: NotificationUrgency
  origin: NotificationOrigin
  action?: NotificationAction
  channels?: NotificationDeliveryChannel[]
  delivery?: NotificationDeliveryState
  expiresAt?: string
  read: boolean
  recipientStudentId?: string
  senderRole?: 'STUDENT' | 'PERSONAL' | 'NUTRITIONIST' | 'SYSTEM'
}

export type NotificationsInbox = {
  unreadCount: number
  items: NotificationItem[]
}

export type NotificationsContextSummary = {
  unreadCount: number
  criticalCount: number
  attentionCount: number
  celebrationCount: number
}
