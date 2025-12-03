import * as ReactEmail from '@react-email/components'
import { Footer } from './components/footer'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Logo } from '@/components/ui/logo'

/**
 * Props para o componente de email de código OTP
 */
export interface OtpCodeEmailProps {
  name?: string | null
  email: string
  otpCode: string
  expiresInMinutes?: number
}

/**
 * Componente React puro para email de código OTP
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function OtpCodeEmailComponent({
  name = 'John Doe',
  email = 'john@example.com',
  otpCode = '123456',
  expiresInMinutes = 10,
}: OtpCodeEmailProps) {
  return (
    <ReactEmail.Html>
      <ReactEmail.Head />
      <ReactEmail.Preview>
        Here is your verification code for {AppConfig.name}: {otpCode}
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              Your Verification Code
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Hello{name ? ` ${name}` : ''},
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Your verification code for {AppConfig.name} is:
            </ReactEmail.Text>
            <ReactEmail.Section className="my-8 text-center">
              <ReactEmail.Section className="rounded-md bg-gray-100 py-4">
                <ReactEmail.Text className="m-0 text-center font-mono text-3xl font-bold tracking-widest text-black">
                  {otpCode}
                </ReactEmail.Text>
              </ReactEmail.Section>
            </ReactEmail.Section>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              This code will expire in {expiresInMinutes} minutes. If you didn't
              request this code, you can safely ignore this email.
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              For security reasons, please do not share this code with anyone.
            </ReactEmail.Text>
            <Footer email={email} />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
