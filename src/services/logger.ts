import { IgniterLogLevel, createConsoleLogger } from '@igniter-js/core'

/**
 * @description
 * @see https://github.com/felipebarcelospro/igniter-js/blob/main/src/adapters/logger/console.logger.ts
 */
export const logger = createConsoleLogger({
  level: IgniterLogLevel.DEBUG,
  showTimestamp: true,
})
