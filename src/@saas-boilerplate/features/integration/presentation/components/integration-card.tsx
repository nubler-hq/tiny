import { Link } from 'next-view-transitions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRightIcon, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import type { Integration } from '../../integration.interface'

export interface IntegrationCardProps {
  integration: Integration
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <Link
      className={cn([
        'group relative block overflow-hidden',
        'transition-all duration-200 ease-in-out hover:shadow-md',
        integration.metadata.published
          ? 'cursor-pointer'
          : 'pointer-events-none',
      ])}
      href={`/app/integrations/${integration.slug}`}
    >
      <Card
        key={integration.slug}
        className="hover:shadow-md transition-all duration-200 ease-in-out"
      >
        <CardHeader className="space-y-4 pb-2">
          <div className="flex justify-between items-start">
            {integration.metadata.logo && (
              <img
                src={integration.metadata.logo}
                alt={integration.name}
                className="h-8 w-8 rounded-md object-contain mb-4"
              />
            )}

            {!integration.metadata.published && (
              <Badge variant="outline" className="ml-auto rounded-md">
                Em breve
              </Badge>
            )}
          </div>
          <div className="flex flex-row items-center space-x-2 line-clamp-2">
            <CardTitle className="text-base">{integration.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-5 line-clamp-2">
            {integration.metadata.description}
          </p>

          <Button
            size="sm"
            variant="outline"
            className={cn([
              'mt-4 w-full',
              integration.state?.enabled ? 'bg-muted' : 'bg-transparent',
            ])}
          >
            {integration.state?.enabled ? 'Configure' : 'Install'}

            {integration.state?.enabled && (
              <div className="ml-auto flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="rounded-md text-xs! px-1.5"
                >
                  <Check className="mr-1" />
                  Enabled
                </Badge>
              </div>
            )}
            {!integration.state?.enabled && (
              <ArrowRightIcon className="size-4 ml-auto" />
            )}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
