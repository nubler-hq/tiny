---
description: "How to create new pages on Dashboard"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "How to create new pages on Dashboard"
---
# Page Component System Guide

The SaaS Boilerplate includes a consistent page layout system using the `Page` components from `@/components/ui/page`. This document provides detailed guidance on how to create dashboard pages with a uniform structure and animations.

## 1. Page Component Overview

The Page component system consists of several composable components:

- **PageWrapper**: The main container for all dashboard pages
- **PageHeader**: The top section with breadcrumbs and primary actions
- **PageMainBar**: Container for breadcrumbs/title within PageHeader
- **PageActionsBar**: Container for actions within PageHeader
- **PageSecondaryHeader**: Secondary header for toolbars and filters
- **PageBody**: Main content area of the page
- **PageActions**: Bottom action bar for form submission buttons

## 2. Basic Page Structure

```tsx
<PageWrapper>
  <PageHeader>
    <PageMainBar>
      {/* Breadcrumbs and page title */}
    </PageMainBar>
    <PageActionsBar>
      {/* Primary actions */}
    </PageActionsBar>
  </PageHeader>
  
  <PageSecondaryHeader>
    {/* Toolbar, filters, etc. */}
  </PageSecondaryHeader>
  
  <PageBody>
    {/* Main content */}
  </PageBody>
  
  <PageActions>
    {/* Bottom actions (optional) */}
  </PageActions>
</PageWrapper>
```

## 3. Component Details and Usage

### 3.1 PageWrapper

This is the outermost container for all dashboard pages. It provides consistent styling, animation, and structure.

```tsx
<PageWrapper>
  {/* Page content */}
</PageWrapper>
```

**Key Properties:**
- Provides entrance animation for the entire page
- Applies consistent background, borders, and shadows
- Creates a responsive container that works well on all devices
- Includes proper min-height calculations based on layout

**Best Practices:**
- Always use as the outermost container for dashboard pages
- Avoid adding custom padding or margin to this component
- Let it handle the overall page animations and styling

### 3.2 PageHeader

The top section of the page, typically containing breadcrumbs, the page title, and primary actions.

```tsx
<PageHeader className="border-0">
  <PageMainBar>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/app">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Feature Name</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </PageMainBar>
  
  <Button variant="outline">Primary Action</Button>
</PageHeader>
```

**Key Properties:**
- Fixed height with proper alignment of children
- Sticky positioning to stay at the top during scroll
- Subtle animation that's different from the body content
- Border styling for visual separation

**Best Practices:**
- Use `className="border-0"` to control border styling
- Include breadcrumbs for navigation context
- Right-align action buttons
- Keep simple and focused - only essential actions here

### 3.3 PageMainBar and PageActionsBar

These components organize content within the PageHeader:

- **PageMainBar**: Left-aligned content (typically breadcrumbs/title)
- **PageActionsBar**: Right-aligned content (typically action buttons)

```tsx
<PageHeader>
  <PageMainBar>
    <h1 className="text-xl font-semibold">Page Title</h1>
  </PageMainBar>
  
  <PageActionsBar>
    <Button variant="outline">Secondary Action</Button>
    <Button>Primary Action</Button>
  </PageActionsBar>
</PageHeader>
```

**Best Practices:**
- Use PageMainBar for consistent left alignment
- Use PageActionsBar to group action buttons with proper spacing
- Limit the number of actions in PageActionsBar to avoid clutter
- Consider responsive behavior for mobile screens

### 3.4 PageSecondaryHeader

Used for toolbars, filters, search inputs, and secondary actions.

```tsx
<PageSecondaryHeader className="bg-secondary/50">
  <div className="flex items-center justify-between w-full">
    <Input 
      placeholder="Search..." 
      className="max-w-xs"
    />
    
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* Filter options */}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button size="sm">
        <PlusIcon className="mr-2 h-4 w-4" />
        Add New
      </Button>
    </div>
  </div>
</PageSecondaryHeader>
```

**Key Properties:**
- Optional component - use only when needed
- Provides consistent spacing and styling for toolbar elements
- Supports customizable background via className
- Designed for proper spacing of form controls and buttons

**Best Practices:**
- Use `className="bg-secondary/50"` for subtle background distinction
- Place search inputs on the left
- Place action buttons on the right
- Great place for filters, sorting controls, and view options
- For data tables, use with the specific table toolbar component

### 3.5 PageBody

The main content area of the page. This is where the primary content lives.

```tsx
<PageBody>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Cards or other content */}
  </div>
</PageBody>
```

**Key Usage with Data Tables:**

```tsx
<PageBody className="md:p-0 flex flex-col">
  <DataTable />
</PageBody>
```

**Key Properties:**
- Flexible container that expands to fill available space
- Default padding that can be customized
- Entrance animation that's different from the header
- Supports any content including forms, tables, cards, etc.

**Best Practices:**
- Use `className="p-0 flex flex-col"` when containing data tables
- Default padding works well for forms and general content
- Avoid fixed heights - let the content determine the height
- For forms, consider using a Card component for visual grouping

### 3.6 PageActions

Bottom action bar for form submission buttons or other page-level actions.

```tsx
<PageActions>
  <Button variant="outline" type="button">Cancel</Button>
  <Button type="submit">Save Changes</Button>
</PageActions>
```

