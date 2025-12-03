import { TypeFormWrapper } from '@/features/submission/presentation/components/type-form/type-form-wrapper'
import { api } from '@/igniter.client'

interface FormsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function FormsPage({ params }: FormsPageProps) {
  const { slug } = await params

  const organization = await api.organization.getBySlug.query({
    params: { slug },
  })

  if (!organization.data) {
    return <div>Organization not found</div>
  }

  const formTitle = organization.data.name || 'Default Form Title'

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full max-w-3xl mx-auto">
        <TypeFormWrapper formTitle={formTitle} />
      </div>
    </main>
  )
}
