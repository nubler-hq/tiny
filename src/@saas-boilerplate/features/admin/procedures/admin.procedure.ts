import { igniter } from '@/igniter'

/**
 * @typedef AdminContext
 * @description Context extension for admin-related repositories and services
 *
 * @property {object} admin - Admin feature context container
 * @property {object} admin.organization - Organization-related database operations
 * @property {object} admin.user - User-related database operations
 * @property {object} admin.member - Member-related database operations
 * @property {object} admin.invitation - Invitation-related database operations
 * @property {object} admin.subscription - Subscription-related database operations
 * @property {object} admin.apiKey - API key-related database operations
 * @property {object} admin.account - Account-related database operations
 */
export type AdminContext = {
  admin: {
    organization: {
      findMany: (filters: any) => Promise<any[]>
      findUnique: (id: string) => Promise<any | null>
      findMemberships: (id: string) => Promise<any[]>
      findSubscriptions: (id: string) => Promise<any[]>
      findInvites: (id: string) => Promise<any[]>
      findStats: (id: string) => Promise<any>
      findActivity: (id: string) => Promise<any[]>
      count: (filters: any) => Promise<number>
      groupBy: (filters: any) => Promise<any[]>
      aggregate: (filters: any) => Promise<any>
    }
    user: {
      findMany: (filters: any) => Promise<any[]>
      findUnique: (id: string) => Promise<any | null>
      findMemberships: (id: string) => Promise<any[]>
      findAccounts: (id: string) => Promise<any[]>
      findSessions: (id: string) => Promise<any[]>
      count: (filters: any) => Promise<number>
    }
    member: {
      findMany: (filters: any) => Promise<any[]>
      count: (filters: any) => Promise<number>
      groupBy: (filters: any) => Promise<any[]>
    }
    invitation: {
      findMany: (filters: any) => Promise<any[]>
      count: (filters: any) => Promise<number>
    }
    subscription: {
      findMany: (filters: any) => Promise<any[]>
      findUnique: (id: string) => Promise<any | null>
      count: (filters: any) => Promise<number>
    }
    apiKey: {
      findMany: (filters: any) => Promise<any[]>
      count: (filters: any) => Promise<number>
    }
    account: {
      findMany: (filters: any) => Promise<any[]>
      count: (filters: any) => Promise<number>
    }
  }
}

/**
 * @procedure AdminProcedure
 * @description Igniter.js procedure that injects admin-related repositories into the context
 *
 * This procedure provides access to all administrative database operations for organizations,
 * users, members, invitations, subscriptions, API keys, and accounts. It follows the
 * hierarchical context pattern for consistent access across controllers.
 *
 * @returns {AdminContext} Object containing admin repositories in hierarchical structure
 *
 * @example
 * ```typescript
 * // In a controller action
 * const organizations = await context.admin.organization.findMany({})
 * const user = await context.admin.user.findUnique(userId)
 * ```
 */
