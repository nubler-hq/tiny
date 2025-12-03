'use client'

import * as React from 'react'
import { Logo } from '@/components/ui/logo'
import { OrganizationDashboardSidebarSelector } from '@/@saas-boilerplate/features/organization/presentation/components/organization-dashboard-sidebar-selector'
import { cn } from '@/utils/cn'

interface BillingAlertPageHeaderWithOrgSelectorProps {
  className?: string
}

export function BillingAlertPageHeaderWithOrgSelector({
  className,
}: BillingAlertPageHeaderWithOrgSelectorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Logo on the left */}
      <Logo className="h-8" />

      {/* Organization selector on the right */}
      <div className="shrink-0">
        <OrganizationDashboardSidebarSelector />
      </div>
    </div>
  )
}
