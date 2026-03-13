import "@/services";
import { authService } from "@/services/auth";
import type {
  AuthRegistrationInput,
  AuthSession,
  AuthUserRole,
  ProfessionalProfile,
} from "@/shared/types";

import type { AuthRepository } from "./authRepository";

function createProfessionalProfileByRole(
  role: AuthUserRole,
): ProfessionalProfile | undefined {
  if (role === "PERSONAL") {
    return {
      title: "Personal Trainer",
      specialties: ["Condicionamento"],
    };
  }

  if (role === "NUTRITIONIST") {
    return {
      title: "Nutricionista",
      specialties: ["Plano alimentar"],
    };
  }

  return undefined;
}

function createSessionFromRegistration(
  input: AuthRegistrationInput,
): AuthSession {
  const userId = `mock-${crypto.randomUUID()}`;

  return {
    accessToken: `mock-access-${userId}`,
    refreshToken: `mock-refresh-${userId}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    user: {
      id: userId,
      name: input.name.trim(),
      role: input.role,
      professionalProfile: createProfessionalProfileByRole(input.role),
    },
  };
}

// Mocked auth remains isolated behind this repository so Firebase auth can replace it later.
export const mockAuthRepository: AuthRepository = {
  mode: "mock",
  shouldHydrateSession: false,
  clearSession() {
    return authService.clearSession();
  },
  getStoredSession() {
    return authService.getStoredSession();
  },
  login(...args: Parameters<typeof authService.login>) {
    return authService.login(...args);
  },
  logout() {
    return authService.logout();
  },
  persistSession(...args: Parameters<typeof authService.persistSession>) {
    return authService.persistSession(...args);
  },
  async register(input) {
    const session = createSessionFromRegistration(input);
    authService.persistSession(session);
    return session;
  },
  updateStoredSessionUser(
    ...args: Parameters<typeof authService.updateStoredSessionUser>
  ) {
    return authService.updateStoredSessionUser(...args);
  },
};
