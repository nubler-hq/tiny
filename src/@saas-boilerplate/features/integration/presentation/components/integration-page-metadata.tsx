'use client'

import type { Integration } from '../../integration.interface'
import { CircleIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export type IntegrationMetadataProps = {
  integration: Integration
}

export function IntegrationPageMetadata({
  integration,
}: IntegrationMetadataProps) {
  const isInstalled = integration.state?.id !== undefined
  const isEnabled = integration.state?.enabled || false

  return (
    <div className="flex items-center space-x-6 px-4">
      <div className="flex flex-col text-sm">
        <small>Status</small>
        <strong className="flex items-center space-x-2">
          <CircleIcon
            fill="currentColor"
            fillOpacity={isEnabled ? 0.6 : 0.1}
            className={cn([
              'h-3 w-3',
              isEnabled ? 'text-emerald-400' : 'text-muted-foreground',
            ])}
          />
          <span>
            {isEnabled ? 'Enabled' : isInstalled ? 'Disabled' : 'Not Installed'}
          </span>
        </strong>
      </div>
      <div className="flex flex-col text-sm">
        <small>BUILT BY</small>
        <strong>{integration.metadata.developer}</strong>
      </div>
      <div className="flex flex-col text-sm">
        <small>CATEGORY</small>
        <strong>{integration.metadata.category}</strong>
      </div>
    </div>
  )
}
