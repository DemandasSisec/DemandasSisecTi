import { Client, Account, Databases } from 'appwrite';
import { APPWRITE_CONFIG } from '../../config/appwrite';

const client = new Client();

client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export default client; 