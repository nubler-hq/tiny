import { smtpAdapter } from '../adapters/smtp.adapter'
import { resendAdapter } from '../adapters/resend.adapter'

export const getAdapter = (adapter: string) => {
  switch (adapter) {
    case 'resend':
      return resendAdapter
    case 'smtp':
      return smtpAdapter
    default:
      throw new Error(`Adapter ${adapter} not found`)
  }
}
