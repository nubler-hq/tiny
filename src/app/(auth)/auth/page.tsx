import { AuthForm } from '@/@saas-boilerplate/features/auth/presentation/components/auth-form.component'
import { AppConfig } from '@/config/boilerplate.config.client'
import { api } from '@/igniter.client'

export const metadata = {
  title: `Login | ${AppConfig.name}`,
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export default async function Page(props: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const searchParams = await props.searchParams
  const activeSocialProviders = await api.auth.getActiveSocialProvider.query()
  return (
    <AuthForm
      activeSocialProviders={activeSocialProviders.data || []}
      redirectUrl={searchParams.redirect}
    />
  )
}
