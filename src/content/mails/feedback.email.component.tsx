import * as ReactEmail from '@react-email/components'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Logo } from '@/components/ui/logo'
import { Footer } from './components/footer'

/**
 * Props para o componente de email de feedback
 */
export interface FeedbackEmailProps {
  name?: string
  email: string
  subject: string
  message: string
  category: 'bug' | 'feature' | 'improvement' | 'other'
  priority?: 'low' | 'medium' | 'high'
  userAgent?: string
  url?: string
}

/**
 * Componente React puro para email de feedback
 * Separado da configuração do MailProvider para evitar bundle contamination
 */
export function FeedbackEmailComponent({
  name = 'John Doe',
  email = 'user@example.com',
  subject = 'Sample Feedback',
  message = 'This is a sample feedback message for testing purposes.',
  category = 'feature',
  priority = 'medium',
  userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  url = 'https://app.example.com/dashboard',
}: FeedbackEmailProps) {
  const categoryLabels = {
    bug: '🐛 Bug Report',
    feature: '✨ Feature Request',
    improvement: '🚀 Improvement',
    other: '💬 Other',
  }

  const priorityLabels = {
    low: '🟢 Low',
    medium: '🟡 Medium',
    high: '🔴 High',
  }

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  }

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
        New feedback from {name}: {subject}
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body className="mx-auto my-auto bg-white font-sans">
          <ReactEmail.Container className="mx-auto my-10 max-w-[600px] rounded-md border border-solid border-gray-200 px-10 py-5">
            <ReactEmail.Section className="mt-8">
              <Logo />
            </ReactEmail.Section>

            <ReactEmail.Heading className="mx-0 my-7 p-0 text-left text-xl font-semibold text-black">
              New Feedback Received
            </ReactEmail.Heading>

            <ReactEmail.Text className="text-sm leading-6 text-black">
              You have received new feedback from a user on {AppConfig.name}.
            </ReactEmail.Text>

            {/* Feedback Details Card */}
            <ReactEmail.Section className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <ReactEmail.Text className="text-xs font-semibold text-gray-700 mb-1">
                    FROM
                  </ReactEmail.Text>
                  <ReactEmail.Text className="text-sm text-black">
                    {name}
                  </ReactEmail.Text>
                  <ReactEmail.Text className="text-xs text-gray-600">
                    {email}
                  </ReactEmail.Text>
                </div>
                <div>
                  <ReactEmail.Text className="text-xs font-semibold text-gray-700 mb-1">
                    CATEGORY
                  </ReactEmail.Text>
                  <ReactEmail.Text className="text-sm text-black">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </ReactEmail.Text>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <ReactEmail.Text className="text-xs font-semibold text-gray-700 mb-1">
                    PRIORITY
                  </ReactEmail.Text>
                  <ReactEmail.Text
                    className="text-sm font-medium"
                    style={{
                      color:
                        priorityColors[priority as keyof typeof priorityColors],
                    }}
                  >
                    {priorityLabels[priority as keyof typeof priorityLabels]}
                  </ReactEmail.Text>
                </div>
                {url && (
                  <div>
                    <ReactEmail.Text className="text-xs font-semibold text-gray-700 mb-1">
                      PAGE URL
                    </ReactEmail.Text>
                    <ReactEmail.Link
                      href={url}
                      className="text-xs text-blue-600 no-underline hover:underline"
                    >
                      {url.replace(/^https?:\/\//, '').substring(0, 40)}...
                    </ReactEmail.Link>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <ReactEmail.Text className="text-xs font-semibold text-gray-700 mb-1">
                  SUBJECT
                </ReactEmail.Text>
                <ReactEmail.Text className="text-sm font-medium text-black">
                  {subject}
                </ReactEmail.Text>
              </div>

              <div>
                <ReactEmail.Text className="text-xs font-semibold text-gray-700 mb-2">
                  MESSAGE
                </ReactEmail.Text>
                <div className="rounded-md bg-white border border-gray-200 p-4">
                  <ReactEmail.Text className="text-sm leading-6 text-black whitespace-pre-wrap">
                    {message}
                  </ReactEmail.Text>
                </div>
              </div>
            </ReactEmail.Section>

            {/* Technical Details */}
            {userAgent && (
              <ReactEmail.Section className="my-4">
                <ReactEmail.Text className="text-xs font-semibold text-gray-700 mb-1">
                  TECHNICAL DETAILS
                </ReactEmail.Text>
                <ReactEmail.Text className="text-xs text-gray-600">
                  User Agent: {userAgent}
                </ReactEmail.Text>
              </ReactEmail.Section>
            )}

            <ReactEmail.Section className="my-8">
              <ReactEmail.Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`mailto:${email}?subject=Re: ${subject}`}
              >
                Reply to User
              </ReactEmail.Link>
            </ReactEmail.Section>

            <ReactEmail.Text className="text-sm leading-6 text-black">
              This feedback was submitted through the {AppConfig.name} platform.
              Please review and respond appropriately.
            </ReactEmail.Text>

            <Footer email={AppConfig.creator.email} />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  )
}
