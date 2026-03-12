import { httpClient } from '@/shared/services/http'
import type { NotificationsInbox } from '@/shared/services/contracts/notifications'

import type { NotificationsRepository } from './notificationsRepository'

export const notificationsMockRepository: NotificationsRepository = {
  source: 'mock',
  async getInbox(): Promise<NotificationsInbox> {
    return httpClient.get<NotificationsInbox>('/notifications/inbox')
  },
  async markAsRead(notificationId: string): Promise<NotificationsInbox> {
    return httpClient.patch<NotificationsInbox, { notificationId: string }>('/notifications/read', {
      notificationId,
    })
  },
  async markAllAsRead(): Promise<NotificationsInbox> {
    return httpClient.post<NotificationsInbox>('/notifications/read-all')
  },
}
