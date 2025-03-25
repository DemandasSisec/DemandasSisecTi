import { databases } from '../config/appwrite';
import { ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite';

export const demandsService = {
    create: async (data: any) => {
        try {
            return await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.DEMANDS,
                ID.unique(),
                data
            );
        } catch (error) {
            throw error;
        }
    },

    list: async () => {
        try {
            return await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.DEMANDS,
                [
                    Query.orderDesc('$createdAt')
                ]
            );
        } catch (error) {
            throw error;
        }
    },

    getById: async (id: string) => {
        try {
            return await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.DEMANDS,
                id
            );
        } catch (error) {
            throw error;
        }
    },

    update: async (id: string, data: any) => {
        try {
            return await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.DEMANDS,
                id,
                data
            );
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            return await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.DEMANDS,
                id
            );
        } catch (error) {
            throw error;
        }
    }
}; 