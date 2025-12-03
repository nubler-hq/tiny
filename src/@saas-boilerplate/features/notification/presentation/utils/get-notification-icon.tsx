import type { NotificationPayloads } from '@/services/notification'
import {
  Bell,
  UserPlus,
  CreditCard,
  Users,
  TrendingUp,
  Settings,
  AlertTriangle,
} from 'lucide-react'

export function getNotificationIcon(type: keyof NotificationPayloads | string) {
  switch (type) {
    case 'USER_INVITED':
      return <UserPlus className="h-4 w-4" />
    case 'BILLING_SUCCESS':
      return <CreditCard className="h-4 w-4" />
    case 'BILLING_FAILED':
      return <CreditCard className="h-4 w-4" />
    case 'MEMBER_JOINED':
      return <Users className="h-4 w-4" />
    case 'LEAD_CREATED':
      return <TrendingUp className="h-4 w-4" />
    case 'SUBSCRIPTION_CREATED':
      return <CreditCard className="h-4 w-4" />
    case 'INTEGRATION_CONNECTED':
      return <Settings className="h-4 w-4" />
    case 'API_KEY_CREATED':
      return <Settings className="h-4 w-4" />
    case 'SYSTEM_MAINTENANCE':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}
