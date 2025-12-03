'use client'
import React, { useState } from 'react'
import { ColumnDef, type Row } from '@tanstack/react-table'
import { ArrowUpDown, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableProvider } from '@/components/ui/data-table/data-table-provider'
import { formatRelative } from 'date-fns'
import type { Submission } from '@/features/submission/submission.interface'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { SubmissionDetailsSheet } from '../../../submission/presentation/components/submission-details/submission-details-sheet'

const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: 'sourceIdentifier',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-left px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Form
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
        <Link className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.metadata.source || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'metadata',
    header: 'Form Data',
    cell: ({ row }) => {
      const metadata = row.original.metadata?.data
      if (!metadata) return 'No data'

      const entries = Object.entries(metadata).slice(0, 3)
      return (
        <div className="flex flex-col gap-1 cursor-pointer hover:text-primary">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{key}:</span>
              <span className="text-muted-foreground truncate max-w-[200px]">
                {String(value)}
              </span>
            </div>
          ))}
          {Object.keys(metadata).length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{Object.keys(metadata).length - 3} more fields
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-left px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Submitted At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col cursor-pointer hover:text-primary">
        <span>
          {formatRelative(new Date(row.original.createdAt), new Date())}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleTimeString()}
        </span>
      </div>
    ),
  },
]

interface SubmissionDetailsProviderProps {
  children: React.ReactNode
  initialData: Submission[]
}

export function SubmissionDetailsProvider({
  children,
  initialData,
}: SubmissionDetailsProviderProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission>()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleRowClick = (row: Row<Submission>) => {
    setSelectedSubmission(row.original)
    setIsDetailsOpen(true)
  }

  return (
    <>
      <DataTableProvider<Submission>
        columns={columns}
        data={initialData}
        onRowClick={handleRowClick}
      >
        {children}
      </DataTableProvider>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedSubmission && (
            <SubmissionDetailsSheet
              open={isDetailsOpen}
              onOpenChange={setIsDetailsOpen}
              submission={selectedSubmission}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
