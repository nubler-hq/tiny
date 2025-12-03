'use client'

import { useCallback, useEffect, useState } from 'react'

// Define custom types for SpeechRecognition and SpeechRecognitionEvent
interface ISpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

// Define custom interface for SpeechRecognition
interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onresult: (event: ISpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

/**
 * Interface for defining the options for the useSpeechToText hook.
 * @interface UseSpeechToTextProps
 * @property {string} [lang] - The language for speech recognition.
 * @property {boolean} [continuous] - Specifies if the speech recognition should continue listening after a result is returned.
 * @property {boolean} [interimResults] - Specifies if the speech recognition should return interim results.
 * @property {number} [maxAlternatives] - The maximum number of speech recognition alternatives to return.
 * @property {(result: string) => void} [onResult] - Callback function to execute when a speech recognition result is returned.
 * @property {(error: string) => void} [onError] - Callback function to execute when a speech recognition error occurs.
 */
interface UseSpeechToTextProps {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (result: string) => void
  onError?: (error: string) => void
}

/**
 * Hook to use the speech-to-text API to convert speech to text.
 *
 * This hook uses the SpeechRecognition API to convert speech to text. It provides options to specify the language, continuous listening, interim results, maximum alternatives, and callbacks for result and error handling.
 *
 * @param {UseSpeechToTextProps} [options] - The options for the speech recognition.
 * @returns {{ start: () => void; stop: () => void; transcript: string; isListening: boolean }} - An object containing the start and stop functions, the current transcript, and the listening state.
 */
export const useSpeechToText = ({
  lang = 'en-US',
  continuous = true,
  interimResults = true,
  maxAlternatives = 1,
  onResult,
  onError,
}: UseSpeechToTextProps = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastProcessedIndex, setLastProcessedIndex] = useState(0)

  const recognition: ISpeechRecognition | null =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
      ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      : null

  const handleResult = useCallback(
    (event: ISpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''

      // Iterate through all the current results
      for (let i = lastProcessedIndex; i < event.results.length; i++) {
        const result = event.results[i]
        // If the result is final, append to the final transcript
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
          setLastProcessedIndex(i + 1)
        } else {
          // Otherwise, append to the interim transcript
          interimTranscript += result[0].transcript + ' '
        }
      }

      // Update the transcript state with a combination of the final and interim results
      setTranscript(transcript + finalTranscript + interimTranscript)

      // Invoke callback with the latest transcript
      onResult && onResult(transcript + finalTranscript + interimTranscript)
    },
    [onResult, transcript, lastProcessedIndex],
  )

  // start and stop functions using useCallback
  const start = useCallback(() => {
    if (!recognition || isListening) return
    setTranscript('')
    setLastProcessedIndex(0)
    setIsListening(true)
    recognition.start()
  }, [recognition, isListening])

  const stop = useCallback(() => {
    if (!recognition || !isListening) return
    recognition.stop()
    setIsListening(false)
  }, [recognition, isListening])

  useEffect(() => {
    if (!recognition) {
      onError && onError('Speech recognition is not supported in this browser.')
      return
    }

    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = maxAlternatives
    recognition.onresult = handleResult
    recognition.onerror = (event) => onError && onError(event.type)
    recognition.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (isListening) recognition.stop()
    }
  }, [
    lang,
    continuous,
    interimResults,
    maxAlternatives,
    handleResult,
    onError,
    recognition,
    start,
    stop,
    isListening,
  ])

  return { start, stop, transcript, isListening }
}

export default useSpeechToText
