'use client'

import { useEffect, useState } from 'react'

/**
 * Interface for defining the properties of the NetworkInformation object.
 * @interface NetworkInformation
 * @property {number} [downlink] - The estimated bandwidth of the user's connection in megabits per second.
 * @property {"slow-2g" | "2g" | "3g" | "4g"} [effectiveType] - The effective type of the connection.
 * @property {number} [rtt] - The round-trip time to the server in milliseconds.
 * @property {boolean} [saveData] - Indicates if the user has requested a reduced data usage mode.
 * @property {(event: Event) => void} [onchange] - An event listener for changes to the network information.
 */
interface NetworkInformation extends EventTarget {
  downlink?: number
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  rtt?: number
  saveData?: boolean
  onchange?: EventListener
}

/**
 * Interface for extending the Navigator object with network information.
 * @interface NavigatorWithNetworkInformation
 * @property {NetworkInformation} [connection] - The network information object.
 */
interface NavigatorWithNetworkInformation extends Navigator {
  connection?: NetworkInformation
}

/**
 * Interface for defining the state of the network.
 * @interface NetworkState
 * @property {number | null} downlink - The estimated bandwidth of the user's connection in megabits per second.
 * @property {"slow-2g" | "2g" | "3g" | "4g" | null} effectiveType - The effective type of the connection.
 * @property {number | null} rtt - The round-trip time to the server in milliseconds.
 * @property {boolean | null} saveData - Indicates if the user has requested a reduced data usage mode.
 * @property {boolean} isOnline - Indicates if the user is currently online.
 */
interface NetworkState {
  downlink?: number | null
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | null
  rtt?: number | null
  saveData?: boolean | null
  isOnline: boolean
}

/**
 * Hook for detecting and managing network state changes.
 *
 * This hook listens for changes in the network information and updates the state accordingly.
 * It also listens for online and offline events to update the isOnline state.
 *
 * @returns {NetworkState} - The current state of the network.
 */
function useNetwork(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    downlink: null,
    effectiveType: null,
    rtt: null,
    saveData: null,
    isOnline: false, // Default to false; updated correctly on the client-side
  })

  useEffect(() => {
    // Ensure we are in the browser environment
    if (typeof window === 'undefined') {
      return
    }

    const nav = navigator as NavigatorWithNetworkInformation

    if (!nav.connection) {
      setNetworkState((prevState) => ({
        ...prevState,
        downlink: null,
        effectiveType: null,
        rtt: null,
        saveData: null,
        isOnline: navigator.onLine, // Update online status in the browser
      }))
      return
    }

    const updateNetworkInfo = () => {
      const { downlink, effectiveType, rtt, saveData } = nav.connection!
      setNetworkState((prevState) => ({
        ...prevState,
        downlink,
        effectiveType,
        rtt,
        saveData,
        isOnline: navigator.onLine,
      }))
    }

    updateNetworkInfo()
    nav.connection!.addEventListener('change', updateNetworkInfo)
    window.addEventListener('online', () =>
      setNetworkState((prevState) => ({ ...prevState, isOnline: true })),
    )
    window.addEventListener('offline', () =>
      setNetworkState((prevState) => ({ ...prevState, isOnline: false })),
    )

    return () => {
      if (nav.connection) {
        nav.connection.removeEventListener('change', updateNetworkInfo)
      }
      window.removeEventListener('online', () =>
        setNetworkState((prevState) => ({ ...prevState, isOnline: true })),
      )
      window.removeEventListener('offline', () =>
        setNetworkState((prevState) => ({ ...prevState, isOnline: false })),
      )
    }
  }, [])

  return networkState
}

export default useNetwork
