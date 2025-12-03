/**
 * Determines if payment functionality is enabled.
 *
 * Checks the `NEXT_PUBLIC_PAYMENT_ENABLED` environment variable first:
 * - If defined, returns `true` if its value is `'true'`, otherwise `false`.
 * - If not defined, checks if `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` exists and is not empty.
 *
 * @returns {boolean} `true` if payment is enabled, otherwise `false`.
 */
export const isPaymentEnabled = () => {
  if(process.env.NEXT_PUBLIC_PAYMENT_ENABLED !== undefined) {
    return process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true';
  }
  
  return !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim() !== '');
};