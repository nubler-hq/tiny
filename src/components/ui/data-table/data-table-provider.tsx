/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowSelectionState,
} from '@tanstack/react-table'

/**
 * Helper type para extrair accessorKeys válidas de TData
 * sem precisar do @ts-expect-error.
 */
type ExtractAccessorKey<T> = {
  [K in keyof T]: K extends string ? K : never
}[keyof T] &
  string

/** Definição de filtro */
export type DataTableFilters<TAccessorKey extends string> = {
  accessorKey: TAccessorKey
  label: string
  icon: React.ReactNode
  options?: {
    label: string
    value: string
  }[]
}

interface DataTableState<TData> {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: Record<string, boolean>
  data: TData[]
  filters?: DataTableFilters<ExtractAccessorKey<TData>>[]
  exportData?: () => void
}

interface DataTableContextValue<TData> extends DataTableState<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  handleExport: ({ format }: { format: 'csv' | 'excel' | 'pdf' }) => void
  activeFilters: { id: string; label: string; value: string }[]

  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>

  onRowClick?: (row: Row<TData>) => void
  onRowHover?: (row: Row<TData>) => void
  onRowSelect?: (row: Row<TData>) => void
  onRowUnselect?: (row: Row<TData>) => void
}

interface DataTableProviderProps<TData> {
  children: React.ReactNode
  columns: ColumnDef<TData, any>[]
  filters?: DataTableFilters<ExtractAccessorKey<TData>>[]
  data: TData[]
  hasExportOption?: boolean
  onExport?: (params: { format: 'csv' | 'excel' | 'pdf'; file: File }) => void
  onRowClick?: (row: Row<TData>) => void
  onRowHover?: (row: Row<TData>) => void
  onRowSelect?: (row: Row<TData>) => void
  onRowUnselect?: (row: Row<TData>) => void
}

// Context
const DataTableContext = React.createContext<
  DataTableContextValue<any> | undefined
>(undefined)

// Provider
export function DataTableProvider<TData>({
  children,
  columns,
  data,
  filters = [],
  hasExportOption = true,
  onExport,
  onRowClick,
  onRowHover,
  onRowSelect,
  onRowUnselect,
}: DataTableProviderProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  /**
   * 1) Geração das opções de filtro via useMemo
   *    Evita recomputar se `data` ou `filters` não mudarem
   */
  const filtersWithOptions = React.useMemo(() => {
    return filters.map((filter) => {
      const uniqueValues = new Set<string>()

      data.forEach((row) => {
        const value = row[filter.accessorKey as keyof TData]
        if (value !== undefined && value !== null) {
          uniqueValues.add(value.toString())
        }
      })

      const options = Array.from(uniqueValues).map((value) => ({
        label: value,
        value,
      }))

      return {
        ...filter,
        options,
      }
    })
  }, [data, filters])

  /**
   * 2) Função de export, usando useCallback para evitar recriação a cada render.
   *    Se for usada apenas internamente, e não repassada via props, poderia ser
   *    um simples function. Mas useCallback aqui é seguro.
   */
  const handleExport = React.useCallback(
    ({ format }: { format: 'csv' | 'excel' | 'pdf' }) => {
      if (!hasExportOption) return

      // Monta CSV
      const csvContent = [
        // Headers
        columns.map((col) => {
          // Se o header for uma função (ReactElement), converter para string ou algo custom
          if (typeof col.header === 'function') {
            return '[Function Header]' // ou alguma lógica pra extrair o texto
          }
          return col.header?.toString() || ''
        }),
        // Linhas de dados
        ...data.map((row) =>
          columns.map((col) => {
            // Tenta acessar accessorKey
            // Note: Se col.accessorKey for string, funciona direto:
            const accessor = (col as any).accessorKey
            if (!accessor) return ''
            const value = row[accessor as keyof TData]
            return value?.toString() || ''
          }),
        ),
      ]
        .map((row) => row.join(','))
        .join('\n')

      // Cria Blob para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `export.${format}`
      link.click()

      URL.revokeObjectURL(link.href)

      // Converte blob em File
      const file = new File([blob], `export.${format}`, {
        type: 'text/csv;charset=utf-8;',
      })

      onExport?.({ format, file })
    },
    [columns, data, hasExportOption, onExport],
  )

  /**
   * 3) useReactTable: passe as callbacks onSortingChange, onRowSelectionChange,
   *    onColumnFiltersChange etc., se quiser que a tabela atualize o estado automaticamente.
   */
  const table = useReactTable<TData>({
    data,
    columns,
    // Funções de rowModel
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Callbacks
    onSortingChange: setSorting, // se quiser permitir que a tabela gerencie sorting
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection, // se quiser permitir que a tabela gerencie row selection
    // Estados controlados
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Monta o objeto de activeFilters
  const activeFilters = columnFilters.map((filter) => {
    const filterOption = filtersWithOptions.find(
      (f) => f.accessorKey === filter.id,
    )

    return {
      id: filter.id,
      label: filterOption?.label || filter.id,
      value: filter.value as string,
    }
  })

  // Context Value
  const contextValue: DataTableContextValue<TData> = {
    table,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    data,
    filters: filtersWithOptions,
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection,
    onRowClick,
    onRowHover,
    onRowSelect,
    onRowUnselect,
    handleExport,
    activeFilters,
  }

  return (
    <DataTableContext.Provider value={contextValue}>
      {children}
    </DataTableContext.Provider>
  )
}

// Custom Hook
export function useDataTable<TData>() {
  const context = React.useContext(DataTableContext)
  if (!context) {
    throw new Error('useDataTable must be used within a DataTableProvider')
  }
  return context as DataTableContextValue<TData>
}
