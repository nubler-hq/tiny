import { z } from 'zod'
import { igniter } from '@/igniter'
import { AuthFeatureProcedure } from '../procedures/auth.procedure'
import type { AccountProvider } from '../../account/account.interface'

/**
 * @controller AuthController
 * @description Central authentication controller managing user authentication flows including OAuth providers, OTP verification, session management, and organization switching.
 *
 * This controller provides comprehensive authentication capabilities for the SaaS application:
 * - OAuth provider authentication (Google, GitHub)
 * - OTP-based email authentication
 * - Session management and validation
 * - Organization context switching
 * - Secure sign-out functionality
 *
 * All endpoints require the AuthFeatureProcedure which injects authentication context and methods.
 *
 * @example
 * ```typescript
 * // OAuth sign-in
 * const result = await api.auth.signInWithProvider.mutate({
 *   provider: 'google',
 *   callbackURL: '/dashboard'
 * })
 *
 * // OTP verification
 * await api.auth.sendOTPVerificationCode.mutate({
 *   email: 'user@example.com',
 *   type: 'sign-in'
 * })
 * ```
 */
export const AuthController = igniter.controller({
  name: 'Authentication',
  description: 'Authentication management',
  path: '/auth',
  actions: {
    /**
     * @action getActiveSocialProvider
     * @description Retrieves the list of active OAuth providers available for authentication.
     *
     * This endpoint returns a static list of supported OAuth providers. In a production environment,
     * this could be dynamically configured based on environment variables or database settings.
     *
     * @returns {string[]} Array of provider names currently supported
     * @example
     * ```typescript
     * const providers = await api.auth.getActiveSocialProvider.query()
     * // Returns: ['google', 'github']
     * ```
     */
    getActiveSocialProvider: igniter.query({
      name: 'getActiveSocialProvider',
      description: 'List available providers',
      method: 'GET',
      path: '/social-provider',
      use: [AuthFeatureProcedure()],
      handler: async ({ response }) => {
        // Business Logic: Return the list of currently supported OAuth providers
        // This is a static configuration that could be made dynamic in the future
        return response.success(['github'])
      },
    }),

    /**
     * @action signInWithProvider
     * @description Initiates OAuth authentication flow with the specified provider.
     *
     * This endpoint starts the OAuth authentication process by redirecting the user to the
     * provider's authentication page. The callback URL determines where the user will be
     * redirected after successful authentication.
     *
     * @param {string} provider - The OAuth provider to use (e.g., 'google', 'github')
     * @param {string} [callbackURL] - Optional custom callback URL after authentication
     * @returns {SignInResponse} Object containing redirect information
     * @throws {Error} When provider authentication fails
     * @example
     * ```typescript
     * const result = await api.auth.signInWithProvider.mutate({
     *   provider: 'google',
     *   callbackURL: '/dashboard'
     * })
     * // Returns: { redirect: true, url: 'https://accounts.google.com/oauth/...' }
     * ```
     */
    signInWithProvider: igniter.mutation({
      name: 'signInWithProvider',
      description: 'Sign in with OAuth provider',
      method: 'POST',
      path: '/sign-in',
      use: [AuthFeatureProcedure()],
      body: z.object({
        provider: z.string(),
        callbackURL: z.string().optional(),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract provider and callback URL from request body
        const { provider, callbackURL } = request.body

        // Business Logic: Initiate OAuth flow with the specified provider
        const result = await context.auth.signInWithProvider({
          provider: provider as AccountProvider,
          callbackURL,
        })

        // Business Rule: If authentication initiation fails, throw an error
        if (result.error) {
          throw new Error(result.error.code)
        }

        // Response: Return redirect information for client-side navigation
        return response.success(result.data)
      },
    }),

    /**
     * @action signInWithOTP
     * @description Authenticates a user using a one-time password (OTP) sent to their email.
     *
     * This endpoint verifies the OTP code that was previously sent to the user's email address.
     * The OTP must be valid and not expired for authentication to succeed.
     *
     * @param {string} email - The user's email address
     * @param {string} otpCode - The OTP code received via email
     * @returns {object} Success response with authentication result
     * @throws {400} When OTP is invalid or expired
     * @example
     * ```typescript
     * const result = await api.auth.signInWithOTP.mutate({
     *   email: 'user@example.com',
     *   otpCode: '123456'
     * })
     * ```
     */
    signInWithOTP: igniter.mutation({
      name: 'signInWithOtp',
      description: 'Sign in with OTP code',
      method: 'POST',
      path: '/sign-in/otp',
      use: [AuthFeatureProcedure()],
      body: z.object({
        email: z.string(),
        otpCode: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract email and OTP code from request body
        const { email, otpCode } = request.body

        // Business Logic: Verify OTP code with the authentication service
        const result = await context.auth.signInWithOTP({ email, otpCode })

        // Business Rule: If OTP verification fails, return bad request with error message
        if (result.error) {
          return response.badRequest(result.error.message)
        }

        // Response: Return success response with authentication data
        return response.success(result.data)
      },
    }),

    /**
     * @action sendOTPVerificationCode
     * @description Sends a one-time password (OTP) verification code to the user's email address.
     *
     * This endpoint generates and sends an OTP code to the specified email address for various
     * authentication purposes. The OTP has a limited validity period and can only be used once.
     *
     * @param {string} email - The email address to send the OTP to
     * @param {'sign-in'|'email-verification'|'forget-password'} type - The purpose of the OTP
     * @returns {object} Success response with the email address
     * @example
     * ```typescript
     * await api.auth.sendOTPVerificationCode.mutate({
     *   email: 'user@example.com',
     *   type: 'sign-in'
     * })
     * ```
     */
    sendOTPVerificationCode: igniter.mutation({
      name: 'sendOtpCode',
      description: 'Send OTP verification code',
      method: 'POST',
      path: '/send-otp-verification',
      use: [AuthFeatureProcedure()],
      body: z.object({
        email: z.string(),
        type: z.enum(['sign-in', 'email-verification', 'forget-password']),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract email and OTP type from request body
        const { email, type } = request.body

        // Business Logic: Send OTP verification code to the specified email
        await context.auth.sendOTPVerificationCode({ email, type })

        // Response: Return success response with the email address for confirmation
        return response.success({ email })
      },
    }),

    /**
     * @action signOut
     * @description Signs out the current user and invalidates their session.
     *
     * This endpoint securely terminates the user's authentication session by clearing
     * session data and cookies. After sign-out, the user will be redirected to the
     * specified callback URL.
     *
     * @returns {object} Success response with callback URL for redirection
     * @example
     * ```typescript
     * await api.auth.signOut.mutate()
     * // Returns: { callbackURL: '/' }
     * ```
     */
    signOut: igniter.mutation({
      name: 'signOut',
      description: 'Sign out current user',
      method: 'POST',
      path: '/sign-out',
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        // Business Logic: Sign out the current user and clear session data
        await context.auth.signOut()

        // Response: Return success response with callback URL for redirection
        return response.success({ callbackURL: '/' })
      },
    }),

    /**
     * @action getSession
     * @description Retrieves the current user's authentication session and organization context.
     *
     * This endpoint returns comprehensive session information including user details,
     * organization membership, and billing information. It handles both regular user
     * sessions and API key authentication.
     *
     * @returns {AppSession} Complete session object with user and organization data
     * @throws {401} When user is not authenticated
     * @throws {403} When user lacks required permissions or organization access
     * @example
     * ```typescript
     * const session = await api.auth.getSession.query()
     * // Returns: { user: {...}, organization: {...}, membership: {...} }
     * ```
     */
    getSession: igniter.query({
      name: 'getCurrentSession',
      description: 'Get current user session',
      method: 'GET',
      path: '/session',
      use: [AuthFeatureProcedure()],
      handler: async ({ response, context }) => {
        try {
          // Business Rule: Get session without requiring roles first (for new users without organization)
          const result = await context.auth.getSession({
            requirements: 'authenticated',
          })
          return response.success(result)
        } catch (error) {
          // Observation: Extract error message for proper error handling
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'

          // Business Logic: Map authentication errors to appropriate HTTP responses
          switch (errorMessage) {
            case 'UNAUTHORIZED':
              return response.unauthorized('Authentication required')
            case 'INSUFFICIENT_PERMISSIONS':
              return response.forbidden(
                'Insufficient permissions for this organization',
              )
            case 'NO_ORGANIZATION_ACCESS':
              return response.forbidden('Organization access required')
            case 'USER_NOT_FOUND':
              return response.unauthorized('User not found')
            case 'ALREADY_AUTHENTICATED':
              return response.badRequest('User is already authenticated')
            default:
              return response.badRequest('Failed to retrieve session')
          }
        }
      },
    }),

    /**
     * @action setActiveOrganization
     * @description Switches the user's active organization context.
     *
     * This endpoint allows users to switch between organizations they are members of.
     * The organization context affects data access, permissions, and billing information.
     *
     * @param {string} organizationId - The ID of the organization to switch to
     * @returns {object} Success response with the new active organization ID
     * @example
     * ```typescript
     * await api.auth.setActiveOrganization.mutate({
     *   organizationId: 'org_123'
     * })
     * // Returns: { organizationId: 'org_123' }
     * ```
     */
    setActiveOrganization: igniter.mutation({
      name: 'setActiveOrganization',
      description: 'Set active organization',
      method: 'POST',
      path: '/set-active-organization',
      use: [AuthFeatureProcedure()],
      body: z.object({
        organizationId: z.string(),
      }),
      handler: async ({ request, response, context }) => {
        // Observation: Extract organization ID from request body
        const { organizationId } = request.body

        // Business Logic: Switch the user's active organization context
        await context.auth.setActiveOrganization({ organizationId })

        // Response: Return success response with the new active organization ID
        return response.success({ organizationId })
      },
    }),
  },
})
