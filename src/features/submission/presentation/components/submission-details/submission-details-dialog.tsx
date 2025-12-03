'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Submission } from '../../../submission.interface'
import { formatRelative } from 'date-fns'

interface SubmissionDetailsDialogProps {
  submission: Submission
  children: React.ReactNode
}

export function SubmissionDetailsDialog({
  submission,
  children,
}: SubmissionDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">
                Submission Source
              </h3>
              <p>{submission.metadata.source || 'Not specified'}</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">
                Submitted At
              </h3>
              <p>
                {formatRelative(new Date(submission.createdAt), new Date())}
              </p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">
                Form Data
              </h3>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(submission.metadata.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
