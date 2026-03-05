import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createAppQueryClient } from '@/app/providers'
import { rankingService, type RankingLeaderboard } from '@/shared/services'

import { RankingPage } from './RankingPage'

const leaderboardFixture: RankingLeaderboard = {
  period: 'weekly',
  scope: 'city',
  league: 'bronze',
  updatedAt: '2026-03-01T12:00:00.000Z',
  totalAthletes: 121,
  currentUser: {
    id: 'current-user',
    name: 'Luan',
    avatarSeed: 'current-user',
    city: 'Sao Paulo',
    neighborhood: 'Pinheiros',
    gym: 'Iron Temple Pinheiros',
    league: 'bronze',
    xp: 980,
    position: 8,
    trend: 'up',
    isCurrentUser: true,
  },
  rival: {
    id: 'athlete-rival',
    name: 'Rival Proximo',
    avatarSeed: 'athlete-rival',
    city: 'Sao Paulo',
    neighborhood: 'Pinheiros',
    gym: 'Iron Temple Pinheiros',
    league: 'bronze',
    xp: 995,
    position: 7,
    trend: 'same',
    isCurrentUser: false,
  },
  rivalGapXp: 15,
  leagueStatus: {
    current: 'bronze',
    previous: 'bronze',
    previousWeekXp: 860,
    transition: 'stayed',
    promotionRule: 'Top 20% sobe e bottom 20% desce por liga.',
  },
  leagues: ['bronze', 'silver', 'gold'],
  top: Array.from({ length: 12 }, (_, index) => ({
    id: `athlete-${index + 1}`,
    name: index === 7 ? 'Luan' : `Atleta ${index + 1}`,
    avatarSeed: `athlete-${index + 1}`,
    city: 'Sao Paulo',
    neighborhood: 'Pinheiros',
    gym: 'Iron Temple Pinheiros',
    league: 'bronze',
    xp: 1500 - index * 40,
    position: index + 1,
    trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'same',
    isCurrentUser: index === 7,
  })),
  aroundUser: Array.from({ length: 5 }, (_, index) => ({
    id: `around-${index + 1}`,
    name: index === 2 ? 'Luan' : `Vizinho ${index + 1}`,
    avatarSeed: `around-${index + 1}`,
    city: 'Sao Paulo',
    neighborhood: 'Pinheiros',
    gym: 'Iron Temple Pinheiros',
    league: 'bronze',
    xp: 990 - index * 10,
    position: 6 + index,
    trend: 'same',
    isCurrentUser: index === 2,
  })),
}

function renderPage() {
  render(
    <QueryClientProvider client={createAppQueryClient()}>
      <RankingPage />
    </QueryClientProvider>,
  )
}

describe('RankingPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders leaderboard and current user highlight', async () => {
    vi.spyOn(rankingService, 'getLeaderboard').mockResolvedValue(leaderboardFixture)

    renderPage()

    await screen.findByRole('heading', { name: 'Ranking' })

    expect(screen.getByText('Sua posicao')).toBeInTheDocument()
    expect(screen.getAllByText('Luan').length).toBeGreaterThan(0)
    expect(screen.getByText('Rival mais proximo')).toBeInTheDocument()
    expect(screen.getByText('Janela ao redor da sua posicao')).toBeInTheDocument()
  })
})
