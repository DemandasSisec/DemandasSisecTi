import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusTimeline } from '../../components/StatusTimeline'
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
  statusAtual: 4
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
    responsavel: 'Lucas Fontoura'
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
      responsavel: 'Lucas Fontoura'
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
                  Responsável
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.responsavel}
                    onChange={(e) => setEditForm(prev => ({ ...prev, responsavel: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">Lucas Fontoura</p>
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

          {/* Vagas Cadastradas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Informações da Solicitação</h2>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">ID da Solicitação no Banco de Dados</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="font-mono text-lg font-bold">{demandaMock.id}</p>
                    <p className="mt-1">Este ID pode ser usado para referência em outras partes do sistema.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Cards de Arquivos */}
          <div className="grid grid-cols-2 gap-6 flex-1">
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

            {/* Candidatos Interessados */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidatos Interessados</h2>
              {arquivosMock.candidatosInteressados ? (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <PaperClipIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{arquivosMock.candidatosInteressados.nome}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{arquivosMock.candidatosInteressados.tamanho}</span>
                        <span>•</span>
                        <span>{new Date(arquivosMock.candidatosInteressados.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(arquivosMock.candidatosInteressados!.id, arquivosMock.candidatosInteressados!.nome)}
                      className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                    >
                      Baixar
                    </button>
                    <button
                      onClick={() => handleDelete(arquivosMock.candidatosInteressados!.id)}
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
                    onClick={() => handleUpload(11)}
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
    </div>
  )
} 