import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AUTH_SESSION_STORAGE_KEY } from '@/shared/constants'

import { AuthProvider, useAuthContext } from './AuthProvider'

function AuthProbe() {
  const { login, status, isAuthenticated, user, error } = useAuthContext()

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="auth-flag">{String(isAuthenticated)}</p>
      <p data-testid="user-name">{user?.name ?? ''}</p>
      <p data-testid="error">{error ?? ''}</p>

      <button
        type="button"
        onClick={() => {
          void login({
            email: 'athlete@fitquest.app',
            password: '123456',
          }).catch(() => undefined)
        }}
      >
        Login Success
      </button>

      <button
        type="button"
        onClick={() => {
          void login({
            email: 'athlete@fitquest.app',
            password: 'invalid',
          }).catch(() => undefined)
        }}
      >
        Login Fail
      </button>
    </div>
  )
}

describe('AuthProvider session flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('handles successful login and persists session', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Login Success' }))

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
      expect(screen.getByTestId('auth-flag')).toHaveTextContent('true')
      expect(screen.getByTestId('user-name')).not.toHaveTextContent('')
    })

    const stored = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    expect(stored).toBeTruthy()
    expect(stored).toContain('"version":1')
  })

  it('keeps anonymous state when login fails', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Login Fail' }))

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
      expect(screen.getByTestId('auth-flag')).toHaveTextContent('false')
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials')
    })

    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull()
  })
})
