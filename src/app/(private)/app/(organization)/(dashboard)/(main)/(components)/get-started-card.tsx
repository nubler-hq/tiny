import React from 'react'

import { Link } from 'next-view-transitions'
import { CardContent } from '@/components/ui/card'
import {
  GettingStartedCard,
  GettingStartedCardHeader,
  GettingStartedCardTitle,
  GettingStartedProgressBar,
  GettingStartedStep,
  GettingStartedStepIcon,
  GettingStartedStepContent,
  GettingStartedStepTitle,
  GettingStartedStepDescription,
  GettingStartedStepArrow,
  GettingStartedFooterMessage,
  GettingStartedFooterButton,
  GettingStartedFooter,
} from '@/components/ui/getting-started'
import {
  Check,
  BriefcaseIcon,
  UsersIcon,
  CpuIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StepConfig {
  key: string
  icon: React.ReactElement
  title: string
  description: string
  href: string
}

const STEP_CONFIG: StepConfig[] = [
  {
    key: 'createBrand',
    icon: <BriefcaseIcon className="w-3.5 h-3.5" />,
    title: 'Customize your team',
    description: 'Add a logo and personalize your organization',
    href: '/app/settings/organization/information',
  },
  {
    key: 'inviteMembers',
    icon: <UsersIcon className="w-3.5 h-3.5" />,
    title: 'Invite team members',
    description: 'Invite members to join your team',
    href: '/app/settings/organization/members',
  },
  {
    key: 'configureIntegrations',
    icon: <CpuIcon className="w-3.5 h-3.5" />,
    title: 'Configure integrations',
    description: 'Set up integrations with other services',
    href: '/app/integrations',
  },
  {
    key: 'upgradePlan',
    icon: <ShieldCheckIcon className="w-3.5 h-3.5" />,
    title: 'Upgrade your plan',
    description: 'Choose the best plan for your business',
    href: '/app/settings/organization/billing',
  },
]

type BackendStep = { key: string; finished: boolean }

type OnboardingData = {
  completed: number
  total: number
  steps: BackendStep[]
}

export async function GetStartedSection({ data }: { data: OnboardingData }) {
  const completionByKey: Record<string, boolean> = {}
  data.steps.forEach((step) => {
    completionByKey[step.key] = !!step.finished
  })
  const progressPercentage = (data.completed / (data.total || 1)) * 100

  return (
    <GettingStartedCard>
      <GettingStartedCardHeader className="px-4 md:px-6 py-4">
        <GettingStartedCardTitle>Steps to get started</GettingStartedCardTitle>
        <GettingStartedProgressBar value={progressPercentage} className="h-2" />
      </GettingStartedCardHeader>
      <CardContent className="space-y-4 px-4 md:px-6">
        {STEP_CONFIG.map((step) => {
          const finished = completionByKey[step.key]
          return (
            <Link key={step.key} href={step.href} className="block">
              <GettingStartedStep finished={finished}>
                <GettingStartedStepIcon
                  className={
                    finished
                      ? 'bg-secondary text-secondary-foreground border border-border'
                      : 'bg-transparent text-primary border border-border'
                  }
                >
                  {finished ? <Check className="w-4 h-4" /> : step.icon}
                </GettingStartedStepIcon>
                <GettingStartedStepContent>
                  <GettingStartedStepTitle>
                    {step.title}
                  </GettingStartedStepTitle>
                  <GettingStartedStepDescription>
                    {step.description}
                  </GettingStartedStepDescription>
                </GettingStartedStepContent>
                <div className="flex items-center gap-2 ml-auto">
                  {finished && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-primary" />
                      Done
                    </Badge>
                  )}
                  <GettingStartedStepArrow />
                </div>
              </GettingStartedStep>
            </Link>
          )
        })}
      </CardContent>
      <GettingStartedFooter>
        <GettingStartedFooterMessage>Need help?</GettingStartedFooterMessage>
        <Link href="/blog/how-to-get-started-with-our-platform">
          <GettingStartedFooterButton>
            View Complete Guide
          </GettingStartedFooterButton>
        </Link>
      </GettingStartedFooter>
    </GettingStartedCard>
  )
}
