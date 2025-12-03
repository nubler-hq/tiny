'use client'

import React from 'react'
import {
  flexRender,
  type Row,
  type Header,
  type HeaderGroup,
  type Cell,
} from '@tanstack/react-table'

import { useDataTable } from './data-table-provider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'
import { cn } from '@/utils/cn'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DataTableProps<TData> {
  className?: string
}

// Componente principal DataTable
export function DataTable<TData>({ className }: DataTableProps<TData>) {
  const { table, onRowClick, onRowHover } = useDataTable<TData>()

  return (
    <div className={cn('h-full', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: Header<TData, unknown>) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: Row<TData>) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onClick={() => onRowClick?.(row)}
                onMouseEnter={() => onRowHover?.(row)}
                className={cn(
                  'transition-colors',
                  onRowClick || onRowHover
                    ? 'cursor-pointer hover:bg-muted/50'
                    : '',
                )}
              >
                {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                Nothing Here! :-)
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
