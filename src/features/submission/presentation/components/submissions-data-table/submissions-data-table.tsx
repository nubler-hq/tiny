'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { useDataTable } from '@/components/ui/data-table'
import { SubmissionsDataTableEmpty } from './submissions-data-table-empty'

export function SubmissionsDataTable() {
  const { data } = useDataTable()

  if (!data.length) return <SubmissionsDataTableEmpty />

  return (
    <>
      <DataTable />
      <DataTablePagination />
    </>
  )
}
