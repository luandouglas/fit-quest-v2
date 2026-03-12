import { AppTabsLayout } from "@/app/router/layouts/AppTabsLayout";

export function StudentShell() {
  return <AppTabsLayout roleOverride="STUDENT" />;
}
