import { z } from 'zod'
import type {
  Organization,
  User,
  Member,
  Invitation,
  Subscription,
  Plan,
  Price,
  Session,
  Account,
  ApiKey,
} from '@prisma/client'

/**
 * @typedef AdminFilterOptions
 * @description Common filter options used across admin endpoints
 *
 * @property {number} [page] - Page number for pagination (1-based)
 * @property {number} [limit] - Number of items per page (default: 50, max: 100)
 * @property {string} [sortBy] - Field to sort by
 * @property {'asc'|'desc'} [sortOrder] - Sort order
 * @property {string} [search] - Search query string
 */
export type AdminFilterOptions = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

/**
 * @schema AdminFilterOptionsSchema
 * @description Zod schema for validating admin filter options
 */
export const AdminFilterOptionsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

/**
 * @typedef OrganizationFilters
 * @description Filter options specific to organization endpoints
 *
 * @property {string} [name] - Filter by organization name
 * @property {string} [slug] - Filter by organization slug
 * @property {'active'|'inactive'} [status] - Filter by subscription status
 * @property {Date} [createdAfter] - Filter organizations created after this date
 * @property {Date} [createdBefore] - Filter organizations created before this date
 */
export type OrganizationFilters = AdminFilterOptions & {
  name?: string
  slug?: string
  status?: 'active' | 'inactive'
  createdAfter?: Date
  createdBefore?: Date
}

/**
 * @schema OrganizationFiltersSchema
 * @description Zod schema for validating organization filter options
 */
export const OrganizationFiltersSchema = AdminFilterOptionsSchema.extend({
  name: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
})

/**
 * @typedef UserFilters
 * @description Filter options specific to user endpoints
 *
 * @property {string} [email] - Filter by user email
 * @property {string} [name] - Filter by user name
 * @property {'admin'|'owner'|'member'} [role] - Filter by user role
 * @property {boolean} [emailVerified] - Filter by email verification status
 * @property {'active'|'inactive'} [status] - Filter by user activity status
 * @property {Date} [lastActiveAfter] - Filter users active after this date
 * @property {Date} [createdAfter] - Filter users created after this date
 * @property {Date} [createdBefore] - Filter users created before this date
 */
export type UserFilters = AdminFilterOptions & {
  email?: string
  name?: string
  role?: 'admin' | 'owner' | 'member'
  emailVerified?: boolean
  status?: 'active' | 'inactive'
  lastActiveAfter?: Date
  createdAfter?: Date
  createdBefore?: Date
}

/**
 * @schema UserFiltersSchema
 * @description Zod schema for validating user filter options
 */
export const UserFiltersSchema = AdminFilterOptionsSchema.extend({
  email: z.string().email().optional(),
  name: z.string().optional(),
  role: z.enum(['admin', 'owner', 'member']).optional(),
  emailVerified: z.coerce.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  lastActiveAfter: z.string().datetime().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
})

/**
 * @typedef SubscriptionFilters
 * @description Filter options specific to subscription endpoints
 *
 * @property {string} [organizationId] - Filter by organization ID
 * @property {string} [customerId] - Filter by customer ID
 * @property {'active'|'canceled'|'past_due'|'incomplete'} [status] - Filter by subscription status
 * @property {string} [planId] - Filter by plan ID
 * @property {Date} [createdAfter] - Filter subscriptions created after this date
 * @property {Date} [createdBefore] - Filter subscriptions created before this date
 */
export type SubscriptionFilters = AdminFilterOptions & {
  organizationId?: string
  customerId?: string
  status?: 'active' | 'canceled' | 'past_due' | 'incomplete'
  planId?: string
  createdAfter?: Date
  createdBefore?: Date
}

/**
 * @schema SubscriptionFiltersSchema
 * @description Zod schema for validating subscription filter options
 */
export const SubscriptionFiltersSchema = AdminFilterOptionsSchema.extend({
  organizationId: z.string().uuid().optional(),
  customerId: z.string().optional(),
  status: z.enum(['active', 'canceled', 'past_due', 'incomplete']).optional(),
  planId: z.string().uuid().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
})

/**
 * @typedef PlanFilters
 * @description Filter options specific to plan endpoints
 *
 * @property {string} [name] - Filter by plan name
 * @property {string} [slug] - Filter by plan slug
 * @property {boolean} [archived] - Filter by archived status
 * @property {Date} [createdAfter] - Filter plans created after this date
 * @property {Date} [createdBefore] - Filter plans created before this date
 */
