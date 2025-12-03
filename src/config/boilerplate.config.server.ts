import { freePlan } from '@/content/plans/free'
import { proPlan } from '@/content/plans/pro'
import { plusPlan } from '@/content/plans/plus'

export const AppConfig = {
  providers: {
    billing: {
      subscription: {
        enabled: true,

        trial: {
          enabled: true,
          duration: 14, // 14-day free trial
        },

        plans: {
          default: freePlan.slug,
          options: [freePlan, plusPlan, proPlan],
        },
      },
      keys: {
        publishable: process.env.STRIPE_PUBLISHABLE_KEY as string,
        secret: process.env.STRIPE_SECRET_KEY as string,
        webhook: process.env.STRIPE_WEBHOOK_SECRET as string,
      },
      paths: {
        checkoutCancelUrl: '/app/settings/organization/billing?state=cancel',
        checkoutSuccessUrl: '/app/settings/organization/billing?state=success',
        portalReturnUrl: '/app/settings/organization/billing?state=return',
        endSubscriptionUrl: '/app/upgrade',
      },
    },
    mail: {
      from: process.env.MAIL_FROM || 'noreply@saas-boilerplate.com.br',
      provider: process.env.MAIL_PROVIDER || 'smtp',
      secret: process.env.MAIL_SECRET || 'smtp://localhost:1025',
    },
    auth: {
      secret: process.env.IGNITER_APP_SECRET || 'default-secret',
      providers: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
          clientId: process.env.GITHUB_CLIENT_ID as string,
          clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        twitter: {
          clientId: process.env.TWITTER_CLIENT_ID as string,
          clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
        },
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID as string,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
        },
        linkedin: {
          clientId: process.env.LINKEDIN_CLIENT_ID as string,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
        },
        threads: {
          clientId: process.env.THREADS_CLIENT_ID as string,
          clientSecret: process.env.THREADS_CLIENT_SECRET as string,
        },
        instagram: {
          clientId: process.env.INSTAGRAM_CLIENT_ID as string,
          clientSecret: process.env.INSTAGRAM_CLIENT_SECRET as string,
        },
        figma: {
          clientId: process.env.FIGMA_CLIENT_ID as string,
          clientSecret: process.env.FIGMA_CLIENT_SECRET as string,
        },
        trello: {
          clientId: process.env.TRELLO_CLIENT_ID as string,
          clientSecret: process.env.TRELLO_CLIENT_SECRET as string,
        },
      },
    },
    storage: {
      provider: 'S3',
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION,
      bucket: process.env.STORAGE_BUCKET,
      path: process.env.STORAGE_PATH,
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      signatureVersion: 'v4',
    },
  },
} as const
