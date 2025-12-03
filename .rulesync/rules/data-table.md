---
description: "Data Table Component Usage Guide"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "Authentication and Authorization System"
---
# Data Table Component Usage Guide

This document provides comprehensive instructions for implementing data tables in the SaaS Boilerplate, focusing on the reusable data-table component and its integration with feature-specific implementations.

## 1. Data Table Architecture

The data table implementation follows a modular architecture with separation of concerns:

### 1.1 Core Components (in `/components/ui/data-table/`)

- **data-table.tsx**: The main table component that renders the actual table with rows and columns
- **data-table-provider.tsx**: Context provider for table state management and configuration
- **data-table-toolbar.tsx**: Header toolbar with search, filters, and export options
- **data-table-pagination.tsx**: Pagination controls for table navigation

### 1.2 Feature-Specific Components

For each feature requiring a data table, create the following files:

```
features/[feature]/presentation/components/
├── [feature]-data-table.tsx           # Main wrapper component
├── [feature]-data-table-provider.tsx  # Feature-specific provider with column definitions
├── [feature]-data-table-toolbar.tsx   # Feature-specific toolbar
├── [feature]-data-table-empty.tsx     # Empty state component
└── [feature]-upsert-sheet.tsx         # Create/Edit modal/sheet
```

## 2. Implementation Steps

### 2.1 Create the Data Table Provider

Start by creating the feature-specific data table provider:

```tsx
// features/[feature]/presentation/components/[feature]-data-table-provider.tsx
'use client'

import React from 'react'
import { ColumnDef, type Row } from '@tanstack/react-table'
import { DataTableProvider } from '@/components/ui/data-table/data-table-provider'
import type { YourEntityType } from '../../[feature].interface'

// Define the columns for your entity
const columns: ColumnDef<YourEntityType>[] = [
  // Define your columns here with accessors, headers, and cell renderers
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  // Additional columns...
]

interface YourFeatureDataTableProviderProps {
  initialData: YourEntityType[]
  children: React.ReactNode
}

export function YourFeatureDataTableProvider({
  initialData,
  children,
}: YourFeatureDataTableProviderProps) {
  // Optional row click handler for navigation
  const handleRowClick = (row: Row<YourEntityType>) => {
    window.location.href = `/app/your-feature/${row.original.id}`
  }

  return (
    <DataTableProvider<YourEntityType>
      columns={columns}
      data={initialData}
      onRowClick={handleRowClick} // Optional
    >
      {children}
    </DataTableProvider>
  )
}
```

### 2.2 Create the Empty State Component

```tsx
// features/[feature]/presentation/components/[feature]-data-table-empty.tsx
import { AnimatedEmptyState } from '@/components/ui/animated-empty-state'
import { PlusIcon, IconForYourFeature } from 'lucide-react'
import { YourFeatureUpsertSheet } from './your-feature-upsert-sheet'

export function YourFeatureDataTableEmpty() {
  return (
    <AnimatedEmptyState className="border-none h-full grow">
      <AnimatedEmptyState.Carousel>
        <IconForYourFeature className="size-6" />
        <span className="bg-secondary h-3 w-[16rem] rounded-full"></span>
      </AnimatedEmptyState.Carousel>

      <AnimatedEmptyState.Content>
        <AnimatedEmptyState.Title>No items found</AnimatedEmptyState.Title>
        <AnimatedEmptyState.Description>
          You haven't added any items yet. Get started by adding your first one.
        </AnimatedEmptyState.Description>
      </AnimatedEmptyState.Content>

      <AnimatedEmptyState.Actions>
        <YourFeatureUpsertSheet
          triggerButton={
            <AnimatedEmptyState.Action variant="default" className="gap-2">
              <PlusIcon className="size-4" />
              Add your first item
            </AnimatedEmptyState.Action>
          }
        />
        <AnimatedEmptyState.Action variant="outline" asChild>
          <a href="/help/getting-started/">Learn more</a>
        </AnimatedEmptyState.Action>
      </AnimatedEmptyState.Actions>
    </AnimatedEmptyState>
  )
}
```

### 2.3 Create the Main Data Table Component

```tsx
// features/[feature]/presentation/components/[feature]-data-table.tsx
'use client'

import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import { useDataTable } from '@/components/ui/data-table'
import { YourFeatureDataTableEmpty } from './your-feature-data-table-empty'

export function YourFeatureDataTable() {
  const { data } = useDataTable()

  if (!data.length) return <YourFeatureDataTableEmpty />

  return (
    <>
      <DataTable />
      <DataTablePagination />
    </>
  )
}
```

