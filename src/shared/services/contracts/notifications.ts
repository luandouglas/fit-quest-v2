export type NotificationType = 'goal' | 'mission' | 'workout' | 'badge' | 'system'

export type NotificationItem = {
  id: string
  entityKey: string
  title: string
  description: string
  at: string
  type: NotificationType
  read: boolean
  recipientStudentId?: string
  senderRole?: 'STUDENT' | 'PERSONAL' | 'NUTRITIONIST' | 'SYSTEM'
}

export type NotificationsInbox = {
  unreadCount: number
  items: NotificationItem[]
}
