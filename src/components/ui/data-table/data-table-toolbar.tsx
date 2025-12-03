'use client'

import React from 'react'
import { cn } from '@/utils/cn'
import {
  CheckIcon,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Download,
  Filter,
  Trash2Icon,
  FileIcon,
} from 'lucide-react'
import { Button, type ButtonProps } from '../button'
import { Input } from '../input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import { useDataTable } from './data-table-provider'
import { Badge } from '../badge'

/* ------------------------------------------------------------------
 * 1) DataTableToolbar
 * ------------------------------------------------------------------ */
interface DataTableToolbarProps {
  className?: string
  children?: React.ReactNode
}

/**
 * Represents the main container for actions (buttons, menus, etc.)
 * of the DataTable.
 */
export const DataTableToolbar = React.memo(function DataTableToolbar({
  className,
  children,
}: DataTableToolbarProps) {
  return (
    <div className={cn('flex items-center gap-2 w-full', className)}>
      {children}
    </div>
  )
})

/* ------------------------------------------------------------------
 * 2) DataTableSearch
 * ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DataTableSearchProps<TData> {
  placeholder?: string
  className?: string
}

/**
 * Global search field for the table. Changes the globalFilter state
 * in `react-table`.
 */
export const DataTableSearch = React.memo(function DataTableSearch<TData>({
  placeholder = 'Search...',
  className,
  ...props
}: DataTableSearchProps<TData>) {
  const { table } = useDataTable<TData>()
  const [value, setValue] = React.useState('')

  // Se quiser debouncing, pode usar useCallback + setTimeout,
  // ou usar alguma lib de debounce como lodash. Exemplo simples:
  const handleSearch = React.useCallback(
    (val: string) => {
      setValue(val)
      table.setGlobalFilter(val)
      // Em caso de debounce, usar setTimeout
    },
    [table],
  )

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(event) => handleSearch(event.target.value)}
      className={cn('h-8 w-[150px] lg:w-[250px] px-0', className)}
      {...props}
    />
  )
})

/* ------------------------------------------------------------------
 * 3) DataTableFilterMenu
 * ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DataTableFilterProps<TData> = Omit<ButtonProps, 'onClick' | 'children'>

/**
 * Filter menu that displays possible filtering options
 * and allows clearing filters individually or all at once.
 */
export const DataTableFilterMenu = React.memo(function DataTableFilterMenu<
  TData,
>({
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: DataTableFilterProps<TData>) {
  const { table, filters: filterOptions, activeFilters } = useDataTable<TData>()

  const hasFilters = !!filterOptions?.length
  const hasActiveFilters = activeFilters.length > 0

  /* Helpers */
  const handleGetColumn = React.useCallback(
    (accessorKey: string) => table.getColumn(accessorKey),
    [table],
  )

  const handleClearFilter = React.useCallback(
    (filter: { accessorKey: string }) => {
      const column = handleGetColumn(filter.accessorKey)
      column?.setFilterValue(undefined)
    },
    [handleGetColumn],
  )

  const handleClearAllFilters = React.useCallback(() => {
    if (!filterOptions) return
    filterOptions.forEach((filter) => {
      const column = handleGetColumn(filter.accessorKey)
      column?.setFilterValue(undefined)
    })
  }, [filterOptions, handleGetColumn])

  const handleGetFilterValue = React.useCallback(
    (filter: { accessorKey: string }) => {
      const column = handleGetColumn(filter.accessorKey)
      return column?.getFilterValue() as string
    },
    [handleGetColumn],
  )

  const handleSetFilterValue = React.useCallback(
    (filter: { accessorKey: string }, value: string) => {
      const column = handleGetColumn(filter.accessorKey)
      column?.setFilterValue(value)
    },
    [handleGetColumn],
  )

  if (!hasFilters) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('h-8', className)}
          {...props}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="outline" className="ml-auto capitalize">
              {/* Example: "Status: Active, Type: Internal" */}
              {activeFilters
                .map((filter) => `${filter.label}: ${filter.value}`)
                .join(', ')}
            </Badge>
          )}
          <ChevronDown className="ml-4 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {filterOptions?.map((filter) => {
              if (!filter.options?.length) return null

              const activeValue = handleGetFilterValue(filter)

              return (
                <DropdownMenuSub key={filter.accessorKey}>
                  <DropdownMenuSubTrigger>
                    {filter.icon && <span className="mr-2">{filter.icon}</span>}
                    {filter.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {filter.options.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          className="capitalize"
                          onClick={() =>
                            handleSetFilterValue(filter, option.value)
                          }
                        >
                          {option.label}
                          {activeValue === option.value && (
                            <CheckIcon className="ml-auto h-3 w-3" />
                          )}
                        </DropdownMenuItem>
                      ))}

                      {/* Displays option to clear the current filter, if active */}
                      {activeValue && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleClearFilter(filter)}
                          >
                            Clear filter
                            <Trash2Icon className="ml-2 h-3 w-3" />
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )
            })}

            {/* If any filter is active, displays option to clear all */}
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearAllFilters}>
                  Clear all filters
                  <Trash2Icon className="ml-auto h-3 w-3" />
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
})

/* ------------------------------------------------------------------
 * 4) DataTableExportMenu
 * ------------------------------------------------------------------ */
/**
 * Export menu. Calls `handleExport({ format })` from useDataTable.
 * Here we have CSV ready and Excel/PDF as "Coming soon".
 */
export const DataTableExportMenu = React.memo(function DataTableExportMenu() {
  const { handleExport } = useDataTable()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-[260px]">
          <DropdownMenuLabel>Export As</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleExport({ format: 'csv' })}>
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </DropdownMenuItem>

            <DropdownMenuItem disabled>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
              <Badge variant="outline" className="ml-auto">
                Coming soon
              </Badge>
            </DropdownMenuItem>

            <DropdownMenuItem disabled>
              <FileIcon className="mr-2 h-4 w-4" />
              PDF
              <Badge variant="outline" className="ml-auto">
                Coming soon
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
})
