import type { ComponentControl, ComponentRegistryItem } from '@/app/pages/components/types'

const variantControl: ComponentControl = {
  prop: 'variant',
  label: 'Variant',
  type: 'select',
  options: ['solid', 'outline', 'ghost'],
}

const toneControl: ComponentControl = {
  prop: 'tone',
  label: 'Tone',
  type: 'select',
  options: ['primary', 'secondary', 'success', 'warning', 'danger', 'neutral'],
}

const sizeControl: ComponentControl = {
  prop: 'size',
  label: 'Size',
  type: 'select',
  options: ['xs', 'sm', 'md', 'lg'],
}

const disabledControl: ComponentControl = {
  prop: 'isDisabled',
  label: 'Disabled',
  type: 'boolean',
}

const loadingControl: ComponentControl = {
  prop: 'isLoading',
  label: 'Loading',
  type: 'boolean',
}

function createHeatmapData() {
  const now = new Date()

  return Array.from({ length: 70 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - index)

    return {
      date: date.toISOString().slice(0, 10),
      value: Math.floor(Math.random() * 9),
    }
  }).reverse()
}

export const componentRegistry: ComponentRegistryItem[] = [
  {
    name: 'FqText',
    category: 'Primitives',
    description: 'Texto tipográfico com variantes semânticas.',
    defaultProps: { variant: 'body', children: 'Lorem ipsum fitquest' },
    controls: [
      {
        prop: 'variant',
        label: 'Variant',
        type: 'select',
        options: ['title', 'subtitle', 'body', 'caption'],
      },
      { prop: 'children', label: 'Children', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'Title', props: { variant: 'title', children: 'Title preset' } },
      { label: 'Caption', props: { variant: 'caption', children: 'Caption preset' } },
    ],
  },
  {
    name: 'FqIcon',
    category: 'Primitives',
    description: 'Wrapper de ícones Lucide com nome tipado.',
    defaultProps: { name: 'dumbbell', size: 22 },
    controls: [
      {
        prop: 'name',
        label: 'Icon',
        type: 'select',
        options: ['dumbbell', 'star', 'heart', 'calendar', 'target', 'trophy'],
      },
      { prop: 'size', label: 'Size', type: 'number', min: 12, max: 48, step: 1 },
    ],
    events: [],
    presets: [
      { label: 'Workout', props: { name: 'dumbbell' } },
      { label: 'Trophy', props: { name: 'trophy' } },
    ],
  },
  {
    name: 'FqButton',
    category: 'Primitives',
    description: 'Botão principal com loading, ícones e tons.',
    defaultProps: {
      children: 'Salvar',
      variant: 'solid',
      size: 'md',
      tone: 'primary',
      leftIcon: 'check',
      isLoading: false,
      isDisabled: false,
    },
    controls: [
      { prop: 'children', label: 'Children', type: 'text' },
      variantControl,
      sizeControl,
      toneControl,
      loadingControl,
      disabledControl,
    ],
    events: ['onClick'],
    presets: [
      { label: 'Solid', props: { variant: 'solid', tone: 'primary' } },
      { label: 'Outline', props: { variant: 'outline', tone: 'secondary' } },
    ],
  },
  {
    name: 'FqIconButton',
    category: 'Primitives',
    description: 'Botão de ícone para ações compactas.',
    defaultProps: {
      icon: 'settings',
      label: 'Configurações',
      variant: 'ghost',
      size: 'md',
      tone: 'neutral',
      isLoading: false,
      isDisabled: false,
    },
    controls: [
      {
        prop: 'icon',
        label: 'Icon',
        type: 'select',
        options: ['settings', 'search', 'copy', 'trash', 'plus'],
      },
      variantControl,
      sizeControl,
      toneControl,
      loadingControl,
      disabledControl,
    ],
    events: ['onClick'],
    presets: [
      { label: 'Ghost', props: { variant: 'ghost' } },
      { label: 'Solid', props: { variant: 'solid', tone: 'primary' } },
    ],
  },
  {
    name: 'FqBadge',
    category: 'Primitives',
    description: 'Selo para status e labels curtas.',
    defaultProps: { tone: 'success', children: 'Ativo' },
    controls: [toneControl, { prop: 'children', label: 'Children', type: 'text' }],
    events: [],
    presets: [
      { label: 'Success', props: { tone: 'success', children: 'Concluído' } },
      { label: 'Danger', props: { tone: 'danger', children: 'Pendente' } },
    ],
  },
  {
    name: 'FqTag',
    category: 'Primitives',
    description: 'Tag com ícones opcionais.',
    defaultProps: { tone: 'neutral', children: 'Força', leftIcon: 'target' },
    controls: [
      toneControl,
      { prop: 'children', label: 'Children', type: 'text' },
      {
        prop: 'leftIcon',
        label: 'Left icon',
        type: 'select',
        options: ['', 'target', 'calendar', 'flame'],
      },
    ],
    events: [],
    presets: [
      { label: 'Neutral', props: { tone: 'neutral' } },
      { label: 'Primary', props: { tone: 'primary', leftIcon: 'check' } },
    ],
  },
  {
    name: 'FqDivider',
    category: 'Primitives',
    description: 'Separador horizontal/vertical.',
    defaultProps: { orientation: 'horizontal' },
    controls: [
      {
        prop: 'orientation',
        label: 'Orientation',
        type: 'select',
        options: ['horizontal', 'vertical'],
      },
    ],
    events: [],
    presets: [
      { label: 'Horizontal', props: { orientation: 'horizontal' } },
      { label: 'Vertical', props: { orientation: 'vertical' } },
    ],
  },
  {
    name: 'FqSpacer',
    category: 'Primitives',
    description: 'Espaçador utilitário.',
    defaultProps: { size: 24, axis: 'y' },
    controls: [
      { prop: 'size', label: 'Size', type: 'number', min: 4, max: 100, step: 2 },
      { prop: 'axis', label: 'Axis', type: 'select', options: ['x', 'y', 'both'] },
    ],
    events: [],
    presets: [
      { label: 'Horizontal', props: { axis: 'x', size: 40 } },
      { label: 'Vertical', props: { axis: 'y', size: 24 } },
    ],
  },

  {
    name: 'FqInput',
    category: 'Form',
    description: 'Input com label, helper, erro e ícones.',
    defaultProps: {
      label: 'Nome',
      placeholder: 'Digite seu nome',
      helperText: 'Campo obrigatório',
      variant: 'outline',
      tone: 'primary',
      size: 'md',
      isDisabled: false,
    },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'placeholder', label: 'Placeholder', type: 'text' },
      variantControl,
      sizeControl,
      toneControl,
      disabledControl,
    ],
    events: ['onChange', 'onFocus', 'onBlur'],
    presets: [
      { label: 'With icon', props: { leftIcon: 'user', rightIcon: 'check' } },
      { label: 'Error', props: { errorMessage: 'Campo inválido' } },
    ],
  },
  {
    name: 'FqTextarea',
    category: 'Form',
    description: 'Textarea com controle de estado visual.',
    defaultProps: {
      label: 'Observações',
      placeholder: 'Descreva seu treino',
      variant: 'outline',
      tone: 'primary',
      size: 'md',
      helperText: 'Máximo 300 caracteres',
    },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'placeholder', label: 'Placeholder', type: 'text' },
      variantControl,
      sizeControl,
      toneControl,
      disabledControl,
    ],
    events: ['onChange', 'onFocus', 'onBlur'],
    presets: [
      { label: 'Default', props: {} },
      { label: 'Error', props: { errorMessage: 'Texto obrigatório' } },
    ],
  },
  {
    name: 'FqSelect',
    category: 'Form',
    description: 'Select simples com opções e placeholder.',
    defaultProps: {
      label: 'Meta da semana',
      options: [
        { label: 'Hipertrofia', value: 'hypertrophy' },
        { label: 'Resistência', value: 'resistance' },
        { label: 'Mobilidade', value: 'mobility' },
      ],
      placeholder: 'Selecione',
      tone: 'primary',
      size: 'md',
      variant: 'outline',
    },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'placeholder', label: 'Placeholder', type: 'text' },
      variantControl,
      sizeControl,
      toneControl,
      disabledControl,
    ],
    events: ['onChange'],
    presets: [
      { label: 'Outline', props: { variant: 'outline' } },
      { label: 'Solid', props: { variant: 'solid' } },
    ],
  },
  {
    name: 'FqMultiSelect',
    category: 'Form',
    description: 'Seleção múltipla com callback dedicado.',
    defaultProps: {
      label: 'Dias de treino',
      options: [
        { label: 'Segunda', value: 'mon' },
        { label: 'Terça', value: 'tue' },
        { label: 'Quarta', value: 'wed' },
        { label: 'Quinta', value: 'thu' },
        { label: 'Sexta', value: 'fri' },
      ],
      value: ['mon', 'wed'],
    },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      disabledControl,
    ],
    events: ['onValueChange', 'onChange'],
    presets: [
      { label: '2 dias', props: { value: ['mon', 'wed'] } },
      { label: '3 dias', props: { value: ['mon', 'wed', 'fri'] } },
    ],
  },
  {
    name: 'FqCheckbox',
    category: 'Form',
    description: 'Checkbox com label e helper.',
    defaultProps: { label: 'Aceito os termos', checked: true, isDisabled: false },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'checked', label: 'Checked', type: 'boolean' },
      disabledControl,
    ],
    events: ['onChange'],
    presets: [
      { label: 'Checked', props: { checked: true } },
      { label: 'Unchecked', props: { checked: false } },
    ],
  },
  {
    name: 'FqRadioGroup',
    category: 'Form',
    description: 'Grupo de radio com opções tipadas.',
    defaultProps: {
      label: 'Nível atual',
      name: 'fitness-level',
      options: [
        { label: 'Iniciante', value: 'beginner' },
        { label: 'Intermediário', value: 'intermediate' },
        { label: 'Avançado', value: 'advanced' },
      ],
      value: 'intermediate',
    },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      {
        prop: 'value',
        label: 'Value',
        type: 'select',
        options: ['beginner', 'intermediate', 'advanced'],
      },
      disabledControl,
    ],
    events: ['onChange'],
    presets: [
      { label: 'Beginner', props: { value: 'beginner' } },
      { label: 'Advanced', props: { value: 'advanced' } },
    ],
  },
  {
    name: 'FqRadio',
    category: 'Form',
    description: 'Radio unitário para composição livre.',
    defaultProps: {
      label: 'Treino funcional',
      name: 'single-radio',
      value: 'functional',
      checked: true,
    },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'checked', label: 'Checked', type: 'boolean' },
      disabledControl,
    ],
    events: ['onChange'],
    presets: [
      { label: 'Checked', props: { checked: true } },
      { label: 'Unchecked', props: { checked: false } },
    ],
  },
  {
    name: 'FqSwitch',
    category: 'Form',
    description: 'Switch acessível com role switch.',
    defaultProps: { label: 'Modo desafio', checked: true, tone: 'primary' },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'checked', label: 'Checked', type: 'boolean' },
      {
        prop: 'tone',
        label: 'Tone',
        type: 'select',
        options: ['primary', 'success', 'danger', 'neutral'],
      },
      disabledControl,
    ],
    events: ['onCheckedChange', 'onClick'],
    presets: [
      { label: 'On', props: { checked: true } },
      { label: 'Off', props: { checked: false } },
    ],
  },
  {
    name: 'FqSlider',
    category: 'Form',
    description: 'Range input com tons.',
    defaultProps: { label: 'Intensidade', min: 0, max: 10, value: 6, tone: 'primary' },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'value', label: 'Value', type: 'number', min: 0, max: 10, step: 1 },
      toneControl,
      disabledControl,
    ],
    events: ['onChange', 'onInput'],
    presets: [
      { label: 'Low', props: { value: 2 } },
      { label: 'High', props: { value: 9 } },
    ],
  },
  {
    name: 'FqDatePicker',
    category: 'Form',
    description: 'Date picker nativo.',
    defaultProps: { label: 'Data do treino', value: '2026-02-21' },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'value', label: 'Value', type: 'text' },
      disabledControl,
    ],
    events: ['onChange'],
    presets: [
      { label: 'Today', props: { value: '2026-02-21' } },
      { label: 'Tomorrow', props: { value: '2026-02-22' } },
    ],
  },
  {
    name: 'FqTimePicker',
    category: 'Form',
    description: 'Time picker nativo.',
    defaultProps: { label: 'Horário', value: '18:30' },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'value', label: 'Value', type: 'text' },
      disabledControl,
    ],
    events: ['onChange'],
    presets: [
      { label: 'Morning', props: { value: '07:00' } },
      { label: 'Night', props: { value: '20:00' } },
    ],
  },
  {
    name: 'FqFileUpload',
    category: 'Form',
    description: 'Upload com drag and drop e preview.',
    defaultProps: {
      label: 'Envie comprovante',
      helperText: 'PNG/JPG até 5MB',
      accept: 'image/*',
      maxFiles: 4,
    },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'maxFiles', label: 'Max files', type: 'number', min: 1, max: 10, step: 1 },
      disabledControl,
    ],
    events: ['onFilesChange'],
    presets: [
      { label: 'Images', props: { accept: 'image/*' } },
      { label: 'Docs', props: { accept: '.pdf,.doc,.docx' } },
    ],
  },

  {
    name: 'FqPage',
    category: 'Layout',
    description: 'Container de página full-height.',
    defaultProps: { children: 'Conteúdo da página' },
    controls: [{ prop: 'children', label: 'Children', type: 'text' }],
    events: [],
    presets: [
      { label: 'Default', props: { children: 'Conteúdo da página' } },
      { label: 'Landing', props: { children: 'Hero content' } },
    ],
  },
  {
    name: 'FqContent',
    category: 'Layout',
    description: 'Área central com largura máxima.',
    defaultProps: { children: 'Área de conteúdo' },
    controls: [{ prop: 'children', label: 'Children', type: 'text' }],
    events: [],
    presets: [
      { label: 'Default', props: {} },
      { label: 'Dense', props: { children: 'Conteúdo denso' } },
    ],
  },
  {
    name: 'FqContainer',
    category: 'Layout',
    description: 'Container com tamanhos responsivos.',
    defaultProps: { size: 'lg', children: 'Container content' },
    controls: [
      { prop: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
      { prop: 'children', label: 'Children', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'Small', props: { size: 'sm' } },
      { label: 'Full', props: { size: 'full' } },
    ],
  },
  {
    name: 'FqStack',
    category: 'Layout',
    description: 'Layout flex em linha ou coluna.',
    defaultProps: { direction: 'col', gap: 12 },
    controls: [
      { prop: 'direction', label: 'Direction', type: 'select', options: ['row', 'col'] },
      { prop: 'gap', label: 'Gap', type: 'number', min: 4, max: 48, step: 2 },
    ],
    events: [],
    presets: [
      { label: 'Row', props: { direction: 'row' } },
      { label: 'Column', props: { direction: 'col' } },
    ],
  },
  {
    name: 'FqGrid',
    category: 'Layout',
    description: 'Grid responsivo configurável por colunas.',
    defaultProps: { columns: 3, gap: 16 },
    controls: [
      {
        prop: 'columns',
        label: 'Columns',
        type: 'select',
        options: ['1', '2', '3', '4', '5', '6'],
      },
      { prop: 'gap', label: 'Gap', type: 'number', min: 4, max: 48, step: 2 },
    ],
    events: [],
    presets: [
      { label: '2 cols', props: { columns: 2 } },
      { label: '4 cols', props: { columns: 4 } },
    ],
  },
  {
    name: 'FqCard',
    category: 'Layout',
    description: 'Card com slots de header/body/footer.',
    defaultProps: { title: 'Card title', subtitle: 'Card subtitle', children: 'Card body' },
    controls: [
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'subtitle', label: 'Subtitle', type: 'text' },
      { prop: 'children', label: 'Children', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'Simple', props: { title: 'Simple card', subtitle: '' } },
      { label: 'With footer', props: { title: 'With footer' } },
    ],
  },
  {
    name: 'FqSection',
    category: 'Layout',
    description: 'Seção com título e descrição.',
    defaultProps: {
      title: 'Resumo semanal',
      description: 'Seu progresso dos últimos 7 dias',
      children: 'Conteúdo da seção',
    },
    controls: [
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'description', label: 'Description', type: 'text' },
      { prop: 'children', label: 'Children', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'Titled', props: { title: 'Resumo' } },
      { label: 'No desc', props: { description: '' } },
    ],
  },
  {
    name: 'FqHeader',
    category: 'Layout',
    description: 'Header sticky com fundo translúcido.',
    defaultProps: { children: 'Header content' },
    controls: [{ prop: 'children', label: 'Children', type: 'text' }],
    events: [],
    presets: [
      { label: 'Default', props: {} },
      { label: 'Title', props: { children: 'FitQuest Header' } },
    ],
  },
  {
    name: 'FqFooter',
    category: 'Layout',
    description: 'Footer padrão da aplicação.',
    defaultProps: { children: 'Footer content' },
    controls: [{ prop: 'children', label: 'Children', type: 'text' }],
    events: [],
    presets: [
      { label: 'Default', props: {} },
      { label: 'Copyright', props: { children: '© 2026 FitQuest' } },
    ],
  },

  {
    name: 'FqTabs',
    category: 'Navigation',
    description: 'Tabs acessíveis com Radix.',
    defaultProps: {
      items: [
        { value: 'overview', label: 'Overview', content: 'Overview content' },
        { value: 'history', label: 'History', content: 'History content' },
      ],
      defaultValue: 'overview',
    },
    controls: [
      { prop: 'defaultValue', label: 'Default value', type: 'select', options: ['overview', 'history'] },
    ],
    events: ['onValueChange'],
    presets: [
      { label: '2 tabs', props: {} },
      { label: 'History default', props: { defaultValue: 'history' } },
    ],
  },
  {
    name: 'FqTabItem',
    category: 'Navigation',
    description: 'Trigger de tab para composição customizada.',
    defaultProps: { value: 'tab-1', children: 'Tab item' },
    controls: [
      { prop: 'value', label: 'Value', type: 'text' },
      { prop: 'children', label: 'Children', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'Tab A', props: { value: 'a', children: 'A' } },
      { label: 'Tab B', props: { value: 'b', children: 'B' } },
    ],
  },
  {
    name: 'FqBreadcrumb',
    category: 'Navigation',
    description: 'Breadcrumb com itens navegáveis.',
    defaultProps: {
      items: [
        { label: 'Home', href: '#' },
        { label: 'Workouts', href: '#' },
        { label: 'Detalhes', isCurrent: true },
      ],
    },
    controls: [],
    events: ['onClick'],
    presets: [
      { label: '3 levels', props: {} },
      { label: '2 levels', props: { items: [{ label: 'Home', href: '#' }, { label: 'Profile', isCurrent: true }] } },
    ],
  },
  {
    name: 'FqPagination',
    category: 'Navigation',
    description: 'Paginação com navegação anterior/próximo.',
    defaultProps: { currentPage: 2, totalPages: 8 },
    controls: [
      { prop: 'currentPage', label: 'Current', type: 'number', min: 1, max: 20, step: 1 },
      { prop: 'totalPages', label: 'Total', type: 'number', min: 1, max: 20, step: 1 },
    ],
    events: ['onPageChange'],
    presets: [
      { label: 'Start', props: { currentPage: 1 } },
      { label: 'Middle', props: { currentPage: 4 } },
    ],
  },
  {
    name: 'FqDrawer',
    category: 'Navigation',
    description: 'Drawer lateral responsivo com focus trap.',
    defaultProps: {
      open: true,
      title: 'Filtros',
      description: 'Ajuste os parâmetros da busca',
      side: 'left',
      children: 'Conteúdo do drawer',
    },
    controls: [
      { prop: 'open', label: 'Open', type: 'boolean' },
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'description', label: 'Description', type: 'text' },
      { prop: 'side', label: 'Side', type: 'select', options: ['left', 'right'] },
    ],
    events: ['onOpenChange'],
    presets: [
      { label: 'Left', props: { side: 'left', open: true } },
      { label: 'Right', props: { side: 'right', open: true } },
    ],
  },
  {
    name: 'FqNavbar',
    category: 'Navigation',
    description: 'Barra de navegação superior com itens.',
    defaultProps: {
      title: 'FitQuest',
      items: [
        { label: 'Dashboard', active: true },
        { label: 'Treinos' },
        { label: 'Perfil' },
      ],
    },
    controls: [{ prop: 'title', label: 'Title', type: 'text' }],
    events: ['onMenuClick', 'item.onClick'],
    presets: [
      { label: 'Default', props: {} },
      { label: 'Minimal', props: { items: [{ label: 'Home', active: true }] } },
    ],
  },

  {
    name: 'FqModal',
    category: 'Feedback',
    description: 'Modal acessível com Radix Dialog.',
    defaultProps: {
      open: true,
      title: 'Editar treino',
      description: 'Atualize os detalhes da sessão',
      children: 'Conteúdo do modal',
    },
    controls: [
      { prop: 'open', label: 'Open', type: 'boolean' },
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'description', label: 'Description', type: 'text' },
      { prop: 'children', label: 'Children', type: 'text' },
    ],
    events: ['onOpenChange'],
    presets: [
      { label: 'Open', props: { open: true } },
      { label: 'Closed', props: { open: false } },
    ],
  },
  {
    name: 'FqDialog',
    category: 'Feedback',
    description: 'Dialog de confirmação.',
    defaultProps: {
      open: true,
      title: 'Excluir treino',
      description: 'Essa ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      tone: 'danger',
      children: 'Deseja realmente excluir?',
    },
    controls: [
      { prop: 'open', label: 'Open', type: 'boolean' },
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'description', label: 'Description', type: 'text' },
      { prop: 'confirmText', label: 'Confirm text', type: 'text' },
      { prop: 'cancelText', label: 'Cancel text', type: 'text' },
      toneControl,
    ],
    events: ['onConfirm', 'onCancel', 'onOpenChange'],
    presets: [
      { label: 'Danger', props: { tone: 'danger' } },
      { label: 'Primary', props: { tone: 'primary' } },
    ],
  },
  {
    name: 'FqToast',
    category: 'Feedback',
    description: 'Sistema de notificações com provider + hook.',
    defaultProps: {
      title: 'Treino salvo',
      description: 'Seu treino foi atualizado com sucesso.',
      tone: 'success',
    },
    controls: [
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'description', label: 'Description', type: 'text' },
      toneControl,
    ],
    events: ['toast', 'dismiss'],
    presets: [
      { label: 'Success', props: { tone: 'success' } },
      { label: 'Warning', props: { tone: 'warning' } },
    ],
  },
  {
    name: 'FqAlert',
    category: 'Feedback',
    description: 'Alerta contextual por tom.',
    defaultProps: {
      tone: 'warning',
      title: 'Atenção',
      children: 'Seu plano expira em 2 dias.',
    },
    controls: [toneControl, { prop: 'title', label: 'Title', type: 'text' }, { prop: 'children', label: 'Children', type: 'text' }],
    events: [],
    presets: [
      { label: 'Warning', props: { tone: 'warning' } },
      { label: 'Danger', props: { tone: 'danger' } },
    ],
  },
  {
    name: 'FqLoadingSpinner',
    category: 'Feedback',
    description: 'Indicador de loading em múltiplos tamanhos.',
    defaultProps: { tone: 'primary', size: 'md' },
    controls: [
      toneControl,
      { prop: 'size', label: 'Size', type: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    ],
    events: [],
    presets: [
      { label: 'Small', props: { size: 'sm' } },
      { label: 'Large', props: { size: 'lg' } },
    ],
  },
  {
    name: 'FqSkeleton',
    category: 'Feedback',
    description: 'Placeholder animado para carregamento.',
    defaultProps: { rounded: 'lg' },
    controls: [
      { prop: 'rounded', label: 'Rounded', type: 'select', options: ['sm', 'md', 'lg', 'full'] },
    ],
    events: [],
    presets: [
      { label: 'Card', props: { rounded: 'lg' } },
      { label: 'Avatar', props: { rounded: 'full' } },
    ],
  },
  {
    name: 'FqProgressBar',
    category: 'Feedback',
    description: 'Barra de progresso linear.',
    defaultProps: { value: 68, tone: 'primary', showLabel: true },
    controls: [
      { prop: 'value', label: 'Value', type: 'number', min: 0, max: 100, step: 1 },
      toneControl,
      { prop: 'showLabel', label: 'Show label', type: 'boolean' },
    ],
    events: [],
    presets: [
      { label: 'Half', props: { value: 50 } },
      { label: 'Complete', props: { value: 100 } },
    ],
  },
  {
    name: 'FqEmptyState',
    category: 'Feedback',
    description: 'Estado vazio com ação primária.',
    defaultProps: {
      title: 'Nenhum treino encontrado',
      description: 'Crie seu primeiro treino para começar.',
      actionLabel: 'Novo treino',
      icon: 'dumbbell',
    },
    controls: [
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'description', label: 'Description', type: 'text' },
      { prop: 'actionLabel', label: 'Action label', type: 'text' },
    ],
    events: ['onAction'],
    presets: [
      { label: 'Create', props: { actionLabel: 'Criar treino' } },
      { label: 'Retry', props: { actionLabel: 'Tentar novamente' } },
    ],
  },
  {
    name: 'FqTooltip',
    category: 'Feedback',
    description: 'Tooltip contextual com Radix Tooltip.',
    defaultProps: { content: 'Informação extra', side: 'top' },
    controls: [
      { prop: 'content', label: 'Content', type: 'text' },
      { prop: 'side', label: 'Side', type: 'select', options: ['top', 'right', 'bottom', 'left'] },
    ],
    events: [],
    presets: [
      { label: 'Top', props: { side: 'top' } },
      { label: 'Bottom', props: { side: 'bottom' } },
    ],
  },
  {
    name: 'FqPopover',
    category: 'Feedback',
    description: 'Popover com trigger customizável.',
    defaultProps: { content: 'Configurações rápidas', side: 'bottom' },
    controls: [
      { prop: 'content', label: 'Content', type: 'text' },
      { prop: 'side', label: 'Side', type: 'select', options: ['top', 'right', 'bottom', 'left'] },
    ],
    events: [],
    presets: [
      { label: 'Bottom', props: { side: 'bottom' } },
      { label: 'Right', props: { side: 'right' } },
    ],
  },
  {
    name: 'FqDropdownMenu',
    category: 'Feedback',
    description: 'Menu de ações com teclado e foco.',
    defaultProps: {
      items: [
        { label: 'Editar' },
        { label: 'Duplicar' },
        { label: 'Arquivar' },
      ],
    },
    controls: [],
    events: ['onSelect'],
    presets: [
      { label: 'Actions', props: {} },
      { label: 'Single', props: { items: [{ label: 'Visualizar' }] } },
    ],
  },

  {
    name: 'FqList',
    category: 'Data Display',
    description: 'Lista estilizada com bordas e divisores.',
    defaultProps: {},
    controls: [],
    events: [],
    presets: [
      { label: 'Basic', props: {} },
      { label: 'Dense', props: {} },
    ],
  },
  {
    name: 'FqListItem',
    category: 'Data Display',
    description: 'Item de lista isolado.',
    defaultProps: { children: 'Item de lista' },
    controls: [{ prop: 'children', label: 'Children', type: 'text' }],
    events: [],
    presets: [
      { label: 'Default', props: { children: 'Item de lista' } },
      { label: 'Custom', props: { children: 'Item personalizado' } },
    ],
  },
  {
    name: 'FqAvatar',
    category: 'Data Display',
    description: 'Avatar com imagem ou iniciais.',
    defaultProps: { name: 'Luan Douglas', size: 'md' },
    controls: [
      { prop: 'name', label: 'Name', type: 'text' },
      { prop: 'size', label: 'Size', type: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    ],
    events: [],
    presets: [
      { label: 'Small', props: { size: 'sm' } },
      { label: 'Large', props: { size: 'lg' } },
    ],
  },
  {
    name: 'FqChip',
    category: 'Data Display',
    description: 'Chip selecionável para filtros.',
    defaultProps: { children: 'HIIT', selected: true },
    controls: [
      { prop: 'children', label: 'Children', type: 'text' },
      { prop: 'selected', label: 'Selected', type: 'boolean' },
      disabledControl,
    ],
    events: ['onSelectedChange', 'onClick'],
    presets: [
      { label: 'Selected', props: { selected: true } },
      { label: 'Unselected', props: { selected: false } },
    ],
  },
  {
    name: 'FqTable',
    category: 'Data Display',
    description: 'Tabela responsiva para dados tabulares.',
    defaultProps: {
      columns: [
        { key: 'exercise', header: 'Exercício' },
        { key: 'sets', header: 'Séries', align: 'center' },
        { key: 'load', header: 'Carga', align: 'right' },
      ],
      data: [
        { exercise: 'Agachamento', sets: '4', load: '80kg' },
        { exercise: 'Supino', sets: '3', load: '60kg' },
      ],
    },
    controls: [],
    events: [],
    presets: [
      { label: 'Rows', props: {} },
      { label: 'Empty', props: { data: [] } },
    ],
  },
  {
    name: 'FqStatCard',
    category: 'Data Display',
    description: 'Card de métrica resumida.',
    defaultProps: { label: 'Treinos', value: 12, delta: '+15%', icon: 'activity' },
    controls: [
      { prop: 'label', label: 'Label', type: 'text' },
      { prop: 'value', label: 'Value', type: 'text' },
      { prop: 'delta', label: 'Delta', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'Positive', props: { delta: '+8%' } },
      { label: 'Neutral', props: { delta: '' } },
    ],
  },
  {
    name: 'FqTimeline',
    category: 'Data Display',
    description: 'Linha do tempo para eventos.',
    defaultProps: {
      items: [
        { id: '1', title: 'Treino concluído', description: 'Peito e tríceps', time: '08:30' },
        { id: '2', title: 'Meta atualizada', description: 'Novo PR de agachamento', time: '10:15' },
      ],
    },
    controls: [],
    events: [],
    presets: [
      { label: 'Short', props: {} },
      { label: 'Single', props: { items: [{ id: '1', title: 'Evento único', time: '09:00' }] } },
    ],
  },
  {
    name: 'FqCarousel',
    category: 'Data Display',
    description: 'Carrossel simples com navegação.',
    defaultProps: {
      items: ['Slide 1', 'Slide 2', 'Slide 3'],
      initialIndex: 0,
    },
    controls: [{ prop: 'initialIndex', label: 'Initial index', type: 'number', min: 0, max: 2, step: 1 }],
    events: ['onClick'],
    presets: [
      { label: 'First', props: { initialIndex: 0 } },
      { label: 'Second', props: { initialIndex: 1 } },
    ],
  },

  {
    name: 'FqStarRating',
    category: 'Fitness',
    description: 'Avaliação em estrelas interativa.',
    defaultProps: { value: 4, max: 5, tone: 'warning' },
    controls: [
      { prop: 'value', label: 'Value', type: 'number', min: 0, max: 5, step: 1 },
      { prop: 'max', label: 'Max', type: 'number', min: 3, max: 10, step: 1 },
      toneControl,
      disabledControl,
    ],
    events: ['onChange'],
    presets: [
      { label: '3 stars', props: { value: 3 } },
      { label: '5 stars', props: { value: 5 } },
    ],
  },
  {
    name: 'FqXPBar',
    category: 'Fitness',
    description: 'Barra de XP para progressão de nível.',
    defaultProps: { currentXP: 340, targetXP: 500, label: 'XP semanal' },
    controls: [
      { prop: 'currentXP', label: 'Current XP', type: 'number', min: 0, max: 1000, step: 10 },
      { prop: 'targetXP', label: 'Target XP', type: 'number', min: 50, max: 1000, step: 10 },
      { prop: 'label', label: 'Label', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'Mid', props: { currentXP: 250, targetXP: 500 } },
      { label: 'Near', props: { currentXP: 470, targetXP: 500 } },
    ],
  },
  {
    name: 'FqLevelBadge',
    category: 'Fitness',
    description: 'Badge para nível atual do atleta.',
    defaultProps: { level: 12, label: 'Level' },
    controls: [
      { prop: 'level', label: 'Level', type: 'number', min: 1, max: 99, step: 1 },
      { prop: 'label', label: 'Label', type: 'text' },
    ],
    events: [],
    presets: [
      { label: 'L12', props: { level: 12 } },
      { label: 'L35', props: { level: 35 } },
    ],
  },
  {
    name: 'FqAchievementCard',
    category: 'Fitness',
    description: 'Card de conquista desbloqueada/bloqueada.',
    defaultProps: {
      title: 'Consistency Streak',
      description: 'Treine por 7 dias consecutivos.',
      unlocked: true,
      icon: 'trophy',
    },
    controls: [
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'description', label: 'Description', type: 'text' },
      { prop: 'unlocked', label: 'Unlocked', type: 'boolean' },
    ],
    events: [],
    presets: [
      { label: 'Unlocked', props: { unlocked: true } },
      { label: 'Locked', props: { unlocked: false } },
    ],
  },
  {
    name: 'FqProgressRing',
    category: 'Fitness',
    description: 'Indicador circular de progresso em SVG.',
    defaultProps: { value: 72, max: 100, size: 120, label: 'Meta' },
    controls: [
      { prop: 'value', label: 'Value', type: 'number', min: 0, max: 100, step: 1 },
      { prop: 'max', label: 'Max', type: 'number', min: 10, max: 500, step: 10 },
      { prop: 'size', label: 'Size', type: 'number', min: 80, max: 220, step: 10 },
      toneControl,
    ],
    events: [],
    presets: [
      { label: '72%', props: { value: 72 } },
      { label: '95%', props: { value: 95 } },
    ],
  },
  {
    name: 'FqWorkoutCard',
    category: 'Fitness',
    description: 'Card de treino com duração e dificuldade.',
    defaultProps: {
      title: 'Treino A - Upper Body',
      duration: '45 min',
      level: 'intermediate',
      calories: 420,
    },
    controls: [
      { prop: 'title', label: 'Title', type: 'text' },
      { prop: 'duration', label: 'Duration', type: 'text' },
      {
        prop: 'level',
        label: 'Level',
        type: 'select',
        options: ['beginner', 'intermediate', 'advanced'],
      },
      { prop: 'calories', label: 'Calories', type: 'number', min: 50, max: 900, step: 10 },
    ],
    events: ['onStart'],
    presets: [
      { label: 'Beginner', props: { level: 'beginner' } },
      { label: 'Advanced', props: { level: 'advanced' } },
    ],
  },
  {
    name: 'FqExerciseItem',
    category: 'Fitness',
    description: 'Linha de exercício com sets/reps e checklist.',
    defaultProps: { name: 'Agachamento livre', sets: 4, reps: 10, completed: false },
    controls: [
      { prop: 'name', label: 'Name', type: 'text' },
      { prop: 'sets', label: 'Sets', type: 'number', min: 1, max: 8, step: 1 },
      { prop: 'reps', label: 'Reps', type: 'number', min: 1, max: 30, step: 1 },
      { prop: 'completed', label: 'Completed', type: 'boolean' },
    ],
    events: ['onCompletedChange'],
    presets: [
      { label: 'Pending', props: { completed: false } },
      { label: 'Done', props: { completed: true } },
    ],
  },
  {
    name: 'FqCalendarHeatmap',
    category: 'Fitness',
    description: 'Heatmap estilo calendário para atividade diária.',
    defaultProps: {
      data: createHeatmapData(),
      maxValue: 8,
    },
    controls: [{ prop: 'maxValue', label: 'Max value', type: 'number', min: 1, max: 15, step: 1 }],
    events: [],
    presets: [
      { label: 'Default', props: { maxValue: 8 } },
      { label: 'Dense', props: { maxValue: 12 } },
    ],
  },
]

export const categoriesOrder = [
  'Primitives',
  'Form',
  'Layout',
  'Navigation',
  'Feedback',
  'Data Display',
  'Fitness',
] as const

export const registryByCategory = categoriesOrder.map((category) => ({
  category,
  components: componentRegistry.filter((item) => item.category === category),
}))

export function getComponentMeta(name: string) {
  return componentRegistry.find((item) => item.name === name)
}
