'use client'

import * as React from 'react'
import { Bell, Check, ExternalLinkIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './button'
import { Badge } from './badge'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { getNotificationIcon as defaultGetNotificationIcon } from '@/@saas-boilerplate/features/notification/presentation/utils/get-notification-icon'

// Types for notification data
interface NotificationData {
  id: string
  type: string
  data?: any
  readAt?: Date | string | null
  createdAt?: Date | string
  action?: { label: string; url: string }
  channels?: string[]
  [key: string]: any
}

interface NotificationContextValue {
  notifications: NotificationData[]
  unreadCount: number
  isLoading?: boolean
  isError?: boolean
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (id: string) => void
  isMarkingAsRead?: boolean
  isMarkingAllAsRead?: boolean
  isDeleting?: boolean
  soundEnabled?: boolean
  setSound?: (enabled: boolean) => void
}

const NotificationContext =
  React.createContext<NotificationContextValue | null>(null)

function useNotification() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    )
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  value: NotificationContextValue
}

const NotificationProvider = React.forwardRef<
  HTMLDivElement,
  NotificationProviderProps
>(({ children, value, ...props }, ref) => (
  <NotificationContext.Provider value={value}>
    <div ref={ref} {...props}>
      {children}
    </div>
  </NotificationContext.Provider>
))
NotificationProvider.displayName = 'NotificationProvider'

interface NotificationRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  value: NotificationContextValue
}

const NotificationRoot = React.forwardRef<
  HTMLDivElement,
  NotificationRootProps
>(({ children, value, className, ...props }, ref) => (
  <NotificationProvider value={value}>
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  </NotificationProvider>
))
NotificationRoot.displayName = 'NotificationRoot'

interface NotificationTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showBadge?: boolean
  badgeVariant?: 'default' | 'destructive' | 'outline' | 'secondary'
  ariaLabel?: string
}

const NotificationTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  NotificationTriggerProps
>(
  (
    {
      className,
      showBadge = true,
      badgeVariant = 'destructive',
      ariaLabel,
      ...props
    },
    ref,
  ) => {
    const { unreadCount } = useNotification()

    return (
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="sm"
          className={cn('relative p-2', className)}
          aria-label={
            ariaLabel ||
            `Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`
          }
          {...props}
        >
          <Bell className="h-5 w-5" />
          {showBadge && unreadCount > 0 && (
            <Badge
              variant={badgeVariant}
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
    )
  },
)
NotificationTrigger.displayName = 'NotificationTrigger'

interface NotificationContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  maxHeight?: string
  children: React.ReactNode
}

const NotificationContent = React.forwardRef<
  HTMLDivElement,
  NotificationContentProps
>(
  (
    {
      className,
      align = 'end',
      side = 'right',
      sideOffset = 4,
      maxHeight = '500px',
      children,
      ...props
    },
    ref,
  ) => (
    <PopoverContent
      ref={ref}
      className={cn('w-72 p-0 bg-background/60 backdrop-blur-lg', className)}
      align={align}
      side={side}
      sideOffset={sideOffset}
      {...props}
    >
      <div className="max-h-[500px] flex flex-col" style={{ maxHeight }}>
        {children}
      </div>
    </PopoverContent>
  ),
)
NotificationContent.displayName = 'NotificationContent'

interface NotificationHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  showMarkAllAsRead?: boolean
  markAllAsReadLabel?: string
  unreadCount?: number
  unreadLabel?: string
}

const NotificationHeader = React.forwardRef<
  HTMLDivElement,
  NotificationHeaderProps
