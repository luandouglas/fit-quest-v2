import { httpClient } from '@/shared/services/http'
import type { StudentRelationshipsOverview } from '@/shared/services/contracts/relationship'

export const relationshipService = {
  async getMyRelationships(): Promise<StudentRelationshipsOverview> {
    return httpClient.get<StudentRelationshipsOverview>('/relationships/me')
  },
  async inviteByCodeOrId(params: { codeOrId: string }): Promise<StudentRelationshipsOverview> {
    return httpClient.post<StudentRelationshipsOverview, { codeOrId: string }>('/relationships/invites/by-code-or-id', params)
  },
  async respondToInvite(params: { inviteId: string; action: 'accept' | 'reject' }): Promise<StudentRelationshipsOverview> {
    return httpClient.patch<StudentRelationshipsOverview, { inviteId: string; action: 'accept' | 'reject' }>(
      '/relationships/invites/respond',
      params,
    )
  },
}
