import { Link } from 'next-view-transitions'
import { AppConfig } from '@/config/boilerplate.config.client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FacebookIcon, InstagramIcon } from 'lucide-react'
import { XIcon } from '@/components/ui/icons/x-icon'

export function ContactSection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-4xl px-4 lg:px-0 border">
        <div className="grid divide- bg-secondary border-b md:grid-cols-2 md:gap-4 md:divide-x md:divide-y-0">
          <div className="flex flex-col justify-between space-y-8 p-6 sm:p-12">
            <div>
              <h2 className="mb-3 text-lg font-semibold">Collaborate</h2>
              <Link
                href={`mailto:${AppConfig.links.mail}`}
                className="text-lg hover:underline"
              >
                {AppConfig.links.mail}
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-8 p-6 sm:p-12">
            <div>
              <h3 className="mb-3 text-lg font-semibold">Social Media</h3>
              <div className="flex flex-wrap gap-4">
                {AppConfig.links.linkedin && (
                  <Link
                    href={AppConfig.links.linkedin}
                    className="flex items-center hover:underline"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.79-1.75-1.764 0-.974.784-1.764 1.75-1.764s1.75.79 1.75 1.764c0 .974-.784 1.764-1.75 1.764zm13.5 11.268h-3v-5.604c0-1.338-.026-3.065-1.867-3.065-1.868 0-2.154 1.459-2.154 2.966v5.703h-3v-10h2.884v1.367h.041c.402-.761 1.384-1.562 2.847-1.562 3.041 0 3.605 2.001 3.605 4.604v5.591z" />
                    </svg>
                  </Link>
                )}
                {AppConfig.links.twitter && (
                  <Link
                    href={AppConfig.links.twitter}
                    className="flex items-center hover:underline"
                  >
                    <XIcon className="size-5" />
                  </Link>
                )}
                {AppConfig.links.facebook && (
                  <Link
                    href={AppConfig.links.facebook}
                    className="flex items-center hover:underline"
                  >
                    <FacebookIcon className="size-5" />
                  </Link>
                )}
                {AppConfig.links.instagram && (
                  <Link
                    href={AppConfig.links.instagram}
                    className="flex items-center hover:underline"
                  >
                    <InstagramIcon className="size-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <form action="" className="p-12">
          <h3 className="text-xl font-semibold">Sales support</h3>
          <p className="text-sm mt-1">
            Speak with our sales team about features or plan pricing, or request
            a demo.
          </p>

          <div className="**:[&>label]:block mt-12 space-y-6 *:space-y-3">
            <div>
              <Label htmlFor="name" className="space-y-2">
                Work email
              </Label>
              <Input variant="outline" type="text" id="name" required />
            </div>
            <div>
              <Label htmlFor="msg" className="space-y-2">
                How can we help? *
              </Label>
              <Textarea id="msg" rows={3} />
            </div>
            <Button>Submit</Button>
          </div>
        </form>
      </div>
    </section>
  )
}
