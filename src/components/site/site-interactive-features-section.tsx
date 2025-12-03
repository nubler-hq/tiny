'use client'

import { useState } from 'react'
import {
  KeyRound,
  Users,
  CreditCard,
  LayoutDashboard,
  Code,
  Mail,
  Component,
  Database,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const features = [
  {
    id: 'dashboard',
    title: 'Interactive Dashboard',
    icon: LayoutDashboard,
    description:
      'Interactive dashboard for your SaaS to fit your specific needs.',
    pills: ['Replace', 'with', 'your', 'features', '+more'],
    screenshot: '/screenshots/screenshot-light-dashboard.jpeg',
  },

  {
    id: 'multi-tenancy',
    title: 'Multi-Tenant Ready',
    icon: Users,
    description:
      'Demo organizations setup. In your SaaS, configure this for your specific customer segmentation.',
    pills: ['Customize', 'for', 'your', 'model', '+config'],
    screenshot: '/screenshots/screenshot-light-members.jpeg',
  },
  {
    id: 'subscriptions',
    title: 'Billing Integration',
    icon: CreditCard,
    description:
      'Demo billing system ready. Configure pricing tiers, payment methods, and subscription rules specific to your business model.',
    pills: ['Your', 'pricing', 'tiers', 'here', '+billing'],
    screenshot: '/screenshots/screenshot-light-billing.jpeg',
  },
  {
    id: 'authentication',
    title: 'User Management',
    icon: KeyRound,
    description:
      'Demo user authentication system. Add your preferred login methods, social auth, SSO integrations, and user profile fields.',
    pills: ['Your', 'auth', 'methods', 'here', '+security'],
    screenshot: '/screenshots/screenshot-light-profile.jpeg',
  },
  {
    id: 'api-layer',
    title: 'API Layer',
    icon: Code,
    description:
      'Demo API structure ready. Customize these endpoints for your specific SaaS functionality.',
    pills: ['Your', 'API', 'endpoints', 'here', '+docs'],
    screenshot: '/screenshots/api.png',
  },
  {
    id: 'database',
    title: 'Database Schema',
    icon: Database,
    description:
      'Demo database with sample data. Modify the schema to match your SaaS data model and business requirements.',
    pills: ['Your', 'data', 'models', 'here', '+migrations'],
    screenshot: '/screenshots/database.png',
  },
  {
    id: 'emails',
    title: 'Email System',
    icon: Mail,
    description:
      'Demo email templates ready. Customize email workflows for your SaaS.',
    pills: ['Your', 'email', 'flows', 'here', '+templates'],
    screenshot: '/screenshots/emails.png',
  },
  {
    id: 'ui-kit',
    title: 'UI Components',
    icon: Component,
    description:
      'Demo UI component library. Customize colors, typography, and add components specific to your SaaS user experience.',
    pills: ['Your', 'brand', 'colors', 'here', '+components'],
    screenshot: '/screenshots/components.png',
  },
]

export function SiteInteractiveFeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0)

  const currentFeature = features[activeFeature]

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-0">
      <div className="flex flex-col items-start container mx-auto max-w-(--breakpoint-lg) space-y-8">
        <div className="text-left max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-tighter font-medium leading-[1.2]!">
            Your SaaS Features Here
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
          {/* Left Navigation Menu */}
          <div className="lg:col-span-4 md:sticky top-32">
            <div className="space-y-2">
              {features.map((feature, index) => {
                const isActive = activeFeature === index
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(index)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 sm:p-4 rounded-lg text-left transition-colors duration-200',
                      isActive
                        ? 'bg-secondary dark:bg-secondary'
                        : 'text-muted-foreground hover:bg-secondary/10 hover:text-primary-foreground',
                    )}
                  >
                    <feature.icon className="w-5 h-5 shrink-0 pt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm sm:text-base mb-1 block">
                        {feature.title}
                      </span>
                      {currentFeature.id === feature.id && (
                        <p className="text-xs sm:text-sm opacity-60 mt-2 leading-relaxed">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="lg:col-span-8">
            <div className="bg-card rounded-md overflow-hidden relative">
              {/* Background div, positioned absolutely to cover the entire card */}
              <div
                className="absolute inset-0 bg-cover bg-left opacity-10"
                style={{
                  backgroundImage: `url('/backgrounds/background-2.svg')`,
                }}
              ></div>

              {/* Content layer, positioned relatively above the background */}
              <div className="relative z-10 h-[580px]">
                {/* Screenshot section */}
                <div className="h-full w-full absolute">
                  <img
                    src={currentFeature.screenshot}
                    alt={currentFeature.title}
                    width={1000}
                    height={1000}
                    className="h-full w-full object-cover object-left"
                  />
                </div>

                {/* Pills section */}
                <div className="flex items-center gap-2 p-4 absolute top-0 right-0">
                  {currentFeature.pills.map((pill) => (
                    <div
                      key={pill}
                      className="px-3 py-1.5 bg-zinc-700/40 backdrop-blur-sm border border-border/30 rounded-full text-sm font-medium text-white shadow-sm"
                    >
                      {pill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
