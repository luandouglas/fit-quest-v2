import { render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Route, Router, Switch } from 'react-router-dom'

import { AuthProvider } from '@/app/providers'

import { PrivateRoute } from './Guards'

describe('PrivateRoute', () => {
  beforeEach(() => {
    window.localStorage.clear()
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
})
