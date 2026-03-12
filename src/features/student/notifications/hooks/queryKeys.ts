export const notificationsQueryKeys = {
  root: ['notifications'] as const,
  inbox: ['notifications', 'inbox'] as const,
  pushState: ['notifications', 'push-state'] as const,
}
