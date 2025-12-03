'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function TypeFormSuccess() {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center space-y-6 py-12"
    >
      <div className="rounded-full bg-primary/10 p-3 text-primary">
        <CheckCircle2 className="h-12 w-12" />
      </div>

      <h2 className="text-3xl font-bold">Thank you!</h2>

      <p className="text-muted-foreground max-w-md">
        Your form has been submitted successfully. We appreciate your time and
        will get back to you soon!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button variant="outline" onClick={() => router.push('/')}>
          Return to Home
        </Button>

        <Button onClick={() => window.location.reload()}>
          Submit another response
        </Button>
      </div>
    </motion.div>
  )
}
