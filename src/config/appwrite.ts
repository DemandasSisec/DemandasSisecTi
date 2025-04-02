import { Client, Account, Databases, Storage } from 'appwrite';

export const APPWRITE_CONFIG = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: '67e2fa3b000c7182843b',
    collections: {
        DEMANDS: '67e2fa6f0010aeab4651',
        USERS: '67e2fa600011a5916659',
        COMMENTS: '67e2fa7900218cb6059c',
        DEPARTMENTS: '67e2fa840000c31b81c2',
        VAGAS: 'ID_DA_SUA_COLLECTION_DE_VAGAS',
        JOB_REQUESTS: '67e2fa7900218cb6059d'
    },
    storage: {
        DEMANDS_FILES: '67e412d900369dd93f73',
        VAGAS_FILES: 'ID_DO_SEU_BUCKET_VAGAS'
    }
} as const;

const client = new Client();

client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

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