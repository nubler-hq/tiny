'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, MoreHorizontal, Phone, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { api } from '@/igniter.client'
import type { Lead } from '../../lead.interface'

interface LeadDetailsPageInfoProps {
  lead: Lead
}

export function LeadDetailsPageInfo({ lead }: LeadDetailsPageInfoProps) {
  const router = useRouter()
  const deleteLead = api.lead.delete.useMutation()

  /**
   * Handles lead deletion with confirmation
   */
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this lead? This action cannot be undone.',
    )

    if (confirmed) {
      try {
        await deleteLead.mutate({ params: { id: lead.id } })
        toast.success('Lead deleted successfully!')
        router.push('/app/leads')
      } catch (error) {
        console.error('Error deleting lead:', error)
        toast.error('Failed to delete lead. Please try again.')
      }
    }
  }

  /**
   * Opens email client to contact the lead
   */
  const handleEmailClick = () => {
    if (lead.email) {
      window.location.href = `mailto:${lead.email}`
    }
  }

  /**
   * Makes a phone call to the lead
   */
  const handlePhoneClick = () => {
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`
    }
  }

  return (
    <section className="space-y-6 border-b p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Avatar className="h-16 w-16 mr-4">
            <AvatarFallback>
              {lead.name
                ? lead.name.charAt(0).toUpperCase()
                : lead.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {lead.name || 'Unnamed Lead'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {lead.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Submissions
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {lead.submissions?.length || 0} submissions
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Phone Number
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {lead.phone || 'Not provided'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Last Activity
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {lead.updatedAt
              ? new Date(lead.updatedAt).toLocaleDateString()
              : 'No activity'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Created At
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {new Date(lead.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {lead.email && (
          <Button variant="default" size="sm" onClick={handleEmailClick}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        )}

        {lead.phone && (
          <Button variant="outline" size="sm" onClick={handlePhoneClick}>
            <Phone className="h-4 w-4 mr-2" />
            Call Lead
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}
