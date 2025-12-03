import type { Integration } from '../../integration.interface'
import { IntegrationCard } from './integration-card'

export interface IntegrationSectionProps {
  integrations: Integration[]
  defaultCategory?: string
}

export function IntegrationFeed({
  integrations,
  defaultCategory = 'Others',
}: IntegrationSectionProps) {
  const DEFAULT_CATEGORY = defaultCategory

  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      const category = integration.metadata.category || DEFAULT_CATEGORY

      if (!acc[category]) {
        acc[category] = []
      }

      acc[category].push(integration)
      return acc
    },
    {} as Record<string, Integration[]>,
  )

  // Convert the object to array of [category, integrations] pairs and sort by category
  const sortedCategories = Object.entries(groupedIntegrations).sort(
    ([a], [b]) => {
      if (a === DEFAULT_CATEGORY) return 1
      if (b === DEFAULT_CATEGORY) return -1
      return a.localeCompare(b)
    },
  )

  return (
    <div className="space-y-8">
      {sortedCategories.map(([category, categoryIntegrations]) => (
        <section className="space-y-4" key={category}>
          <header className="flex flex-col">
            <h2 className="text-sm font-bold tracking-tight capitalize">
              {category}
            </h2>
            <p className="text-sm text-muted-foreground">
              {categoryIntegrations.length} integrations
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {categoryIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.slug}
                integration={integration}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
