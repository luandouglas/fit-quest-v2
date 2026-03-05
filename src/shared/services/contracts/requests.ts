import type { ProfessionalRole } from '@/shared/services/contracts/relationship'

export type RequestType = 'MEASUREMENTS_UPDATE'
export type RequestStatus = 'open' | 'accepted' | 'done'

export type MeasurementsUpdateRequest = {
  id: string
  type: RequestType
  status: RequestStatus
  studentId: string
  studentName: string
  professionalId: string
  professionalRole: ProfessionalRole
  professionalName: string
  note?: string
  createdAt: string
  updatedAt: string
}
