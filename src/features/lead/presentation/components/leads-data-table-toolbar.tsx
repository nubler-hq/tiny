'use client'

import {
  DataTableToolbar,
  DataTableSearch,
  DataTableFilterMenu,
  DataTableExportMenu,
} from '@/components/ui/data-table/data-table-toolbar'

export function LeadDataTableToolbar() {
  return (
    <DataTableToolbar className="flex items-center justify-between">
      <DataTableSearch placeholder="Search leads by name or e-mail" />

      <div className="flex items-center gap-2">
        <DataTableFilterMenu />
        <DataTableExportMenu />
      </div>
    </DataTableToolbar>
  )
}
