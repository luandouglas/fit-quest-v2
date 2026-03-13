import type { AuthSession, AuthUser, AuthUserRole, ProfessionalProfile } from '@/shared/types'
import type { GamificationOverview } from '@/shared/services/contracts/gamification'
import type { DashboardNotification, DashboardMission, HomeDashboardOverview } from '@/shared/services/contracts/home'
import type { Meal, NutritionDay, NutritionDaysMap, NutritionPermissions } from '@/shared/services/contracts/nutrition'
import type { CreateNutritionistDietInput, NutritionistAssessment, NutritionistAssignedDiet, NutritionistDashboardOverview, NutritionistStudent } from '@/shared/services/contracts/nutritionist'
import type { NotificationItem, NotificationsInbox } from '@/shared/services/contracts/notifications'
import type {
  CreatePersonalWorkoutInput,
  PersonalAssignedWorkout,
  PersonalDashboardOverview,
  PersonalMetrics,
  PersonalStudent,
  PersonalStudentInviteLink,
} from '@/shared/services/contracts/personal'
import type { BodyMeasurementLog, ProgressOverview, ProgressRange, ProgressWeightEntry, ProgressWeightLog } from '@/shared/services/contracts/progress'
import type { ProfileGoal, ProfilePreferences, ProfileSettings, ThemePreference, UpdateProfilePayload } from '@/shared/services/contracts/profile'
import type { RankingAthlete, RankingLeaderboard, RankingLeague, RankingPeriod, RankingScope, RankingSummary } from '@/shared/services/contracts/ranking'
import type { RelationshipInvite, StudentRelationshipsOverview } from '@/shared/services/contracts/relationship'
import type { MeasurementsUpdateRequest, RequestStatus } from '@/shared/services/contracts/requests'
import type { RunOverview, RunRankingSnapshot, RunSession } from '@/shared/services/contracts/run'
import type {
  CardioSession,
  DailyProgress,
  GamificationProfile,
  NutritionDayPlan,
  RankingSummary as StudentHubRankingSummary,
  StudentDashboard,
  StudentWorkoutExecutionInput,
  StudentMetrics,
  StudentProfile,
  WaterProgress,
  WorkoutDay,
} from '@/shared/services/contracts/student'
import type { WorkoutSession, WorkoutSessionSummary } from '@/shared/services/contracts/workout'
import {
  AUTH_SESSION_SCHEMA_VERSION,
  AUTH_SESSION_STORAGE_KEY,
  NUTRITIONIST_STUDENT_LINKS_STORAGE_KEY,
  NUTRITION_DAYS_BY_STUDENT_STORAGE_KEY,
  NUTRITION_PLAN_BY_STUDENT_STORAGE_KEY,
  PERSONAL_STUDENT_LINKS_STORAGE_KEY,
  PROGRESS_MEASUREMENTS_LOGS_BY_STUDENT_STORAGE_KEY,
  PROGRESS_WEIGHT_LOGS_BY_STUDENT_STORAGE_KEY,
  GAMIFICATION_SPECIAL_ACHIEVEMENTS_BY_STUDENT_STORAGE_KEY,
  RELATIONSHIP_INVITES_STORAGE_KEY,
  MEASUREMENTS_UPDATE_REQUESTS_STORAGE_KEY,
  PROFILE_SCHEMA_VERSION,
  PROFILE_STORAGE_KEY,
} from '@/shared/constants'
import { HttpError } from '@/shared/services/http'
import { registerMockHandler } from '@/shared/services/http'
import type { HttpRequestContext } from '@/shared/services/http'
import { createNutritionMockDays } from '@/shared/services/mocks/nutritionMockData'
import { createStudentDashboardMock } from '@/shared/services/mocks/studentMockData'
import { workoutMockRepository } from '@/shared/services/repositories/workoutMockRepository'
import { runMockRepository } from '@/shared/services/repositories/runMockRepository'
import { workoutSessionMockRepository } from '@/shared/services/repositories/workoutSessionMockRepository'
import { storage } from '@/shared/services/storage'

type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  session: AuthSession
}

type NutritionDaysResponse = {
  daysByDate: NutritionDaysMap
  permissions: NutritionPermissions
}

type PersistedAuthSession = {
  version: number
  session: AuthSession
}

type PersistedProfileSettings = {
  version: number
  profile: ProfileSettings
}

type ProfessionalGrantedAchievement = {
  id: string
  studentId: string
  title: string
  description: string
  grantedByRole: 'PERSONAL' | 'NUTRITIONIST'
  grantedById: string
  grantedAt: string
}

type SeededLoginProfile = {
  id: string
  email: string
  name: string
  role: AuthUserRole
  professionalProfile?: ProfessionalProfile
}

const SEEDED_LOGIN_PROFILES: SeededLoginProfile[] = [
  {
    id: 'student-1',
    email: 'aluno@fitquest.app',
    name: 'Aluno FitQuest',
    role: 'STUDENT',
  },
  {
    id: 'student-2',
    email: 'aluno2@fitquest.app',
    name: 'Ana Aluna',
    role: 'STUDENT',
  },
  {
    id: 'student-3',
    email: 'aluno3@fitquest.app',
    name: 'Bruno Aluno',
    role: 'STUDENT',
  },
  {
    id: 'personal-1',
    email: 'personal@fitquest.app',
    name: 'Personal FitQuest',
    role: 'PERSONAL',
    professionalProfile: {
      title: 'Personal Trainer',
      license: 'CREF 000000-G/SP',
      specialties: ['Hipertrofia', 'Condicionamento'],
    },
  },
  {
    id: 'nutritionist-1',
    email: 'nutri@fitquest.app',
    name: 'Nutri FitQuest',
    role: 'NUTRITIONIST',
    professionalProfile: {
      title: 'Nutricionista',
      license: 'CRN 00000',
      specialties: ['Reeducacao alimentar', 'Performance'],
    },
  },
]

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function startOfWeek(date: Date) {
  const nextDate = new Date(date)
  const day = nextDate.getDay()
  const diff = (day + 6) % 7
  nextDate.setDate(nextDate.getDate() - diff)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function startOfNextDay(date: Date) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(nextDate.getDate() + 1)
  return nextDate
}

function startOfNextWeek(date: Date) {
  return addDays(startOfWeek(date), 7)
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function weekKey(date: Date) {
  return toIsoDate(startOfWeek(date))
}

function calculateRunXp(run: RunSession) {
  return 80 + Math.round(run.distanceKm * 40)
}

function calculateWorkoutXp(summary: WorkoutSessionSummary) {
  return 120 + summary.completedSets * 10
}

function toLevelProgress(totalXp: number) {
  let level = 1
  let consumedXp = 0
  let levelTarget = 400

  while (totalXp >= consumedXp + levelTarget) {
    consumedXp += levelTarget
    level += 1
    levelTarget = 400 + (level - 1) * 120
  }

  return {
    level,
    currentLevelXp: totalXp - consumedXp,
    nextLevelXp: levelTarget,
  }
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function isProfileGoal(value: unknown): value is ProfileGoal {
  return value === 'lose_weight' || value === 'gain_muscle' || value === 'maintenance' || value === 'performance'
}

function inferRoleFromEmail(email: string): AuthUserRole {
  const normalized = email.trim().toLowerCase()

  if (normalized.includes('personal')) {
    return 'PERSONAL'
  }

  if (normalized.includes('nutri')) {
    return 'NUTRITIONIST'
  }

  return 'STUDENT'
}

function createProfessionalProfileByRole(role: AuthUserRole): ProfessionalProfile | undefined {
  if (role === 'PERSONAL') {
    return {
      title: 'Personal Trainer',
      specialties: ['Condicionamento'],
    }
  }

  if (role === 'NUTRITIONIST') {
    return {
      title: 'Nutricionista',
      specialties: ['Plano alimentar'],
    }
  }

  return undefined
}

function resolveSeededLoginProfile(email: string): SeededLoginProfile | null {
  const normalized = email.trim().toLowerCase()
  const direct = SEEDED_LOGIN_PROFILES.find((profile) => profile.email.toLowerCase() === normalized)

  if (direct) {
    return direct
  }

  const displayName = normalized.split('@')[0]?.trim() || 'atleta'
  const role = inferRoleFromEmail(normalized)

  return {
    id: `seed-${hashString(normalized)}`,
    email: normalized,
    name: displayName,
    role,
    professionalProfile: createProfessionalProfileByRole(role),
  }
}

function createDefaultProfileSettings(name?: string): ProfileSettings {
  return {
    name: name?.trim() || 'Atleta FitQuest',
    city: 'Sao Paulo',
    neighborhood: 'Pinheiros',
    gym: 'Iron Temple Pinheiros',
    goal: 'maintenance',
    goals: {
      waterMlDaily: 2500,
      workoutsPerWeek: 5,
    },
    preferences: {
      notificationsEnabled: true,
      remindersEnabled: true,
      measurementSystem: 'metric',
      themePreference: 'system',
    },
  }
}

function isProfileSettingsShape(value: unknown): value is PersistedProfileSettings {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<PersistedProfileSettings>
  const profile = candidate.profile

  return (
    typeof candidate.version === 'number' &&
    profile !== null &&
    typeof profile === 'object' &&
    typeof profile.name === 'string' &&
    typeof profile.city === 'string' &&
    typeof profile.neighborhood === 'string' &&
    typeof profile.gym === 'string' &&
    isProfileGoal(profile.goal) &&
    typeof profile.goals?.waterMlDaily === 'number' &&
    typeof profile.goals?.workoutsPerWeek === 'number' &&
    typeof profile.preferences?.notificationsEnabled === 'boolean' &&
    typeof profile.preferences?.remindersEnabled === 'boolean' &&
    (profile.preferences?.measurementSystem === 'metric' || profile.preferences?.measurementSystem === 'imperial') &&
    isThemePreference(profile.preferences?.themePreference)
  )
}

type RankingSeedAthlete = {
  id: string
  name: string
  avatarSeed: string
  city: string
  neighborhood: string
  gym: string
  weeklyBaseXp: number
}

type XpSnapshot = {
  workout: number
  run: number
  nutrition: number
  hydration: number
  total: number
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function startOfMonth(date: Date) {
  const nextDate = new Date(date)
  nextDate.setDate(1)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function getRankingPeriodStart(period: RankingPeriod, now: Date) {
  return period === 'monthly' ? startOfMonth(now) : startOfWeek(now)
}

function getPreviousPeriodDate(period: RankingPeriod, now: Date) {
  if (period === 'monthly') {
    return addDays(startOfMonth(now), -1)
  }

  return addDays(startOfWeek(now), -7)
}

function getCurrentUserIdentity() {
  const stored = storage.get<PersistedAuthSession>(AUTH_SESSION_STORAGE_KEY)
  const user = stored?.session?.user

  return {
    id: user?.id ?? 'current-user',
    name: user?.name ?? 'Você',
  }
}

function getCurrentAuthUser() {
  const stored = storage.get<PersistedAuthSession>(AUTH_SESSION_STORAGE_KEY)
  const user = stored?.session?.user

  return {
    id: user?.id ?? 'current-user',
    name: user?.name ?? 'Você',
    role: user?.role ?? 'STUDENT',
    professionalProfile: user?.professionalProfile,
  }
}

function getSeededStudents() {
  return SEEDED_LOGIN_PROFILES.filter((profile) => profile.role === 'STUDENT')
}

function getSeededUserNameById(userId?: string | null) {
  if (!userId) {
    return null
  }

  const seeded = SEEDED_LOGIN_PROFILES.find((profile) => profile.id === userId)
  return seeded?.name ?? null
}

type ProfessionalStudentLinksMap = Record<string, string[]>

function getSeededProfessionalsByRole(role: 'PERSONAL' | 'NUTRITIONIST') {
  return SEEDED_LOGIN_PROFILES.filter((profile) => profile.role === role)
}

function createDefaultPersonalLinks(): ProfessionalStudentLinksMap {
  const defaultPersonal = getSeededProfessionalsByRole('PERSONAL')[0]
  const defaultStudent = getSeededStudents()[0]

  if (!defaultPersonal || !defaultStudent) {
    return {}
  }

  return {
    [defaultPersonal.id]: [defaultStudent.id],
  }
}

function createDefaultNutritionistLinks(): ProfessionalStudentLinksMap {
  const defaultNutritionist = getSeededProfessionalsByRole('NUTRITIONIST')[0]
  const defaultStudent = getSeededStudents()[0]

  if (!defaultNutritionist || !defaultStudent) {
    return {}
  }

  return {
    [defaultNutritionist.id]: [defaultStudent.id],
  }
}

function getRelationshipInvites() {
  return storage.get<RelationshipInvite[]>(RELATIONSHIP_INVITES_STORAGE_KEY) ?? []
}

function saveRelationshipInvites(invites: RelationshipInvite[]) {
  storage.set(RELATIONSHIP_INVITES_STORAGE_KEY, invites)
}

function getMeasurementsUpdateRequests() {
  return storage.get<MeasurementsUpdateRequest[]>(MEASUREMENTS_UPDATE_REQUESTS_STORAGE_KEY) ?? []
}

function saveMeasurementsUpdateRequests(requests: MeasurementsUpdateRequest[]) {
  storage.set(MEASUREMENTS_UPDATE_REQUESTS_STORAGE_KEY, requests)
}

function getPersonalStudentLinksMap() {
  const stored = storage.get<ProfessionalStudentLinksMap>(PERSONAL_STUDENT_LINKS_STORAGE_KEY)

  if (stored && Object.keys(stored).length > 0) {
    return stored
  }

  const seeded = createDefaultPersonalLinks()
  storage.set(PERSONAL_STUDENT_LINKS_STORAGE_KEY, seeded)

  return seeded
}

function savePersonalStudentLinksMap(map: ProfessionalStudentLinksMap) {
  storage.set(PERSONAL_STUDENT_LINKS_STORAGE_KEY, map)
}

function getLinkedStudentIdsByPersonal(personalId: string) {
  const links = getPersonalStudentLinksMap()
  return links[personalId] ?? []
}

function getNutritionistStudentLinksMap() {
  const stored = storage.get<ProfessionalStudentLinksMap>(NUTRITIONIST_STUDENT_LINKS_STORAGE_KEY)

  if (stored && Object.keys(stored).length > 0) {
    return stored
  }

  const seeded = createDefaultNutritionistLinks()
  storage.set(NUTRITIONIST_STUDENT_LINKS_STORAGE_KEY, seeded)
  return seeded
}

function saveNutritionistStudentLinksMap(map: ProfessionalStudentLinksMap) {
  storage.set(NUTRITIONIST_STUDENT_LINKS_STORAGE_KEY, map)
}

function getLinkedStudentIdsByNutritionist(nutritionistId: string) {
  const links = getNutritionistStudentLinksMap()
  return links[nutritionistId] ?? []
}

function getActiveNutritionistIdByStudentId(studentId: string) {
  const links = getNutritionistStudentLinksMap()
  const nutritionistId = Object.entries(links).find(([, studentIds]) => studentIds.includes(studentId))?.[0]
  return nutritionistId ?? null
}

function getProfessionalCode(professionalId: string, role: 'PERSONAL' | 'NUTRITIONIST') {
  const suffix = professionalId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'PRO'
  return role === 'PERSONAL' ? `PT-${suffix}` : `NT-${suffix}`
}

function resolveProfessionalByCodeOrId(codeOrId: string) {
  const normalized = codeOrId.trim().toLowerCase()
  const professionals = SEEDED_LOGIN_PROFILES.filter((profile) => profile.role === 'PERSONAL' || profile.role === 'NUTRITIONIST')
  const direct = professionals.find((profile) => profile.id.toLowerCase() === normalized || profile.email.toLowerCase() === normalized)

  if (direct) {
    return direct
  }

  return professionals.find((profile) => getProfessionalCode(profile.id, profile.role as 'PERSONAL' | 'NUTRITIONIST').toLowerCase() === normalized) ?? null
}

function ensureSingleProfessionalLink(studentId: string, professionalId: string, role: 'PERSONAL' | 'NUTRITIONIST') {
  if (role === 'PERSONAL') {
    const map = getPersonalStudentLinksMap()
    const nextMap: ProfessionalStudentLinksMap = {}
    Object.entries(map).forEach(([currentPersonalId, studentIds]) => {
      const filtered = studentIds.filter((id) => id !== studentId)
      if (filtered.length > 0) {
        nextMap[currentPersonalId] = filtered
      }
    })
    nextMap[professionalId] = [...(nextMap[professionalId] ?? []), studentId]
    savePersonalStudentLinksMap(nextMap)
    return
  }

  const map = getNutritionistStudentLinksMap()
  const nextMap: ProfessionalStudentLinksMap = {}
  Object.entries(map).forEach(([currentNutritionistId, studentIds]) => {
    const filtered = studentIds.filter((id) => id !== studentId)
    if (filtered.length > 0) {
      nextMap[currentNutritionistId] = filtered
    }
  })
  nextMap[professionalId] = [...(nextMap[professionalId] ?? []), studentId]
  saveNutritionistStudentLinksMap(nextMap)
}

function resolveNutritionStudentIdFromCurrentUser() {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role === 'NUTRITIONIST') {
    const linkedStudentIds = getLinkedStudentIdsByNutritionist(currentUser.id)
    return linkedStudentIds[0] ?? currentUser.id
  }

  return currentUser.id
}

function getActivePersonalIdByStudentId(studentId: string) {
  const links = getPersonalStudentLinksMap()
  const personalId = Object.entries(links).find(([, studentIds]) => studentIds.includes(studentId))?.[0]

  return personalId ?? null
}

function resolveWorkoutStudentIdFromCurrentUser() {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role === 'PERSONAL') {
    const linkedStudentIds = getLinkedStudentIdsByPersonal(currentUser.id)
    return linkedStudentIds[0] ?? currentUser.id
  }

  return currentUser.id
}

function resolveProgressStudentIdFromCurrentUser() {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role === 'PERSONAL') {
    const linkedStudentIds = getLinkedStudentIdsByPersonal(currentUser.id)
    return linkedStudentIds[0] ?? currentUser.id
  }

  if (currentUser.role === 'NUTRITIONIST') {
    const linkedStudentIds = getLinkedStudentIdsByNutritionist(currentUser.id)
    return linkedStudentIds[0] ?? currentUser.id
  }

  return currentUser.id
}

function getWorkoutPermissions(studentId: string) {
  const activePersonalId = getActivePersonalIdByStudentId(studentId)
  const hasActivePersonal = Boolean(activePersonalId)

  return {
    studentId,
    activePersonalId,
    hasActivePersonal,
    canCreateQuickWorkout: !hasActivePersonal,
    canExecuteOnlyAssigned: hasActivePersonal,
    canEditPlan: !hasActivePersonal,
  }
}

function getNutritionPermissions(studentId: string): NutritionPermissions {
  const hasActiveNutritionist = Boolean(getActiveNutritionistIdByStudentId(studentId))

  return {
    hasActiveNutritionist,
    canEditPlan: !hasActiveNutritionist,
    canRegisterConsumption: true,
    canAddMealNotes: true,
    canUpdateWater: true,
  }
}

function buildStudentRelationshipsOverview(studentId: string): StudentRelationshipsOverview {
  const professionalById = new Map(
    SEEDED_LOGIN_PROFILES
      .filter((profile) => profile.role === 'PERSONAL' || profile.role === 'NUTRITIONIST')
      .map((profile) => [profile.id, profile]),
  )

  const personalId = getActivePersonalIdByStudentId(studentId)
  const nutritionistId = getActiveNutritionistIdByStudentId(studentId)
  const invites = getRelationshipInvites()
    .filter((invite) => invite.studentId === studentId)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))

  const personalProfile = personalId ? professionalById.get(personalId) : null
  const nutritionistProfile = nutritionistId ? professionalById.get(nutritionistId) : null

  return {
    studentId,
    personal: personalProfile
      ? {
          id: personalProfile.id,
          role: 'PERSONAL',
          name: personalProfile.name,
          code: getProfessionalCode(personalProfile.id, 'PERSONAL'),
          linkedAt: new Date().toISOString(),
        }
      : null,
    nutritionist: nutritionistProfile
      ? {
          id: nutritionistProfile.id,
          role: 'NUTRITIONIST',
          name: nutritionistProfile.name,
          code: getProfessionalCode(nutritionistProfile.id, 'NUTRITIONIST'),
          linkedAt: new Date().toISOString(),
        }
      : null,
    pendingInvites: invites.filter((invite) => invite.status === 'pending'),
    recentInvites: invites.slice(0, 12),
  }
}

function getStoredAuthSession() {
  const stored = storage.get<PersistedAuthSession>(AUTH_SESSION_STORAGE_KEY)

  if (!stored || stored.version !== AUTH_SESSION_SCHEMA_VERSION || !stored.session) {
    return null
  }

  return stored
}

function updateStoredAuthSessionName(name: string) {
  const stored = getStoredAuthSession()

  if (!stored) {
    return
  }

  storage.set<PersistedAuthSession>(AUTH_SESSION_STORAGE_KEY, {
    ...stored,
    session: {
      ...stored.session,
      user: {
        ...stored.session.user,
        name,
      },
    },
  })
}

function getProfileSettings(defaultName?: string): ProfileSettings {
  const stored = storage.get<unknown>(PROFILE_STORAGE_KEY)

  if (isProfileSettingsShape(stored) && stored.version === PROFILE_SCHEMA_VERSION) {
    return stored.profile
  }

  const seeded = createDefaultProfileSettings(defaultName ?? getCurrentUserIdentity().name)
  storage.set<PersistedProfileSettings>(PROFILE_STORAGE_KEY, {
    version: PROFILE_SCHEMA_VERSION,
    profile: seeded,
  })
  return seeded
}

function saveProfileSettings(profile: ProfileSettings) {
  storage.set<PersistedProfileSettings>(PROFILE_STORAGE_KEY, {
    version: PROFILE_SCHEMA_VERSION,
    profile,
  })
}

function applyProfilePatch(current: ProfileSettings, patch: UpdateProfilePayload): ProfileSettings {
  const nextName = patch.name?.trim() || current.name
  const nextCity = patch.city?.trim() || current.city
  const nextNeighborhood = patch.neighborhood?.trim() || current.neighborhood
  const nextGym = patch.gym?.trim() || current.gym
  const nextGoal = patch.goal && isProfileGoal(patch.goal) ? patch.goal : current.goal
  const requestedWaterGoal = Number(patch.goals?.waterMlDaily)
  const requestedWorkoutsPerWeek = Number(patch.goals?.workoutsPerWeek)
  const nextWaterGoal = Number.isFinite(requestedWaterGoal)
    ? clamp(Math.round(requestedWaterGoal), 500, 8000)
    : current.goals.waterMlDaily
  const nextWorkoutsPerWeek = Number.isFinite(requestedWorkoutsPerWeek)
    ? clamp(Math.round(requestedWorkoutsPerWeek), 1, 14)
    : current.goals.workoutsPerWeek
  const requestedTheme = patch.preferences?.themePreference
  const nextTheme = requestedTheme && isThemePreference(requestedTheme)
    ? requestedTheme
    : current.preferences.themePreference
  const requestedMeasurementSystem = patch.preferences?.measurementSystem
  const nextMeasurementSystem: ProfilePreferences['measurementSystem'] =
    requestedMeasurementSystem === 'imperial' || requestedMeasurementSystem === 'metric'
      ? requestedMeasurementSystem
      : current.preferences.measurementSystem

  return {
    ...current,
    name: nextName,
    city: nextCity,
    neighborhood: nextNeighborhood,
    gym: nextGym,
    goal: nextGoal,
    goals: {
      waterMlDaily: nextWaterGoal,
      workoutsPerWeek: nextWorkoutsPerWeek,
    },
    preferences: {
      notificationsEnabled: patch.preferences?.notificationsEnabled ?? current.preferences.notificationsEnabled,
      remindersEnabled: patch.preferences?.remindersEnabled ?? current.preferences.remindersEnabled,
      measurementSystem: nextMeasurementSystem,
      themePreference: nextTheme,
    },
  }
}

const rankingGeoSeed = [
  {
    city: 'Sao Paulo',
    neighborhoods: ['Pinheiros', 'Vila Madalena', 'Moema', 'Itaim Bibi'],
    gyms: ['Iron Temple Pinheiros', 'Santos Dumont Performance'],
  },
  {
    city: 'Rio de Janeiro',
    neighborhoods: ['Ipanema', 'Botafogo', 'Barra da Tijuca', 'Tijuca'],
    gyms: ['Orla Fitness Hub', 'Praia Ativa Club'],
  },
  {
    city: 'Belo Horizonte',
    neighborhoods: ['Savassi', 'Lourdes', 'Funcionarios', 'Buritis'],
    gyms: ['Arena Norte Gym', 'Mineirao Performance'],
  },
  {
    city: 'Curitiba',
    neighborhoods: ['Batel', 'Centro Civico', 'Agua Verde', 'Cabral'],
    gyms: ['Downtown Athletic Club', 'Parque Core Studio'],
  },
]

function getBaseLeagueByXp(previousWeekXp: number): RankingLeague {
  if (previousWeekXp >= 1200) {
    return 'gold'
  }

  if (previousWeekXp >= 700) {
    return 'silver'
  }

  return 'bronze'
}

function resolveNextLeagueByRule(
  baseLeague: RankingLeague,
  indexInLeague: number,
  leagueSize: number,
): RankingLeague {
  if (leagueSize <= 4) {
    return baseLeague
  }

  const topCutoff = Math.max(1, Math.ceil(leagueSize * 0.2))
  const bottomCutoff = Math.max(1, Math.ceil(leagueSize * 0.2))
  const isTop = indexInLeague < topCutoff
  const isBottom = indexInLeague >= leagueSize - bottomCutoff

  if (isTop && baseLeague === 'bronze') {
    return 'silver'
  }

  if (isTop && baseLeague === 'silver') {
    return 'gold'
  }

  if (isBottom && baseLeague === 'gold') {
    return 'silver'
  }

  if (isBottom && baseLeague === 'silver') {
    return 'bronze'
  }

  return baseLeague
}

