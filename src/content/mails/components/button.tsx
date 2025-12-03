import * as ReactEmail from '@react-email/components'
import * as React from 'react'

/**
 * Standard email button component for consistent CTA use across email templates.
 * Props are forwarded to ReactEmail.Link. Use children for label.
 *
 * @param {object} props
 * @param {string} props.href - URL for the button action (required)
 * @param {React.ReactNode} props.children - Button label
 * @param {string} [props.className] - Extra CSS classes
 * @param {string} [props.target] - Target window/tab (optional)
 * @returns {JSX.Element}
 */
export function Button({
  href,
  children,
  className = '',
  ...rest
}: {
  href: string
  children: React.ReactNode
  className?: string
  target?: string
  [key: string]: any
}) {
  return (
    <ReactEmail.Link
      href={href}
      className={`rounded-full bg-black px-6 py-3 text-center text-[14px] font-semibold text-white no-underline transition-colors hover:bg-neutral-800 ${className}`}
      {...rest}
    >
      {children}
    </ReactEmail.Link>
  )
}
