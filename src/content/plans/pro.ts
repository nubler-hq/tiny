import { PaymentProvider } from '@/@saas-boilerplate/providers/payment'

export const proPlan = PaymentProvider.plan({
  slug: 'pro',
  name: 'Pro',
  description: 'Pro Plan with enhanced features. Ideal for growing teams.',
  metadata: {
    features: [
      {
        slug: 'seats',
        name: 'Seats',
        description: 'Add up to 1 member to collaborate with your team',
        table: 'Member',
        enabled: true,
        limit: 1,
      },
      {
        slug: 'leads',
        name: 'Leads',
        description:
          'Capture and manage up to 10000 leads monthly through the bot',
        table: 'Lead',
        enabled: true,
        limit: 10000,
        cycle: 'month',
      },
      {
        slug: 'submissions',
        name: 'Submissions',
        description:
          'Create up to 100000 submissions per month for your campaigns',
        table: 'Submission',
        enabled: true,
        limit: 100000,
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
        enabled: true,
      },
    ],
  },
  prices: [
    {
      amount: 20000,
      currency: 'brl',
      interval: 'month',
      intervalCount: 1,
      slug: 'pro-monthly',
    },
    {
      amount: 2000000,
      currency: 'brl',
      interval: 'year',
      intervalCount: 1,
      slug: 'pro-yearly',
    },
  ],
})
