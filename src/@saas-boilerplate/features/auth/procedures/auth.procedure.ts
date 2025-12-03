import { igniter } from '@/igniter'
import { Url } from '@/@saas-boilerplate/utils/url'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'

import type {
  AppSession,
  AuthRequirements,
  GetSessionInput,
  OrganizationMembershipRole,
  SendVerificationOTPInput,
  SignInInput,
} from '../auth.interface'
import { parseMetadata } from '@/utils/parse-metadata'
import type { OrganizationMetadata } from '../../organization/organization.interface'
import type { UserMetadata } from '../../user/user.interface'
import { isPaymentEnabled } from '../../billing/presentation/utils/is-payment-enabled'

/**
 * @procedure AuthFeatureProcedure
 * @description Core authentication procedure that injects comprehensive authentication context and methods into the Igniter context.
 *
 * This procedure provides a centralized authentication layer that handles:
 * - OAuth provider authentication flows
 * - OTP-based email authentication
 * - Session management and validation
 * - API key authentication for programmatic access
 * - Organization context switching
 * - Role-based access control (RBAC)
 * - User metadata parsing and organization billing integration
 *
 * The procedure extends the Igniter context with an `auth` object containing all authentication methods,
 * making them available to downstream controllers and actions.
 *
 * @returns {AuthContext} Object containing authentication methods and context
 *
 * @example
 * ```typescript
 * // In a controller action
 * const session = await context.auth.getSession({
 *   requirements: 'authenticated',
 *   roles: ['admin', 'owner']
 * })
 * ```
 */
