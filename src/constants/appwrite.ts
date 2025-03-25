export const APPWRITE_CONFIG = {
    databaseId: 'sisec_db', // seu database ID
    collections: {
        users: 'users',
        demands: 'demands',
        comments: 'comments',
        departments: 'departments'
    }
};

export const DEMAND_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
} as const;

export const DEMAND_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
} as const;

export type DemandStatus = typeof DEMAND_STATUS[keyof typeof DEMAND_STATUS];
export type DemandPriority = typeof DEMAND_PRIORITY[keyof typeof DEMAND_PRIORITY]; 