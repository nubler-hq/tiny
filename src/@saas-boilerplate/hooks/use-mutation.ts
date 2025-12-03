'use client'

import { useState, useCallback } from 'react'

export interface UseMutationOptions<
  TData = any,
  TVariables = any,
  TError = any,
> {
  retry?: boolean | number
  retryDelay?: number
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown
  onSuccess?: (data: TData, variables: TVariables) => Promise<void> | void
  onError?: (error: TError, variables: TVariables) => Promise<void> | void
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
  ) => Promise<void> | void
}

export interface UseMutationResult<
  TData = any,
  TVariables = any,
  TError = any,
> {
  data: TData | undefined
  error: TError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  mutate: (variables: TVariables) => Promise<TData>
  reset: () => void
}

export function useMutation<TData = any, TVariables = any, TError = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables, TError> = {},
): UseMutationResult<TData, TVariables, TError> {
  const [state, setState] = useState<{
    data: TData | undefined
    error: TError | null
    status: 'idle' | 'loading' | 'error' | 'success'
  }>({
    data: undefined,
    error: null,
    status: 'idle',
  })

  const reset = useCallback(() => {
    setState({
      data: undefined,
      error: null,
      status: 'idle',
    })
  }, [])

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setState((prev) => ({ ...prev, status: 'loading' }))

        // Call onMutate if provided
        if (options.onMutate) {
          await options.onMutate(variables)
        }

        // Execute Server Action
        const data = await mutationFn(variables)

        setState({
          data,
          error: null,
          status: 'success',
        })

        // Call onSuccess if provided
        if (options.onSuccess) {
          await options.onSuccess(data, variables)
        }

        // Call onSettled if provided
        if (options.onSettled) {
          await options.onSettled(data, null, variables)
        }

        return data
      } catch (error) {
        setState({
          data: undefined,
          error: error as TError,
          status: 'error',
        })

        // Call onError if provided
        if (options.onError) {
          await options.onError(error as TError, variables)
        }

        // Call onSettled if provided
        if (options.onSettled) {
          await options.onSettled(undefined, error as TError, variables)
        }

        throw error
      }
    },
    [mutationFn, options],
  )

  return {
    ...state,
    isLoading: state.status === 'loading',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    mutate,
    reset,
  }
}
