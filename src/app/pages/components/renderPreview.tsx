import {
  FqAchievementCard,
  FqAlert,
  FqAvatar,
  FqBadge,
  FqBreadcrumb,
  FqButton,
  FqCalendarHeatmap,
  FqCard,
  FqCarousel,
  FqCheckbox,
  FqChip,
  FqContainer,
  FqContent,
  FqDatePicker,
  FqDialog,
  FqDivider,
  FqDrawer,
  FqDropdownMenu,
  FqEmptyState,
  FqExerciseItem,
  FqFileUpload,
  FqFooter,
  FqGrid,
  FqHeader,
  FqIcon,
  FqIconButton,
  FqInput,
  FqLevelBadge,
  FqList,
  FqListItem,
  FqLoadingSpinner,
  FqModal,
  FqMultiSelect,
  FqNavbar,
  FqPage,
  FqPagination,
  FqPopover,
  FqProgressBar,
  FqProgressRing,
  FqRadio,
  FqRadioGroup,
  FqSection,
  FqSelect,
  FqSkeleton,
  FqSlider,
  FqSpacer,
  FqStack,
  FqStarRating,
  FqStatCard,
  FqSwitch,
  FqTabItem,
  FqTable,
  FqTabs,
  FqTag,
  FqText,
  FqTextarea,
  FqTimePicker,
  FqTimeline,
  FqToastProvider,
  FqTooltip,
  FqWorkoutCard,
  FqXPBar,
  useToast,
} from '@/shared/ui'
import type { FqTone, IconName } from '@/shared/ui'

type PreviewRendererContext = {
  name: string
  props: Record<string, unknown>
  onPropChange: (prop: string, value: unknown) => void
  logEvent: (event: string, payload?: unknown) => void
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function stringifyCarouselItem(item: unknown) {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item)
  }

  if (typeof item === 'object' && item !== null) {
    if ('title' in item && typeof item.title === 'string') {
      return item.title
    }

    if ('label' in item && typeof item.label === 'string') {
      return item.label
    }

    return JSON.stringify(item)
  }

  return 'Item'
}

function asTone(value: unknown, fallback: FqTone = 'neutral'): FqTone {
  const tones: FqTone[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'neutral']
  return tones.includes(value as FqTone) ? (value as FqTone) : fallback
}

function ToastLauncher({ props, logEvent }: { props: Record<string, unknown>; logEvent: PreviewRendererContext['logEvent'] }) {
  const { toast } = useToast()

  return (
    <FqButton
      onClick={() => {
        const payload = {
          title: asString(props.title, 'Toast'),
          description: asString(props.description, ''),
          tone: asTone(props.tone, 'success'),
        }

        toast(payload)
        logEvent('toast', payload)
      }}
    >
      Trigger Toast
    </FqButton>
  )
}

