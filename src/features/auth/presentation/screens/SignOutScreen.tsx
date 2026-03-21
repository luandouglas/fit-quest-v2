import { FqCard, FqText } from "@/shared/ui";

export function SignOutScreen() {
  return (
    <section className="fq-page-shell">
      <FqCard className="border-border bg-card">
        <FqText as="h1" className="text-card-title font-semibold text-foreground">
          Sign out
        </FqText>
        <FqText as="p" className="mt-2 text-sm text-muted-foreground">
          TODO: add a dedicated sign-out confirmation flow if product requires
          it.
        </FqText>
      </FqCard>
    </section>
  );
}
