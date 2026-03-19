import { ProfessionalProfilePage } from "@/features/professional/presentation/pages/ProfessionalProfilePage";
import { StudentProfilePage } from "@/features/student/presentation/pages/StudentProfilePage";
import { useRole } from "@/shared/hooks";

export function TabsProfileRoute() {
  const { isStudent } = useRole();

  if (isStudent) {
    return <StudentProfilePage />;
  }

  return <ProfessionalProfilePage />;
}
