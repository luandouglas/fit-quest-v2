export type AnalyticsPayload = Record<string, unknown>;

export const analyticsService = {
  track(eventName: string, payload?: AnalyticsPayload) {
    // TODO: Replace with Firebase Analytics / platform analytics adapter.
    if (import.meta.env.DEV) {
      console.debug("[analytics:mock]", eventName, payload ?? {});
    }
  },
};
