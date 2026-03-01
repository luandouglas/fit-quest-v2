import { act, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { NutritionPage } from './NutritionPage'

function renderNutritionAt(pathname: string) {
  const history = createMemoryHistory({ initialEntries: [pathname] })

  render(
    <Router history={history}>
      <Route path={["/tabs/nutrition/meal/:mealId", "/tabs/nutrition/history", "/tabs/nutrition", "/nutrition/meal/:mealId", "/nutrition/history", "/nutrition"]}>
        <NutritionPage />
      </Route>
    </Router>,
  )

  return history
}

describe('NutritionPage routes', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('renders nutrition page at base route', () => {
    const history = renderNutritionAt('/tabs/nutrition')

    act(() => {
      vi.advanceTimersByTime(350)
    })

    expect(history.location.pathname).toBe('/tabs/nutrition')
    expect(screen.getByRole('heading', { name: 'Nutricao' })).toBeInTheDocument()
  })

  it('keeps history route and can navigate back to plan route', () => {
    const history = renderNutritionAt('/tabs/nutrition/history')

    act(() => {
      vi.advanceTimersByTime(350)
    })

    expect(history.location.pathname).toBe('/tabs/nutrition/history')

    fireEvent.click(screen.getByRole('button', { name: 'Plano' }))

    expect(history.location.pathname).toBe('/tabs/nutrition')
  })

  it('opens meal detail sheet when route contains meal id', () => {
    const history = renderNutritionAt('/tabs/nutrition/meal/breakfast')

    act(() => {
      vi.advanceTimersByTime(350)
    })

    expect(history.location.pathname).toBe('/tabs/nutrition/meal/breakfast')
    expect(screen.getByText('Plano somente leitura')).toBeInTheDocument()
  })
})
