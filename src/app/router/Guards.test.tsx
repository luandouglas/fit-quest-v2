import { render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Route, Router, Switch } from 'react-router-dom'

import { AuthProvider } from '@/app/providers'
import { authService } from '@/shared/services'
import type { AuthSession } from '@/shared/types'

import { PrivateRoute, PublicOnlyRoute } from './Guards'

const authenticatedSessionFixture: AuthSession = {
  accessToken: 'access-token-1',
  refreshToken: 'refresh-token-1',
  expiresAt: '2099-01-01T00:00:00.000Z',
  user: {
    id: 'user-1',
    name: 'Athlete One',
  },
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('redirects anonymous users to login', () => {
    const history = createMemoryHistory({ initialEntries: ['/private'] })

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/login">
              <span>Login Page</span>
            </Route>
            <Route path="/private">
              <PrivateRoute>
                <span>Private Area</span>
              </PrivateRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(history.location.pathname).toBe('/login')
  })

  it('renders private area for authenticated users', () => {
    vi.spyOn(authService, 'getStoredSession').mockReturnValue(authenticatedSessionFixture)

    const history = createMemoryHistory({ initialEntries: ['/private'] })

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/login">
              <span>Login Page</span>
            </Route>
            <Route path="/private">
              <PrivateRoute>
                <span>Private Area</span>
              </PrivateRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    )

    expect(screen.getByText('Private Area')).toBeInTheDocument()
    expect(history.location.pathname).toBe('/private')
  })
})

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('redirects authenticated users to tabs home', () => {
    vi.spyOn(authService, 'getStoredSession').mockReturnValue(authenticatedSessionFixture)

    const history = createMemoryHistory({ initialEntries: ['/login'] })

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/tabs/home">
              <span>Tabs Home</span>
            </Route>
            <Route path="/login">
              <PublicOnlyRoute>
                <span>Login Form</span>
              </PublicOnlyRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    )

    expect(screen.getByText('Tabs Home')).toBeInTheDocument()
    expect(history.location.pathname).toBe('/tabs/home')
  })
})
