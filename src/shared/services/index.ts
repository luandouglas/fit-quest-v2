export * from './storage'
export * from './authService'
export * from './nutritionService'
export * from './workoutService'
export * from './progressService'
export * from './gamificationService'
export * from './homeService'
export * from './runService'
export * from './rankingService'
export * from './notificationsService'
export * from './notificationsPushRuntimeService'
export * from './profileService'
export * from './studentService'
export * from './personalService'
export * from './nutritionistService'
export * from './relationshipService'
export * from './contracts'
export * from './firebase'
export * from './http'

import { authService } from './authService'
import { profileService } from './profileService'
import { registerMockHandlers } from './mocks/registerMocks'

registerMockHandlers()
authService.hydrateHttpToken()
profileService.hydrateThemeFromStorage()
