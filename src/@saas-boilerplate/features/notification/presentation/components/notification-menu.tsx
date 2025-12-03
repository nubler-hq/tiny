'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import {
  NotificationRoot,
  NotificationMenu as NotificationMenuComponent,
  NotificationTrigger,
  NotificationContent,
  NotificationHeader,
  NotificationList,
  NotificationItem,
  NotificationEmpty,
  NotificationLoading,
  NotificationError,
} from '@/components/ui/notification'
import { useNotifications } from '../hooks/use-notifications'
import { getNotificationIcon } from '../utils/get-notification-icon'

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
  } = useNotifications()

  const notificationContext = {
    notifications,
    unreadCount,
    isLoading,
    isError,
    onMarkAsRead: markAsRead,
    onMarkAllAsRead: markAllAsRead,
    onDelete: deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
  }

  return (
    <NotificationRoot value={notificationContext}>
      <NotificationMenuComponent open={isOpen} onOpenChange={setIsOpen}>
        <NotificationTrigger />
        <NotificationContent>
          <NotificationHeader
            unreadCount={unreadCount}
            showMarkAllAsRead={true}
          />
          <NotificationList>
            {/* Show loading */}
            {isLoading && <NotificationLoading />}

            {/* Show error */}
            {isError && <NotificationError />}

            {/* Show no notifications */}
            {notifications.length === 0 && (
              <NotificationEmpty
                icon={<Bell className="h-8 w-8 text-gray-300" />}
                title="No notifications"
              />
            )}

            {/* Show notifications */}
            {notifications.length > 0 &&
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  showMarkAsRead={true}
                  getIcon={getNotificationIcon}
                />
              ))}
          </NotificationList>
        </NotificationContent>
      </NotificationMenuComponent>
    </NotificationRoot>
  )
}
