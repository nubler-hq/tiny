import { SiteMainFooter } from '@/components/site/site-main-footer'
import { SiteMainHeader } from '@/components/site/site-main-header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SiteMainHeader />
      <div className="relative">{children}</div>
      <SiteMainFooter />
    </div>
  )
}