**Key Properties:**
- Fixed height with proper alignment and spacing
- Sticky positioning at the bottom during scroll
- Visual separation with border
- Right-aligned buttons by default

**Best Practices:**
- Use primarily on form/detail pages, not list pages
- Place "Cancel" or secondary actions first
- Place "Submit" or primary actions last
- Limit to 2-3 buttons maximum
- Consider mobile layout - buttons stack on small screens

## 4. Common Page Patterns

### 4.1 List Page (with Data Table)

```tsx
export default async function ListPage() {
  const items = await api.feature.findMany.query()

  return (
    <FeatureDataTableProvider initialData={items.data ?? []}>
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
                  <BreadcrumbPage>Features</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </PageMainBar>
        </PageHeader>

        <PageSecondaryHeader className="bg-secondary/50">
          <FeatureDataTableToolbar />
          <FeatureUpsertSheet />
        </PageSecondaryHeader>

        <PageBody className="md:p-0 flex flex-col">
          <FeatureDataTable />
        </PageBody>
      </PageWrapper>
    </FeatureDataTableProvider>
  )
}
```

### 4.2 Detail/Form Page

```tsx
export default function DetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const isEditMode = id !== 'new'
  
  // Fetch data if editing
  const itemData = isEditMode ? await api.feature.findById.query({ id }) : null
  
  return (
    <PageWrapper>
      <PageHeader>
        <PageMainBar>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/app">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/app/features">Features</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {isEditMode ? 'Edit Feature' : 'New Feature'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </PageMainBar>
        
        <Button variant="outline" asChild>
          <Link href="/app/features">Back to List</Link>
        </Button>
      </PageHeader>
      
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Feature' : 'Create Feature'}</CardTitle>
            <CardDescription>
              Enter the details for this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form>
              {/* Form fields */}
            </Form>
          </CardContent>
        </Card>
      </PageBody>
      
      <PageActions>
        <Button variant="outline" asChild>
          <Link href="/app/features">Cancel</Link>
        </Button>
        <Button type="submit" form="feature-form">
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </PageActions>
    </PageWrapper>
  )
}
```

### 4.3 Dashboard/Overview Page

```tsx
export default function DashboardPage() {
  return (
    <PageWrapper>
      <PageHeader>
        <PageMainBar>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </PageMainBar>
        <DateRangePicker />
      </PageHeader>
      
      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">
                +12.3% from last month
              </p>
            </CardContent>
          </Card>
          {/* More metric cards */}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Activity list */}
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chart */}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </PageWrapper>
  )
}
```

## 5. Animation and Motion

The Page components include subtle animations using Framer Motion:

- **PageWrapper**: Fade-in animation for the whole page
- **PageHeader**: Slide-down and fade-in animation
- **PageBody**: Slide-up and fade-in animation with a slight delay
- **PageActions**: Slide-up and fade-in animation with a longer delay

These animations create a pleasing entrance experience without being distracting.

**Motion Configuration:**

```tsx
// Page animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

const bodyVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      delay: 0.2,
    },
  },
}
```

## 6. Responsive Behavior

The Page components are designed to be responsive by default:

- **PageWrapper**: Adjusts height based on viewport
- **PageHeader/PageSecondaryHeader**: Maintains fixed height but adjusts content spacing
- **PageBody**: Expands to fill available space
- **PageActions**: Adjusts button spacing on mobile

**Best Practices for Responsive Pages:**

1. For very complex toolbars, consider using a responsive approach:
   ```tsx
   <PageSecondaryHeader>
     <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
       <div className="flex items-center gap-2">
         {/* Left side controls */}
       </div>
       <div className="flex items-center gap-2">
         {/* Right side controls */}
       </div>
     </div>
   </PageSecondaryHeader>
   ```

2. For multi-column content, use responsive grid classes:
   ```tsx
   <PageBody>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
       {/* Cards */}
     </div>
   </PageBody>
   ```

3. Consider using `useBreakpoint()` hook for conditional rendering:
   ```tsx
   const isMobile = useBreakpoint('md')
   
   return (
     <PageHeader>
       <PageMainBar>
         <Breadcrumb>{!isMobile && /* Full breadcrumb */}</Breadcrumb>
         {isMobile && <h1>Page Title</h1>}
       </PageMainBar>
       
       <Button size={isMobile ? 'sm' : 'default'}>
         {isMobile ? <PlusIcon /> : 'Add New'}
       </Button>
     </PageHeader>
   )
   ```

## 7. Tips and Best Practices

1. **Consistent Navigation**:
   - Always include breadcrumbs in PageHeader for context
   - Use consistent back buttons on detail pages
   - Maintain the same structure across all dashboard pages

2. **Visual Hierarchy**:
   - Use PageHeader for the most important page identification
   - Use PageSecondaryHeader for contextual actions
   - Use PageBody for the main content focus
   - Use PageActions only for important form actions

3. **Animations**:
   - The built-in animations are subtle by design
   - Avoid adding additional entrance animations that conflict
   - For content-specific animations, use separate motion components

4. **Error States**:
   - For error pages, still use the Page components for consistency
   - Handle loading and error states within PageBody
   - Consider using a suspension boundary at the PageBody level

5. **Customization**:
   - Use className prop for styling customization
   - Avoid overriding the core structure and layout
   - For very custom pages, still use PageWrapper for consistency
