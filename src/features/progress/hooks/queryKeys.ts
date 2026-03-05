export const progressQueryKeys = {
  root: ['progress'] as const,
  overview: (range: '7d' | '30d' | '90d') => ['progress', 'overview', range] as const,
}
