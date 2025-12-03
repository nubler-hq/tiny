'use client'

import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '../button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select'
import { useDataTable } from './data-table-provider'
import { cn } from '@/utils/cn'

interface DataTablePaginationProps {
  className?: string
}

export const DataTablePagination = React.memo(function DataTablePagination<
  TData,
>({ className }: DataTablePaginationProps) {
  const { table } = useDataTable<TData>()

  // Se quiser memorizá-los para prevenir renders, pode usar useCallback:
  const handleSetPageSize = React.useCallback(
    (value: string) => {
      table.setPageSize(Number(value))
    },
    [table],
  )

  const goToFirstPage = React.useCallback(() => {
    table.setPageIndex(0)
  }, [table])

  const goToPreviousPage = React.useCallback(() => {
    table.previousPage()
  }, [table])

  const goToNextPage = React.useCallback(() => {
    table.nextPage()
  }, [table])

  const goToLastPage = React.useCallback(() => {
    table.setPageIndex(table.getPageCount() - 1)
  }, [table])

  const { pageSize, pageIndex } = table.getState().pagination
  const canPreviousPage = table.getCanPreviousPage()
  const canNextPage = table.getCanNextPage()
  const pageCount = table.getPageCount()

  return (
    <div
      className={cn(
        'flex items-center justify-between space-x-2 h-20 border-t border-border px-8 mt-auto sticky bottom-0',
        className,
      )}
    >
      {/* -- Itens por página -- */}
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Items</p>
        <Select value={`${pageSize}`} onValueChange={handleSetPageSize}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* -- Navegação de páginas -- */}
      <div className="space-x-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {pageIndex + 1} of {pageCount}
            </div>
            <div className="flex items-center space-x-2">
              {/* Botão "Primeira página" (desktop) */}
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex hover:bg-muted/50"
                onClick={goToFirstPage}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-3 w-3" />
              </Button>

              {/* Botão "Página anterior" */}
              <Button
                variant="outline"
                className="h-8 w-8 p-0 hover:bg-muted/50"
                onClick={goToPreviousPage}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-3 w-3" />
              </Button>

              {/* Botão "Próxima página" */}
              <Button
                variant="outline"
                className="h-8 w-8 p-0 hover:bg-muted/50"
                onClick={goToNextPage}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-3 w-3" />
              </Button>

              {/* Botão "Última página" (desktop) */}
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex hover:bg-muted/50"
                onClick={goToLastPage}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
