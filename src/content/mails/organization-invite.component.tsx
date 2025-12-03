import * as ReactEmail from '@react-email/components'
import { Footer } from './components/footer'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Logo } from '@/components/ui/logo'
import { Button } from './components/button'

/**
 * Props para o componente de email de convite para organização
 */
export interface OrganizationInviteEmailProps {
  email: string
  organization: string
  url: string
}

/**
 * Componente React puro para email de convite para organização
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function OrganizationInviteEmailComponent({
  email = 'user@acme.co',
  organization = 'Acme Inc.',
  url = 'https://example.com/accept-invite',
}: OrganizationInviteEmailProps) {
  return (
    <ReactEmail.Html>
      <ReactEmail.Head />
      <ReactEmail.Preview>
        You have been invited to join {organization} on {AppConfig.name}. Click
        to join and collaborate with your organization.
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              Invitation to Join {organization}
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Hello!
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              You have been invited to join {organization} on {AppConfig.name}.
              We are excited to have you on board and look forward to
              collaborating with you.
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              To get started, please accept your invitation to set up your
              account:
            </ReactEmail.Text>
            {/* Use standardized Button component here */}
            <ReactEmail.Section className="my-7">
              <Button href={url}>Accept Invitation</Button>
            </ReactEmail.Section>
            <ReactEmail.Text className="text-sm leading-6">
              If you have any questions or need assistance, feel free to reach
              out to us.
            </ReactEmail.Text>
            <Footer email={email} marketing />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
