'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'

export function SubmissionDetailsTable() {
  return (
    <div className="flex flex-col h-full relative">
      <DataTable />
      <DataTablePagination />
    </div>
  )
}
