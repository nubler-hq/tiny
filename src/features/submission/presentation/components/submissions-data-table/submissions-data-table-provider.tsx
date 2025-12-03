'use client'

import React, { useState } from 'react'
import { DataTableProvider } from '@/components/ui/data-table/data-table-provider'
import { SubmissionDetailsSheet } from '../submission-details/submission-details-sheet'
import { useDisclosure } from '@/@saas-boilerplate/hooks/use-disclosure'
import { getSubmissionsTableColumn } from './submissions-data-table-columns'

import { type Row } from '@tanstack/react-table'
import { type Submission } from '../../../submission.interface'

interface SubmissionsDataTableProviderProps {
  initialData: Submission[]
  children: React.ReactNode
}

export function SubmissionsDataTableProvider({
  initialData,
  children,
}: SubmissionsDataTableProviderProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission>()
  const { isOpen, onToggle } = useDisclosure()

  const handleRowClick = (row: Row<Submission>) => {
    setSelectedSubmission(row.original)
    onToggle()
  }

  return (
    <DataTableProvider<Submission>
      columns={getSubmissionsTableColumn({ onClick: handleRowClick })}
      data={initialData}
      onRowClick={handleRowClick}
    >
      {children}
      <SubmissionDetailsSheet
        submission={selectedSubmission}
        open={isOpen}
        onOpenChange={onToggle}
      />
    </DataTableProvider>
  )
}
