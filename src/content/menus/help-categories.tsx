import {
  BookOpen,
  FileQuestion,
  RefreshCw,
  Users,
  Briefcase,
  Database,
  FormInput,
  Key,
  Bell,
} from 'lucide-react'

type PopularCategory = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

export const helpCategoriesMenu: PopularCategory[] = [
  {
    id: '1',
    title: 'Getting Started',
    description:
      'Complete setup guide to get your workspace configured and ready',
    icon: <BookOpen className="h-5 w-5 text-primary" />,
    href: '/help/getting-started',
  },
  {
    id: '2',
    title: 'Account Management',
    description: 'Manage your profile, security, and organization settings',
    icon: <Users className="h-5 w-5 text-primary" />,
    href: '/help/account-management',
  },
  {
    id: '3',
    title: 'Leads Management',
    description: 'Organize and manage your business leads and contacts',
    icon: <Database className="h-5 w-5 text-primary" />,
    href: '/help/leads',
  },
  {
    id: '4',
    title: 'Form Submissions',
    description: 'Track and manage form submissions and user interactions',
    icon: <FormInput className="h-5 w-5 text-primary" />,
    href: '/help/submissions',
  },
  {
    id: '5',
    title: 'Integrations',
    description: 'Connect with external tools and automate your workflows',
    icon: <RefreshCw className="h-5 w-5 text-primary" />,
    href: '/help/integrations',
  },
  {
    id: '6',
    title: 'Billing & Subscriptions',
    description: 'Manage your subscription plans and billing information',
    icon: <Briefcase className="h-5 w-5 text-primary" />,
    href: '/help/billing',
  },
  {
    id: '7',
    title: 'API Keys',
    description: 'Manage API keys for external integrations and automation',
    icon: <Key className="h-5 w-5 text-primary" />,
    href: '/help/api-keys',
  },
  {
    id: '8',
    title: 'Webhooks',
    description: 'Configure real-time event notifications and integrations',
    icon: <Bell className="h-5 w-5 text-primary" />,
    href: '/help/webhooks',
  },
  {
    id: '9',
    title: 'FAQ',
    description: 'Answers to the most common questions and troubleshooting',
    icon: <FileQuestion className="h-5 w-5 text-primary" />,
    href: '/help/faq',
  },
]
