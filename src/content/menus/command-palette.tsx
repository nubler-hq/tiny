import {
  Layers2Icon,
  Users2Icon,
  SendIcon,
  PuzzleIcon,
  SettingsIcon,
  HelpCircleIcon,
  User2Icon,
  BellIcon,
  LockIcon,
  UsersIcon,
  CreditCardIcon,
  Plug2Icon,
  WebhookIcon,
  Plus,
  BookOpen,
  MessageSquare,
} from 'lucide-react'

export interface CommandPaletteItem {
  id: string
  title: string
  description?: string
  url: string
  icon: React.ElementType
  category: string
  keywords?: string[]
  shortcut?: string
}

export const commandPaletteItems: CommandPaletteItem[] = [
  // Main Dashboard
  {
    id: 'dashboard-overview',
    title: 'Overview',
    description: 'Dashboard overview and analytics',
    url: '/app',
    icon: Layers2Icon,
    category: 'Dashboard',
    keywords: ['overview', 'dashboard', 'home', 'main'],
  },
  {
    id: 'dashboard-leads',
    title: 'Leads',
    description: 'Manage your leads',
    url: '/app/leads',
    icon: Users2Icon,
    category: 'Dashboard',
    keywords: ['leads', 'customers', 'prospects'],
  },
  {
    id: 'dashboard-submissions',
    title: 'Submissions',
    description: 'View form submissions',
    url: '/app/submissions',
    icon: SendIcon,
    category: 'Dashboard',
    keywords: ['submissions', 'forms', 'data'],
  },
  {
    id: 'dashboard-integrations',
    title: 'Apps',
    description: 'Manage integrations and apps',
    url: '/app/integrations',
    icon: PuzzleIcon,
    category: 'Dashboard',
    keywords: ['integrations', 'apps', 'plugins', 'connections'],
  },

  // Account Settings
  {
    id: 'settings-profile',
    title: 'My Profile',
    description: 'Manage your personal profile',
    url: '/app/settings/account/profile',
    icon: User2Icon,
    category: 'Account',
    keywords: ['profile', 'account', 'personal', 'user'],
  },
  {
    id: 'settings-notifications',
    title: 'Notifications',
    description: 'Configure notification preferences',
    url: '/app/settings/account/notifications',
    icon: BellIcon,
    category: 'Account',
    keywords: ['notifications', 'alerts', 'email', 'preferences'],
  },
  {
    id: 'settings-security',
    title: 'Security & Access',
    description: 'Manage security settings and access',
    url: '/app/settings/account/security',
    icon: LockIcon,
    category: 'Account',
    keywords: ['security', 'password', 'access', '2fa', 'authentication'],
  },

  // Organization Settings
  {
    id: 'organization-settings',
    title: 'Organization Settings',
    description: 'Manage organization information',
    url: '/app/settings/organization/information',
    icon: SettingsIcon,
    category: 'Organization',
    keywords: ['organization', 'company', 'settings', 'information'],
  },
  {
    id: 'organization-members',
    title: 'Members',
    description: 'Manage team members',
    url: '/app/settings/organization/members',
    icon: UsersIcon,
    category: 'Organization',
    keywords: ['members', 'team', 'users', 'invite'],
  },
  {
    id: 'organization-billing',
    title: 'Billing',
    description: 'Manage billing and subscriptions',
    url: '/app/settings/organization/billing',
    icon: CreditCardIcon,
    category: 'Organization',
    keywords: ['billing', 'subscription', 'payment', 'invoice'],
  },
  {
    id: 'organization-api-keys',
    title: 'API Keys',
    description: 'Manage API keys and tokens',
    url: '/app/settings/organization/api-keys',
    icon: Plug2Icon,
    category: 'Organization',
    keywords: ['api', 'keys', 'tokens', 'integration'],
  },
  {
    id: 'organization-webhooks',
    title: 'Webhooks',
    description: 'Configure webhooks',
    url: '/app/settings/organization/webhooks',
    icon: WebhookIcon,
    category: 'Organization',
    keywords: ['webhooks', 'callbacks', 'events'],
  },

  // Quick Actions
  {
    id: 'action-upgrade',
    title: 'Upgrade Plan',
    description: 'Upgrade your subscription plan',
    url: '/app/upgrade',
    icon: Plus,
    category: 'Quick Actions',
    keywords: ['upgrade', 'plan', 'subscription', 'premium'],
  },

  // Help & Support
  {
    id: 'help-center',
    title: 'Help Center',
    description: 'Get help and support',
    url: '/help',
    icon: HelpCircleIcon,
    category: 'Help',
    keywords: ['help', 'support', 'documentation', 'faq'],
  },
  {
    id: 'send-feedback',
    title: 'Send Feedback',
    description: 'Send feedback to our team',
    url: '/contact',
    icon: MessageSquare,
    category: 'Help',
    keywords: ['feedback', 'contact', 'support', 'suggestion'],
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Browse documentation',
    url: '/docs',
    icon: BookOpen,
    category: 'Help',
    keywords: ['docs', 'documentation', 'guides', 'tutorials'],
  },
]

export const commandPaletteCategories = [
  'Dashboard',
  'Account',
  'Organization',
  'Quick Actions',
  'Help',
] as const

export type CommandPaletteCategory = (typeof commandPaletteCategories)[number]
