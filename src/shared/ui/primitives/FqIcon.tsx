import type { SVGProps } from 'react'

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Dumbbell,
  File,
  Filter,
  Flame,
  Heart,
  Home,
  Image,
  Info,
  List,
  Menu,
  Minus,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Star,
  Target,
  Trash,
  Trophy,
  Upload,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'

import { cx } from '@/shared/utils'
import type { FqBaseProps } from '@/shared/ui/types'

const iconMap = {
  activity: Activity,
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  calendar: Calendar,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  clock: Clock,
  copy: Copy,
  dumbbell: Dumbbell,
  file: File,
  filter: Filter,
  flame: Flame,
  heart: Heart,
  home: Home,
  image: Image,
  info: Info,
  list: List,
  menu: Menu,
  minus: Minus,
  moon: Moon,
  moreHorizontal: MoreHorizontal,
  play: Play,
  plus: Plus,
  search: Search,
  settings: Settings,
  star: Star,
  target: Target,
  trash: Trash,
  trophy: Trophy,
  upload: Upload,
  user: User,
  users: Users,
  x: X,
} as const satisfies Record<string, LucideIcon>

export type IconName = keyof typeof iconMap

type FqIconProps = FqBaseProps & {
  name: IconName
  size?: number
  strokeWidth?: number
  ariaLabel?: string
} & Omit<SVGProps<SVGSVGElement>, 'name' | 'style' | 'className'>

export function FqIcon({
  name,
  size = 18,
  strokeWidth = 1.8,
  className,
  
  testId,
  ariaLabel,
  ...rest
}: FqIconProps) {
  const IconComponent = iconMap[name]

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={cx('shrink-0', className)}
     
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      focusable={false}
      data-testid={testId}
      {...rest}
    />
  )
}
