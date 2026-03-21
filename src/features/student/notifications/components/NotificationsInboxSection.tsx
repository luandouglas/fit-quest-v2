import { FqEmptyState, FqText } from '@/shared/ui'

import type { NotificationsContextItem } from '../hooks/useNotificationsCenter'
import { NotificationContextCard } from './NotificationContextCard'

type NotificationsInboxSectionProps = {
  title: string
  description: string
  items: NotificationsContextItem[]
  emptyTitle: string
  emptyDescription: string
  onOpen?: (route: string) => void
  onMarkAsRead?: (notificationId: string) => void
  isMarkingAsRead?: boolean
}

export function NotificationsInboxSection({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  onOpen,
  onMarkAsRead,
  isMarkingAsRead = false,
}: NotificationsInboxSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <FqText as="h2" className="text-sm font-semibold text-foreground">
          {title}
        </FqText>
        <FqText as="p" className="text-sm text-muted-foreground">
          {description}
        </FqText>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-6">
          <FqEmptyState icon="check" title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <NotificationContextCard
              key={item.id}
              item={item}
              onOpen={onOpen}
              onMarkAsRead={onMarkAsRead}
              isMarkingAsRead={isMarkingAsRead}
            />
          ))}
        </div>
      )}
    </section>
  )
}
