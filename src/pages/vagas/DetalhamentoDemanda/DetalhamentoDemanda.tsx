import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusTimeline } from '../../../components/StatusTimeline'
import { ChevronLeftIcon, PaperClipIcon, TrashIcon, ArrowUpTrayIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const STATUS_LIST = [
  { id: 1, label: 'Pendente' },
  { id: 2, label: 'Extraindo Candidatos do Banco' },
  { id: 3, label: 'Processando Lista de Candidatos' },
  { id: 4, label: 'Aguardando Cadastro de Vagas no Sistema' },
  { id: 5, label: 'Aguardando Cadastro' },
  { id: 6, label: 'Lista Cadastrada no Sistema' },
  { id: 7, label: 'Enviado para Ouvidoria' },
  { id: 8, label: 'Aguardando Retorno da Ouvidoria' },
  { id: 9, label: 'Retorno da Ouvidoria Recebido' },
  { id: 10, label: 'Extraindo Candidatos Interessados' },
  { id: 11, label: 'Candidatos Interessados Encaminhados para Empresa' },
  { id: 12, label: 'Concluído' }
]

// Dados mockados para visualização
const demandaMock = {
  id: "5356148",
  solicitante: "João Silva",
  cargo: "Desenvolvedor Full Stack",
  empresa: "TechCorp Solutions",
  created_at: "2024-04-02T14:30:00",
  statusAtual: 9
}

// Dados de exemplo para a tabela de preview
const dadosExemplo = [
  {
    id: "5356148",
    empresa: "TechCorp Solutions",
    solicitante: "João Silva",
    created_at: "2024-04-02T14:30:00",
    statusAtual: 4,
    vagas: [
      {
        id: "1",
        uf: "SP",
        cidade: "São Paulo",
        codigo_ibge: 3550308,
        vagas: 3,
        cargo: "Desenvolvedor Full Stack",
        escolaridade: "Superior Completo",
        pcd: false,
        bairro: "Vila Mariana",
        link: "https://exemplo.com/vaga1"
      },
      {
        id: "2",
        uf: "RJ",
        cidade: "Rio de Janeiro",
        codigo_ibge: 3304557,
        vagas: 2,
        cargo: "Analista de Sistemas",
        escolaridade: "Superior Completo",
        pcd: true,
        bairro: "Barra da Tijuca",
        link: "https://exemplo.com/vaga2"
      }
    ]
  },
  {
    id: "7845962",
    empresa: "Inovação Digital",
    solicitante: "Maria Santos",
    created_at: "2024-04-01T10:15:00",
    statusAtual: 2,
    vagas: [
      {
        id: "3",
        uf: "AC",
        cidade: "Assis Brasil",
        codigo_ibge: 1200054,
        vagas: 55,
        cargo: "Teste",
        escolaridade: "EMI",
        pcd: false,
        bairro: "Asa Norte",
        link: "https://exemplo.com/vaga3"
      }
    ]
  },
  {
    id: "2369841",
    empresa: "Futuro Tecnologia",
    solicitante: "Pedro Oliveira",
    created_at: "2024-03-30T16:45:00",
    statusAtual: 12
  },
  {
    id: "9874563",
    empresa: "Soluções Avançadas",
    solicitante: "Ana Souza",
    created_at: "2024-03-29T09:20:00",
    statusAtual: 5
  },
  {
    id: "1234567",
    empresa: "Empresa ABC",
    solicitante: "Carlos Mendes",
    created_at: "2024-03-28T11:30:00",
    statusAtual: 3
  },
  {
    id: "7654321",
    empresa: "XYZ Tecnologia",
    solicitante: "Roberto Alves",
    created_at: "2024-03-27T14:15:00",
    statusAtual: 4
  },
  {
    id: "9876543",
    empresa: "Inovação & Cia",
    solicitante: "Ana Beatriz",
    created_at: "2024-03-26T16:40:00",
    statusAtual: 6
  },
  {
    id: "3456789",
    empresa: "Futuro Digital",
    solicitante: "Marcos Oliveira",
    created_at: "2024-03-25T10:10:00",
    statusAtual: 7
  },
  {
    id: "8765432",
    empresa: "Soluções Integradas",
    solicitante: "Patrícia Souza",
    created_at: "2024-03-24T13:25:00",
    statusAtual: 8
  },
  {
    id: "2345678",
    empresa: "Tech Solutions",
    solicitante: "Ricardo Mendes",
    created_at: "2024-03-23T15:50:00",
    statusAtual: 9
  },
  {
    id: "6543210",
    empresa: "Digital Systems",
    solicitante: "Luciana Alves",
    created_at: "2024-03-22T09:05:00",
    statusAtual: 10
  },
  {
    id: "8901234",
    empresa: "Inovação Avançada",
    solicitante: "Mariana Beatriz",
    created_at: "2024-03-21T11:20:00",
    statusAtual: 11
  },
  {
    id: "4567890",
    empresa: "Futuro & Presente",
    solicitante: "Felipe Oliveira",
    created_at: "2024-03-20T14:35:00",
    statusAtual: 12
  },
  {
    id: "7890123",
    empresa: "Soluções do Amanhã",
    solicitante: "Carla Souza",
    created_at: "2024-03-19T16:00:00",
    statusAtual: 1
  },
  {
    id: "3210987",
    empresa: "Tech do Futuro",
    solicitante: "Bruno Mendes",
    created_at: "2024-03-18T10:25:00",
    statusAtual: 2
  },
  {
    id: "5678901",
    empresa: "Digital Inovação",
    solicitante: "Juliana Lima",
    created_at: "2024-03-17T13:40:00",
    statusAtual: 3
  },
  {
    id: "9012345",
    empresa: "Soluções Futuras",
    solicitante: "Fernando Silva",
    created_at: "2024-03-16T15:55:00",
    statusAtual: 4
  },
  {
    id: "4321098",
    empresa: "Tech Avançada",
    solicitante: "Camila Oliveira",
    created_at: "2024-03-15T09:30:00",
    statusAtual: 5
  },
  {
    id: "6789012",
    empresa: "Inovação Digital",
    solicitante: "André Costa",
    created_at: "2024-03-14T11:45:00",
    statusAtual: 6
  },
  {
    id: "0123456",
    empresa: "Futuro Tech",
    solicitante: "Thiago Santos",
    created_at: "2024-03-13T14:00:00",
    statusAtual: 7
  }
]

// Dados de estatísticas das vagas
const estatisticasVagas = {
  totalVagas: 15,
  totalNegros: 5,
  totalPCD: 3,
  totalMulheres: 7,
  totalHomens: 8
}

// Adicione os mocks dos novos arquivos
const arquivosMock = {
  vagasCadastradas: [
    {
      id: "1",
      uf: "SP",
      cidade: "São Paulo",
      codigo_ibge: 3550308,
      vagas: 3,
      cargo: "Desenvolvedor Full Stack",
      bairro: "Vila Mariana",
      pcd: false,
      link: "https://exemplo.com/vaga1"
    },
    {
      id: "2",
      uf: "RJ",
      cidade: "Rio de Janeiro",
      codigo_ibge: 3304557,
      vagas: 2,
      cargo: "Analista de Sistemas",
      bairro: "Barra da Tijuca",
      pcd: true,
      link: "https://exemplo.com/vaga2"
    }
  ],
  envioOuvidoria: {
    id: "2",
    nome: "Envio_Ouvidoria_TechCorp.pdf",
    tamanho: "1.8 MB",
    data: "2024-04-03T10:15:00"
  },
  retornoOuvidoria: null as {
    id: string;
    nome: string;
    tamanho: string;
    data: string;
  } | null,
  candidatosInteressados: null as {
    id: string;
    nome: string;
    tamanho: string;
    data: string;
  } | null
}

export default function DetalhamentoDemanda() {
  const navigate = useNavigate()
  const [loading] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(demandaMock.statusAtual)
  const [editForm, setEditForm] = useState({
    empresa: '',
    solicitante: '',
    id: demandaMock.id
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showAddVagaModal, setShowAddVagaModal] = useState(false)
  const [newVaga, setNewVaga] = useState({
    uf: '',
    cidade: '',
    codigo_ibge: '',
    vagas: '',
    cargo: '',
    bairro: '',
    pcd: false,
    link: ''
  })

  const handleStatusChange = async (newStatus: number) => {
    try {
      // Aqui virá a lógica de atualização no banco
      console.log('Atualizando status para:', newStatus)
      setSelectedStatus(newStatus)
      setIsStatusModalOpen(false)
      // Atualizar dados após confirmação
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      // Aqui virá a lógica de download do arquivo
      console.log('Baixando arquivo:', fileName)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
    }
  }

  const handleUpload = async (statusId: number) => {
    // Aqui virá a lógica de upload
    console.log('Upload para o status:', statusId)
  }

  const handleDelete = async (fileId: string) => {
    // Aqui virá a lógica de delete
    console.log('Deletando arquivo:', fileId)
  }

  const handleEdit = () => {
    setEditForm({
      empresa: demandaMock.empresa || '',
      solicitante: demandaMock.solicitante || '',
      id: demandaMock.id
    })
    setIsEditing(true)
  }

  const handleAddVaga = () => {
    // Aqui virá a lógica para adicionar uma nova vaga
    console.log('Adicionando vaga:', newVaga)
    setShowAddVagaModal(false)
    // Limpar formulário
    setNewVaga({
      uf: '',
      cidade: '',
      codigo_ibge: '',
      vagas: '',
      cargo: '',
      bairro: '',
      pcd: false,
      link: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setNewVaga({
        ...newVaga,
        [name]: checkbox.checked
      })
    } else {
      setNewVaga({
        ...newVaga,
        [name]: value
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-500">
            Detalhes da Solicitação - Nº {demandaMock.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualize e gerencie os detalhes desta solicitação
          </p>
        </div>
        <button
          onClick={() => navigate('/vagas-solicitacoes')}
          className="flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Voltar
        </button>
      </div>

      {/* Ajuste na estrutura principal do layout */}
      <div className="flex gap-6 h-full">
        {/* Coluna da esquerda - Timeline */}
        <div className="w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-cyan-600 font-medium"
              >
                Atualizar
              </button>
            </div>
            <StatusTimeline currentStatus={demandaMock.statusAtual} />
          </div>
        </div>

        {/* Coluna da direita - Informações e Arquivos */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* Card de Informações */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Informações da Solicitação</h2>
              {!isEditing && (
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
                  <p className="text-gray-900">{demandaMock.empresa}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Data da Solicitação
                </label>
                <p className="text-gray-900">{new Date(demandaMock.created_at).toLocaleDateString('pt-BR')}</p>
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
                  <p className="text-gray-900">{demandaMock.solicitante}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  ID da Demanda
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.id}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                ) : (
                  <p className="text-gray-900">{demandaMock.id}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Aqui virá a lógica de salvar as alterações
                    setIsEditing(false)
                  }}
                  className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>

          {/* Card de Informações Adicionais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total de Vagas</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{estatisticasVagas.totalVagas}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Total de Negros</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{estatisticasVagas.totalNegros}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Total PCD</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{estatisticasVagas.totalPCD}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-800">Total de Mulheres</p>
                    <p className="text-2xl font-bold text-pink-900 mt-1">{estatisticasVagas.totalMulheres}</p>
                  </div>
                  <div className="bg-pink-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-800">Total de Homens</p>
                    <p className="text-2xl font-bold text-indigo-900 mt-1">{estatisticasVagas.totalHomens}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Arquivos */}
          <div className="grid grid-cols-2 gap-6">
            {/* Enviado para Ouvidoria */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviado para Ouvidoria</h2>
              {arquivosMock.envioOuvidoria ? (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <PaperClipIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{arquivosMock.envioOuvidoria.nome}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span>{arquivosMock.envioOuvidoria.tamanho}</span>
                          <span>•</span>
                          <span>{new Date(arquivosMock.envioOuvidoria.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(arquivosMock.envioOuvidoria.id, arquivosMock.envioOuvidoria.nome)}
                        className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                      >
                        Baixar
                      </button>
                      <button
                        onClick={() => handleDelete(arquivosMock.envioOuvidoria.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-4">Nenhum arquivo enviado</p>
                  <button
                    onClick={() => handleUpload(7)}
                    className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                  >
                    Fazer Upload
                  </button>
                </div>
              )}
            </div>

            {/* Retorno da Ouvidoria */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Retorno da Ouvidoria</h2>
              {arquivosMock.retornoOuvidoria ? (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <PaperClipIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{arquivosMock.retornoOuvidoria.nome}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{arquivosMock.retornoOuvidoria.tamanho}</span>
                        <span>•</span>
                        <span>{new Date(arquivosMock.retornoOuvidoria.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(arquivosMock.retornoOuvidoria!.id, arquivosMock.retornoOuvidoria!.nome)}
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                    >
                      Baixar
                    </button>
                    <button
                      onClick={() => handleDelete(arquivosMock.retornoOuvidoria!.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <ArrowUpTrayIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-4">Nenhum arquivo enviado</p>
                  <button
                    onClick={() => handleUpload(9)}
                    className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                  >
                    Fazer Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Atualização de Status */}
      <Transition appear show={isStatusModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-10" 
          onClose={() => setIsStatusModalOpen(false)}
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
                    Atualizar Status da Solicitação
                  </Dialog.Title>
                  
                  <div className="mt-4 space-y-4">
                    {STATUS_LIST.map((status) => (
                      <div
                        key={status.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedStatus === status.id
                            ? 'bg-blue-50 border-blue-200 border'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => handleStatusChange(status.id)}
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            selectedStatus === status.id ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <span className={`${
                            selectedStatus === status.id ? 'text-blue-700 font-medium' : 'text-gray-700'
                          }`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsStatusModalOpen(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de Adicionar Vaga */}
      <Transition appear show={showAddVagaModal} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-10" 
          onClose={() => setShowAddVagaModal(false)}
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Adicionar Nova Vaga
                  </Dialog.Title>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="uf" className="block text-sm font-medium text-gray-700 mb-1">
                        UF <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="uf"
                        name="uf"
                        value={newVaga.uf}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        value={newVaga.cidade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="codigo_ibge" className="block text-sm font-medium text-gray-700 mb-1">
                        Código IBGE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="codigo_ibge"
                        name="codigo_ibge"
                        value={newVaga.codigo_ibge}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="vagas" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Vagas <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="vagas"
                        name="vagas"
                        value={newVaga.vagas}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="cargo"
                        name="cargo"
                        value={newVaga.cargo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        id="bairro"
                        name="bairro"
                        value={newVaga.bairro}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                        Link
                      </label>
                      <input
                        type="text"
                        id="link"
                        name="link"
                        value={newVaga.link}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="pcd"
                        name="pcd"
                        checked={newVaga.pcd}
                        onChange={(e) => setNewVaga({...newVaga, pcd: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pcd" className="ml-2 block text-sm font-medium text-gray-700">
                        Pessoa com Deficiência (PCD)
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowAddVagaModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleAddVaga}
                    >
                      Adicionar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Preview dos Dados Salvos pela Empresa */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Dados Salvos pela Empresa</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código IBGE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vagas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escolaridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PCD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bairro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosExemplo.flatMap(item => 
                (item.vagas || []).map(vaga => (
                  <tr key={vaga.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.uf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.cidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.codigo_ibge}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.vagas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.cargo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.escolaridade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.pcd ? "Sim" : "Não"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vaga.bairro}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a 
                        href={vaga.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver link
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 