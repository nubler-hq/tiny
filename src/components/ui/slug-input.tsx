'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import {
  CheckIcon,
  CheckSquare2Icon,
  CopyIcon,
  Loader2,
  MessageCircle,
  XCircle,
} from 'lucide-react'
import { debounce } from 'lodash'
import {
  ShareDialogInput,
  ShareDialogSocialButtons,
  ShareDialogContent,
  ShareDialogRoot,
  ShareDialogTrigger,
  ShareDialogProvider,
} from '@/components/ui/share-dialog'
import { String } from '@/@saas-boilerplate/utils/string'
import { Url } from '@/@saas-boilerplate/utils/url'
import { useClipboard } from '@/@saas-boilerplate/hooks/use-clipboard'

interface SlugInputContextValue {
  isValid: boolean
  isTouched: boolean
  isChecking: boolean
  value: string
  profileUrl: string
  validateSlug: (slug: string) => boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  copy: {
    onCopy: () => void
    isCopied: boolean
  }
}

const SlugInputContext = React.createContext<SlugInputContextValue | undefined>(
  undefined,
)

function useSlugInput() {
  const context = React.useContext(SlugInputContext)
  if (!context) {
    throw new Error('useSlugInput must be used within a SlugInputProvider')
  }
  return context
}

// Hook personalizado para encapsular a lógica de verificação de slug
function useSlugVerification(options: {
  value: string
  currentSlug?: string
  validateSlug: (slug: string) => boolean
  checkSlugExists: (slug: string) => Promise<boolean>
}) {
  const { currentSlug, validateSlug, checkSlugExists } = options

  // Estados para controlar a validação
  const [isValid, setIsValid] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(false)

  // Cache de resultados para evitar verificações repetidas
  const verificationCache = React.useRef<Record<string, boolean>>({})
  // Última verificação processada para evitar condições de corrida
  const lastVerificationRef = React.useRef<string | null>(null)

  // Função para verificar o slug com debounce
  const verifySlug = React.useCallback(
    debounce(async (slug: string) => {
      // Se já verificamos este slug antes e está no cache, use o resultado em cache
      if (verificationCache.current[slug] !== undefined) {
        setIsValid(verificationCache.current[slug])
        setIsChecking(false)
        return
      }

      // Se o slug for o atual (próprio do usuário), é válido
      if (slug === currentSlug) {
        setIsValid(true)
        setIsChecking(false)
        verificationCache.current[slug] = true
        return
      }

      // Se o slug não for válido pelo regex, não precisa verificar
      if (!validateSlug(slug)) {
        setIsValid(false)
        setIsChecking(false)
        verificationCache.current[slug] = false
        return
      }

      // Armazena o slug que estamos verificando para evitar condições de corrida
      lastVerificationRef.current = slug
      setIsChecking(true)

      try {
        const isAvailable = await checkSlugExists(slug)

        // Se outra verificação foi iniciada enquanto essa estava pendente, ignore o resultado
        if (lastVerificationRef.current !== slug) return

        // Armazena o resultado no cache e atualiza o estado
        verificationCache.current[slug] = isAvailable
        setIsValid(isAvailable)
      } catch (error) {
        console.error('Error checking slug availability:', error)
        if (lastVerificationRef.current !== slug) return
        setIsValid(false)
      } finally {
        if (lastVerificationRef.current === slug) {
          setIsChecking(false)
        }
      }
    }, 300),
    [currentSlug, validateSlug, checkSlugExists],
  )

  return {
    isValid,
    isChecking,
    verifySlug,
  }
}

interface SlugInputProviderProps {
  children: React.ReactNode
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  name: string
  value: string
  checkSlugExists: (slug: string) => Promise<boolean>
  currentSlug?: string
  isTouched: boolean
}

function SlugInputProvider({
  children,
  onChange,
  onBlur,
  value,
  checkSlugExists,
  currentSlug,
  isTouched,
}: SlugInputProviderProps) {
  // URL de perfil para exibição - Não modificamos o valor original para evitar sobrescrição
  const slugifiedValue = String.toSlug(value)

  const profileUrl = Url.get(slugifiedValue || 'seu-nome-de-usuario')
  const copy = useClipboard(profileUrl)

  // Função de validação de formato do slug (apenas letras minúsculas, números e hífens)
  const validateSlug = React.useCallback((slug: string) => {
    return /^[a-z0-9-]+$/.test(slug)
  }, [])

  // Função estável para verificação de slug
  const stableCheckSlugExists = React.useCallback(
    async (slug: string) => {
      return await checkSlugExists(slug)
    },
    [checkSlugExists],
  )

  // Hook personalizado para verificação de slug
  const { isValid, isChecking, verifySlug } = useSlugVerification({
    value,
    currentSlug,
    validateSlug,
    checkSlugExists: stableCheckSlugExists,
  })

  // Verificar o slug quando necessário
  React.useEffect(() => {
    // Só verifica se o campo foi tocado e há um valor
    if (value && value.trim().length > 0) {
      verifySlug(value)
    }

    return () => {
      // Limpa o debounce quando o componente é desmontado
      verifySlug.cancel()
    }
  }, [value])

  // Handlers de eventos com useCallback para estabilidade
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e)
    },
    [onChange],
  )

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur(e)
      // Força verificação no blur se o campo tiver valor
      if (e.target.value && e.target.value.trim().length > 0) {
        verifySlug(e.target.value)
      }
    },
    [onBlur, verifySlug],
  )

  // Memoiza o valor do contexto para evitar re-renderizações desnecessárias
  const contextValue = React.useMemo(
    () => ({
      isValid,
      isTouched,
      isChecking,
      value,
      profileUrl,
      validateSlug,
      handleChange,
      handleBlur,
      copy,
    }),
    [
      isValid,
      isTouched,
      isChecking,
      value,
      profileUrl,
      validateSlug,
      handleChange,
      handleBlur,
      copy,
    ],
  )

  return (
    <SlugInputContext.Provider value={contextValue}>
      {children}
    </SlugInputContext.Provider>
  )
}

