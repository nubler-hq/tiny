import { PaymentProvider } from '@/@saas-boilerplate/providers/payment'

export const plusPlan = PaymentProvider.plan({
  slug: 'plus',
  name: 'Plus',
  description: 'For small teams getting started and needing more power.',
  metadata: {
    features: [
      {
        slug: 'seats',
        name: 'Seats',
        description: 'Add up to 5 members to collaborate with your team',
        table: 'Member',
        enabled: true,
        limit: 5,
      },
      {
        slug: 'leads',
        name: 'Leads',
        description:
          'Capture and manage up to 2500 leads monthly through the bot',
        table: 'Lead',
        enabled: true,
        limit: 2500,
        cycle: 'month',
      },
      {
        slug: 'submissions',
        name: 'Submissions',
        description:
          'Create up to 25000 submissions per month for your campaigns',
        table: 'Submission',
        enabled: true,
        limit: 25000,
        cycle: 'month',
      },
      {
        slug: 'mail-support',
        name: 'Email Support',
        description: 'Access to basic email support during business hours',
        enabled: true,
      },
      {
        slug: 'chat-support',
        name: 'Chat Support',
        description: 'Real-time chat support',
        enabled: true,
      },
      {
        slug: 'integrations',
        name: 'Advanced Integrations',
        description: 'Connect with other tools and automate your processes',
        enabled: false,
      },
    ],
  },
  prices: [
    {
      amount: 2000,
      currency: 'brl',
      interval: 'month',
      intervalCount: 1,
      slug: 'plus-monthly',
    },
    {
      amount: 20000,
      currency: 'brl',
      interval: 'year',
      intervalCount: 1,
      slug: 'plus-yearly',
    },
  ],
})