function createRankingSeedAthletes() {
  const cached = storage.get<RankingSeedAthlete[]>('fitquest.ranking.seed.v2')

  if (cached && cached.length) {
    return cached
  }

  const firstNames = ['Alex', 'Bruno', 'Carla', 'Davi', 'Elisa', 'Felipe', 'Gabi', 'Hugo', 'Iris', 'Joao', 'Katia', 'Leo', 'Maya', 'Nina', 'Otavio', 'Paula', 'Ravi', 'Sara', 'Tiago', 'Vitor']
  const suffixes = ['Silva', 'Costa', 'Lima', 'Santos', 'Ramos', 'Melo', 'Rocha', 'Pires', 'Alves', 'Souza']
  const seed: RankingSeedAthlete[] = []

  for (let index = 0; index < 120; index += 1) {
    const firstName = firstNames[index % firstNames.length]
    const suffix = suffixes[index % suffixes.length]
    const hash = hashString(`${firstName}-${suffix}-${index}`)
    const geo = rankingGeoSeed[index % rankingGeoSeed.length]
    const neighborhood = geo.neighborhoods[hash % geo.neighborhoods.length] ?? geo.neighborhoods[0]
    const gym = geo.gyms[(hash + index) % geo.gyms.length] ?? geo.gyms[0]

    seed.push({
      id: `seed-${index + 1}`,
      name: `${firstName} ${suffix}`,
      avatarSeed: `${firstName.toLowerCase()}-${index + 1}`,
      city: geo.city,
      neighborhood,
      gym,
      weeklyBaseXp: 420 + (hash % 1250),
    })
  }

  storage.set('fitquest.ranking.seed.v2', seed)
  return seed
}

function calculateXpSnapshot(
  workoutHistory: WorkoutSessionSummary[],
  runHistory: RunSession[],
  nutritionDays: NutritionDaysMap,
  startDate?: Date,
  endDate?: Date,
): XpSnapshot {
  const startKey = startDate ? toIsoDate(startDate) : null
  const endKey = endDate ? toIsoDate(endDate) : null
  const workout = workoutHistory
    .filter((entry) => {
      const completedAt = new Date(entry.completedAt)
      return (!startDate || completedAt >= startDate) && (!endDate || completedAt < endDate)
    })
    .reduce((total, entry) => total + calculateWorkoutXp(entry), 0)
  const run = runHistory
    .filter((entry) => {
      const completedAt = new Date(entry.endedAt ?? entry.startedAt)
      return (!startDate || completedAt >= startDate) && (!endDate || completedAt < endDate)
    })
    .reduce((total, entry) => total + calculateRunXp(entry), 0)
  const nutrition = Object.entries(nutritionDays).reduce((total, [dateKey, day]) => {
    if (startKey && dateKey < startKey) {
      return total
    }
    if (endKey && dateKey >= endKey) {
      return total
    }

    return total + day.meals.filter((meal) => meal.status === 'done').length * 20
  }, 0)
  const hydration = Object.entries(nutritionDays).reduce((total, [dateKey, day]) => {
    if (startKey && dateKey < startKey) {
      return total
    }
    if (endKey && dateKey >= endKey) {
      return total
    }

    return total + (day.consumed.waterMl >= day.goals.waterMl ? 40 : 0)
  }, 0)

  return {
    workout,
    run,
    nutrition,
    hydration,
    total: workout + run + nutrition + hydration,
  }
}

function calculateSeedXp(seed: RankingSeedAthlete, period: RankingPeriod, now: Date) {
  const periodKey = period === 'monthly' ? `${now.getFullYear()}-${now.getMonth() + 1}` : weekKey(now)
  const variation = (hashString(`${seed.id}:${periodKey}`) % (period === 'monthly' ? 600 : 220)) - (period === 'monthly' ? 220 : 80)
  const multiplier = period === 'monthly' ? 4.4 : 1
  return Math.max(Math.round(seed.weeklyBaseXp * multiplier + variation), 120)
}

type RankingFilters = {
  period: RankingPeriod
  scope: RankingScope
  league: RankingLeague
}

function buildRankingLeaderboard(
  filters: RankingFilters,
  workoutHistory: WorkoutSessionSummary[],
  runHistory: RunSession[],
): RankingLeaderboard {
  const { period, scope, league } = filters
  const now = new Date()
  const periodStart = getRankingPeriodStart(period, now)
  const previousDate = getPreviousPeriodDate(period, now)
  const previousStart = getRankingPeriodStart(period, previousDate)
  const profile = getProfileSettings()
  const nutritionDays = getNutritionDays(toIsoDate(now))
  const currentUser = getCurrentUserIdentity()
  const currentSnapshot = calculateXpSnapshot(workoutHistory, runHistory, nutritionDays, periodStart, now)
  const previousSnapshot = calculateXpSnapshot(workoutHistory, runHistory, nutritionDays, previousStart, periodStart)
  const currentDelta = currentSnapshot.total - previousSnapshot.total
  const previousWeekStart = addDays(startOfWeek(now), -7)
  const currentWeekStart = startOfWeek(now)
  const currentUserPreviousWeekXp = calculateXpSnapshot(workoutHistory, runHistory, nutritionDays, previousWeekStart, currentWeekStart).total
  const currentUserBaseLeague = getBaseLeagueByXp(currentUserPreviousWeekXp)

  const seededAthletes = createRankingSeedAthletes()
  const seededRows: Array<{ athlete: RankingAthlete; baseLeague: RankingLeague; previousWeekXp: number }> = seededAthletes.map((seed) => {
    const xp = calculateSeedXp(seed, period, now)
    const previousXp = calculateSeedXp(seed, period, previousDate)
    const previousWeekXp = calculateSeedXp(seed, 'weekly', addDays(now, -7))
    const delta = xp - previousXp
    const trend: RankingAthlete['trend'] = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same'

    return {
      athlete: {
        id: seed.id,
        name: seed.name,
        avatarSeed: seed.avatarSeed,
        city: seed.city,
        neighborhood: seed.neighborhood,
        gym: seed.gym,
        league: 'bronze' as RankingLeague,
        xp,
        position: 0,
        trend,
        isCurrentUser: false,
      },
      baseLeague: getBaseLeagueByXp(previousWeekXp),
      previousWeekXp,
    }
  })

  const userTrend: RankingAthlete['trend'] = currentDelta > 0 ? 'up' : currentDelta < 0 ? 'down' : 'same'
  const userRow: { athlete: RankingAthlete; baseLeague: RankingLeague; previousWeekXp: number } = {
    athlete: {
      id: currentUser.id,
      name: currentUser.name,
      avatarSeed: currentUser.id,
      city: profile.city,
      neighborhood: profile.neighborhood,
      gym: profile.gym,
      league: 'bronze' as RankingLeague,
      xp: currentSnapshot.total,
      position: 0,
      trend: userTrend,
      isCurrentUser: true,
    },
    baseLeague: currentUserBaseLeague,
    previousWeekXp: currentUserPreviousWeekXp,
  }

  const rows = [...seededRows, userRow]
  const rowsByBaseLeague = {
    bronze: rows.filter((row) => row.baseLeague === 'bronze'),
    silver: rows.filter((row) => row.baseLeague === 'silver'),
    gold: rows.filter((row) => row.baseLeague === 'gold'),
  } as const

  const promotedLeagues = new Map<string, RankingLeague>()
  ;(Object.keys(rowsByBaseLeague) as RankingLeague[]).forEach((baseLeague) => {
    const leagueRows = rowsByBaseLeague[baseLeague].slice().sort((left, right) => right.previousWeekXp - left.previousWeekXp)
    leagueRows.forEach((row, index) => {
      promotedLeagues.set(row.athlete.id, resolveNextLeagueByRule(baseLeague, index, leagueRows.length))
    })
  })

  rows.forEach((row) => {
    row.athlete.league = promotedLeagues.get(row.athlete.id) ?? row.baseLeague
  })

  const athletes = rows.map((row) => row.athlete)
  const scopedAthletes = athletes.filter((athlete) => {
    if (athlete.league !== league) {
      return false
    }

    if (scope === 'global') {
      return true
    }

    if (scope === 'city') {
      return athlete.city === profile.city
    }

    if (scope === 'neighborhood') {
      return athlete.city === profile.city && athlete.neighborhood === profile.neighborhood
    }

    return athlete.gym === profile.gym
  })
  const rankedAthletes = (scopedAthletes.length > 0 ? scopedAthletes : athletes.filter((athlete) => athlete.league === league))
    .slice()
    .sort((left, right) => right.xp - left.xp)

  rankedAthletes.forEach((athlete, index) => {
    athlete.position = index + 1
  })

  const currentUserRow = rankedAthletes.find((athlete) => athlete.isCurrentUser)

  if (!currentUserRow) {
    const fallback = athletes.find((athlete) => athlete.isCurrentUser)
    if (!fallback) {
      throw new Error('Current user row not found in ranking leaderboard')
    }
    fallback.position = rankedAthletes.length + 1
    rankedAthletes.push(fallback)
  }

  const ensuredCurrentUser = rankedAthletes.find((athlete) => athlete.isCurrentUser) ?? rankedAthletes[0]
  const currentUserIndex = rankedAthletes.findIndex((athlete) => athlete.id === ensuredCurrentUser.id)
  const aroundStart = Math.max(0, currentUserIndex - 2)
  const aroundEnd = Math.min(rankedAthletes.length, currentUserIndex + 3)
  const aroundUser = rankedAthletes.slice(aroundStart, aroundEnd)
  const rival = rankedAthletes
    .filter((athlete) => !athlete.isCurrentUser)
    .reduce<RankingAthlete | null>((closest, candidate) => {
      if (!ensuredCurrentUser) {
        return closest
      }
      const candidateDiff = Math.abs(candidate.xp - ensuredCurrentUser.xp)
      if (!closest) {
        return candidate
      }
      const currentDiff = Math.abs(closest.xp - ensuredCurrentUser.xp)
      return candidateDiff < currentDiff ? candidate : closest
    }, null)
  const rivalGapXp = rival ? Math.abs(rival.xp - ensuredCurrentUser.xp) : null
  const transition: RankingLeaderboard['leagueStatus']['transition'] =
    ensuredCurrentUser.league === currentUserBaseLeague
      ? 'stayed'
      : ensuredCurrentUser.league === 'gold' || (ensuredCurrentUser.league === 'silver' && currentUserBaseLeague === 'bronze')
        ? 'promoted'
        : 'relegated'

  return {
    period,
    scope,
    league,
    updatedAt: new Date().toISOString(),
    currentUser: ensuredCurrentUser,
    rival,
    rivalGapXp,
    leagueStatus: {
      current: ensuredCurrentUser.league,
      previous: currentUserBaseLeague,
      previousWeekXp: currentUserPreviousWeekXp,
      transition,
      promotionRule: 'Top 20% sobe e bottom 20% desce por liga.',
    },
    leagues: ['bronze', 'silver', 'gold'],
    top: rankedAthletes.slice(0, 50),
    aroundUser,
    totalAthletes: rankedAthletes.length,
  }
}

function buildRankingSummary(workoutHistory: WorkoutSessionSummary[], runHistory: RunSession[]): RankingSummary {
  const weekly = buildRankingLeaderboard(
    {
      period: 'weekly',
      scope: 'global',
      league: 'bronze',
    },
    workoutHistory,
    runHistory,
  )

  return {
    points: weekly.currentUser.xp,
    position: weekly.currentUser.position,
    totalAthletes: weekly.totalAthletes,
  }
}

function createProgressOverview(
  workoutHistory: WorkoutSessionSummary[],
  runHistory: RunSession[],
  range: ProgressRange = '7d',
  studentId = resolveProgressStudentIdFromCurrentUser(),
): ProgressOverview {
  const defaultHeightCm = 178
  const profile = getProfileSettings()
  const rangeDays = range === '90d' ? 90 : range === '30d' ? 30 : 7
  const now = new Date()
  const rangeStart = addDays(now, -(rangeDays - 1))
  const rangeStartKey = toIsoDate(rangeStart)
  const nutritionDays = getNutritionDays(toIsoDate(now), studentId)
  const weightLogs = getProgressWeightLogs(studentId, toIsoDate(now))
  const bodyMeasurementLogs = getBodyMeasurementLogs(studentId, toIsoDate(now))
  const weightHistoryAll = toEffectiveWeightHistory(weightLogs)
  const sortedWeightHistory = [...weightHistoryAll].sort((left, right) => left.date.localeCompare(right.date))

  let latestKnownWeight: number | null = null
  const chart = Array.from({ length: rangeDays }, (_, offset) => {
    const date = addDays(rangeStart, offset)
    const dateKey = toIsoDate(date)
    const workoutEntries = workoutHistory.filter((item) => isSameDate(new Date(item.completedAt), date))
    const runEntries = runHistory.filter((item) => isSameDate(new Date(item.endedAt ?? item.startedAt), date))
    const nutritionDay = nutritionDays[dateKey]
    const nutritionCompleted = nutritionDay && nutritionDay.meals.length > 0 && isDayComplete(nutritionDay) ? 1 : 0
    const weightEntry = sortedWeightHistory.find((entry) => entry.date === dateKey)

    if (weightEntry) {
      latestKnownWeight = weightEntry.weightKg
    }

    const runCalories = runEntries.reduce((total, run) => total + run.calories, 0)
    const workoutCalories = workoutEntries.reduce((total, item) => total + Math.round(item.durationSec / 60) * 7, 0)

    return {
      date: dateKey,
      completedTrainings: workoutEntries.length + runEntries.length + nutritionCompleted,
      completedWorkouts: workoutEntries.length,
      completedRuns: runEntries.length,
      runDistanceKm: Number(runEntries.reduce((total, run) => total + run.distanceKm, 0).toFixed(2)),
      durationMin:
        workoutEntries.reduce((total, item) => total + Math.round(item.durationSec / 60), 0) +
        runEntries.reduce((total, item) => total + Math.round(item.elapsedSec / 60), 0),
      waterMl: nutritionDay?.consumed.waterMl ?? 0,
      waterGoalMl: nutritionDay?.goals.waterMl ?? profile.goals.waterMlDaily,
      caloriesEstimated: runCalories + workoutCalories,
      weightKg: latestKnownWeight,
    }
  })

  const rangeWorkoutEntries = workoutHistory.filter((item) => new Date(item.completedAt) >= rangeStart)
  const rangeRunEntries = runHistory.filter((item) => new Date(item.endedAt ?? item.startedAt) >= rangeStart)
  const rangeNutritionCompletions = Object.entries(nutritionDays).filter(([date, day]) => date >= rangeStartKey && isDayComplete(day)).length
  const completedTrainings = rangeWorkoutEntries.length + rangeRunEntries.length + rangeNutritionCompletions
  const totalDurationMin =
    rangeWorkoutEntries.reduce((total, item) => total + Math.round(item.durationSec / 60), 0) +
    rangeRunEntries.reduce((total, item) => total + Math.round(item.elapsedSec / 60), 0)
  const workoutAverageCompletionPct =
    rangeWorkoutEntries.length > 0
      ? Math.round(
          rangeWorkoutEntries.reduce((total, item) => {
            const totalSets = Math.max(item.totalSets, 1)
            return total + (item.completedSets / totalSets) * 100
          }, 0) / rangeWorkoutEntries.length,
        )
      : 0
  const runCompletionEquivalent = rangeRunEntries.length > 0 ? 100 : 0
  const averageCompletionPct =
    rangeWorkoutEntries.length + rangeRunEntries.length > 0
      ? Math.round(
          (workoutAverageCompletionPct * rangeWorkoutEntries.length + runCompletionEquivalent * rangeRunEntries.length) /
            (rangeWorkoutEntries.length + rangeRunEntries.length),
        )
      : 0

  const rangeWeightHistory = sortedWeightHistory.filter((entry) => entry.date >= rangeStartKey)
  const currentWeight = [...rangeWeightHistory].reverse()[0]?.weightKg ?? sortedWeightHistory[sortedWeightHistory.length - 1]?.weightKg ?? 0
  const firstWeight = rangeWeightHistory[0]?.weightKg ?? currentWeight
  const workoutsPerWeek = Number((completedTrainings / Math.max(rangeDays / 7, 1)).toFixed(1))
  const avgWaterMl = Math.round(chart.reduce((total, point) => total + point.waterMl, 0) / Math.max(chart.length, 1))
  const estimatedCalories = chart.reduce((total, point) => total + point.caloriesEstimated, 0)
  const bmi = currentWeight > 0 ? Number((currentWeight / ((defaultHeightCm / 100) * (defaultHeightCm / 100))).toFixed(1)) : 0

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartKey = toIsoDate(monthStart)
  const monthWorkouts = workoutHistory.filter((item) => item.completedAt >= `${monthStartKey}T00:00:00`)
  const monthRuns = runHistory.filter((item) => (item.endedAt ?? item.startedAt) >= `${monthStartKey}T00:00:00`)
  const monthDurationMin =
    monthWorkouts.reduce((total, item) => total + Math.round(item.durationSec / 60), 0) +
    monthRuns.reduce((total, item) => total + Math.round(item.elapsedSec / 60), 0)
  const monthRunKm = Number(monthRuns.reduce((total, run) => total + run.distanceKm, 0).toFixed(1))
  const monthDates = Array.from({ length: now.getDate() }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), offset + 1)
    return toIsoDate(date)
  })
  const hydrationDaysHit = monthDates.filter((dateKey) => {
    const day = nutritionDays[dateKey]
    return day ? day.consumed.waterMl >= day.goals.waterMl : false
  }).length
  const hydrationAdherencePct = Math.round((hydrationDaysHit / Math.max(monthDates.length, 1)) * 100)
  const nutritionCompletedMonth = monthDates.filter((dateKey) => {
    const day = nutritionDays[dateKey]
    return day ? isDayComplete(day) : false
  }).length
  const nutritionConsistencyPct = Math.round((nutritionCompletedMonth / Math.max(monthDates.length, 1)) * 100)
  const activeDays = monthDates.filter((dateKey) => {
    const point = chart.find((entry) => entry.date === dateKey)
    return point ? point.completedTrainings > 0 || point.waterMl > 0 : false
  }).length

  const exercisePrMap = new Map<string, { exerciseName: string; bestLoadVolumeKg: number; achievedAt: string }>()
  rangeWorkoutEntries.forEach((entry) => {
    ;(entry.exerciseRecords ?? []).forEach((record) => {
      const current = exercisePrMap.get(record.exerciseName)
      if (!current || record.loadVolumeKg > current.bestLoadVolumeKg) {
        exercisePrMap.set(record.exerciseName, {
          exerciseName: record.exerciseName,
          bestLoadVolumeKg: record.loadVolumeKg,
          achievedAt: entry.completedAt,
        })
      }
    })
  })
  const strengthPrs = Array.from(exercisePrMap.values())
    .sort((left, right) => right.bestLoadVolumeKg - left.bestLoadVolumeKg)
    .slice(0, 3)

  const weeklyVolumeMap = new Map<string, number>()
  rangeWorkoutEntries.forEach((entry) => {
    const key = weekKey(new Date(entry.completedAt))
    weeklyVolumeMap.set(key, (weeklyVolumeMap.get(key) ?? 0) + Math.max(entry.loadVolumeKg ?? 0, 0))
  })
  const strengthWeeklyVolume = Array.from(weeklyVolumeMap.entries())
    .map(([weekStart, volumeKg]) => ({
      weekStart,
      volumeKg: Number(volumeKg.toFixed(1)),
    }))
    .sort((left, right) => left.weekStart.localeCompare(right.weekStart))

  const trendFrom = (daysBack: number) => {
    const cutoff = toIsoDate(addDays(now, -(daysBack - 1)))
    const logs = sortedWeightHistory.filter((entry) => entry.date >= cutoff)
    const first = logs[0]?.weightKg ?? currentWeight
    const last = logs[logs.length - 1]?.weightKg ?? currentWeight
    return Number((last - first).toFixed(1))
  }

  const measurementLogsSorted = bodyMeasurementLogs
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
  const latestMeasurement = measurementLogsSorted[0] ?? null
  const lastUpdatedByLabel =
    latestMeasurement?.recordedByRole === 'STUDENT'
      ? 'Aluno'
      : getSeededUserNameById(latestMeasurement?.recordedById) ?? 'Profissional'

  const thisWeekStart = startOfWeek(now)
  const previousWeekStart = addDays(thisWeekStart, -7)
  const thisWeekStartKey = toIsoDate(thisWeekStart)
  const previousWeekStartKey = toIsoDate(previousWeekStart)
  const thisWeekTrainings = workoutHistory.filter((item) => item.completedAt >= `${thisWeekStartKey}T00:00:00`).length
  const previousWeekTrainings = workoutHistory.filter(
    (item) => item.completedAt >= `${previousWeekStartKey}T00:00:00` && item.completedAt < `${thisWeekStartKey}T00:00:00`,
  ).length

  const adherenceForDates = (dates: string[]) => {
    const hit = dates.filter((dateKey) => {
      const day = nutritionDays[dateKey]
      return day ? day.consumed.waterMl >= day.goals.waterMl : false
    }).length
    return Math.round((hit / Math.max(dates.length, 1)) * 100)
  }
  const nutritionConsistencyForDates = (dates: string[]) => {
    const completed = dates.filter((dateKey) => {
      const day = nutritionDays[dateKey]
      return day ? isDayComplete(day) : false
    }).length
    return Math.round((completed / Math.max(dates.length, 1)) * 100)
  }
  const workoutCountForDates = (dates: string[]) =>
    workoutHistory.filter((item) => dates.includes(toIsoDate(new Date(item.completedAt)))).length
  const cardioCountForDates = (dates: string[]) =>
    runHistory.filter((item) => dates.includes(toIsoDate(new Date(item.endedAt ?? item.startedAt)))).length
  const currentWeekDates = Array.from({ length: 7 }, (_, index) => toIsoDate(addDays(now, -index)))
  const previousWeekDates = Array.from({ length: 7 }, (_, index) => toIsoDate(addDays(now, -7 - index)))
  const waterAdherenceThisWeek = adherenceForDates(currentWeekDates)
  const waterAdherencePreviousWeek = adherenceForDates(previousWeekDates)
  const currentWeekNutritionConsistency = nutritionConsistencyForDates(currentWeekDates)
  const previousWeekNutritionConsistency = nutritionConsistencyForDates(previousWeekDates)
  const currentWeekWorkoutCount = workoutCountForDates(currentWeekDates)
  const previousWeekWorkoutCount = workoutCountForDates(previousWeekDates)
  const currentWeekCardioCount = cardioCountForDates(currentWeekDates)
  const previousWeekCardioCount = cardioCountForDates(previousWeekDates)

  const comparisonMetric = (current: number, previous: number) => {
    const deltaValue = Number((current - previous).toFixed(1))
    const deltaPct = previous === 0 ? (current > 0 ? 100 : 0) : Math.round((deltaValue / previous) * 100)

    return {
      current,
      previous,
      deltaValue,
      deltaPct,
      trend: deltaValue > 0 ? 'up' : deltaValue < 0 ? 'down' : 'stable',
    } as const
  }

  const monthMetricWindow = (referenceDate: Date) => {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
    const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1)
    const startKey = `${toIsoDate(start)}T00:00:00`
    const endKey = `${toIsoDate(end)}T00:00:00`
    const monthWorkoutsFiltered = workoutHistory.filter((item) => item.completedAt >= startKey && item.completedAt < endKey)
    const monthRunsFiltered = runHistory.filter((item) => {
      const completedAt = item.endedAt ?? item.startedAt
      return completedAt >= startKey && completedAt < endKey
    })
    const monthDays = Array.from({ length: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate() }, (_, index) =>
      toIsoDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), index + 1)),
    )

    return {
      trainingMin:
        monthWorkoutsFiltered.reduce((total, item) => total + Math.round(item.durationSec / 60), 0) +
        monthRunsFiltered.reduce((total, item) => total + Math.round(item.elapsedSec / 60), 0),
      cardioDistanceKm: Number(monthRunsFiltered.reduce((total, item) => total + item.distanceKm, 0).toFixed(1)),
      activeDays: monthDays.filter((dateKey) => {
        const point = chart.find((entry) => entry.date === dateKey)
        return point ? point.completedTrainings > 0 || point.waterMl > 0 : false
      }).length,
    }
  }

  const previousMonthMetrics = monthMetricWindow(new Date(now.getFullYear(), now.getMonth() - 1, 1))

  const insights: string[] = []
  if (previousWeekTrainings > 0) {
    const trainingsDeltaPct = Math.round(((thisWeekTrainings - previousWeekTrainings) / previousWeekTrainings) * 100)
    if (trainingsDeltaPct >= 20) {
      insights.push(`Voce treinou +${trainingsDeltaPct}% que semana passada.`)
    } else if (trainingsDeltaPct <= -20) {
      insights.push(`Seu volume de treino caiu ${Math.abs(trainingsDeltaPct)}% vs semana passada.`)
    }
  }

  if (waterAdherenceThisWeek < waterAdherencePreviousWeek) {
    insights.push('Aderencia de agua caiu nesta semana.')
  }

  if (!insights.length) {
    insights.push('Consistencia em alta. Continue com a mesma disciplina.')
  }

  const previousMeasurement = measurementLogsSorted[1] ?? null
  const bmiStatus =
    bmi < 18.5 ? 'underweight' : bmi < 25 ? 'healthy' : bmi < 30 ? 'overweight' : 'obesity'

  return {
    range,
    monthSummary: {
      completedWorkouts: monthWorkouts.length,
      totalTrainingMin: monthDurationMin,
      completedRuns: monthRuns.length,
      totalRunKm: monthRunKm,
      hydrationAdherencePct,
      nutritionConsistencyPct,
      activeDays,
    },
    weeklySummary: {
      completedTrainings,
      targetTrainings: Math.max(1, Math.round((rangeDays / 7) * profile.goals.workoutsPerWeek)),
      totalDurationMin,
      averageCompletionPct,
      completedRuns: rangeRunEntries.length,
      nutritionConsistencyPct: currentWeekNutritionConsistency,
      waterAdherencePct: waterAdherenceThisWeek,
      activeDays: currentWeekDates.filter((dateKey) => {
        const point = chart.find((entry) => entry.date === dateKey)
        return point ? point.completedTrainings > 0 || point.waterMl > 0 : false
      }).length,
    },
    metrics: {
      currentWeightKg: Number(currentWeight.toFixed(1)),
      weightDeltaKg: Number((currentWeight - firstWeight).toFixed(1)),
      workoutsPerWeek,
      avgWaterMl,
      estimatedCalories,
      heightCm: defaultHeightCm,
      bmi,
    },
    bodyComposition: {
      heightCm: defaultHeightCm,
      bmi,
      bmiStatus,
      latestMeasurements: latestMeasurement?.measurements ?? null,
      previousMeasurements: previousMeasurement?.measurements ?? null,
    },
    comparisons: {
      weekly: {
        workouts: comparisonMetric(currentWeekWorkoutCount, previousWeekWorkoutCount),
        cardioSessions: comparisonMetric(currentWeekCardioCount, previousWeekCardioCount),
        nutritionConsistencyPct: comparisonMetric(currentWeekNutritionConsistency, previousWeekNutritionConsistency),
        waterAdherencePct: comparisonMetric(waterAdherenceThisWeek, waterAdherencePreviousWeek),
      },
      monthly: {
        trainingMin: comparisonMetric(monthDurationMin, previousMonthMetrics.trainingMin),
        cardioDistanceKm: comparisonMetric(monthRunKm, previousMonthMetrics.cardioDistanceKm),
        activeDays: comparisonMetric(activeDays, previousMonthMetrics.activeDays),
      },
    },
    strengthPrs,
    strengthWeeklyVolume,
    weightTrend: {
      trend7dKg: trendFrom(7),
      trend30dKg: trendFrom(30),
    },
    measurementSummary: {
      lastUpdatedAt: latestMeasurement?.createdAt ?? null,
      lastUpdatedByLabel,
    },
    insights,
    chart,
    weightHistory: rangeWeightHistory,
    weightLogs: weightLogs
      .slice()
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .slice(0, 20),
    bodyMeasurementLogs: measurementLogsSorted.slice(0, 20),
    recentHistory: workoutHistory.slice(0, 8).map((item) => ({
      sessionId: item.sessionId,
      title: item.title,
      completedAt: item.completedAt,
      durationSec: item.durationSec,
      completedSets: item.completedSets,
      totalSets: item.totalSets,
    })),
    cardioHistory: runHistory.slice(0, 8).map((item) => ({
      sessionId: item.sessionId,
      title: item.activityType === 'walk' ? 'Caminhada' : 'Corrida',
      completedAt: item.endedAt ?? item.startedAt,
      durationSec: item.elapsedSec,
      distanceKm: Number(item.distanceKm.toFixed(2)),
      calories: item.calories,
      paceSecPerKm: item.paceSecPerKm,
      starsEarned: item.starsEarned,
    })),
  }
}

