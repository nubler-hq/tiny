/**
 * @file next.config.ts
 * @description Next.js configuration with Turbopack support for the SaaS Boilerplate.
 *
 * This configuration integrates:
 * - Igniter.js API framework adapter
 * - Turbopack bundler for faster builds and development
 * - Bundle analyzer for performance optimization
 * - Server-side package externalization
 */

import { withIgniter } from '@igniter-js/core/adapters'
import type { NextConfig } from 'next'
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()
// =============================================================================
// Next.js Configuration
// =============================================================================
const nextConfig: NextConfig = withIgniter({
  // ---------------------------------------------------------------------------
  // Server-Side Package Externalization
  // ---------------------------------------------------------------------------
  // These packages are excluded from the server bundle to reduce build size
  // and improve performance. They remain available at runtime via node_modules.
  //
  // IMPORTANT: All server-side packages MUST be externalized to work properly with Turbopack.
  // This prevents bundle contamination and ensures proper server-side functionality.
  serverExternalPackages: [
    // Cloud Services & Storage
    '@aws-sdk/client-s3',

    // Igniter.js Adapters
    '@igniter-js/adapter-bullmq',
    '@igniter-js/adapter-redis',
    '@igniter-js/adapter-mcp-server',
    '@igniter-js/bot',

    // Dependency Injection
    'awilix',

    // Background Jobs & Queue Management
    'bullmq',

    // Redis Client
    'ioredis',

    // Email Services
    'nodemailer',
    'resend',

    // Websockets
    'ws',

    // Payment Processing
    'stripe',

    // Database & ORM (CRITICAL for Turbopack)
    '@prisma/client',

    // Igniter.js Core (CRITICAL for Turbopack)
    'src/igniter.router.ts',
    'src/igniter.context.ts',
    'src/igniter.mcp-server.ts',

    // Application Services (CRITICAL for Turbopack)
    'src/services/prisma.ts',
    'src/services/auth.ts',
    'src/services/mail.ts',
    'src/services/payment.ts',
    'src/services/plugin-manager.ts',
    'src/services/jobs.ts',
    'src/services/store.ts',
    'src/services/redis.ts',
    'src/services/logger.ts',
    'src/services/telemetry.ts',
    'src/services/notification.ts',
    'src/services/storage.ts',
  ],

  transpilePackages: ['better-auth'],

  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  
  rewrites: () => {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/api/content/docs/llms.mdx/:path*',
      },
      {
        source: '/docs/llms.txt',
        destination: '/api/content/docs/llms-full.txt',
      },
      {
        source: '/blog/:path*.mdx',
        destination: '/api/content/blog/llms.mdx/:path*',
      },
      {
        source: '/blog/llms.txt',
        destination: '/api/content/blog/llms-full.txt',
      },
      {
        source: '/help/:path*.mdx',
        destination: '/api/content/help/llms.mdx/:path*',
      },
      {
        source: '/help/llms.txt',
        destination: '/api/content/help/llms-full.txt',
      },
      {
        source: '/updates/:path*.mdx',
        destination: '/api/content/updates/llms.mdx/:path*',
      },
      {
        source: '/updates/llms.txt',
        destination: '/api/content/updates/llms-full.txt',
      },
    ]
  },

  // ---------------------------------------------------------------------------
  // Turbopack Configuration
  // ---------------------------------------------------------------------------
  // Turbopack is a Rust-based bundler optimized for JavaScript and TypeScript.
  // It provides faster builds and improved development experience.
  //
  // To enable Turbopack:
  // - Development: next dev --turbopack
  // - Production: next build --turbopack
  //
  // Note: Turbopack automatically handles server-only code separation.
  // Unlike Webpack, it doesn't require manual alias configuration to exclude
  // server modules from client bundles. The Next.js compiler handles this
  // automatically based on 'use server' directives and server-only imports.
  turbopack: {
    // -------------------------------------------------------------------------
    // Module Resolution Extensions
    // -------------------------------------------------------------------------
    // Define the order of file extensions to try when resolving imports.
    // Turbopack will attempt to resolve files in this order.
    resolveExtensions: [
      '.tsx', // TypeScript + JSX
      '.ts', // TypeScript
      '.jsx', // JavaScript + JSX
      '.js', // JavaScript
      '.mjs', // ES Modules
      '.json', // JSON files
    ],
  },

  // ---------------------------------------------------------------------------
  // Legacy Webpack Configuration (Fallback)
  // ---------------------------------------------------------------------------
  // This configuration is used when Turbopack is not enabled.
  // Keep it for backward compatibility until full Turbopack migration.
  webpack: (
    config: any,
    { dev, isServer }: { dev: boolean; isServer: boolean },
  ) => {
    // Only apply client-side configurations
    if (!isServer) {
      // Prevent server-only modules from being bundled in client
      config.resolve.alias = {
        ...config.resolve.alias,
        './services/prisma': false,
        './services/auth': false,
        './services/mail': false,
        './services/payment': false,
        './services/plugin-manager': false,
        './services/jobs': false,
        './services/store': false,
        './services/redis': false,
        './services/logger': false,
        './services/telemetry': false,
        './services/binance': false,
        './services/notification': false,
        './igniter.context': false,
        './igniter.router': false,
      }

      // Provide fallbacks for Node.js modules in browser environment
      // Set to 'false' to exclude them from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'node:fs': false,
        'node:path': false,
        net: false,
        dns: false,
        tls: false,
        child_process: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
      }

      // Mark packages as external to prevent bundling in client
      config.externals = [
        ...(config.externals || []),
        '@prisma/client',
        'better-auth',
        'stripe',
        'nodemailer',
        'resend',
        'bullmq',
        'ioredis',
        '@aws-sdk/client-s3',
        '@igniter-js/adapter-bullmq',
        '@igniter-js/adapter-redis',
        'ccxt',
        'protobufjs',
        'awilix',
      ]
    }

    // Production-only optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true, // Tree shaking: remove unused exports
        sideEffects: false, // Assume no side effects for better tree shaking
        innerGraph: true, // Advanced dependency analysis
        providedExports: true, // Analyze which exports are provided
        concatenateModules: true, // Merge modules into single scope (scope hoisting)
      }
    }

    return config
  },
})

// =============================================================================
// Export Final Configuration
// =============================================================================
// Apply bundle analyzer wrapper and export the final configuration
export default withMDX(nextConfig)