export type PlanFilters = AdminFilterOptions & {
  name?: string
  slug?: string
  archived?: boolean
  createdAfter?: Date
  createdBefore?: Date
}

/**
 * @schema PlanFiltersSchema
 * @description Zod schema for validating plan filter options
 */
export const PlanFiltersSchema = AdminFilterOptionsSchema.extend({
  name: z.string().optional(),
  slug: z.string().optional(),
  archived: z.coerce.boolean().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
})

// Response Types

/**
 * @typedef OrganizationWithDetails
 * @description Organization with related data for admin views
 */
export type OrganizationWithDetails = Organization & {
  _count?: {
    members: number
    invitations: number
    apiKeys: number
    webhooks: number
    integrations: number
    submissions: number
    leads: number
    notifications: number
  }
  members?: AdminOrganizationMember[]
  invitations?: AdminOrganizationInvitation[]
  apiKeys?: ApiKey[]
  customer?: {
    subscriptions?: AdminOrganizationSubscription[]
  }
}

/**
 * @typedef UserWithDetails
 * @description User with related data for admin views
 */
export type AdminUserMembership = Member & {
  organization?: Pick<Organization, 'id' | 'name' | 'slug' | 'createdAt'>
}

export type AdminUserInvitation = Invitation & {
  organization?: Pick<Organization, 'id' | 'name' | 'slug'>
  user?: Pick<User, 'id' | 'name' | 'email'>
}

export type AdminOrganizationMember = Member & {
  user?: Pick<User, 'id' | 'name' | 'email' | 'image' | 'role' | 'createdAt'>
}

export type AdminOrganizationInvitation = Invitation & {
  user?: Pick<User, 'id' | 'name' | 'email'>
}

export type AdminOrganizationSubscription = Subscription & {
  price?: Price & {
    plan?: Plan
  }
}

export type AdminUserSession = Pick<Session, 'id' | 'createdAt' | 'expiresAt'> & {
  updatedAt?: Session['updatedAt']
  token?: Session['token']
  ipAddress?: Session['ipAddress']
  userAgent?: Session['userAgent']
  activeOrganizationId?: Session['activeOrganizationId']
}

export type AdminUserAccount = Pick<
  Account,
  'id' | 'providerId' | 'accountId'
> & {
  createdAt?: Account['createdAt']
  updatedAt?: Account['updatedAt']
  accessToken?: Account['accessToken'] | null
  refreshToken?: Account['refreshToken'] | null
  accessTokenExpiresAt?: Account['accessTokenExpiresAt'] | null
  refreshTokenExpiresAt?: Account['refreshTokenExpiresAt'] | null
  scope?: Account['scope'] | null
}

export type UserWithDetails = User & {
  _count?: {
    members: number
    invitations: number
    sessions: number
    accounts: number
    notifications: number
  }
  members?: AdminUserMembership[]
  invitations?: AdminUserInvitation[]
  sessions?: AdminUserSession[]
  accounts?: AdminUserAccount[]
}

/**
 * @typedef SubscriptionWithDetails
 * @description Subscription with related data for admin views
 */
export type SubscriptionWithDetails = Subscription & {
  customer?: {
    organization?: Organization
  }
  price?: Price & {
    plan?: Plan
  }
}

/**
 * @typedef PlanWithDetails
 * @description Plan with related data for admin views
 */
export type PlanWithDetails = Plan & {
  _count?: {
    prices: number
  }
  prices?: Price[]
}

/**
 * @typedef PaginatedResponse
 * @description Standard paginated response format
 *
 * @template T - The type of items in the response
 * @property {T[]} data - Array of items
 * @property {number} total - Total number of items
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total number of pages
 */
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * @typedef StatisticsOverview
 * @description General system overview statistics
 *
 * @property {number} totalUsers - Total number of users
 * @property {number} totalOrganizations - Total number of organizations
 * @property {number} totalSubscriptions - Total number of subscriptions
 * @property {number} totalRevenue - Total revenue (in cents)
 * @property {number} activeUsers - Number of active users
 * @property {number} activeOrganizations - Number of active organizations
 * @property {Date} lastUpdated - When statistics were last calculated
 */
