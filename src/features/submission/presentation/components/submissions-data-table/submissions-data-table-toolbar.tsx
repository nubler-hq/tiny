'use client'

import { Share2 } from 'lucide-react'
import {
  DataTableToolbar,
  DataTableSearch,
  DataTableFilterMenu,
  DataTableExportMenu,
} from '@/components/ui/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { ShareFormDialog } from '../share-form-dialog'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'
import { useEffect, useState } from 'react'

export function SubmissionsDataTableToolbar() {
  const [formUrl, setFormUrl] = useState<string>('')

  const auth = useAuth()

  useEffect(() => {
    if (auth.session?.organization && window) {
      setFormUrl(
        `${window.location.origin}/forms/${auth.session.organization.slug}`,
      )
    }
  }, [auth.session?.organization])

  return (
    <DataTableToolbar className="flex items-center justify-between">
      <DataTableSearch placeholder="Search submissions by name or email" />

      <div className="flex items-center gap-2">
        <ShareFormDialog formUrl={formUrl}>
          <Button variant="link" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Form
          </Button>
        </ShareFormDialog>
        <DataTableFilterMenu />
        <DataTableExportMenu />
      </div>
    </DataTableToolbar>
  )
}
