import { OnboardingForm } from '@/@saas-boilerplate/features/organization/presentation/components/organization-onboarding-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started',
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export default async function Page() {
  return <OnboardingForm />
}
