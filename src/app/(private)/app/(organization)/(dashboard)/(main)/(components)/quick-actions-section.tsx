import {
  Settings2Icon,
  PlusSquareIcon,
  Users2Icon,
  BriefcaseBusinessIcon,
} from 'lucide-react'
import { Link } from 'next-view-transitions'

export function QuickActionsSection() {
  return (
    <section className="max-w-[90vw]">
      <main className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/app/leads"
            className="flex flex-col justify-end items-start h-32 w-32 bg-secondary border rounded-md p-4 hover:bg-accent transition-colors duration-300"
          >
            <PlusSquareIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Create lead</span>
          </Link>
          <Link
            href="/app/leads"
            className="flex flex-col justify-end items-start h-32 w-32 bg-secondary border rounded-md p-4 hover:bg-accent transition-colors duration-300"
          >
            <Users2Icon className="w-4 h-4" />
            <span className="text-xs font-medium">Leads</span>
          </Link>
          <Link
            href="/app/settings/organization/information"
            className="flex flex-col justify-end items-start h-32 w-32 bg-secondary border rounded-md p-4 hover:bg-accent transition-colors duration-300"
          >
            <BriefcaseBusinessIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Organization</span>
          </Link>
          <Link
            href="/app/settings/account/profile"
            className="flex flex-col justify-end items-start h-32 w-32 bg-secondary border rounded-md p-4 hover:bg-accent transition-colors duration-300"
          >
            <Settings2Icon className="w-4 h-4" />
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </main>
    </section>
  )
}
