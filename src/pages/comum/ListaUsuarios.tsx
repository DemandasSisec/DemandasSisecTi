import { useState, useEffect } from 'react'
import { databases } from '../../config/appwrite'
import { APPWRITE_CONFIG } from '../../config/appwrite'
import { Query } from 'appwrite'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { User } from '../../types/appwrite'

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.USERS,
        [
          Query.orderAsc('name')
        ]
      )
      setUsuarios(response.documents.map(doc => ({
        $id: doc.$id,
        name: doc.name,
        email: doc.email,
        role: doc.role,
        department: doc.department,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      })))
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.USERS,
        userId
      )
      toast.success('Usuário removido com sucesso')
      fetchUsuarios()
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      toast.error('Erro ao remover usuário')
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista de Usuários</h1>
        <button
          onClick={() => navigate('/cadastrar-usuario')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Novo Usuário
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.$id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {usuario.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {usuario.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {usuario.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteUser(usuario.$id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 