import type { NotificationsInbox } from '@/shared/services/contracts/notifications'
import type { StudentRepositorySource } from '@/shared/services/contracts/student'

export interface NotificationsRepository {
  readonly source: StudentRepositorySource
  getInbox(): Promise<NotificationsInbox>
  markAsRead(notificationId: string): Promise<NotificationsInbox>
  markAllAsRead(): Promise<NotificationsInbox>
}
