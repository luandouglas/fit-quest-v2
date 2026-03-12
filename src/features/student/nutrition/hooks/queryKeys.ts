export const nutritionQueryKeys = {
  root: ['nutrition'] as const,
  days: (anchorDate: string) => ['nutrition', 'days', anchorDate] as const,
}
