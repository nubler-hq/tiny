'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Annotated } from '@/components/ui/annotated'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  ClockIcon,
  CalendarIcon,
  AlertTriangleIcon,
  CrownIcon,
} from 'lucide-react'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingTrialInfoSection() {
  const auth = useAuth()

  const orgBilling = auth.session.organization?.billing
  if (!orgBilling?.subscription) return null

  const subscription = orgBilling.subscription

  // Verificar se está em período de teste
  const isTrialActive = subscription.status === 'trialing'
  const trialDays = subscription.trialDays || 0

  if (!isTrialActive || trialDays === 0) return null

  // Calcular informações do trial
  const trialStartDate = subscription.createdAt
    ? new Date(subscription.createdAt)
    : new Date()
  const trialEndDate = new Date(trialStartDate)
  trialEndDate.setDate(trialEndDate.getDate() + trialDays)

  const now = new Date()
  const daysRemaining = Math.max(
    0,
    Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  )
  const totalTrialDays = trialDays
  const daysUsed = totalTrialDays - daysRemaining
  const progressPercentage = (daysUsed / totalTrialDays) * 100

  // Determinar o tipo de alerta baseado nos dias restantes
  const getAlertType = () => {
    if (daysRemaining <= 1) return 'critical'
    if (daysRemaining <= 3) return 'warning'
    if (daysRemaining <= 7) return 'info'
    return 'none'
  }

  const alertType = getAlertType()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const getAlertMessage = () => {
    switch (alertType) {
      case 'critical':
        return {
          title: 'Trial period expires today!',
          description:
            'Your trial period expires today. Upgrade now to continue using all features.',
          variant: 'destructive' as const,
        }
      case 'warning':
        return {
          title: `Trial period expires in ${daysRemaining} days`,
          description:
            'Your trial period is coming to an end. Consider upgrading to not lose access.',
          variant: 'default' as const,
        }
      case 'info':
        return {
          title: `${daysRemaining} days remaining in trial period`,
          description:
            'Take advantage to explore all available features before the trial period ends.',
          variant: 'default' as const,
        }
      default:
        return null
    }
  }

  const alertMessage = getAlertMessage()

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <CrownIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Trial Period</Annotated.Title>
        <Annotated.Description>
          You are currently in the free trial period. Take advantage to explore
          all available features!
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <Card>
            <CardContent className="space-y-6 pt-6">
              {/* Progresso do Trial */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Trial period progress</span>
                  <span className="text-muted-foreground">
                    {daysUsed} of {totalTrialDays} days used
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Informações de Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="w-4 h-4" />
                    Trial Start
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(trialStartDate)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ClockIcon className="w-4 h-4" />
                    Trial End
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(trialEndDate)}
                  </p>
                </div>
              </div>

              {/* Alerta baseado nos dias restantes */}
              {alertMessage && (
                <Alert variant={alertMessage.variant}>
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{alertMessage.title}</p>
                      <p className="text-sm">{alertMessage.description}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
