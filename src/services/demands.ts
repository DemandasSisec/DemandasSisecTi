import { databases } from '../config/appwrite';
import { ID, Query } from 'appwrite';
import { DATABASES } from '../config/appwrite';

export const demandsService = {
    // Criar demanda
    createDemand: async (data: any) => {
        try {
            return await databases.createDocument(
                DATABASES.ID,
                DATABASES.COLLECTIONS.DEMANDS,
                ID.unique(),
                data
            );
        } catch (error) {
            throw error;
        }
    },

    // Listar demandas
    listDemands: async () => {
        try {
            return await databases.listDocuments(
                DATABASES.ID,
                DATABASES.COLLECTIONS.DEMANDS,
                [
                    Query.orderDesc('$createdAt')
                ]
            );
        } catch (error) {
            throw error;
        }
    },

    // Atualizar demanda
    updateDemand: async (documentId: string, data: any) => {
        try {
            return await databases.updateDocument(
                DATABASES.ID,
                DATABASES.COLLECTIONS.DEMANDS,
                documentId,
                data
            );
        } catch (error) {
            throw error;
        }
    },

    // Deletar demanda
    deleteDemand: async (documentId: string) => {
        try {
            return await databases.deleteDocument(
                DATABASES.ID,
                DATABASES.COLLECTIONS.DEMANDS,
                documentId
            );
        } catch (error) {
            throw error;
        }
    }
}; 