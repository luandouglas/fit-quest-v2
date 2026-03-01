export * from './storage'
export * from './authService'
export * from './nutritionService'
export * from './workoutService'
export * from './progressService'
export * from './gamificationService'
export * from './contracts'
export * from './http'

import { authService } from './authService'
import { registerMockHandlers } from './mocks/registerMocks'

registerMockHandlers()
authService.hydrateHttpToken()
