import { MailProvider } from '@/@saas-boilerplate/providers/mail/mail.provider'
import { getAdapter } from '@/@saas-boilerplate/providers/mail/utils/get-adapter'
import { AppConfig } from '@/config/boilerplate.config.server'
import { activityNotificationEmailTemplate } from '@/content/mails/activity-notification.template'
import { welcomeEmailTemplate } from '@/content/mails/welcome.email.template'
import { organizationInviteTemplate } from '@/content/mails/organization-invite.template'
import { otpCodeEmailTemplate } from '@/content/mails/otp-code.template'
import { downgradeEmailTemplate } from '@/content/mails/billing-plan-downgrade.template'
import { quotaExceededEmailTemplate } from '@/content/mails/billing-plan-quota-exceed.template'
import { planUpgradeEmailTemplate } from '@/content/mails/billing-plan-upgrade.template'
import { feedbackEmailTemplate } from '@/content/mails/feedback.email.template'
import { trialEndedEmailTemplate } from '@/content/mails/trial-ended.template'
import { trialStartedEmailTemplate } from '@/content/mails/trial-started.template'

export const mail = MailProvider.initialize({
  secret: AppConfig.providers.mail.secret,
  from: AppConfig.providers.mail.from || 'no-reply@email.com',
  adapter: getAdapter(AppConfig.providers.mail.provider),
  templates: {
    welcome: welcomeEmailTemplate,
    'organization-invite': organizationInviteTemplate,
    'billing-plan-upgrade': planUpgradeEmailTemplate,
    'billing-plan-quota-exceed': quotaExceededEmailTemplate,
    'billing-plan-downgrade': downgradeEmailTemplate,
    'otp-code': otpCodeEmailTemplate,
    notification: activityNotificationEmailTemplate,
    feedback: feedbackEmailTemplate,
    'trial-ended': trialEndedEmailTemplate,
    'trial-started': trialStartedEmailTemplate,
  },
})
