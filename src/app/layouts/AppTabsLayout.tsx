import { useEffect, useState } from 'react'
import { Redirect, Route, NavLink, Switch, useLocation } from 'react-router-dom'

import { HomePage } from '@/features/home'
import { NutritionPage } from '@/features/nutrition'
import { ProfilePage } from '@/features/profile'
import { TrainingPlanPage } from '@/pages/training-plan'
import { useAuth } from '@/shared/hooks'
import { FqButton, FqIcon, FqText } from '@/shared/ui'
import type { IconName } from '@/shared/ui'
import { cx } from '@/shared'

type SidebarItem = {
  label: string
  icon: IconName
  path: string
  exact?: boolean
  badge?: number
}

const sidebarItems: SidebarItem[] = [
  { label: 'Inicio', icon: 'home', path: '/tabs/home', exact: true },
  { label: 'Treinos', icon: 'dumbbell', path: '/tabs/workouts' },
  { label: 'Corrida', icon: 'mapPin', path: '/tabs/run' },
  { label: 'Nutricao', icon: 'utensils', path: '/tabs/nutrition' },
  { label: 'Progresso', icon: 'chart', path: '/tabs/progress' },
  { label: 'Gamificacao', icon: 'gamepad', path: '/tabs/gamification' },
  { label: 'Ranking', icon: 'trophy', path: '/tabs/ranking' },
  { label: 'Notificacoes', icon: 'bell', path: '/tabs/notifications', badge: 2 },
  { label: 'Perfil', icon: 'user', path: '/tabs/profile', exact: true },
]

function SidebarSectionPage({ title }: { title: string }) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <FqText variant="title" as="h1" className="text-lg">
        {title}
      </FqText>
      <FqText className="mt-2 text-muted-foreground">Essa area ainda esta em desenvolvimento.</FqText>
    </section>
  )
}

function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {sidebarItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          exact={item.exact}
          onClick={onItemClick}
          className={cx(
            'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
          activeClassName="bg-sidebar-accent text-primary"
        >
          <span className="flex items-center gap-3">
            <FqIcon className="h-5 w-5 shrink-0" name={item.icon} />
            <span>{item.label}</span>
          </span>

          {item.badge ? (
            <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}

function DesktopSidebar() {
  const { user, logout } = useAuth()

  const firstLetter = (user?.name?.trim().charAt(0) ?? 'L').toUpperCase()
  const level = 12
  const points = 1250

  return (
    <aside className="hidden h-screen w-[270px] shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="border-b border-sidebar-border px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {firstLetter}
          </div>
          <div className="flex-1 min-w-0">
            <FqText as="p" className="truncate text-sm font-semibold text-sidebar-foreground">
              {user?.name ?? 'Lucas Silva'}
            </FqText>
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <span>Nivel {level}</span>
              <span>-</span>
              <FqIcon name="star" size={14} className="text-star" />
              <span>{points}</span>
            </div>
          </div>
        </div>
      </div>

      <SidebarNav />

      <div className="border-t border-sidebar-border p-3">
        <FqButton variant="ghost" tone="neutral" leftIcon="logOut" onClick={logout} className="w-full justify-start">
          Sair
        </FqButton>
      </div>
    </aside>
  )
}

function MobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { logout } = useAuth()

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className={cx(
          'fixed inset-0 z-40 bg-foreground/25 transition-opacity lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cx(
          'fixed left-0 right-0 top-0 z-50 flex max-h-[85vh] flex-col overflow-y-auto border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <FqIcon name="home" />
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="relative text-sidebar-foreground" aria-label="Notificacoes">
              <FqIcon name="bell" />
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
                2
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-sidebar-border bg-card text-foreground"
              aria-label="Fechar menu"
            >
              <FqIcon name="x" />
            </button>
          </div>
        </div>

        <SidebarNav onItemClick={onClose} />

        <div className="border-t border-sidebar-border p-3">
          <FqButton variant="ghost" tone="neutral" leftIcon="logOut" onClick={logout} className="w-full justify-start">
            Sair
          </FqButton>
        </div>
      </aside>
    </>
  )
}

export function AppTabsLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DesktopSidebar />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <FqIcon name="menu" />
          </button>
          <FqText as="p" className="text-base font-semibold text-foreground">
            FitQuest
          </FqText>
          <div className="h-10 w-10" />
        </header>

        <div className="px-4 pb-5 pt-20 lg:p-5">
          <Switch>
            <Route path="/tabs/workouts" component={TrainingPlanPage} exact />
            <Route path="/tabs/run" exact>
              <SidebarSectionPage title="Corrida" />
            </Route>
            <Route path="/tabs/nutrition/meal/:mealId" component={NutritionPage} exact />
            <Route path="/tabs/nutrition/history" component={NutritionPage} exact />
            <Route path="/tabs/nutrition" component={NutritionPage} exact />
            <Route path="/tabs/progress" exact>
              <SidebarSectionPage title="Progresso" />
            </Route>
            <Route path="/tabs/gamification" exact>
              <SidebarSectionPage title="Gamificacao" />
            </Route>
            <Route path="/tabs/ranking" exact>
              <SidebarSectionPage title="Ranking" />
            </Route>
            <Route path="/tabs/notifications" exact>
              <SidebarSectionPage title="Notificacoes" />
            </Route>
            <Route path="/tabs/home" component={HomePage} exact />
            <Route path="/tabs/profile" component={ProfilePage} exact />
            <Route exact path="/tabs">
              <Redirect to="/tabs/home" />
            </Route>
            <Route>
              <Redirect to="/tabs/home" />
            </Route>
          </Switch>
        </div>
      </main>
    </div>
  )
}
