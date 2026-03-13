import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

import { getAuthRepository } from "@/features/auth/data";
import type {
  AuthContextValue,
  AuthCredentials,
  AuthRegistrationInput,
  AuthSession,
  AuthStatus,
} from "@/shared/types";

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthState = {
  session: AuthSession | null;
  status: AuthStatus;
  error: string | null;
};

type AuthAction =
  | { type: "auth_start" }
  | { type: "auth_success"; session: AuthSession }
  | { type: "auth_error"; message: string }
  | { type: "auth_resolved"; session: AuthSession | null }
  | { type: "logout" }
  | { type: "session_user_updated"; session: AuthSession }
  | { type: "clear_error" };

const AuthContext = createContext<AuthContextValue | null>(null);
const authRepository = getAuthRepository();

function createInitialState(): AuthState {
  const session = authRepository.getStoredSession();

  return {
    session,
    status: authRepository.shouldHydrateSession
      ? "loading"
      : session
        ? "authenticated"
        : "anonymous",
    error: null,
  };
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "auth_start":
      return {
        ...state,
        status: "loading",
        error: null,
      };
    case "auth_success":
      return {
        session: action.session,
        status: "authenticated",
        error: null,
      };
    case "auth_error":
      return {
        session: null,
        status: "anonymous",
        error: action.message,
      };
    case "auth_resolved":
      return {
        session: action.session,
        status: action.session ? "authenticated" : "anonymous",
        error: null,
      };
    case "logout":
      return {
        session: null,
        status: "anonymous",
        error: null,
      };
    case "session_user_updated":
      return {
        ...state,
        session: action.session,
      };
    case "clear_error":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to authenticate";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(
    authReducer,
    undefined,
    createInitialState,
  );

  useEffect(() => {
    if (!authRepository.subscribeToSession) {
      return undefined;
    }

    return authRepository.subscribeToSession((session) => {
      dispatch({ type: "auth_resolved", session });
    });
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    dispatch({ type: "auth_start" });

    try {
      const session = await authRepository.login(credentials);
      dispatch({ type: "auth_success", session });
    } catch (error) {
      dispatch({ type: "auth_error", message: getErrorMessage(error) });
      throw error;
    }
  }, []);

  const register = useCallback(async (input: AuthRegistrationInput) => {
    dispatch({ type: "auth_start" });

    try {
      const session = await authRepository.register(input);
      dispatch({ type: "auth_success", session });
    } catch (error) {
      dispatch({ type: "auth_error", message: getErrorMessage(error) });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authRepository.logout();
    dispatch({ type: "logout" });
  }, []);

  const updateUser = useCallback((patch: Partial<AuthSession["user"]>) => {
    const nextSession = authRepository.updateStoredSessionUser(patch);

    if (!nextSession) {
      return;
    }

    dispatch({ type: "session_user_updated", session: nextSession });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "clear_error" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      user: state.session?.user ?? null,
      isAuthenticated:
        state.status === "authenticated" && Boolean(state.session),
      status: state.status,
      error: state.error,
      login,
      register,
      logout,
      updateUser,
      clearError,
    }),
    [state, login, register, logout, updateUser, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}
