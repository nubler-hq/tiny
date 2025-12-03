'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { SubmissionDetailsProvider } from './lead-details-submissions-provider'
import type { Submission } from '@/features/submission/submission.interface'

interface LeadDetailsSubmissionsProps {
  submissions: Submission[]
}

export function LeadDetailsSubmissions({
  submissions,
}: LeadDetailsSubmissionsProps) {
  return (
    <SubmissionDetailsProvider initialData={submissions}>
      <div className="rounded-lg border bg-card">
        <DataTable />
        <DataTablePagination />
      </div>
    </SubmissionDetailsProvider>
  )
}
