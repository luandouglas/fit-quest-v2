import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getIdTokenResult,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore/lite'

import { authService } from '@/shared/services/authService'
import { getFirebaseAuth, getFirebaseFirestore } from '@/shared/services/firebase'
import type {
  AuthSession,
  AuthUserRole,
  ProfessionalProfile,
} from '@/shared/types'

import type { AuthRepository } from './authRepository'

type FirebaseAuthUserProfileDocument = {
  email: string
  name: string
  role: AuthUserRole
  professionalProfile?: ProfessionalProfile
  createdAt: string
  updatedAt: string
}

function isAuthUserRole(value: unknown): value is AuthUserRole {
  return value === 'STUDENT' || value === 'PERSONAL' || value === 'NUTRITIONIST'
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

function inferRoleFromEmail(email: string) {
  const normalized = email.trim().toLowerCase()

  if (normalized.includes('personal')) {
    return 'PERSONAL' as const
  }

  if (normalized.includes('nutri')) {
    return 'NUTRITIONIST' as const
  }

  return 'STUDENT' as const
}

function getNameFromEmail(email: string | null | undefined) {
  const normalized = email?.trim()

  if (!normalized) {
    return 'Atleta FitQuest'
  }

  return normalized.split('@')[0]?.trim() || 'Atleta FitQuest'
}

function sanitizeProfessionalProfile(profile?: ProfessionalProfile) {
  if (!profile) {
    return undefined
  }

  return {
    title: profile.title,
    ...(profile.license ? { license: profile.license } : {}),
    specialties: Array.isArray(profile.specialties) ? profile.specialties : [],
  } satisfies ProfessionalProfile
}

function sanitizeUserProfileDocument(document: FirebaseAuthUserProfileDocument) {
  return {
    email: document.email,
    name: document.name,
    role: document.role,
    ...(document.professionalProfile
      ? { professionalProfile: sanitizeProfessionalProfile(document.professionalProfile) }
      : {}),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

function normalizeUserProfileDocument(
  candidate: Partial<FirebaseAuthUserProfileDocument> | undefined,
  fallback: FirebaseAuthUserProfileDocument,
) {
  const role = isAuthUserRole(candidate?.role) ? candidate.role : fallback.role
  const rawProfile = candidate?.professionalProfile
  const professionalProfile =
    role === 'STUDENT'
      ? undefined
      : sanitizeProfessionalProfile(rawProfile) ?? createProfessionalProfileByRole(role)

  return {
    email: typeof candidate?.email === 'string' && candidate.email.trim().length > 0 ? candidate.email : fallback.email,
    name: typeof candidate?.name === 'string' && candidate.name.trim().length > 0 ? candidate.name : fallback.name,
    role,
    professionalProfile,
    createdAt:
      typeof candidate?.createdAt === 'string' && candidate.createdAt.trim().length > 0
        ? candidate.createdAt
        : fallback.createdAt,
    updatedAt:
      typeof candidate?.updatedAt === 'string' && candidate.updatedAt.trim().length > 0
        ? candidate.updatedAt
        : fallback.updatedAt,
  } satisfies FirebaseAuthUserProfileDocument
}

function createFallbackProfileDocument(
  user: User,
  patch?: Partial<Pick<FirebaseAuthUserProfileDocument, 'name' | 'role' | 'professionalProfile'>>,
) {
  const now = new Date().toISOString()
  const role = patch?.role ?? inferRoleFromEmail(user.email ?? '')
  const professionalProfile =
    role === 'STUDENT'
      ? undefined
      : sanitizeProfessionalProfile(patch?.professionalProfile) ?? createProfessionalProfileByRole(role)

  return {
    email: user.email?.trim() || '',
    name: patch?.name?.trim() || user.displayName?.trim() || getNameFromEmail(user.email),
    role,
    professionalProfile,
    createdAt: now,
    updatedAt: now,
  } satisfies FirebaseAuthUserProfileDocument
}

async function resolveUserProfileDocument(
  user: User,
  patch?: Partial<Pick<FirebaseAuthUserProfileDocument, 'name' | 'role' | 'professionalProfile'>>,
) {
  const db = getFirebaseFirestore()
  const fallback = createFallbackProfileDocument(user, patch)

  if (!db) {
    return fallback
  }

  const reference = doc(db, 'users', user.uid)

  try {
    const snapshot = await getDoc(reference)

    if (patch) {
      const nextDocument = normalizeUserProfileDocument(
        snapshot.exists() ? snapshot.data() : undefined,
        {
          ...fallback,
          createdAt: snapshot.exists() ? normalizeUserProfileDocument(snapshot.data(), fallback).createdAt : fallback.createdAt,
          updatedAt: new Date().toISOString(),
        },
      )

      await setDoc(reference, sanitizeUserProfileDocument(nextDocument), {
        merge: true,
      })

      return nextDocument
    }

    if (snapshot.exists()) {
      return normalizeUserProfileDocument(snapshot.data(), fallback)
    }

    await setDoc(reference, sanitizeUserProfileDocument(fallback), { merge: true })
    return fallback
  } catch {
    const storedSession = authService.getStoredSession()

    if (storedSession?.user.id === user.uid) {
      return {
        email: user.email?.trim() || '',
        name: storedSession.user.name,
        role: storedSession.user.role,
        professionalProfile: storedSession.user.professionalProfile,
        createdAt: fallback.createdAt,
        updatedAt: fallback.updatedAt,
      } satisfies FirebaseAuthUserProfileDocument
    }

    return fallback
  }
}

async function buildSessionFromUser(
  user: User,
  patch?: Partial<Pick<FirebaseAuthUserProfileDocument, 'name' | 'role' | 'professionalProfile'>>,
) {
  const [token, tokenResult, profileDocument] = await Promise.all([
    user.getIdToken(),
    getIdTokenResult(user),
    resolveUserProfileDocument(user, patch),
  ])

  return {
    accessToken: token,
    refreshToken: user.refreshToken,
    expiresAt: tokenResult.expirationTime,
    user: {
      id: user.uid,
      name: profileDocument.name,
      role: profileDocument.role,
      professionalProfile: profileDocument.professionalProfile,
    },
  } satisfies AuthSession
}

async function syncSessionFromUser(
  user: User,
  patch?: Partial<Pick<FirebaseAuthUserProfileDocument, 'name' | 'role' | 'professionalProfile'>>,
) {
  const session = await buildSessionFromUser(user, patch)
  const db = getFirebaseFirestore()

  if (db && session.user.role === 'STUDENT') {
    await setDoc(
      doc(db, 'students', user.uid, 'profile', 'onboarding'),
      {
        requiresPasswordReset: false,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    ).catch(() => undefined)
  }

  authService.persistSession(session)
  return session
}

function getFirebaseErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message
    }

    return 'Nao foi possivel autenticar sua conta.'
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail ja esta em uso.'
    case 'auth/invalid-email':
      return 'Informe um e-mail valido.'
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-mail ou senha invalidos.'
    case 'auth/missing-password':
      return 'Informe sua senha.'
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.'
    case 'auth/network-request-failed':
      return 'Falha de rede ao autenticar. Tente novamente.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
    default:
      return error.message || 'Nao foi possivel autenticar sua conta.'
  }
}

function getRequiredAuth() {
  const auth = getFirebaseAuth()

  if (!auth) {
    throw new Error('Firebase auth nao esta configurado.')
  }

  return auth
}

export const firebaseAuthRepository: AuthRepository = {
  mode: 'firebase',
  shouldHydrateSession: true,
  clearSession() {
    return authService.clearSession()
  },
  getStoredSession() {
    return authService.getStoredSession()
  },
  async login(credentials) {
    const auth = getRequiredAuth()

    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email.trim(), credentials.password)
      return syncSessionFromUser(result.user)
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error))
    }
  },
  async logout() {
    const auth = getRequiredAuth()

    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error))
    } finally {
      authService.clearSession()
    }
  },
  persistSession(session) {
    return authService.persistSession(session)
  },
  async register(input) {
    const auth = getRequiredAuth()

    try {
      const result = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password)
      await updateProfile(result.user, {
        displayName: input.name.trim(),
      }).catch(() => undefined)

      return syncSessionFromUser(result.user, {
        name: input.name.trim(),
        role: input.role,
        professionalProfile: createProfessionalProfileByRole(input.role),
      })
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error))
    }
  },
  async requestPasswordReset(email) {
    const auth = getRequiredAuth()

    try {
      await sendPasswordResetEmail(auth, email.trim())
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error))
    }
  },
  subscribeToSession(listener) {
    const auth = getRequiredAuth()

    return onIdTokenChanged(auth, (user) => {
      if (!user) {
        authService.clearSession()
        listener(null)
        return
      }

      void syncSessionFromUser(user)
        .then((session) => {
          listener(session)
        })
        .catch(() => {
          const storedSession = authService.getStoredSession()

          if (storedSession?.user.id === user.uid) {
            listener(storedSession)
            return
          }

          authService.clearSession()
          listener(null)
        })
    })
  },
  updateStoredSessionUser(patch) {
    return authService.updateStoredSessionUser(patch)
  },
}
