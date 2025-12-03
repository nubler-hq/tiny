'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Represents the options for the useBroadcastChannel hook.
 * @property {string} name - The name of the broadcast channel.
 * @property {(event: MessageEvent) => void} [onMessage] - Optional callback for handling incoming messages.
 * @property {(event: MessageEvent) => void} [onMessageError] - Optional callback for handling message errors.
 */
interface UseBroadcastChannelOptions {
  name: string
  onMessage?: (event: MessageEvent) => void
  onMessageError?: (event: MessageEvent) => void
}

/**
 * Represents the return value of the useBroadcastChannel hook.
 * @property {boolean} isSupported - Indicates if the BroadcastChannel API is supported.
 * @property {BroadcastChannel | undefined} channel - The BroadcastChannel instance or undefined if not supported.
 * @property {D | undefined} data - The last received message data or undefined if no message has been received.
 * @property {(data: P) => void} post - A function to post a message to the channel.
 * @property {() => void} close - A function to close the channel.
 * @property {Event | undefined} messageError - The last error event received or undefined if no error has occurred.
 * @property {boolean} isClosed - Indicates if the channel is closed.
 */
interface UseBroadcastChannelReturn<D, P> {
  isSupported: boolean
  channel: BroadcastChannel | undefined
  data: D | undefined
  post: (data: P) => void
  close: () => void
  messageError: Event | undefined
  isClosed: boolean
}

/**
 * A hook that provides a way to use the BroadcastChannel API for communication between different contexts.
 *
 * @param {UseBroadcastChannelOptions} options - The options for the hook.
 * @returns {UseBroadcastChannelReturn<D, P>} - An object containing the state and methods for the broadcast channel.
 */
function useBroadcastChannel<D, P>(
  options: UseBroadcastChannelOptions,
): UseBroadcastChannelReturn<D, P> {
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const channelRef = useRef<BroadcastChannel | undefined>(undefined)
  const [data, setData] = useState<D | undefined>()
  const [messageError, setMessageError] = useState<Event | undefined>(undefined)
  const [isClosed, setIsClosed] = useState<boolean>(false)

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' && 'BroadcastChannel' in window,
    )
  }, [])

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      setData(event.data as D)
      options.onMessage?.(event)
    },
    [options.onMessage],
  )

  const handleMessageError = useCallback(
    (event: MessageEvent) => {
      setMessageError(event)
      options.onMessageError?.(event)
    },
    [options.onMessageError],
  )

  useEffect(() => {
    if (isSupported) {
      const newChannel = new BroadcastChannel(options.name)
      channelRef.current = newChannel

      newChannel.addEventListener('message', handleMessage)
      newChannel.addEventListener('messageerror', handleMessageError)

      return () => {
        newChannel.removeEventListener('message', handleMessage)
        newChannel.removeEventListener('messageerror', handleMessageError)
        if (!isClosed) {
          newChannel.close()
        }
        channelRef.current = undefined
      }
    }
  }, [isSupported, options.name, handleMessage, handleMessageError])

  const post = useCallback(
    (messageData: P) => {
      if (channelRef.current && !isClosed) {
        channelRef.current.postMessage(messageData)
      }
    },
    [isClosed],
  )

  const close = useCallback(() => {
    if (channelRef.current && !isClosed) {
      channelRef.current.close()
      setIsClosed(true)
    }
  }, [isClosed])

  return {
    isSupported,
    channel: channelRef.current,
    data,
    post,
    close,
    messageError,
    isClosed,
  }
}

export default useBroadcastChannel
