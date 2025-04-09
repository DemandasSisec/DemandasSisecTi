import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { databases, storage } from '../../../../config/appwrite'
import { APPWRITE_CONFIG } from '../../../../config/appwrite'
import { ID } from 'appwrite'
import { useAuth } from '../../../../contexts/AuthContext'
import { CheckCircleIcon, PlusIcon, TrashIcon, CloudArrowUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import './NSEmprego.module.css'
import Swal from 'sweetalert2'

// Interface para os dados da API do IBGE
interface EstadoIBGE {
  id: number
  sigla: string
  nome: string
}

interface MunicipioIBGE {
  id: number
  nome: string
}

interface VagaItem {
  id: string
  uf: string
  cidade: string
  codigo_ibge: number
  vagas: number
  cargo: string
  bairro?: string
  pcd: boolean | undefined
  link?: string
  escolaridade?: string
  escolaridade_texto?: string
  criadoPor?: string
  dataCriacao?: string
}

export default function SolicitacaoVagas() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [vagaItems, setVagaItems] = useState<VagaItem[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Estados para dados da API do IBGE
  const [estados, setEstados] = useState<EstadoIBGE[]>([])
  const [municipios, setMunicipios] = useState<MunicipioIBGE[]>([])
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [loadingMunicipios, setLoadingMunicipios] = useState(false)
  
  // Estados para o formulário
  const [formData, setFormData] = useState({
    uf: '',
    cidade: '',
    codigoIBGE: '',
    numeroVagas: '',
    cargo: '',
    bairro: '',
    pcd: false,
    link: '',
    escolaridade: ''
  })
  
  // Estado para erros de validação
  const [errors, setErrors] = useState<{
    uf: string;
    cidade: string;
    codigoIBGE: string;
    numeroVagas: string;
    cargo: string;
    bairro: string;
    pcd: string;
    link: string;
    escolaridade: string;
  }>({
    uf: '',
    cidade: '',
    codigoIBGE: '',
    numeroVagas: '',
    cargo: '',
    bairro: '',
    pcd: '',
    link: '',
    escolaridade: ''
  })
  
  // Estado para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estado para controlar o loading
  const [isLoading, setIsLoading] = useState(false)
  
  // Estado para controlar a mensagem de sucesso
  const [successMessage, setSuccessMessage] = useState('')

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    console.log('Tentando carregar dados do localStorage')
    const savedItems = localStorage.getItem('vagaItems')
    console.log('Dados encontrados no localStorage:', savedItems)
    
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems)
        console.log('Dados parseados do localStorage:', parsedItems)
        setVagaItems(parsedItems)
      } catch (error) {
        console.error('Erro ao carregar itens do localStorage:', error)
      }
    } else {
      console.log('Nenhum dado encontrado no localStorage')
    }
  }, [])

  // Salvar no localStorage quando vagaItems mudar
  useEffect(() => {
    console.log('Salvando no localStorage:', vagaItems)
    try {
      localStorage.setItem('vagaItems', JSON.stringify(vagaItems))
      console.log('Dados salvos com sucesso no localStorage')
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
    }
  }, [vagaItems])

  // Carregar estados ao montar o componente
  useEffect(() => {
    const fetchEstados = async () => {
      setLoadingEstados(true)
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        if (!response.ok) {
          throw new Error('Erro ao carregar estados')
        }
        const data = await response.json()
        // Ordenar estados por nome
        const estadosOrdenados = data.sort((a: EstadoIBGE, b: EstadoIBGE) => 
          a.nome.localeCompare(b.nome, 'pt-BR')
        )
        setEstados(estadosOrdenados)
      } catch (error) {
        console.error('Erro ao carregar estados:', error)
        toast.error('Erro ao carregar lista de estados')
      } finally {
        setLoadingEstados(false)
      }
    }

    fetchEstados()
  }, [])

  // Carregar municípios quando a UF for selecionada
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!formData.uf) {
        setMunicipios([])
        return
      }

      setLoadingMunicipios(true)
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.uf}/municipios`)
        if (!response.ok) {
          throw new Error('Erro ao carregar municípios')
        }
        const data = await response.json()
        // Ordenar municípios por nome
        const municipiosOrdenados = data.sort((a: MunicipioIBGE, b: MunicipioIBGE) => 
          a.nome.localeCompare(b.nome, 'pt-BR')
        )
        setMunicipios(municipiosOrdenados)
      } catch (error) {
        console.error('Erro ao carregar municípios:', error)
        toast.error('Erro ao carregar lista de municípios')
      } finally {
        setLoadingMunicipios(false)
      }
    }

    fetchMunicipios()
  }, [formData.uf])

  // Monitorar mudanças no estado vagaItems
  useEffect(() => {
    console.log('Estado vagaItems atualizado:', vagaItems);
  }, [vagaItems]);

  const downloadModelo = () => {
    // URL do seu arquivo modelo
    const modeloUrl = '/modelos/Modelo_Solicitacao_Lista.xlsx'
    
    // Fazer download do arquivo
    const link = document.createElement('a')
    link.href = modeloUrl
    link.download = 'Modelo_Solicitacao_Lista.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const arquivo = e.target.files[0]
      
      // Verificar se é um arquivo xlsx
      if (!arquivo.name.endsWith('.xlsx')) {
        toast.error('Por favor, envie apenas arquivos .xlsx')
        return
      }

      setFile(arquivo)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Por favor, selecione um arquivo')
      return
    }

    setLoading(true)

    try {
      // Upload do arquivo no Appwrite
      const uploadResult = await storage.createFile(
        APPWRITE_CONFIG.storage.VAGAS_FILES,
        ID.unique(),
        file
      )

      // Criar documento com referência ao arquivo
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.VAGAS,
        ID.unique(),
        {
          titulo: file.name.replace('.xlsx', ''),
          created_at: new Date().toISOString(),
          requester_id: user?.$id,
          status: 'pending',
          arquivo_id: uploadResult.$id
        }
      )

      toast.success('Arquivo enviado com sucesso!')
      setFile(null)
      
      // Limpar input file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error)
      toast.error('Erro ao enviar arquivo')
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com mudanças nos campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Atualiza o estado do formulário
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Função para lidar com mudança de UF
  const handleUfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uf = e.target.value
    
    // Se uma UF foi selecionada, carregar as cidades automaticamente
    if (uf) {
      // Limpar cidade e código IBGE
      setFormData({
        ...formData,
        uf,
        cidade: '',
        codigoIBGE: ''
      })
    } else {
      // Se nenhuma UF foi selecionada, limpar todos os campos relacionados
      setFormData({
        ...formData,
        uf: '',
        cidade: '',
        codigoIBGE: ''
      })
    }
  }
  
  // Função para lidar com mudança de cidade
  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cidade = e.target.value
    
    if (cidade) {
      // Encontrar a cidade selecionada para obter o código IBGE
      const cidadeSelecionada = municipios.find(m => m.nome === cidade)
      
      if (cidadeSelecionada) {
        setFormData({
          ...formData,
          cidade,
          codigoIBGE: cidadeSelecionada.id.toString()
        })
      }
    } else {
      setFormData({
        ...formData,
        cidade: '',
        codigoIBGE: ''
      })
    }
  }
  
  // Função para validar o formulário
  const validateForm = () => {
    const newErrors = {
      uf: '',
      cidade: '',
      codigoIBGE: '',
      numeroVagas: '',
      cargo: '',
      bairro: '',
      pcd: '',
      link: '',
      escolaridade: ''
    }
    
    // Validar apenas os campos obrigatórios
    if (!formData.uf) newErrors.uf = 'UF é obrigatório'
    if (!formData.cidade) newErrors.cidade = 'Cidade é obrigatória'
    if (!formData.codigoIBGE) newErrors.codigoIBGE = 'Código IBGE é obrigatório'
    if (!formData.numeroVagas) newErrors.numeroVagas = 'Número de vagas é obrigatório'
    if (!formData.cargo) newErrors.cargo = 'Cargo é obrigatório'
    // Remover validações de campos opcionais
    // if (!formData.bairro) newErrors.bairro = 'Bairro é obrigatório'
    // if (formData.pcd === undefined) newErrors.pcd = 'PCD é obrigatório'
    // if (!formData.escolaridade) newErrors.escolaridade = 'Escolaridade é obrigatória'
    
    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }
  
  // Função para validar URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  // Função para adicionar um item à lista
  const handleAddItem = () => {
    console.log('Iniciando handleAddItem')
    console.log('FormData atual:', formData)
    
    if (validateForm()) {
      console.log('Formulário válido, criando novo item')
      const newItem: VagaItem = {
        id: Date.now().toString(),
        uf: formData.uf,
        cidade: formData.cidade,
        codigo_ibge: parseInt(formData.codigoIBGE),
        vagas: parseInt(formData.numeroVagas),
        cargo: formData.cargo,
        bairro: formData.bairro,
        pcd: formData.pcd,
        link: formData.link,
        escolaridade: mapearEscolaridadeParaSigla(formData.escolaridade),
        escolaridade_texto: formData.escolaridade,
        criadoPor: user?.email || '',
        dataCriacao: new Date().toISOString()
      }
      
      console.log('Novo item criado:', newItem)
      console.log('Itens atuais:', vagaItems)
      
      const updatedItems = [...vagaItems, newItem]
      console.log('Lista atualizada:', updatedItems)
      
      setVagaItems(updatedItems)
      localStorage.setItem('vagaItems', JSON.stringify(updatedItems))
      
      // Limpar o formulário
      setFormData({
        uf: '',
        cidade: '',
        codigoIBGE: '',
        numeroVagas: '',
        cargo: '',
        bairro: '',
        pcd: false,
        link: '',
        escolaridade: ''
      })
      
      // Fechar o modal
      setIsModalOpen(false)
      
      // Mostrar mensagem de sucesso
      toast.success('Vaga adicionada com sucesso!')
    } else {
      console.log('Formulário inválido, erros:', errors)
    }
  }
  
  // Função para remover item da lista
  const handleRemoveItem = (id: string) => {
    console.log('Removendo item com ID:', id)
    console.log('Itens antes da remoção:', vagaItems)
    
    // Verificar se o ID existe na lista
    const itemExists = vagaItems.some(item => item.id === id)
    if (!itemExists) {
      console.error('Item não encontrado na lista:', id)
      toast.error('Item não encontrado')
      return
    }
    
    // Criar uma nova lista com o item removido
    const updatedItems = vagaItems.filter(item => item.id !== id)
    
    console.log('Itens após a remoção:', updatedItems)
    
    // Atualizar o estado com a nova lista
    setVagaItems(updatedItems)
    
    // Salvar no localStorage
    localStorage.setItem('vagaItems', JSON.stringify(updatedItems))
    
    toast.success('Item removido com sucesso!')
  }
  
  // Função para exportar dados para Excel
  const handleExportToExcel = () => {
    if (vagaItems.length === 0) {
      toast.error('Não há itens para exportar')
      return
    }
    
    // Preparar dados para exportação
    const dadosParaExportar = vagaItems.map(item => ({
      UF: item.uf,
      Cidade: item.cidade,
      'Código IBGE': item.codigo_ibge,
      'Número de Vagas': item.vagas,
      Cargo: item.cargo,
      Bairro: item.bairro || '',
      PCD: item.pcd ? 'Sim' : 'Não',
      Link: item.link || '',
      'Escolaridade Mínima': item.escolaridade || ''
    }))
    
    // Aqui você implementaria a lógica para exportar para Excel
    // Por enquanto, apenas mostraremos uma mensagem
    console.log('Dados para exportar:', dadosParaExportar)
    toast.success('Exportação para Excel iniciada!')
  }

  // Função para salvar no banco de dados
  const handleSaveToDatabase = async () => {
    if (vagaItems.length === 0) {
      toast.error('Não há itens para salvar')
      return
    }

    console.log('Iniciando salvamento no banco de dados:', vagaItems)
    setSaving(true)
    
    try {
      // Criar documento com as vagas
      const result = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.VAGAS,
        ID.unique(),
        {
          titulo: `Solicitação de Vagas - ${new Date().toLocaleDateString()}`,
          created_at: new Date().toISOString(),
          requester_id: user?.$id,
          status: 'pending',
          vagas: vagaItems
        }
      )
      
      console.log('Documento criado com sucesso:', result)

      // Limpar o localStorage após salvar com sucesso
      localStorage.removeItem('vagaItems')
      console.log('LocalStorage limpo após salvamento')
      
      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true)
      
      // Limpar a lista de itens após salvar
      setVagaItems([])
      console.log('Lista de itens limpa após salvamento')
      
    } catch (error) {
      console.error('Erro ao salvar vagas:', error)
      toast.error('Erro ao salvar vagas')
    } finally {
      setSaving(false)
    }
  }

  // Função para iniciar uma nova solicitação
  const handleNewRequest = () => {
    setShowSuccessMessage(false)
    setFormData({
      uf: '',
      cidade: '',
      codigoIBGE: '',
      numeroVagas: '',
      cargo: '',
      bairro: '',
      pcd: false,
      link: '',
      escolaridade: ''
    })
  }

  // Função para mapear a escolaridade para a sigla
  const mapearEscolaridadeParaSigla = (escolaridade: string): string => {
    const mapeamento: Record<string, string> = {
      'Ensino Fundamental Completo': 'EFC',
      'Ensino Médio Incompleto': 'EMI',
      'Ensino Médio Completo': 'EMC',
      'Ensino Superior Incompleto': 'ESI',
      'Ensino Superior Completo': 'ESC',
      'Ensino Superior ou maior': 'ES+'
    }
    return mapeamento[escolaridade] || escolaridade
  }

  const handleDelete = async (id: string) => {
    console.log('Iniciando handleDelete para ID:', id);
    
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
        console.log('Confirmação recebida, removendo item');
        // Remove the item from the local state
        const updatedItems = vagaItems.filter(item => item.id !== id)
        console.log('Itens após remoção:', updatedItems);
        setVagaItems(updatedItems)
        
        // Salvar no localStorage
        localStorage.setItem('vagaItems', JSON.stringify(updatedItems))
        
        // If the item is already saved in the database, delete it
        if (id.startsWith('VAG')) {
          // This is a local ID, not a database ID, so no need to delete from database
          toast.success('Item removido com sucesso')
        } else {
          // This is a database ID, so delete from database
          await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.VAGAS,
            id
          )
          toast.success('Solicitação excluída com sucesso')
        }
      } catch (error) {
        console.error('Erro ao excluir solicitação:', error)
        toast.error('Erro ao excluir solicitação')
      }
    } else {
      console.log('Operação cancelada pelo usuário');
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Nova Solicitação - Emprego
          </h1>
          <p className="mt-2 text-gray-600">
            Adicione suas solicitações de vagas de forma rápida e organizada
          </p>
        </div>

        {/* Mensagem de sucesso */}
        {showSuccessMessage && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-green-800 mb-2">Dados enviados com sucesso!</h2>
              <p className="text-green-700 mb-4">Sua solicitação foi registrada no sistema e será processada em breve.</p>
              <button
                onClick={handleNewRequest}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Enviar uma nova solicitação
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* 01. Formulário de Adição */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              01. Adicionar Vaga
            </h2>

            <form 
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Formulário submetido, mas prevenindo comportamento padrão');
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* UF */}
                <div>
                  <label htmlFor="uf" className="block text-sm font-medium text-gray-700 mb-1">
                    UF <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="uf"
                    name="uf"
                    value={formData.uf}
                    onChange={handleUfChange}
                    disabled={loadingEstados}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.uf ? 'border-red-500' : 'border-gray-300'
                    } ${loadingEstados ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Selecione a UF</option>
                    {estados.map(estado => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.sigla} - {estado.nome}
                      </option>
                    ))}
                  </select>
                  {loadingEstados && <p className="mt-1 text-sm text-blue-500">Carregando estados...</p>}
                  {errors.uf && <p className="mt-1 text-sm text-red-500">{errors.uf}</p>}
                </div>

                {/* Cidade */}
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleCidadeChange}
                    disabled={!formData.uf || loadingMunicipios}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cidade ? 'border-red-500' : 'border-gray-300'
                    } ${!formData.uf || loadingMunicipios ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Selecione a cidade</option>
                    {municipios.map(municipio => (
                      <option key={municipio.id} value={municipio.nome}>
                        {municipio.nome}
                      </option>
                    ))}
                  </select>
                  {loadingMunicipios && <p className="mt-1 text-sm text-blue-500">Carregando cidades...</p>}
                  {errors.cidade && <p className="mt-1 text-sm text-red-500">{errors.cidade}</p>}
                </div>

                {/* Código IBGE */}
                <div>
                  <label htmlFor="codigoIBGE" className="block text-sm font-medium text-gray-700 mb-1">
                    Código IBGE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="codigoIBGE"
                    name="codigoIBGE"
                    value={formData.codigoIBGE}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 ${
                      errors.codigoIBGE ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.codigoIBGE && <p className="mt-1 text-sm text-red-500">{errors.codigoIBGE}</p>}
                </div>

                {/* Número de Vagas */}
                <div>
                  <label htmlFor="numeroVagas" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Vagas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="numeroVagas"
                    name="numeroVagas"
                    value={formData.numeroVagas}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.numeroVagas ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.numeroVagas && <p className="mt-1 text-sm text-red-500">{errors.numeroVagas}</p>}
                </div>
              </div>

              {/* Campos de Cargo, Escolaridade Mínima, Bairro e Link em uma linha separada */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                {/* Cargo */}
                <div>
                  <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cargo"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cargo ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.cargo && <p className="mt-1 text-sm text-red-500">{errors.cargo}</p>}
                </div>

                {/* Escolaridade */}
                <div>
                  <label htmlFor="escolaridade" className="block text-sm font-medium text-gray-700 mb-1">
                    Escolaridade Mínima <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="escolaridade"
                    value={formData.escolaridade}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.escolaridade ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione a escolaridade</option>
                    <option value="Ensino Fundamental Completo">Ensino Fundamental Completo</option>
                    <option value="Ensino Médio Incompleto">Ensino Médio Incompleto</option>
                    <option value="Ensino Médio Completo">Ensino Médio Completo</option>
                    <option value="Ensino Superior Incompleto">Ensino Superior Incompleto</option>
                    <option value="Ensino Superior Completo">Ensino Superior Completo</option>
                    <option value="Ensino Superior ou maior">Ensino Superior ou maior</option>
                  </select>
                  {errors.escolaridade && <p className="mt-1 text-sm text-red-500">{errors.escolaridade}</p>}
                </div>

                {/* Bairro */}
                <div>
                  <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Link */}
                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="text"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.link ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.link && <p className="mt-1 text-sm text-red-500">{errors.link}</p>}
                </div>
              </div>

              {/* PCD em uma linha separada */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pessoa com Deficiência (PCD) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Não</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.pcd === true}
                    onClick={() => setFormData({...formData, pcd: !formData.pcd})}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.pcd === true ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.pcd === true ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">Sim</span>
                </div>
                {errors.pcd && <p className="mt-1 text-sm text-red-500">{errors.pcd}</p>}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Botão Adicionar à Lista clicado');
                    handleAddItem();
                  }}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors shadow-md hover:shadow-lg"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Adicionar à Lista
                </button>
              </div>
            </form>
          </div>

          {/* 02. Tabela de Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                02. Lista de Vagas
              </h2>
              <div className="flex space-x-2">
                {vagaItems.length > 0 && (
                  <button
                    onClick={handleSaveToDatabase}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                        Enviar dados
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {vagaItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma vaga adicionada ainda.</p>
                <p className="text-sm mt-2">Adicione vagas usando o formulário acima.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Log para depuração */}
                {(() => { console.log('Renderizando tabela com', vagaItems.length, 'itens'); return null; })()}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UF
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cidade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código IBGE
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vagas
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Escolaridade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PCD
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bairro
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vagaItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.uf}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.cidade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.codigo_ibge}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.vagas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.cargo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.escolaridade || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.pcd === undefined ? '-' : (item.pcd ? 'Sim' : 'Não')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.bairro || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.link ? (
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Ver link
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              console.log('Botão de remoção clicado para item:', item.id);
                              handleDelete(item.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 