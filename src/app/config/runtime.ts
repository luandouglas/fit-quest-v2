import { getAuthProviderPreference } from "@/shared/services/firebase";

export const appRuntimeConfig = {
  authMode: getAuthProviderPreference(),
  supportedPlatforms: ["web", "android", "ios"] as const,
  usesFirebaseAdapters: true,
} as const;
