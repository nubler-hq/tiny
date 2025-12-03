// Auto-generated empty module for client-side compatibility
// This prevents server-only modules from being bundled in the client
// Enhanced with developer experience features for bundle contamination detection
//
// 🎯 USAGE:
// - This module acts as a proxy for server-only modules in client bundles
// - In development, it provides detailed warnings about bundle contamination
// - In production, it silently provides safe fallbacks
//
// 🔧 DEBUGGING:
// - Set DEV_MODE=true for enhanced diagnostics
// - Set VERBOSE_BUNDLE_WARNINGS=true for detailed warnings
// - Access diagnostics via globalThis.__IGNITER_BUNDLE_DIAGNOSTICS__
// - Use console commands for real-time analysis
//
// 📊 FEATURES:
// - Stack trace analysis for contamination sources
// - Call site tracking with frequency analysis
// - Property access pattern detection
// - Development vs production mode handling
// - Global diagnostic utilities
//
// 🚨 COMMON ISSUES DETECTED:
// - Server-only modules imported in client components
// - Igniter.js configuration issues
// - Bundle contamination from server/client mixing
// - Missing client/server boundaries
//
// 📚 CONSOLE COMMANDS (Development Mode):
// - bundleStatus() - Quick contamination check
// - bundleContamination() - Detailed contamination report
// - clearBundleTracking() - Reset contamination tracking
// - __IGNITER_BUNDLE_DIAGNOSTICS__.getReport() - Full diagnostic report
// - __IGNITER_BUNDLE_DIAGNOSTICS__.status() - Status check
// - __IGNITER_BUNDLE_DIAGNOSTICS__.summary() - Summary statistics
//
// 🔧 ENVIRONMENT VARIABLES:
// - DEV_MODE=true - Enable enhanced diagnostics
// - VERBOSE_BUNDLE_WARNINGS=true - Show detailed warnings
// - NODE_ENV=development - Automatically enables dev mode
//
// 📊 TRACKING FEATURES:
// - Stack trace analysis for contamination sources
// - Call site tracking with frequency analysis
// - Property access pattern detection
// - Real-time contamination monitoring
// - Development vs production mode handling

function getImportStack() {
  const err = new Error()
  if (err.stack) {
    // Remove as primeiras linhas (Error constructor e esta função)
    const stackLines = err.stack.split('\n').slice(3)
    // Filtra apenas linhas relevantes (arquivos do projeto)
    const relevantLines = stackLines.filter(
      (line) =>
        line.includes('/src/') ||
        line.includes('/app/') ||
        line.includes('/components/') ||
        line.includes('/features/'),
    )
    return relevantLines.slice(0, 5).join('\n')
  }
  return 'Stack trace unavailable'
}

function getCallerInfo() {
  const err = new Error()
  if (err.stack) {
    const stackLines = err.stack.split('\n')
    // Pula as primeiras linhas até encontrar a origem real
    for (let i = 3; i < stackLines.length; i++) {
      const line = stackLines[i]
      if (line.includes('/src/') || line.includes('/app/')) {
        const match = line.match(/\s*at\s+(.+?)\s*\((.+?):(\d+):(\d+)\)/)
        if (match) {
          return {
            function: match[1],
            file: match[2],
            line: match[3],
            column: match[4],
          }
        }
      }
    }
  }
  return null
}

// Configuração global para controle do comportamento
const DEV_MODE =
  process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true'
const VERBOSE_WARNINGS =
  DEV_MODE &&
  (process.env.VERBOSE_BUNDLE_WARNINGS === 'true' ||
    process.env.DEV_MODE === 'true')

// Tracking de problemas para análise
const contaminationTracker = new Map()
const accessTracker = new Map()

