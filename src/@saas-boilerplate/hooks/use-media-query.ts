'use client'

import { useEffect, useState } from 'react'

/**
 * Custom hook to check if a media query matches the current viewport
 * @param query The media query string to check
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    // Set the initial state
    setMatches(mediaQuery.matches)

    // Define a callback function to handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add the listener for changes
    mediaQuery.addListener(handleChange)

    // Clean up the listener when the component unmounts
    return () => {
      mediaQuery.removeListener(handleChange)
    }
  }, [query]) // Re-run the effect if the query changes

  return matches
}
