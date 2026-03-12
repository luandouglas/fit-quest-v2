import type { NotificationsInbox } from '@/shared/services/contracts/notifications'
import { getNotificationsRepository } from '@/shared/services/repositories/notificationsRepositoryFactory'

export const notificationsService = {
  async getInbox(): Promise<NotificationsInbox> {
    return getNotificationsRepository().getInbox()
  },
  async markAsRead(notificationId: string): Promise<NotificationsInbox> {
    return getNotificationsRepository().markAsRead(notificationId)
  },
  async markAllAsRead(): Promise<NotificationsInbox> {
    return getNotificationsRepository().markAllAsRead()
  },
}
