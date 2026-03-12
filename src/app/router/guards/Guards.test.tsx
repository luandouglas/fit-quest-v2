import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Route, Router, Switch } from "react-router-dom";

import { AuthProvider } from "@/app/providers";
import { authService } from "@/services";
import type { AuthSession } from "@/shared/types";

import { PrivateRoute, PublicOnlyRoute, RoleGuard } from "./Guards";

const authenticatedSessionFixture: AuthSession = {
  accessToken: "access-token-1",
  refreshToken: "refresh-token-1",
  expiresAt: "2099-01-01T00:00:00.000Z",
  user: {
    id: "user-1",
    name: "Athlete One",
    role: "STUDENT",
  },
};

const personalSessionFixture: AuthSession = {
  accessToken: "access-token-2",
  refreshToken: "refresh-token-2",
  expiresAt: "2099-01-01T00:00:00.000Z",
  user: {
    id: "user-2",
    name: "Coach One",
    role: "PERSONAL",
    professionalProfile: {
      title: "Personal Trainer",
      specialties: ["Strength"],
    },
  },
};

const nutritionistSessionFixture: AuthSession = {
  accessToken: "access-token-3",
  refreshToken: "refresh-token-3",
  expiresAt: "2099-01-01T00:00:00.000Z",
  user: {
    id: "user-3",
    name: "Nutri One",
    role: "NUTRITIONIST",
    professionalProfile: {
      title: "Nutritionist",
      specialties: ["Diet"],
    },
  },
};

describe("PrivateRoute", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("redirects anonymous users to login", () => {
    const history = createMemoryHistory({ initialEntries: ["/private"] });

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/login">
              <span>Login Page</span>
            </Route>
            <Route path="/private">
              <PrivateRoute>
                <span>Private Area</span>
              </PrivateRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(history.location.pathname).toBe("/login");
  });

  it("renders private area for authenticated users", () => {
    vi.spyOn(authService, "getStoredSession").mockReturnValue(
      authenticatedSessionFixture,
    );

    const history = createMemoryHistory({ initialEntries: ["/private"] });

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/login">
              <span>Login Page</span>
            </Route>
            <Route path="/private">
              <PrivateRoute>
                <span>Private Area</span>
              </PrivateRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    );

    expect(screen.getByText("Private Area")).toBeInTheDocument();
    expect(history.location.pathname).toBe("/private");
  });
});

describe("PublicOnlyRoute", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("redirects authenticated student users to student hub", () => {
    vi.spyOn(authService, "getStoredSession").mockReturnValue(
      authenticatedSessionFixture,
    );

    const history = createMemoryHistory({ initialEntries: ["/login"] });

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/tabs/student">
              <span>Student Hub</span>
            </Route>
            <Route path="/login">
              <PublicOnlyRoute>
                <span>Login Form</span>
              </PublicOnlyRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    );

    expect(screen.getByText("Student Hub")).toBeInTheDocument();
    expect(history.location.pathname).toBe("/tabs/student");
  });

  it("redirects authenticated personal users to personal area", () => {
    vi.spyOn(authService, "getStoredSession").mockReturnValue(
      personalSessionFixture,
    );

    const history = createMemoryHistory({ initialEntries: ["/login"] });

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/tabs/personal/dashboard">
              <span>Personal Area</span>
            </Route>
            <Route path="/login">
              <PublicOnlyRoute>
                <span>Login Form</span>
              </PublicOnlyRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    );

    expect(screen.getByText("Personal Area")).toBeInTheDocument();
    expect(history.location.pathname).toBe("/tabs/personal/dashboard");
  });

  it("redirects authenticated nutritionist users to nutritionist area", () => {
    vi.spyOn(authService, "getStoredSession").mockReturnValue(
      nutritionistSessionFixture,
    );

    const history = createMemoryHistory({ initialEntries: ["/login"] });

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/tabs/nutritionist/dashboard">
              <span>Nutritionist Area</span>
            </Route>
            <Route path="/login">
              <PublicOnlyRoute>
                <span>Login Form</span>
              </PublicOnlyRoute>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    );

    expect(screen.getByText("Nutritionist Area")).toBeInTheDocument();
    expect(history.location.pathname).toBe("/tabs/nutritionist/dashboard");
  });
});

describe("RoleGuard", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("blocks unauthorized roles and redirects to default role tab", () => {
    vi.spyOn(authService, "getStoredSession").mockReturnValue(
      personalSessionFixture,
    );
    const history = createMemoryHistory({ initialEntries: ["/tabs/student"] });

    render(
      <AuthProvider>
        <Router history={history}>
          <Switch>
            <Route path="/tabs/personal/dashboard">
              <span>Personal Area</span>
            </Route>
            <Route path="/tabs/student">
              <RoleGuard allowedRoles={["STUDENT"]}>
                <span>Student Hub</span>
              </RoleGuard>
            </Route>
          </Switch>
        </Router>
      </AuthProvider>,
    );

    expect(screen.getByText("Personal Area")).toBeInTheDocument();
    expect(history.location.pathname).toBe("/tabs/personal/dashboard");
  });
});
