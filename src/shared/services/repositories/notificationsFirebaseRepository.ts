import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type { NotificationItem, NotificationsInbox } from '@/shared/services/contracts/notifications'

import type { NotificationsRepository } from './notificationsRepository'

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for notifications data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for notifications data.')
  }

  return session.user.id
}

function studentDoc<T>(studentId: string, ...segments: string[]) {
  return doc(getDb(), 'students', studentId, ...segments) as DocumentReference<T>
}

function studentCollection<T>(studentId: string, ...segments: string[]) {
  return collection(getDb(), 'students', studentId, ...segments) as CollectionReference<T>
}

async function readInbox(studentId: string): Promise<NotificationsInbox> {
  const snapshot = await getDocs(
    query(studentCollection<NotificationItem>(studentId, 'notificationsInbox'), orderBy('at', 'desc')),
  )
  const items = snapshot.docs.map((entry) => entry.data())

  return {
    unreadCount: items.filter((item) => !item.read).length,
    items,
  }
}

export const notificationsFirebaseRepository: NotificationsRepository = {
  source: 'firebase',
  async getInbox(): Promise<NotificationsInbox> {
    const studentId = resolveStudentId()
    return readInbox(studentId)
  },
  async markAsRead(notificationId: string): Promise<NotificationsInbox> {
    const studentId = resolveStudentId()
    await setDoc(
      studentDoc<Partial<NotificationItem>>(studentId, 'notificationsInbox', notificationId),
      {
        read: true,
        delivery: {
          readAt: new Date().toISOString(),
        },
      },
      { merge: true },
    )

    return readInbox(studentId)
  },
  async markAllAsRead(): Promise<NotificationsInbox> {
    const studentId = resolveStudentId()
    const inbox = await readInbox(studentId)

    await Promise.all(
      inbox.items.map((item) =>
        setDoc(
          studentDoc<Partial<NotificationItem>>(studentId, 'notificationsInbox', item.id),
          {
            read: true,
            delivery: {
              readAt: new Date().toISOString(),
            },
          },
          { merge: true },
        ),
      ),
    )

    return readInbox(studentId)
  },
}
