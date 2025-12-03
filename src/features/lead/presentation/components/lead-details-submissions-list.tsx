'use client'

import type { Submission } from '@/features/submission/submission.interface'
import { SubmissionDetailsProvider } from './lead-details-submissions-provider'
import { SubmissionDetailsTable } from './lead-details-submissions-table'
import { SubmissionDetailsToolbar } from './lead-details-submissions-toolbar'

interface SubmissionDetailsListProps {
  leadId: string
  initialData: Submission[]
}

export function SubmissionDetailsList({
  initialData,
}: SubmissionDetailsListProps) {
  return (
    <SubmissionDetailsProvider initialData={initialData}>
      <header className="px-6 py-2">
        <SubmissionDetailsToolbar />
      </header>
      <main className="flex flex-col flex-1 h-full grow">
        <SubmissionDetailsTable />
      </main>
    </SubmissionDetailsProvider>
  )
}
