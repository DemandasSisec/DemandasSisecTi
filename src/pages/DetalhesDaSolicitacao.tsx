import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { databases } from '../config/appwrite'
import { APPWRITE_CONFIG } from '../config/appwrite'
import { ID, Query } from 'appwrite'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { StatusBadge } from '../components/StatusBadge'
import { UrgenciaBadge } from '../components/UrgenciaBadge'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { SelectResponsavel } from '../components/SelectResponsavel'
import { differenceInYears, differenceInMonths, differenceInHours, differenceInMinutes } from 'date-fns';
import type { Demand, Comment } from '../types/appwrite'
import { formatDate } from '../utils/formatDate'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import { storage } from '../config/appwrite'

interface Adiamento {
  dataAntiga: string
  dataNova: string
  justificativa: string
  solicitante: string
  data: string
}

// Adicione esta função para formatar o tamanho do arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function DetalhesDaSolicitacaoPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [demand, setDemand] = useState<Demand | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const isAdminOrTI = user?.role === 'admin' || user?.role === 'admin_ti'
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isAdiamentoModalOpen, setIsAdiamentoModalOpen] = useState(false)
  const [justificativaAdiamento, setJustificativaAdiamento] = useState('')
  const [novaData, setNovaData] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    department: '',
    assigned_to: '',
    priority: '',
    status: 'pending',
    due_date: '',
    requester_id: '',
    empresa: '',
    solicitante: ''
  })
  const [originalForm, setOriginalForm] = useState({
    title: '',
    description: '',
    department: '',
    assigned_to: '',
    priority: '',
    status: '',
    due_date: '',
    empresa: '',
    solicitante: ''
  })
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<{ id: string; name: string; size: number }[]>([])

  // Ajustando a verificação para "Equipe de TI"
  const isEquipeTI = userProfile?.perfil === "Equipe de TI";

  // Função para buscar perfil do usuário com log para debug
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.USUARIOS,
          user.uid
        );
        if (userDoc.exists()) {
          const userData = userDoc.data;
          setUserProfile(userData);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const fetchFiles = async (fileIds: string[]) => {
    if (!fileIds?.length) return

    try {
      const filesInfo = await Promise.all(
        fileIds.map(async (fileId) => {
          try {
            const file = await storage.getFile(
              APPWRITE_CONFIG.storage.DEMANDS_FILES,
              fileId
            )
            return {
              id: fileId,
              name: file.name,
              size: file.size
            }
          } catch (error) {
            console.error('Erro ao buscar arquivo:', error)
            return null
          }
        })
      )
      setFiles(filesInfo.filter((file): file is { id: string; name: string; size: number } => file !== null))
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error)
    }
  }

  const fetchDemand = async () => {
    if (!id) return

    try {
      const response = await databases.getDocument<Demand>(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.DEMANDS,
        id
      )
      setDemand(response)
      if (response.arquivos?.length) {
        await fetchFiles(response.arquivos)
      }
      setEditForm({
        title: response.title,
        description: response.description,
        department: response.department,
        assigned_to: response.assigned_to || '',
        priority: response.priority,
        status: response.status,
        due_date: response.due_date || '',
        requester_id: response.requester_id || '',
        empresa: response.empresa || '',
        solicitante: response.solicitante || ''
      })
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error)
      toast.error('Erro ao carregar solicitação')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!id) return

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.COMMENTS,
        [
          Query.equal('demand_id', id),
          Query.orderDesc('created_at')
        ]
      )
      setComments(response.documents as Comment[])
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
      toast.error('Erro ao carregar comentários')
    }
  }

  useEffect(() => {
    fetchDemand()
    fetchComments()
  }, [id])

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      const comment = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.COMMENTS,
        ID.unique(),
        {
          demand_id: id,
          user_id: user.$id,
          content: newComment.trim(),
          created_at: new Date().toISOString(),
          type: 'comment'
        }
      )

      setComments(prev => [comment as Comment, ...prev])
      setNewComment('')
      toast.success('Comentário adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('Erro ao adicionar comentário')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.COMMENTS,
        commentId
      );
      
      await fetchComments();
      toast.success('Comentário removido com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao remover comentário');
    }
  };

  const handleAdiarSolicitacao = async () => {
    if (!id || !novaData || !justificativaAdiamento.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.DEMANDS,
        id,
        {
          due_date: novaData,
          adiamentos: {
            dataAntiga: demand?.due_date,
            dataNova: novaData,
            justificativa: justificativaAdiamento,
            solicitante: user?.name,
            data: new Date().toISOString()
          }
        }
      );

      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.COMMENTS,
        ID.unique(),
        {
          demand_id: id,
          texto: `Solicitação de Adiamento pelo usuário: ${user?.name}\nMotivo: ${justificativaAdiamento}`,
          autor: user?.name,
          data: new Date().toISOString(),
          tipo: 'adiamento'
        }
      );

      setIsAdiamentoModalOpen(false);
      setJustificativaAdiamento('');
      setNovaData('');
      
      await fetchDemand();
      await fetchComments();

      toast.success('Solicitação adiada com sucesso!');
    } catch (error) {
      console.error('Erro ao adiar solicitação:', error);
      toast.error('Erro ao adiar solicitação. Tente novamente.');
    }
  };

  const formatarDataCriacao = (data: any) => {
    if (!data) return 'Não definido';
    
    try {
      // Se for um Timestamp do Firestore
      if (data?.seconds) {
        const date = new Date(data.seconds * 1000);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
      }
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatarDataComentario = (data: any) => {
    try {
      // Se for um Timestamp do Firestore
      if (data && typeof data === 'object' && 'seconds' in data) {
        const date = new Date(data.seconds * 1000);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      
      // Se for uma string ISO
      if (typeof data === 'string') {
        const date = new Date(data);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
      }
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data do comentário:', error);
      return 'Data inválida';
    }
  };

  useEffect(() => {
    if (demand?.status === 'suspenso' && demand?.dataSuspensao) {
      const interval = setInterval(() => {
        // Força uma re-renderização para atualizar o tempo
        setDemand(prev => ({ ...prev }));
      }, 60000); // Atualiza a cada minuto

      return () => clearInterval(interval);
    }
  }, [demand?.status, demand?.dataSuspensao]);

  const handleEdit = () => {
    const originalValues = {
      title: demand?.title || '',
      description: demand?.description || '',
      department: demand?.department || '',
      assigned_to: demand?.assigned_to || '',
      priority: demand?.priority || '',
      status: demand?.status || '',
      due_date: demand?.due_date || '',
      requester_id: demand?.requester_id || '',
      empresa: demand?.empresa || '',
      solicitante: demand?.solicitante || ''
    };
    
    setOriginalForm(originalValues);
    setEditForm(originalValues);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm(originalForm); // Restaura os valores originais
    setIsEditing(false);
  };

  const calcularTempoSuspensao = (dataSuspensao: any) => {
    if (!dataSuspensao || demand?.status !== 'suspenso') return null;
  
    try {
      const suspensaoDate = new Date(dataSuspensao.seconds * 1000);
      const agora = new Date();
  
      // Calcula a diferença total em milissegundos
      const diferencaMs = agora.getTime() - suspensaoDate.getTime();
      
      // Converte para dias, horas e minutos
      const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
      const horasMs = diferencaMs % (1000 * 60 * 60 * 24);
      const horas = Math.floor(horasMs / (1000 * 60 * 60));
      const minutosMs = horasMs % (1000 * 60 * 60);
      const minutos = Math.floor(minutosMs / (1000 * 60));
  
      // Monta a string de tempo
      const partes = [];
      
      if (dias > 0) {
        partes.push(`${dias} dia${dias > 1 ? 's' : ''}`);
      }
      if (horas > 0) {
        partes.push(`${horas} hora${horas > 1 ? 's' : ''}`);
      }
      if (minutos > 0) {
        partes.push(`${minutos} minuto${minutos > 1 ? 's' : ''}`);
      }
  
      return partes.length > 0 ? partes.join(' e ') : 'Menos de um minuto';
  
    } catch (error) {
      console.error('Erro ao calcular tempo de suspensão:', error, {
        demandaId: demand?.id,
        dataSuspensao: demand?.dataSuspensao,
        status: demand?.status
      });
      return 'Tempo indisponível';
    }
  };

  const handleSave = async () => {
    if (!demand?.$id) return;

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.DEMANDS,
        demand.$id,
        editForm
      )

      setDemand(prev => prev ? { ...prev, ...editForm } : null)
      setIsEditing(false)
      toast.success('Solicitação atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error)
      toast.error('Erro ao atualizar solicitação')
    }
  };

  const handleComplete = async () => {
    if (!demand?.$id) return;

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.DEMANDS,
        demand.$id,
        {
          status: 'concluida',
          dataFinalizacao: new Date().toISOString()
        }
      );
      
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.COMMENTS,
        ID.unique(),
        {
          demand_id: demand.$id,
          texto: `Demanda finalizada pelo usuário: ${user?.name}`,
          autor: user?.name,
          data: new Date().toISOString(),
          tipo: 'comentario'
        }
      );

      toast.success('Demanda concluída com sucesso!');
      
      await fetchDemand();
      await fetchComments();
    } catch (error) {
      console.error('Erro ao concluir demanda:', error);
      toast.error('Erro ao concluir demanda. Tente novamente.');
    }
  };

  const handleReopen = async () => {
    if (!demand?.$id) return;

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.DEMANDS,
        demand.$id,
        {
          status: 'em_andamento'
        }
      );
      
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.COMMENTS,
        ID.unique(),
        {
          demand_id: demand.$id,
          texto: `Demanda reaberta pelo usuário: ${user?.name}`,
          autor: user?.name,
          data: new Date().toISOString(),
          tipo: 'comentario'
        }
      );

      toast.success('Demanda reaberta com sucesso!');
      
      await fetchDemand();
      await fetchComments();
    } catch (error) {
      console.error('Erro ao reabrir demanda:', error);
      toast.error('Erro ao reabrir demanda. Tente novamente.');
    }
  };

  const formatarTipo = (tipo: string) => {
    switch (tipo) {
      case 'desenvolvimento':
        return 'Desenvolvimento';
      case 'dados':
        return 'Dados';
      case 'suporte':
        return 'Suporte';
      case 'infraestrutura':
        return 'Infraestrutura';
      case 'outros':
        return 'Outros';
      default:
        return 'Desconhecido';
    }
  };

  const formatTitulo = (titulo: string) => {
    if (titulo.length > 70) {
      return titulo.substring(0, 70) + '...'
    }
    return titulo
  }

  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'pendente',
      'in_progress': 'em_andamento',
      'completed': 'concluida',
      'cancelled': 'cancelado'
    };
    return statusMap[status] || status;
  };

  const formatDepartment = (department: string): string => {
    const departmentMap: Record<string, string> = {
      'desenvolvimento': 'Desenvolvimento',
      'dados': 'Dados',
      'suporte': 'Suporte',
      'infraestrutura': 'Infraestrutura',
      'outros': 'Outros'
    };
    return departmentMap[department] || department;
  };

  // Função para fazer download do arquivo
  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const result = await storage.getFileDownload(
        APPWRITE_CONFIG.storage.DEMANDS_FILES,
        fileId
      )
      
      // Criar um link temporário para download
      const url = window.URL.createObjectURL(result)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
      toast.error('Erro ao baixar o arquivo')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-500">
            Detalhes da Solicitação - Nº {demand?.$id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e gerencie os detalhes desta solicitação
          </p>
        </div>
        <button
          onClick={() => navigate('/painel-demandas')}
          className="flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Voltar
        </button>
      </div>

      {demand ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Cabeçalho da solicitação */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="max-w-2xl">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-xl font-semibold text-gray-900 mb-3 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Título da solicitação"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 whitespace-pre-wrap break-words">
                    {demand.title}
                  </h2>
                )}
              </div>
              
              <div className="flex space-x-3 shrink-0">
                {demand?.status === 'concluida' && isAdminOrTI && (
                  <button
                    onClick={handleReopen}
                    className="px-4 py-2 text-white bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-500 hover:to-cyan-600 font-medium"
                  >
                    Reabrir Demanda
                  </button>
                )}
                {demand?.status !== 'concluida' && isAdminOrTI && (
                  <>
                    <div className="flex space-x-3 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 font-medium"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg transition-all duration-200 hover:from-red-600 hover:to-red-700 font-medium"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEdit}
                            className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setIsAdiamentoModalOpen(true)}
                            className="px-4 py-2 text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg transition-all duration-200 hover:from-yellow-500 hover:to-orange-600 font-medium"
                          >
                            Solicitar Adiamento
                          </button>
                          <button
                            onClick={handleComplete}
                            className="px-4 py-2 text-white bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-500 hover:to-cyan-600 font-medium"
                          >
                            Marcar como Concluído
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo em grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Coluna da esquerda - Descrição e Comentários */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descrição */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Descrição</h3>
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap break-words">
                    {isEditing ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{demand.description}</p>
                    )}
                  </div>
                  {demand.link && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Link:</p>
                      <a 
                        href={demand.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {demand.link}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Comentários */}
              {demand?.status !== 'concluida' && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Comentários</h3>
                  </div>
                  
                  {/* Formulário para novo comentário */}
                  <div className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleAddComment}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Adicionar Comentário
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de comentários */}
              <div className="space-y-4 mt-4">
                {comments.map((comment) => (
                  <div key={comment.$id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{comment.autor}</span>
                        <span className="text-sm text-gray-500">
                          {formatarDataComentario(comment.created_at)}
                        </span>
                      </div>
                      {isAdminOrTI && demand?.status !== 'concluida' && (
                        <button
                          onClick={() => handleDeleteComment(comment.$id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna da direita - Detalhes */}
            <div className="space-y-6">
              {/* Card de Informações */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Informações da Solicitação</h2>
                  {isAdminOrTI && demand?.status !== 'concluida' && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                    >
                      Editar
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Empresa
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.empresa}
                        onChange={(e) => setEditForm(prev => ({ ...prev, empresa: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{demand.empresa}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Data da Solicitação
                    </label>
                    <p className="text-gray-900">{formatDate(demand.created_at)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Solicitante
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.solicitante}
                        onChange={(e) => setEditForm(prev => ({ ...prev, solicitante: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{demand.solicitante}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Responsável
                    </label>
                    <p className="text-gray-900">Lucas Fontoura</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>

              {/* Seção de Arquivos */}
              {demand.arquivos && demand.arquivos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Arquivos Anexados</p>
                  <div className="mt-2 space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <PaperClipIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(file.id, file.name)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Baixar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando detalhes da solicitação...</p>
        </div>
      )}

      {/* Modal de Adiamento */}
      <Transition appear show={isAdiamentoModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-10" 
          onClose={() => setIsAdiamentoModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Solicitar Adiamento
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Data
                      </label>
                      <input
                        type="date"
                        value={novaData}
                        onChange={(e) => setNovaData(e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Justificativa
                      </label>
                      <textarea
                        value={justificativaAdiamento}
                        onChange={(e) => setJustificativaAdiamento(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Digite a justificativa para o adiamento..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsAdiamentoModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-600/20 hover:to-pink-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                      onClick={handleAdiarSolicitacao}
                      disabled={!justificativaAdiamento.trim() || !novaData}
                    >
                      Solicitar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default DetalhesDaSolicitacaoPage