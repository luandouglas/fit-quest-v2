import { FqButton, FqCard, FqIcon, FqTag, FqText } from '@/shared/ui'

import type { NotificationsContextItem } from '../hooks/useNotificationsCenter'

type NotificationContextCardProps = {
  item: NotificationsContextItem
  onOpen?: (route: string) => void
  onMarkAsRead?: (notificationId: string) => void
  isMarkingAsRead?: boolean
}

export function NotificationContextCard({
  item,
  onOpen,
  onMarkAsRead,
  isMarkingAsRead = false,
}: NotificationContextCardProps) {
  return (
    <FqCard className={item.isUnread ? 'border-primary/25 bg-primary/5' : 'border-border bg-card'}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/90">
            <FqIcon name={item.icon} size={18} className="text-foreground" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <FqTag tone={item.tone}>{item.tagLabel}</FqTag>
              <FqTag tone="neutral">{item.isUnread ? 'Nova' : 'Lida'}</FqTag>
            </div>

            <div>
              <FqText as="h3" className="text-sm font-semibold text-foreground">
                {item.title}
              </FqText>
              <FqText as="p" className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </FqText>
            </div>

            <FqText as="p" className="text-xs text-muted-foreground">
              {item.metaLabel}
            </FqText>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.actionRoute && item.actionLabel ? (
            <FqButton size="sm" onClick={() => onOpen?.(item.actionRoute!)}>
              {item.actionLabel}
            </FqButton>
          ) : null}
          {item.isUnread && onMarkAsRead ? (
            <FqButton
              size="sm"
              variant="outline"
              tone="neutral"
              onClick={() => onMarkAsRead(item.id)}
              isLoading={isMarkingAsRead}
            >
              Marcar como lida
            </FqButton>
          ) : null}
        </div>
      </div>
    </FqCard>
  )
}
