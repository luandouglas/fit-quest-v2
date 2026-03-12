import { FqSkeleton } from "@/shared/ui";

export function StudentHomeSkeleton() {
  return (
    <section className="fq-page-shell-narrow space-y-5">
      {/* Hero greeting skeleton */}
      <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:gap-6">
        <FqSkeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 sm:flex-1">
          <FqSkeleton className="mx-auto h-6 w-48 sm:mx-0" />
          <FqSkeleton className="mx-auto h-4 w-64 sm:mx-0" />
        </div>
      </div>

      {/* Checklist skeleton */}
      <div className="space-y-2.5">
        <FqSkeleton className="h-3 w-16" />
        <div className="overflow-hidden rounded-2xl border border-border/70">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 border-b border-border/60 px-4 py-3.5 last:border-b-0"
            >
              <FqSkeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <FqSkeleton className="h-4 w-32" />
                <FqSkeleton className="h-2.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA skeleton */}
      <FqSkeleton className="h-14 w-full rounded-xl" />

      {/* Footer pills skeleton */}
      <div className="grid grid-cols-3 gap-2.5">
        <FqSkeleton className="h-20 w-full rounded-2xl" />
        <FqSkeleton className="h-20 w-full rounded-2xl" />
        <FqSkeleton className="h-20 w-full rounded-2xl" />
      </div>
    </section>
  );
}
