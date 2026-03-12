export const appRuntimeConfig = {
  authMode: "mock",
  supportedPlatforms: ["web", "android", "ios"] as const,
  usesFirebaseAdapters: true,
} as const;
