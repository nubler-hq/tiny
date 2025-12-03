import { Logo } from '@/components/ui/logo'
import { Link } from 'next-view-transitions'
import {
  ArrowUpIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  RssIcon,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { SITE_FOOTER_LINKS } from '@/content/menus/site-footer'
import { AppConfig } from '@/config/boilerplate.config.client'
import { TiktokIcon } from '../ui/icons/tiktok-icon'
import { ThreadsIcon } from '../ui/icons/threads-icon'
import { XIcon } from '../ui/icons/x-icon'

export function SiteMainFooter() {
  return (
    <footer className="py-16 bg-secondary/20 shadow-inner">
      <div className="mx-auto max-w-5xl px-6">
        <Link href="/" aria-label="go home" className="mx-auto block size-fit">
          <Logo />
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {SITE_FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {AppConfig.links.twitter && (
            <Link
              href={AppConfig.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X/Twitter"
              className="text-muted-foreground hover:text-primary block"
            >
              <XIcon className="size-6" />
            </Link>
          )}
          {AppConfig.links.linkedin && (
            <Link
              href={AppConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary block"
            >
              <LinkedinIcon className="size-6" />
            </Link>
          )}
          {AppConfig.links.facebook && (
            <Link
              href={AppConfig.links.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-muted-foreground hover:text-primary block"
            >
              <FacebookIcon className="size-6" />
            </Link>
          )}
          {AppConfig.links.instagram && (
            <Link
              href={AppConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-primary block"
            >
              <InstagramIcon className="size-6" />
            </Link>
          )}
          {AppConfig.links.threads && (
            <Link
              href={AppConfig.links.threads}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads"
              className="text-muted-foreground hover:text-primary block"
            >
              <ThreadsIcon className="size-6" />
            </Link>
          )}
          {AppConfig.links.tiktok && (
            <Link
              href={AppConfig.links.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-muted-foreground hover:text-primary block"
            >
              <TiktokIcon className="size-6" />
            </Link>
          )}
          {AppConfig.links.rss && (
            <Link
              href={AppConfig.links.rss}
              aria-label="RSS Feed"
              className="text-muted-foreground hover:text-primary block"
            >
              <RssIcon className="size-6" />
            </Link>
          )}
        </div>
        <span className="text-muted-foreground block text-center text-sm">
          {' '}
          © {new Date().getFullYear()} {AppConfig.name}, All rights reserved
        </span>
        <div className="w-fit mx-auto mt-8 flex items-center space-x-2">
          <span className="border rounded-full p-1 bg-black/10 shadow-inner">
            <ThemeToggle />
          </span>
          <Button className="rounded-full h-8 w-8" variant="secondary">
            <ArrowUpIcon className="size-4" />
          </Button>
        </div>
      </div>
    </footer>
  )
}
