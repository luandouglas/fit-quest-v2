import type { AuthUserRole } from '@/shared/types'

export type ProfessionalRole = Extract<AuthUserRole, 'PERSONAL' | 'NUTRITIONIST'>

export type LinkedProfessional = {
  id: string
  role: ProfessionalRole
  name: string
  code: string
  linkedAt: string
}

export type RelationshipInviteStatus = 'pending' | 'accepted' | 'rejected'

export type RelationshipInvite = {
  id: string
  studentId: string
  professionalId: string
  professionalRole: ProfessionalRole
  professionalName: string
  professionalCode: string
  status: RelationshipInviteStatus
  createdAt: string
  respondedAt?: string
}

export type StudentRelationshipsOverview = {
  studentId: string
  personal: LinkedProfessional | null
  nutritionist: LinkedProfessional | null
  pendingInvites: RelationshipInvite[]
  recentInvites: RelationshipInvite[]
}
