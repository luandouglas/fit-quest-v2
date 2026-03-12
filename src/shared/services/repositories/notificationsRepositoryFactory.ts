import { getStudentDataSourcePreference, isFirebaseConfigured } from '@/shared/services/firebase'

import type { NotificationsRepository } from './notificationsRepository'
import { notificationsFirebaseRepository } from './notificationsFirebaseRepository'
import { notificationsMockRepository } from './notificationsMockRepository'

let cachedRepository: NotificationsRepository | null = null

export function getNotificationsRepository(): NotificationsRepository {
  if (cachedRepository) {
    return cachedRepository
  }

  const prefersFirebase = getStudentDataSourcePreference() === 'firebase'
  cachedRepository = prefersFirebase && isFirebaseConfigured() ? notificationsFirebaseRepository : notificationsMockRepository
  return cachedRepository
}
