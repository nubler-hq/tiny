import * as ReactEmail from '@react-email/components'
import { Footer } from './components/footer'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Logo } from '@/components/ui/logo'

/**
 * Props para o componente de email de boas-vindas
 */
export interface WelcomeEmailProps {
  name?: string | null
  email: string
}

/**
 * Componente React puro para email de boas-vindas
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function WelcomeEmailComponent({
  name = 'Brendon Urie',
  email = 'panic@thedis.co',
}: WelcomeEmailProps) {
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
      <ReactEmail.Preview>
        Your account on {AppConfig.name} is ready! Start exploring the platform
        now.
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[500px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>
            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              Welcome to {AppConfig.name}
            </ReactEmail.Heading>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Hello{name && `, ${name}`}!
            </ReactEmail.Text>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              We're excited to have you join {AppConfig.name} — You can see that
              it helps organizations manage users, teams, projects, payments,
              and more. Get ready to streamline your workflows and drive your
              business forward!
            </ReactEmail.Text>
            <div className="space-y-4 my-6">
              <ReactEmail.Text className="text-md font-semibold text-gray-800">
                Here's what you can do with {AppConfig.name}:
              </ReactEmail.Text>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-xl px-4">
                  <div className="flex items-center mb-2">
                    <ReactEmail.Img
                      src="https://api.iconify.design/feather:users.svg"
                      width="12"
                      height="12"
                      alt="Teams"
                      className="mr-2"
                    />
                    <ReactEmail.Text className="text-xs font-medium text-gray-700">
                      Manage Teams
                    </ReactEmail.Text>
                  </div>
                  <ReactEmail.Text className="text-xs text-gray-600">
                    Easily invite and organize users into teams and roles
                  </ReactEmail.Text>
                </div>
                <div className="bg-gray-100 rounded-xl px-4">
                  <div className="flex items-center mb-2">
                    <ReactEmail.Img
                      src="https://api.iconify.design/feather:key.svg"
                      width="12"
                      height="12"
                      alt="API Keys"
                      className="mr-2"
                    />
                    <ReactEmail.Text className="text-xs font-medium text-gray-700">
                      Secure API Access
                    </ReactEmail.Text>
                  </div>
                  <ReactEmail.Text className="text-xs text-gray-600">
                    Generate and manage secure API keys for integrations
                  </ReactEmail.Text>
                </div>
                <div className="bg-gray-100 rounded-xl px-4">
                  <div className="flex items-center mb-2">
                    <ReactEmail.Img
                      src="https://api.iconify.design/feather:bar-chart.svg"
                      width="12"
                      height="12"
                      alt="Analytics"
                      className="mr-2"
                    />
                    <ReactEmail.Text className="text-xs font-medium text-gray-700">
                      Advanced Analytics
                    </ReactEmail.Text>
                  </div>
                  <ReactEmail.Text className="text-xs text-gray-600">
                    Track submissions, leads, and organizational data at a
                    glance
                  </ReactEmail.Text>
                </div>
                <div className="bg-gray-100 rounded-xl px-4">
                  <div className="flex items-center mb-2">
                    <ReactEmail.Img
                      src="https://api.iconify.design/feather:dollar-sign.svg"
                      width="12"
                      height="12"
                      alt="Billing"
                      className="mr-2"
                    />
                    <ReactEmail.Text className="text-xs font-medium text-gray-700">
                      Easy Billing
                    </ReactEmail.Text>
                  </div>
                  <ReactEmail.Text className="text-xs text-gray-600">
                    Select the right plan and securely manage payments for your
                    team
                  </ReactEmail.Text>
                </div>
              </div>
            </div>
            <ReactEmail.Text className="text-sm leading-6 text-black mt-4 mb-2">
              Next steps to get started:
            </ReactEmail.Text>
            <div>
              <div className="flex items-center rounded-md px-4 bg-gray-100 mb-2">
                <ReactEmail.Img
                  src="https://api.iconify.design/feather:check.svg"
                  width="12"
                  height="12"
                  alt="Check"
                  className="mr-2"
                />
                <ReactEmail.Text className="text-xs text-black">
                  Complete your profile in the{' '}
                  <ReactEmail.Link
                    href="/app/profile"
                    className="font-medium text-blue-600 no-underline"
                  >
                    dashboard
                  </ReactEmail.Link>
                </ReactEmail.Text>
              </div>
              <div className="flex items-center rounded-md px-4 bg-gray-100 mb-2">
                <ReactEmail.Img
                  src="https://api.iconify.design/feather:check.svg"
                  width="12"
                  height="12"
                  alt="Check"
                  className="mr-2"
                />
                <ReactEmail.Text className="text-xs text-black">
                  Invite your teammates and assign roles
                </ReactEmail.Text>
              </div>
              <div className="flex items-center rounded-md px-4 bg-gray-100 mb-2">
                <ReactEmail.Img
                  src="https://api.iconify.design/feather:check.svg"
                  width="12"
                  height="12"
                  alt="Check"
                  className="mr-2"
                />
                <ReactEmail.Text className="text-xs text-black">
                  Set up integrations and webhooks
                </ReactEmail.Text>
              </div>
              <div className="flex items-center rounded-md px-4 bg-gray-100">
                <ReactEmail.Img
                  src="https://api.iconify.design/feather:check.svg"
                  width="12"
                  height="12"
                  alt="Check"
                  className="mr-2"
                />
                <ReactEmail.Text className="text-xs text-black">
                  Explore{' '}
                  <ReactEmail.Link
                    href="/app/tools"
                    className="font-medium text-blue-600 no-underline"
                  >
                    productivity tools
                  </ReactEmail.Link>{' '}
                  and analytics
                </ReactEmail.Text>
              </div>
            </div>
            <ReactEmail.Section className="my-8">
              <ReactEmail.Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href="/app/dashboard"
              >
                Get Started
              </ReactEmail.Link>
            </ReactEmail.Section>
            <ReactEmail.Text className="text-sm leading-6 text-black">
              Our team is here to help you succeed. If you have any questions,
              feel free to reach out at any time!
            </ReactEmail.Text>
            <Footer email={email} marketing />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
