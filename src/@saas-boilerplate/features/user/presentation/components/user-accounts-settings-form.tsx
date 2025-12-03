'use client'

import * as React from 'react'

import { Annotated } from '@/components/ui/annotated'
import { ArrowRightIcon, LockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/igniter.client'
import { toast } from 'sonner'
import { delay } from '@/@saas-boilerplate/utils/delay'
import { getActiveSocialProviders } from '@/@saas-boilerplate/features/auth/presentation/utils/get-social-providers'

type AccountProvider =
  | 'google'
  | 'github'
  | 'facebook'
  | 'discord'
  | 'apple'
  | 'microsoft'
  | 'twitter'
  | 'linkedin'
  | 'gitlab'

export function UserAccountsSettingsForm() {
  const socialProviders = api.auth.getActiveSocialProvider.useQuery()
  const accounts = api.account.findManyByCurrentUser.useQuery()

  const [providers, setProviders] = React.useState<
    { id: string; name: string; icon: React.ElementType }[]
  >([])

  const handleLinkAccount = async (provider: AccountProvider) => {
    toast.loading('Connecting account...')

    const response = await api.account.link.mutate({
      body: {
        provider,
        callbackURL: window.location.href,
      },
    })

    if (response.error) {
      toast.error(
        'An error occurred while trying to connect the account. Please try again.',
      )
      return
    }

    if (response.data && response.data.redirect && response.data.url) {
      toast.success('Redirecting to authentication page...')
      delay(1000)
      window.location.href = response.data.url
    }
  }

  const handleUnlinkAccount = async (provider: AccountProvider) => {
    toast.loading('Disconnecting account...')

    const response = await api.account.unlink.mutate({
      body: {
        provider,
      },
    })

    if (response.error) {
      toast.error(
        'An error occurred while trying to disconnect the account. Please try again.',
      )
      return
    }

    toast.success('Account disconnected successfully.')
  }

  React.useEffect(() => {
    setProviders(getActiveSocialProviders(socialProviders.data))
  }, [socialProviders.data])

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <LockIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Connected accounts</Annotated.Title>
        <Annotated.Description>
          Streamline your access by connecting your account to a provider for
          faster login.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <div className="merge-form-section">
            {providers.map((provider) => {
              return (
                <div
                  className="flex space-x-4 items-center justify-between py-4 text-sm"
                  key={provider.id}
                >
                  <div className="flex items-center space-x-4">
                    {provider.icon && <provider.icon className="size-4" />}
                    <h3 className="flex-1">{provider.name}</h3>
                  </div>

                  <div className="text-sm flex items-center space-x-4">
                    {!accounts.error &&
                      accounts.data?.find(
                        (account) => account.provider === provider.id,
                      ) && (
                        <span className="text-muted-foreground">Connected</span>
                      )}

                    {!accounts.error &&
                      !accounts.data?.find(
                        (account) => account.provider === provider.id,
                      ) && (
                        <span className="text-muted-foreground">
                          Not connected
                        </span>
                      )}

                    {!accounts.error &&
                      !accounts.data?.find(
                        (account) => account.provider === provider.id,
                      ) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleLinkAccount(provider.id as AccountProvider)
                          }
                        >
                          Connect
                          <ArrowRightIcon />
                        </Button>
                      )}

                    {!accounts.error &&
                      accounts.data?.find(
                        (account) => account.provider === provider.id,
                      ) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUnlinkAccount(provider.id as AccountProvider)
                          }
                        >
                          Disconnect
                          <ArrowRightIcon />
                        </Button>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
