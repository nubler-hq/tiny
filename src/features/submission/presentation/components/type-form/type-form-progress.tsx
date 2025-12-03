import { Progress } from '@/components/ui/progress'

interface TypeFormProgressProps {
  currentStep: number
  totalSteps: number
}

export function TypeFormProgress({
  currentStep,
  totalSteps,
}: TypeFormProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <Progress value={progress} className="h-1" />
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>
          {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
