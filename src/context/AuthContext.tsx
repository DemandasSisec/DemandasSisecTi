import { createContext, useContext, useState, useEffect } from 'react'
import { account, databases } from '../config/appwrite'
import { APPWRITE_CONFIG } from '../config/appwrite'
import type { User } from '../types/appwrite'
import { AppwriteException } from 'appwrite'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  userType: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<string | null>(null)

  async function checkUser() {
    try {
      const session = await account.get()
      if (!session) {
        setUser(null)
        setUserType(null)
        return
      }

      try {
        // Tenta buscar o documento do usuário
        const userData = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.USERS,
          session.$id
        )
        
        setUser({
          $id: userData.$id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          department: userData.department,
          created_at: userData.created_at,
          updated_at: userData.updated_at
        })
        setUserType(userData.role)
      } catch (error) {
        // Se o documento não existe (404), cria um novo
        if (error instanceof AppwriteException && error.code === 404) {
          const userData = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.USERS,
            session.$id,
            {
              name: session.name,
              email: session.email,
              role: 'user', // Começa como usuário comum
              department: 'Não definido',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          )
          
          setUser({
            $id: userData.$id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            department: userData.department,
            created_at: userData.created_at,
            updated_at: userData.updated_at
          })
          setUserType(userData.role)
        } else {
          throw error
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      setUser(null)
      setUserType(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    setLoading(true)
    try {
      // Tenta fazer logout se houver uma sessão ativa
      try {
        await account.deleteSession('current')
      } catch {
        // Ignora erro se não houver sessão
      }

      // Cria uma nova sessão
      await account.createEmailSession(email, password)
      
      // Busca os dados do usuário
      await checkUser()
    } catch (error) {
      console.error('Erro no login:', error)
      setLoading(false)
      throw error
    }
  }

  async function logout() {
    try {
      await account.deleteSession('current')
      setUser(null)
      setUserType(null)
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, userType }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 