interface SlugInputRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SlugInputRoot = React.forwardRef<HTMLDivElement, SlugInputRootProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  ),
)

SlugInputRoot.displayName = 'SlugInputRoot'

interface SlugInputFieldProps extends InputProps {
  name: string
  baseURL?: string
  hasShare?: boolean
}
const SlugInputField = React.forwardRef<HTMLInputElement, SlugInputFieldProps>(
  ({ className, baseURL, name, ...props }, ref) => {
    const {
      isValid,
      copy,
      isTouched,
      isChecking,
      value,
      handleChange,
      handleBlur,
    } = useSlugInput()

    return (
      <div className="space-y-2">
        {/* Mobile layout - Stack vertically on small screens */}
        <div className="md:hidden">
          <div className="text-sm text-muted-foreground/50 mb-1 truncate">
            {baseURL}
          </div>
          <div className="relative flex items-center">
            <Input
              ref={ref}
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                'pr-16',
                isValid && isTouched
                  ? 'border-primary'
                  : isTouched
                    ? 'border-destructive'
                    : '',
                className,
              )}
              placeholder="Digite seu nome de usuário"
              {...props}
            />
            <div className="absolute right-2 flex items-center space-x-1">
              {isTouched && (
                <div className="flex items-center pointer-events-none">
                  {isChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isValid ? (
                    <CheckSquare2Icon className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copy.onCopy}
              >
                {copy.isCopied ? (
                  <CheckIcon className="h-3 w-3" />
                ) : (
                  <CopyIcon className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop layout - Horizontal layout for larger screens */}
        <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:space-x-2">
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {baseURL}
          </span>

          <Input
            ref={ref}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              'pr-10',
              isValid && isTouched
                ? 'border-primary'
                : isTouched
                  ? 'border-destructive'
                  : '',
              className,
            )}
            placeholder="Ex: acme"
            {...props}
          />
          <div className="flex items-center space-x-2">
            {isTouched && (
              <div className="flex items-center pointer-events-none">
                {isChecking ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : isValid ? (
                  <CheckSquare2Icon className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              size="icon"
              onClick={copy.onCopy}
            >
              {copy.isCopied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  },
)

SlugInputField.displayName = 'SlugInputField'

interface SlugInputPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  hasShare?: boolean
}

const SlugInputPreview = React.forwardRef<
  HTMLDivElement,
  SlugInputPreviewProps
>(({ className, hasShare = true, ...props }, ref) => {
  const { profileUrl, copy } = useSlugInput()
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between bg-primary/5 border border-primary-foreground/20 pl-4 pr-2 py-1 rounded-md',
        className,
      )}
      {...props}
    >
      <span className="text-xs font-medium opacity-80">{profileUrl}</span>
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={copy.onCopy}
        >
          {copy.isCopied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </Button>

        {hasShare && (
          <ShareDialogProvider url={profileUrl}>
            <ShareDialogRoot>
              <ShareDialogTrigger />
              <ShareDialogContent>
                <div className="grid gap-4">
                  <ShareDialogInput />
                  <ShareDialogSocialButtons />
                </div>
              </ShareDialogContent>
            </ShareDialogRoot>
          </ShareDialogProvider>
        )}
      </div>
    </div>
  )
})

SlugInputPreview.displayName = 'SlugInputPreview'

const SlugInputError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { isValid, isTouched, isChecking, value, validateSlug } = useSlugInput()
  if (isValid || !isTouched || isChecking) return null
  return (
    <p
      ref={ref}
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {!validateSlug(value) &&
      'Use only lowercase letters, numbers, and hyphens.'}
      {validateSlug(value) &&
      'This username is already taken. Please choose another one.'}
    </p>
  )
})

SlugInputError.displayName = 'SlugInputError'

const SlugInputCustomDomain = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    onCustomDomainClick?: () => void
  }
>(({ className, onCustomDomainClick, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="outline"
    onClick={onCustomDomainClick}
    className={cn('w-full', className)}
    {...props}
  >
    <MessageCircle className="h-4 w-4 mr-2" />
    Solicitar domínio personalizado
  </Button>
))

SlugInputCustomDomain.displayName = 'SlugInputCustomDomain'

export {
  useSlugInput,
  SlugInputProvider,
  SlugInputRoot,
  SlugInputField,
  SlugInputPreview,
  SlugInputError,
  SlugInputCustomDomain,
}
