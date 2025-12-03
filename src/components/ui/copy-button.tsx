'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { Button, type ButtonProps } from './button'
import { toast } from 'sonner'
import { useClipboard } from '@/@saas-boilerplate/hooks/use-clipboard'

/**
 * Props for the CopyButton component
 * @interface CopyButtonProps
 * @extends {Omit<ButtonProps, 'onClick' | 'children'>}
 */
interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  /**
   * The text to be copied when the button is clicked
   */
  value: string
  /**
   * Optional message to show in toast after copying
   */
  toastMessage?: string
}

/**
 * A button component that copies text to clipboard with animation and toast feedback
 * @param {CopyButtonProps} props - The component props
 * @returns {JSX.Element} The rendered CopyButton component
 */
export function CopyButton({
  value,
  toastMessage = 'Copiado para a área de transferência!',
  variant = 'outline',
  size = 'icon',
  ...props
}: CopyButtonProps) {
  const { isCopied, onCopy, setValue } = useClipboard(value)

  React.useEffect(() => {
    setValue(value)
  }, [value])

  /**
   * Handles the copy action and shows toast notification
   */
  const handleCopy = React.useCallback(() => {
    onCopy()
    toast(toastMessage)
  }, [onCopy, toast, toastMessage])

  const copyIcon = React.useMemo(
    () => (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        <Copy className="size-4" />
      </motion.div>
    ),
    [],
  )

  const checkIcon = React.useMemo(
    () => (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        <Check className="size-4" />
      </motion.div>
    ),
    [],
  )

  return (
    <Button variant={variant} size={size} onClick={handleCopy} {...props}>
      {isCopied ? checkIcon : copyIcon}
    </Button>
  )
}
