import { McpIcon } from '@/components/ui/icons/mcp'
import {
  User2Icon,
  BellIcon,
  LockIcon,
  SettingsIcon,
  UsersIcon,
  CreditCardIcon,
  Plug2Icon,
  WebhookIcon,
} from 'lucide-react'

export const settingsSidebarMenu = {
  groups: [
    {
      name: 'Account',
      menu: [
        {
          title: 'My Profile',
          url: '/app/settings/account/profile',
          icon: User2Icon,
        },
        {
          title: 'Notifications',
          url: '/app/settings/account/notifications',
          icon: BellIcon,
        },
        {
          title: 'Security & Access',
          url: '/app/settings/account/security',
          icon: LockIcon,
        },
      ],
    },
    {
      name: 'Administration',
      menu: [
        {
          title: 'Settings',
          url: '/app/settings/organization/information',
          icon: SettingsIcon,
        },
        {
          title: 'Members',
          url: '/app/settings/organization/members',
          icon: UsersIcon,
        },
        {
          title: 'Billing',
          url: '/app/settings/organization/billing',
          icon: CreditCardIcon,
        },
        {
          title: 'API Keys',
          url: '/app/settings/organization/api-keys',
          icon: Plug2Icon,
        },
        {
          title: 'Webhooks',
          url: '/app/settings/organization/webhooks',
          icon: WebhookIcon,
        },
        {
          title: 'Model Context Protocol',
          url: '/app/settings/organization/mcp',
          icon: McpIcon,
        },
      ],
    },
  ],
}
