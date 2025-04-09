import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  ClockIcon, 
  CheckCircleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../../contexts/AuthContext'
import Swal from 'sweetalert2'
import { toast } from 'react-hot-toast'
import { databases } from '../../../config/appwrite'
import { APPWRITE_CONFIG } from '../../../config/appwrite'

// Definindo o tipo para as solicitações de vagas
interface JobRequest {
  $id: string
  demand_id: string
  empresa: string
  assigned_to?: string
  requester_name: string
  created_at: string
  status: string
}

// Reusing StatusBadge component from ListaSolicitacoes
export function StatusBadge({ status }: { status: string }) {
  const styles = {
    pendente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    extraindo_candidatos: 'bg-blue-100 text-blue-800 border border-blue-200',
    processando_lista: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    aguardando_cadastro_vagas: 'bg-purple-100 text-purple-800 border border-purple-200',
    aguardando_cadastro: 'bg-pink-100 text-pink-800 border border-pink-200',
    lista_cadastrada: 'bg-red-100 text-red-800 border border-red-200',
    enviado_ouvidoria: 'bg-orange-100 text-orange-800 border border-orange-200',
    aguardando_retorno: 'bg-amber-100 text-amber-800 border border-amber-200',
    retorno_recebido: 'bg-lime-100 text-lime-800 border border-lime-200',
    extraindo_interessados: 'bg-green-100 text-green-800 border border-green-200',
    encaminhados_empresa: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    concluido: 'bg-teal-100 text-teal-800 border border-teal-200'
  }

  const icons = {
    pendente: ClockIcon,
    extraindo_candidatos: ClockIcon,
    processando_lista: ClockIcon,
    aguardando_cadastro_vagas: ClockIcon,
    aguardando_cadastro: ClockIcon,
    lista_cadastrada: ClockIcon,
    enviado_ouvidoria: ClockIcon,
    aguardando_retorno: ClockIcon,
    retorno_recebido: ClockIcon,
    extraindo_interessados: ClockIcon,
    encaminhados_empresa: ClockIcon,
    concluido: CheckCircleIcon
  }

  const labels = {
    pendente: 'Pendente',
    extraindo_candidatos: 'Extraindo Candidatos',
    processando_lista: 'Processando Lista',
    aguardando_cadastro_vagas: 'Aguardando Cadastro de Vagas',
    aguardando_cadastro: 'Aguardando Cadastro',
    lista_cadastrada: 'Lista Cadastrada',
    enviado_ouvidoria: 'Enviado para Ouvidoria',
    aguardando_retorno: 'Aguardando Retorno',
    retorno_recebido: 'Retorno Recebido',
    extraindo_interessados: 'Extraindo Interessados',
    encaminhados_empresa: 'Encaminhados para Empresa',
    concluido: 'Concluído'
  }

  const Icon = icons[status as keyof typeof icons] || icons.pendente

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pendente} shadow-sm`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

const formatarData = (data: string) => {
  try {
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}

// Helper function to generate 7-digit random number
const generateDemandId = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

function ListaSolicitacoesVagas() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [requests, setRequests] = useState<JobRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<JobRequest[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Comment out the actual API call while testing
        /*const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.JOB_REQUESTS,
          [
            Query.orderDesc('created_at')
          ]
        );
        
        const requests = response.documents as unknown as JobRequest[];*/
        
        // Use example data instead
        const exampleData: JobRequest[] = [
          {
            $id: 'VAG001',
            demand_id: '5356148',
            empresa: 'TechCorp Solutions',
            assigned_to: 'Carlos Rodrigues',
            requester_name: 'João Silva',
            created_at: new Date().toISOString(),
            status: 'pendente'
          },
          {
            $id: 'VAG002',
            demand_id: '7845962',
            empresa: 'Inovação Digital',
            assigned_to: 'Ana Paula',
            requester_name: 'Maria Santos',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'extraindo_candidatos'
          },
          {
            $id: 'VAG003',
            demand_id: '2369841',
            empresa: 'Futuro Tecnologia',
            assigned_to: 'Roberto Lima',
            requester_name: 'Pedro Oliveira',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            status: 'concluido'
          },
          {
            $id: 'VAG004',
            demand_id: '9874563',
            empresa: 'Soluções Avançadas',
            assigned_to: undefined,
            requester_name: 'Ana Souza',
            created_at: new Date(Date.now() - 259200000).toISOString(),
            status: 'aguardando_cadastro'
          },
          {
            $id: 'VAG005',
            demand_id: '1234567',
            empresa: 'Empresa ABC',
            assigned_to: 'Lucas Fontoura',
            requester_name: 'Carlos Mendes',
            created_at: new Date(Date.now() - 345600000).toISOString(),
            status: 'processando_lista'
          },
          {
            $id: 'VAG006',
            demand_id: '7654321',
            empresa: 'XYZ Tecnologia',
            assigned_to: 'Mariana Costa',
            requester_name: 'Roberto Alves',
            created_at: new Date(Date.now() - 432000000).toISOString(),
            status: 'aguardando_cadastro_vagas'
          },
          {
            $id: 'VAG007',
            demand_id: '9876543',
            empresa: 'Inovação & Cia',
            assigned_to: 'Pedro Santos',
            requester_name: 'Ana Beatriz',
            created_at: new Date(Date.now() - 518400000).toISOString(),
            status: 'lista_cadastrada'
          },
          {
            $id: 'VAG008',
            demand_id: '3456789',
            empresa: 'Futuro Digital',
            assigned_to: 'Juliana Lima',
            requester_name: 'Marcos Oliveira',
            created_at: new Date(Date.now() - 604800000).toISOString(),
            status: 'enviado_ouvidoria'
          },
          {
            $id: 'VAG009',
            demand_id: '8765432',
            empresa: 'Soluções Integradas',
            assigned_to: 'Fernando Silva',
            requester_name: 'Patrícia Souza',
            created_at: new Date(Date.now() - 691200000).toISOString(),
            status: 'aguardando_retorno'
          },
          {
            $id: 'VAG010',
            demand_id: '2345678',
            empresa: 'Tech Solutions',
            assigned_to: 'Camila Oliveira',
            requester_name: 'Ricardo Mendes',
            created_at: new Date(Date.now() - 777600000).toISOString(),
            status: 'retorno_recebido'
          },
          {
            $id: 'VAG011',
            demand_id: '6543210',
            empresa: 'Digital Systems',
            assigned_to: 'André Costa',
            requester_name: 'Luciana Alves',
            created_at: new Date(Date.now() - 864000000).toISOString(),
            status: 'extraindo_interessados'
          },
          {
            $id: 'VAG012',
            demand_id: '8901234',
            empresa: 'Inovação Avançada',
            assigned_to: 'Thiago Santos',
            requester_name: 'Mariana Beatriz',
            created_at: new Date(Date.now() - 950400000).toISOString(),
            status: 'encaminhados_empresa'
          },
          {
            $id: 'VAG013',
            demand_id: '4567890',
            empresa: 'Futuro & Presente',
            assigned_to: 'Bianca Lima',
            requester_name: 'Felipe Oliveira',
            created_at: new Date(Date.now() - 1036800000).toISOString(),
            status: 'concluido'
          },
          {
            $id: 'VAG014',
            demand_id: '7890123',
            empresa: 'Soluções do Amanhã',
            assigned_to: 'Rafael Silva',
            requester_name: 'Carla Souza',
            created_at: new Date(Date.now() - 1123200000).toISOString(),
            status: 'pendente'
          },
          {
            $id: 'VAG015',
            demand_id: '3210987',
            empresa: 'Tech do Futuro',
            assigned_to: 'Amanda Oliveira',
            requester_name: 'Bruno Mendes',
            created_at: new Date(Date.now() - 1209600000).toISOString(),
            status: 'extraindo_candidatos'
          }
        ];

        setRequests(exampleData);
        setFilteredRequests(exampleData);
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        toast.error('Erro ao carregar solicitações de vagas');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const filtered = searchTerm
      ? requests.filter(r => 
          r.$id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.demand_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : requests
    setFilteredRequests(filtered)
  }, [searchTerm, requests])

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter esta ação!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        // For example data, just remove from the state
        const updatedRequests = requests.filter(r => r.$id !== id);
        setRequests(updatedRequests);
        setFilteredRequests(updatedRequests);
        
        // Reset to first page if we're on the last page and deleting the last item
        const newTotalPages = Math.ceil(updatedRequests.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
        toast.success('Solicitação excluída com sucesso');
      } catch (error) {
        console.error('Erro ao excluir solicitação:', error);
        toast.error('Erro ao excluir solicitação');
      }
    }
  }

  // Cálculos para paginação
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredRequests.slice(startIndex, endIndex)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Lista de Solicitações de Vagas
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID, empresa ou número da demanda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-96 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº da Demanda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Filtro na primeira linha */}
              <tr className="bg-gray-50">
                <td className="px-6 py-3">
                  <input
                    type="text"
                    placeholder="Filtrar por ID"
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      const filtered = value
                        ? requests.filter(r => r.demand_id.toLowerCase().includes(value))
                        : requests;
                      setFilteredRequests(filtered);
                    }}
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    placeholder="Filtrar por empresa"
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      const filtered = value
                        ? requests.filter(r => r.empresa.toLowerCase().includes(value))
                        : requests;
                      setFilteredRequests(filtered);
                    }}
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="text"
                    placeholder="Filtrar por data"
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      const filtered = value
                        ? requests.filter(r => new Date(r.created_at).toLocaleDateString('pt-BR').includes(value))
                        : requests;
                      setFilteredRequests(filtered);
                    }}
                  />
                </td>
                <td className="px-6 py-3">
                  <select
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const value = e.target.value;
                      const filtered = value
                        ? requests.filter(r => r.status === value)
                        : requests;
                      setFilteredRequests(filtered);
                    }}
                  >
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="extraindo_candidatos">Extraindo Candidatos</option>
                    <option value="processando_lista">Processando Lista</option>
                    <option value="aguardando_cadastro_vagas">Aguardando Cadastro de Vagas</option>
                    <option value="aguardando_cadastro">Aguardando Cadastro</option>
                    <option value="lista_cadastrada">Lista Cadastrada</option>
                    <option value="enviado_ouvidoria">Enviado para Ouvidoria</option>
                    <option value="aguardando_retorno">Aguardando Retorno</option>
                    <option value="retorno_recebido">Retorno Recebido</option>
                    <option value="extraindo_interessados">Extraindo Interessados</option>
                    <option value="encaminhados_empresa">Encaminhados para Empresa</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => setFilteredRequests(requests)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Limpar
                  </button>
                </td>
              </tr>
              {currentItems.map((request) => (
                <tr 
                  key={request.$id} 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/vagas/detalhes-solicitacao/${request.demand_id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {request.demand_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.empresa}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDelete(request.$id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-center gap-2 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>

            <span className="ml-4 text-sm text-gray-500">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} de {filteredRequests.length}
            </span>
          </div>
        )}
      </div>

      {filteredRequests.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhuma solicitação de vaga encontrada.
          </p>
        </div>
      )}
    </div>
  )
}

export default ListaSolicitacoesVagas 