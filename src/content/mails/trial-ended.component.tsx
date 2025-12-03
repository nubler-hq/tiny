import * as ReactEmail from '@react-email/components'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Footer } from './components/footer'
import { Logo } from '@/components/ui/logo'
import { Button } from './components/button'

/**
 * Props para o componente de email de término de trial
 */
export interface TrialEndedEmailProps {
  email: string
  name?: string
  organization: string
}

/**
 * Componente React puro para email de término de trial
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function TrialEndedEmailComponent({
  email = 'hello@example.com',
  name = 'Jane Doe',
  organization = 'Acme Inc.',
}: TrialEndedEmailProps) {
  return (
    <ReactEmail.Html>
      <ReactEmail.Head />
      <ReactEmail.Preview>
        The free trial for your organization {organization} has ended on{' '}
        {AppConfig.name}. Choose a plan to keep enjoying premium features.
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              Trial Ended
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Hi{name ? `, ${name}` : ''}.
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              The free trial for your organization{' '}
              <strong>{organization}</strong> has ended. We hope you enjoyed
              exploring {AppConfig.name} and its premium features!
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              To keep enjoying uninterrupted access to all features, please
              choose a plan that best fits your needs.
            </ReactEmail.Text>
            <ReactEmail.Section className="my-8">
              <Button href="/app/billing">View plans & subscribe</Button>
            </ReactEmail.Section>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Have questions or need help? Just reply to this email and our team
              will assist you.
            </ReactEmail.Text>
            <Footer email={email} marketing />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
