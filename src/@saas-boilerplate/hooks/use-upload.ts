import { useCallback, useState } from 'react'

export interface UseUploadContext {
  type: string
  identifier?: string
}

export interface FileState {
  file: File | null
  name: string
  extension: string
  size: number
  url?: string
  state: 'idle' | 'uploading' | 'uploaded' | 'error'
  uploading: boolean
}

export interface UseUploadProps {
  context: UseUploadContext
  onFileStateChange: (file: FileState) => void
}

export interface UseUploadReturn {
  data: FileState[]
  upload: (file: File) => Promise<void>
}

export function useUpload({
  context,
  onFileStateChange,
}: UseUploadProps): UseUploadReturn {
  const [files, setFiles] = useState<FileState[]>([])

  // Helper to update file state
  const updateFileState = useCallback(
    (file: File, updates: Partial<FileState>) => {
      setFiles((current) =>
        current.map((item) =>
          item.file === file ? { ...item, ...updates } : item,
        ),
      )
    },
    [],
  )

  // Upload implementation
  const upload = useCallback(
    async (file: File) => {
      // Initialize file state
      const initialState: FileState = {
        file,
        name: file.name,
        extension: file.name.split('.').pop() || '',
        size: file.size,
        state: 'idle',
        uploading: false,
      }
      setFiles((current) => [...current, initialState])
      const name = file.name
      const extension = file.name.split('.').pop() || ''
      const size = file.size
      try {
        updateFileState(file, {
          file,
          name,
          extension,
          state: 'uploading',
          uploading: true,
        })
        onFileStateChange({
          file,
          name,
          extension,
          size,
          state: 'uploading',
          uploading: true,
        })

        const formData = new FormData()

        formData.append('file', file)
        formData.append('context', context.type)
        if (context.identifier) {
          formData.append('identifier', context.identifier)
        }

        const response = await fetch('/api/storage', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok)
          throw new Error(`Upload failed: ${response.statusText}`)

        const result = await response.json()

        onFileStateChange({
          file,
          name,
          extension,
          size,
          url: result.url,
          state: 'uploaded',
          uploading: false,
        })
        updateFileState(file, {
          state: 'uploaded',
          uploading: false,
          url: result.url,
        })
      } catch (error) {
        updateFileState(file, { state: 'error', uploading: false })

        onFileStateChange({
          file,
          name,
          extension,
          size,
          state: 'error',
          uploading: false,
        })
        throw error
      }
    },
    [context, updateFileState, onFileStateChange],
  )

  return {
    data: files,
    upload,
  }
}
