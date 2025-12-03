import { ComputerIcon, PhoneIcon } from 'lucide-react'

export function getDeviceIconByUserAgent(userAgent: string) {
  if (userAgent.includes('Android')) {
    return <PhoneIcon className="size-4" />
  }

  if (userAgent.includes('iPhone')) {
    return <PhoneIcon className="size-4" />
  }

  return <ComputerIcon className="size-4" />
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  os: string
  osVersion?: string
  browser: string
  browserVersion?: string
  device: string
  isBot: boolean
}

export function getDeviceInfoByUserAgent(userAgent: string): DeviceInfo {
  // Default info
  const info: DeviceInfo = {
    type: 'desktop',
    os: 'Unknown',
    browser: 'Unknown',
    device: 'Unknown',
    isBot: false,
  }

  // Check if bot
  if (/bot|crawler|spider|crawling/i.test(userAgent)) {
    info.isBot = true
    info.device = 'Bot'
    return info
  }

  // Detect OS
  if (/windows/i.test(userAgent)) {
    info.os = 'Windows'
    const version = userAgent.match(/Windows NT (\d+\.\d+)/)
    info.osVersion = version ? version[1] : undefined
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    info.os = 'macOS'
    const version = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    info.osVersion = version ? version[1].replace('_', '.') : undefined
  } else if (/android/i.test(userAgent)) {
    info.os = 'Android'
    info.type = /mobile/i.test(userAgent) ? 'mobile' : 'tablet'
    const version = userAgent.match(/Android (\d+\.\d+)/)
    info.osVersion = version ? version[1] : undefined
  } else if (/ipad/i.test(userAgent)) {
    info.os = 'iOS'
    info.type = 'tablet'
    info.device = 'iPad'
    const version = userAgent.match(/OS (\d+[._]\d+)/)
    info.osVersion = version ? version[1].replace('_', '.') : undefined
  } else if (/iphone|ipod/i.test(userAgent)) {
    info.os = 'iOS'
    info.type = 'mobile'
    info.device = /iphone/i.test(userAgent) ? 'iPhone' : 'iPod'
    const version = userAgent.match(/OS (\d+[._]\d+)/)
    info.osVersion = version ? version[1].replace('_', '.') : undefined
  } else if (/linux/i.test(userAgent)) {
    info.os = 'Linux'
  }

  // Detect browser
  if (/chrome|chromium/i.test(userAgent)) {
    info.browser = 'Chrome'
    const version = userAgent.match(/(?:Chrome|Chromium)\/(\d+\.\d+)/)
    info.browserVersion = version ? version[1] : undefined
  } else if (/firefox/i.test(userAgent)) {
    info.browser = 'Firefox'
    const version = userAgent.match(/Firefox\/(\d+\.\d+)/)
    info.browserVersion = version ? version[1] : undefined
  } else if (/safari/i.test(userAgent)) {
    info.browser = 'Safari'
    const version = userAgent.match(/Version\/(\d+\.\d+)/)
    info.browserVersion = version ? version[1] : undefined
  } else if (/edge/i.test(userAgent)) {
    info.browser = 'Edge'
    const version = userAgent.match(/Edge\/(\d+\.\d+)/)
    info.browserVersion = version ? version[1] : undefined
  } else if (/opera|opr/i.test(userAgent)) {
    info.browser = 'Opera'
    const version = userAgent.match(/(?:Opera|OPR)\/(\d+\.\d+)/)
    info.browserVersion = version ? version[1] : undefined
  }

  // Detect device model for mobile
  if (info.type === 'mobile' || info.type === 'tablet') {
    const model = userAgent.match(/\((.*?)\)/)
    if (model && model[1]) {
      // Clean up the device info
      info.device =
        model[1]
          .split(';')
          .find((part) => !/(Android|iOS|Mobile|Build)/i.test(part))
          ?.trim() || info.device
    }
  }

  return info
}
