'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { useDataTable } from '@/components/ui/data-table'
import { LeadDataTableEmpty } from './leads-data-table-empty'

export function LeadDataTable() {
  const { data } = useDataTable()

  if (!data.length) return <LeadDataTableEmpty />

  return (
    <>
      <DataTable />
      <DataTablePagination />
    </>
  )
}
