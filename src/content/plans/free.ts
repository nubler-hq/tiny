import { PaymentProvider } from '@/@saas-boilerplate/providers/payment'

export const freePlan = PaymentProvider.plan({
  slug: 'free',
  name: 'Free',
  description: 'Start for free and explore the essential features',
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
          'Capture and manage up to 100 leads monthly through the bot',
        table: 'Lead',
        enabled: true,
        limit: 100,
        cycle: 'month',
      },
      {
        slug: 'submissions',
        name: 'Submissions',
        description:
          'Create up to 1000 submissions per month for your campaigns',
        table: 'Submission',
        enabled: true,
        limit: 1000,
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
        enabled: false,
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
      amount: 0,
      currency: 'brl',
      interval: 'month',
      intervalCount: 1,
      slug: 'free-monthly',
    },
    {
      amount: 0,
      currency: 'brl',
      interval: 'year',
      intervalCount: 1,
      slug: 'free-yearly',
    },
  ],
})
