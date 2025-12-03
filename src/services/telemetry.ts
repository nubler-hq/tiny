import { createConsoleTelemetryAdapter } from '@igniter-js/core/adapters'
import { store } from './store'

export const telemetry = createConsoleTelemetryAdapter(
  {
    serviceName: 'SaaS Boilerplate',
    environment: 'development',
    enableTracing: true,
    enableMetrics: true,
    enableEvents: true,
  },
  {
    store, // ✅ Redis connection
    enableCliIntegration: true, // ✅ Habilita CLI
  },
)
