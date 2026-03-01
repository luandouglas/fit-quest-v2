import { render, screen } from '@testing-library/react'

import { PageContainer } from './PageContainer'

describe('PageContainer', () => {
  it('renders children content', () => {
    render(
      <PageContainer>
        <span>Smoke test content</span>
      </PageContainer>,
    )

    expect(screen.getByText('Smoke test content')).toBeInTheDocument()
  })
})
