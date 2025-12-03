'use client'

import * as React from 'react'

import { Annotated } from '@/components/ui/annotated'
import { ArrowRightIcon, LockKeyholeIcon, PhoneIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserTwoFactorSettingsForm() {
  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <LockKeyholeIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Two-factor authentication</Annotated.Title>
        <Annotated.Description>
          Add an extra layer of security to your login.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <div className="merge-form-section">
            <div className="flex space-x-4 items-center justify-between py-4 text-sm">
              <PhoneIcon className="size-4" />
              <div className="flex-1">
                <h3>Authenticator app</h3>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">Not activated</span>
                <Button size="sm" variant="outline">
                  Enable
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
