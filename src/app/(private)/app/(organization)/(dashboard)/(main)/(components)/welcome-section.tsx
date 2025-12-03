'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { String } from '@/@saas-boilerplate/utils/string'

export function WelcomeSection() {
  const auth = useAuth()

  const organization = auth.session.organization
  const user = auth.session.user

  return (
    <section className="space-y-8">
      <header className="flex items-center">
        <h1 className="flex items-center text-muted-foreground">
          Hi,{' '}
          <Avatar className="size-5 mx-1 text-xs rounded-full bg-primary text-primary-foreground">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {String.getInitials(user!.name)}
            </AvatarFallback>
            <AvatarImage src={user!.image as string} />
          </Avatar>{' '}
          <span className="text-foreground">{user.name}</span>, welcome to your{' '}
          <span className="mr-1 text-foreground">@{organization?.slug}</span>{' '}
          workspace
        </h1>
      </header>
    </section>
  )
}
