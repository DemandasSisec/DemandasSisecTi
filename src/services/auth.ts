import { account } from '../config/appwrite';
import { ID } from 'appwrite';

export const authService = {
    // Criar conta
    createAccount: async (email: string, password: string, name: string) => {
        try {
            return await account.create(
                ID.unique(),
                email,
                password,
                name
            );
        } catch (error) {
            throw error;
        }
    },

    // Login
    login: async (email: string, password: string) => {
        try {
            return await account.createEmailSession(email, password);
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: async () => {
        try {
            return await account.deleteSession('current');
        } catch (error) {
            throw error;
        }
    },

    // Verificar sessão atual
    getCurrentUser: async () => {
        try {
            return await account.get();
        } catch (error) {
            return null;
        }
    }
}; 