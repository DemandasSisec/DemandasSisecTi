import { Client, Account, Databases } from 'appwrite';

const client = new Client();

export const APPWRITE_CONFIG = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: '67e2fa3b000c7182843b',
    collections: {
        USERS: '67e2fa600011a5916659',
        DEMANDS: '67e2fa6f0010aeab4651',
        COMMENTS: '67e2fa7900218cb6059c',
        DEPARTMENTS: '67e2fa840000c31b81c2'
    }
};

client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);

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

export default client; 