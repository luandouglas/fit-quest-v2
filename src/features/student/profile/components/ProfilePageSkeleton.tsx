import { FqCard, FqSkeleton } from '@/shared/ui'

export function ProfilePageSkeleton() {
  return (
    <section className="fq-page-shell">
      <div className="space-y-4">
        <FqCard className="border-border bg-card">
          <div className="space-y-4">
            <FqSkeleton className="h-6 w-36" />
            <FqSkeleton className="h-10 w-full" />
            <div className="grid gap-3 sm:grid-cols-3">
              <FqSkeleton className="h-28 w-full" />
              <FqSkeleton className="h-28 w-full" />
              <FqSkeleton className="h-28 w-full" />
            </div>
          </div>
        </FqCard>
        <div className="grid gap-4 xl:grid-cols-2">
          <FqSkeleton className="h-80 w-full rounded-xl" />
          <FqSkeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    </section>
  )
}
