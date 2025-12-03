import * as ReactEmail from '@react-email/components'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Footer } from './components/footer'
import { Logo } from '@/components/ui/logo'

/**
 * Props para o componente de email de upgrade de plano
 */
export interface BillingPlanUpgradeEmailProps {
  name?: string | null
  email: string
  plan: string
  organization: string
}

/**
 * Componente React puro para email de upgrade de plano
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function BillingPlanUpgradeEmailComponent({
  name = 'Brendon Urie',
  email = 'panic@thedis.co',
  plan = 'Pro',
  organization = 'Acme Inc.',
}: BillingPlanUpgradeEmailProps) {
  return (
    <ReactEmail.Html>
      <ReactEmail.Head />
      <ReactEmail.Preview>
        Your {AppConfig.name} plan upgrade was successful. Thank you for
        supporting us!
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              Plan Upgrade Confirmed
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Hey{name && ` ${name}`}!
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              My name is {AppConfig.creator.name}, and I&apos;m the founder of{' '}
              {AppConfig.name}. I wanted to personally reach out to thank you
              for upgrading to {AppConfig.name} {plan} on "{organization}"
              organization!
            </ReactEmail.Text>

            <ReactEmail.Text className="text-sm leading-6 text-black">
              Let me know if you have any questions or feedback. I&apos;m always
              happy to help!
            </ReactEmail.Text>

            <ReactEmail.Text className="text-sm font-light leading-6 text-zync-600">
              <u>{AppConfig.creator.name}</u> from{' '}
              <strong>{AppConfig.name}</strong>
            </ReactEmail.Text>

            <Footer email={email} marketing />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
