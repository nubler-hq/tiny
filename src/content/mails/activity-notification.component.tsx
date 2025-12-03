import * as ReactEmail from '@react-email/components'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Footer } from './components/footer'
import { Logo } from '@/components/ui/logo'

/**
 * Props para o componente de email de notificação de atividade
 */
export interface ActivityNotificationEmailProps {
  name?: string // Recipient name (optional)
  email: string // Recipient email
  title: string // Activity title
  content: string // Activity content
  action?: {
    label: string // CTA Button label (optional)
    url: string // CTA Button URL (optional)
  }
}

/**
 * Componente React puro para email de notificação de atividade
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function ActivityNotificationEmailComponent({
  name = 'John Doe',
  email = 'usuario@exemplo.com',
  title = `You have a new notification on ${AppConfig.name}`,
  content = 'A new login was detected on your account from an unknown device.',
  action,
}: ActivityNotificationEmailProps) {
  return (
    <ReactEmail.Html>
      <ReactEmail.Head>
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              .invert-on-dark { filter: invert(1); }
            }
          `}
        </style>
      </ReactEmail.Head>
      <ReactEmail.Preview>{content}</ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              {title}
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Hello{name ? `, ${name}` : ''},
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              {content}
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              If you do not recognize this notification, please contact our
              support team immediately.
            </ReactEmail.Text>
            {!!action?.label && !!action?.url && (
              <ReactEmail.Section className="my-6">
                <ReactEmail.Link
                  className="rounded bg-blue-600 px-6 py-3 text-center text-[14px] font-semibold text-white no-underline hover:bg-blue-700 transition-colors"
                  href={action.url}
                >
                  {action.label}
                </ReactEmail.Link>
              </ReactEmail.Section>
            )}
            <Footer email={email} />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
