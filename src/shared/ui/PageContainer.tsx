type PageContainerProps = {
  children: React.ReactNode
  centered?: boolean
}

export function PageContainer({ children, centered = false }: PageContainerProps) {
  return (
    <main className={`fq-page-container ${centered ? 'is-centered' : ''}`.trim()}>
      {children}
    </main>
  )
}
