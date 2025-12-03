import * as ReactEmail from '@react-email/components'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Footer } from './components/footer'
import { Logo } from '@/components/ui/logo'
import { Button } from './components/button'

/**
 * Props para o componente de email de trial iniciado
 */
export interface TrialStartedEmailProps {
  email: string
  name?: string
  organization: string
  trialEndDate: string // ISO string (RFC 3339)
}

/**
 * Componente React puro para email de trial iniciado
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function TrialStartedEmailComponent({
  email = 'hello@example.com',
  name = 'Jane Doe',
  organization = 'Acme Inc.',
  trialEndDate = '2024-08-01T23:59:59.000Z',
}: TrialStartedEmailProps) {
  const endDateObj = new Date(trialEndDate)
  const endDateFormatted = endDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return (
    <ReactEmail.Html>
      <ReactEmail.Head />
      <ReactEmail.Preview>
        Your free trial for {organization} is now active on {AppConfig.name}.
        Enjoy full access until {endDateFormatted}!
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              Your Free Trial Is Now Active!
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Hi{name ? `, ${name}` : ''}!
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Welcome to {AppConfig.name}! Your organization{' '}
              <strong>{organization}</strong> has just started a free trial.
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              You now have full access to all features until{' '}
              <strong>{endDateFormatted}</strong>.
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Explore all the tools, try out premium workflows, and invite your
              team members to get the most out of {AppConfig.name}.
            </ReactEmail.Text>
            <ReactEmail.Section className="my-8">
              <Button href="/app/dashboard">Go to your dashboard</Button>
            </ReactEmail.Section>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Need help? Just reply to this email or contact our team anytime.
            </ReactEmail.Text>
            <Footer email={email} marketing />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
