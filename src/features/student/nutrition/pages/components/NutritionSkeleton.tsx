import { FqSkeleton } from '@/shared/ui'

export function NutritionSkeleton() {
  return (
    <section className="space-y-5">
      <FqSkeleton className="h-32 w-full" rounded="lg" />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <FqSkeleton className="h-28 w-full" rounded="lg" />
          <FqSkeleton className="h-32 w-full" rounded="lg" />
          <FqSkeleton className="h-32 w-full" rounded="lg" />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <FqSkeleton className="h-52 w-full" rounded="lg" />
          <FqSkeleton className="h-44 w-full" rounded="lg" />
        </div>
      </div>
    </section>
  )
}
