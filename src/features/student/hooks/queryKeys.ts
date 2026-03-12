export const studentQueryKeys = {
  root: ['student'] as const,
  dashboard: (date: string) => ['student', 'dashboard', date] as const,
}