### 2.4 Create the Toolbar Component

```tsx
// features/[feature]/presentation/components/[feature]-data-table-toolbar.tsx
'use client'

import {
  DataTableToolbar,
  DataTableSearch,
  DataTableFilterMenu,
  DataTableExportMenu,
} from '@/components/ui/data-table/data-table-toolbar'

export function YourFeatureDataTableToolbar() {
  return (
    <DataTableToolbar className="flex items-center justify-between">
      <DataTableSearch placeholder="Search items..." />

      <div className="flex items-center gap-2">
        <DataTableFilterMenu />
        <DataTableExportMenu />
      </div>
    </DataTableToolbar>
  )
}
```

### 2.5 Create the Upsert Sheet/Modal

```tsx
// features/[feature]/presentation/components/[feature]-upsert-sheet.tsx
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useDisclosure } from '@/@saas-boilerplate/hooks/use-disclosure'
import { api } from '@/igniter.client'
import { useRouter } from 'next/navigation'
import { useFormWithZod } from '@/@saas-boilerplate/hooks/use-form-with-zod'
import type { YourEntityType } from '../../[feature].interface'

// Define your form schema
const formSchema = z.object({
  // Your fields here
  name: z.string().min(1, 'Name is required'),
  // Additional fields...
})

interface YourFeatureUpsertSheetProps {
  item?: YourEntityType
  triggerButton?: React.ReactNode
  onSuccess?: () => void
}

export function YourFeatureUpsertSheet({
  item,
  triggerButton,
  onSuccess,
}: YourFeatureUpsertSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { refresh } = useRouter()
  const isEditMode = !!item

  const form = useFormWithZod({
    schema: formSchema,
    defaultValues: {
      name: item?.name || '',
      // Additional fields...
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true)

        if (isEditMode) {
          // Update existing item
          const response = await api.yourFeature.update.mutate({
            body: values,
            params: { id: item.id },
          })

          if (response.error) {
            toast.error('Failed to update item')
            return
          }

          toast.success('Item updated successfully')
        } else {
          // Create new item
          const response = await api.yourFeature.create.mutate({
            body: values,
          })

          if (response.error) {
            toast.error('Failed to create item')
            return
          }

          toast.success('Item created successfully')
        }

        form.reset()
        onClose()
        refresh()
        
        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        console.error(error)
        toast.error('An error occurred')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button variant="link" size="sm" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add item
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Item' : 'Add New Item'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.onSubmit} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Additional form fields */}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
```

## 3. Page Implementation

Finally, implement the page that uses all these components:

```tsx
// app/(private)/app/(organization)/(dashboard)/your-feature/page.tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  PageBody,
  PageHeader,
  PageMainBar,
  PageSecondaryHeader,
  PageWrapper,
} from '@/components/ui/page'
import { YourFeatureDataTable } from '@/features/your-feature/presentation/components/your-feature-data-table'
import { YourFeatureDataTableProvider } from '@/features/your-feature/presentation/components/your-feature-data-table-provider'
import { YourFeatureDataTableToolbar } from '@/features/your-feature/presentation/components/your-feature-data-table-toolbar'
import { YourFeatureUpsertSheet } from '@/features/your-feature/presentation/components/your-feature-upsert-sheet'
import { api } from '@/igniter.client'

export const metadata = {
  title: 'Your Feature',
}

export default async function YourFeaturePage() {
  // Fetch the data server-side
  const items = await api.yourFeature.findMany.query()

  return (
    <YourFeatureDataTableProvider initialData={items.data ?? []}>
      <PageWrapper>
        <PageHeader className="border-0">
          <PageMainBar>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/app">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Your Feature</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </PageMainBar>
        </PageHeader>

        <PageSecondaryHeader className="bg-secondary/50">
          <YourFeatureDataTableToolbar />
          <YourFeatureUpsertSheet />
        </PageSecondaryHeader>

        <PageBody className="md:p-0 flex flex-col">
          <YourFeatureDataTable />
        </PageBody>
      </PageWrapper>
    </YourFeatureDataTableProvider>
  )
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'
```

## 4. Page Component Usage Guide

The SaaS Boilerplate includes a consistent page layout system using the `Page` components from `@/components/ui/page`. These components provide a uniform structure and animations for dashboard pages.

### 4.1 Page Component Structure

