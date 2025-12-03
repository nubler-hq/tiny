'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { ArrowUpRight, Copy, Facebook, Linkedin, Twitter } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ShareFormDialogProps {
  formUrl: string
  children: React.ReactNode
}

export function ShareFormDialog({ formUrl, children }: ShareFormDialogProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl)
    toast.success('Link copied to clipboard!')
  }

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(formUrl)
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    window.open(urls[platform as keyof typeof urls], '_blank')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <Input value={formUrl} readOnly className="font-mono text-sm" />
          <Button size="icon" variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => window.open(formUrl, '_blank')}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
