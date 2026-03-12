import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import { notificationsPushRuntimeService, notificationsService, type NotificationsInbox } from '@/shared/services'
import type { NotificationPushState } from '@/shared/services/contracts/notifications'
import { FqToastProvider } from '@/shared/ui'

import { NotificationsPage } from './NotificationsPage'

const inboxFixture: NotificationsInbox = {
  unreadCount: 2,
  items: [
    {
      id: 'n-1',
      entityKey: 'goal-water-2026-03-01',
      title: 'Meta batida',
      description: 'Voce atingiu sua meta de agua.',
      at: '2026-03-01T12:00:00.000Z',
      type: 'goal',
      trigger: 'goal_reached',
      urgency: 'celebration',
      origin: 'hydration',
      channels: ['in_app'],
      read: false,
    },
    {
      id: 'n-2',
      entityKey: 'mission-move-2026-03-01',
      title: 'Missao concluida',
      description: 'Movimento do dia concluido.',
      at: '2026-03-01T10:00:00.000Z',
      type: 'mission',
      trigger: 'mission_completed',
      urgency: 'attention',
      origin: 'routine',
      channels: ['in_app'],
      read: false,
    },
  ],
}

const pushStateFixture: NotificationPushState = {
  permission: 'prompt',
  platform: 'web',
  isRegistered: false,
  token: null,
}

function renderPage() {
  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <FqToastProvider>
        <NotificationsPage />
      </FqToastProvider>
    </QueryClientProvider>,
  )
}

describe('NotificationsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders inbox and marks one notification as read', async () => {
    vi.spyOn(notificationsService, 'getInbox').mockResolvedValue(inboxFixture)
    vi.spyOn(notificationsPushRuntimeService, 'getState').mockResolvedValue(pushStateFixture)
    vi.spyOn(notificationsService, 'markAsRead').mockResolvedValue({
      unreadCount: 1,
      items: inboxFixture.items.map((item) => (item.id === 'n-2' ? { ...item, read: true } : item)),
    })

    renderPage()

    await screen.findByRole('heading', { name: 'Alertas e lembretes' })
    fireEvent.click(screen.getAllByRole('button', { name: 'Marcar como lida' })[0])

    await waitFor(() => {
      expect(notificationsService.markAsRead).toHaveBeenCalledWith('n-2')
    })
  })
})
