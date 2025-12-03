import type { CyclePeriod, Price } from "@/@saas-boilerplate/features/billing/billing.interface";

export function getPrice(prices: Price[], cycle: CyclePeriod = 'month') {
  return prices.find((price) => price.interval === cycle)
}
