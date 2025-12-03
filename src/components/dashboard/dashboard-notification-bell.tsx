'use client'

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useNotifications } from '@/@saas-boilerplate/features/notification/presentation/hooks/use-notifications'
import { getNotificationIcon } from '@/@saas-boilerplate/features/notification/presentation/utils/get-notification-icon'
import { getNotificationContent } from '@/@saas-boilerplate/features/notification/presentation/utils/get-notification-content'
import type { NotificationPayloads } from '@/services/notification'

/**
 * @interface NotificationItemProps
 * @description Props for individual notification item component
 */
interface NotificationItemProps {
  notification: {
    id: string
    type: string
    data: any
    readAt: Date | null
    action?: string
    createdAt: Date
  }
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  isMarkingAsRead?: boolean
  isDeleting?: boolean
}

/**
 * @component NotificationItem
 * @description Individual notification item with actions and type-specific styling
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
}: NotificationItemProps) {
  const isUnread = !notification.readAt

  const { title, description } = getNotificationContent(
    notification.type as keyof NotificationPayloads,
    notification.data as NotificationPayloads[keyof NotificationPayloads],
  )

  return (
    <div
      className={`p-3 border-b last:border-b-0 ${isUnread ? 'bg-background' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-1">{getNotificationIcon(notification.type)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}
              >
                {title}
              </p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {description}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: enUS,
                })}
              </p>
            </div>

            {/* Unread indicator */}
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2" />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {isUnread && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarkingAsRead}
                className="h-7 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * @component DashboardNotificationBell
 * @description Main notification bell component for the dashboard with real-time updates.
 * Displays notification count badge and provides a popover interface for viewing and managing notifications.
 */
export function DashboardNotificationBell() {
  const [isOpen, setIsOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
  } = useNotifications()

  const hasNotifications = notifications.length > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" side="right">
        <Card className="overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="h-7 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  {isMarkingAllAsRead ? 'Marking...' : 'Mark all as read'}
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {unreadCount}{' '}
                {unreadCount === 1
                  ? 'unread notification'
                  : 'unread notifications'}
              </p>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : isError ? (
              <div className="p-4 text-center text-sm text-red-500">
                Error loading notifications
              </div>
            ) : !hasNotifications ? (
              <div className="flex flex-col items-center justify-center p-4 text-center text-sm text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No notifications
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification as any}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    isMarkingAsRead={isMarkingAsRead}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer with pagination */}
          {hasNotifications && pagination && pagination.totalPages > 1 && (
            <>
              <Separator />
              <div className="px-4 py-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevPage}
                      disabled={!canGoPrev}
                      className="h-6 px-2 text-xs"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextPage}
                      disabled={!canGoNext}
                      className="h-6 px-2 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  )
}
