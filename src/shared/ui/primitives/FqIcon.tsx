import type { SVGProps } from 'react'

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Dumbbell,
  Eye,
  EyeOff,
  File,
  Filter,
  FlaskConical,
  Flame,
  Gamepad2,
  Heart,
  Home,
  Image,
  Info,
  List,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Minus,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  UtensilsCrossed,
  Search,
  Settings,
  Star,
  Sun,
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
  bell: Bell,
  calendar: Calendar,
  chart: ChartColumn,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  clock: Clock,
  copy: Copy,
  dumbbell: Dumbbell,
  eye: Eye,
  eyeOff: EyeOff,
  file: File,
  filter: Filter,
  flask: FlaskConical,
  flame: Flame,
  gamepad: Gamepad2,
  heart: Heart,
  home: Home,
  image: Image,
  info: Info,
  list: List,
  lock: Lock,
  logOut: LogOut,
  mail: Mail,
  mapPin: MapPin,
  menu: Menu,
  minus: Minus,
  moon: Moon,
  moreHorizontal: MoreHorizontal,
  play: Play,
  plus: Plus,
  utensils: UtensilsCrossed,
  search: Search,
  settings: Settings,
  star: Star,
  sun: Sun,
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
