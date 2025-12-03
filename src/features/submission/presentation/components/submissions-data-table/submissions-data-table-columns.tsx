import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Submission } from '@/features/submission/submission.interface'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu'
import { Row, ColumnDef } from '@tanstack/react-table'
import { formatRelative } from 'date-fns'
import { MoreVerticalIcon } from 'lucide-react'

export const getSubmissionsTableColumn = ({
  onClick,
}: {
  onClick: (row: Row<Submission>) => void
}): ColumnDef<Submission>[] => [
  {
    accessorKey: 'lead',
    header: 'Lead',
    cell: ({ row }: { row: Row<Submission> }) => {
      const submission = row.original

      return (
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarFallback>
              {submission.lead?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            {submission.lead ? (
              <>
                <span className="font-medium">
                  {submission.lead.name || submission.lead.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {submission.lead.email}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Lead not found</span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }: { row: Row<Submission> }) => {
      const submission = row.original
      return (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {submission.metadata?.source}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'source',
    header: 'Fields',
    cell: ({ row }: { row: Row<Submission> }) => {
      const submission = row.original
      return (
        <div className="flex flex-col w-fit">
          <Badge className="flex items-center space-x-2">
            <span>
              {submission.metadata?.data
                ? Object.keys(submission.metadata.data)?.length
                : 0}
            </span>
            <span>Fields</span>
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Submission Date',
    cell: ({ row }: { row: Row<Submission> }) => {
      return (
        <div className="flex flex-col">
          <span>{formatRelative(row.original.createdAt, new Date())}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleTimeString()}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }: { row: Row<Submission> }) => {
      const submission = row.original
      return (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{submission.id}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: Row<Submission> }) => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreVerticalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onClick(row)
                }}
              >
                View Submission
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open(`/leads/${row.original.leadId}`, '_blank')
                }}
              >
                View Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
