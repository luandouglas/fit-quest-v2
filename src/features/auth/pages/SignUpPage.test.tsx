import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Route, Router } from "react-router-dom";

import { SignUpPage } from "./SignUpPage";

const {
  registerMock,
  clearErrorMock,
  acceptInviteMock,
  updateProfileMock,
  authState,
} = vi.hoisted(() => ({
  registerMock: vi.fn(),
  clearErrorMock: vi.fn(),
  acceptInviteMock: vi.fn(),
  updateProfileMock: vi.fn(),
  authState: {
    error: null as string | null,
    status: "anonymous" as "anonymous" | "authenticated" | "loading",
  },
}));

vi.mock("@/shared/hooks", () => ({
  useAuth: () => ({
    register: registerMock,
    clearError: clearErrorMock,
    error: authState.error,
    status: authState.status,
  }),
}));

vi.mock("@/shared/services/relationshipService", () => ({
  relationshipService: {
    acceptInviteByCodeOrId: acceptInviteMock,
  },
}));

vi.mock("@/shared/services/profileService", () => ({
  profileService: {
    updateProfile: updateProfileMock,
  },
}));

function renderPage(initialEntry = "/signup") {
  const history = createMemoryHistory({ initialEntries: [initialEntry] });

  render(
    <Router history={history}>
      <Route path="/signup">
        <SignUpPage />
      </Route>
    </Router>,
  );

  return history;
}

describe("SignUpPage", () => {
  beforeEach(() => {
    authState.error = null;
    authState.status = "anonymous";
    registerMock.mockResolvedValue(undefined);
    acceptInviteMock.mockResolvedValue(undefined);
    updateProfileMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts with profile selection before showing the form flow", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Escolha seu perfil" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Nome completo")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Aluno/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar cadastro" }));

    await waitFor(() => {
      expect(
        screen.getAllByRole("heading", {
          name: "Qual e seu foco agora?",
        }).length,
      ).toBeGreaterThan(0);
    });

    expect(screen.getAllByText("Etapa 1 de 5").length).toBeGreaterThan(0);
  });

  it("submits the student multi-step flow with the selected role", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Aluno/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar cadastro" }));

    fireEvent.click(screen.getByRole("button", { name: "Ganhar massa" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Evolucao e resultado/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    fireEvent.click(screen.getByRole("button", { name: "Pernas" }));
    fireEvent.click(screen.getByRole("button", { name: /Intermediario/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Moderadamente ativo/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    fireEvent.click(screen.getByRole("button", { name: /Mulher/ }));
    fireEvent.click(screen.getByRole("button", { name: /Academia completa/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Seg" }));
    fireEvent.click(screen.getByRole("button", { name: "Qua" }));
    fireEvent.click(screen.getByRole("button", { name: "Sex" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    fireEvent.change(screen.getByLabelText("Nome completo"), {
      target: { value: "Luan Douglas" },
    });
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "luan@fitquest.app" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: "Luan Douglas",
        role: "STUDENT",
        email: "luan@fitquest.app",
        password: "123456",
      });
    });

    expect(updateProfileMock).toHaveBeenCalledWith({
      name: "Luan Douglas",
      goal: "gain_muscle",
      gym: "Academia completa",
      goals: {
        workoutsPerWeek: 3,
      },
    });
    expect(acceptInviteMock).not.toHaveBeenCalled();
  });
});
