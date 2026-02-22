import { FqCard, FqSkeleton } from '@/shared/ui'

export function NutritionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <FqCard className="border-border bg-card">
            <FqSkeleton className="h-6 w-40" />
            <FqSkeleton className="mt-3 h-4 w-64" />
            <FqSkeleton className="mt-4 h-28 w-full" rounded="lg" />
          </FqCard>
          <FqCard className="border-border bg-card">
            <FqSkeleton className="h-6 w-28" />
            <div className="mt-4 space-y-3">
              <FqSkeleton className="h-24 w-full" rounded="lg" />
              <FqSkeleton className="h-24 w-full" rounded="lg" />
            </div>
          </FqCard>
        </div>

        <div className="space-y-3 lg:col-span-4">
          <FqCard className="border-border bg-card">
            <FqSkeleton className="h-6 w-24" />
            <FqSkeleton className="mt-3 h-24 w-full" rounded="lg" />
          </FqCard>
          <FqCard className="border-border bg-card">
            <FqSkeleton className="h-6 w-20" />
            <FqSkeleton className="mt-3 h-20 w-full" rounded="lg" />
          </FqCard>
        </div>
      </div>
    </div>
  )
}
