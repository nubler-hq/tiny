'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Annotated } from '@/components/ui/annotated'
import {
  DollarSignIcon,
  CalendarIcon,
  CreditCardIcon,
  TrendingUpIcon,
  InfoIcon,
  ClockIcon,
} from 'lucide-react'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function BillingPriceTransparencySection() {
  const auth = useAuth()

  const orgBilling = auth.session.organization?.billing
  if (!orgBilling?.subscription) return null

  const subscription = orgBilling.subscription
  const plan = subscription.plan
  const price = plan?.price

  if (!plan || !price) return null

  // Formatação de moeda
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100) // Assumindo que o valor está em centavos
  }

  // Formatação de intervalo
  const formatInterval = (interval: string) => {
    const intervals: Record<string, string> = {
      month: 'mensal',
      year: 'anual',
      week: 'semanal',
      day: 'diário',
    }
    return intervals[interval] || interval
  }

  // Calcular próxima cobrança
  const getNextBillingDate = () => {
    if (!subscription.createdAt) return null

    const createdDate = new Date(subscription.createdAt)
    const now = new Date()

    // Calcular próxima data baseada no intervalo
    let nextDate = new Date(createdDate)

    if (price.interval === 'month') {
      let months = 1
      nextDate.setMonth(nextDate.getMonth() + months)
      while (nextDate <= now) {
        months++
        nextDate = new Date(createdDate)
        nextDate.setMonth(nextDate.getMonth() + months)
      }
    } else if (price.interval === 'year') {
      let years = 1
      nextDate.setFullYear(nextDate.getFullYear() + years)
      while (nextDate <= now) {
        years++
        nextDate = new Date(createdDate)
        nextDate.setFullYear(nextDate.getFullYear() + years)
      }
    }

    return nextDate
  }

  // Calcular valor anual (para comparação)
  const getAnnualValue = () => {
    if (price.interval === 'year') return price.amount
    if (price.interval === 'month') return price.amount * 12
    if (price.interval === 'week') return price.amount * 52
    if (price.interval === 'day') return price.amount * 365
    return price.amount
  }

  // Calcular economia anual (se aplicável)
  const getAnnualSavings = () => {
    // Para calcular economia, precisaríamos de dados adicionais sobre preços mensais
    // Por enquanto, retornamos 0 até que essa informação esteja disponível
    return 0
  }

  const nextBillingDate = getNextBillingDate()
  const annualValue = getAnnualValue()
  const annualSavings = getAnnualSavings()

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <DollarSignIcon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Transparência de Preços</Annotated.Title>
        <Annotated.Description>
          Detalhamento completo dos custos e próximas cobranças do seu plano{' '}
          <u>{plan.name}</u>.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Detalhes de Cobrança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preço Principal */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cobrança {formatInterval(price.interval)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(price.amount, price.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    por {formatInterval(price.interval)}
                  </div>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <InfoIcon className="h-4 w-4" />
                    Informações do Plano
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moeda:</span>
                      <Badge variant="outline">
                        {price.currency.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequência:</span>
                      <span className="capitalize">
                        {formatInterval(price.interval)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={
                          subscription.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {subscription.status === 'active'
                          ? 'Ativo'
                          : subscription.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Próximas Cobranças
                  </h4>
                  <div className="space-y-2 text-sm">
                    {nextBillingDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Próxima cobrança:
                        </span>
                        <span className="font-medium">
                          {nextBillingDate.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">
                        {formatCurrency(price.amount, price.currency)}
                      </span>
                    </div>
                    {nextBillingDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Dias restantes:
                        </span>
                        <span className="font-medium">
                          {Math.ceil(
                            (nextBillingDate.getTime() - new Date().getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{' '}
                          dias
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comparação Anual */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Projeção Anual
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-semibold">
                      {formatCurrency(annualValue, price.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Custo anual total
                    </div>
                  </div>

                  {annualSavings > 0 && (
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-lg font-semibold text-green-700">
                        {formatCurrency(annualSavings, price.currency)}
                      </div>
                      <div className="text-xs text-green-600">
                        Economia anual
                      </div>
                    </div>
                  )}

                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-semibold">
                      {formatCurrency(
                        Math.round(annualValue / 12),
                        price.currency,
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Média mensal
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <ClockIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      Informações Importantes
                    </p>
                    <ul className="mt-1 text-blue-800 space-y-1">
                      <li>• As cobranças são processadas automaticamente</li>
                      <li>
                        • Você receberá um email de confirmação após cada
                        cobrança
                      </li>
                      <li>
                        • Pode cancelar ou alterar o plano a qualquer momento
                      </li>
                      {subscription.status === 'trialing' && (
                        <li>• Durante o período de teste, não há cobranças</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
