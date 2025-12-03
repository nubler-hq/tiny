'use client'

import React from 'react'

import { ColumnDef, type Row } from '@tanstack/react-table'
import { ArrowUpDown, Clock10Icon, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableProvider } from '@/components/ui/data-table/data-table-provider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { Lead } from '../../lead.interface'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const lead = row.original

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {lead.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="font-medium">{lead.name || 'N/A'}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Phone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.original.phone || 'N/A',
  },
  {
    accessorKey: 'createdAt',
    header: () => <div className="flex justify-end">Created At</div>,
    cell: ({ row }) => (
      <div className="flex justify-end items-center gap-2">
        <Clock10Icon className="size-4 text-muted-foreground" />
        {new Date(row.original.createdAt).toLocaleString('en-US')}
      </div>
    ),
  },
  {
    accessorKey: 'actions',
    header: () => <div className="flex justify-end pr-4">Actions</div>,
    cell: ({ row }) => {
      const lead = row.original

      // Email handler
      const handleEmailClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (lead.email) {
          window.location.href = `mailto:${lead.email}`
        }
      }

      // Phone handler
      const handlePhoneClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (lead.phone) {
          window.location.href = `tel:${lead.phone}`
        }
      }

      return (
        <TooltipProvider>
          <div className="flex justify-end items-center gap-2 pr-4">
            {lead.email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEmailClick}
                    className="h-8 w-8"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send email to {lead.email}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {lead.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePhoneClick}
                    className="h-8 w-8"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Call {lead.phone}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Button variant="outline" size="sm" asChild>
              <a href={`/app/leads/${lead.id}`}>View details</a>
            </Button>
          </div>
        </TooltipProvider>
      )
    },
  },
]

interface LeadDataTableProviderProps {
  initialData: Lead[]
  children: React.ReactNode
}

export function LeadDataTableProvider({
  initialData,
  children,
}: LeadDataTableProviderProps) {
  const handleRowClick = (row: Row<Lead>) => {
    window.location.href = `/app/leads/${row.original.id}`
  }

  return (
    <DataTableProvider<Lead>
      columns={columns}
      data={initialData}
      onRowClick={handleRowClick}
    >
      {children}
    </DataTableProvider>
  )
}
