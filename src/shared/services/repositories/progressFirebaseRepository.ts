import {
  collection,
  doc,
  getDoc,
  setDoc,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseFirestore } from '@/shared/services/firebase'
import type { BodyMeasurements, ProgressOverview, ProgressRange } from '@/shared/services/contracts/progress'

import type { ProgressRepository } from './progressRepository'

function getDb() {
  const db = getFirebaseFirestore()

  if (!db) {
    throw new Error('Firebase is not configured for progress data.')
  }

  return db
}

function resolveStudentId() {
  const session = authService.getStoredSession()

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Authenticated student session is required for progress data.')
  }

  return session.user.id
}

function studentDoc<T>(studentId: string, ...segments: string[]) {
  return doc(getDb(), 'students', studentId, ...segments) as DocumentReference<T>
}

function studentCollection<T>(studentId: string, ...segments: string[]) {
  return collection(getDb(), 'students', studentId, ...segments) as CollectionReference<T>
}

export const progressFirebaseRepository: ProgressRepository = {
  source: 'firebase',
  async getOverview(range: ProgressRange): Promise<ProgressOverview> {
    const studentId = resolveStudentId()
    const snapshot = await getDoc(studentDoc<ProgressOverview>(studentId, 'progressOverviews', range))

    if (!snapshot.exists()) {
      throw new Error(`Firebase document not found for progress overview (${range}).`)
    }

    return snapshot.data()
  },
  async registerWeight(params: { weightKg: number; date?: string }): Promise<{ saved: boolean }> {
    const studentId = resolveStudentId()
    const weightKg = Number(params.weightKg)

    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      throw new Error('A positive weightKg is required.')
    }

    await setDoc(
      doc(studentCollection(studentId, 'progressWeightLogs')),
      {
        id: crypto.randomUUID(),
        studentId,
        date: params.date ?? new Date().toISOString().slice(0, 10),
        weightKg: Number(weightKg.toFixed(1)),
        recordedByRole: 'STUDENT',
        recordedById: studentId,
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return { saved: true }
  },
  async registerBodyMeasurements(_params: {
    measurements: BodyMeasurements
    date?: string
    comment?: string
  }): Promise<{ saved: boolean }> {
    throw new Error('Body measurements can only be updated by professionals.')
  },
  async requestMeasurementsUpdate(params?: { note?: string }): Promise<{ sent: boolean }> {
    const studentId = resolveStudentId()

    await setDoc(
      doc(studentCollection(studentId, 'measurementRequests')),
      {
        id: crypto.randomUUID(),
        studentId,
        note: params?.note?.trim() || null,
        status: 'requested',
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return { sent: true }
  },
}
