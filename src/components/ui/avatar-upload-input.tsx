'use client'

import { Loader2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from './button'
import { useUpload, type FileState } from '@/@saas-boilerplate/hooks/use-upload'

interface AvatarUploadInputProps {
  context: 'organizations' | 'users' | 'shared'
  id: string
  onChange: (value: string) => void
  onStateChange?: (file: FileState) => Promise<void>
  value: string | undefined
  placeholder?: string
}

export function AvatarUploadInput({
  context,
  id,
  onChange,
  onStateChange,
  value,
  placeholder,
}: AvatarUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Criando os callbacks para o hook useUpload
  const handleFileStateChange = (file: FileState) => {
    if (file.state === 'uploading') {
      setError(null)
    }

    if (file.state === 'error') {
      setError('Falha ao enviar arquivo')
    }

    if (file.state === 'uploaded') {
      onChange(file.url || '')
    }

    onStateChange?.(file)
  }

  const { upload, data } = useUpload({
    context: {
      type: context,
      identifier: id,
    },
    onFileStateChange: handleFileStateChange,
  })

  const handleUploadClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await upload(file)
    } catch (err) {
      // O erro já é tratado no callback onFileUploadError
    } finally {
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  // Função para obter as iniciais do nome para o placeholder
  const getInitialsFromName = (name: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Verifica se há um arquivo sendo enviado
  const isUploading = data.some((file) => file.uploading)

  return (
    <div>
      <div className="flex items-center space-x-2">
        <div className="relative flex items-center justify-center w-8 h-8">
          {isUploading && (
            <Loader2 className="absolute text-white h-6 w-6 animate-spin" />
          )}
          {value ? (
            <img
              src={value}
              alt="Profile"
              className={`w-full h-full object-cover rounded-md border ${isUploading ? 'opacity-60' : ''}`}
            />
          ) : (
            <div className="w-full border h-full bg-muted rounded-md flex items-center justify-center">
              <span className="text-xs">
                {getInitialsFromName(placeholder || 'User')}
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*"
        />

        <Button
          type="button"
          onClick={handleUploadClick}
          variant="outline"
          disabled={isUploading}
        >
          <Upload className="w-3 h-3 mr-2" />
          {value ? 'Change' : 'Upload'}
        </Button>
      </div>

      {error && (
        <span className="text-red-500 text-sm mt-4 block">{error}</span>
      )}
    </div>
  )
}
