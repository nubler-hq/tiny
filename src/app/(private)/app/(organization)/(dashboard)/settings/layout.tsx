import { DashboardSettingsSidebar } from '@/components/dashboard/dashboard-settings-sidebar'
import { Suspense, type PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="grid md:grid-cols-[auto_1fr] border-l -my-4">
      <DashboardSettingsSidebar />
      <Suspense>
        <div className="lg:py-4">{children}</div>
      </Suspense>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
