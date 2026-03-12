import "@/services";
import { authService } from "@/services/auth";

// Mocked auth remains isolated behind this repository so Firebase auth can replace it later.
export const mockAuthRepository = {
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
  updateStoredSessionUser(
    ...args: Parameters<typeof authService.updateStoredSessionUser>
  ) {
    return authService.updateStoredSessionUser(...args);
  },
};