export function renderComponentPreview({
  name,
  props,
  onPropChange,
  logEvent,
}: PreviewRendererContext) {
  switch (name) {
    case 'FqText':
      return <FqText {...props}>{asString(props.children, 'Text')}</FqText>

    case 'FqIcon':
      return (
        <FqIcon
          {...props}
          name={asString(props.name, 'dumbbell') as IconName}
          size={asNumber(props.size, 20)}
        />
      )

    case 'FqButton':
      {
        const previewSizes = ['sm', 'md', 'lg'] as const
        const previewVariants = ['solid', 'outline', 'ghost'] as const
        const previewTones = ['primary', 'secondary', 'danger'] as const

        return (
          <div className="w-full space-y-6">
            <FqButton
              {...props}
              onClick={() => {
                logEvent('onClick')
              }}
            >
              {asString(props.children, 'Button')}
            </FqButton>

            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-zinc-700">States (normal/loading/disabled)</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {previewSizes.map((size) => (
                  <div key={size} className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{size}</p>
                    <FqButton size={size} tone="primary" variant="solid">Normal</FqButton>
                    <FqButton size={size} tone="primary" variant="solid" isLoading>Loading</FqButton>
                    <FqButton size={size} tone="primary" variant="solid" isDisabled>Disabled</FqButton>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-zinc-700">Tone/Variant Matrix (sm/md/lg)</h4>
              <div className="space-y-4">
                {previewVariants.map((variant) => (
                  <div key={variant} className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{variant}</p>
                    <div className="space-y-2">
                      {previewSizes.map((size) => (
                        <div key={`${variant}-${size}`} className="flex flex-wrap items-center gap-2">
                          {previewTones.map((tone) => (
                            <FqButton key={`${variant}-${size}-${tone}`} size={size} variant={variant} tone={tone}>
                              {`${tone} ${size}`}
                            </FqButton>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

    case 'FqIconButton':
      return (
        <FqIconButton
          {...props}
          icon={asString(props.icon, 'settings') as IconName}
          label={asString(props.label, 'Icon button')}
          onClick={() => {
            logEvent('onClick')
          }}
        />
      )

    case 'FqBadge':
      return <FqBadge {...props}>{asString(props.children, 'Badge')}</FqBadge>

    case 'FqTag':
      return <FqTag {...props}>{asString(props.children, 'Tag')}</FqTag>

    case 'FqDivider':
      return (
        <div className="flex h-20 w-full items-center justify-center gap-4">
          <span className="text-xs text-zinc-500">A</span>
          <FqDivider {...props} className={asString(props.orientation) === 'vertical' ? 'h-full' : ''} />
          <span className="text-xs text-zinc-500">B</span>
        </div>
      )

    case 'FqSpacer':
      return (
        <div className="rounded-xl border border-zinc-200 p-4 text-center text-xs text-zinc-500">
          before
          <FqSpacer {...props} />
          after
        </div>
      )

    case 'FqInput':
      return (
        <FqInput
          {...props}
          value={asString(props.value, '')}
          onChange={(event) => {
            onPropChange('value', event.target.value)
            logEvent('onChange', event.target.value)
          }}
        />
      )

    case 'FqTextarea':
      return (
        <FqTextarea
          {...props}
          value={asString(props.value, '')}
          onChange={(event) => {
            onPropChange('value', event.target.value)
            logEvent('onChange', event.target.value)
          }}
        />
      )

    case 'FqSelect':
      return (
        <FqSelect
          {...props}
          options={
            Array.isArray(props.options)
              ? (props.options as Array<{ label: string; value: string }>)
              : []
          }
          value={asString(props.value, '')}
          onChange={(event) => {
            onPropChange('value', event.target.value)
            logEvent('onChange', event.target.value)
          }}
        />
      )

    case 'FqMultiSelect':
      return (
        <FqMultiSelect
          {...props}
          options={
            Array.isArray(props.options)
              ? (props.options as Array<{ label: string; value: string }>)
              : []
          }
          value={Array.isArray(props.value) ? (props.value as string[]) : []}
          onValueChange={(value) => {
            onPropChange('value', value)
            logEvent('onValueChange', value)
          }}
        />
      )

    case 'FqCheckbox':
      return (
        <FqCheckbox
          {...props}
          checked={asBoolean(props.checked)}
          onChange={(event) => {
            onPropChange('checked', event.target.checked)
            logEvent('onChange', event.target.checked)
          }}
        />
      )

    case 'FqRadio':
      return (
        <FqRadio
          {...props}
          label={asString(props.label, 'Opção')}
          checked={asBoolean(props.checked)}
          onChange={(event) => {
            onPropChange('checked', event.target.checked)
            logEvent('onChange', event.target.checked)
          }}
        />
      )

    case 'FqRadioGroup':
      return (
        <FqRadioGroup
          {...props}
          name={asString(props.name, 'radio-group')}
          options={
            Array.isArray(props.options)
              ? (props.options as Array<{ label: string; value: string; description?: string }>)
              : []
          }
          value={asString(props.value, '')}
          onChange={(value) => {
            onPropChange('value', value)
            logEvent('onChange', value)
          }}
        />
      )

    case 'FqSwitch':
      return (
        <FqSwitch
          {...props}
          checked={asBoolean(props.checked)}
          onCheckedChange={(checked) => {
            onPropChange('checked', checked)
            logEvent('onCheckedChange', checked)
          }}
        />
      )

    case 'FqSlider':
      return (
        <FqSlider
          {...props}
          value={asNumber(props.value)}
          onChange={(event) => {
            const value = Number(event.target.value)
            onPropChange('value', value)
            logEvent('onChange', value)
          }}
        />
      )

    case 'FqDatePicker':
      return (
        <FqDatePicker
          {...props}
          value={asString(props.value, '')}
          onChange={(event) => {
            onPropChange('value', event.target.value)
            logEvent('onChange', event.target.value)
          }}
        />
      )

    case 'FqTimePicker':
      return (
        <FqTimePicker
          {...props}
          value={asString(props.value, '')}
          onChange={(event) => {
            onPropChange('value', event.target.value)
            logEvent('onChange', event.target.value)
          }}
        />
      )

    case 'FqFileUpload':
      return (
        <FqFileUpload
          {...props}
          onFilesChange={(files) => {
            logEvent('onFilesChange', files.map((file) => file.name))
          }}
        />
      )

    case 'FqPage':
      return (
        <FqPage className="min-h-[240px] rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          {asString(props.children, 'Page content')}
        </FqPage>
      )

    case 'FqContent':
      return (
        <FqContent className="max-w-3xl rounded-xl border border-zinc-200 bg-white">
          {asString(props.children, 'Content')}
        </FqContent>
      )

    case 'FqContainer':
      return (
        <FqContainer {...props}>
          <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
            {asString(props.children, 'Container content')}
          </div>
        </FqContainer>
      )

    case 'FqStack':
      return (
        <FqStack {...props}>
          <div className="rounded bg-blue-100 px-3 py-2 text-sm">Item 1</div>
          <div className="rounded bg-blue-100 px-3 py-2 text-sm">Item 2</div>
          <div className="rounded bg-blue-100 px-3 py-2 text-sm">Item 3</div>
        </FqStack>
      )

    case 'FqGrid':
      return (
        <FqGrid {...props} columns={asNumber(props.columns, 3) as 1 | 2 | 3 | 4 | 5 | 6}>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="rounded-lg border border-zinc-200 bg-zinc-100 p-3 text-center text-xs text-zinc-600"
            >
              Card {index + 1}
            </div>
          ))}
        </FqGrid>
      )

    case 'FqCard':
      return (
        <FqCard
          {...props}
          footer={
            <FqButton size="sm" onClick={() => logEvent('onClick')}>Action</FqButton>
          }
        >
          {asString(props.children, 'Card body')}
        </FqCard>
      )

    case 'FqSection':
      return <FqSection {...props}>{asString(props.children, 'Section content')}</FqSection>

    case 'FqHeader':
      return <FqHeader>{asString(props.children, 'Header content')}</FqHeader>

    case 'FqFooter':
      return <FqFooter>{asString(props.children, 'Footer content')}</FqFooter>

    case 'FqTabs':
      return (
        <FqTabs
          {...props}
          defaultValue={asString(props.defaultValue, 'overview')}
          onValueChange={(value) => {
            onPropChange('defaultValue', value)
            logEvent('onValueChange', value)
          }}
        />
      )

    case 'FqTabItem':
      return (
        <FqTabs
          items={[
            { value: 'tab-1', label: 'Tab 1', content: 'Content 1' },
            { value: 'tab-2', label: 'Tab 2', content: 'Content 2' },
          ]}
          defaultValue="tab-1"
        >
          <FqTabItem value={asString(props.value, 'tab-custom')}>
            {asString(props.children, 'Custom item')}
          </FqTabItem>
        </FqTabs>
      )

    case 'FqBreadcrumb':
      return (
        <FqBreadcrumb
          {...props}
          items={Array.isArray(props.items) ? (props.items as Array<{ label: string; href?: string }>) : []}
        />
      )

    case 'FqPagination':
      return (
        <FqPagination
          {...props}
          currentPage={asNumber(props.currentPage, 1)}
          totalPages={asNumber(props.totalPages, 1)}
          onPageChange={(page) => {
            onPropChange('currentPage', page)
            logEvent('onPageChange', page)
          }}
        />
      )

    case 'FqDrawer':
      return (
        <div className="relative h-80 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <FqButton
            onClick={() => onPropChange('open', true)}
            leftIcon="menu"
          >
            Abrir drawer
          </FqButton>
          <FqDrawer
            {...props}
            open={asBoolean(props.open)}
            onOpenChange={(open) => {
              onPropChange('open', open)
              logEvent('onOpenChange', open)
            }}
          >
            <p className="text-sm text-zinc-600">{asString(props.children, 'Conteúdo do drawer')}</p>
          </FqDrawer>
        </div>
      )

    case 'FqNavbar':
      return (
        <FqNavbar
          {...props}
          onMenuClick={() => {
            logEvent('onMenuClick')
          }}
        />
      )

    case 'FqModal':
      return (
        <div className="relative h-80 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <FqButton onClick={() => onPropChange('open', true)}>Abrir modal</FqButton>
          <FqModal
            {...props}
            open={asBoolean(props.open)}
            onOpenChange={(open) => {
              onPropChange('open', open)
              logEvent('onOpenChange', open)
            }}
          >
            <p className="text-sm text-zinc-600">{asString(props.children, 'Modal content')}</p>
          </FqModal>
        </div>
      )

    case 'FqDialog':
      return (
        <div className="relative h-80 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <FqButton onClick={() => onPropChange('open', true)}>Abrir dialog</FqButton>
          <FqDialog
            {...props}
            open={asBoolean(props.open)}
            onOpenChange={(open) => {
              onPropChange('open', open)
              logEvent('onOpenChange', open)
            }}
            onConfirm={() => {
              logEvent('onConfirm')
            }}
            onCancel={() => {
              logEvent('onCancel')
            }}
          >
            {asString(props.children, 'Dialog body')}
          </FqDialog>
        </div>
      )

    case 'FqToast':
      return (
        <FqToastProvider>
          <ToastLauncher props={props} logEvent={logEvent} />
        </FqToastProvider>
      )

    case 'FqAlert':
      return <FqAlert {...props}>{asString(props.children, 'Alert message')}</FqAlert>

    case 'FqLoadingSpinner':
      return <FqLoadingSpinner {...props} />

    case 'FqSkeleton':
      return <FqSkeleton {...props} className="h-24 w-full" />

    case 'FqProgressBar':
      return <FqProgressBar {...props} value={asNumber(props.value, 0)} />

    case 'FqEmptyState':
      return (
        <FqEmptyState
          {...props}
          title={asString(props.title, 'Empty state')}
          onAction={() => {
            logEvent('onAction')
          }}
        />
      )

    case 'FqTooltip':
      return (
        <FqTooltip
          content={asString(props.content, 'Tooltip')}
          side={asString(props.side, 'top') as 'top' | 'right' | 'bottom' | 'left'}
        >
          <FqButton variant="outline">Hover me</FqButton>
        </FqTooltip>
      )

    case 'FqPopover':
      return (
        <FqPopover
          content={<div className="text-sm text-zinc-600">{asString(props.content, 'Popover content')}</div>}
          side={asString(props.side, 'bottom') as 'top' | 'right' | 'bottom' | 'left'}
          trigger={<FqButton variant="outline">Open popover</FqButton>}
        />
      )

    case 'FqDropdownMenu':
      return (
        <FqDropdownMenu
          {...props}
          items={
            Array.isArray(props.items)
              ? (props.items as Array<{ label: string }>).map((item) => ({
                  ...item,
                  onSelect: () => {
                    logEvent('onSelect', item.label)
                  },
                }))
              : []
          }
          trigger={<FqButton variant="outline">Open menu</FqButton>}
        />
      )

    case 'FqList':
      return (
        <FqList>
          <FqListItem>Item 1</FqListItem>
          <FqListItem>Item 2</FqListItem>
          <FqListItem>Item 3</FqListItem>
        </FqList>
      )

    case 'FqListItem':
      return <FqListItem>{asString(props.children, 'Item')}</FqListItem>

    case 'FqAvatar':
      return <FqAvatar {...props} />

    case 'FqChip':
      return (
        <FqChip
          {...props}
          selected={asBoolean(props.selected)}
          onSelectedChange={(selected) => {
            onPropChange('selected', selected)
            logEvent('onSelectedChange', selected)
          }}
        >
          {asString(props.children, 'Chip')}
        </FqChip>
      )

    case 'FqTable':
      return (
        <FqTable
          columns={
            Array.isArray(props.columns)
              ? (
                  props.columns as Array<{
                    key: string
                    header: string
                    align?: 'left' | 'center' | 'right'
                  }>
                ).map((column) => ({
                    key: column.key,
                    header: column.header,
                    align: column.align,
                  }))
              : []
          }
          data={Array.isArray(props.data) ? (props.data as Array<Record<string, string>>) : []}
        />
      )

    case 'FqStatCard':
      return (
        <FqStatCard
          {...props}
          label={asString(props.label, 'Métrica')}
          value={asString(props.value, '0')}
        />
      )

    case 'FqTimeline':
      return (
        <FqTimeline
          items={Array.isArray(props.items) ? (props.items as Array<{ id: string; title: string; description?: string; time?: string }>) : []}
        />
      )

    case 'FqCarousel': {
      const items = Array.isArray(props.items)
        ? props.items.map((item, index) => (
            <div key={`${stringifyCarouselItem(item)}-${index}`} className="text-sm text-zinc-700">
              {stringifyCarouselItem(item)}
            </div>
          ))
        : []

      return <FqCarousel items={items} initialIndex={asNumber(props.initialIndex, 0)} />
    }

    case 'FqStarRating':
      return (
        <FqStarRating
          {...props}
          value={asNumber(props.value, 0)}
          onChange={(value) => {
            onPropChange('value', value)
            logEvent('onChange', value)
          }}
        />
      )

    case 'FqXPBar':
      return <FqXPBar {...props} currentXP={asNumber(props.currentXP, 0)} targetXP={asNumber(props.targetXP, 1)} />

    case 'FqLevelBadge':
      return <FqLevelBadge {...props} level={asNumber(props.level, 1)} />

    case 'FqAchievementCard':
      return (
        <FqAchievementCard
          {...props}
          title={asString(props.title, 'Achievement')}
          unlocked={asBoolean(props.unlocked)}
        />
      )

    case 'FqProgressRing':
      return (
        <FqProgressRing
          {...props}
          value={asNumber(props.value, 0)}
          max={asNumber(props.max, 100)}
          size={asNumber(props.size, 120)}
        />
      )

    case 'FqWorkoutCard':
      return (
        <FqWorkoutCard
          {...props}
          title={asString(props.title, 'Workout')}
          duration={asString(props.duration, '45 min')}
          onStart={() => {
            logEvent('onStart')
          }}
        />
      )

    case 'FqExerciseItem':
      return (
        <FqExerciseItem
          {...props}
          name={asString(props.name, 'Exercise')}
          completed={asBoolean(props.completed)}
          onCompletedChange={(completed) => {
            onPropChange('completed', completed)
            logEvent('onCompletedChange', completed)
          }}
        />
      )

    case 'FqCalendarHeatmap':
      return (
        <FqCalendarHeatmap
          data={
            Array.isArray(props.data)
              ? (props.data as Array<{ date: string; value: number }>)
              : []
          }
          maxValue={asNumber(props.maxValue, 8)}
        />
      )

    default:
      return <div className="text-sm text-zinc-500">Componente não encontrado.</div>
  }
}
