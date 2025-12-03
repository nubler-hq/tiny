'use client'

import {
  DataTableToolbar,
  DataTableSearch,
  DataTableFilterMenu,
  DataTableExportMenu,
} from '@/components/ui/data-table/data-table-toolbar'

export function SubmissionDetailsToolbar() {
  return (
    <DataTableToolbar className="flex items-center justify-between">
      <DataTableSearch placeholder="Search submissions..." />

      <div className="flex items-center gap-2">
        <DataTableFilterMenu />
        <DataTableExportMenu />
      </div>
    </DataTableToolbar>
  )
}
