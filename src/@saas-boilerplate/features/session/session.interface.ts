import type { User } from '../user/user.interface'

/**
 * Represents a Session entity.
 */
export interface Session {
  /** Id's id property */
  id: string
  /** ExpiresAt's expiresAt property */
  expiresAt: Date
  /** Token's token property */
  token: string
  /** CreatedAt's createdAt property */
  createdAt: Date
  /** UpdatedAt's updatedAt property */
  updatedAt: Date
  /** IpAddress's ipAddress property */
  ipAddress: string | null
  /** UserAgent's userAgent property */
  userAgent: string | null
  /** UserId's userId property */
  userId: string
  /** Related User entity */
  user: User
  /** ActiveOrganizationId's activeOrganizationId property */
  activeOrganizationId: string | null
}

/**
 * Data transfer object for creating a new Session.
 */
export interface CreateSessionDTO {
  /** Id's id property  */
  id: string
  /** ExpiresAt's expiresAt property  */
  expiresAt: Date
  /** Token's token property  */
  token: string
  /** CreatedAt's createdAt property  */
  createdAt: Date
  /** UpdatedAt's updatedAt property  */
  updatedAt: Date
  /** IpAddress's ipAddress property  */
  ipAddress?: string | null
  /** UserAgent's userAgent property  */
  userAgent?: string | null
  /** UserId's userId property  */
  userId: string
  /** ActiveOrganizationId's activeOrganizationId property  */
  activeOrganizationId?: string | null
}

/**
 * Data transfer object for updating an existing Session.
 */
export interface UpdateSessionDTO {
  /** Id's id property  */
  id?: string
  /** ExpiresAt's expiresAt property  */
  expiresAt?: Date
  /** Token's token property  */
  token?: string
  /** CreatedAt's createdAt property  */
  createdAt?: Date
  /** UpdatedAt's updatedAt property  */
  updatedAt?: Date
  /** IpAddress's ipAddress property  */
  ipAddress?: string | null
  /** UserAgent's userAgent property  */
  userAgent?: string | null
  /** UserId's userId property  */
  userId?: string
  /** ActiveOrganizationId's activeOrganizationId property  */
  activeOrganizationId?: string | null
}

/**
 * Query parameters for fetching Category entities
 */
export interface SessionQueryParams {
  /** Current page number for pagination */
  page?: number
  /** Number of items to return per page */
  limit?: number
  /** Property to sort by */
  sortBy?: string
  /** Sort order */
  sortOrder?: 'asc' | 'desc'
  /** Search term for filtering */
  search?: string
}