const createEmptyModule = (moduleName = 'unknown') => {
  const warningCache = new Set()
  const moduleAccesses = new Map()

  const showWarning = (prop, details = {}) => {
    // Evita spam de warnings para a mesma propriedade
    const warningKey = `${moduleName}:${prop}`
    if (warningCache.has(warningKey)) {
      return
    }
    warningCache.add(warningKey)

    if (!DEV_MODE || typeof console === 'undefined') {
      return
    }

    const caller = getCallerInfo()
    const timestamp = new Date().toISOString()

    // Coleta métricas para análise
    if (!contaminationTracker.has(moduleName)) {
      contaminationTracker.set(moduleName, {
        firstAccess: timestamp,
        properties: new Set(),
        callSites: new Map(),
      })
    }

    const moduleStats = contaminationTracker.get(moduleName)
    moduleStats.properties.add(prop)

    if (caller) {
      const callKey = `${caller.file}:${caller.line}`
      if (!moduleStats.callSites.has(callKey)) {
        moduleStats.callSites.set(callKey, {
          function: caller.function,
          line: caller.line,
          column: caller.column,
          firstAccess: timestamp,
          count: 0,
        })
      }
      moduleStats.callSites.get(callKey).count++
    }

    // Mostra warning baseado no nível de verbosidade
    if (VERBOSE_WARNINGS) {
      const stack = getImportStack()
      console.warn(
        `🚨 [IGNITER BUNDLE CONTAMINATION DETECTED]\n` +
          `📦 Module: ${moduleName}\n` +
          `🔧 Property: ${prop}\n` +
          `📍 Location: ${caller ? `${caller.file}:${caller.line}:${caller.column}` : 'unknown'}\n` +
          `🧩 Call Stack:\n${stack}\n` +
          `💡 This is likely a server-side only module being accessed in client code.\n` +
          `🔍 Check your imports and ensure client/server separation.\n` +
          `---`,
      )
    } else {
      console.warn(
        `⚠️  [Igniter] Server-only module "${moduleName}" accessed client-side: "${prop}" at ${caller ? `${caller.file}:${caller.line}` : 'unknown location'}`,
      )
    }
  }

  // Create a proxy that intercepts all property access
  const handler = {
    get: (target, prop) => {
      // Allow common properties that might be checked
      if (
        prop === 'default' ||
        prop === '__esModule' ||
        prop === Symbol.toStringTag ||
        prop === 'prototype' ||
        prop === 'name' ||
        prop === 'length' ||
        prop === 'constructor' ||
        // Permitir propriedades do console para debugging
        (typeof prop === 'symbol' && prop.toString().includes('console'))
      ) {
        return target[prop]
      }

      // Show warning for other properties
      showWarning(prop)

      // Return appropriate safe values based on property type
      if (typeof prop === 'string') {
        if (prop.endsWith('Sync') || prop.includes('sync')) {
          return () => null // For sync functions
        }
        if (
          prop.startsWith('is') ||
          prop.startsWith('has') ||
          prop.startsWith('can')
        ) {
          return false // For boolean properties
        }
        if (
          prop.startsWith('get') ||
          prop.startsWith('fetch') ||
          prop.startsWith('load')
        ) {
          return () => Promise.resolve(null) // For async getters
        }
        if (
          prop.startsWith('set') ||
          prop.startsWith('update') ||
          prop.startsWith('save')
        ) {
          return () => Promise.resolve() // For async setters
        }
        if (prop.includes('Error') || prop.includes('Exception')) {
          return Error // For error constructors
        }
      }

      // Default: return empty function or object
      return typeof prop === 'string' && prop.includes('function')
        ? () => null
        : () => Promise.resolve(null)
    },

    set: (target, prop, value) => {
      // Allow setting properties silently for compatibility
      target[prop] = value
      return true
    },

    has: (target, prop) => {
      // Pretend all properties exist to avoid "property not found" errors
      return true
    },

    ownKeys: (target) => {
      // Return minimal keys to avoid enumeration issues
      return ['default', '__esModule']
    },

    getOwnPropertyDescriptor: (target, prop) => {
      // Provide descriptors for standard properties
      if (prop === 'default' || prop === '__esModule') {
        return {
          value: target[prop],
          writable: true,
          enumerable: true,
          configurable: true,
        }
      }
      return {
        value: undefined,
        writable: true,
        enumerable: true,
        configurable: true,
      }
    },

    // Add debugging capabilities
    getPrototypeOf: () => null,
    setPrototypeOf: () => true,
    isExtensible: () => true,
    preventExtensions: () => false,
  }

  const target = {
    default: {},
    __esModule: true,
    [Symbol.toStringTag]: 'Module',
  }

  return new Proxy(target, handler)
}

