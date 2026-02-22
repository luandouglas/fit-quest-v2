import { useEffect, useMemo, useState } from 'react'

import { categoriesOrder, componentRegistry, registryByCategory } from '@/app/pages/components/registry'
import { renderComponentPreview } from '@/app/pages/components/renderPreview'
import { toJsxSnippet } from '@/app/pages/components/jsxSnippet'
import type { ComponentControl } from '@/app/pages/components/types'
import { copyToClipboard, cx, debounce } from '@/shared/utils'

type EventEntry = {
  id: string
  at: string
  event: string
  payload?: unknown
}

type RightPanelTab = 'props' | 'state' | 'events'

const defaultComponent = componentRegistry[0]

export function ComponentsPage() {
  const [activeComponentName, setActiveComponentName] = useState(defaultComponent.name)
  const [componentProps, setComponentProps] = useState<Record<string, unknown>>(
    defaultComponent.defaultProps,
  )
  const [events, setEvents] = useState<EventEntry[]>([])
  const [activeTab, setActiveTab] = useState<RightPanelTab>('props')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [searchValue, setSearchValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() =>
    categoriesOrder.reduce<Record<string, boolean>>((acc, category) => {
      acc[category] = true
      return acc
    }, {}),
  )

  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value.toLowerCase())
      }, 180),
    [],
  )

  useEffect(() => {
    debouncedSetSearchTerm(searchValue)
  }, [searchValue, debouncedSetSearchTerm])

  const activeComponentMeta = useMemo(
    () => componentRegistry.find((item) => item.name === activeComponentName) ?? null,
    [activeComponentName],
  )

  useEffect(() => {
    if (!activeComponentMeta) {
      return
    }

    setComponentProps(activeComponentMeta.defaultProps)
    setEvents([])
  }, [activeComponentMeta])

  const filteredRegistry = useMemo(() => {
    if (!searchTerm) {
      return registryByCategory
    }

    return registryByCategory
      .map((section) => ({
        ...section,
        components: section.components.filter((component) => {
          const q = `${component.name} ${component.description}`.toLowerCase()
          return q.includes(searchTerm)
        }),
      }))
      .filter((section) => section.components.length > 0)
  }, [searchTerm])

  function logEvent(event: string, payload?: unknown) {
    const entry: EventEntry = {
      id: crypto.randomUUID(),
      at: new Date().toLocaleTimeString(),
      event,
      payload,
    }

    setEvents((current) => [entry, ...current].slice(0, 120))
  }

  function onPropChange(prop: string, value: unknown) {
    setComponentProps((current) => ({ ...current, [prop]: value }))
  }

  function handleControlChange(control: ComponentControl, rawValue: string | boolean) {
    if (control.type === 'boolean') {
      onPropChange(control.prop, rawValue)
      return
    }

    if (control.type === 'number') {
      const nextValue = Number(rawValue)
      onPropChange(control.prop, Number.isNaN(nextValue) ? 0 : nextValue)
      return
    }

    onPropChange(control.prop, rawValue)
  }

  async function handleCopyJsx() {
    if (!activeComponentMeta) {
      return
    }

    const snippet = toJsxSnippet(activeComponentMeta.name, componentProps)
    const copied = await copyToClipboard(snippet)

    logEvent('copyJsx', { copied, snippet })
  }

  function handleReset() {
    if (!activeComponentMeta) {
      return
    }

    setComponentProps(activeComponentMeta.defaultProps)
    setEvents([])
    logEvent('reset')
  }

  const stateToggles = useMemo(() => {
    const candidateKeys = ['isLoading', 'isDisabled', 'open', 'checked', 'selected', 'completed', 'unlocked']

    const booleanEntries = Object.entries(componentProps).filter(([, value]) => typeof value === 'boolean')

    candidateKeys.forEach((key) => {
      if (!booleanEntries.find(([propKey]) => propKey === key) && key in componentProps) {
        const value = componentProps[key]

        if (typeof value === 'boolean') {
          booleanEntries.push([key, value])
        }
      }
    })

    return booleanEntries
  }, [componentProps])

  return (
    <div className="h-screen w-full bg-zinc-100 text-zinc-900">
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div>
          <h1 className="text-lg font-semibold">Frontend Components</h1>
          <p className="text-xs text-zinc-500">Swagger interno do Design System FitQuest</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1">
          <button
            type="button"
            className={cx(
              'rounded-full px-3 py-1 text-xs font-medium transition',
              device === 'desktop' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
            )}
            onClick={() => setDevice('desktop')}
          >
            Desktop
          </button>
          <button
            type="button"
            className={cx(
              'rounded-full px-3 py-1 text-xs font-medium transition',
              device === 'mobile' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
            )}
            onClick={() => setDevice('mobile')}
          >
            Mobile
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="w-72 border-r border-zinc-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white p-3">
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar componente"
              className="h-9 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="h-[calc(100%-3.75rem)] overflow-y-auto p-2">
            {filteredRegistry.map((section) => {
              const isExpanded = expandedCategories[section.category]

              return (
                <div key={section.category} className="mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedCategories((current) => ({
                        ...current,
                        [section.category]: !current[section.category],
                      }))
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:bg-zinc-100"
                  >
                    <span>{section.category}</span>
                    <span>{isExpanded ? '-' : '+'}</span>
                  </button>
                  {isExpanded ? (
                    <ul className="space-y-1">
                      {section.components.map((component) => (
                        <li key={component.name}>
                          <button
                            type="button"
                            onClick={() => setActiveComponentName(component.name)}
                            className={cx(
                              'w-full rounded-lg px-2 py-1.5 text-left text-sm transition',
                              component.name === activeComponentName
                                ? 'bg-blue-50 font-medium text-blue-700'
                                : 'text-zinc-600 hover:bg-zinc-100',
                            )}
                          >
                            {component.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4">
          {activeComponentMeta ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                  <div>
                    <h2 className="text-base font-semibold">{activeComponentMeta.name}</h2>
                    <p className="text-sm text-zinc-500">{activeComponentMeta.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJsx}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Copy JSX
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {activeComponentMeta.presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setComponentProps((current) => ({
                          ...current,
                          ...preset.props,
                        }))
                        logEvent('preset', preset.label)
                      }}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                  <div className={cx(device === 'mobile' ? 'w-[360px]' : 'w-full max-w-4xl')}>
                    {renderComponentPreview({
                      name: activeComponentMeta.name,
                      props: componentProps,
                      onPropChange,
                      logEvent,
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
              Nenhum componente selecionado.
            </div>
          )}
        </main>

        <aside className="w-96 border-l border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-2">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1">
              <button
                type="button"
                className={cx(
                  'rounded-md px-2 py-1.5 text-xs font-medium transition',
                  activeTab === 'props' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600',
                )}
                onClick={() => setActiveTab('props')}
              >
                Props
              </button>
              <button
                type="button"
                className={cx(
                  'rounded-md px-2 py-1.5 text-xs font-medium transition',
                  activeTab === 'state' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600',
                )}
                onClick={() => setActiveTab('state')}
              >
                State
              </button>
              <button
                type="button"
                className={cx(
                  'rounded-md px-2 py-1.5 text-xs font-medium transition',
                  activeTab === 'events' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600',
                )}
                onClick={() => setActiveTab('events')}
              >
                Events
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-4.5rem)] overflow-y-auto p-3">
            {activeTab === 'props' ? (
              <div className="space-y-3">
                {activeComponentMeta?.controls.length ? (
                  activeComponentMeta.controls.map((control) => {
                    const value = componentProps[control.prop]

                    return (
                      <label key={control.prop} className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-zinc-500">{control.label}</span>
                        {control.type === 'select' ? (
                          <select
                            value={String(value ?? '')}
                            onChange={(event) => handleControlChange(control, event.target.value)}
                            className="h-9 rounded-lg border border-zinc-300 px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            {control.options?.map((option) => (
                              <option key={option} value={option}>
                                {option || '(empty)'}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {control.type === 'text' ? (
                          <input
                            value={String(value ?? '')}
                            onChange={(event) => handleControlChange(control, event.target.value)}
                            className="h-9 rounded-lg border border-zinc-300 px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          />
                        ) : null}
                        {control.type === 'number' ? (
                          <input
                            type="number"
                            value={String(value ?? 0)}
                            min={control.min}
                            max={control.max}
                            step={control.step}
                            onChange={(event) => handleControlChange(control, event.target.value)}
                            className="h-9 rounded-lg border border-zinc-300 px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          />
                        ) : null}
                        {control.type === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(event) => handleControlChange(control, event.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300"
                          />
                        ) : null}
                      </label>
                    )
                  })
                ) : (
                  <p className="text-xs text-zinc-500">Sem props editáveis para este componente.</p>
                )}
              </div>
            ) : null}

            {activeTab === 'state' ? (
              <div className="space-y-3">
                {stateToggles.length ? (
                  stateToggles.map(([prop, value]) => (
                    <label key={prop} className="flex items-center justify-between rounded-lg border border-zinc-200 p-2">
                      <span className="text-xs font-medium text-zinc-600">{prop}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) => onPropChange(prop, event.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300"
                      />
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Sem states booleanos detectados.</p>
                )}
              </div>
            ) : null}

            {activeTab === 'events' ? (
              <div className="space-y-2">
                {events.length ? (
                  events.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-700">{entry.event}</span>
                        <span className="text-zinc-400">{entry.at}</span>
                      </div>
                      {entry.payload !== undefined ? (
                        <pre className="mt-1 overflow-x-auto text-[11px] text-zinc-500">
                          {JSON.stringify(entry.payload, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Nenhum evento registrado.</p>
                )}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
