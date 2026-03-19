import { render, screen } from "@testing-library/react";

import { TabsProfileRoute } from "./TabsProfileRoute";

let mockRole: "STUDENT" | "PERSONAL" | "NUTRITIONIST" = "STUDENT";

vi.mock("@/shared/hooks", () => ({
  useRole: () => ({
    role: mockRole,
    isStudent: mockRole === "STUDENT",
    isPersonal: mockRole === "PERSONAL",
    isNutritionist: mockRole === "NUTRITIONIST",
    hasRole: (roles: Array<"STUDENT" | "PERSONAL" | "NUTRITIONIST">) =>
      roles.includes(mockRole),
  }),
}));

vi.mock("@/features/student/presentation/pages/StudentProfilePage", () => ({
  StudentProfilePage: () => <div>student-profile-page</div>,
}));

vi.mock("@/features/professional/presentation/pages/ProfessionalProfilePage", () => ({
  ProfessionalProfilePage: () => <div>professional-profile-page</div>,
}));

describe("TabsProfileRoute", () => {
  it("renders the student profile page for student sessions", () => {
    mockRole = "STUDENT";

    render(<TabsProfileRoute />);

    expect(screen.getByText("student-profile-page")).toBeInTheDocument();
    expect(screen.queryByText("professional-profile-page")).not.toBeInTheDocument();
  });

  it("renders the professional profile page for personal sessions", () => {
    mockRole = "PERSONAL";

    render(<TabsProfileRoute />);

    expect(screen.getByText("professional-profile-page")).toBeInTheDocument();
    expect(screen.queryByText("student-profile-page")).not.toBeInTheDocument();
  });

  it("renders the professional profile page for nutritionist sessions", () => {
    mockRole = "NUTRITIONIST";

    render(<TabsProfileRoute />);

    expect(screen.getByText("professional-profile-page")).toBeInTheDocument();
    expect(screen.queryByText("student-profile-page")).not.toBeInTheDocument();
  });
});
