/**
 * Data transfer object for creating a new Plan.
 */
export interface CreatePlanDTO {
  /** Id's id property  */
  id: string
  /** Slug's slug property  */
  slug: string
  /** Name's name property  */
  name: string
  /** Description's description property  */
  description: string | null
  /** Metadata's metadata property  */
  metadata: any | null
  /** Array of IDs for the Price relationships to be created */
  pricesIds?: string[]
  /** CreatedAt's createdAt property  */
  createdAt: Date
  /** UpdatedAt's updatedAt property  */
  updatedAt: Date
  /** Archived's archived property  */
  archived: boolean
}

/**
 * Data transfer object for updating an existing Plan.
 */
export interface UpdatePlanDTO {
  /** Id's id property  */
  id?: string
  /** Slug's slug property  */
  slug?: string
  /** Name's name property  */
  name?: string
  /** Description's description property  */
  description?: string | null
  /** Metadata's metadata property  */
  metadata?: any | null
  /** Array of IDs for the Price relationships to be created */
  pricesIds?: string[]
  /** CreatedAt's createdAt property  */
  createdAt?: Date
  /** UpdatedAt's updatedAt property  */
  updatedAt?: Date
  /** Archived's archived property  */
  archived?: boolean
}

/**
 * Query parameters for fetching Category entities
 */
export interface PlanQueryParams {
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
