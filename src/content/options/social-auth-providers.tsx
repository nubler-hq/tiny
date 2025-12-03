import { AppleIcon } from '@/components/ui/icons/apple-icon'
import { DiscordIcon } from '@/components/ui/icons/discord-icon'
import { GoogleIcon } from '@/components/ui/icons/google-icon'
import { MicrosoftIcon } from '@/components/ui/icons/microsoft-icon'
import { XIcon } from '@/components/ui/icons/x-icon'
import {
  FacebookIcon,
  GithubIcon,
  GitlabIcon,
  LinkedinIcon,
} from 'lucide-react'

/**
 * Options for social authentication providers
 * @type {Array<Array<{id: AuthSocialProviders, name: string, icon: React.ElementType}>>}
 * @description Defines the available social authentication providers with their icons and display names
 * @property {AuthSocialProviders} id - The provider identifier from AuthSocialProviders enum
 * @property {string} name - Display name of the provider
 * @property {React.ElementType} icon - Icon component for the provider
 */
export const socialAuthProvidersOptions = [
  {
    id: 'google',
    name: 'Google',
    icon: GoogleIcon,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: GithubIcon,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FacebookIcon,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: DiscordIcon,
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: AppleIcon,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: MicrosoftIcon,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: XIcon,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: LinkedinIcon,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: GitlabIcon,
  },
]
