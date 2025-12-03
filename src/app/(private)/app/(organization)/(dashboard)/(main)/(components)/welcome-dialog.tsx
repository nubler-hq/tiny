'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRightIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { AppConfig } from '@/config/boilerplate.config.client'
import { useOnborda } from 'onborda'

export function WelcomeDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const { startOnborda } = useOnborda()

  useEffect(() => {
    const welcomeParam = searchParams.get('welcome')
    setOpen(welcomeParam === 'true')
  }, [searchParams])

  function handleClose() {
    setOpen(false)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('welcome')

    let url = window.location.pathname
    const query = params.toString()

    if (query) url = `${window.location.pathname}?${query}`

    router.replace(url)
  }

  function handleOnboarding() {
    startOnborda('welcome_tour')
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[260px]">
        <DialogTitle className="sr-only">
          Welcome to {AppConfig.name}
        </DialogTitle>
        <Logo className="size-12" />

        <div className="space-y-2">
          <h1 className="font-bold text-xl">Welcome to {AppConfig.name}</h1>
          <p>
            Thank you for signing up - your account is ready to use! Now you
            will have a fully access to our dashboard.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={handleOnboarding}
            variant="secondary"
            className="w-fit"
          >
            Start onboarding
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={handleClose} variant="ghost" className="w-fit">
            Skip
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
