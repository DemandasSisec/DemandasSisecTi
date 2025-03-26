import { storage } from '../config/appwrite'
import { APPWRITE_CONFIG } from '../config/appwrite'
import { ID, AppwriteException } from 'appwrite'

export const storageService = {
  // Upload de arquivo
  async uploadFile(file: File) {
    try {
      const fileId = ID.unique()
      const response = await storage.createFile(
        APPWRITE_CONFIG.storage.DEMANDS_FILES,
        fileId,
        file
      )
      return response.$id
    } catch (error) {
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 404:
            throw new Error(`Bucket ${APPWRITE_CONFIG.storage.DEMANDS_FILES} não encontrado`)
          case 401:
            throw new Error('Usuário não autorizado para upload de arquivos')
          case 413:
            throw new Error('Arquivo muito grande')
          default:
            throw new Error(`Erro ao fazer upload: ${error.message}`)
        }
      }
      throw error
    }
  },

  // Obter URL do arquivo
  async getFileView(fileId: string) {
    return storage.getFileView(
      APPWRITE_CONFIG.storage.DEMANDS_FILES,
      fileId
    )
  },

  // Deletar arquivo
  async deleteFile(fileId: string) {
    return storage.deleteFile(
      APPWRITE_CONFIG.storage.DEMANDS_FILES,
      fileId
    )
  },

  // Listar arquivos de uma demanda
  async listFiles(fileIds: string[]) {
    try {
      const files = await Promise.all(
        fileIds.map(async (fileId) => {
          const url = await this.getFileView(fileId)
          return {
            id: fileId,
            url
          }
        })
      )
      return files
    } catch (error) {
      console.error('Erro ao listar arquivos:', error)
      throw error
    }
  }
} 