export const AdminProcedure = igniter.procedure({
  name: 'AdminProcedure',
  handler: async (_, { context }) => {
    // Context Extension: Return admin repositories in hierarchical structure
    return {
      admin: {
        organization: {
          /**
           * @method count
           * @description Count organizations with optional filtering
           * @param {any} filters - Filter criteria for organizations
           * @returns {Promise<number>} Number of organizations
           */
          count: async (filters: any) => {
            // Business Logic: Count organizations with optional filtering
            return context.services.database.organization.count({
              where: filters.where || {},
            })
          },

          /**
           * @method groupBy
           * @description Group organizations by specified fields
           * @param {any} filters - Group criteria for organizations
           * @returns {Promise<any[]>} Grouped organizations
           */
          groupBy: async (filters: any) => {
            // Business Logic: Group organizations by specified fields
            return context.services.database.organization.groupBy(filters)
          },

          /**
           * @method aggregate
           * @description Aggregate organizations data
           * @param {any} filters - Aggregation criteria for organizations
           * @returns {Promise<any>} Aggregated organizations data
           */
          aggregate: async (filters: any) => {
            // Business Logic: Aggregate organizations data
            return context.services.database.organization.aggregate(filters)
          },

          /**
           * @method findMany
           * @description Find multiple organizations with optional filtering
           * @param {any} filters - Filter criteria for organizations
           * @returns {Promise<any[]>} Array of organizations
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve organizations with optional filtering and pagination
            return context.services.database.organization.findMany({
              where: filters.where || {},
              include: {
                _count: {
                  select: {
                    members: true,
                    invitations: true,
                    apiKeys: true,
                    webhooks: true,
                    integrations: true,
                    submissions: true,
                    leads: true,
                    notifications: true,
                  },
                },
                customer: {
                  include: {
                    subscriptions: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },

          /**
           * @method findUnique
           * @description Find a single organization by ID
           * @param {string} id - Organization ID
           * @returns {Promise<any | null>} Organization object or null
           */
          findUnique: async (id: string) => {
            // Business Logic: Retrieve single organization with full details
            return context.services.database.organization.findUnique({
              where: { id },
              include: {
                members: {
                  include: {
                    user: true,
                  },
                },
                invitations: {
                  include: {
                    user: true,
                  },
                },
                apiKeys: true,
                webhooks: true,
                integrations: true,
                customer: {
                  include: {
                    subscriptions: {
                      include: {
                        price: {
                          include: {
                            plan: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            })
          },

          /**
           * @method findMemberships
           * @description Find all memberships for an organization
           * @param {string} id - Organization ID
           * @returns {Promise<any[]>} Array of memberships
           */
          findMemberships: async (id: string) => {
            // Business Logic: Retrieve all members of an organization
            return context.services.database.member.findMany({
              where: { organizationId: id },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    createdAt: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            })
          },

          /**
           * @method findSubscriptions
           * @description Find all subscriptions for an organization
           * @param {string} id - Organization ID
           * @returns {Promise<any[]>} Array of subscriptions
           */
          findSubscriptions: async (id: string) => {
            // Business Logic: Retrieve all subscriptions for an organization
            return context.services.database.subscription.findMany({
              where: { customer: { organizationId: id } },
              include: {
                price: {
                  include: {
                    plan: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' } as const,
            })
          },

          /**
           * @method findInvites
           * @description Find all pending invitations for an organization
           * @param {string} id - Organization ID
           * @returns {Promise<any[]>} Array of invitations
           */
          findInvites: async (id: string) => {
            // Business Logic: Retrieve all pending invitations for an organization
            return context.services.database.invitation.findMany({
              where: {
                organizationId: id,
                status: 'pending',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { id: 'desc' } as const,
            })
          },

          /**
           * @method findStats
           * @description Get statistics for an organization
           * @param {string} id - Organization ID
           * @returns {Promise<any>} Organization statistics
           */
          findStats: async (id: string) => {
            // Business Logic: Calculate organization statistics
            const [
              memberCount,
              invitationCount,
              subscriptionCount,
              apiKeyCount,
            ] = await Promise.all([
              context.services.database.member.count({
                where: { organizationId: id },
              }),
              context.services.database.invitation.count({
                where: { organizationId: id },
              }),
              context.services.database.subscription.count({
                where: { customer: { organizationId: id } },
              }),
              context.services.database.apiKey.count({
                where: { organizationId: id },
              }),
            ])

            return {
              memberCount,
              invitationCount,
              subscriptionCount,
              apiKeyCount,
            }
          },

          /**
           * @method findActivity
           * @description Get recent activity for an organization
           * @param {string} id - Organization ID
           * @returns {Promise<any[]>} Recent activity events
           */
          findActivity: async (id: string) => {
            // Business Logic: Retrieve recent activity for an organization
            const recentMemberships =
              await context.services.database.member.findMany({
                where: { organizationId: id },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
                orderBy: { createdAt: 'desc' } as const,
                take: 10,
              })

            const recentInvitations =
              await context.services.database.invitation.findMany({
                where: { organizationId: id },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
                orderBy: { id: 'desc' } as const,
                take: 10,
              })

            // Combine and sort activities
            const activities = [
              ...recentMemberships.map((m) => ({
                type: 'member_joined',
                user: m.user,
                createdAt: m.createdAt,
                data: { role: m.role },
              })),
              ...recentInvitations.map((i: any) => ({
                type: 'invitation_sent',
                user: i.user,
                createdAt: i.createdAt,
                data: { role: i.role, status: i.status },
              })),
            ]

            return activities
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .slice(0, 20)
          },
        },

        user: {
          /**
           * @method count
           * @description Count users with optional filtering
           * @param {any} filters - Filter criteria for users
           * @returns {Promise<number>} Number of users
           */
          count: async (filters: any) => {
            // Business Logic: Count users with optional filtering
            return context.services.database.user.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple users with optional filtering
           * @param {any} filters - Filter criteria for users
           * @returns {Promise<any[]>} Array of users
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve users with optional filtering and pagination
            return context.services.database.user.findMany({
              where: filters.where || {},
              include: {
                _count: {
                  select: {
                    members: true,
                    invitations: true,
                    sessions: true,
                    accounts: true,
                    notifications: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },

          /**
           * @method findUnique
           * @description Find a single user by ID
           * @param {string} id - User ID
           * @returns {Promise<any | null>} User object or null
           */
          findUnique: async (id: string) => {
            // Business Logic: Retrieve single user with full details
            return context.services.database.user.findUnique({
              where: { id },
              include: {
                members: {
                  include: {
                    organization: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
                invitations: {
                  include: {
                    organization: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
                sessions: {
                  select: {
                    id: true,
                    expiresAt: true,
                    createdAt: true,
                    ipAddress: true,
                    userAgent: true,
                  },
                  orderBy: { createdAt: 'desc' } as const,
                },
                accounts: {
                  select: {
                    id: true,
                    providerId: true,
                    accountId: true,
                    accessToken: true,
                    refreshToken: true,
                    createdAt: true,
                  },
                },
              },
            })
          },

          /**
           * @method findMemberships
           * @description Find all memberships for a user
           * @param {string} id - User ID
           * @returns {Promise<any[]>} Array of memberships
           */
          findMemberships: async (id: string) => {
            // Business Logic: Retrieve all organizations a user is a member of
            return context.services.database.member.findMany({
              where: { userId: id },
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    createdAt: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            })
          },

          /**
           * @method findAccounts
           * @description Find all OAuth accounts for a user
           * @param {string} id - User ID
           * @returns {Promise<any[]>} Array of OAuth accounts
           */
          findAccounts: async (id: string) => {
            // Business Logic: Retrieve all OAuth accounts linked to a user
            return context.services.database.account.findMany({
              where: { userId: id },
              select: {
                id: true,
                providerId: true,
                accountId: true,
                accessTokenExpiresAt: true,
                refreshTokenExpiresAt: true,
                scope: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { createdAt: 'asc' },
            })
          },

          /**
           * @method findSessions
           * @description Find all active sessions for a user
           * @param {string} id - User ID
           * @returns {Promise<any[]>} Array of active sessions
           */
          findSessions: async (id: string) => {
            // Business Logic: Retrieve all active sessions for a user
            return context.services.database.session.findMany({
              where: {
                userId: id,
                expiresAt: {
                  gt: new Date(),
                },
              },
              select: {
                id: true,
                expiresAt: true,
                token: true,
                createdAt: true,
                updatedAt: true,
                ipAddress: true,
                userAgent: true,
              },
              orderBy: { createdAt: 'desc' } as const,
            })
          },
        },

        member: {
          /**
           * @method count
           * @description Count members with optional filtering
           * @param {any} filters - Filter criteria for members
           * @returns {Promise<number>} Number of members
           */
          count: async (filters: any) => {
            // Business Logic: Count members with optional filtering
            return context.services.database.member.count({
              where: filters.where || {},
            })
          },

          /**
           * @method groupBy
           * @description Group members by specified fields
           * @param {any} filters - Group criteria for members
           * @returns {Promise<any[]>} Grouped members
           */
          groupBy: async (filters: any) => {
            // Business Logic: Group members by specified fields
            return context.services.database.member.groupBy(filters)
          },

          /**
           * @method findMany
           * @description Find multiple members with optional filtering
           * @param {any} filters - Filter criteria for members
           * @returns {Promise<any[]>} Array of members
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve members with optional filtering
            return context.services.database.member.findMany({
              where: filters.where || {},
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                  },
                },
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },
        },

        invitation: {
          /**
           * @method count
           * @description Count invitations with optional filtering
           * @param {any} filters - Filter criteria for invitations
           * @returns {Promise<number>} Number of invitations
           */
          count: async (filters: any) => {
            // Business Logic: Count invitations with optional filtering
            return context.services.database.invitation.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple invitations with optional filtering
           * @param {any} filters - Filter criteria for invitations
           * @returns {Promise<any[]>} Array of invitations
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve invitations with optional filtering
            return context.services.database.invitation.findMany({
              where: filters.where || {},
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },
        },

        subscription: {
          /**
           * @method count
           * @description Count subscriptions with optional filtering
           * @param {any} filters - Filter criteria for subscriptions
           * @returns {Promise<number>} Number of subscriptions
           */
          count: async (filters: any) => {
            // Business Logic: Count subscriptions with optional filtering
            return context.services.database.subscription.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple subscriptions with optional filtering
           * @param {any} filters - Filter criteria for subscriptions
           * @returns {Promise<any[]>} Array of subscriptions
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve subscriptions with optional filtering
            return context.services.database.subscription.findMany({
              where: filters.where || {},
              include: {
                customer: {
                  include: {
                    organization: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
                price: {
                  include: {
                    plan: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },

          /**
           * @method findUnique
           * @description Find a single subscription by ID
           * @param {string} id - Subscription ID
           * @returns {Promise<any | null>} Subscription object or null
           */
          findUnique: async (id: string) => {
            // Business Logic: Retrieve single subscription with full details
            return context.services.database.subscription.findUnique({
              where: { id },
              include: {
                customer: {
                  include: {
                    organization: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
                price: {
                  include: {
                    plan: true,
                  },
                },
              },
            })
          },
        },

        apiKey: {
          /**
           * @method count
           * @description Count API keys with optional filtering
           * @param {any} filters - Filter criteria for API keys
           * @returns {Promise<number>} Number of API keys
           */
          count: async (filters: any) => {
            // Business Logic: Count API keys with optional filtering
            return context.services.database.apiKey.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple API keys with optional filtering
           * @param {any} filters - Filter criteria for API keys
           * @returns {Promise<any[]>} Array of API keys
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve API keys with optional filtering
            return context.services.database.apiKey.findMany({
              where: filters.where || {},
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },
        },

        account: {
          /**
           * @method count
           * @description Count OAuth accounts with optional filtering
           * @param {any} filters - Filter criteria for accounts
           * @returns {Promise<number>} Number of OAuth accounts
           */
          count: async (filters: any) => {
            // Business Logic: Count OAuth accounts with optional filtering
            return context.services.database.account.count({
              where: filters.where || {},
            })
          },

          /**
           * @method findMany
           * @description Find multiple OAuth accounts with optional filtering
           * @param {any} filters - Filter criteria for accounts
           * @returns {Promise<any[]>} Array of OAuth accounts
           */
          findMany: async (filters: any) => {
            // Business Logic: Retrieve OAuth accounts with optional filtering
            return context.services.database.account.findMany({
              where: filters.where || {},
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              skip: filters.skip,
              take: filters.take,
              orderBy: filters.orderBy || { createdAt: 'desc' },
            })
          },
        },
      },
    }
  },
})