export type StatisticsOverview = {
  totalUsers: number
  totalOrganizations: number
  totalSubscriptions: number
  totalRevenue: number
  activeUsers: number
  activeOrganizations: number
  lastUpdated: Date
}

/**
 * @typedef UserRoleDistribution
 * @description Distribution of users by role
 *
 * @property {number} admin - Number of admin users
 * @property {number} owner - Number of owner users
 * @property {number} member - Number of member users
 * @property {number} total - Total number of users
 */
export type UserRoleDistribution = {
  admin: number
  owner: number
  member: number
  total: number
}

/**
 * @typedef OrganizationSizeDistribution
 * @description Distribution of organizations by size
 *
 * @property {number} small - Organizations with 1-10 members
 * @property {number} medium - Organizations with 11-50 members
 * @property {number} large - Organizations with 51-200 members
 * @property {number} enterprise - Organizations with 200+ members
 * @property {number} total - Total number of organizations
 */
export type OrganizationSizeDistribution = {
  small: number
  medium: number
  large: number
  enterprise: number
  total: number
}

/**
 * @typedef SubscriptionStatusDistribution
 * @description Distribution of subscriptions by status
 *
 * @property {number} active - Number of active subscriptions
 * @property {number} canceled - Number of canceled subscriptions
 * @property {number} past_due - Number of past due subscriptions
 * @property {number} incomplete - Number of incomplete subscriptions
 * @property {number} total - Total number of subscriptions
 */
export type SubscriptionStatusDistribution = {
  active: number
  canceled: number
  past_due: number
  incomplete: number
  total: number
}

/**
 * @typedef RevenueMetrics
 * @description Revenue-related metrics
 *
 * @property {number} mrr - Monthly Recurring Revenue (in cents)
 * @property {number} arr - Annual Recurring Revenue (in cents)
 * @property {number} totalRevenue - Total revenue (in cents)
 * @property {number} averageRevenuePerUser - ARPU (in cents)
 * @property {number} averageRevenuePerOrganization - ARPO (in cents)
 */
export type RevenueMetrics = {
  mrr: number
  arr: number
  totalRevenue: number
  averageRevenuePerUser: number
  averageRevenuePerOrganization: number
}

/**
 * @typedef GrowthMetrics
 * @description Growth-related metrics over time
 *
 * @property {Array<{ date: Date; value: number }>} data - Time series data
 * @property {number} current - Current value
 * @property {number} previous - Previous period value
 * @property {number} growth - Growth percentage
 * @property {number} growthRate - Growth rate (percentage per period)
 */
export type GrowthMetrics = {
  data: Array<{ date: Date; value: number }>
  current: number
  previous: number
  growth: number
  growthRate: number
}

// Statistics Query Types

/**
 * @typedef OverviewStatsQuery
 * @description Query parameters for overview statistics
 *
 * @property {'daily'|'weekly'|'monthly'} period - Period type for time-series data
 * @property {number} [days] - Number of days to look back (default: 30, for daily)
 * @property {number} [weeks] - Number of weeks to look back (default: 12, for weekly)
 * @property {number} [months] - Number of months to look back (default: 12, for monthly)
 */
export type OverviewStatsQuery = {
  period: 'daily' | 'weekly' | 'monthly'
  days?: number
  weeks?: number
  months?: number
}

/**
 * @schema OverviewStatsQuerySchema
 * @description Zod schema for validating overview statistics query parameters
 */
export const OverviewStatsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']),
  days: z.coerce.number().int().positive().default(30).optional(),
  weeks: z.coerce.number().int().positive().default(12).optional(),
  months: z.coerce.number().int().positive().default(12).optional(),
})

// Statistics Response Types

/**
 * @typedef OverviewStatsData
 * @description Time-series statistics data for overview
 *
 * @property {Date} date - Date for daily statistics
 * @property {Date} week - Date for weekly statistics
 * @property {Date} month - Date for monthly statistics
 * @property {number} users - Number of users
 * @property {number} organizations - Number of organizations
 * @property {number} subscriptions - Number of subscriptions
 * @property {number} revenue - Revenue amount (in cents)
 */
export type OverviewStatsData = {
  date?: Date
  week?: Date
  month?: Date
  users: number
  organizations: number
  subscriptions: number
  revenue: number
}