```
<PageWrapper>
  <PageHeader>
    <PageMainBar>
      {/* Breadcrumbs and page title */}
    </PageMainBar>
    {/* Optional action buttons on right side */}
  </PageHeader>
  
  <PageSecondaryHeader>
    {/* Toolbar, filters, primary actions */}
  </PageSecondaryHeader>
  
  <PageBody>
    {/* Main content */}
  </PageBody>
  
  {/* Optional */}
  <PageActions>
    {/* Bottom actions like save/cancel buttons */}
  </PageActions>
</PageWrapper>
```

### 4.2 Page Component Best Practices

1. **PageWrapper**:
   - Always the outermost container
   - Provides animations and consistent styling
   - Should contain the entire page content

2. **PageHeader**:
   - Contains breadcrumbs and page title in `<PageMainBar>`
   - Can include primary actions on right side
   - Typically has `className="border-0"` to control border styling

3. **PageSecondaryHeader**:
   - Use for toolbars, filters, and primary actions
   - Often uses `className="bg-secondary/50"` for subtle background
   - Good location for "Create/Add" buttons

4. **PageBody**:
   - Contains the main content of the page
   - When using with data tables, use `className="p-0 flex flex-col"`
   - Applies subtle entrance animations

5. **PageActions**:
   - Optional component for bottom action bar
   - Typically contains "Save", "Cancel", or other form submission buttons
   - Use primarily on form/detail pages, not list pages

### 4.3 Responsive Considerations

- The Page components are designed to be responsive out of the box
- They include proper spacing and layout adjustments for different screen sizes
- For mobile optimization, consider conditionally rendering or collapsing secondary actions

## 5. Common Patterns and Examples

### 5.1 List Page Pattern (with Data Table)

```tsx
<PageWrapper>
  <PageHeader>
    <PageMainBar>
      <Breadcrumb>...</Breadcrumb>
    </PageMainBar>
  </PageHeader>
  
  <PageSecondaryHeader>
    <FeatureDataTableToolbar />
    <FeatureUpsertSheet />
  </PageSecondaryHeader>
  
  <PageBody className="md:p-0 flex flex-col">
    <FeatureDataTable />
  </PageBody>
</PageWrapper>
```

### 5.2 Detail/Form Page Pattern

```tsx
<PageWrapper>
  <PageHeader>
    <PageMainBar>
      <Breadcrumb>...</Breadcrumb>
    </PageMainBar>
    <Button variant="outline" asChild>
      <Link href="/app/feature">Back to List</Link>
    </Button>
  </PageHeader>
  
  <PageBody>
    <Form>
      {/* Form fields */}
    </Form>
  </PageBody>
  
  <PageActions>
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </PageActions>
</PageWrapper>
```

### 5.3 Dashboard/Overview Page Pattern

```tsx
<PageWrapper>
  <PageHeader>
    <PageMainBar>
      <h1 className="text-xl font-semibold">Dashboard</h1>
    </PageMainBar>
    <DateRangePicker />
  </PageHeader>
  
  <PageBody>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Dashboard cards and widgets */}
    </div>
  </PageBody>
</PageWrapper>
```

## 6. Advanced Features

### 6.1 Row Actions

To add actions to table rows, define an actions column in your provider:

```tsx
{
  id: 'actions',
  header: () => <div className="text-right">Actions</div>,
  cell: ({ row }) => (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="icon" onClick={(e) => { 
        e.stopPropagation();
        // Your action
      }}>
        <EditIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={(e) => {
        e.stopPropagation();
        // Your action
      }}>
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### 6.2 Custom Filters

You can extend the DataTableFilterMenu to add custom filters:

```tsx
<DataTableFilterMenu>
  <DataTableFilterMenuItem
    title="Status"
    options={[
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ]}
    field="status"
  />
  {/* More filters */}
</DataTableFilterMenu>
```

### 6.3 Custom Sorting

Add custom sorting to your columns:

```tsx
{
  accessorKey: 'name',
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="px-0"
    >
      Name
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  // Rest of column definition
}
```

## 7. Best Practices

1. **Performance**:
   - Implement server-side pagination for large datasets
   - Use `useCallback` for event handlers
   - Memoize expensive computations with `useMemo`

2. **Accessibility**:
   - Ensure proper keyboard navigation
   - Use appropriate ARIA attributes
   - Maintain sufficient color contrast

3. **Error Handling**:
   - Display user-friendly error messages
   - Implement fallback UI for error states
   - Log errors properly for debugging

4. **Reusability**:
   - Extract common patterns into reusable components
   - Keep feature-specific logic in feature-specific files
   - Follow the established naming conventions

5. **Testing**:
   - Write tests for critical component behavior
   - Test edge cases like empty states and error conditions
   - Ensure responsive behavior works across devices 
