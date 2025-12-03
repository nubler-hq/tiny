import type { Prettify } from '@igniter-js/core'
import type { AccountProvider } from '../account/account.interface'
import type { User } from '../user/user.interface'
import type { OrganizationMetadata } from '../organization/organization.interface'
import type { Customer } from '@/@saas-boilerplate/providers/payment'
import type { auth, AuthOrganization } from '@/services/auth'

/**
 * @typedef OrganizationMembershipRole
 * @description Defines the available roles for organization membership.
 *
 * These roles determine the level of access and permissions a user has within an organization:
 * - `owner`: Full administrative access, can manage billing, delete organization
 * - `admin`: Administrative access, can manage users and settings
 * - `member`: Basic access, can view and interact with organization resources
 *
 * @example
 * ```typescript
 * const userRole: OrganizationMembershipRole = 'admin'
 * ```
 */
export type OrganizationMembershipRole = 'owner' | 'admin' | 'member'

/**
 * @typedef AuthRequirements
 * @description Defines the authentication requirements for API endpoints.
 *
 * These requirements control access to protected resources:
 * - `authenticated`: Requires a valid user session or API key
 * - `unauthenticated`: Allows access without authentication (public endpoints)
 * - `super-authenticated`: Requires a valid user session and a 'super_admin' role
 *
 * @example
 * ```typescript
 * const requirements: AuthRequirements = 'authenticated'
 * ```
 */
export type AuthRequirements =
  | 'authenticated'
  | 'unauthenticated'
  | 'super-authenticated'

/**
 * @typedef SessionActiveOrganization
 * @description Represents an organization with billing and metadata information in a session context.
 *
 * This type extends the base AuthOrganization with additional billing information
 * and properly typed metadata for use in authentication sessions.
 *
 * @property {Customer} billing - Stripe billing information for the organization
 * @property {OrganizationMetadata} metadata - Parsed organization metadata
 */
type SessionActiveOrganization = Omit<AuthOrganization, 'metadata'> & {
  billing: Customer
  metadata: OrganizationMetadata
}

/**
 * @typedef Session
 * @description Represents a complete authentication session with user and organization context.
 *
 * This type provides a strongly-typed session object that includes user information
 * and organization context. The organization property is conditionally required based
 * on the roles parameter.
 *
 * @template TRoles - Array of required organization membership roles
 *
 * @property {User} user - The authenticated user information
 * @property {SessionActiveOrganization} [organization] - Organization context (required if roles specified)
 *
 * @example
 * ```typescript
 * // Session with optional organization
 * const session: Session = { user: {...}, organization: {...} }
 *
 * // Session requiring specific roles (organization becomes required)
 * const adminSession: Session<['admin', 'owner']> = { user: {...}, organization: {...} }
 * ```
 */
export type Session<
  TRoles extends OrganizationMembershipRole[] | undefined = undefined,
> = Prettify<
  Omit<typeof auth.$Infer.Session, 'user'> &
    (TRoles extends OrganizationMembershipRole[]
      ? { user: User; organization: SessionActiveOrganization }
      : { user: User; organization?: SessionActiveOrganization })
>

/**
 * @typedef AppSession
 * @description Represents an application session with conditional authentication requirements.
 *
 * This type provides a session object that is conditionally available based on
 * authentication requirements. For unauthenticated requirements, the session is null.
 *
 * @template TRequirements - Authentication requirements
 * @template TRoles - Array of required organization membership roles
 *
 * @example
 * ```typescript
 * // Authenticated session
 * const session: AppSession<'authenticated'> = { user: {...}, organization: {...} }
 *
 * // Unauthenticated session (null)
 * const publicSession: AppSession<'unauthenticated'> = null
 *
 * // Session with role requirements
 * const adminSession: AppSession<'authenticated', ['admin']> = { user: {...}, organization: {...} }
 * ```
 */
export type AppSession<
  TRequirements extends AuthRequirements | undefined = undefined,
  TRoles extends OrganizationMembershipRole[] | undefined = undefined,
> = TRequirements extends 'authenticated' ? Session<TRoles> : null

/**
 * @typedef SignInInput
 * @description Input parameters for OAuth provider authentication.
 *
 * This type defines the required and optional parameters for initiating
 * OAuth authentication flows with external providers.
 *
 * @property {AccountProvider} provider - The OAuth provider to use for authentication
 * @property {string} [callbackURL] - Optional custom callback URL after authentication
 *
 * @example
 * ```typescript
 * const signInData: SignInInput = {
 *   provider: 'google',
 *   callbackURL: '/dashboard'
 * }
 * ```
 */
export type SignInInput = {
  provider: AccountProvider
  callbackURL?: string
}

/**
 * @typedef SendVerificationOTPInput
 * @description Input parameters for sending OTP verification codes.
 *
 * This type defines the parameters required to send one-time password
 * verification codes to users via email for various authentication purposes.
 *
 * @property {string} email - The email address to send the OTP to
 * @property {'sign-in'|'email-verification'|'forget-password'} type - The purpose of the OTP
 *
 * @example
 * ```typescript
 * const otpData: SendVerificationOTPInput = {
 *   email: 'user@example.com',
 *   type: 'sign-in'
 * }
 * ```
 */
export type SendVerificationOTPInput = {
  email: string
  type: 'sign-in' | 'email-verification' | 'forget-password'
}

/**
 * @typedef SignInResponse
 * @description Response data for OAuth provider authentication.
 *
 * This type represents the response returned after initiating an OAuth
 * authentication flow, containing redirect information for client-side navigation.
 *
 * @property {boolean} redirect - Whether the client should redirect to the provided URL
 * @property {string|undefined} url - The URL to redirect to (if redirect is true)
 *
 * @example
 * ```typescript
 * const response: SignInResponse = {
 *   redirect: true,
 *   url: 'https://accounts.google.com/oauth/authorize?...'
 * }
 * ```
 */
export type SignInResponse = {
  redirect: boolean
  url: string | undefined
}

/**
 * @typedef SignOutResponse
 * @description Response data for user sign-out operations.
 *
 * This type represents the response returned after a successful sign-out
 * operation, confirming that the user's session has been terminated.
 *
 * @property {boolean} success - Whether the sign-out operation was successful
 *
 * @example
 * ```typescript
 * const response: SignOutResponse = {
 *   success: true
 * }
 * ```
 */
export type SignOutResponse = {
  success: boolean
}

/**
 * @typedef GetSessionInput
 * @description Input parameters for retrieving authentication sessions.
 *
 * This type defines the optional parameters for session retrieval, including
 * authentication requirements and role-based access control validation.
 *
 * @template TRequirements - Authentication requirements
 * @template TRoles - Array of required organization membership roles
 *
 * @property {TRequirements} [requirements] - Authentication requirements for the session
 * @property {TRoles} [roles] - Required organization membership roles
 *
 * @example
 * ```typescript
 * // Basic authenticated session
 * const input: GetSessionInput<'authenticated'> = {
 *   requirements: 'authenticated'
 * }
 *
 * // Session with role requirements
 * const adminInput: GetSessionInput<'authenticated', ['admin', 'owner']> = {
 *   requirements: 'authenticated',
 *   roles: ['admin', 'owner']
 * }
 * ```
 */
export type GetSessionInput<
  TRequirements extends AuthRequirements | undefined = undefined,
  TRoles extends OrganizationMembershipRole[] | undefined = undefined,
> = {
  requirements?: TRequirements
  roles?: TRoles
}