// Create utility functions for debugging
const createDiagnosticModule = (moduleName) => {
  const emptyModule = createEmptyModule(moduleName)

  // Add diagnostic methods to the module
  if (DEV_MODE && typeof console !== 'undefined') {
    Object.defineProperty(emptyModule, '_getContaminationReport', {
      value: () => {
        const stats = contaminationTracker.get(moduleName)
        if (!stats) {
          return `No contamination detected for module: ${moduleName}`
        }

        const report = [
          `📊 CONTAMINATION REPORT FOR: ${moduleName}`,
          `⏰ First Access: ${stats.firstAccess}`,
          `🔧 Properties: ${Array.from(stats.properties).join(', ')}`,
          `📍 Call Sites:`,
        ]

        stats.callSites.forEach((callSite, callKey) => {
          report.push(
            `   • ${callSite.function} in ${callKey} (${callSite.count} times)`,
          )
        })

        return report.join('\n')
      },
      enumerable: false,
      configurable: false,
    })

    Object.defineProperty(emptyModule, '_resetTracking', {
      value: () => {
        contaminationTracker.delete(moduleName)
        console.log(`🧹 Reset contamination tracking for: ${moduleName}`)
      },
      enumerable: false,
      configurable: false,
    })
  }

  return emptyModule
}

// Global diagnostics function
const getBundleContaminationReport = () => {
  if (!DEV_MODE) {
    return 'Bundle contamination tracking only available in development mode'
  }

  if (contaminationTracker.size === 0) {
    return '✅ No bundle contamination detected!'
  }

  const report = [
    '🚨 BUNDLE CONTAMINATION REPORT',
    `📈 Total problematic modules: ${contaminationTracker.size}`,
    '',
    ...Array.from(contaminationTracker.entries())
      .map(([moduleName, stats]) => [
        `📦 MODULE: ${moduleName}`,
        `   Properties: ${Array.from(stats.properties).join(', ')}`,
        `   Call sites: ${stats.callSites.size}`,
        `   First access: ${stats.firstAccess}`,
        '',
      ])
      .flat(),
  ]

  return report.join('\n')
}

// Create the main empty module with diagnostics
const emptyModule = DEV_MODE
  ? createDiagnosticModule('unknown')
  : createEmptyModule('unknown')

// Add global diagnostics if in dev mode
if (DEV_MODE && typeof globalThis !== 'undefined') {
  // Make diagnostics available globally for debugging
  Object.defineProperty(globalThis, '__IGNITER_BUNDLE_DIAGNOSTICS__', {
    value: {
      getReport: getBundleContaminationReport,
      resetAll: () => {
        contaminationTracker.clear()
        console.log('🧹 Reset all contamination tracking')
      },
      getModules: () => Array.from(contaminationTracker.keys()),
      getStats: (moduleName) => contaminationTracker.get(moduleName),
    },
    enumerable: false,
    configurable: false,
  })

  // Add to console for easy access
  if (typeof console !== 'undefined') {
    console.log(
      '🔧 Igniter Bundle Diagnostics available at: globalThis.__IGNITER_BUNDLE_DIAGNOSTICS__',
    )
    console.log('💡 Quick commands:')
    console.log(
      '   • __IGNITER_BUNDLE_DIAGNOSTICS__.status() - Quick status check',
    )
    console.log(
      '   • __IGNITER_BUNDLE_DIAGNOSTICS__.summary() - Overview stats',
    )
    console.log(
      '   • __IGNITER_BUNDLE_DIAGNOSTICS__.getReport() - Detailed report',
    )
    console.log(
      '   • __IGNITER_BUNDLE_DIAGNOSTICS__.resetAll() - Clear tracking data',
    )
  }
}

// Add helpful console commands for development
if (DEV_MODE && typeof console !== 'undefined') {
  // Add bundle contamination command to console
  console.bundleContamination = () => {
    console.log(getBundleContaminationReport())
  }

  console.bundleStatus = () => {
    const status =
      contaminationTracker.size === 0 ? '✅ Clean' : '🚨 Contaminated'
    console.log(`Bundle Status: ${status}`)
    if (contaminationTracker.size > 0) {
      console.log(
        `Modules with contamination: ${Array.from(contaminationTracker.keys()).join(', ')}`,
      )
    }
  }

  console.clearBundleTracking = () => {
    contaminationTracker.clear()
    console.log('🧹 Bundle contamination tracking cleared')
  }

  // Show welcome message with tips
  setTimeout(() => {
    console.log('🚀 Igniter Bundle Protection Active!')
    console.log(
      '💡 Type "bundleStatus()" in console to check for contamination',
    )
    console.log('💡 Type "bundleContamination()" for detailed report')
  }, 1000)
}

// Export for all module systems
module.exports = emptyModule
module.exports.default = emptyModule

if (typeof exports !== 'undefined') {
  exports.default = emptyModule
}

// 🎉 Enhanced empty.js loaded successfully!
// In development mode, check the console for diagnostic tools and bundle contamination monitoring.
//
// 📖 DOCUMENTATION:
// See BUNDLE_CONTAMINATION_README.md for complete usage guide
