'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  Share2,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  MessageCircleIcon,
  SendIcon,
  MailIcon,
} from 'lucide-react'
import { useClipboard } from '@/@saas-boilerplate/hooks/use-clipboard'

interface ShareDialogContextValue {
  url: string
  title: string
  description: string
  copy: {
    value: string
    onCopy: () => void
    isCopied: boolean
  }
  shareSocial: (platform: string) => void
}

const ShareDialogContext = React.createContext<
  ShareDialogContextValue | undefined
>(undefined)

function useShareDialog() {
  const context = React.useContext(ShareDialogContext)
  if (!context) {
    throw new Error('useShareDialog must be used within a ShareDialogProvider')
  }
  return context
}

interface ShareDialogProviderProps {
  children: React.ReactNode
  url: string
  title?: string
  description?: string
}

function ShareDialogProvider({
  children,
  url,
  title = 'Compartilhar',
  description = 'Compartilhe este link com seus amigos',
}: ShareDialogProviderProps) {
  const copy = useClipboard(url)

  const shareSocial = React.useCallback(
    (platform: string) => {
      let shareUrl = ''
      const text = encodeURIComponent(`${title}: ${url}`)

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url,
          )}`
          break
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url,
          )}&text=${text}`
          break
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            url,
          )}&title=${text}`
          break
        case 'whatsapp':
          shareUrl = `https://api.whatsapp.com/send?text=${text}`
          break
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
            url,
          )}&text=${text}`
          break
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${text}`
          break
        case 'pinterest':
          shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
            url,
          )}&description=${text}`
          break
        case 'reddit':
          shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(
            url,
          )}&title=${text}`
          break
        default:
          return
      }

      window.open(shareUrl, '_blank')
    },
    [url, title],
  )

  const value = React.useMemo(
    () => ({
      url,
      title,
      description,
      copy,
      shareSocial,
    }),
    [url, title, description, copy, shareSocial],
  )

  return (
    <ShareDialogContext.Provider value={value}>
      {children}
    </ShareDialogContext.Provider>
  )
}

interface ShareDialogRootProps extends React.ComponentProps<typeof Dialog> {
  children: React.ReactNode
}

const ShareDialogRoot = React.forwardRef<HTMLDivElement, ShareDialogRootProps>(
  ({ children, ...props }, ref) => <Dialog {...props}>{children}</Dialog>,
)
ShareDialogRoot.displayName = 'ShareDialogRoot'

const ShareDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ children, ...props }, ref) => (
  <DialogTrigger asChild>
    <Button ref={ref} type="button" variant="ghost" size="sm" {...props}>
      {children || <Share2 className="h-4 w-4" />}
    </Button>
  </DialogTrigger>
))
ShareDialogTrigger.displayName = 'ShareDialogTrigger'

const ShareDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogContent>
>(({ ...props }, ref) => {
  const { title, description } = useShareDialog()

  return (
    <DialogContent ref={ref} className="sm:max-w-md" {...props}>
      <DialogHeader>
        <DialogTitle className="font-semibold">{title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {description}
        </DialogDescription>
      </DialogHeader>
      {props.children}
    </DialogContent>
  )
})
ShareDialogContent.displayName = 'ShareDialogContent'

const ShareDialogInput = ({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { copy } = useShareDialog()

  return (
    <div className="flex items-center space-x-2" {...props}>
      <Input value={copy.value} readOnly className="flex-1" />
      <Button type="button" onClick={copy.onCopy} size="icon" variant="outline">
        {copy.isCopied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </Button>
      <Button
        type="button"
        onClick={() => window.open(copy.value, '_blank')}
        size="icon"
        variant="outline"
      >
        <ExternalLinkIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
ShareDialogInput.displayName = 'ShareDialogInput'

const ShareDialogSocialButtons = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { shareSocial } = useShareDialog()

  const socialButtons = [
    { platform: 'facebook', icon: FacebookIcon },
    { platform: 'twitter', icon: TwitterIcon },
    { platform: 'linkedin', icon: LinkedinIcon },
    { platform: 'whatsapp', icon: MessageCircleIcon },
    { platform: 'telegram', icon: SendIcon },
    { platform: 'email', icon: MailIcon },
    { platform: 'pinterest', icon: MailIcon },
    { platform: 'reddit', icon: MailIcon },
  ]

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4" {...props}>
      {socialButtons.map(({ platform, icon: Icon }) => (
        <Button
          key={platform}
          type="button"
          variant="outline"
          className="flex items-center justify-start space-x-2"
          onClick={() => shareSocial(platform)}
        >
          <Icon className="h-4 w-4" />
          <span className="capitalize">{platform}</span>
        </Button>
      ))}
    </div>
  )
})
ShareDialogSocialButtons.displayName = 'ShareDialogSocialButtons'

export {
  useShareDialog,
  ShareDialogProvider,
  ShareDialogRoot,
  ShareDialogTrigger,
  ShareDialogContent,
  ShareDialogInput,
  ShareDialogSocialButtons,
}
