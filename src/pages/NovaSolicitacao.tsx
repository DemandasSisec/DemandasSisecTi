import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { databases, account } from '../config/appwrite'
import { APPWRITE_CONFIG } from '../config/appwrite'
import { ID } from 'appwrite'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { SelectResponsavel } from '../components/SelectResponsavel'
import type { TipoDemanda, Urgencia, Demand } from '../types/appwrite'
import { FileUpload } from '../components/FileUpload'
import { storageService } from '../services/storage.service'
import { AppwriteException } from 'appwrite'

interface FormData {
  titulo: string
  descricao: string
  tipo: 'desenvolvimento' | 'dados' | 'suporte' | 'infraestrutura' | 'outros'
  urgencia: 'baixa' | 'media' | 'alta'
  prazo: string
  responsavel: string
  solicitante: string
  semPrazo: boolean
  arquivos: File[]
}

export default function NovaSolicitacao() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    tipo: 'desenvolvimento',
    urgencia: 'baixa',
    prazo: '',
    responsavel: '',
    solicitante: user?.name || '',
    semPrazo: false,
    arquivos: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verifica sessão
      const session = await account.get()
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.')
        navigate('/login')
        return
      }

      // Validações básicas
      if (!formData.titulo.trim()) {
        toast.error('O título é obrigatório')
        return
      }

      if (!formData.descricao.trim()) {
        toast.error('A descrição é obrigatória')
        return
      }

      // Upload dos arquivos
      const uploadedFileIds: string[] = []
      
      if (formData.arquivos.length > 0) {
        const uploadPromises = formData.arquivos.map(file => 
          storageService.uploadFile(file)
            .catch(error => {
              console.error(`Erro ao fazer upload do arquivo ${file.name}:`, error)
              toast.error(`Erro ao enviar arquivo: ${file.name}`)
              return null
            })
        )

        const results = await Promise.all(uploadPromises)
        uploadedFileIds.push(...results.filter((id): id is string => id !== null))
      }

      // Criar a solicitação
      const documentData: Omit<Demand, '$id'> = {
        title: formData.titulo.trim(),
        description: formData.descricao.trim(),
        status: 'pending',
        priority: formData.urgencia,
        requester_id: user?.$id || '',
        assigned_to: formData.responsavel || null,
        department: formData.tipo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        due_date: formData.semPrazo ? null : formData.prazo,
        attachments: '',
        arquivos: uploadedFileIds
      }

      const novaSolicitacao = await databases.createDocument<Demand>(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.DEMANDS,
        ID.unique(),
        documentData
      )

      toast.success('Solicitação criada com sucesso!')
      navigate('/painel-demandas')
    } catch (error) {
      console.error('Erro ao criar solicitação:', error)
      if (error instanceof AppwriteException) {
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.error('Erro ao criar solicitação. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFilesSelected = (files: File[]) => {
    setFormData(prev => ({ ...prev, arquivos: files }))
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header simplificado */}
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Nova Solicitação
        </h1>

        {/* Card do Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Seção Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna Esquerda */}
                <div className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título <span className="text-xs text-gray-500">({formData.titulo.length}/70)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      value={formData.titulo}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value.length <= 70) {
                          setFormData(prev => ({ ...prev, titulo: value }))
                        }
                      }}
                      placeholder="Digite o título da solicitação"
                      maxLength={70}
                    />
                  </div>

                  {/* Tipo e Urgência */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo da Demanda
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        value={formData.tipo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'desenvolvimento' | 'dados' | 'suporte' | 'infraestrutura' | 'outros' }))}
                      >
                        <option value="desenvolvimento">Desenvolvimento</option>
                        <option value="dados">Dados</option>
                        <option value="suporte">Suporte</option>
                        <option value="infraestrutura">Infraestrutura</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgência
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        value={formData.urgencia}
                        onChange={(e) => setFormData(prev => ({ ...prev, urgencia: e.target.value as 'baixa' | 'media' | 'alta' }))}
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>

                  {/* Prazo e Solicitante */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prazo de Entrega
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                          value={formData.prazo}
                          onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          disabled={formData.semPrazo}
                        />
                        <label className="flex items-center space-x-2 mt-2">
                          <input
                            type="checkbox"
                            checked={formData.semPrazo}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              semPrazo: e.target.checked,
                              prazo: e.target.checked ? '' : prev.prazo
                            }))}
                            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">Sem prazo definido</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Solicitante
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        value={formData.solicitante}
                        onChange={(e) => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
                        placeholder="Nome do solicitante"
                      />
                    </div>
                  </div>

                  {/* Responsável */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsável
                    </label>
                    <SelectResponsavel
                      value={formData.responsavel}
                      onChange={(value) => setFormData(prev => ({ ...prev, responsavel: value }))}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição da Demanda
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      rows={8}
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva detalhadamente a sua solicitação"
                    />
                  </div>

                  {/* Anexos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anexos
                    </label>
                    <FileUpload onFilesSelected={handleFilesSelected} />
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/lista-solicitacoes')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Criando...' : 'Criar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 