'use client'

import { Lists } from '@/components/ui/lists'
import { Button } from '@/components/ui/button'
import { Key, KeyIcon, PlusSquareIcon, Trash, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Annotated } from '@/components/ui/annotated'
import { useState } from 'react'
import { CreateApiKeyModal } from './upsert-api-key-dialog'
import { api } from '@/igniter.client'
import { useRouter } from 'next/navigation'
import { AnimatedEmptyState } from '@/components/ui/animated-empty-state'
import { motion, AnimatePresence } from 'framer-motion'
import { useClipboard } from '@/@saas-boilerplate/hooks/use-clipboard'

interface ApiKey {
  id: string
  description: string
  expiresAt?: Date | null
  key: string
}

interface ApiKeyListProps {
  apiKeys: ApiKey[]
  onDelete?: (id: string) => Promise<void>
}

interface ApiKeyRowProps {
  apiKey: ApiKey
  onDelete: (id: string) => Promise<void>
}

function ApiKeyRow({ apiKey, onDelete }: ApiKeyRowProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { onCopy, isCopied: isClipboardCopied } = useClipboard(apiKey.key)

  // Show only last 4 characters when masked
  const maskedKey = `••••${apiKey.key.slice(-4)}`

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast.error('Clipboard not supported in your browser')
      return
    }
    try {
      onCopy()
      setIsCopied(true)
      toast.success('API key copied to clipboard')

      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy API key')
    }
  }

  return (
    <Lists.Item key={apiKey.id}>
      <motion.div
        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors duration-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-6 flex-1">
          {/* Descrição */}
          <div>
            <p className="font-medium text-sm truncate">{apiKey.description}</p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center space-x-6">
          {/* Chave mascarada */}
          <div className="text-sm font-mono text-muted-foreground">
            {maskedKey}
          </div>

          {/* Data de expiração */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {apiKey.expiresAt
                ? `Expires ${apiKey.expiresAt.toLocaleDateString()}`
                : 'Never expires'}
            </p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleCopy}
            disabled={
              isClipboardCopied ||
              typeof navigator === 'undefined' ||
              !navigator.clipboard
            }
            title="Copy API key"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isCopied ? 'copied' : 'copy'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(apiKey.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </Lists.Item>
  )
}

export function ApiKeyList({ apiKeys, onDelete }: ApiKeyListProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to remove this API key?'))
        return
      await api.apiKey.delete.mutate({ params: { id } })
      await onDelete?.(id)
      toast.success('API key removed successfully')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to remove the API key')
    }
  }

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <Key className="h-4 w-4" />
        </Annotated.Icon>
        <Annotated.Title>API Keys</Annotated.Title>
        <Annotated.Description>
          Manage your API keys for integration with external services.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <Lists.Root data={apiKeys} searchFields={['description']}>
            <Lists.SearchBar />
            <Lists.Content>
              {({ data }) =>
                data.length === 0 ? (
                  <AnimatedEmptyState>
                    <AnimatedEmptyState.Carousel>
                      <KeyIcon className="size-6" />
                      <span className="bg-secondary h-3 w-[16rem] rounded-full"></span>
                    </AnimatedEmptyState.Carousel>

                    <AnimatedEmptyState.Content>
                      <AnimatedEmptyState.Title>
                        No API keys found
                      </AnimatedEmptyState.Title>
                      <AnimatedEmptyState.Description>
                        You haven't created any API keys yet.
                      </AnimatedEmptyState.Description>
                    </AnimatedEmptyState.Content>

                    <AnimatedEmptyState.Actions>
                      <AnimatedEmptyState.Action
                        onClick={() => setIsModalOpen(true)}
                      >
                        <PlusSquareIcon className="h-4 w-4 mr-2" />
                        Create API key
                      </AnimatedEmptyState.Action>
                    </AnimatedEmptyState.Actions>
                  </AnimatedEmptyState>
                ) : (
                  <>
                    {data.map((apiKey: ApiKey) => (
                      <ApiKeyRow
                        key={apiKey.id}
                        apiKey={apiKey}
                        onDelete={handleDelete}
                      />
                    ))}
                  </>
                )
              }
            </Lists.Content>
          </Lists.Root>

          <CreateApiKeyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
