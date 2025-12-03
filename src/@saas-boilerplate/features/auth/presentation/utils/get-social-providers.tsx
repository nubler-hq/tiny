import { socialAuthProvidersOptions } from '@/content/options/social-auth-providers'

/**
 * Filters and returns the list of active social authentication providers.
 * An active provider is one whose ID exists in the auth.options.socialProviders configuration.
 *
 * @returns {SocialAuthProvider[]} Array of active social authentication provider objects
 */
export function getActiveSocialProviders(active: string[] | null = []) {
  if (!active) return []

  return socialAuthProvidersOptions.filter((provider) => {
    return active.includes(provider.id)
  })
}