function createGamificationOverview(
  workoutHistory: WorkoutSessionSummary[],
  runHistory: RunSession[],
  studentId = resolveProgressStudentIdFromCurrentUser(),
): GamificationOverview {
  const now = new Date()
  const currentWeekStart = startOfWeek(now)
  const todayKey = toIsoDate(now)
  const nutritionDays = getNutritionDays(toIsoDate(now), studentId)
  const filteredWorkoutHistory = workoutHistory.filter((item) => !item.studentId || item.studentId === studentId)
  const activePersonalId = getActivePersonalIdByStudentId(studentId)
  const activeNutritionistId = getActiveNutritionistIdByStudentId(studentId)
  const workoutsById = new Map(workoutMockRepository.getWorkouts(studentId, { includeInactive: true }).map((workout) => [workout.id, workout]))
  const specialAchievements = getSpecialAchievements(studentId)
  const sessionsByWeek = new Map<string, number>()
  const activityByDay = new Map<string, number>()
  const trainingMinutesByWeek = new Map<string, number>()
  const dayCompletionFlags = new Map<
    string,
    {
      movement: boolean
      water: boolean
      meals: boolean
    }
  >()

  const DAILY_MISSION_REWARDS = {
    movement: 80,
    meals: 60,
    water: 40,
  } as const
  const WEEKLY_MISSION_REWARDS = {
    trainingMinutes: 220,
    hydrationConsistency: 140,
    nutritionAdherence: 180,
  } as const

  filteredWorkoutHistory.forEach((item) => {
    const completedAt = new Date(item.completedAt)
    const key = weekKey(completedAt)
    sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1)
    trainingMinutesByWeek.set(key, (trainingMinutesByWeek.get(key) ?? 0) + Math.round(item.durationSec / 60))

    const dayKey = toIsoDate(completedAt)
    activityByDay.set(dayKey, (activityByDay.get(dayKey) ?? 0) + 1)
    const current = dayCompletionFlags.get(dayKey) ?? {
      movement: false,
      water: false,
      meals: false,
    }
    dayCompletionFlags.set(dayKey, {
      ...current,
      movement: true,
    })
  })

  runHistory.forEach((run) => {
    const completedAt = new Date(run.endedAt ?? run.startedAt)
    const key = weekKey(completedAt)
    sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1)
    trainingMinutesByWeek.set(key, (trainingMinutesByWeek.get(key) ?? 0) + Math.round(run.elapsedSec / 60))

    const dayKey = toIsoDate(completedAt)
    activityByDay.set(dayKey, (activityByDay.get(dayKey) ?? 0) + 1)
    const current = dayCompletionFlags.get(dayKey) ?? {
      movement: false,
      water: false,
      meals: false,
    }
    dayCompletionFlags.set(dayKey, {
      ...current,
      movement: true,
    })
  })

  Object.entries(nutritionDays).forEach(([dateKey, day]) => {
    const mealsDone = day.meals.filter((meal) => meal.status === 'done').length
    const waterGoalDone = day.consumed.waterMl >= day.goals.waterMl
    const mealsGoalDone = day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done')
    const current = dayCompletionFlags.get(dateKey) ?? {
      movement: false,
      water: false,
      meals: false,
    }
    dayCompletionFlags.set(dateKey, {
      ...current,
      water: waterGoalDone,
      meals: mealsGoalDone,
    })

    if (mealsDone > 0) {
      activityByDay.set(dateKey, (activityByDay.get(dateKey) ?? 0) + 1)
    }

    if (waterGoalDone) {
      activityByDay.set(dateKey, (activityByDay.get(dateKey) ?? 0) + 1)
    }

    if (isDayComplete(day)) {
      const completedAt = new Date(`${dateKey}T12:00:00`)
      const key = weekKey(completedAt)
      sessionsByWeek.set(key, (sessionsByWeek.get(key) ?? 0) + 1)
    }
  })

  const prescribedWorkoutCompletions = activePersonalId
    ? filteredWorkoutHistory.filter((item) => {
        if (!item.workoutId) {
          return false
        }
        const workout = workoutsById.get(item.workoutId)
        return Boolean(workout && workout.assignedByPersonalId === activePersonalId)
      })
    : []
  const workoutProfessionalXpBonus = prescribedWorkoutCompletions.length * 35
  const professionalDietDays = activeNutritionistId
    ? Object.values(nutritionDays).filter((day) => day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done'))
    : []
  const dietProfessionalXpBonus = professionalDietDays.length * 25
  const professionalXpTotal = workoutProfessionalXpBonus + dietProfessionalXpBonus

  const workoutXpTotal = filteredWorkoutHistory.reduce((total, item) => total + calculateWorkoutXp(item), 0)
  const runXpTotal = runHistory.reduce((total, run) => total + calculateRunXp(run), 0)
  const nutritionXpTotal = Object.values(nutritionDays).reduce((total, day) => {
    return total + day.meals.filter((meal) => meal.status === 'done').length * 20
  }, 0)
  const hydrationXpTotal = Object.values(nutritionDays).reduce((total, day) => {
    return total + (day.consumed.waterMl >= day.goals.waterMl ? 40 : 0)
  }, 0)

  const weeklyFlags = new Map<
    string,
    {
      hydrationDays: number
      nutritionDays: number
    }
  >()
  dayCompletionFlags.forEach((flags, dayKey) => {
    const key = weekKey(new Date(`${dayKey}T12:00:00`))
    const current = weeklyFlags.get(key) ?? { hydrationDays: 0, nutritionDays: 0 }
    weeklyFlags.set(key, {
      hydrationDays: current.hydrationDays + (flags.water ? 1 : 0),
      nutritionDays: current.nutritionDays + (flags.meals ? 1 : 0),
    })
  })

  const dailyMissionXpTotal = Array.from(dayCompletionFlags.values()).reduce((total, flags) => {
    return (
      total +
      (flags.movement ? DAILY_MISSION_REWARDS.movement : 0) +
      (flags.meals ? DAILY_MISSION_REWARDS.meals : 0) +
      (flags.water ? DAILY_MISSION_REWARDS.water : 0)
    )
  }, 0)
  const weeklyMissionXpTotal = Array.from(weeklyFlags.entries()).reduce((total, [key, flags]) => {
    const trainingMinutes = trainingMinutesByWeek.get(key) ?? 0
    const hasTrainingMinutesMission = trainingMinutes >= 180
    const hasHydrationMission = flags.hydrationDays >= 5
    const hasNutritionMission = flags.nutritionDays >= 4
    return (
      total +
      (hasTrainingMinutesMission ? WEEKLY_MISSION_REWARDS.trainingMinutes : 0) +
      (hasHydrationMission ? WEEKLY_MISSION_REWARDS.hydrationConsistency : 0) +
      (hasNutritionMission ? WEEKLY_MISSION_REWARDS.nutritionAdherence : 0)
    )
  }, 0)
  const missionXpTotal = dailyMissionXpTotal + weeklyMissionXpTotal
  const totalXp = workoutXpTotal + runXpTotal + nutritionXpTotal + hydrationXpTotal + professionalXpTotal + missionXpTotal
  const levelProgress = toLevelProgress(totalXp)

  const weeklyWorkoutProfessionalBonus = prescribedWorkoutCompletions
    .filter((item) => new Date(item.completedAt) >= currentWeekStart)
    .length * 35
  const weeklyDietProfessionalBonus = activeNutritionistId
    ? Object.entries(nutritionDays).reduce((total, [date, day]) => {
        if (date < toIsoDate(currentWeekStart)) {
          return total
        }
        return total + (day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done') ? 25 : 0)
      }, 0)
    : 0

  const weeklyBaseXp = filteredWorkoutHistory
    .filter((item) => new Date(item.completedAt) >= currentWeekStart)
    .reduce((total, item) => total + calculateWorkoutXp(item), 0) +
    runHistory.filter((run) => new Date(run.endedAt ?? run.startedAt) >= currentWeekStart).reduce((total, run) => total + calculateRunXp(run), 0) +
    Object.entries(nutritionDays).reduce((total, [date, day]) => {
      if (date < toIsoDate(currentWeekStart)) {
        return total
      }

      return total + day.meals.filter((meal) => meal.status === 'done').length * 20 + (day.consumed.waterMl >= day.goals.waterMl ? 40 : 0)
    }, 0) +
    weeklyWorkoutProfessionalBonus +
    weeklyDietProfessionalBonus
  const weekFlags = weeklyFlags.get(weekKey(now)) ?? { hydrationDays: 0, nutritionDays: 0 }
  const currentWeekTrainingMinutes = trainingMinutesByWeek.get(weekKey(now)) ?? 0
  const weeklyMissionXp =
    (currentWeekTrainingMinutes >= 180 ? WEEKLY_MISSION_REWARDS.trainingMinutes : 0) +
    (weekFlags.hydrationDays >= 5 ? WEEKLY_MISSION_REWARDS.hydrationConsistency : 0) +
    (weekFlags.nutritionDays >= 4 ? WEEKLY_MISSION_REWARDS.nutritionAdherence : 0)
  const weeklyXp = weeklyBaseXp + weeklyMissionXp

  const todayWorkoutsXp = filteredWorkoutHistory
    .filter((item) => toIsoDate(new Date(item.completedAt)) === todayKey)
    .reduce((total, item) => total + calculateWorkoutXp(item), 0)
  const todayRunsXp = runHistory
    .filter((run) => toIsoDate(new Date(run.endedAt ?? run.startedAt)) === todayKey)
    .reduce((total, run) => total + calculateRunXp(run), 0)
  const todayNutritionDay = nutritionDays[todayKey]
  const todayNutritionXp = todayNutritionDay ? todayNutritionDay.meals.filter((meal) => meal.status === 'done').length * 20 : 0
  const todayHydrationXp = todayNutritionDay && todayNutritionDay.consumed.waterMl >= todayNutritionDay.goals.waterMl ? 40 : 0
  const todayWorkoutProfessionalBonus = prescribedWorkoutCompletions.filter((item) => toIsoDate(new Date(item.completedAt)) === todayKey).length * 35
  const todayDietProfessionalBonus =
    activeNutritionistId && todayNutritionDay && todayNutritionDay.meals.length > 0 && todayNutritionDay.meals.every((meal) => meal.status === 'done')
      ? 25
      : 0
  const todayFlags = dayCompletionFlags.get(todayKey) ?? {
    movement: false,
    water: false,
    meals: false,
  }
  const todayMissionXp =
    (todayFlags.movement ? DAILY_MISSION_REWARDS.movement : 0) +
    (todayFlags.meals ? DAILY_MISSION_REWARDS.meals : 0) +
    (todayFlags.water ? DAILY_MISSION_REWARDS.water : 0)
  const todayXp = todayWorkoutsXp + todayRunsXp + todayNutritionXp + todayHydrationXp + todayWorkoutProfessionalBonus + todayDietProfessionalBonus + todayMissionXp

  let weeklyStreak = 0
  for (let offset = 0; offset < 12; offset += 1) {
    const date = addDays(currentWeekStart, -7 * offset)
    const key = weekKey(date)
    const sessions = sessionsByWeek.get(key) ?? 0

    if (sessions >= 2) {
      weeklyStreak += 1
      continue
    }

    break
  }

  const activityHeatmap = Array.from({ length: 14 }, (_, offset) => {
    const date = addDays(now, -13 + offset)
    const key = toIsoDate(date)

    return {
      date: key,
      value: activityByDay.get(key) ?? 0,
    }
  })

  const weeklySessions = sessionsByWeek.get(weekKey(now)) ?? 0
  const nutritionCompleteDays = Object.values(nutritionDays).filter((day) => isDayComplete(day)).length
  const waterGoalDays = Object.values(nutritionDays).filter((day) => day.consumed.waterMl >= day.goals.waterMl).length
  const totalMealsDone = Object.values(nutritionDays).reduce((total, day) => total + day.meals.filter((meal) => meal.status === 'done').length, 0)
  const monthlyRunDistance = runHistory
    .filter((run) => {
      const date = new Date(run.endedAt ?? run.startedAt)
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    })
    .reduce((total, run) => total + run.distanceKm, 0)
  const missionWorkoutCount = filteredWorkoutHistory.filter((item) => toIsoDate(new Date(item.completedAt)) === todayKey).length +
    runHistory.filter((item) => toIsoDate(new Date(item.endedAt ?? item.startedAt)) === todayKey).length
  const missionMealsDone = todayNutritionDay?.meals.filter((meal) => meal.status === 'done').length ?? 0
  const missionMealsTarget = todayNutritionDay?.meals.length ?? 0
  const missionWaterCurrent = todayNutritionDay?.consumed.waterMl ?? 0
  const missionWaterTarget = todayNutritionDay?.goals.waterMl ?? 2500
  const dailyMissions = [
    {
      id: 'mission-train',
      title: 'Movimento do dia',
      description: 'Conclua 1 treino ou corrida hoje.',
      cadence: 'daily' as const,
      current: missionWorkoutCount,
      target: 1,
      rewardXp: DAILY_MISSION_REWARDS.movement,
      completed: missionWorkoutCount >= 1,
    },
    {
      id: 'mission-meals',
      title: 'Refeicoes completas',
      description: 'Finalize todas as refeicoes planejadas do dia.',
      cadence: 'daily' as const,
      current: missionMealsDone,
      target: Math.max(missionMealsTarget, 1),
      rewardXp: DAILY_MISSION_REWARDS.meals,
      completed: missionMealsTarget > 0 && missionMealsDone >= missionMealsTarget,
    },
    {
      id: 'mission-water',
      title: 'Meta de hidratacao',
      description: 'Atinja a meta diaria de agua.',
      cadence: 'daily' as const,
      current: missionWaterCurrent,
      target: missionWaterTarget,
      rewardXp: DAILY_MISSION_REWARDS.water,
      completed: missionWaterCurrent >= missionWaterTarget,
    },
  ]
  const weeklyMissions = [
    {
      id: 'mission-weekly-training-minutes',
      title: 'Volume de treino semanal',
      description: 'Acumule 180 min entre treino e corrida.',
      cadence: 'weekly' as const,
      current: currentWeekTrainingMinutes,
      target: 180,
      rewardXp: WEEKLY_MISSION_REWARDS.trainingMinutes,
      completed: currentWeekTrainingMinutes >= 180,
      rewardBadgeId: 'consistency',
    },
    {
      id: 'mission-weekly-hydration',
      title: 'Hidratacao consistente',
      description: 'Bata a meta de agua em 5 dias da semana.',
      cadence: 'weekly' as const,
      current: weekFlags.hydrationDays,
      target: 5,
      rewardXp: WEEKLY_MISSION_REWARDS.hydrationConsistency,
      completed: weekFlags.hydrationDays >= 5,
      rewardBadgeId: 'hydration-master',
    },
    {
      id: 'mission-weekly-nutrition',
      title: 'Aderencia alimentar',
      description: 'Conclua todas as refeicoes em 4 dias da semana.',
      cadence: 'weekly' as const,
      current: weekFlags.nutritionDays,
      target: 4,
      rewardXp: WEEKLY_MISSION_REWARDS.nutritionAdherence,
      completed: weekFlags.nutritionDays >= 4,
      rewardBadgeId: 'nutrition-focus',
    },
  ]
  const hasPerfectSession = filteredWorkoutHistory.some((item) => item.completedSets >= item.totalSets)
  const prescribedPerfectSession = prescribedWorkoutCompletions.some((item) => item.completedSets >= item.totalSets)
  const last7Days = Array.from({ length: 7 }, (_, index) => toIsoDate(addDays(now, -index)))
  const hasPerfectDietWeek =
    Boolean(activeNutritionistId) &&
    last7Days.every((date) => {
      const day = nutritionDays[date]
      return Boolean(day && day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done'))
    })

  const achievementsByCategory: GamificationOverview['achievementsByCategory'] = {
    WORKOUT: [
      {
        id: 'first-workout',
        title: 'Primeiro treino',
        description: 'Conclua sua primeira sessao.',
        icon: 'trophy',
        unlocked: workoutHistory.length + runHistory.length >= 1,
        category: 'WORKOUT',
      },
      {
        id: 'consistency',
        title: 'Consistencia semanal',
        description: 'Complete 3 atividades na semana atual.',
        icon: 'flame',
        unlocked: weeklySessions >= 3,
        category: 'WORKOUT',
        currentProgress: weeklySessions,
        requiredProgress: 3,
      },
      {
        id: 'perfect-sets',
        title: 'Series perfeitas',
        description: 'Complete todas as series de uma sessao.',
        icon: 'target',
        unlocked: hasPerfectSession,
        category: 'WORKOUT',
      },
      {
        id: 'pro-prescription-perfect-workout',
        title: 'Treino 100% conforme prescricao',
        description: 'Complete um treino com todas as series dentro do plano do personal.',
        icon: 'target',
        unlocked: prescribedPerfectSession,
        category: 'WORKOUT',
      },
    ],
    NUTRITION: [
      {
        id: 'nutrition-focus',
        title: 'Foco nutricional',
        description: 'Conclua 10 dias de nutricao completa.',
        icon: 'target',
        unlocked: nutritionCompleteDays >= 10,
        category: 'NUTRITION',
        currentProgress: nutritionCompleteDays,
        requiredProgress: 10,
      },
      {
        id: 'meal-checker',
        title: 'Check-in das refeicoes',
        description: 'Registre 40 refeicoes.',
        icon: 'star',
        unlocked: totalMealsDone >= 40,
        category: 'NUTRITION',
        currentProgress: totalMealsDone,
        requiredProgress: 40,
      },
      {
        id: 'pro-perfect-diet-week',
        title: 'Semana perfeita de dieta',
        description: 'Conclua 7 dias seguidos de dieta dentro do plano do nutricionista.',
        icon: 'star',
        unlocked: hasPerfectDietWeek,
        category: 'NUTRITION',
      },
    ],
    HABIT: [
      {
        id: 'streak-runner',
        title: 'Streak semanal',
        description: 'Mantenha 4 semanas seguidas com 2+ atividades.',
        icon: 'star',
        unlocked: weeklyStreak >= 4,
        category: 'HABIT',
        currentProgress: weeklyStreak,
        requiredProgress: 4,
      },
      {
        id: 'hydration-master',
        title: 'Hidratacao mestre',
        description: 'Bata a meta de agua em 7 dias.',
        icon: 'flame',
        unlocked: waterGoalDays >= 7,
        category: 'HABIT',
        currentProgress: waterGoalDays,
        requiredProgress: 7,
      },
      ...specialAchievements.map((achievement) => ({
        id: `special-${achievement.id}`,
        title: achievement.title,
        description: achievement.description,
        icon: 'trophy' as const,
        unlocked: true,
        category: 'HABIT' as const,
      })),
    ],
    RUN: [
      {
        id: 'runner-25',
        title: 'Corredor 25K',
        description: 'Corra 25 km no mes atual.',
        icon: 'trophy',
        unlocked: monthlyRunDistance >= 25,
        category: 'RUN',
        currentProgress: Number(monthlyRunDistance.toFixed(1)),
        requiredProgress: 25,
      },
    ],
  }
  const badges = Object.values(achievementsByCategory).flat()

  const parseMealCompletedAt = (date: string, meal: Meal) => {
    if (meal.completedAt) {
      return meal.completedAt
    }
    const [hours, minutes] = meal.time.split(':')
    const dateTime = new Date(`${date}T${hours ?? '12'}:${minutes ?? '00'}:00`)
    return dateTime.toISOString()
  }

  const xpLedger: GamificationOverview['xpLedger'] = []

  filteredWorkoutHistory.forEach((item) => {
    xpLedger.push({
      id: `workout:${item.sessionId}`,
      title: 'Treino concluido',
      description: item.title,
      eventType: 'workout',
      xp: calculateWorkoutXp(item),
      occurredAt: item.completedAt,
    })
  })

  runHistory.forEach((run) => {
    const occurredAt = run.endedAt ?? run.startedAt
    xpLedger.push({
      id: `run:${run.sessionId}`,
      title: 'Corrida registrada',
      description: `${run.distanceKm.toFixed(1)} km`,
      eventType: 'run',
      xp: calculateRunXp(run),
      occurredAt,
    })
  })

  Object.entries(nutritionDays).forEach(([date, day]) => {
    day.meals
      .filter((meal) => meal.status === 'done')
      .forEach((meal) => {
        xpLedger.push({
          id: `meal:${date}:${meal.id}`,
          title: 'Refeicao registrada',
          description: meal.name,
          eventType: 'nutrition',
          xp: 20,
          occurredAt: parseMealCompletedAt(date, meal),
        })
      })

    if (day.consumed.waterMl >= day.goals.waterMl) {
      const at = day.waterLog.entries[day.waterLog.entries.length - 1]?.at ?? new Date(`${date}T21:00:00`).toISOString()
      xpLedger.push({
        id: `hydration:${date}`,
        title: 'Meta de agua batida',
        description: `${day.consumed.waterMl}ml de ${day.goals.waterMl}ml`,
        eventType: 'hydration',
        xp: 40,
        occurredAt: at,
      })
    }
  })

  prescribedWorkoutCompletions.forEach((item) => {
    xpLedger.push({
      id: `bonus:workout:${item.sessionId}`,
      title: 'Bonus do personal',
      description: 'Treino dentro da prescricao',
      eventType: 'bonus',
      xp: 35,
      occurredAt: item.completedAt,
    })
  })

  if (activeNutritionistId) {
    Object.entries(nutritionDays).forEach(([date, day]) => {
      const completed = day.meals.length > 0 && day.meals.every((meal) => meal.status === 'done')
      if (!completed) {
        return
      }
      xpLedger.push({
        id: `bonus:nutrition:${date}`,
        title: 'Bonus do nutricionista',
        description: 'Aderencia completa da dieta',
        eventType: 'bonus',
        xp: 25,
        occurredAt: new Date(`${date}T22:00:00`).toISOString(),
      })
    })
  }

  dayCompletionFlags.forEach((flags, dayKey) => {
    const occurredAt = new Date(`${dayKey}T23:59:00`).toISOString()
    if (flags.movement) {
      xpLedger.push({
        id: `mission-daily:movement:${dayKey}`,
        title: 'Missao diaria: movimento',
        description: 'Conclua 1 treino ou corrida',
        eventType: 'mission',
        xp: DAILY_MISSION_REWARDS.movement,
        occurredAt,
      })
    }
    if (flags.meals) {
      xpLedger.push({
        id: `mission-daily:meals:${dayKey}`,
        title: 'Missao diaria: refeicoes',
        description: 'Concluir refeicoes planejadas',
        eventType: 'mission',
        xp: DAILY_MISSION_REWARDS.meals,
        occurredAt,
      })
    }
    if (flags.water) {
      xpLedger.push({
        id: `mission-daily:water:${dayKey}`,
        title: 'Missao diaria: hidratacao',
        description: 'Bater meta de agua',
        eventType: 'mission',
        xp: DAILY_MISSION_REWARDS.water,
        occurredAt,
      })
    }
  })

  weeklyFlags.forEach((flags, key) => {
    const weekStart = new Date(`${key}T12:00:00`)
    const occurredAt = addDays(startOfWeek(weekStart), 6).toISOString()
    const trainingMinutes = trainingMinutesByWeek.get(key) ?? 0
    if (trainingMinutes >= 180) {
      xpLedger.push({
        id: `mission-weekly:training:${key}`,
        title: 'Missao semanal: volume',
        description: '180 minutos entre treino e corrida',
        eventType: 'mission',
        xp: WEEKLY_MISSION_REWARDS.trainingMinutes,
        occurredAt,
      })
    }
    if (flags.hydrationDays >= 5) {
      xpLedger.push({
        id: `mission-weekly:hydration:${key}`,
        title: 'Missao semanal: hidratacao',
        description: 'Meta de agua em 5 dias',
        eventType: 'mission',
        xp: WEEKLY_MISSION_REWARDS.hydrationConsistency,
        occurredAt,
      })
    }
    if (flags.nutritionDays >= 4) {
      xpLedger.push({
        id: `mission-weekly:nutrition:${key}`,
        title: 'Missao semanal: nutricao',
        description: 'Aderencia completa em 4 dias',
        eventType: 'mission',
        xp: WEEKLY_MISSION_REWARDS.nutritionAdherence,
        occurredAt,
      })
    }
  })

  xpLedger.sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))

  return {
    level: levelProgress.level,
    totalXp,
    currentLevelXp: levelProgress.currentLevelXp,
    nextLevelXp: levelProgress.nextLevelXp,
    weeklyStreak,
    weeklyXp,
    weeklyXpTarget: 1000,
    todayXp,
    xpBreakdown: {
      workout: workoutXpTotal,
      nutrition: nutritionXpTotal,
      hydration: hydrationXpTotal,
      run: runXpTotal,
      professional: professionalXpTotal,
      mission: missionXpTotal,
      total: totalXp,
    },
    dailyMissions,
    weeklyMissions,
    dailyResetAt: startOfNextDay(now).toISOString(),
    weeklyResetAt: startOfNextWeek(now).toISOString(),
    achievementsByCategory,
    xpLedger: xpLedger.slice(0, 60),
    activityHeatmap,
    badges,
  }
}

