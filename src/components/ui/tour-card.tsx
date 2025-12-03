'use client'

import React from 'react'
import type { CardComponentProps } from 'onborda'
import { useOnborda } from 'onborda'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react'

export const TourCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  // Onborda hooks
  const { closeOnborda } = useOnborda()

  function handleClose() {
    closeOnborda()
    console.log('Closed onborda')
  }

  return (
    <div className="bg-card p-5 border border-border shadow-md min-w-72 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-muted-foreground">
          {currentStep + 1} of {totalSteps}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => closeOnborda()}
          className="h-6 w-6"
        >
          <X size={16} />
        </Button>
      </div>
      <div className="mb-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          {step.icon} {step.title}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

      <div className="flex justify-between mt-4">
        <div>
          {currentStep !== 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => prevStep()}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
          )}
        </div>
        <div>
          {currentStep + 1 !== totalSteps && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => nextStep()}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          )}
          {currentStep + 1 === totalSteps && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleClose}
            >
              Finish!
              <PartyPopper size={16} />
            </Button>
          )}
        </div>
      </div>
      <span className="text-background">{arrow}</span>
    </div>
  )
}
