import { Redis } from 'ioredis'

/**
 * Redis singleton instance for job queue
 * @description Ensures a single Redis connection across the Next.js app directory
 */
declare global {
  // Allow global var for Redis in Node.js
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined
}

const redis =
  global._redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
  })

if (process.env.NODE_ENV !== 'production') {
  global._redis = redis
}

export default redis
