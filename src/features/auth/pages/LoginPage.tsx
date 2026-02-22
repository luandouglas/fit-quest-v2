import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/shared/hooks'
import { FqButton, FqIcon, FqIconButton, FqInput, FqText } from '@/shared/ui'

const MIN_PASSWORD_LENGTH = 6

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const isDisabled = useMemo(() => {
    return !isEmailValid(email.trim()) || password.trim().length < MIN_PASSWORD_LENGTH
  }, [email, password])

  function handleLogin() {
    if (isDisabled) {
      return
    }

    const displayName = email.split('@')[0]?.trim() || 'atleta'
    login({ id: crypto.randomUUID(), name: displayName })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    handleLogin()
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="hidden items-center justify-center bg-surface-subtle px-8 lg:flex">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-8 inline-flex items-center gap-3 text-primary">
            <FqIcon name="star" size={30} className="text-star" />
            <span className="text-lg font-semibold leading-none text-foreground">FitQuest</span>
          </div>

          <FqText className="text-base leading-relaxed text-muted-foreground">
            Sua jornada fitness gamificada. Treinos, nutricao, corrida e progresso em um so lugar.
          </FqText>
        </div>
      </aside>

      <main className="flex items-start justify-center px-6 pb-10 pt-24 sm:px-8 lg:items-center lg:py-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-8 flex items-center justify-center gap-2 text-primary lg:hidden">
            <FqIcon name="star" size={28} className="text-star" />
            <span className="text-lg font-semibold leading-none text-foreground">FitQuest</span>
          </div>

          <header className="mb-8 sm:text-center">
            <FqText variant="title" as="h1" className="text-lg leading-tight text-foreground">
              Bem-vindo de volta
            </FqText>
            <FqText className="mt-2 text-base text-muted-foreground">Entre para continuar sua jornada</FqText>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <FqInput
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              autoComplete="email"
              className="h-12 rounded-xl border-input text-base"
            />

            <div className="relative">
              <FqInput
                type={showPassword ? 'text' : 'password'}
                label="Senha"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                autoComplete="current-password"
                className="h-12 rounded-xl border-input pr-12 text-base"
              />
              <FqIconButton
                icon={showPassword ? 'eyeOff' : 'eye'}
                label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                className="absolute right-2 top-[36px] h-8 w-8 text-muted-foreground hover:bg-accent"
              />
            </div>

            <div className="pt-1 text-right">
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <FqButton type="submit" tone="primary" size="lg" isDisabled={isDisabled} className="mt-1 w-full rounded-xl text-base">
              Entrar
            </FqButton>

            <p className="pt-7 text-center text-sm text-muted-foreground">
              Nao tem conta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
