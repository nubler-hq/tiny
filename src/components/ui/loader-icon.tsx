import { cn } from '@/utils/cn'
import { Loader2Icon } from 'lucide-react'

export const LoaderIcon = ({
  icon: Icon,
  className,
  isLoading,
}: {
  icon?: React.ElementType
  className?: string
  isLoading: boolean
}) =>
  isLoading ? (
    <Loader2Icon className={cn('animate-spin', className)} />
  ) : (
    Icon && <Icon className={className} />
  )
