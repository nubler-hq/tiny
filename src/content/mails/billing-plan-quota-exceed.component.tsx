import * as ReactEmail from '@react-email/components'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Url } from '@/@saas-boilerplate/utils/url'
import { String } from '@/@saas-boilerplate/utils/string'
import { Footer } from './components/footer'
import { Logo } from '@/components/ui/logo'
import { Button } from './components/button'

/**
 * Props para o componente de email de quota excedida
 */
export interface BillingPlanQuotaExceedEmailProps {
  email: string
  organizationName: string
  organizationPlan: string
}

/**
 * Componente React puro para email de quota excedida
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function BillingPlanQuotaExceedEmailComponent({
  email = 'panic@thedis.co',
  organizationName = 'Acme Inc.',
  organizationPlan = 'Pro',
}: BillingPlanQuotaExceedEmailProps) {
  return (
    <ReactEmail.Html>
      <ReactEmail.Head />
      <ReactEmail.Preview>
        Your organization {organizationName} has reached the usage limit for the{' '}
        {String.capitalize(organizationPlan)} plan. Some features may be
        temporarily disabled.
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              Usage Limit Reached
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Your {AppConfig.name} organization,{' '}
              <strong>{organizationName}</strong>, has exceeded the{' '}
              <strong>{String.capitalize(organizationPlan)} Plan</strong> limit
              in your current billing cycle.
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Now, you will have some features disabled until your next cycle.
              However, you can upgrade your plan to get back to work normally.
            </ReactEmail.Text>
            <ReactEmail.Section className="my-8">
              <Button href={Url.get('/app/settings/organization/billing')}>
                Upgrade my plan
              </Button>
            </ReactEmail.Section>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Feel free to ignore this email if you don&apos;t plan on
              upgrading, or reply to let us know if you have any questions!
            </ReactEmail.Text>
            <Footer email={email} />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
