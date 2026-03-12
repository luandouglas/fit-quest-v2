import { useRole } from "@/shared/hooks";

import { NutritionistShell } from "./NutritionistShell";
import { PersonalShell } from "./PersonalShell";
import { StudentShell } from "./StudentShell";

export function TabsShellResolver() {
  const { role } = useRole();

  if (role === "PERSONAL") {
    return <PersonalShell />;
  }

  if (role === "NUTRITIONIST") {
    return <NutritionistShell />;
  }

  return <StudentShell />;
}
