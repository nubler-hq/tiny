'use client'

import {
  SheetHeader,
  SheetFooter,
  SheetClose,
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Clock, Mail, Phone, ExternalLink } from 'lucide-react'
import type { Submission } from '../../../../submission/submission.interface'
import type { Lead } from '../../../../lead/lead.interface'

interface SubmissionDetailsSheetProps {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  submission?: Submission & {
    lead?: Lead
  }
}

export function SubmissionDetailsSheet({
  submission,
  open,
  onOpenChange,
}: SubmissionDetailsSheetProps) {
  if (!submission || !submission.lead) return null

  // Função auxiliar para formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Renderizar os campos dinâmicos do metadata.data
  const renderDynamicFields = () => {
    if (!submission.metadata?.data) return null

    // Obtém as chaves dos campos dinâmicos
    const keys = Object.keys(submission.metadata.data)

    if (keys.length === 0)
      return (
        <p className="text-sm text-muted-foreground">
          No custom fields available
        </p>
      )

    return (
      <div className="grid grid-cols-1 gap-4">
        {keys.map((key) => {
          const value = submission.metadata.data[key]
          const displayValue =
            typeof value === 'object' ? JSON.stringify(value) : String(value)

          return (
            <div key={key} className="space-y-1">
              <Label className="text-sm font-medium">{key}</Label>
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm break-words">{displayValue}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="mb-6">
          {/* Basic submission info */}
          <section>
            <header className="pb-4 px-0">
              <h2 className="flex items-center text-sm mb-2 font-medium">
                #ID: {submission.id}
              </h2>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600/30"
                >
                  {submission.metadata.source}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {formatDate(submission.createdAt)}
                </div>
              </div>
            </header>
            <main className="pb-2 px-0">
              <div className="space-y-4">
                {/* Source identifier */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Form Identifier</Label>
                  <p className="text-sm rounded-md bg-muted p-3">
                    {submission.metadata.source}
                  </p>
                </div>

                {/* Submission ID */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Submission ID</Label>
                  <p className="text-sm font-mono rounded-md bg-muted p-3">
                    {submission.id}
                  </p>
                </div>
              </div>
            </main>
          </section>
        </SheetHeader>

        <div className="merge-form-section">
          {/* Lead information */}
          <section className="mb-6">
            <header className="p-4 border-b">
              <h2 className="flex items-center text-sm font-medium">
                Lead Information
              </h2>
            </header>
            <main className="p-4">
              <div className="flex items-center mb-4">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarFallback>
                    {submission.lead.name
                      ? submission.lead.name.charAt(0).toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {submission.lead.name || 'Unnamed'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {submission.lead.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center">
                    <Mail className="mr-1 h-3 w-3" /> Email
                  </Label>
                  <div className="flex items-center rounded-md bg-muted p-3">
                    <p className="text-sm flex-1 truncate">
                      {submission.lead.email}
                    </p>
                    {submission.lead.email && (
                      <a
                        href={`mailto:${submission.lead.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center">
                    <Phone className="mr-1 h-3 w-3" /> Phone
                  </Label>
                  <div className="flex items-center rounded-md bg-muted p-3">
                    <p className="text-sm flex-1 truncate">
                      {submission.lead.phone || 'Not provided'}
                    </p>
                    {submission.lead.phone && (
                      <a
                        href={`tel:${submission.lead.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Lead ID and link */}
              {submission.leadId && (
                <div className="mt-4 space-y-1">
                  <Label className="text-sm font-medium">Lead ID</Label>
                  <div className="flex items-center rounded-md bg-muted p-3">
                    <p className="text-sm font-mono flex-1 truncate">
                      {submission.leadId}
                    </p>
                    <a
                      href={`/app/leads/${submission.leadId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-muted-foreground hover:text-primary"
                    >
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View Lead
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </main>
          </section>

          {/* Submission data */}
          <section className="mb-6">
            <header className="p-4 border-b pb-4">
              <h2 className="flex items-center text-sm font-medium">
                Submission Data
              </h2>
              <p className="text-sm text-muted-foreground">
                Custom fields submitted with this form
              </p>
            </header>
            <main className="p-4">
              <Tabs defaultValue="fields">
                <TabsList className="mb-4">
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                  <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="space-y-4">
                  {renderDynamicFields()}
                </TabsContent>

                <TabsContent value="raw">
                  <pre className="rounded-md bg-muted p-4 overflow-auto max-h-96 text-xs font-mono">
                    {JSON.stringify(submission.metadata.data, null, 2) || '{}'}
                  </pre>
                </TabsContent>
              </Tabs>
            </main>
          </section>
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="w-full mt-2">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
