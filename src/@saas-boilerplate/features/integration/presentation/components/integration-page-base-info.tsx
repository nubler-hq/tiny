import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { IntegrationLogo } from './integration-logo'
import { ArrowLeftIcon, DownloadIcon, Settings2Icon } from 'lucide-react'
import { IntegrationManagerSheet } from './integration-manager-sheet'
import type { Integration } from '../../integration.interface'

export type IntegrationPageBaseInfoProps = {
  integration: Integration
}

export function IntegrationPageBaseInfo({
  integration,
}: IntegrationPageBaseInfoProps) {
  const isInstalled = integration.state?.id !== undefined

  return (
    <div className="flex flex-col items-start">
      <Button variant="link" className="text-muted-foreground w-fit">
        <Link href="/app/integrations">
          <ArrowLeftIcon />
          Back to Apps
        </Link>
      </Button>

      <IntegrationLogo
        className="size-16 my-8"
        src={integration.metadata.logo as string}
        alt={integration.name}
      />

      <div className="flex flex-col mb-4">
        <h2 className="font-bold text-lg">{integration.name}</h2>
        {integration.metadata.description && (
          <p className="text-muted-foreground">
            {integration.metadata.description}
          </p>
        )}
        {integration.metadata.website && (
          <a href={integration.metadata.website} className="text-blue-500">
            {integration.metadata.website}
          </a>
        )}

        <IntegrationManagerSheet integration={integration}>
          <Button
            variant={isInstalled ? 'outline' : 'default'}
            className="mt-8"
          >
            {integration.state?.enabled && (
              <Settings2Icon className="size-4 ml-auto" />
            )}
            {!integration.state?.enabled && (
              <DownloadIcon className="size-4 ml-auto" />
            )}

            {integration.state?.enabled ? 'Configure' : 'Install'}
          </Button>
        </IntegrationManagerSheet>
      </div>
    </div>
  )
}
