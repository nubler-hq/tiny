import { Button } from '@/components/ui/button'
import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'

export function DemoPromoBar() {
  if (!process.env.DEMO_MODE || process.env.DEMO_MODE === 'false') return null

  return (
    <div className="border-b">
      <div className="py-3 pl-8 pr-4 flex items-center justify-between">
        <p className="text-sm">
          This is a preview demo, start building today with{' '}
          <strong>SaaS Boilerplate</strong>.
        </p>
        <Button variant="secondary" className="h-6 rounded-full" asChild>
          <Link href="https://boilerplate.vibedev.com.br">
            <span>Get Started</span>
            <ArrowUpRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