>(
  (
    {
      className,
      title = 'Notifications',
      showMarkAllAsRead = true,
      markAllAsReadLabel = 'Mark all as read',
      unreadCount,
      ...props
    },
    ref,
  ) => {
    const { onMarkAllAsRead, isMarkingAllAsRead } = useNotification()

    return (
      <div ref={ref} className={cn('px-4 py-2 border-b', className)} {...props}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs flex items-center">{title}</h3>
          <div className="flex items-center gap-2">
            {showMarkAllAsRead && onMarkAllAsRead && (
              <Button
                variant="link"
                size="sm"
                onClick={onMarkAllAsRead}
                disabled={isMarkingAllAsRead || unreadCount === 0}
                className="h-7 text-xs"
              >
                <Check className="h-3 w-3" />
                {isMarkingAllAsRead ? 'Marking...' : markAllAsReadLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  },
)
NotificationHeader.displayName = 'NotificationHeader'

interface NotificationListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxHeight?: string
}

const NotificationList = React.forwardRef<
  HTMLDivElement,
  NotificationListProps
>(({ className, children, maxHeight = '350px', ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto', className)}
    style={{ maxHeight }}
    {...props}
  >
    {children}
  </div>
))
NotificationList.displayName = 'NotificationList'

interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  notification: NotificationData
  showMarkAsRead?: boolean
  showDelete?: boolean
  markAsReadLabel?: string
  onItemClick?: (notification: NotificationData) => void
  renderContent?: (notification: NotificationData) => React.ReactNode
  getIcon?: (type: string) => React.ReactNode
}

const NotificationItem = React.forwardRef<
  HTMLDivElement,
  NotificationItemProps
>(
  (
    {
      className,
      notification,
      showMarkAsRead = true,
      showDelete = false,
      onItemClick,
      renderContent,
      getIcon = defaultGetNotificationIcon,
      ...props
    },
    ref,
  ) => {
    const isUnread = !notification.readAt

    const handleClick = () => {
      onItemClick?.(notification)
    }

    // Default content renderer using the existing utility
    const defaultRenderContent = (notification: NotificationData) => {
      return (
        <div className="text-xs space-y-1">
          <div className="font-medium">{notification.title}</div>
          <div className="text-muted-foreground">
            {notification.description}
          </div>
        </div>
      )
    }

    const contentRenderer = renderContent || defaultRenderContent

    return (
      <div
        ref={ref}
        className={cn(
          'px-4 py-2 cursor-pointer border-b hover:bg-accent/50 transition-colors',
          isUnread ? 'bg-secondary/60' : '',
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">{contentRenderer(notification)}</div>
              {isUnread && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2 ml-2 shrink-0" />
              )}
            </div>
            {(showMarkAsRead || showDelete) && (
              <div className="flex items-center gap-2 mt-2">
                {notification.action && (
                  <Button
                    variant="outline"
                    className="text-xs h-7 px-2 rounded-full"
                    size="sm"
                    onClick={() =>
                      notification.action &&
                      window.open(notification.action.url, '_blank')
                    }
                  >
                    <ExternalLinkIcon className="h-3 w-3" />
                    {notification.action.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)
NotificationItem.displayName = 'NotificationItem'

interface NotificationEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  description?: string
}

const NotificationEmpty = React.forwardRef<
  HTMLDivElement,
  NotificationEmptyProps
>(
  (
    { className, icon, title = 'No notifications', description, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn('p-4 text-center text-sm text-muted-foreground', className)}
      {...props}
    >
      {icon && <div className="mb-2 flex justify-center">{icon}</div>}
      <div className="font-medium">{title}</div>
      {description && <div className="mt-1">{description}</div>}
    </div>
  ),
)
NotificationEmpty.displayName = 'NotificationEmpty'

interface NotificationLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
}

const NotificationLoading = React.forwardRef<
  HTMLDivElement,
  NotificationLoadingProps
>(({ className, message = 'Loading notifications...', ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-4 text-center text-sm text-muted-foreground', className)}
    {...props}
  >
    {message}
  </div>
))
NotificationLoading.displayName = 'NotificationLoading'

interface NotificationErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

const NotificationError = React.forwardRef<
  HTMLDivElement,
  NotificationErrorProps
>(
  (
    {
      className,
      message = 'Error loading notifications',
      onRetry,
      retryLabel = 'Try again',
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn('p-4 text-center text-sm text-red-500', className)}
      {...props}
    >
      <div className="mb-2">{message}</div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  ),
)
NotificationError.displayName = 'NotificationError'

interface NotificationMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const NotificationMenu = React.forwardRef<
  HTMLDivElement,
  NotificationMenuProps
>(({ children, open, onOpenChange, ...props }, ref) => (
  <div ref={ref} {...props}>
    <Popover open={open} onOpenChange={onOpenChange}>
      {children}
    </Popover>
  </div>
))
NotificationMenu.displayName = 'NotificationMenu'

export {
  // Context and hooks
  useNotification,
  NotificationProvider,

  // Main components
  NotificationRoot,
  NotificationMenu,
  NotificationTrigger,
  NotificationContent,

  // Layout components
  NotificationHeader,
  NotificationList,
  NotificationItem,

  // State components
  NotificationEmpty,
  NotificationLoading,
  NotificationError,

  // Types
  type NotificationData,
  type NotificationContextValue,
  type NotificationProviderProps,
  type NotificationRootProps,
  type NotificationTriggerProps,
  type NotificationContentProps,
  type NotificationHeaderProps,
  type NotificationListProps,
  type NotificationItemProps,
  type NotificationEmptyProps,
  type NotificationLoadingProps,
  type NotificationErrorProps,
  type NotificationMenuProps,
}
