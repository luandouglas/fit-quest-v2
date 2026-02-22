export type RegistryControlType = 'select' | 'text' | 'boolean' | 'number'

export type ComponentControl = {
  prop: string
  label: string
  type: RegistryControlType
  options?: string[]
  min?: number
  max?: number
  step?: number
}

export type ComponentPreset = {
  label: string
  props: Record<string, unknown>
}

export type ComponentRegistryItem = {
  name: string
  category:
    | 'Primitives'
    | 'Form'
    | 'Layout'
    | 'Navigation'
    | 'Feedback'
    | 'Data Display'
    | 'Fitness'
  description: string
  defaultProps: Record<string, unknown>
  controls: ComponentControl[]
  events: string[]
  presets: ComponentPreset[]
}