function calculateDayConsumed(day: NutritionDay) {
  const consumedFromMeals = day.meals.reduce(
    (acc, meal) => {
      if (meal.status !== 'done') {
        return acc
      }

      return {
        calories: acc.calories + meal.targetMacros.calories,
        protein: acc.protein + meal.targetMacros.protein,
        carbs: acc.carbs + meal.targetMacros.carbs,
        fat: acc.fat + meal.targetMacros.fat,
      }
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  )

  const waterMl = day.waterLog.entries.reduce((total, entry) => total + entry.ml, 0)

  return {
    ...consumedFromMeals,
    waterMl,
  }
}

function recalculateNutritionDay(day: NutritionDay): NutritionDay {
  return {
    ...day,
    consumed: calculateDayConsumed(day),
  }
}

function isDayComplete(day: NutritionDay) {
  const hasMeals = day.meals.length > 0
  const allMealsDone = hasMeals && day.meals.every((meal) => meal.status === 'done')
  const waterDone = day.consumed.waterMl >= day.goals.waterMl

  return allMealsDone && waterDone
}

function applyProfileGoalsToNutritionDays(daysByDate: NutritionDaysMap, profile: ProfileSettings) {
  const todayKey = toIsoDate(new Date())
  let changed = false
  const nextDays: NutritionDaysMap = {}

  Object.entries(daysByDate).forEach(([dateKey, day]) => {
    if (dateKey >= todayKey && day.goals.waterMl !== profile.goals.waterMlDaily) {
      nextDays[dateKey] = recalculateNutritionDay({
        ...day,
        goals: {
          ...day.goals,
          waterMl: profile.goals.waterMlDaily,
        },
      })
      changed = true
      return
    }

    nextDays[dateKey] = day
  })

  return {
    changed,
    daysByDate: nextDays,
  }
}

type NutritionDaysByStudent = Record<string, NutritionDaysMap>

type StoredNutritionPlanMeal = {
  id: string
  name: string
  time: string
  targetMacros: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  note?: string
}

type StoredNutritionPlan = {
  id: string
  studentId: string
  nutritionistId: string
  title: string
  dailyCalories: number
  macroDistribution: {
    proteinPct: number
    carbsPct: number
    fatPct: number
  }
  meals: StoredNutritionPlanMeal[]
  isActive: boolean
  createdAt: string
}

type NutritionPlanByStudent = Record<string, StoredNutritionPlan[]>

function getNutritionDaysMap() {
  const stored = storage.get<NutritionDaysByStudent>(NUTRITION_DAYS_BY_STUDENT_STORAGE_KEY) ?? {}
  const legacy = storage.get<NutritionDaysMap>('fitquest.nutrition.days')

  if (legacy && Object.keys(legacy).length > 0 && !stored['current-user']) {
    const migrated: NutritionDaysByStudent = {
      ...stored,
      'current-user': legacy,
    }
    storage.set(NUTRITION_DAYS_BY_STUDENT_STORAGE_KEY, migrated)
    return migrated
  }

  return stored
}

function saveNutritionDaysMap(map: NutritionDaysByStudent) {
  storage.set(NUTRITION_DAYS_BY_STUDENT_STORAGE_KEY, map)
}

function getNutritionPlansMap() {
  return storage.get<NutritionPlanByStudent>(NUTRITION_PLAN_BY_STUDENT_STORAGE_KEY) ?? {}
}

function saveNutritionPlansMap(map: NutritionPlanByStudent) {
  storage.set(NUTRITION_PLAN_BY_STUDENT_STORAGE_KEY, map)
}

function getActiveNutritionPlan(studentId: string) {
  const plans = getNutritionPlansMap()[studentId] ?? []
  return plans.find((plan) => plan.isActive) ?? null
}

function toDietMealsFromPlan(plan: StoredNutritionPlan): Meal[] {
  return plan.meals.map((meal, index) => ({
    id: `${meal.id}-${index + 1}`,
    name: meal.name,
    time: meal.time,
    status: 'pending',
    targetMacros: {
      calories: meal.targetMacros.calories,
      protein: meal.targetMacros.protein,
      carbs: meal.targetMacros.carbs,
      fat: meal.targetMacros.fat,
    },
    items: [
      {
        id: `${meal.id}-item-1`,
        label: meal.note || `${meal.name} conforme plano do nutricionista`,
        qty: '1 porcao',
      },
    ],
    note: meal.note ?? '',
  }))
}

function applyNutritionPlanToUpcomingDays(daysByDate: NutritionDaysMap, studentId: string) {
  const activePlan = getActiveNutritionPlan(studentId)
  if (!activePlan) {
    return daysByDate
  }

  const todayKey = toIsoDate(new Date())
  let changed = false
  const nextDays: NutritionDaysMap = {}
  const plannedMeals = toDietMealsFromPlan(activePlan)

  Object.entries(daysByDate).forEach(([dateKey, day]) => {
    if (dateKey < todayKey) {
      nextDays[dateKey] = day
      return
    }

    const nextDay = recalculateNutritionDay({
      ...day,
      goals: {
        ...day.goals,
        calories: activePlan.dailyCalories,
      },
      meals: plannedMeals.map((meal) => ({
        ...meal,
        id: `${meal.id}-${dateKey}`,
      })),
    })

    if (JSON.stringify(day.meals) !== JSON.stringify(nextDay.meals) || day.goals.calories !== nextDay.goals.calories) {
      changed = true
    }
    nextDays[dateKey] = nextDay
  })

  return changed ? nextDays : daysByDate
}

function getNutritionDays(anchorDate = toIsoDate(new Date()), studentId = resolveNutritionStudentIdFromCurrentUser()) {
  const map = getNutritionDaysMap()
  const cached = map[studentId]
  const profile = getProfileSettings()
  const baseDays = cached && Object.keys(cached).length > 0 ? cached : createNutritionMockDays(anchorDate, profile.goals.waterMlDaily)
  const normalized = applyProfileGoalsToNutritionDays(baseDays, profile)
  const planned = applyNutritionPlanToUpcomingDays(normalized.daysByDate, studentId)

  if (!cached || normalized.changed || planned !== normalized.daysByDate) {
    saveNutritionDays(planned, studentId)
  }

  return planned
}

function saveNutritionDays(daysByDate: NutritionDaysMap, studentId = resolveNutritionStudentIdFromCurrentUser()) {
  const map = getNutritionDaysMap()
  saveNutritionDaysMap({
    ...map,
    [studentId]: daysByDate,
  })
}

function createProgressWeightSeed(anchorDate: string) {
  const seedDate = new Date(`${anchorDate}T12:00:00`)
  const seed: ProgressWeightLog[] = []
  let current = 84.4

  for (let offset = 89; offset >= 0; offset -= 1) {
    const date = addDays(seedDate, -offset)
    current += (Math.random() - 0.55) * 0.14

    seed.push({
      id: `weight-${toIsoDate(date)}`,
      studentId: 'student-1',
      date: toIsoDate(date),
      weightKg: Number(Math.max(current, 48).toFixed(1)),
      recordedByRole: 'STUDENT',
      recordedById: 'student-1',
      createdAt: new Date(date).toISOString(),
    })
  }

  return seed
}

function createBodyMeasurementSeed(anchorDate: string) {
  const seedDate = new Date(`${anchorDate}T12:00:00`)
  return Array.from({ length: 6 }, (_, index) => {
    const date = addDays(seedDate, -(index * 14))
    return {
      id: `measurement-${toIsoDate(date)}`,
      studentId: 'student-1',
      date: toIsoDate(date),
      measurements: {
        chestCm: Number((99 - index * 0.2).toFixed(1)),
        waistCm: Number((86 - index * 0.5).toFixed(1)),
        hipsCm: Number((98 - index * 0.2).toFixed(1)),
        armCm: Number((34 + index * 0.1).toFixed(1)),
        thighCm: Number((56 - index * 0.1).toFixed(1)),
      },
      recordedByRole: 'STUDENT' as const,
      recordedById: 'student-1',
      createdAt: new Date(date).toISOString(),
    }
  })
}

type ProgressWeightLogsByStudent = Record<string, ProgressWeightLog[]>
type BodyMeasurementLogsByStudent = Record<string, BodyMeasurementLog[]>

function getProgressWeightLogsMap() {
  const stored = storage.get<ProgressWeightLogsByStudent>(PROGRESS_WEIGHT_LOGS_BY_STUDENT_STORAGE_KEY) ?? {}
  const legacy = storage.get<ProgressWeightEntry[]>('fitquest.progress.weight.history')

  if (legacy && legacy.length > 0 && !stored['current-user']) {
    const migrated: ProgressWeightLogsByStudent = {
      ...stored,
      'current-user': legacy.map((entry) => ({
        id: entry.id,
        studentId: 'current-user',
        date: entry.date,
        weightKg: entry.weightKg,
        recordedByRole: 'STUDENT',
        recordedById: 'current-user',
        createdAt: `${entry.date}T12:00:00.000Z`,
      })),
    }
    storage.set(PROGRESS_WEIGHT_LOGS_BY_STUDENT_STORAGE_KEY, migrated)
    return migrated
  }

  return stored
}

function saveProgressWeightLogsMap(map: ProgressWeightLogsByStudent) {
  storage.set(PROGRESS_WEIGHT_LOGS_BY_STUDENT_STORAGE_KEY, map)
}

function getBodyMeasurementLogsMap() {
  return storage.get<BodyMeasurementLogsByStudent>(PROGRESS_MEASUREMENTS_LOGS_BY_STUDENT_STORAGE_KEY) ?? {}
}

function saveBodyMeasurementLogsMap(map: BodyMeasurementLogsByStudent) {
  storage.set(PROGRESS_MEASUREMENTS_LOGS_BY_STUDENT_STORAGE_KEY, map)
}

function getProgressWeightLogs(studentId: string, anchorDate = toIsoDate(new Date())) {
  const map = getProgressWeightLogsMap()
  const logs = map[studentId]

  if (logs && logs.length > 0) {
    return logs
  }

  const seeded = createProgressWeightSeed(anchorDate).map((entry) => ({
    ...entry,
    studentId,
    recordedById: studentId,
  }))
  saveProgressWeightLogsMap({
    ...map,
    [studentId]: seeded,
  })
  return seeded
}

function saveProgressWeightLogs(studentId: string, logs: ProgressWeightLog[]) {
  const map = getProgressWeightLogsMap()
  saveProgressWeightLogsMap({
    ...map,
    [studentId]: logs,
  })
}

function getBodyMeasurementLogs(studentId: string, anchorDate = toIsoDate(new Date())) {
  const map = getBodyMeasurementLogsMap()
  const logs = map[studentId]

  if (logs && logs.length > 0) {
    return logs
  }

  const seeded = createBodyMeasurementSeed(anchorDate).map((entry) => ({
    ...entry,
    studentId,
    recordedById: studentId,
  }))
  saveBodyMeasurementLogsMap({
    ...map,
    [studentId]: seeded,
  })
  return seeded
}

function saveBodyMeasurementLogs(studentId: string, logs: BodyMeasurementLog[]) {
  const map = getBodyMeasurementLogsMap()
  saveBodyMeasurementLogsMap({
    ...map,
    [studentId]: logs,
  })
}

function getSpecialAchievementsMap() {
  return storage.get<Record<string, ProfessionalGrantedAchievement[]>>(GAMIFICATION_SPECIAL_ACHIEVEMENTS_BY_STUDENT_STORAGE_KEY) ?? {}
}

function saveSpecialAchievementsMap(map: Record<string, ProfessionalGrantedAchievement[]>) {
  storage.set(GAMIFICATION_SPECIAL_ACHIEVEMENTS_BY_STUDENT_STORAGE_KEY, map)
}

function getSpecialAchievements(studentId: string) {
  const map = getSpecialAchievementsMap()
  return map[studentId] ?? []
}

function grantSpecialAchievement(input: {
  studentId: string
  title: string
  description: string
  grantedByRole: 'PERSONAL' | 'NUTRITIONIST'
  grantedById: string
}) {
  const map = getSpecialAchievementsMap()
  const current = map[input.studentId] ?? []
  const normalizedTitle = input.title.trim() || 'Conquista especial'
  const normalizedDescription = input.description.trim() || 'Conquista liberada por profissional.'
  const entityKey = `${input.grantedByRole}:${input.grantedById}:${normalizedTitle.toLowerCase()}`

  if (current.some((achievement) => `${achievement.grantedByRole}:${achievement.grantedById}:${achievement.title.toLowerCase()}` === entityKey)) {
    return null
  }

  const achievement: ProfessionalGrantedAchievement = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    title: normalizedTitle,
    description: normalizedDescription,
    grantedByRole: input.grantedByRole,
    grantedById: input.grantedById,
    grantedAt: new Date().toISOString(),
  }

  saveSpecialAchievementsMap({
    ...map,
    [input.studentId]: [achievement, ...current].slice(0, 20),
  })

  return achievement
}

function toEffectiveWeightHistory(logs: ProgressWeightLog[]) {
  const latestByDate = new Map<string, ProgressWeightLog>()
  logs
    .slice()
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
    .forEach((log) => {
      latestByDate.set(log.date, log)
    })

  return [...latestByDate.values()]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map<ProgressWeightEntry>((log) => ({
      id: log.id,
      date: log.date,
      weightKg: log.weightKg,
    }))
}

function getStoredNotifications() {
  return storage.get<NotificationItem[]>('fitquest.notifications.inbox.v1') ?? []
}

function saveStoredNotifications(items: NotificationItem[]) {
  storage.set('fitquest.notifications.inbox.v1', items)
}

function resolveNotificationRecipientStudentId() {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role === 'PERSONAL') {
    const linkedStudentIds = getLinkedStudentIdsByPersonal(currentUser.id)
    return linkedStudentIds[0] ?? null
  }

  if (currentUser.role === 'NUTRITIONIST') {
    const linkedStudentIds = getLinkedStudentIdsByNutritionist(currentUser.id)
    return linkedStudentIds[0] ?? null
  }

  return currentUser.id
}

function upsertNotification(
  notification: Pick<NotificationItem, 'entityKey' | 'title' | 'description' | 'at' | 'type'> &
    Partial<
      Pick<
        NotificationItem,
        'trigger' | 'urgency' | 'origin' | 'action' | 'channels' | 'delivery' | 'expiresAt' | 'recipientStudentId' | 'senderRole'
      >
    > & {
    id?: string
    recipientStudentId?: string
    senderRole?: NotificationItem['senderRole']
  },
) {
  const profile = getProfileSettings()

  if (!profile.preferences.notificationsEnabled && !notification.recipientStudentId) {
    return getStoredNotifications()
  }

  const current = getStoredNotifications()
  const existingIndex = current.findIndex((item) => item.entityKey === notification.entityKey)

  if (existingIndex >= 0) {
    return current
  }

  const next = [
    {
      id: notification.id ?? crypto.randomUUID(),
      entityKey: notification.entityKey,
      title: notification.title,
      description: notification.description,
      at: notification.at,
      type: notification.type,
      trigger: notification.trigger ?? 'system',
      urgency: notification.urgency ?? 'opportunity',
      origin: notification.origin ?? 'system',
      action: notification.action,
      channels: notification.channels ?? ['in_app'],
      delivery: notification.delivery,
      expiresAt: notification.expiresAt,
      recipientStudentId: notification.recipientStudentId,
      senderRole: notification.senderRole,
      read: false,
    },
    ...current,
  ]
  saveStoredNotifications(next)
  return next
}

function buildNotificationsInbox(items: NotificationItem[]): NotificationsInbox {
  const recipientStudentId = resolveNotificationRecipientStudentId()
  const filtered = recipientStudentId
    ? items.filter((item) => !item.recipientStudentId || item.recipientStudentId === recipientStudentId)
    : items
  const sorted = [...filtered].sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
  return {
    unreadCount: sorted.filter((item) => !item.read).length,
    items: sorted,
  }
}

