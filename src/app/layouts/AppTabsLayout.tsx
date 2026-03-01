import { Suspense, lazy, useState } from 'react'

import { IonSpinner } from '@ionic/react'
import { Redirect, Route, NavLink, Switch } from 'react-router-dom'

import { HomePage } from '@/features/home'
import { ProfilePage } from '@/features/profile'
import { useAuth } from '@/shared/hooks'
import { FqButton, FqIcon, FqText } from '@/shared/ui'
import type { IconName } from '@/shared/ui'
import { cx } from '@/shared'

const TrainingPlanPage = lazy(() =>
  import('@/pages/training-plan/TrainingPlanPage').then((module) => ({
    default: module.TrainingPlanPage,
  })),
)

const NutritionPage = lazy(() =>
  import('@/features/nutrition/pages/NutritionPage').then((module) => ({
    default: module.NutritionPage,
  })),
)

const ProgressTabLazy = lazy(() =>
  import('@/features/progress/pages/ProgressPage').then((module) => ({
    default: module.ProgressPage,
  })),
)

const GamificationTabLazy = lazy(() =>
  import('@/features/gamification/pages/GamificationPage').then((module) => ({
    default: module.GamificationPage,
  })),
)

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

function TabsRouteFallback() {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IonSpinner name="crescent" />
        <FqText>Carregando modulo...</FqText>
      </div>
    </section>
  )
}

function SidebarNav({ onItemClick, isCollapsed = false }: { onItemClick?: () => void; isCollapsed?: boolean }) {
  return (
    <nav className={cx('flex-1 space-y-1 py-4', isCollapsed ? 'px-2' : 'px-3')}>
      {sidebarItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          exact={item.exact}
          onClick={onItemClick}
          title={isCollapsed ? item.label : undefined}
          aria-label={item.label}
          className={cx(
            'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isCollapsed ? 'justify-center' : 'justify-between',
            'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
          activeClassName="bg-sidebar-accent text-primary"
        >
          <span className={cx('flex items-center', isCollapsed ? 'gap-0' : 'gap-3')}>
            <FqIcon className="h-5 w-5 shrink-0" name={item.icon} />
            {!isCollapsed ? <span>{item.label}</span> : null}
          </span>

          {item.badge && !isCollapsed ? (
            <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}

function DesktopSidebar({
  isCollapsed,
  onToggleCollapse,
}: {
  isCollapsed: boolean
  onToggleCollapse: () => void
}) {
  const { user, logout } = useAuth()

  const firstLetter = (user?.name?.trim().charAt(0) ?? 'L').toUpperCase()
  const level = 12
  const points = 1250

  return (
    <aside
      className={cx(
        'hidden h-screen shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex',
        isCollapsed ? 'w-[84px]' : 'w-[270px]',
      )}
    >
      <div className={cx('border-b border-sidebar-border py-4', isCollapsed ? 'px-2' : 'px-6 py-6')}>
        <div className={cx('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {firstLetter}
          </div>
          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
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
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          className={cx(
            'mt-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sidebar-border bg-card text-foreground transition hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isCollapsed ? 'mx-auto' : '',
          )}
        >
          <FqIcon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} size={16} />
        </button>
      </div>

      <SidebarNav isCollapsed={isCollapsed} />

      <div className={cx('border-t border-sidebar-border p-3', isCollapsed ? 'px-2' : '')}>
        <FqButton
          variant="ghost"
          tone="neutral"
          leftIcon="logOut"
          onClick={logout}
          className={cx('w-full', isCollapsed ? 'justify-center px-0' : 'justify-start')}
          aria-label="Sair da conta"
          title={isCollapsed ? 'Sair' : undefined}
        >
          {!isCollapsed ? 'Sair' : ''}
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
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('fitquest:sidebar-collapsed') === '1'
  })

  function handleToggleDesktopSidebar() {
    setIsDesktopSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('fitquest:sidebar-collapsed', nextValue ? '1' : '0')
      }
      return nextValue
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DesktopSidebar isCollapsed={isDesktopSidebarCollapsed} onToggleCollapse={handleToggleDesktopSidebar} />
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
            <Route
              path="/tabs/workouts"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <TrainingPlanPage />
                </Suspense>
              )}
            />
            <Route path="/tabs/run" exact>
              <SidebarSectionPage title="Corrida" />
            </Route>
            <Route
              path="/tabs/nutrition/meal/:mealId"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <NutritionPage />
                </Suspense>
              )}
            />
            <Route
              path="/tabs/nutrition/history"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <NutritionPage />
                </Suspense>
              )}
            />
            <Route
              path="/tabs/nutrition"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <NutritionPage />
                </Suspense>
              )}
            />
            <Route
              path="/tabs/progress"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <ProgressTabLazy />
                </Suspense>
              )}
            />
            <Route
              path="/tabs/gamification"
              exact
              render={() => (
                <Suspense fallback={<TabsRouteFallback />}>
                  <GamificationTabLazy />
                </Suspense>
              )}
            />
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
