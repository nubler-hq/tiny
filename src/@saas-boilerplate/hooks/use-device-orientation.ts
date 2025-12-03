'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Represents the state of the device orientation.
 * @property {number | null} alpha - The alpha value of the device orientation.
 * @property {number | null} beta - The beta value of the device orientation.
 * @property {number | null} gamma - The gamma value of the device orientation.
 * @property {boolean} absolute - Indicates if the device orientation is absolute.
 */
interface DeviceOrientationState {
  alpha: number | null
  beta: number | null
  gamma: number | null
  absolute: boolean
}

// Define an extended interface for DeviceOrientationEvent including requestPermission
interface DeviceOrientationEventExtended extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/**
 * A hook that provides a way to use the device orientation API.
 * @returns {Object} - An object containing the state and methods for the device orientation.
 */
function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationState>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false,
  })

  // Check if the DeviceOrientationEvent is supported - this will be true in most browsers (even desktop)
  const isSupported = typeof window.DeviceOrientationEvent !== 'undefined'

  // Determine if we need to request permission (for iOS 13+)
  const [isPermissionGranted, setIsPermissionGranted] = useState(
    typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventExtended)
      .requestPermission !== 'function',
  )

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      absolute: event.absolute,
    })
  }, [])

  useEffect(() => {
    if (isPermissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation)
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [isPermissionGranted, handleOrientation])

  const requestPermission = useCallback(async () => {
    const deviceOrientationEvent =
      DeviceOrientationEvent as unknown as DeviceOrientationEventExtended

    if (typeof deviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await deviceOrientationEvent.requestPermission()
        setIsPermissionGranted(permissionState === 'granted')
      } catch (error) {
        console.error('Error requesting device orientation permission:', error)
      }
    }
  }, [])

  return { orientation, requestPermission, isPermissionGranted, isSupported }
}

export default useDeviceOrientation