export const AuthFeatureProcedure = igniter.procedure({
  name: 'AuthFeatureProcedure',
  handler: async (options, { request, context }) => {
    return {
      auth: {
        /**
         * @method setActiveOrganization
         * @description Switches the user's active organization context.
         *
         * This method updates the user's session to use the specified organization as their
         * active context. This affects data access, permissions, and billing information.
         *
         * @param {object} input - Organization switching parameters
         * @param {string} input.organizationId - The ID of the organization to switch to
         * @returns {Promise<void>} Promise that resolves when organization is switched
         * @throws {Error} When organization switching fails
         */
        setActiveOrganization: async (input: { organizationId: string }) => {
          // Business Logic: Switch the user's active organization using the auth service
          await tryCatch(
            context.services.auth.api.setActiveOrganization({
              body: input,
              headers: request.headers,
            }),
          )
        },

        /**
         * @method listSession
         * @description Retrieves all active sessions for the current user.
         *
         * This method returns a list of all active authentication sessions associated
         * with the current user, including session metadata and expiration information.
         *
         * @returns {Promise<object>} Promise that resolves to session list or error
         * @throws {Error} When session listing fails
         */
        listSession: async () => {
          // Business Logic: Retrieve all active sessions for the current user
          return tryCatch(
            context.services.auth.api.listSessions({
              headers: request.headers,
            }),
          )
        },

        /**
         * @method signInWithProvider
         * @description Initiates OAuth authentication flow with the specified provider.
         *
         * This method starts the OAuth authentication process by calling the auth service
         * with the appropriate callback URLs for different scenarios (success, new user, error).
         *
         * @param {SignInInput} input - OAuth provider and callback configuration
         * @param {AccountProvider} input.provider - The OAuth provider to use
         * @param {string} [input.callbackURL] - Custom callback URL after authentication
         * @returns {Promise<object>} Promise that resolves to redirect data or error
         * @throws {Error} When OAuth initiation fails
         */
        signInWithProvider: async (input: SignInInput) => {
          // Business Logic: Initiate OAuth flow with configured callback URLs
          const result = await tryCatch(
            context.services.auth.api.signInSocial({
              headers: request.headers,
              body: {
                provider: input.provider,
                callbackURL: Url.get('/app'),
                newUserCallbackURL: Url.get('/app/get-started'),
                errorCallbackURL: Url.get('/auth?error=true'),
              },
            }),
          )

          // Business Rule: If OAuth initiation fails, return structured error response
          if (result.error) {
            console.error(result.error.message, {
              input,
              result,
            })

            return {
              error: {
                code: 'ERR_BAD_REQUEST',
                message: result.error.message,
              },
            }
          }

          // Response: Return redirect information for client-side navigation
          return {
            data: {
              redirect: true,
              url: result.data.url,
            },
          }
        },

        /**
         * @method signInWithOTP
         * @description Authenticates a user using a one-time password (OTP) sent to their email.
         *
         * This method verifies the OTP code that was previously sent to the user's email address.
         * The OTP must be valid and not expired for authentication to succeed.
         *
         * @param {object} input - OTP authentication parameters
         * @param {string} input.email - The user's email address
         * @param {string} input.otpCode - The OTP code received via email
         * @returns {Promise<object>} Promise that resolves to success data or error
         * @throws {Error} When OTP verification fails
         */
        signInWithOTP: async (input: { email: string; otpCode: string }) => {
          // Business Logic: Verify OTP code with the authentication service
          const result = await tryCatch(
            context.services.auth.api.signInEmailOTP({
              headers: request.headers,
              body: {
                email: input.email,
                otp: input.otpCode,
              },
            }),
          )

          // Business Rule: If OTP verification fails, return structured error response
          if (result.error) {
            console.error(result.error.message, {
              input,
              result,
            })

            return {
              error: {
                code: 'ERR_BAD_REQUEST',
                message: result.error.message,
              },
            }
          }

          // Response: Return success confirmation
          return {
            data: {
              success: true,
            },
          }
        },

        /**
         * @method sendOTPVerificationCode
         * @description Sends a one-time password (OTP) verification code to the user's email address.
         *
         * This method generates and sends an OTP code to the specified email address for various
         * authentication purposes. The OTP has a limited validity period and can only be used once.
         *
         * @param {SendVerificationOTPInput} input - OTP sending parameters
         * @param {string} input.email - The email address to send the OTP to
         * @param {'sign-in'|'email-verification'|'forget-password'} input.type - The purpose of the OTP
         * @returns {Promise<object>} Promise that resolves to success data or error
         * @throws {Error} When OTP sending fails
         */
        sendOTPVerificationCode: async (input: SendVerificationOTPInput) => {
          // Business Logic: Send OTP verification code to the specified email
          const result = await tryCatch(
            context.services.auth.api.sendVerificationOTP({
              headers: request.headers,
              body: input,
            }),
          )

          // Business Rule: If OTP sending fails, return structured error response
          if (result.error) {
            return {
              error: {
                code: 'ERR_BAD_REQUEST',
                message: result.error.message,
              },
            }
          }

          // Response: Return success confirmation
          return {
            data: {
              success: true,
            },
          }
        },

        /**
         * @method signOut
         * @description Signs out the current user and invalidates their session.
         *
         * This method securely terminates the user's authentication session by clearing
         * session data and cookies through the authentication service.
         *
         * @returns {Promise<void>} Promise that resolves when sign-out is complete
         * @throws {Error} When sign-out fails
         */
        signOut: async () => {
          // Business Logic: Sign out the current user and clear session data
          await tryCatch(
            context.services.auth.api.signOut({
              headers: request.headers,
            }),
          )
        },

        /**
         * @method getSession
         * @description Retrieves the current user's authentication session with comprehensive validation and context.
         *
         * This is the core authentication method that handles:
         * - Regular user session authentication
         * - API key authentication for programmatic access
         * - Organization context resolution and validation
         * - Role-based access control (RBAC) validation
         * - User metadata parsing and organization billing integration
         * - Automatic organization switching for users with multiple memberships
         *
         * The method supports both authenticated and unauthenticated requirements, and can validate
         * specific roles within the user's organization context.
         *
         * @template TRequirements - Authentication requirements ('authenticated' | 'unauthenticated')
         * @template TRoles - Required organization membership roles
         * @param {GetSessionInput<TRequirements, TRoles>} [options] - Session retrieval options
         * @param {TRequirements} [options.requirements] - Authentication requirements
         * @param {TRoles} [options.roles] - Required organization roles
         * @returns {Promise<AppSession<TRequirements, TRoles>>} Complete session object or null
         * @throws {Error} When authentication fails or requirements are not met
         *
         * @example
         * ```typescript
         * // Get authenticated session
         * const session = await context.auth.getSession({
         *   requirements: 'authenticated'
         * })
         *
         * // Get session with role validation
         * const adminSession = await context.auth.getSession({
         *   requirements: 'authenticated',
         *   roles: ['admin', 'owner']
         * })
         * ```
         */
        getSession: async <
          TRequirements extends AuthRequirements | undefined = undefined,
          TRoles extends OrganizationMembershipRole[] | undefined = undefined,
        >(
          options?: GetSessionInput<TRequirements, TRoles>,
        ): Promise<AppSession<TRequirements, TRoles>> => {
          // Business Logic: Retrieve the current user session from the authentication service
          const session = await context.services.auth.api.getSession({
            headers: request.headers,
          })

          // Security Rule: Check for API Key authentication if no regular session exists
          let apiKeyOrganization = null
          if (!session) {
            // Observation: Extract Authorization header for API key validation
            const authHeader = request.headers.get('Authorization')

            // Business Rule: Validate Bearer token format for API key authentication
            if (authHeader && authHeader.startsWith('Bearer ')) {
              // Data Transformation: Extract token by removing 'Bearer ' prefix
              const token = authHeader.substring(7)

              // Business Logic: Validate API Key in database
              const apiKey = await context.services.database.apiKey.findUnique({
                where: {
                  key: token,
                  enabled: true,
                },
                include: {
                  organization: true,
                },
              })

              if (apiKey) {
                // Security Rule: Check if API key is expired (unless it never expires)
                if (
                  !apiKey.neverExpires &&
                  apiKey.expiresAt &&
                  new Date() > apiKey.expiresAt
                ) {
                  throw new Error('API_KEY_EXPIRED')
                }

                // Business Rule: API Key authentication requires organization endpoints with roles
                if (!options?.roles || options.roles.length === 0) {
                  throw new Error('API_KEY_REQUIRES_ORGANIZATION_ENDPOINT')
                }

                // Context Extension: Store organization for API key authentication
                apiKeyOrganization = apiKey.organization
              }
            }
          }

          // Business Rule: Handle unauthenticated requirement (for public endpoints)
          if (options?.requirements === 'unauthenticated') {
            // Security Rule: If user is already authenticated, throw error
            if (session || apiKeyOrganization) {
              throw new Error('ALREADY_AUTHENTICATED')
            }
            return null as any
          }

          // Business Rule: Handle authenticated requirement
          if (
            options?.requirements === 'authenticated' &&
            !session &&
            !apiKeyOrganization
          ) {
            throw new Error('UNAUTHORIZED')
          }

          // Business Rule: If no session and no API key organization, return null
          if (!session && !apiKeyOrganization) {
            return null as AppSession<TRequirements, TRoles>
          }

          // Business Logic: Handle API Key authentication (programmatic access)
          if (apiKeyOrganization && !session) {
            // Context Extension: Create virtual session for API key authentication
            const organization = apiKeyOrganization

            // Data Transformation: Parse organization metadata from JSON
            organization.metadata = organization.metadata
              ? JSON.parse(organization.metadata)
              : {}

            // Business Logic: Get current organization billing information (if payment is enabled)
            const billing = isPaymentEnabled()
              ? await context.services.payment.getCustomerById(organization.id)
              : null

            // Response: Return API key session with organization context (no user)
            return {
              user: null, // No user for API Key authentication
              organization: {
                ...organization,
                billing,
              },
            } as any
          }

          // Business Logic: Handle regular session authentication
          if (!session) {
            return null as AppSession<TRequirements, TRoles>
          }

          // Business Logic: Retrieve user details from database
          const user = await context.services.database.user.findUnique({
            where: { id: session.user.id },
          })

          // Data Transformation: Parse user metadata if user exists
          if (user) {
            user.metadata = parseMetadata<UserMetadata>(user.metadata)
          }

          // Business Rule: If user not found, throw error
          if (!user) {
            throw new Error('USER_NOT_FOUND')
          }

          // Business Logic: Get the user's active organization
          let organization =
            await context.services.auth.api.getFullOrganization({
              headers: request.headers,
            })

          // Business Rule: If no active organization, try to set one automatically
          if (!organization) {
            // Business Logic: Get all organizations the user is a member of
            const userOrganizations =
              await context.services.auth.api.listOrganizations({
                headers: request.headers,
              })

            // Business Rule: If user has organizations, set the first one as active
            if (userOrganizations.length > 0) {
              // Business Logic: Switch to the first available organization
              await context.services.auth.api.setActiveOrganization({
                body: { organizationId: userOrganizations[0].id },
                headers: request.headers,
              })

              // Business Logic: Get the full organization details after switching
              organization =
                await context.services.auth.api.getFullOrganization({
                  query: { organizationId: userOrganizations[0].id },
                  headers: request.headers,
                })
            }
          }

          // Business Logic: Get the user's active membership in the current organization
          const membership = await context.services.auth.api.getActiveMember({
            headers: request.headers,
          })

          // Security Rule: Validate roles if specified (only for regular session authentication)
          if (options?.roles && options.roles.length > 0 && session) {
            // Business Rule: User must have organization access and membership
            if (!organization || !membership) {
              throw new Error('NO_ORGANIZATION_ACCESS')
            }

            // Security Rule: User must have one of the required roles
            if (
              !options.roles.includes(
                membership.role as OrganizationMembershipRole,
              )
            ) {
              throw new Error('INSUFFICIENT_PERMISSIONS')
            }
          }

          // Business Rule: If roles are required but no organization, throw error (only for regular session)
          if (
            options?.roles &&
            options.roles.length > 0 &&
            !organization &&
            session
          ) {
            throw new Error('NO_ORGANIZATION_ACCESS')
          }

          // Business Rule: If no organization, return session without organization context
          if (!organization) {
            return {
              ...session,
              user,
              organization: undefined,
            } as any
          }

          // Data Transformation: Parse organization metadata from JSON
          organization.metadata = parseMetadata<OrganizationMetadata>(
            organization.metadata,
          )

          // Business Logic: Get current organization billing information (if payment is enabled)
          const billing = isPaymentEnabled()
            ? await context.services.payment.getCustomerById(organization.id)
            : null

          // Security Rule: Handle 'super-authenticated' requirement by checking user's global role
          if (options?.requirements === 'super-authenticated') {
            if (user.role !== 'admin') {
              throw new Error('INSUFFICIENT_PERMISSIONS_SUPER_ADMIN')
            }
          }

          // Response: Return complete session with user, organization, and billing data
          return {
            ...session,
            user,
            organization: {
              ...organization,
              billing,
            },
          } as any
        },
      },
    }
  },
})