import { databases } from './client';
import { ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../../constants/appwrite';
import { Demand } from '../../types/appwrite';

export const demandsService = {
    create: async (data: Omit<Demand, '$id' | 'created_at' | 'updated_at'>) => {
        try {
            return await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.demands,
                ID.unique(),
                {
                    ...data,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            );
        } catch (error) {
            throw error;
        }
    },

    list: async (queries: string[] = []) => {
        try {
            return await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.demands,
                queries
            );
        } catch (error) {
            throw error;
        }
    },

    getById: async (id: string) => {
        try {
            return await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.demands,
                id
            );
        } catch (error) {
            throw error;
        }
    },

    update: async (id: string, data: Partial<Demand>) => {
        try {
            return await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.demands,
                id,
                {
                    ...data,
                    updated_at: new Date()
                }
            );
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            return await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.demands,
                id
            );
        } catch (error) {
            throw error;
        }
    }
}; 