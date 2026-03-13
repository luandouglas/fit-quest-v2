import type { NotificationsRepository } from './notificationsRepository'
import { notificationsFirebaseRepository } from './notificationsFirebaseRepository'

export function getNotificationsRepository(): NotificationsRepository {
  return notificationsFirebaseRepository
}