function ensureAutomaticNotifications(workoutHistory: WorkoutSessionSummary[], runHistory: RunSession[]) {
  const now = new Date()
  const todayKey = toIsoDate(now)
  const recipientStudentId = resolveNotificationRecipientStudentId()
  if (!recipientStudentId) {
    return
  }
  const filteredWorkoutHistory = workoutHistory.filter((item) => !item.studentId || item.studentId === recipientStudentId)
  const nutritionDays = getNutritionDays(todayKey, recipientStudentId)
  const todayDay = nutritionDays[todayKey]
  const gamification = createGamificationOverview(filteredWorkoutHistory, runHistory, recipientStudentId)
  const profile = getProfileSettings()

  if (!profile.preferences.notificationsEnabled) {
    return
  }

  if (todayDay && todayDay.consumed.waterMl >= todayDay.goals.waterMl) {
    upsertNotification({
      entityKey: `goal-water-${todayKey}`,
      title: 'Meta batida',
      description: `Voce atingiu ${todayDay.consumed.waterMl} ml de agua hoje.`,
      at: new Date().toISOString(),
      type: 'goal',
      trigger: 'goal_reached',
      urgency: 'celebration',
      origin: 'hydration',
      action: {
        label: 'Ver nutricao',
        route: '/tabs/nutrition',
        intent: 'open_nutrition',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  } else if (todayDay && todayDay.goals.waterMl > todayDay.consumed.waterMl) {
    upsertNotification({
      entityKey: `hydration-incomplete-${todayKey}`,
      title: `Faltam ${todayDay.goals.waterMl - todayDay.consumed.waterMl} ml para sua meta`,
      description: 'Registrar agua agora ajuda a proteger a rotina do dia e a consistencia semanal.',
      at: new Date().toISOString(),
      type: 'goal',
      trigger: 'water_incomplete',
      urgency: todayDay.goals.waterMl - todayDay.consumed.waterMl <= 600 ? 'attention' : 'opportunity',
      origin: 'hydration',
      action: {
        label: 'Adicionar agua',
        route: '/tabs/nutrition',
        intent: 'open_hydration',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  }

  gamification.dailyMissions
    .filter((mission) => mission.completed)
    .forEach((mission) => {
      upsertNotification({
        entityKey: `mission-${mission.id}-${todayKey}`,
        title: 'Missao concluida',
        description: `${mission.title} (+${mission.rewardXp} XP).`,
        at: new Date().toISOString(),
        type: 'mission',
        trigger: 'mission_completed',
        urgency: 'celebration',
        origin: 'gamification',
        action: {
          label: 'Ver gamificacao',
          route: '/tabs/gamification',
          intent: 'open_gamification',
        },
        recipientStudentId,
        senderRole: 'SYSTEM',
      })
    })

  gamification.badges
    .filter((badge) => badge.unlocked)
    .forEach((badge) => {
      upsertNotification({
        entityKey: `badge-${badge.id}`,
        title: 'Nova conquista desbloqueada',
        description: `${badge.title}: ${badge.description}`,
        at: new Date().toISOString(),
        type: 'badge',
        trigger: 'achievement_unlocked',
        urgency: 'celebration',
        origin: 'gamification',
        action: {
          label: 'Ver conquista',
          route: '/tabs/gamification',
          intent: 'open_achievement',
        },
        recipientStudentId,
        senderRole: 'SYSTEM',
      })
    })

  const hasWorkoutToday = filteredWorkoutHistory.some((item) => toIsoDate(new Date(item.completedAt)) === todayKey)
  const hasRunToday = runHistory.some((item) => toIsoDate(new Date(item.endedAt ?? item.startedAt)) === todayKey)
  const pendingMeals = todayDay?.meals.filter((meal) => meal.status !== 'done').length ?? 0
  if (profile.preferences.remindersEnabled && !hasWorkoutToday && !hasRunToday) {
    upsertNotification({
      entityKey: `workout-pending-${todayKey}`,
      title: 'Treino pendente',
      description: 'Seu treino de hoje ainda nao foi concluido.',
      at: new Date().toISOString(),
      type: 'workout',
      trigger: 'workout_pending',
      urgency: 'attention',
      origin: 'workout',
      action: {
        label: 'Iniciar treino',
        route: '/tabs/workouts/session',
        intent: 'open_workout_session',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  }

  if (profile.preferences.remindersEnabled && pendingMeals > 0) {
    upsertNotification({
      entityKey: `meal-pending-${todayKey}`,
      title: pendingMeals === 1 ? '1 refeicao ainda nao foi registrada' : `${pendingMeals} refeicoes aguardam registro`,
      description: 'Fechar o plano alimentar do dia melhora sua aderencia e protege a gamificacao.',
      at: new Date().toISOString(),
      type: 'nutrition',
      trigger: 'meal_pending',
      urgency: pendingMeals >= 2 ? 'attention' : 'opportunity',
      origin: 'nutrition',
      action: {
        label: 'Abrir nutricao',
        route: '/tabs/nutrition',
        intent: 'open_nutrition',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  }

  if (profile.preferences.remindersEnabled && gamification.weeklyStreak >= 2 && !hasWorkoutToday && (todayDay?.consumed.waterMl ?? 0) < (todayDay?.goals.waterMl ?? 0)) {
    upsertNotification({
      entityKey: `streak-risk-${todayKey}`,
      title: 'Seu streak esta em risco hoje',
      description: 'Fazer pelo menos uma acao-chave agora evita perder a sequencia acumulada.',
      at: new Date().toISOString(),
      type: 'gamification',
      trigger: 'streak_risk',
      urgency: 'critical',
      origin: 'gamification',
      action: {
        label: 'Ver tarefas do dia',
        route: '/tabs/student',
        intent: 'open_home',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  }

  const nextLevelRemaining = Math.max(gamification.nextLevelXp - gamification.currentLevelXp, 0)
  if (nextLevelRemaining <= 40) {
    upsertNotification({
      entityKey: `level-up-${todayKey}`,
      title: nextLevelRemaining === 0 ? 'Voce subiu de nivel' : `Mais ${nextLevelRemaining} XP para subir de nivel`,
      description:
        nextLevelRemaining === 0
          ? 'Seu progresso virou nivel novo. Continue acumulando estrelas para manter o ritmo.'
          : 'Voce esta muito perto do proximo nivel e da proxima faixa de recompensas.',
      at: new Date().toISOString(),
      type: 'gamification',
      trigger: 'level_up',
      urgency: nextLevelRemaining === 0 ? 'celebration' : 'opportunity',
      origin: 'gamification',
      action: {
        label: 'Ver gamificacao',
        route: '/tabs/gamification',
        intent: 'open_gamification',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  }

  const assignedWorkout = workoutMockRepository
    .getWorkouts(recipientStudentId, { includeInactive: true })
    .find((workout) => workout.date === todayKey)
  if (assignedWorkout) {
    upsertNotification({
      entityKey: `workout-assigned-${assignedWorkout.id}-${todayKey}`,
      title: 'Novo treino atribuido',
      description: `${assignedWorkout.title} foi organizado para o seu dia de hoje.`,
      at: new Date().toISOString(),
      type: 'workout',
      trigger: 'workout_assigned',
      urgency: 'opportunity',
      origin: 'workout',
      action: {
        label: 'Ver treino',
        route: '/tabs/workouts',
        intent: 'open_workouts',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  }

  if (todayDay && todayDay.meals.length > 0) {
    upsertNotification({
      entityKey: `nutrition-plan-updated-${todayKey}`,
      title: 'Plano alimentar atualizado',
      description: `Seu plano de hoje tem ${todayDay.meals.length} refeicoes prontas para acompanhamento.`,
      at: new Date().toISOString(),
      type: 'nutrition',
      trigger: 'nutrition_plan_updated',
      urgency: 'opportunity',
      origin: 'nutrition',
      action: {
        label: 'Abrir plano',
        route: '/tabs/nutrition',
        intent: 'open_nutrition_plan',
      },
      recipientStudentId,
      senderRole: 'SYSTEM',
    })
  }
}

function getNotificationsInbox() {
  const profile = getProfileSettings()

  if (!profile.preferences.notificationsEnabled) {
    return {
      unreadCount: 0,
      items: [],
    }
  }

  const workoutHistory = workoutSessionMockRepository.getHistory()
  const runHistory = runMockRepository.getHistory()
  ensureAutomaticNotifications(workoutHistory, runHistory)
  return buildNotificationsInbox(getStoredNotifications())
}

function upsertNutritionDay(
  date: string,
  updater: (currentDay: NutritionDay) => NutritionDay,
  request?: HttpRequestContext,
  studentId = resolveNutritionStudentIdFromCurrentUser(),
): NutritionDay {
  const daysByDate = getNutritionDays(date, studentId)
  const baseDay = daysByDate[date]

  if (!baseDay) {
    throw new HttpError(`Nutrition day ${date} not found`, {
      status: 404,
      code: 'http_error',
      data: { message: 'Nutrition day not found' },
      request: request ?? ({ method: 'GET', path: '/nutrition/days', headers: {}, timeoutMs: 0, requestId: 'mock-fallback', url: '/api/nutrition/days' } as HttpRequestContext),
    })
  }

  const updatedDay = recalculateNutritionDay(updater(baseDay))
  const nextDays = {
    ...daysByDate,
    [date]: updatedDay,
  }
  saveNutritionDays(nextDays, studentId)

  return updatedDay
}

function assertNutritionPlanEditable(request: HttpRequestContext, studentId = resolveNutritionStudentIdFromCurrentUser()) {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role !== 'STUDENT') {
    return
  }

  if (!getActiveNutritionistIdByStudentId(studentId)) {
    return
  }

  throw new HttpError('Nutrition plan is managed by active nutritionist', {
    status: 403,
    code: 'http_error',
    data: { message: 'Nutrition plan is managed by active nutritionist' },
    request,
  })
}

function createWorkoutStreak(
  workoutHistory: WorkoutSessionSummary[],
  runHistory: RunSession[],
  daysByDate: NutritionDaysMap,
) {
  let streak = 0

  for (let offset = 0; offset < 30; offset += 1) {
    const date = addDays(new Date(), -offset)
    const dateKey = toIsoDate(date)
    const hadWorkout = workoutHistory.some((item) => toIsoDate(new Date(item.completedAt)) === dateKey)
    const hadRun = runHistory.some((item) => toIsoDate(new Date(item.endedAt ?? item.startedAt)) === dateKey)
    const hadHydrationGoal = (daysByDate[dateKey]?.consumed.waterMl ?? 0) >= (daysByDate[dateKey]?.goals.waterMl ?? Number.MAX_SAFE_INTEGER)

    if (hadWorkout || hadRun || hadHydrationGoal) {
      streak += 1
      continue
    }

    break
  }

  return streak
}

function createMission(todayDay: NutritionDay, hadWorkoutToday: boolean): DashboardMission {
  const mealsDone = todayDay.meals.filter((meal) => meal.status === 'done').length
  const waterPct = Math.round((todayDay.consumed.waterMl / Math.max(todayDay.goals.waterMl, 1)) * 100)

  if (mealsDone < todayDay.meals.length) {
    return {
      id: 'mission-meals',
      title: 'Registrar refeicoes pendentes',
      current: mealsDone,
      target: todayDay.meals.length,
      status: 'active' as const,
    }
  }

  if (waterPct < 100) {
    return {
      id: 'mission-water',
      title: 'Bater meta de agua',
      current: todayDay.consumed.waterMl,
      target: todayDay.goals.waterMl,
      status: 'active' as const,
    }
  }

  return {
    id: 'mission-workout',
    title: 'Concluir treino do dia',
    current: hadWorkoutToday ? 1 : 0,
    target: 1,
    status: hadWorkoutToday ? 'completed' : 'active',
  }
}

function createLatestNotification(todayDay: NutritionDay, workoutHistory: WorkoutSessionSummary[], runHistory: RunSession[]) {
  const latestWorkout = workoutHistory[0]
  const latestRun = runHistory[0]
  const latestMeal = todayDay.meals
    .filter((meal) => Boolean(meal.completedAt))
    .sort((left, right) => Date.parse(right.completedAt ?? '') - Date.parse(left.completedAt ?? ''))[0]
  const latestWater = todayDay.waterLog.entries
    .slice()
    .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))[0]

  const candidates: DashboardNotification[] = [
    latestWorkout
      ? {
          id: `workout-${latestWorkout.sessionId}`,
          at: latestWorkout.completedAt,
          title: 'Treino concluido',
          description: `${latestWorkout.title} finalizado com ${latestWorkout.completedSets}/${latestWorkout.totalSets} series.`,
          type: 'workout' as const,
        }
      : null,
    latestRun
      ? {
          id: `run-${latestRun.sessionId}`,
          at: latestRun.endedAt ?? latestRun.startedAt,
          title: 'Corrida concluida',
          description: `${latestRun.distanceKm.toFixed(2)} km em ${Math.round(latestRun.elapsedSec / 60)} min.`,
          type: 'workout' as const,
        }
      : null,
    latestMeal
      ? {
          id: `meal-${latestMeal.id}-${latestMeal.completedAt}`,
          at: latestMeal.completedAt ?? new Date().toISOString(),
          title: 'Refeicao registrada',
          description: `${latestMeal.name} foi marcada como concluida.`,
          type: 'nutrition' as const,
        }
      : null,
    latestWater
      ? {
          id: `water-${latestWater.id}`,
          at: latestWater.at,
          title: 'Hidratacao atualizada',
          description: `Novo registro de ${latestWater.ml} ml de agua.`,
          type: 'hydration' as const,
        }
      : null,
  ].filter((value): value is DashboardNotification => value !== null)

  if (!candidates.length) {
    return null
  }

  return candidates.sort((left, right) => Date.parse(right.at) - Date.parse(left.at))[0]
}

function ensurePersonalAccess(request: HttpRequestContext) {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role !== 'PERSONAL') {
    throw new HttpError('Only PERSONAL role can access this route', {
      status: 403,
      code: 'http_error',
      data: { message: 'Forbidden' },
      request,
    })
  }

  return currentUser
}

function ensureStudentAccess(request: HttpRequestContext) {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role !== 'STUDENT') {
    throw new HttpError('Only STUDENT role can access this route', {
      status: 403,
      code: 'http_error',
      data: { message: 'Forbidden' },
      request,
    })
  }

  return currentUser
}

function ensureNutritionStudentAccess(request: HttpRequestContext) {
  return ensureStudentAccess(request)
}

function ensureWorkoutAccess(request: HttpRequestContext) {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role !== 'STUDENT' && currentUser.role !== 'PERSONAL') {
    throw new HttpError('Only STUDENT or PERSONAL role can access workout routes', {
      status: 403,
      code: 'http_error',
      data: { message: 'Forbidden' },
      request,
    })
  }

  return currentUser
}

function ensureNutritionistStudentLink(nutritionistId: string, studentId: string, request: HttpRequestContext) {
  const linkedStudentIds = getLinkedStudentIdsByNutritionist(nutritionistId)

  if (!linkedStudentIds.includes(studentId)) {
    throw new HttpError('studentId is not linked to this nutritionist', {
      status: 403,
      code: 'http_error',
      data: { message: 'Forbidden' },
      request,
    })
  }
}

function createPersonalStudents(personalId: string): PersonalStudent[] {
  const linkedIds = getLinkedStudentIdsByPersonal(personalId)
  const studentsById = new Map(getSeededStudents().map((student) => [student.id, student]))

  return linkedIds
    .map((studentId) => {
      const student = studentsById.get(studentId)

      if (!student) {
        return null
      }

      const workouts = workoutMockRepository.getWorkouts(studentId)
        .filter((workout) => workout.assignedByPersonalId === personalId)
      const activeWorkouts = workouts.filter((workout) => workout.status !== 'completed' && workout.isActive !== false).length
      const recentWorkout = workouts[0]

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        workoutsPerWeekTarget: recentWorkout?.frequencyWeekly ?? 4,
        activeWorkouts,
      }
    })
    .filter((student): student is PersonalStudent => Boolean(student))
}

function getPersonalWorkoutLibraryOwnerId(personalId: string) {
  return `personal-library:${personalId}`
}

function isPersonalLibraryOwnerId(studentId: string, personalId: string) {
  return studentId === getPersonalWorkoutLibraryOwnerId(personalId)
}

function createPersonalAssignedWorkouts(personalId: string): PersonalAssignedWorkout[] {
  const students = createPersonalStudents(personalId)
  const assignedWorkouts: PersonalAssignedWorkout[] = []

  students.forEach((student) => {
    const workouts = workoutMockRepository
      .getWorkouts(student.id, { includeInactive: true })
      .filter((workout) => workout.assignedByPersonalId === personalId)

    workouts.forEach((workout) => {
      const exercises = workoutMockRepository.getWorkoutExerciseDetails(student.id, workout.id)
      assignedWorkouts.push({
        id: workout.id,
        studentId: student.id,
        studentName: student.name,
        assignmentScope: 'student',
        title: workout.title,
        description: workout.description,
        date: workout.date,
        isActive: workout.isActive !== false,
        frequencyWeekly: workout.frequencyWeekly ?? 4,
        exercisesCount: exercises.length,
        muscleGroups: workout.muscleGroups,
        intensity: workout.intensity,
        starsReward: workout.starsReward,
        estimatedDurationMin: workout.estimatedDurationMin,
        weekdays: workout.weekdays,
        source: workout.source,
        exercises: exercises.map((exercise, index) => ({
          id: exercise.id,
          order: index + 1,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          restSec: exercise.restSec,
          suggestedLoadKg: exercise.suggestedLoadKg ?? 0,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          durationMin: exercise.durationMin,
          supportMedia: exercise.supportMedia ?? null,
        })),
        createdAt: workout.createdAt ?? new Date().toISOString(),
      })
    })
  })

  const personalLibraryOwnerId = getPersonalWorkoutLibraryOwnerId(personalId)
  const personalLibraryWorkouts = workoutMockRepository
    .getWorkouts(personalLibraryOwnerId, { includeInactive: true })
    .filter((workout) => workout.assignedByPersonalId === personalId)
  personalLibraryWorkouts.forEach((workout) => {
    const exercises = workoutMockRepository.getWorkoutExerciseDetails(personalLibraryOwnerId, workout.id)
    assignedWorkouts.push({
      id: workout.id,
      studentId: personalLibraryOwnerId,
      studentName: 'Base pessoal',
      assignmentScope: 'personal',
      title: workout.title,
      description: workout.description,
      date: workout.date,
      isActive: workout.isActive !== false,
      frequencyWeekly: workout.frequencyWeekly ?? 1,
      exercisesCount: exercises.length,
      muscleGroups: workout.muscleGroups,
      intensity: workout.intensity,
      starsReward: workout.starsReward,
      estimatedDurationMin: workout.estimatedDurationMin,
      weekdays: workout.weekdays,
      source: workout.source,
      exercises: exercises.map((exercise, index) => ({
        id: exercise.id,
        order: index + 1,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        restSec: exercise.restSec,
        suggestedLoadKg: exercise.suggestedLoadKg ?? 0,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        durationMin: exercise.durationMin,
        supportMedia: exercise.supportMedia ?? null,
      })),
      createdAt: workout.createdAt ?? new Date().toISOString(),
    })
  })

  return assignedWorkouts.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
}

function createPersonalStudentWorkoutHistory(personalId: string, studentId: string) {
  const linkedIds = getLinkedStudentIdsByPersonal(personalId)

  if (!linkedIds.includes(studentId)) {
    return null
  }

  const student = getSeededStudents().find((item) => item.id === studentId)

  if (!student) {
    return null
  }

  const sessions = workoutSessionMockRepository
    .getHistory()
    .filter((entry) => entry.studentId === studentId)
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))
    .map((entry) => ({
      sessionId: entry.sessionId,
      title: entry.title,
      completedAt: entry.completedAt,
      durationSec: entry.durationSec,
      completedSets: entry.completedSets,
      totalSets: entry.totalSets,
    }))

  return {
    studentId,
    studentName: student.name,
    sessions,
  }
}

function createPersonalMetrics(personalId: string, workouts: PersonalAssignedWorkout[], students: PersonalStudent[]): PersonalMetrics {
  const assignedStudentWorkouts = workouts.filter((workout) => workout.assignmentScope !== 'personal')
  const weekStart = startOfWeek(new Date())
  const workoutsAssignedThisWeek = assignedStudentWorkouts.filter((workout) => new Date(workout.createdAt) >= weekStart).length
  const avgFrequencyWeekly =
    assignedStudentWorkouts.length > 0
      ? assignedStudentWorkouts.reduce((total, workout) => total + workout.frequencyWeekly, 0) / assignedStudentWorkouts.length
      : 0
  const history = workoutSessionMockRepository.getHistory()
  const studentById = new Map(students.map((student) => [student.id, student]))
  const weekStartKey = toIsoDate(weekStart)
  const previousWeekStartKey = toIsoDate(addDays(weekStart, -7))
  const recentWeekStartKeys = [3, 2, 1, 0].map((offset) => toIsoDate(addDays(weekStart, -(offset * 7))))
  const groupedByStudent = new Map<string, WorkoutSessionSummary[]>()

  history.forEach((session) => {
    const studentId = session.studentId
    if (!studentId || !studentById.has(studentId)) {
      return
    }
    const current = groupedByStudent.get(studentId) ?? []
    groupedByStudent.set(studentId, [...current, session])
  })

  const studentFrequency = students.map((student) => {
    const sessions = groupedByStudent.get(student.id) ?? []
    const completedThisWeek = sessions.filter((session) => toIsoDate(new Date(session.completedAt)) >= weekStartKey).length
    const target = Math.max(student.workoutsPerWeekTarget, 1)
    const frequencyPct = Math.round((completedThisWeek / target) * 100)

    return {
      studentId: student.id,
      studentName: student.name,
      completedWorkoutsThisWeek: completedThisWeek,
      targetWorkoutsPerWeek: target,
      frequencyPct,
    }
  })

  const loadEvolution = students.map((student) => {
    const sessions = groupedByStudent.get(student.id) ?? []
    const byWeek = new Map<string, WorkoutSessionSummary[]>()

    sessions.forEach((session) => {
      const weekKey = toIsoDate(startOfWeek(new Date(session.completedAt)))
      const current = byWeek.get(weekKey) ?? []
      byWeek.set(weekKey, [...current, session])
    })

    const series = recentWeekStartKeys.map((weekKey) => {
      const weekSessions = byWeek.get(weekKey) ?? []
      const averageLoadVolumeKg =
        weekSessions.length > 0
          ? Number(
              (
                weekSessions.reduce((total, session) => total + Math.max(session.loadVolumeKg ?? 0, 0), 0) /
                weekSessions.length
              ).toFixed(1),
            )
          : 0

      return {
        weekStart: weekKey,
        averageLoadVolumeKg,
        sessions: weekSessions.length,
      }
    })

    const currentWeekAverageLoadKg = series[series.length - 1]?.averageLoadVolumeKg ?? 0
    const previousWeekAverageLoadKg = series[series.length - 2]?.averageLoadVolumeKg ?? 0
    const deltaBase = Math.max(previousWeekAverageLoadKg, 1)
    const rawDeltaPct = ((currentWeekAverageLoadKg - previousWeekAverageLoadKg) / deltaBase) * 100
    const deltaPct = Number(rawDeltaPct.toFixed(1))
    const trend: PersonalMetrics['loadEvolution'][number]['trend'] = deltaPct > 3 ? 'up' : deltaPct < -3 ? 'down' : 'stable'

    return {
      studentId: student.id,
      studentName: student.name,
      currentWeekAverageLoadKg,
      previousWeekAverageLoadKg,
      deltaPct,
      trend,
      series,
    }
  })

  const alerts: PersonalMetrics['alerts'] = []
  students.forEach((student) => {
    const sessions = groupedByStudent.get(student.id) ?? []
    const completedThisWeek = sessions.filter((session) => toIsoDate(new Date(session.completedAt)) >= weekStartKey).length
    const completedLastWeek = sessions.filter((session) => {
      const completedKey = toIsoDate(new Date(session.completedAt))
      return completedKey >= previousWeekStartKey && completedKey < weekStartKey
    }).length
    const target = Math.max(student.workoutsPerWeekTarget, 1)
    const consistencyPct = (completedThisWeek / target) * 100
    const mostRecentSession = sessions
      .slice()
      .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))[0]

    if (!mostRecentSession || Date.parse(mostRecentSession.completedAt) < Date.now() - 7 * 24 * 60 * 60 * 1000) {
      alerts.push({
        id: `${student.id}-missed-workout`,
        studentId: student.id,
        studentName: student.name,
        type: 'missed-workout',
        severity: 'danger',
        message: `${student.name} esta ha mais de 7 dias sem concluir treino.`,
      })
    }

    if (consistencyPct < 50 && completedLastWeek < target) {
      alerts.push({
        id: `${student.id}-low-consistency`,
        studentId: student.id,
        studentName: student.name,
        type: 'low-consistency',
        severity: 'warning',
        message: `${student.name} esta com baixa consistencia (${completedThisWeek}/${target} na semana).`,
      })
    }
  })

  return {
    linkedStudents: getLinkedStudentIdsByPersonal(personalId).length,
    workoutsAssignedThisWeek,
    avgFrequencyWeekly: Number(avgFrequencyWeekly.toFixed(1)),
    completedWorkoutsThisWeek: studentFrequency.reduce((total, item) => total + item.completedWorkoutsThisWeek, 0),
    studentFrequency,
    loadEvolution,
    alerts,
  }
}

function getMeasurementsRequestsForProfessional(professionalId: string, role: 'PERSONAL' | 'NUTRITIONIST') {
  return getMeasurementsUpdateRequests()
    .filter((request) => request.professionalId === professionalId && request.professionalRole === role)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
}

function createPersonalDashboardOverview(personalId: string): PersonalDashboardOverview {
  const students = createPersonalStudents(personalId)
  const workouts = createPersonalAssignedWorkouts(personalId)
  const metrics = createPersonalMetrics(personalId, workouts, students)
  const measurementRequests = getMeasurementsRequestsForProfessional(personalId, 'PERSONAL')

  return {
    students,
    workouts,
    metrics,
    measurementRequests,
  }
}

function ensureNutritionistAccess(request: HttpRequestContext) {
  const currentUser = getCurrentAuthUser()

  if (currentUser.role !== 'NUTRITIONIST') {
    throw new HttpError('Only NUTRITIONIST role can access this route', {
      status: 403,
      code: 'http_error',
      data: { message: 'Forbidden' },
      request,
    })
  }

  return currentUser
}

function createNutritionistStudents(nutritionistId: string): NutritionistStudent[] {
  const linkedIds = getLinkedStudentIdsByNutritionist(nutritionistId)
  const studentsById = new Map(getSeededStudents().map((student) => [student.id, student]))

  return linkedIds
    .map((studentId) => {
      const student = studentsById.get(studentId)
      if (!student) {
        return null
      }

      const diet = getActiveNutritionPlan(studentId)
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        activeDietTitle: diet?.title ?? null,
        mealsPerDay: diet?.meals.length ?? 4,
        caloriesTarget: diet?.dailyCalories ?? 2200,
      }
    })
    .filter((student): student is NutritionistStudent => Boolean(student))
}

function createNutritionistDiets(nutritionistId: string): NutritionistAssignedDiet[] {
  const students = createNutritionistStudents(nutritionistId)
  const list: NutritionistAssignedDiet[] = []

  students.forEach((student) => {
    const plans = getNutritionPlansMap()[student.id] ?? []
    plans
      .filter((plan) => plan.nutritionistId === nutritionistId)
      .forEach((plan) => {
        list.push({
          id: plan.id,
          studentId: student.id,
          studentName: student.name,
          title: plan.title,
          dailyCalories: plan.dailyCalories,
          macroDistribution: plan.macroDistribution,
          mealsCount: plan.meals.length,
          isActive: plan.isActive,
          createdAt: plan.createdAt,
        })
      })
  })

  return list.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
}

function createNutritionistAssessments(nutritionistId: string): NutritionistAssessment[] {
  const students = createNutritionistStudents(nutritionistId)
  const todayDate = toIsoDate(new Date())
  const todayTimestamp = Date.parse(`${todayDate}T12:00:00`)
  const thirtyDaysAgo = toIsoDate(addDays(new Date(), -30))

  return students.map((student) => {
    const activeDiet = getActiveNutritionPlan(student.id)
    const calorieTargetDaily = activeDiet?.dailyCalories ?? student.caloriesTarget
    const daysByDate = getNutritionDays(todayDate, student.id)
    const rangeDates = Array.from({ length: 7 }, (_, index) => addDays(new Date(), -index).toISOString().slice(0, 10))
    const rangeDays = rangeDates.map((date) => daysByDate[date]).filter((day): day is NutritionDay => Boolean(day))
    const totalMeals = rangeDays.reduce((total, day) => total + day.meals.length, 0)
    const doneMeals = rangeDays.reduce((total, day) => total + day.meals.filter((meal) => meal.status === 'done').length, 0)
    const adherencePct7d = totalMeals > 0 ? Math.round((doneMeals / totalMeals) * 100) : 0
    const avgWaterMl7d =
      rangeDays.length > 0
        ? Math.round(rangeDays.reduce((total, day) => total + day.consumed.waterMl, 0) / rangeDays.length)
        : 0
    const avgCalories7d =
      rangeDays.length > 0
        ? Math.round(rangeDays.reduce((total, day) => total + day.consumed.calories, 0) / rangeDays.length)
        : 0
    const calorieAdherencePct7d =
      calorieTargetDaily > 0
        ? Math.round((avgCalories7d / Math.max(calorieTargetDaily, 1)) * 100)
        : 0

    const weightLogs = getProgressWeightLogs(student.id, todayDate)
      .slice()
      .sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
    const latestWeightLog = weightLogs[weightLogs.length - 1]
    const logs30 = weightLogs.filter((log) => log.date >= thirtyDaysAgo)
    const baselineLog = logs30[0] ?? weightLogs[0]
    const weightCurrentKg = latestWeightLog?.weightKg ?? null
    const weightDeltaKg30d =
      latestWeightLog && baselineLog
        ? Number((latestWeightLog.weightKg - baselineLog.weightKg).toFixed(1))
        : null

    let projectedWeightKg: number | null = null
    let projectionDeltaKg: number | null = null
    if (logs30.length >= 2 && latestWeightLog) {
      const projectionAnchor = logs30[logs30.length - 2]
      const observedStart = logs30[0]
      const observedDays = Math.max(
        Math.round((Date.parse(`${projectionAnchor.date}T12:00:00`) - Date.parse(`${observedStart.date}T12:00:00`)) / (24 * 60 * 60 * 1000)),
        1,
      )
      const trendKgPerDay = (projectionAnchor.weightKg - observedStart.weightKg) / observedDays
      const projectionDays = Math.max(Math.round((todayTimestamp - Date.parse(`${projectionAnchor.date}T12:00:00`)) / (24 * 60 * 60 * 1000)), 1)
      projectedWeightKg = Number((projectionAnchor.weightKg + trendKgPerDay * projectionDays).toFixed(1))
      projectionDeltaKg = Number((latestWeightLog.weightKg - projectedWeightKg).toFixed(1))
    }

    const alerts: NutritionistAssessment['alerts'] = []
    if (adherencePct7d < 70 || calorieAdherencePct7d < 85) {
      alerts.push({
        id: `${student.id}-goal-not-hit`,
        type: 'goal-not-hit',
        severity: adherencePct7d < 50 || calorieAdherencePct7d < 75 ? 'danger' : 'warning',
        message: `${student.name} nao bateu a meta de dieta na ultima semana (aderencia ${adherencePct7d}%, calorias ${calorieAdherencePct7d}% da meta).`,
      })
    }
    if (projectionDeltaKg !== null && Math.abs(projectionDeltaKg) >= 1.2) {
      alerts.push({
        id: `${student.id}-weight-off-track`,
        type: 'weight-off-track',
        severity: Math.abs(projectionDeltaKg) >= 2 ? 'danger' : 'warning',
        message: `${student.name} esta ${projectionDeltaKg > 0 ? 'acima' : 'abaixo'} da projecao de peso (${projectionDeltaKg > 0 ? '+' : ''}${projectionDeltaKg} kg).`,
      })
    }

    const allCheckins = rangeDays
      .flatMap((day) => day.meals.map((meal) => meal.completedAt))
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => Date.parse(right) - Date.parse(left))

    return {
      studentId: student.id,
      studentName: student.name,
      adherencePct7d,
      avgWaterMl7d,
      avgCalories7d,
      calorieTargetDaily,
      calorieAdherencePct7d,
      weightCurrentKg,
      weightDeltaKg30d,
      projectedWeightKg,
      projectionDeltaKg,
      alerts,
      lastCheckinAt: allCheckins[0] ?? null,
    }
  })
}

function createNutritionistDashboardOverview(nutritionistId: string): NutritionistDashboardOverview {
  const measurementRequests = getMeasurementsRequestsForProfessional(nutritionistId, 'NUTRITIONIST')

  return {
    students: createNutritionistStudents(nutritionistId),
    diets: createNutritionistDiets(nutritionistId),
    assessments: createNutritionistAssessments(nutritionistId),
    measurementRequests,
  }
}

function pushProfessionalMessageNotification(input: {
  studentId: string
  professionalRole: 'PERSONAL' | 'NUTRITIONIST'
  professionalName: string
  message: string
}) {
  upsertNotification({
    entityKey: `pro-message:${input.professionalRole}:${input.studentId}:${hashString(input.message)}`,
    title: input.professionalRole === 'PERSONAL' ? 'Mensagem do Personal' : 'Mensagem do Nutricionista',
    description: `${input.professionalName}: ${input.message}`,
    at: new Date().toISOString(),
    type: 'system',
    recipientStudentId: input.studentId,
    senderRole: input.professionalRole,
  })
}

function pushProfessionalAchievementNotification(input: {
  achievementId: string
  studentId: string
  professionalRole: 'PERSONAL' | 'NUTRITIONIST'
  title: string
  description: string
}) {
  upsertNotification({
    entityKey: `badge-special-${input.achievementId}`,
    title: 'Conquista especial liberada',
    description: `${input.title}: ${input.description}`,
    at: new Date().toISOString(),
    type: 'badge',
    recipientStudentId: input.studentId,
    senderRole: input.professionalRole,
  })
}

function createMeasurementsUpdateRequestsForStudent(studentId: string, note?: string) {
  const student = getSeededStudents().find((item) => item.id === studentId)
  if (!student) {
    return []
  }

  const targets: Array<{ professionalId: string; professionalRole: 'PERSONAL' | 'NUTRITIONIST' }> = []
  const personalId = getActivePersonalIdByStudentId(studentId)
  const nutritionistId = getActiveNutritionistIdByStudentId(studentId)

  if (personalId) {
    targets.push({ professionalId: personalId, professionalRole: 'PERSONAL' })
  }
  if (nutritionistId) {
    targets.push({ professionalId: nutritionistId, professionalRole: 'NUTRITIONIST' })
  }

  if (!targets.length) {
    return []
  }

  const current = getMeasurementsUpdateRequests()
  const now = new Date().toISOString()
  const next = [...current]
  const created: MeasurementsUpdateRequest[] = []

  targets.forEach((target) => {
    const hasPending = current.some(
      (request) =>
        request.studentId === studentId &&
        request.professionalId === target.professionalId &&
        request.type === 'MEASUREMENTS_UPDATE' &&
        (request.status === 'open' || request.status === 'accepted'),
    )

    if (hasPending) {
      return
    }

    const professionalName = getSeededUserNameById(target.professionalId) ?? 'Profissional'
    const request: MeasurementsUpdateRequest = {
      id: crypto.randomUUID(),
      type: 'MEASUREMENTS_UPDATE',
      status: 'open',
      studentId,
      studentName: student.name,
      professionalId: target.professionalId,
      professionalRole: target.professionalRole,
      professionalName,
      note: note?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }

    next.unshift(request)
    created.push(request)
  })

  if (created.length) {
    saveMeasurementsUpdateRequests(next)
  }

  return created
}

function updateMeasurementsRequestStatus(input: {
  requestId: string
  professionalId: string
  professionalRole: 'PERSONAL' | 'NUTRITIONIST'
  nextStatus: RequestStatus
}) {
  const current = getMeasurementsUpdateRequests()
  const target = current.find((request) => request.id === input.requestId)

  if (!target) {
    return null
  }

  if (target.professionalId !== input.professionalId || target.professionalRole !== input.professionalRole) {
    return null
  }

  const now = new Date().toISOString()
  const next = current.map((request) =>
    request.id === input.requestId
      ? {
          ...request,
          status: input.nextStatus,
          updatedAt: now,
        }
      : request,
  )

  saveMeasurementsUpdateRequests(next)

  if (input.nextStatus === 'accepted' || input.nextStatus === 'done') {
    upsertNotification({
      entityKey: `measurements-request-${input.requestId}-${input.nextStatus}`,
      title: input.nextStatus === 'accepted' ? 'Solicitacao aceita' : 'Avaliacao concluida',
      description:
        input.nextStatus === 'accepted'
          ? `${target.professionalName} aceitou sua solicitacao de avaliacao.`
          : `${target.professionalName} concluiu sua atualizacao de medidas.`,
      at: now,
      type: 'system',
      recipientStudentId: target.studentId,
      senderRole: target.professionalRole,
    })
  }

  return next.find((request) => request.id === input.requestId) ?? null
}

function applyNutritionistDietToStudent(nutritionistId: string, input: CreateNutritionistDietInput) {
  const title = input.title.trim() || 'Plano alimentar personalizado'
  const meals = input.meals.map((meal, index) => ({
    id: `diet-meal-${index + 1}`,
    name: meal.name.trim() || `Refeicao ${index + 1}`,
    time: meal.time.trim() || '12:00',
    targetMacros: {
      calories: Math.max(1, Math.round(meal.calories)),
      protein: Math.max(0, Math.round(meal.protein)),
      carbs: Math.max(0, Math.round(meal.carbs)),
      fat: Math.max(0, Math.round(meal.fat)),
    },
    note: meal.note?.trim(),
  }))

  const nextPlan: StoredNutritionPlan = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    nutritionistId,
    title,
    dailyCalories: Math.max(1200, Math.round(input.dailyCalories)),
    macroDistribution: {
      proteinPct: Math.max(1, Math.round(input.macroDistribution.proteinPct)),
      carbsPct: Math.max(1, Math.round(input.macroDistribution.carbsPct)),
      fatPct: Math.max(1, Math.round(input.macroDistribution.fatPct)),
    },
    meals,
    isActive: true,
    createdAt: new Date().toISOString(),
  }

  const planMap = getNutritionPlansMap()
  const current = planMap[input.studentId] ?? []
  const nextPlans = [nextPlan, ...current.map((plan) => ({ ...plan, isActive: false }))]
  saveNutritionPlansMap({
    ...planMap,
    [input.studentId]: nextPlans,
  })

  const anchorDate = toIsoDate(new Date())
  const currentDays = getNutritionDays(anchorDate, input.studentId)
  const updatedDays = applyNutritionPlanToUpcomingDays(currentDays, input.studentId)
  saveNutritionDays(updatedDays, input.studentId)
}

function createHomeDashboardOverview(): HomeDashboardOverview {
  const studentId = resolveWorkoutStudentIdFromCurrentUser()
  const todayDate = toIsoDate(new Date())
  const daysByDate = getNutritionDays(todayDate)
  const rawTodayDay = daysByDate[todayDate]
  const todayDay = rawTodayDay ? recalculateNutritionDay(rawTodayDay) : null
  const workoutHistory = workoutSessionMockRepository.getHistory()
  const runHistory = runMockRepository.getHistory()
  const activeSession = workoutSessionMockRepository.getActiveSession()

  if (!todayDay) {
    return {
      date: todayDate,
      summary: {
        todayWorkout: {
          title: '',
          durationMin: 0,
          hasWorkout: false,
        },
        waterConsumedMl: 0,
        waterGoalMl: 0,
        mealsLogged: 0,
        mealsTotal: 0,
        xpToday: 0,
      },
      quickActions: {
        canStartWorkout: false,
        canRegisterMeal: false,
        canRegisterWater: false,
      },
      streak: {
        kind: 'workout_or_hydration',
        days: 0,
        label: '0 dias',
      },
      mission: {
        id: 'mission-none',
        title: 'Sem missao ativa',
        current: 0,
        target: 1,
        status: 'active',
      },
      latestNotification: null,
    }
  }

  const completedToday = workoutHistory.filter((item) => toIsoDate(new Date(item.completedAt)) === todayDate)
  const completedRunsToday = runHistory.filter((item) => toIsoDate(new Date(item.endedAt ?? item.startedAt)) === todayDate)
  const nutritionXpToday = todayDay.meals.filter((meal) => meal.status === 'done').length * 20 + (todayDay.consumed.waterMl >= todayDay.goals.waterMl ? 40 : 0)
  const xpToday =
    completedToday.reduce((total, item) => total + 120 + item.completedSets * 10, 0) +
    completedRunsToday.reduce((total, run) => total + calculateRunXp(run), 0) +
    nutritionXpToday
  const mealsLogged = todayDay.meals.filter((meal) => meal.status === 'done').length
  const pendingMeal = todayDay.meals.find((meal) => meal.status === 'pending')
  const todayWorkoutSnapshot = workoutMockRepository.getTodayWorkout(0, 0, todayDay.meals.length, studentId)
  const hadWorkoutToday = completedToday.length > 0
  const mission = createMission(todayDay, hadWorkoutToday)
  const streakDays = createWorkoutStreak(workoutHistory, runHistory, daysByDate)

  return {
    date: todayDate,
    summary: {
      todayWorkout: {
        title: activeSession?.title ?? todayWorkoutSnapshot.title,
        durationMin: todayWorkoutSnapshot.durationMin,
        hasWorkout: true,
        activeSessionId: activeSession?.sessionId,
      },
      waterConsumedMl: todayDay.consumed.waterMl,
      waterGoalMl: todayDay.goals.waterMl,
      mealsLogged,
      mealsTotal: todayDay.meals.length,
      xpToday,
    },
    quickActions: {
      canStartWorkout: true,
      canRegisterMeal: Boolean(pendingMeal),
      canRegisterWater: true,
    },
    streak: {
      kind: 'workout_or_hydration',
      days: streakDays,
      label: `${streakDays} ${streakDays === 1 ? 'dia' : 'dias'}`,
    },
    mission,
    latestNotification: createLatestNotification(todayDay, workoutHistory, runHistory),
  }
}

function getProfileGoalLabel(goal: ProfileGoal) {
  if (goal === 'gain_muscle') {
    return 'Hipertrofia'
  }

  if (goal === 'lose_weight') {
    return 'Emagrecimento'
  }

  if (goal === 'performance') {
    return 'Performance'
  }

  return 'Manutenção'
}

function getStudentStreakStatus(days: number): DailyProgress['streakStatus'] {
  if (days <= 0) {
    return 'broken'
  }

  if (days >= 10) {
    return 'hot'
  }

  if (days >= 4) {
    return 'building'
  }

  return 'cold'
}

function getDailyProgressStatus(completionPct: number): DailyProgress['status'] {
  if (completionPct >= 100) {
    return 'completed'
  }

  if (completionPct > 0) {
    return 'in_progress'
  }

  return 'not_started'
}

function getNutritionPlanStatus(
  adherencePct: number,
  completedMeals: number,
  totalMeals: number,
  skippedMeals = 0,
): NutritionDayPlan['status'] {
  if (completedMeals > 0 && completedMeals === totalMeals && adherencePct >= 100) {
    return 'completed'
  }

  if (totalMeals > 0 && skippedMeals > 0 && completedMeals + skippedMeals === totalMeals) {
    return 'partial'
  }

  if (completedMeals > 0 || adherencePct > 0) {
    return 'in_progress'
  }

  return 'planned'
}

function getWaterProgressStatus(completionPct: number): WaterProgress['status'] {
  if (completionPct >= 100) {
    return 'completed'
  }

  if (completionPct > 0) {
    return 'in_progress'
  }

  return 'empty'
}

function calculateDailyStarsEarned(input: {
  completedWorkout: WorkoutSessionSummary | null
  completedRun: RunSession | null
  completedMeals: number
  waterCompletionPct: number
}) {
  return (
    (input.completedWorkout?.rewardStars ?? 0) +
    (input.completedRun?.starsEarned ?? 0) +
    input.completedMeals * 3 +
    (input.waterCompletionPct >= 100 ? 4 : 0)
  )
}

function buildStudentDashboard(date: string): StudentDashboard {
  const studentId = resolveWorkoutStudentIdFromCurrentUser()
  const currentUser = getCurrentUserIdentity()
  const profileSettings = getProfileSettings(currentUser.name)
  const workoutHistory = workoutSessionMockRepository
    .getHistory()
    .filter((entry) => !entry.studentId || entry.studentId === studentId)
  const runHistory = runMockRepository.getHistory()
  const activeWorkoutSession = workoutSessionMockRepository.getActiveSession()
  const activeRunSession = runMockRepository.getActiveSession()
  const nutritionDays = getNutritionDays(date, studentId)
  const fallbackDays = createNutritionMockDays(date, profileSettings.goals.waterMlDaily)
  const todayNutrition = recalculateNutritionDay(nutritionDays[date] ?? fallbackDays[date])
  const completedMeals = todayNutrition.meals.filter((meal) => meal.status === 'done').length
  const skippedMeals = todayNutrition.meals.filter((meal) => meal.status === 'skipped').length
  const totalMeals = Math.max(todayNutrition.meals.length, 1)
  const nutritionAdherencePct = Math.round((completedMeals / totalMeals) * 100)
  const waterCompletionPct = Math.round((todayNutrition.consumed.waterMl / Math.max(todayNutrition.goals.waterMl, 1)) * 100)
  const weeklyDates = Array.from({ length: 7 }, (_, index) => toIsoDate(addDays(new Date(`${date}T12:00:00`), -index)))
  const nutritionConsistencyPct = Math.round(
    weeklyDates.reduce((total, dateKey) => {
      const day = nutritionDays[dateKey] ?? fallbackDays[dateKey]

      if (!day || day.meals.length === 0) {
        return total
      }

      const completed = day.meals.filter((meal) => meal.status === 'done').length
      return total + (completed / day.meals.length) * 100
    }, 0) / Math.max(weeklyDates.length, 1),
  )
  const progressOverview = createProgressOverview(workoutHistory, runHistory, '30d', studentId)
  const gamificationOverview = createGamificationOverview(workoutHistory, runHistory, studentId)
  const leaderboard = buildRankingLeaderboard(
    { period: 'weekly', scope: 'global', league: 'bronze' },
    workoutHistory,
    runHistory,
  )
  const activePersonalId = getActivePersonalIdByStudentId(studentId)
  const activeNutritionistId = getActiveNutritionistIdByStudentId(studentId)
  const supportTeam = [
    activePersonalId
      ? {
          id: activePersonalId,
          role: 'PERSONAL' as const,
          name: getSeededUserNameById(activePersonalId) ?? 'Personal FitQuest',
        }
      : null,
    activeNutritionistId
      ? {
          id: activeNutritionistId,
          role: 'NUTRITIONIST' as const,
          name: getSeededUserNameById(activeNutritionistId) ?? 'Nutricionista FitQuest',
        }
      : null,
  ].filter((item): item is StudentProfile['supportTeam'][number] => item !== null)

  const selectedWorkouts = workoutMockRepository.getWorkouts(studentId, { includeInactive: true })
  const scheduledWorkout = selectedWorkouts.find((workout) => workout.date === date && workout.isActive !== false) ?? null
  const completedWorkout = workoutHistory.find((entry) => toIsoDate(new Date(entry.completedAt)) === date) ?? null
  const completedRun = runHistory.find((entry) => toIsoDate(new Date(entry.endedAt ?? entry.startedAt)) === date) ?? null
  const workoutExerciseDetails = scheduledWorkout
    ? workoutMockRepository.getWorkoutExerciseDetails(studentId, scheduledWorkout.id)
    : []
  const totalWorkoutSets = activeWorkoutSession
    ? activeWorkoutSession.exercises.reduce((total, exercise) => total + Math.max(exercise.sets, 0), 0)
    : workoutExerciseDetails.reduce((total, exercise) => total + Math.max(exercise.sets, 0), 0)
  const completedWorkoutSets = activeWorkoutSession
    ? Object.values(activeWorkoutSession.setsDoneByExerciseId).reduce((total, value) => total + value, 0)
    : completedWorkout?.completedSets ?? 0
  const workoutCompletionPct = completedWorkout
    ? 100
    : totalWorkoutSets > 0
      ? Math.round((completedWorkoutSets / totalWorkoutSets) * 100)
      : 0
  const cardioCompletionPct = completedRun
    ? 100
    : activeRunSession
      ? Math.round((activeRunSession.elapsedSec / 60 / Math.max(30, activeRunSession.elapsedSec / 60)) * 100)
      : 0
  const dailyCompletionPct = Math.round(
    (workoutCompletionPct + nutritionAdherencePct + waterCompletionPct + cardioCompletionPct) / 4,
  )
  const streakDays = createWorkoutStreak(workoutHistory, runHistory, nutritionDays)
  const dailyStarsEarned = calculateDailyStarsEarned({
    completedWorkout,
    completedRun,
    completedMeals,
    waterCompletionPct,
  })

  const profile: StudentProfile = {
    id: currentUser.id,
    firstName: currentUser.name.split(' ')[0] ?? currentUser.name,
    fullName: currentUser.name,
    city: profileSettings.city,
    neighborhood: profileSettings.neighborhood,
    gym: profileSettings.gym,
    memberSince: addDays(new Date(), -240).toISOString(),
    primaryGoal: getProfileGoalLabel(profileSettings.goal),
    headline: 'Seu hub diário centraliza execução, progresso, hábitos, gamificação e recompensa.',
    supportTeam,
  }

  const dailyProgress: DailyProgress = {
    date,
    status: getDailyProgressStatus(dailyCompletionPct),
    completionPct: dailyCompletionPct,
    completedBlocks: [workoutCompletionPct, nutritionAdherencePct, waterCompletionPct, cardioCompletionPct].filter(
      (value) => value >= 100,
    ).length,
    totalBlocks: 4,
    starsEarned: dailyStarsEarned,
    xpEarned: gamificationOverview.todayXp,
    streakDays,
    streakStatus: getStudentStreakStatus(streakDays),
    focusLabel:
      completedWorkout?.title ??
      scheduledWorkout?.title ??
      (todayNutrition.meals.some((meal) => meal.status === 'pending')
        ? 'Registrar refeicoes pendentes e fechar sua hidratacao'
        : 'Organize treino, nutricao, agua e cardio do dia'),
  }

  const todayWorkout: WorkoutDay | null =
    scheduledWorkout || activeWorkoutSession || completedWorkout
      ? {
          id: scheduledWorkout?.id ?? activeWorkoutSession?.sessionId ?? completedWorkout?.sessionId ?? crypto.randomUUID(),
          date,
          title: activeWorkoutSession?.title ?? scheduledWorkout?.title ?? completedWorkout?.title ?? 'Treino do dia',
          focus:
            scheduledWorkout?.muscleGroups?.join(', ') ||
            (workoutExerciseDetails[0]?.muscleGroup ? `Foco em ${workoutExerciseDetails[0].muscleGroup}` : 'Força e consistência'),
          status: activeWorkoutSession ? 'in_progress' : completedWorkout ? 'completed' : scheduledWorkout ? 'scheduled' : 'rest_day',
          estimatedDurationMin:
            scheduledWorkout?.estimatedDurationMin ?? Math.max(Math.round((completedWorkout?.durationSec ?? 1800) / 60), 20),
          completionPct: Math.min(workoutCompletionPct, 100),
          rewardStars: scheduledWorkout?.starsReward ?? 6,
          coachNote: supportTeam[0] ? `Acompanhamento ativo por ${supportTeam[0].name}.` : 'Execução livre para manter o ritmo.',
          exercises: (activeWorkoutSession?.exercises ?? workoutExerciseDetails).slice(0, 6).map((exercise, index) => ({
            id: exercise.id,
            name: exercise.name,
            group: 'muscleGroup' in exercise ? exercise.muscleGroup ?? 'Treino geral' : 'Treino geral',
            sets: exercise.sets,
            reps: exercise.reps,
            restSec: 'restSec' in exercise ? exercise.restSec : 60,
            suggestedLoadKg: exercise.suggestedLoadKg ?? 0,
            status: (() => {
              const activeStatus = activeWorkoutSession?.exercises.find((item) => item.id === exercise.id)?.status

              if (activeStatus === 'done') {
                return 'completed'
              }

              if (activeStatus === 'upcoming') {
                return 'pending'
              }

              if (activeStatus === 'current') {
                return 'current'
              }

              return completedWorkout ? 'completed' : index === 0 ? 'current' : 'pending'
            })(),
          })),
        }
      : null

  const cardioSession: CardioSession | null = {
    id: activeRunSession?.sessionId ?? completedRun?.sessionId ?? `cardio-${date}`,
    date,
    title: activeRunSession ? 'Cardio em andamento' : completedRun ? 'Cardio concluído' : 'Cardio leve do dia',
    type: 'run',
    status: activeRunSession ? 'in_progress' : completedRun ? 'completed' : 'scheduled',
    intensity: completedRun && completedRun.distanceKm >= 6 ? 'high' : 'moderate',
    goalDurationMin: 30,
    completedDurationMin: completedRun ? Math.round(completedRun.elapsedSec / 60) : activeRunSession ? Math.round(activeRunSession.elapsedSec / 60) : 0,
    targetDistanceKm: 4,
    completedDistanceKm: completedRun?.distanceKm ?? activeRunSession?.distanceKm ?? 0,
  }

  const nutritionPlan: NutritionDayPlan = {
    date,
    status: getNutritionPlanStatus(nutritionAdherencePct, completedMeals, totalMeals, skippedMeals),
    adherencePct: nutritionAdherencePct,
    caloriesTarget: todayNutrition.goals.calories,
    caloriesConsumed: todayNutrition.consumed.calories,
    proteinTargetG: todayNutrition.goals.protein,
    proteinConsumedG: todayNutrition.consumed.protein,
    carbsTargetG: todayNutrition.goals.carbs,
    carbsConsumedG: todayNutrition.consumed.carbs,
    fatTargetG: todayNutrition.goals.fat,
    fatConsumedG: todayNutrition.consumed.fat,
    meals: todayNutrition.meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      scheduledAt: meal.time,
      status: meal.status === 'done' ? 'completed' : meal.status,
      itemsSummary: meal.items.map((item) => item.label).slice(0, 2).join(', '),
      targetCalories: meal.targetMacros.calories,
      consumedCalories: meal.status === 'done' ? meal.targetMacros.calories : 0,
      rewardStars: meal.status === 'done' ? 3 : 0,
    })),
  }

  const waterProgress: WaterProgress = {
    status: getWaterProgressStatus(waterCompletionPct),
    consumedMl: todayNutrition.consumed.waterMl,
    targetMl: todayNutrition.goals.waterMl,
    remainingMl: Math.max(todayNutrition.goals.waterMl - todayNutrition.consumed.waterMl, 0),
    completionPct: Math.min(waterCompletionPct, 100),
    checkpointsCompleted: Math.min(Math.floor(todayNutrition.consumed.waterMl / 500), Math.ceil(todayNutrition.goals.waterMl / 500)),
    checkpointsTotal: Math.ceil(todayNutrition.goals.waterMl / 500),
  }

  const gamificationProfile: GamificationProfile = {
    level: gamificationOverview.level,
    totalXp: gamificationOverview.totalXp,
    currentLevelXp: gamificationOverview.currentLevelXp,
    nextLevelXp: gamificationOverview.nextLevelXp,
    weeklyXp: gamificationOverview.weeklyXp,
    weeklyXpTarget: gamificationOverview.weeklyXpTarget,
    stars: workoutHistory.reduce((total, entry) => total + entry.rewardStars, 0) +
      runHistory.reduce((total, entry) => total + (entry.starsEarned ?? 0), 0) +
      Object.values(nutritionDays).reduce((total, day) => total + day.meals.filter((meal) => meal.status === 'done').length * 3, 0) +
      Object.values(nutritionDays).reduce((total, day) => total + (day.consumed.waterMl >= day.goals.waterMl ? 4 : 0), 0),
    streakDays,
    streakStatus: getStudentStreakStatus(streakDays),
  }

  const rankingAbove = leaderboard.top.find((athlete) => athlete.position === leaderboard.currentUser.position - 1) ?? null
  const rankingSummary: StudentHubRankingSummary = {
    scope: 'global',
    period: 'weekly',
    league: leaderboard.currentUser.league,
    position: leaderboard.currentUser.position,
    totalParticipants: leaderboard.totalAthletes,
    points: leaderboard.currentUser.xp,
    gapToNext: rankingAbove ? Math.max(rankingAbove.xp - leaderboard.currentUser.xp, 0) : 0,
    gapToLeader: Math.max((leaderboard.top[0]?.xp ?? leaderboard.currentUser.xp) - leaderboard.currentUser.xp, 0),
    trend:
      leaderboard.currentUser.trend === 'same'
        ? 'stable'
        : leaderboard.currentUser.trend,
    lastUpdatedAt: leaderboard.updatedAt,
  }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const cardioMinutesMonth = runHistory
    .filter((entry) => new Date(entry.endedAt ?? entry.startedAt) >= monthStart)
    .reduce((total, entry) => total + Math.round(entry.elapsedSec / 60), 0)
  const consistencyScore = Math.round(
    (dailyCompletionPct + nutritionConsistencyPct + Math.min((progressOverview.monthSummary.completedWorkouts / 18) * 100, 100)) /
      3,
  )

  const metrics: StudentMetrics = {
    workoutsCompletedMonth: progressOverview.monthSummary.completedWorkouts,
    nutritionAdherencePct: nutritionConsistencyPct,
    cardioMinutesMonth,
    averageWaterMl: progressOverview.metrics.avgWaterMl,
    currentWeightKg: progressOverview.metrics.currentWeightKg,
    consistencyScore,
  }

  return createStudentDashboardMock({
    profile,
    dailyProgress,
    todayWorkout,
    cardioSession,
    nutritionPlan,
    waterProgress,
    gamificationProfile,
    rankingSummary,
    metrics,
  })
}

function createWorkoutSession(studentId: string, workoutId?: string): WorkoutSession {
  const exercises = workoutMockRepository.getExercises(studentId)
  const doneCount = exercises.filter((exercise) => exercise.status === 'done').length
  const totalCount = exercises.length
  const selectedWorkout = workoutId
    ? workoutMockRepository.getWorkoutById(workoutId, studentId)
    : null
  const todayWorkout = selectedWorkout ?? workoutMockRepository.getTodayWorkout(
    Math.round((doneCount / Math.max(totalCount, 1)) * 100),
    doneCount,
    totalCount,
    studentId,
  )
  const setsDoneByExerciseId = exercises.reduce<Record<string, number>>((acc, exercise) => {
    acc[exercise.id] = 0
    return acc
  }, {})

  return {
    sessionId: crypto.randomUUID(),
    studentId,
    startedAt: new Date().toISOString(),
    status: 'active',
    workoutId: selectedWorkout?.id,
    title: todayWorkout.title,
    exercises,
    setsDoneByExerciseId,
    totalElapsedSec: 0,
    restTimerSec: 45,
    currentExerciseId: exercises[0]?.id,
    rewardStars: selectedWorkout?.starsReward ?? 30,
  }
}

function createWorkoutSummary(session: WorkoutSession, studentId: string): WorkoutSessionSummary {
  const completedAt = new Date().toISOString()
  const durationSec = Math.max(
    session.totalElapsedSec,
    Math.max(Math.round((Date.parse(completedAt) - Date.parse(session.startedAt)) / 1000), 0),
  )

  const totalSets = session.exercises.reduce((total, exercise) => total + exercise.sets, 0)
  const completedSets = session.exercises.reduce((total, exercise) => {
    const done = session.setsDoneByExerciseId[exercise.id] ?? 0
    return total + Math.min(done, exercise.sets)
  }, 0)

  const completedExercises = session.exercises.filter((exercise) => {
    const done = session.setsDoneByExerciseId[exercise.id] ?? 0
    return done >= exercise.sets
  }).length
  const loadVolumeKg = session.exercises.reduce((total, exercise) => {
    const completedSetsForExercise = Math.min(session.setsDoneByExerciseId[exercise.id] ?? 0, exercise.sets)
    const reps = Math.max(exercise.reps, 0)
    const load = Math.max(exercise.suggestedLoadKg ?? 0, 0)
    return total + completedSetsForExercise * reps * load
  }, 0)
  const exerciseRecords = session.exercises
    .map((exercise) => {
      const completedSetsForExercise = Math.min(session.setsDoneByExerciseId[exercise.id] ?? 0, exercise.sets)
      const reps = Math.max(exercise.reps, 0)
      const load = Math.max(exercise.suggestedLoadKg ?? 0, 0)

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        loadVolumeKg: Number((completedSetsForExercise * reps * load).toFixed(1)),
      }
    })
    .filter((record) => record.loadVolumeKg > 0)

  return {
    sessionId: session.sessionId,
    studentId,
    workoutId: session.workoutId,
    title: session.title,
    startedAt: session.startedAt,
    completedAt,
    durationSec,
    totalExercises: session.exercises.length,
    completedExercises,
    totalSets,
    completedSets,
    loadVolumeKg: Number(loadVolumeKg.toFixed(1)),
    exerciseRecords,
    rewardStars: session.rewardStars,
    streakDays: 4,
    currentLevel: 3,
    nextLevel: 4,
    currentLevelStars: 72,
    nextLevelStars: 120,
    starsToNextLevel: 48,
    weeklyCompletedWorkouts: 3,
    weeklyTargetWorkouts: 4,
    weeklyCompletionDelta: 1,
    completionMessage: 'Treino concluido e progresso semanal atualizado.',
  }
}

function createRunMetrics(history: RunSession[]) {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const weekStart = new Date(now)
  const weekDay = weekStart.getDay()
  const diff = (weekDay + 6) % 7
  weekStart.setDate(weekStart.getDate() - diff)
  weekStart.setHours(0, 0, 0, 0)
  const thisMonthRuns = history.filter((run) => {
    const runDate = new Date(run.endedAt ?? run.startedAt)
    return runDate.getMonth() === month && runDate.getFullYear() === year
  })

  const totalKmMonth = Number(thisMonthRuns.reduce((total, run) => total + run.distanceKm, 0).toFixed(2))
  const totalCalories = Math.round(thisMonthRuns.reduce((total, run) => total + run.calories, 0))
  const validPaces = thisMonthRuns.map((run) => run.paceSecPerKm).filter((pace) => pace > 0)
  const bestPaceSecPerKm = validPaces.length > 0 ? Math.min(...validPaces) : null

  return {
    totalKmMonth,
    bestPaceSecPerKm,
    totalCalories,
    totalSessionsMonth: thisMonthRuns.length,
    weeklyDistanceKm: Number(
      history
        .filter((run) => new Date(run.endedAt ?? run.startedAt) >= weekStart)
        .reduce((total, run) => total + run.distanceKm, 0)
        .toFixed(2),
    ),
    weeklyStars: history
      .filter((run) => new Date(run.endedAt ?? run.startedAt) >= weekStart)
      .reduce((total, run) => total + (run.starsEarned ?? 0), 0),
  }
}

function createRunOverview(): RunOverview {
  const history = runMockRepository.getHistory()
  const activeSession = runMockRepository.getActiveSession()
  const todayKey = toIsoDate(new Date())
  const todayRuns = history.filter((run) => toIsoDate(new Date(run.endedAt ?? run.startedAt)) === todayKey)
  const uniqueDates = new Set(history.map((run) => toIsoDate(new Date(run.endedAt ?? run.startedAt))))
  let streakDays = 0

  for (let offset = 0; offset < 30; offset += 1) {
    const dateKey = toIsoDate(addDays(new Date(), -offset))

    if (uniqueDates.has(dateKey)) {
      streakDays += 1
      continue
    }

    break
  }

  return {
    activeSession,
    history,
    metrics: createRunMetrics(history),
    recommendedGoalKm: 4,
    todayDistanceKm: Number(todayRuns.reduce((total, run) => total + run.distanceKm, 0).toFixed(2)),
    todayStars: todayRuns.reduce((total, run) => total + (run.starsEarned ?? 0), 0),
    streakDays,
  }
}

function createRunRankingSnapshot(): RunRankingSnapshot {
  const workoutHistory = workoutSessionMockRepository.getHistory()
  const runHistory = runMockRepository.getHistory()
  const summary = buildRankingSummary(workoutHistory, runHistory)

  return {
    points: summary.points,
    position: summary.position,
    totalAthletes: summary.totalAthletes,
  }
}

let isRegistered = false

export function registerMockHandlers() {
  if (isRegistered) {
    return
  }

  registerMockHandler<LoginResponse>('POST', '/auth/login', (request) => {
    const body = (request.body ?? {}) as Partial<LoginRequest>
    const email = body.email?.trim() ?? 'atleta@fitquest.app'
    const password = body.password?.trim() ?? ''

    if (password.toLowerCase() === 'invalid') {
      throw new HttpError('Invalid credentials', {
        status: 401,
        code: 'http_error',
        data: { message: 'Invalid credentials' },
        request,
      })
    }

    const seededProfile = resolveSeededLoginProfile(email)
    const initialName = seededProfile?.name ?? email.split('@')[0]?.trim() ?? 'atleta'
    getProfileSettings(initialName)

    const user: AuthUser = {
      id: seededProfile?.id ?? crypto.randomUUID(),
      name: initialName,
      role: seededProfile?.role ?? 'STUDENT',
      professionalProfile: seededProfile?.professionalProfile,
    }

    const response: LoginResponse = {
      session: {
        accessToken: `mock-access-${crypto.randomUUID()}`,
        refreshToken: `mock-refresh-${crypto.randomUUID()}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        user,
      },
    }

    return { data: response }
  })

  registerMockHandler<null>('POST', '/auth/logout', () => {
    return { data: null }
  })

  registerMockHandler<ProfileSettings>('GET', '/profile', () => {
    return {
      data: getProfileSettings(),
    }
  })

  registerMockHandler<ProfileSettings>('PATCH', '/profile', (request) => {
    const body = (request.body ?? {}) as { patch?: UpdateProfilePayload }

    if (!body.patch) {
      throw new HttpError('profile patch is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'profile patch is required' },
        request,
      })
    }

    const current = getProfileSettings()
    const next = applyProfilePatch(current, body.patch)
    saveProfileSettings(next)
    updateStoredAuthSessionName(next.name)
    const nutrition = getNutritionDays(toIsoDate(new Date()))
    const normalized = applyProfileGoalsToNutritionDays(nutrition, next)

    if (normalized.changed) {
      saveNutritionDays(normalized.daysByDate)
    }

    return {
      data: next,
    }
  })

  registerMockHandler<StudentRelationshipsOverview>('GET', '/relationships/me', (request) => {
    const currentUser = getCurrentAuthUser()

    if (currentUser.role !== 'STUDENT') {
      throw new HttpError('Only STUDENT can access relationships', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    return {
      data: buildStudentRelationshipsOverview(currentUser.id),
    }
  })

  registerMockHandler<StudentRelationshipsOverview>('POST', '/relationships/invites/by-code-or-id', (request) => {
    const currentUser = getCurrentAuthUser()

    if (currentUser.role !== 'STUDENT') {
      throw new HttpError('Only STUDENT can request relationship invite', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const body = (request.body ?? {}) as { codeOrId?: string }
    const codeOrId = body.codeOrId?.trim()

    if (!codeOrId) {
      throw new HttpError('codeOrId is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'codeOrId is required' },
        request,
      })
    }

    const professional = resolveProfessionalByCodeOrId(codeOrId)
    if (!professional || (professional.role !== 'PERSONAL' && professional.role !== 'NUTRITIONIST')) {
      throw new HttpError('Professional not found for provided code or id', {
        status: 404,
        code: 'http_error',
        data: { message: 'Professional not found' },
        request,
      })
    }

    const professionalRole = professional.role as 'PERSONAL' | 'NUTRITIONIST'
    const activeProfessionalId =
      professionalRole === 'PERSONAL'
        ? getActivePersonalIdByStudentId(currentUser.id)
        : getActiveNutritionistIdByStudentId(currentUser.id)

    if (activeProfessionalId === professional.id) {
      return {
        data: buildStudentRelationshipsOverview(currentUser.id),
      }
    }

    const invites = getRelationshipInvites()
    const existingPending = invites.find(
      (invite) =>
        invite.studentId === currentUser.id &&
        invite.professionalId === professional.id &&
        invite.professionalRole === professionalRole &&
        invite.status === 'pending',
    )

    if (!existingPending) {
      const nextInvite: RelationshipInvite = {
        id: crypto.randomUUID(),
        studentId: currentUser.id,
        professionalId: professional.id,
        professionalRole,
        professionalName: professional.name,
        professionalCode: getProfessionalCode(professional.id, professionalRole),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      saveRelationshipInvites([nextInvite, ...invites])
    }

    return {
      data: buildStudentRelationshipsOverview(currentUser.id),
    }
  })

  registerMockHandler<StudentRelationshipsOverview>('PATCH', '/relationships/invites/respond', (request) => {
    const currentUser = getCurrentAuthUser()

    if (currentUser.role !== 'STUDENT') {
      throw new HttpError('Only STUDENT can respond relationship invite', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const body = (request.body ?? {}) as { inviteId?: string; action?: 'accept' | 'reject' }
    if (!body.inviteId || (body.action !== 'accept' && body.action !== 'reject')) {
      throw new HttpError('inviteId and valid action are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'inviteId and valid action are required' },
        request,
      })
    }

    const invites = getRelationshipInvites()
    const invite = invites.find((item) => item.id === body.inviteId && item.studentId === currentUser.id)

    if (!invite) {
      throw new HttpError('Invite not found', {
        status: 404,
        code: 'http_error',
        data: { message: 'Invite not found' },
        request,
      })
    }

    if (invite.status !== 'pending') {
      return {
        data: buildStudentRelationshipsOverview(currentUser.id),
      }
    }

    if (body.action === 'accept') {
      const activeProfessionalId =
        invite.professionalRole === 'PERSONAL'
          ? getActivePersonalIdByStudentId(currentUser.id)
          : getActiveNutritionistIdByStudentId(currentUser.id)

      if (activeProfessionalId && activeProfessionalId !== invite.professionalId) {
        throw new HttpError(`Student already has an active ${invite.professionalRole.toLowerCase()}`, {
          status: 409,
          code: 'http_error',
          data: { message: 'Student already linked to another professional of this role' },
          request,
        })
      }

      ensureSingleProfessionalLink(currentUser.id, invite.professionalId, invite.professionalRole)
    }

    const now = new Date().toISOString()
    const nextStatus: RelationshipInvite['status'] = body.action === 'accept' ? 'accepted' : 'rejected'
    const nextInvites: RelationshipInvite[] = invites.map((item) => {
      if (item.id !== invite.id) {
        return item
      }

      return {
        ...item,
        status: nextStatus,
        respondedAt: now,
      }
    })
    saveRelationshipInvites(nextInvites)

    return {
      data: buildStudentRelationshipsOverview(currentUser.id),
    }
  })

  registerMockHandler<NutritionDaysResponse>('GET', '/nutrition/days', (request) => {
    ensureNutritionStudentAccess(request)
    const url = new URL(request.url, window.location.origin)
    const anchorDate = url.searchParams.get('anchorDate') ?? toIsoDate(new Date())
    const studentId = resolveNutritionStudentIdFromCurrentUser()
    const daysByDate = getNutritionDays(anchorDate, studentId)
    const permissions = getNutritionPermissions(studentId)

    return {
      data: {
        daysByDate,
        permissions,
      },
    }
  })

  registerMockHandler<NutritionDay>('PATCH', '/nutrition/meals/status', (request) => {
    ensureNutritionStudentAccess(request)
    const body = (request.body ?? {}) as { date?: string; mealId?: string; status?: Meal['status'] }

    if (!body.date || !body.mealId || !body.status) {
      throw new HttpError('date, mealId and status are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'date, mealId and status are required' },
        request,
      })
    }

    return {
      data: upsertNutritionDay(body.date, (day) => ({
        ...day,
        meals: day.meals.map((meal) =>
          meal.id === body.mealId
            ? {
                ...meal,
                status: body.status as Meal['status'],
                completedAt: body.status === 'done' ? new Date().toISOString() : undefined,
              }
            : meal,
        ),
      }), request),
    }
  })

  registerMockHandler<NutritionDay>('PATCH', '/nutrition/meals/update', (request) => {
    ensureNutritionStudentAccess(request)
    const body = (request.body ?? {}) as { date?: string; mealId?: string; patch?: Partial<Pick<Meal, 'name' | 'time' | 'note'>> }

    if (!body.date || !body.mealId || !body.patch) {
      throw new HttpError('date, mealId and patch are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'date, mealId and patch are required' },
        request,
      })
    }

    assertNutritionPlanEditable(request)

    return {
      data: upsertNutritionDay(body.date, (day) => ({
        ...day,
        meals: day.meals.map((meal) =>
          meal.id === body.mealId
            ? {
                ...meal,
                name: body.patch?.name?.trim() || meal.name,
                time: body.patch?.time?.trim() || meal.time,
                note: body.patch?.note ?? meal.note,
              }
            : meal,
        ),
      }), request),
    }
  })

  registerMockHandler<NutritionDay>('POST', '/nutrition/meals/delete', (request) => {
    ensureNutritionStudentAccess(request)
    const body = (request.body ?? {}) as { date?: string; mealId?: string }

    if (!body.date || !body.mealId) {
      throw new HttpError('date and mealId are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'date and mealId are required' },
        request,
      })
    }

    assertNutritionPlanEditable(request)

    return {
      data: upsertNutritionDay(body.date, (day) => ({
        ...day,
        meals: day.meals.filter((meal) => meal.id !== body.mealId),
      }), request),
    }
  })

  registerMockHandler<NutritionDay>('POST', '/nutrition/water', (request) => {
    ensureNutritionStudentAccess(request)
    const body = (request.body ?? {}) as { date?: string; ml?: number }

    if (!body.date || !body.ml || body.ml <= 0) {
      throw new HttpError('date and positive ml are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'date and positive ml are required' },
        request,
      })
    }

    return {
      data: upsertNutritionDay(body.date, (day) => ({
        ...day,
        waterLog: {
          entries: [
            ...day.waterLog.entries,
            {
              id: crypto.randomUUID(),
              ml: Math.round(body.ml ?? 0),
              at: new Date().toISOString(),
            },
          ],
        },
      }), request),
    }
  })

  registerMockHandler<NutritionDay>('POST', '/nutrition/water/remove-last', (request) => {
    ensureNutritionStudentAccess(request)
    const body = (request.body ?? {}) as { date?: string }

    if (!body.date) {
      throw new HttpError('date is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'date is required' },
        request,
      })
    }

    return {
      data: upsertNutritionDay(body.date, (day) => ({
        ...day,
        waterLog: {
          entries: day.waterLog.entries.slice(0, -1),
        },
      }), request),
    }
  })

  registerMockHandler<NutritionDay>('PATCH', '/nutrition/goals/water', (request) => {
    ensureNutritionStudentAccess(request)
    const body = (request.body ?? {}) as { date?: string; waterMl?: number }

    if (!body.date || !body.waterMl || body.waterMl <= 0) {
      throw new HttpError('date and positive waterMl are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'date and positive waterMl are required' },
        request,
      })
    }

    assertNutritionPlanEditable(request)

    return {
      data: upsertNutritionDay(body.date, (day) => ({
        ...day,
        goals: {
          ...day.goals,
          waterMl: Math.round(body.waterMl ?? day.goals.waterMl),
        },
      }), request),
    }
  })

  registerMockHandler<NutritionistDashboardOverview>('GET', '/nutritionist/dashboard', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    return {
      data: createNutritionistDashboardOverview(nutritionist.id),
    }
  })

  registerMockHandler<NutritionistDashboardOverview>('POST', '/nutritionist/requests/update', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    const body = (request.body ?? {}) as { requestId?: string; status?: RequestStatus }

    if (!body.requestId || !body.status || !['open', 'accepted', 'done'].includes(body.status)) {
      throw new HttpError('requestId and valid status are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'requestId and valid status are required' },
        request,
      })
    }

    const updated = updateMeasurementsRequestStatus({
      requestId: body.requestId,
      professionalId: nutritionist.id,
      professionalRole: 'NUTRITIONIST',
      nextStatus: body.status,
    })

    if (!updated) {
      throw new HttpError('Request not found for this professional', {
        status: 404,
        code: 'http_error',
        data: { message: 'Request not found for this professional' },
        request,
      })
    }

    return {
      data: createNutritionistDashboardOverview(nutritionist.id),
    }
  })

  registerMockHandler<NutritionistDashboardOverview>('POST', '/nutritionist/diets', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    const body = (request.body ?? {}) as CreateNutritionistDietInput

    if (!body.studentId || !body.title || !Array.isArray(body.meals) || body.meals.length === 0) {
      throw new HttpError('studentId, title and meals are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId, title and meals are required' },
        request,
      })
    }

    const linkedStudentIds = getLinkedStudentIdsByNutritionist(nutritionist.id)
    if (!linkedStudentIds.includes(body.studentId)) {
      throw new HttpError('studentId is not linked to this nutritionist', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const macroTotal = Math.round(body.macroDistribution.proteinPct + body.macroDistribution.carbsPct + body.macroDistribution.fatPct)
    if (macroTotal !== 100) {
      throw new HttpError('macro distribution must total 100%', {
        status: 400,
        code: 'http_error',
        data: { message: 'macro distribution must total 100%' },
        request,
      })
    }

    applyNutritionistDietToStudent(nutritionist.id, body)

    return {
      data: createNutritionistDashboardOverview(nutritionist.id),
    }
  })

  registerMockHandler<ProgressOverview>('GET', '/nutritionist/students/progress', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    const studentId = String(request.query?.studentId ?? '')

    if (!studentId) {
      throw new HttpError('studentId query param is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId query param is required' },
        request,
      })
    }

    ensureNutritionistStudentLink(nutritionist.id, studentId, request)
    const history = workoutSessionMockRepository.getHistory()
    const runHistory = runMockRepository.getHistory()

    return {
      data: createProgressOverview(history, runHistory, '30d', studentId),
    }
  })

  registerMockHandler<{ saved: boolean }>('POST', '/nutritionist/students/progress/weight/review', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    const body = (request.body ?? {}) as {
      studentId?: string
      targetLogId?: string
      weightKg?: number
      comment?: string
    }

    if (!body.studentId || !body.targetLogId || !body.weightKg || !body.comment?.trim()) {
      throw new HttpError('studentId, targetLogId, weightKg and comment are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId, targetLogId, weightKg and comment are required' },
        request,
      })
    }

    ensureNutritionistStudentLink(nutritionist.id, body.studentId, request)
    const logs = getProgressWeightLogs(body.studentId)
    const target = logs.find((log) => log.id === body.targetLogId)

    if (!target) {
      throw new HttpError('Weight log not found', {
        status: 404,
        code: 'http_error',
        data: { message: 'Weight log not found' },
        request,
      })
    }

    const nextLog: ProgressWeightLog = {
      id: crypto.randomUUID(),
      studentId: body.studentId,
      date: target.date,
      weightKg: Number(Number(body.weightKg).toFixed(1)),
      recordedByRole: 'NUTRITIONIST',
      recordedById: nutritionist.id,
      comment: body.comment.trim(),
      createdAt: new Date().toISOString(),
      revisedFromLogId: target.id,
    }

    saveProgressWeightLogs(
      body.studentId,
      [...logs, nextLog].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)),
    )

    return {
      data: { saved: true },
    }
  })

  registerMockHandler<{ saved: boolean }>('POST', '/nutritionist/students/progress/measurements/review', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    const body = (request.body ?? {}) as {
      studentId?: string
      targetLogId?: string
      comment?: string
      measurements?: {
        chestCm?: number
        waistCm?: number
        hipsCm?: number
        armCm?: number
        thighCm?: number
      }
    }

    if (!body.studentId || !body.targetLogId || !body.comment?.trim() || !body.measurements) {
      throw new HttpError('studentId, targetLogId, measurements and comment are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId, targetLogId, measurements and comment are required' },
        request,
      })
    }

    ensureNutritionistStudentLink(nutritionist.id, body.studentId, request)
    const logs = getBodyMeasurementLogs(body.studentId)
    const target = logs.find((log) => log.id === body.targetLogId)

    if (!target) {
      throw new HttpError('Measurement log not found', {
        status: 404,
        code: 'http_error',
        data: { message: 'Measurement log not found' },
        request,
      })
    }

    const values = [
      body.measurements.chestCm,
      body.measurements.waistCm,
      body.measurements.hipsCm,
      body.measurements.armCm,
      body.measurements.thighCm,
    ]
    if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) {
      throw new HttpError('All measurements must be positive numbers', {
        status: 400,
        code: 'http_error',
        data: { message: 'All measurements must be positive numbers' },
        request,
      })
    }

    const nextLog: BodyMeasurementLog = {
      id: crypto.randomUUID(),
      studentId: body.studentId,
      date: target.date,
      measurements: {
        chestCm: Number(body.measurements.chestCm!.toFixed(1)),
        waistCm: Number(body.measurements.waistCm!.toFixed(1)),
        hipsCm: Number(body.measurements.hipsCm!.toFixed(1)),
        armCm: Number(body.measurements.armCm!.toFixed(1)),
        thighCm: Number(body.measurements.thighCm!.toFixed(1)),
      },
      recordedByRole: 'NUTRITIONIST',
      recordedById: nutritionist.id,
      comment: body.comment.trim(),
      createdAt: new Date().toISOString(),
      revisedFromLogId: target.id,
    }

    saveBodyMeasurementLogs(
      body.studentId,
      [...logs, nextLog].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)),
    )

    return {
      data: { saved: true },
    }
  })

  registerMockHandler<{ sent: boolean }>('POST', '/nutritionist/students/motivation', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    const body = (request.body ?? {}) as { studentId?: string; message?: string }

    if (!body.studentId || !body.message?.trim()) {
      throw new HttpError('studentId and message are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId and message are required' },
        request,
      })
    }

    ensureNutritionistStudentLink(nutritionist.id, body.studentId, request)
    pushProfessionalMessageNotification({
      studentId: body.studentId,
      professionalRole: 'NUTRITIONIST',
      professionalName: nutritionist.name,
      message: body.message.trim(),
    })

    return {
      data: { sent: true },
    }
  })

  registerMockHandler<{ granted: boolean }>('POST', '/nutritionist/students/achievement', (request) => {
    const nutritionist = ensureNutritionistAccess(request)
    const body = (request.body ?? {}) as { studentId?: string; title?: string; description?: string }

    if (!body.studentId || !body.title?.trim() || !body.description?.trim()) {
      throw new HttpError('studentId, title and description are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId, title and description are required' },
        request,
      })
    }

    ensureNutritionistStudentLink(nutritionist.id, body.studentId, request)
    const achievement = grantSpecialAchievement({
      studentId: body.studentId,
      title: body.title,
      description: body.description,
      grantedByRole: 'NUTRITIONIST',
      grantedById: nutritionist.id,
    })

    if (achievement) {
      pushProfessionalAchievementNotification({
        achievementId: achievement.id,
        studentId: body.studentId,
        professionalRole: 'NUTRITIONIST',
        title: body.title.trim(),
        description: body.description.trim(),
      })
    }

    return {
      data: { granted: true },
    }
  })

  registerMockHandler<PersonalDashboardOverview>('GET', '/personal/dashboard', (request) => {
    const personal = ensurePersonalAccess(request)
    return {
      data: createPersonalDashboardOverview(personal.id),
    }
  })

  registerMockHandler<PersonalStudentInviteLink>('POST', '/personal/students/invite-link', (request) => {
    const personal = ensurePersonalAccess(request)
    const code = getProfessionalCode(personal.id, 'PERSONAL')
    const inviteLink = `https://fitquest.app/invite?code=${encodeURIComponent(code)}`

    return {
      data: {
        code,
        inviteLink,
      },
    }
  })

  registerMockHandler<PersonalDashboardOverview>('POST', '/personal/requests/update', (request) => {
    const personal = ensurePersonalAccess(request)
    const body = (request.body ?? {}) as { requestId?: string; status?: RequestStatus }

    if (!body.requestId || !body.status || !['open', 'accepted', 'done'].includes(body.status)) {
      throw new HttpError('requestId and valid status are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'requestId and valid status are required' },
        request,
      })
    }

    const updated = updateMeasurementsRequestStatus({
      requestId: body.requestId,
      professionalId: personal.id,
      professionalRole: 'PERSONAL',
      nextStatus: body.status,
    })

    if (!updated) {
      throw new HttpError('Request not found for this professional', {
        status: 404,
        code: 'http_error',
        data: { message: 'Request not found for this professional' },
        request,
      })
    }

    return {
      data: createPersonalDashboardOverview(personal.id),
    }
  })

  registerMockHandler<PersonalDashboardOverview>('POST', '/personal/workouts', (request) => {
    const personal = ensurePersonalAccess(request)
    const body = (request.body ?? {}) as CreatePersonalWorkoutInput

    if (!body.title || !Array.isArray(body.exercises) || body.exercises.length === 0) {
      throw new HttpError('title and exercises are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'title and exercises are required' },
        request,
      })
    }

    const targetStudentId = body.studentId?.trim() || getPersonalWorkoutLibraryOwnerId(personal.id)
    const linkedStudentIds = getLinkedStudentIdsByPersonal(personal.id)
    const isPersonalLibrary = isPersonalLibraryOwnerId(targetStudentId, personal.id)

    if (!isPersonalLibrary && !linkedStudentIds.includes(targetStudentId)) {
      throw new HttpError('studentId is not linked to this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const safeDate = body.date ?? toIsoDate(new Date())
    workoutMockRepository.createWorkoutForStudent({
      studentId: targetStudentId,
      title: body.title,
      description: body.description,
      date: safeDate,
      frequencyWeekly: Math.max(1, Math.round(body.frequencyWeekly || 1)),
      muscleGroups: body.muscleGroups,
      intensity: body.intensity,
      starsReward: body.starsReward,
      estimatedDurationMin: body.estimatedDurationMin,
      weekdays: body.weekdays,
      source: body.source ?? 'manual',
      assignedByPersonalId: personal.id,
      exercises: body.exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: Math.max(1, Math.round(exercise.sets)),
        reps: Math.max(1, Math.round(exercise.reps)),
        restSec:
          typeof exercise.restSec === 'number'
            ? Math.max(20, Math.round(exercise.restSec))
            : undefined,
        suggestedLoadKg: Math.max(0, Number(exercise.suggestedLoadKg)),
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        durationMin:
          typeof exercise.durationMin === 'number'
            ? Math.max(2, Math.round(exercise.durationMin))
            : undefined,
        supportMedia: exercise.supportMedia ?? null,
      })),
    })

    return {
      data: createPersonalDashboardOverview(personal.id),
    }
  })

  registerMockHandler<PersonalDashboardOverview>('POST', '/personal/workouts/update', (request) => {
    const personal = ensurePersonalAccess(request)
    const body = (request.body ?? {}) as {
      studentId?: string
      workoutId?: string
      title?: string
      description?: string
      date?: string
      frequencyWeekly?: number
      muscleGroups?: string[]
      intensity?: 'iniciante' | 'intermediario' | 'avancado'
      starsReward?: number
      estimatedDurationMin?: number
      weekdays?: Array<'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab' | 'Dom'>
      source?: 'manual' | 'assistant'
      exercises?: Array<{
        id?: string
        name: string
        sets: number
        reps: number
        restSec?: number
        suggestedLoadKg: number
        muscleGroup?: string
        equipment?: string
        durationMin?: number
        supportMedia?: CreatePersonalWorkoutInput['exercises'][number]['supportMedia']
      }>
    }

    if (!body.studentId || !body.workoutId) {
      throw new HttpError('studentId and workoutId are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId and workoutId are required' },
        request,
      })
    }

    const linkedStudentIds = getLinkedStudentIdsByPersonal(personal.id)
    const isPersonalLibrary = isPersonalLibraryOwnerId(body.studentId, personal.id)
    if (!isPersonalLibrary && !linkedStudentIds.includes(body.studentId)) {
      throw new HttpError('studentId is not linked to this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const existing = workoutMockRepository.getWorkoutById(body.workoutId, body.studentId)
    if (!existing || existing.assignedByPersonalId !== personal.id) {
      throw new HttpError('Workout not found or not assigned by this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const updated = workoutMockRepository.updateAssignedWorkout({
      studentId: body.studentId,
      workoutId: body.workoutId,
      title: body.title,
      description: body.description,
      date: body.date,
      frequencyWeekly: body.frequencyWeekly,
      muscleGroups: body.muscleGroups,
      intensity: body.intensity,
      starsReward: body.starsReward,
      estimatedDurationMin: body.estimatedDurationMin,
      weekdays: body.weekdays,
      source: body.source,
      exercises: body.exercises?.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: Math.max(1, Math.round(exercise.sets)),
        reps: Math.max(1, Math.round(exercise.reps)),
        restSec:
          typeof exercise.restSec === 'number'
            ? Math.max(20, Math.round(exercise.restSec))
            : undefined,
        suggestedLoadKg: Math.max(0, Number(exercise.suggestedLoadKg)),
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        durationMin:
          typeof exercise.durationMin === 'number'
            ? Math.max(2, Math.round(exercise.durationMin))
            : undefined,
        supportMedia: exercise.supportMedia ?? null,
      })),
    })

    if (!updated) {
      throw new HttpError('Workout not found', {
        status: 404,
        code: 'http_error',
        data: { message: 'Workout not found' },
        request,
      })
    }

    return {
      data: createPersonalDashboardOverview(personal.id),
    }
  })

  registerMockHandler<PersonalDashboardOverview>('POST', '/personal/workouts/deactivate', (request) => {
    const personal = ensurePersonalAccess(request)
    const body = (request.body ?? {}) as { studentId?: string; workoutId?: string }

    if (!body.studentId || !body.workoutId) {
      throw new HttpError('studentId and workoutId are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId and workoutId are required' },
        request,
      })
    }

    const linkedStudentIds = getLinkedStudentIdsByPersonal(personal.id)
    const isPersonalLibrary = isPersonalLibraryOwnerId(body.studentId, personal.id)
    if (!isPersonalLibrary && !linkedStudentIds.includes(body.studentId)) {
      throw new HttpError('studentId is not linked to this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const existing = workoutMockRepository.getWorkoutById(body.workoutId, body.studentId)
    if (!existing || existing.assignedByPersonalId !== personal.id) {
      throw new HttpError('Workout not found or not assigned by this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    workoutMockRepository.deactivateWorkout({
      studentId: body.studentId,
      workoutId: body.workoutId,
    })

    return {
      data: createPersonalDashboardOverview(personal.id),
    }
  })

  registerMockHandler<{ saved: boolean }>('POST', '/personal/students/progress/measurements/review', (request) => {
    const personal = ensurePersonalAccess(request)
    const body = (request.body ?? {}) as {
      studentId?: string
      targetLogId?: string
      comment?: string
      measurements?: {
        chestCm?: number
        waistCm?: number
        hipsCm?: number
        armCm?: number
        thighCm?: number
      }
    }

    if (!body.studentId || !body.targetLogId || !body.comment?.trim() || !body.measurements) {
      throw new HttpError('studentId, targetLogId, measurements and comment are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId, targetLogId, measurements and comment are required' },
        request,
      })
    }

    const linkedStudentIds = getLinkedStudentIdsByPersonal(personal.id)
    if (!linkedStudentIds.includes(body.studentId)) {
      throw new HttpError('studentId is not linked to this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const logs = getBodyMeasurementLogs(body.studentId)
    const target = logs.find((log) => log.id === body.targetLogId)
    if (!target) {
      throw new HttpError('Measurement log not found', {
        status: 404,
        code: 'http_error',
        data: { message: 'Measurement log not found' },
        request,
      })
    }

    const values = [
      body.measurements.chestCm,
      body.measurements.waistCm,
      body.measurements.hipsCm,
      body.measurements.armCm,
      body.measurements.thighCm,
    ]
    if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value <= 0)) {
      throw new HttpError('All measurements must be positive numbers', {
        status: 400,
        code: 'http_error',
        data: { message: 'All measurements must be positive numbers' },
        request,
      })
    }

    const nextLog: BodyMeasurementLog = {
      id: crypto.randomUUID(),
      studentId: body.studentId,
      date: target.date,
      measurements: {
        chestCm: Number(body.measurements.chestCm!.toFixed(1)),
        waistCm: Number(body.measurements.waistCm!.toFixed(1)),
        hipsCm: Number(body.measurements.hipsCm!.toFixed(1)),
        armCm: Number(body.measurements.armCm!.toFixed(1)),
        thighCm: Number(body.measurements.thighCm!.toFixed(1)),
      },
      recordedByRole: 'PERSONAL',
      recordedById: personal.id,
      comment: body.comment.trim(),
      createdAt: new Date().toISOString(),
      revisedFromLogId: target.id,
    }

    saveBodyMeasurementLogs(
      body.studentId,
      [...logs, nextLog].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)),
    )

    return {
      data: { saved: true },
    }
  })

  registerMockHandler('GET', '/personal/students/history', (request) => {
    const personal = ensurePersonalAccess(request)
    const studentId = request.query?.studentId

    if (!studentId || typeof studentId !== 'string') {
      throw new HttpError('studentId query param is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId query param is required' },
        request,
      })
    }

    const history = createPersonalStudentWorkoutHistory(personal.id, studentId)
    if (!history) {
      throw new HttpError('Student not found or not linked to this personal', {
        status: 404,
        code: 'http_error',
        data: { message: 'Student not found' },
        request,
      })
    }

    return { data: history }
  })

  registerMockHandler<{ sent: boolean }>('POST', '/personal/students/motivation', (request) => {
    const personal = ensurePersonalAccess(request)
    const body = (request.body ?? {}) as { studentId?: string; message?: string }

    if (!body.studentId || !body.message?.trim()) {
      throw new HttpError('studentId and message are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId and message are required' },
        request,
      })
    }

    const linkedStudentIds = getLinkedStudentIdsByPersonal(personal.id)
    if (!linkedStudentIds.includes(body.studentId)) {
      throw new HttpError('studentId is not linked to this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    pushProfessionalMessageNotification({
      studentId: body.studentId,
      professionalRole: 'PERSONAL',
      professionalName: personal.name,
      message: body.message.trim(),
    })

    return {
      data: { sent: true },
    }
  })

  registerMockHandler<{ granted: boolean }>('POST', '/personal/students/achievement', (request) => {
    const personal = ensurePersonalAccess(request)
    const body = (request.body ?? {}) as { studentId?: string; title?: string; description?: string }

    if (!body.studentId || !body.title?.trim() || !body.description?.trim()) {
      throw new HttpError('studentId, title and description are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'studentId, title and description are required' },
        request,
      })
    }

    const linkedStudentIds = getLinkedStudentIdsByPersonal(personal.id)
    if (!linkedStudentIds.includes(body.studentId)) {
      throw new HttpError('studentId is not linked to this personal', {
        status: 403,
        code: 'http_error',
        data: { message: 'Forbidden' },
        request,
      })
    }

    const achievement = grantSpecialAchievement({
      studentId: body.studentId,
      title: body.title,
      description: body.description,
      grantedByRole: 'PERSONAL',
      grantedById: personal.id,
    })

    if (achievement) {
      pushProfessionalAchievementNotification({
        achievementId: achievement.id,
        studentId: body.studentId,
        professionalRole: 'PERSONAL',
        title: body.title.trim(),
        description: body.description.trim(),
      })
    }

    return {
      data: { granted: true },
    }
  })

  registerMockHandler('GET', '/workouts/plan/snapshot', (request) => {
    ensureWorkoutAccess(request)
    const studentId = resolveWorkoutStudentIdFromCurrentUser()
    const permissions = getWorkoutPermissions(studentId)
    const workouts = workoutMockRepository.getWorkouts(studentId, {
      assignedByPersonalId: permissions.activePersonalId,
    })
    const exercises = workoutMockRepository.getExercises(studentId)
    const doneCount = exercises.filter((exercise) => exercise.status === 'done').length
    const totalCount = exercises.length
    const progressPct = Math.round((doneCount / Math.max(totalCount, 1)) * 100)

    return {
      data: {
        week: workoutMockRepository.getWeek(studentId, {
          assignedByPersonalId: permissions.activePersonalId,
        }),
        workouts,
        exercises,
        todayWorkout: workoutMockRepository.getTodayWorkout(progressPct, doneCount, totalCount, studentId),
        permissions: {
          hasActivePersonal: permissions.hasActivePersonal,
          canCreateQuickWorkout: permissions.canCreateQuickWorkout,
          canExecuteOnlyAssigned: permissions.canExecuteOnlyAssigned,
          canEditPlan: permissions.canEditPlan,
        },
      },
    }
  })

  registerMockHandler('PATCH', '/workouts/exercises/status', (request) => {
    ensureWorkoutAccess(request)
    const body = (request.body ?? {}) as { id?: string; status?: WorkoutSession['exercises'][number]['status'] }

    if (!body.id || !body.status) {
      throw new HttpError('id and status are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'id and status are required' },
        request,
      })
    }

    const studentId = resolveWorkoutStudentIdFromCurrentUser()
    workoutMockRepository.updateExerciseStatus(body.id, body.status, studentId)

    return { data: null }
  })

  registerMockHandler('POST', '/workouts/quick/create', (request) => {
    ensureWorkoutAccess(request)
    const studentId = resolveWorkoutStudentIdFromCurrentUser()
    const permissions = getWorkoutPermissions(studentId)

    if (!permissions.canCreateQuickWorkout) {
      throw new HttpError('Quick workout is blocked while student has active personal trainer', {
        status: 403,
        code: 'http_error',
        data: { message: 'Quick workout is blocked while student has active personal trainer' },
        request,
      })
    }

    const body = (request.body ?? {}) as { date?: string; title?: string }
    workoutMockRepository.createQuickWorkout({
      date: body.date,
      title: body.title,
    }, studentId)

    const workouts = workoutMockRepository.getWorkouts(studentId)
    const exercises = workoutMockRepository.getExercises(studentId)
    const doneCount = exercises.filter((exercise) => exercise.status === 'done').length
    const totalCount = exercises.length
    const progressPct = Math.round((doneCount / Math.max(totalCount, 1)) * 100)

    return {
      data: {
        week: workoutMockRepository.getWeek(studentId),
        workouts,
        exercises,
        todayWorkout: workoutMockRepository.getTodayWorkout(progressPct, doneCount, totalCount, studentId),
        permissions: {
          hasActivePersonal: permissions.hasActivePersonal,
          canCreateQuickWorkout: permissions.canCreateQuickWorkout,
          canExecuteOnlyAssigned: permissions.canExecuteOnlyAssigned,
          canEditPlan: permissions.canEditPlan,
        },
      },
    }
  })

  registerMockHandler<WorkoutSession>('POST', '/workouts/session/start', (request) => {
    ensureWorkoutAccess(request)
    const studentId = resolveWorkoutStudentIdFromCurrentUser()
    const body = (request.body ?? {}) as { workoutId?: string }
    const permissions = getWorkoutPermissions(studentId)
    const availableWorkouts = workoutMockRepository.getWorkouts(studentId, {
      assignedByPersonalId: permissions.activePersonalId,
    })

    if (permissions.canExecuteOnlyAssigned && availableWorkouts.length === 0) {
      throw new HttpError('No assigned workout available for this student', {
        status: 403,
        code: 'http_error',
        data: { message: 'No assigned workout available for this student' },
        request,
      })
    }

    const existingSession = workoutSessionMockRepository.getActiveSession()

    if (existingSession && existingSession.status !== 'completed') {
      if (!existingSession.workoutId || availableWorkouts.some((workout) => workout.id === existingSession.workoutId)) {
        return { data: existingSession }
      }

      workoutSessionMockRepository.clearActiveSession()
    }

    const selectedWorkout = body.workoutId
      ? availableWorkouts.find((workout) => workout.id === body.workoutId)
      : availableWorkouts.find((workout) => workout.date === toIsoDate(new Date())) ?? availableWorkouts[0]

    if (body.workoutId && !selectedWorkout) {
      throw new HttpError('Workout is not available for execution', {
        status: 403,
        code: 'http_error',
        data: { message: 'Workout is not available for execution' },
        request,
      })
    }

    const session = createWorkoutSession(studentId, selectedWorkout?.id)
    workoutSessionMockRepository.saveActiveSession(session)

    return { data: session }
  })

  registerMockHandler<WorkoutSession>('PATCH', '/workouts/session/progress', (request) => {
    ensureWorkoutAccess(request)
    const body = (request.body ?? {}) as { session?: WorkoutSession }

    if (!body.session) {
      throw new HttpError('Session payload is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'Session payload is required' },
        request,
      })
    }

    workoutSessionMockRepository.saveActiveSession(body.session)

    return { data: body.session }
  })

  registerMockHandler<WorkoutSessionSummary>('POST', '/workouts/session/complete', (request) => {
    ensureWorkoutAccess(request)
    const body = (request.body ?? {}) as { session?: WorkoutSession }

    if (!body.session) {
      throw new HttpError('Session payload is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'Session payload is required' },
        request,
      })
    }

    const completedSession: WorkoutSession = {
      ...body.session,
      status: 'completed',
      completedAt: new Date().toISOString(),
    }

    const studentId = resolveWorkoutStudentIdFromCurrentUser()
    const summary = createWorkoutSummary(completedSession, studentId)

    workoutSessionMockRepository.saveLastSummary(summary)
    workoutSessionMockRepository.appendSummary(summary)
    workoutSessionMockRepository.clearActiveSession()
    workoutMockRepository.resetExercisesProgress(studentId)

    return { data: summary }
  })

  registerMockHandler<RunOverview>('GET', '/run/overview', () => {
    return {
      data: createRunOverview(),
    }
  })

  registerMockHandler<RunSession>('POST', '/run/start', () => {
    const active = runMockRepository.getActiveSession()

    if (active && active.status !== 'completed') {
      return {
        data: active,
      }
    }

    const session: RunSession = {
      sessionId: crypto.randomUUID(),
      studentId: 'current-user',
      activityType: 'run',
      startedAt: new Date().toISOString(),
      status: 'active',
      elapsedSec: 0,
      distanceKm: 0,
      calories: 0,
      paceSecPerKm: 0,
      starsEarned: 0,
      progressImpactPct: 0,
      source: 'manual',
    }

    runMockRepository.saveActiveSession(session)

    return {
      data: session,
    }
  })

  registerMockHandler<RunSession>('PATCH', '/run/progress', (request) => {
    const body = (request.body ?? {}) as { session?: RunSession }

    if (!body.session) {
      throw new HttpError('Session payload is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'Session payload is required' },
        request,
      })
    }

    const nextSession: RunSession = {
      ...body.session,
      calories: Math.max(Math.round(body.session.distanceKm * 62), 0),
      paceSecPerKm:
        body.session.distanceKm > 0
          ? Math.round(body.session.elapsedSec / Math.max(body.session.distanceKm, 0.01))
          : 0,
      starsEarned: body.session.status === 'completed' ? body.session.starsEarned : 0,
      progressImpactPct: body.session.status === 'completed' ? body.session.progressImpactPct : 0,
    }

    runMockRepository.saveActiveSession(nextSession)

    return { data: nextSession }
  })

  registerMockHandler<RunSession>('POST', '/run/finish', (request) => {
    const body = (request.body ?? {}) as { session?: RunSession }

    if (!body.session) {
      throw new HttpError('Session payload is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'Session payload is required' },
        request,
      })
    }

    const endedAt = new Date().toISOString()
    const elapsedSec = Math.max(body.session.elapsedSec, Math.round((Date.parse(endedAt) - Date.parse(body.session.startedAt)) / 1000))
    const distanceKm = Number(Math.max(body.session.distanceKm, 0).toFixed(2))
    const calories = Math.max(Math.round(distanceKm * 62), 0)
    const paceSecPerKm = distanceKm > 0 ? Math.round(elapsedSec / Math.max(distanceKm, 0.01)) : 0

    const completed: RunSession = {
      ...body.session,
      status: 'completed',
      endedAt,
      elapsedSec,
      distanceKm,
      calories,
      paceSecPerKm,
      starsEarned: 14 + Math.round(distanceKm * 8) + Math.round(elapsedSec / 900) * 2,
      progressImpactPct: Math.min(Math.round(distanceKm * 7 + (elapsedSec / 60) * 0.6), 35),
    }

    runMockRepository.appendHistory(completed)
    runMockRepository.clearActiveSession()

    return {
      data: completed,
    }
  })

  registerMockHandler<RunRankingSnapshot>('GET', '/run/ranking', () => {
    return {
      data: createRunRankingSnapshot(),
    }
  })

  registerMockHandler<RankingSummary>('GET', '/ranking/summary', () => {
    const workoutHistory = workoutSessionMockRepository.getHistory()
    const runHistory = runMockRepository.getHistory()
    return {
      data: buildRankingSummary(workoutHistory, runHistory),
    }
  })

  registerMockHandler<RankingLeaderboard>('GET', '/ranking/leaderboard', (request) => {
    const url = new URL(request.url, window.location.origin)
    const rawPeriod = url.searchParams.get('period')
    const rawScope = url.searchParams.get('scope')
    const rawLeague = url.searchParams.get('league')
    const period: RankingPeriod = rawPeriod === 'monthly' ? 'monthly' : 'weekly'
    const scope: RankingScope =
      rawScope === 'neighborhood' || rawScope === 'city' || rawScope === 'gym' ? rawScope : 'global'
    const league: RankingLeague = rawLeague === 'silver' || rawLeague === 'gold' ? rawLeague : 'bronze'
    const workoutHistory = workoutSessionMockRepository.getHistory()
    const runHistory = runMockRepository.getHistory()

    return {
      data: buildRankingLeaderboard({ period, scope, league }, workoutHistory, runHistory),
    }
  })

  registerMockHandler<ProgressOverview>('GET', '/progress/overview', (request) => {
    const url = new URL(request.url, window.location.origin)
    const requestedRange = url.searchParams.get('range')
    const range: ProgressRange = requestedRange === '30d' || requestedRange === '90d' ? requestedRange : '7d'
    const history = workoutSessionMockRepository.getHistory()
    const runHistory = runMockRepository.getHistory()
    const studentId = resolveProgressStudentIdFromCurrentUser()
    return {
      data: createProgressOverview(history, runHistory, range, studentId),
    }
  })

  registerMockHandler<{ saved: boolean }>('POST', '/progress/weight', (request) => {
    const student = ensureStudentAccess(request)
    const body = (request.body ?? {}) as { weightKg?: number; date?: string }
    const weightKg = Number(body.weightKg)
    const date = body.date ?? toIsoDate(new Date())

    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      throw new HttpError('A positive weightKg is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'A positive weightKg is required' },
        request,
      })
    }

    const history = getProgressWeightLogs(student.id, date)
    const nextEntry: ProgressWeightLog = {
      id: crypto.randomUUID(),
      studentId: student.id,
      date,
      weightKg: Number(weightKg.toFixed(1)),
      recordedByRole: 'STUDENT',
      recordedById: student.id,
      createdAt: new Date().toISOString(),
    }
    saveProgressWeightLogs(
      student.id,
      [...history, nextEntry].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)),
    )

    return {
      data: { saved: true },
    }
  })

  registerMockHandler<{ saved: boolean }>('POST', '/progress/measurements', (request) => {
    ensureStudentAccess(request)
    throw new HttpError('Body measurements can only be updated by professionals', {
      status: 403,
      code: 'http_error',
      data: { message: 'Body measurements can only be updated by professionals' },
      request,
    })
  })

  registerMockHandler<{ sent: boolean }>('POST', '/progress/measurements/request-update', (request) => {
    const student = ensureStudentAccess(request)
    const body = (request.body ?? {}) as { note?: string }
    const created = createMeasurementsUpdateRequestsForStudent(student.id, body.note)

    if (!created.length) {
      throw new HttpError('No linked professionals available for measurements request', {
        status: 400,
        code: 'http_error',
        data: { message: 'No linked professionals available for measurements request' },
        request,
      })
    }

    upsertNotification({
      entityKey: `measurement-update-request:${student.id}:${created[0].createdAt}`,
      title: 'Solicitacao enviada',
      description: `Pedido de avaliacao enviado para ${created.length} profissional(is).`,
      at: created[0].createdAt,
      type: 'system',
      recipientStudentId: student.id,
      senderRole: 'STUDENT',
    })

    return {
      data: { sent: true },
    }
  })

  registerMockHandler<GamificationOverview>('GET', '/gamification/overview', () => {
    const history = workoutSessionMockRepository.getHistory()
    const runHistory = runMockRepository.getHistory()
    const studentId = resolveProgressStudentIdFromCurrentUser()
    return {
      data: createGamificationOverview(history, runHistory, studentId),
    }
  })

  registerMockHandler<NotificationsInbox>('GET', '/notifications/inbox', () => {
    return {
      data: getNotificationsInbox(),
    }
  })

  registerMockHandler<NotificationsInbox>('PATCH', '/notifications/read', (request) => {
    const profile = getProfileSettings()

    if (!profile.preferences.notificationsEnabled) {
      return {
        data: {
          unreadCount: 0,
          items: [],
        },
      }
    }

    const body = (request.body ?? {}) as { notificationId?: string }

    if (!body.notificationId) {
      throw new HttpError('notificationId is required', {
        status: 400,
        code: 'http_error',
        data: { message: 'notificationId is required' },
        request,
      })
    }

    const next = getStoredNotifications().map((item) =>
      item.id === body.notificationId
        ? {
            ...item,
            read: true,
          }
        : item,
    )
    saveStoredNotifications(next)

    return {
      data: getNotificationsInbox(),
    }
  })

  registerMockHandler<NotificationsInbox>('POST', '/notifications/read-all', () => {
    const profile = getProfileSettings()

    if (!profile.preferences.notificationsEnabled) {
      return {
        data: {
          unreadCount: 0,
          items: [],
        },
      }
    }

    const next = getStoredNotifications().map((item) => ({
      ...item,
      read: true,
    }))
    saveStoredNotifications(next)

    return {
      data: getNotificationsInbox(),
    }
  })

  registerMockHandler<StudentDashboard>('GET', '/student/dashboard', (request) => {
    ensureStudentAccess(request)
    const url = new URL(request.url, window.location.origin)
    const selectedDate = url.searchParams.get('date') ?? toIsoDate(new Date())

    return {
      data: buildStudentDashboard(selectedDate),
    }
  })

  registerMockHandler<{ mealId: string | null }>('POST', '/student/actions/register-meal', (request) => {
    ensureStudentAccess(request)
    const url = new URL(request.url, window.location.origin)
    const selectedDate = url.searchParams.get('date') ?? toIsoDate(new Date())
    const daysByDate = getNutritionDays(selectedDate)
    const selectedDay = daysByDate[selectedDate]

    if (!selectedDay) {
      return { data: { mealId: null } }
    }

    const pendingMeal = selectedDay.meals.find((meal) => meal.status === 'pending')

    if (!pendingMeal) {
      return { data: { mealId: null } }
    }

    upsertNutritionDay(
      selectedDate,
      (day) => ({
        ...day,
        meals: day.meals.map((meal) =>
          meal.id === pendingMeal.id
            ? {
                ...meal,
                status: 'done',
                completedAt: new Date().toISOString(),
              }
            : meal,
        ),
      }),
      request,
    )

    return {
      data: {
        mealId: pendingMeal.id,
      },
    }
  })

  registerMockHandler<{ totalWaterMl: number }>('POST', '/student/actions/register-water', (request) => {
    ensureStudentAccess(request)
    const body = (request.body ?? {}) as { ml?: number }
    const ml = Math.max(Math.round(body.ml ?? 300), 50)
    const url = new URL(request.url, window.location.origin)
    const selectedDate = url.searchParams.get('date') ?? toIsoDate(new Date())

    const updatedDay = upsertNutritionDay(
      selectedDate,
      (day) => ({
        ...day,
        waterLog: {
          entries: [
            ...day.waterLog.entries,
            {
              id: crypto.randomUUID(),
              ml,
              at: new Date().toISOString(),
            },
          ],
        },
      }),
      request,
    )

    return {
      data: {
        totalWaterMl: updatedDay.consumed.waterMl,
      },
    }
  })

  registerMockHandler<{ saved: boolean }>('POST', '/student/workouts/execution', (request) => {
    const student = ensureStudentAccess(request)
    const body = (request.body ?? {}) as StudentWorkoutExecutionInput

    if (!body.workoutId || !body.date) {
      throw new HttpError('workoutId and date are required', {
        status: 400,
        code: 'http_error',
        data: { message: 'workoutId and date are required' },
        request,
      })
    }

    const completedAt = new Date().toISOString()
    const summary: WorkoutSessionSummary = {
      sessionId: crypto.randomUUID(),
      studentId: student.id,
      workoutId: body.workoutId,
      title: body.title,
      startedAt: new Date(Date.now() - body.durationSec * 1000).toISOString(),
      completedAt,
      durationSec: body.durationSec,
      totalExercises: body.totalExercises,
      completedExercises: body.completedExercises,
      totalSets: body.totalSets,
      completedSets: body.completedSets,
      loadVolumeKg: body.loadVolumeKg,
      exerciseRecords: body.exerciseRecords,
      rewardStars: Math.max(body.completedExercises * 6, 18),
      streakDays: 4,
      currentLevel: 3,
      nextLevel: 4,
      currentLevelStars: 78,
      nextLevelStars: 120,
      starsToNextLevel: 42,
      weeklyCompletedWorkouts: 3,
      weeklyTargetWorkouts: 4,
      weeklyCompletionDelta: 1,
      completionMessage: 'Execucao registrada com sucesso.',
    }

    workoutSessionMockRepository.appendSummary(summary)
    workoutSessionMockRepository.saveLastSummary(summary)

    return {
      data: { saved: true },
    }
  })

  registerMockHandler<HomeDashboardOverview>('GET', '/home/dashboard', () => {
    return {
      data: createHomeDashboardOverview(),
    }
  })

  registerMockHandler<{ mealId: string | null }>('POST', '/home/actions/register-meal', (request) => {
    const todayDate = toIsoDate(new Date())
    const daysByDate = getNutritionDays(todayDate)
    const todayDay = daysByDate[todayDate]

    if (!todayDay) {
      return { data: { mealId: null } }
    }

    const pendingMeal = todayDay.meals.find((meal) => meal.status === 'pending')

    if (!pendingMeal) {
      return { data: { mealId: null } }
    }

    upsertNutritionDay(todayDate, (day) => ({
      ...day,
      meals: day.meals.map((meal) =>
        meal.id === pendingMeal.id
          ? {
              ...meal,
              status: 'done',
              completedAt: new Date().toISOString(),
            }
          : meal,
      ),
    }), request)

    return {
      data: {
        mealId: pendingMeal.id,
      },
    }
  })

  registerMockHandler<{ totalWaterMl: number }>('POST', '/home/actions/register-water', (request) => {
    const body = (request.body ?? {}) as { ml?: number }
    const ml = Math.max(Math.round(body.ml ?? 250), 50)
    const todayDate = toIsoDate(new Date())

    const updatedDay = upsertNutritionDay(todayDate, (day) => ({
      ...day,
      waterLog: {
        entries: [
          ...day.waterLog.entries,
          {
            id: crypto.randomUUID(),
            ml,
            at: new Date().toISOString(),
          },
        ],
      },
    }), request)

    return {
      data: {
        totalWaterMl: updatedDay.consumed.waterMl,
      },
    }
  })

  isRegistered = true
}
