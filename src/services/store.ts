import redis from './redis'

import { createRedisStoreAdapter } from '@igniter-js/adapter-redis'

/**
 * Store adapter for data persistence
 * @description Provides a unified interface for data storage operations
 */
export const store = createRedisStoreAdapter(redis)
