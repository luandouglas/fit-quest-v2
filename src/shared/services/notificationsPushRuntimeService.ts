import type { NotificationPushPermission, NotificationPushPlatform, NotificationPushState } from '@/shared/services/contracts/notifications'

export interface NotificationsPushAdapter {
  getState(): Promise<NotificationPushState>
  requestPermission(): Promise<NotificationPushPermission>
  register(): Promise<NotificationPushState>
  unregister(): Promise<void>
}

function resolvePlatform(): NotificationPushPlatform {
  if (typeof navigator === 'undefined') {
    return 'web'
  }

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'ios'
  }

  if (userAgent.includes('android')) {
    return 'android'
  }

  return 'web'
}

const noopPushAdapter: NotificationsPushAdapter = {
  async getState(): Promise<NotificationPushState> {
    const permission =
      typeof Notification === 'undefined'
        ? 'unsupported'
        : (Notification.permission as NotificationPushPermission)

    return {
      permission,
      platform: resolvePlatform(),
      isRegistered: false,
      token: null,
    }
  },
  async requestPermission(): Promise<NotificationPushPermission> {
    if (typeof Notification === 'undefined') {
      return 'unsupported'
    }

    const permission = await Notification.requestPermission()
    return permission as NotificationPushPermission
  },
  async register(): Promise<NotificationPushState> {
    const permission = await this.requestPermission()

    return {
      permission,
      platform: resolvePlatform(),
      isRegistered: false,
      token: null,
      lastSyncedAt: new Date().toISOString(),
    }
  },
  async unregister(): Promise<void> {},
}

export const notificationsPushRuntimeService = {
  adapter: noopPushAdapter,
  async getState() {
    return this.adapter.getState()
  },
  async requestPermission() {
    return this.adapter.requestPermission()
  },
  async register() {
    return this.adapter.register()
  },
}
