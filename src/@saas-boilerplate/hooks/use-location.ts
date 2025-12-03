'use client'

import { useEffect, useState } from 'react'

/**
 * Interface for defining the options for the useLocation hook.
 * @interface LocationOptions
 * @property {boolean} [enableHighAccuracy] - Specifies if the location should be retrieved with high accuracy.
 * @property {number} [timeout] - The maximum amount of time (in milliseconds) the device is allowed to take in order to return a position.
 * @property {number} [maximumAge] - The maximum age of a cached position that is acceptable to return.
 */
interface LocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

/**
 * Interface for defining the state of the location.
 * @interface LocationState
 * @property {{ latitude: number | null; longitude: number | null; accuracy: number | null; altitude: number | null; altitudeAccuracy: number | null; heading: number | null; speed: number | null; }} coords - The coordinates of the location.
 * @property {number | null} locatedAt - The timestamp when the location was retrieved.
 * @property {string | null} error - Any error message if the location retrieval failed.
 */
interface LocationState {
  coords: {
    latitude: number | null
    longitude: number | null
    accuracy: number | null
    altitude: number | null
    altitudeAccuracy: number | null
    heading: number | null
    speed: number | null
  }
  locatedAt: number | null
  error: string | null
}

/**
 * Hook to use the geolocation API to retrieve the user's location.
 *
 * This hook uses the Geolocation API to retrieve the user's location. It provides options to specify the level of accuracy, timeout, and maximum age of a cached position. The hook returns the location state, including the coordinates, timestamp, and any error that might occur.
 *
 * @param {LocationOptions} [options] - The options for the location retrieval.
 * @returns {LocationState} - The state of the location.
 */
const useLocation = (options: LocationOptions = {}) => {
  const [location, setLocation] = useState<LocationState>({
    coords: {
      latitude: null,
      longitude: null,
      accuracy: null,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    locatedAt: null,
    error: null,
  })

  useEffect(() => {
    // Ensuring this runs only in a client-side environment
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocation((prevState) => ({
        ...prevState,
        error:
          'Geolocation is not supported by your browser or not available in the current environment',
      }))
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        },
        locatedAt: position.timestamp,
        error: null,
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      setLocation((prevState) => ({
        ...prevState,
        error: error.message,
      }))
    }

    const geoOptions = {
      enableHighAccuracy: options.enableHighAccuracy || false,
      timeout: options.timeout || Infinity,
      maximumAge: options.maximumAge || 0,
    }

    const watcher = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geoOptions,
    )

    return () => navigator.geolocation.clearWatch(watcher)
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge])

  return location
}

export default useLocation
