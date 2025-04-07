import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { databases, storage } from '../../config/appwrite'
import { APPWRITE_CONFIG } from '../../config/appwrite'
import { ID } from 'appwrite'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowDownTrayIcon, ArrowUpTrayIcon, InformationCircleIcon, CheckCircleIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

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

// Sugestões de cargos comuns
const SUGESTOES_CARGOS = [
  'Analista de Sistemas',
  'Desenvolvedor',
  'Engenheiro de Software',
  'Analista de Suporte',
  'Analista de Infraestrutura',
  'Analista de Redes',
  'Analista de Segurança',
  'Analista de Dados',
  'Cientista de Dados',
  'Analista de BI',
  'Analista de QA',
  'Analista de Testes',
  'Analista de Projetos',
  'Gerente de TI',
  'Arquiteto de Software',
  'DevOps',
  'DBA',
  'Analista de Help Desk',
  'Analista de Service Desk',
  'Analista de NOC'
]

interface VagaItem {
  id: string
  uf: string
  cidade: string
  codigo_ibge: number
  vagas: number
  cargo: string
  bairro?: string
  pcd: boolean
  link?: string
  criadoPor?: string
  dataCriacao?: string
}

export default function SolicitacaoVagas() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [vagaItems, setVagaItems] = useState<VagaItem[]>([])
  
  // Estados para dados da API do IBGE
  const [estados, setEstados] = useState<EstadoIBGE[]>([])
  const [municipios, setMunicipios] = useState<MunicipioIBGE[]>([])
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [loadingMunicipios, setLoadingMunicipios] = useState(false)
  
  // Estado para o formulário
  const [formData, setFormData] = useState({
    uf: '',
    cidade: '',
    codigoIBGE: '',
    numeroVagas: '',
    cargo: '',
    bairro: '',
    pcd: false,
    link: ''
  })
  
  // Estado para controle de erros
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Estado para sugestões de cargos filtradas
  const [cargoSuggestions, setCargoSuggestions] = useState<string[]>([])
  
  // Estado para mostrar/esconder sugestões de cargos
  const [showCargoSuggestions, setShowCargoSuggestions] = useState(false)

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

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: checkbox.checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    // Limpar erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
    
    // Filtrar sugestões de cargos
    if (name === 'cargo') {
      const filtered = SUGESTOES_CARGOS.filter(cargo => 
        cargo.toLowerCase().includes(value.toLowerCase())
      )
      setCargoSuggestions(filtered)
      setShowCargoSuggestions(true)
    }
  }
  
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
  
  // Função para selecionar uma sugestão de cargo
  const handleCargoSuggestionClick = (cargo: string) => {
    setFormData({
      ...formData,
      cargo
    })
    setShowCargoSuggestions(false)
  }
  
  // Função para validar o formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.uf) newErrors.uf = 'UF é obrigatória'
    if (!formData.cidade) newErrors.cidade = 'Cidade é obrigatória'
    if (!formData.codigoIBGE) newErrors.codigoIBGE = 'Código IBGE é obrigatório'
    if (!formData.numeroVagas) newErrors.numeroVagas = 'Número de vagas é obrigatório'
    if (isNaN(Number(formData.numeroVagas)) || Number(formData.numeroVagas) <= 0) {
      newErrors.numeroVagas = 'Número de vagas deve ser um número positivo'
    }
    if (!formData.cargo) newErrors.cargo = 'Cargo é obrigatório'
    
    // Validar URL se fornecida
    if (formData.link && !isValidUrl(formData.link)) {
      newErrors.link = 'URL inválida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
  
  // Função para adicionar item à lista
  const handleAddItem = () => {
    if (!validateForm()) return
    
    const newItem: VagaItem = {
      id: ID.unique(),
      uf: formData.uf,
      cidade: formData.cidade,
      codigo_ibge: parseInt(formData.codigoIBGE),
      vagas: Number(formData.numeroVagas),
      cargo: formData.cargo,
      bairro: formData.bairro || undefined,
      pcd: formData.pcd,
      link: formData.link || undefined,
      criadoPor: user?.email || undefined,
      dataCriacao: new Date().toISOString()
    }
    
    setVagaItems([...vagaItems, newItem])
    
    // Limpar formulário
    setFormData({
      uf: '',
      cidade: '',
      codigoIBGE: '',
      numeroVagas: '',
      cargo: '',
      bairro: '',
      pcd: false,
      link: ''
    })
    
    toast.success('Item adicionado com sucesso!')
  }
  
  // Função para remover item da lista
  const handleRemoveItem = (id: string) => {
    setVagaItems(vagaItems.filter(item => item.id !== id))
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
      Link: item.link || ''
    }))
    
    // Aqui você implementaria a lógica para exportar para Excel
    // Por enquanto, apenas mostraremos uma mensagem
    console.log('Dados para exportar:', dadosParaExportar)
    toast.success('Exportação para Excel iniciada!')
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Solicitação de Vagas
          </h1>
          <p className="mt-2 text-gray-600">
            Adicione suas solicitações de vagas de forma rápida e organizada
          </p>
        </div>

        <div className="space-y-8">
          {/* 01. Formulário de Adição */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              01. Adicionar Vaga
            </h2>

            <form className="space-y-6">
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

              {/* Campos de Cargo, Bairro e Link em uma linha separada */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                      onFocus={() => setShowCargoSuggestions(true)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cargo ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {showCargoSuggestions && cargoSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {cargoSuggestions.map((cargo, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleCargoSuggestionClick(cargo)}
                          >
                            {cargo}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.cargo && <p className="mt-1 text-sm text-red-500">{errors.cargo}</p>}
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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pcd"
                    name="pcd"
                    checked={formData.pcd}
                    onChange={(e) => setFormData({...formData, pcd: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pcd" className="ml-2 block text-sm font-medium text-gray-700">
                    Pessoa com Deficiência (PCD) <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.pcd && <p className="mt-1 text-sm text-red-500">{errors.pcd}</p>}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddItem}
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
              {vagaItems.length > 0 && (
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Exportar para Excel
                </button>
              )}
            </div>

            {vagaItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma vaga adicionada ainda.</p>
                <p className="text-sm mt-2">Adicione vagas usando o formulário acima.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                        Bairro
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PCD
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
                          {item.bairro || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.pcd ? 'Sim' : 'Não'}
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
                            onClick={() => handleRemoveItem(item.id)}
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

          {/* 03. Importante */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  03. Importante: Padrões para preenchimento
                </h2>
                
                {/* Tabela de Campos */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-blue-500 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Campo</th>
                        <th className="px-4 py-2 text-left">Formato Esperado</th>
                        <th className="px-4 py-2 text-left">Obrigatório</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      <tr>
                        <td className="px-4 py-2 font-medium">UF</td>
                        <td className="px-4 py-2">Sigla do estado (Ex: SP, RJ, MG)</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Cidade</td>
                        <td className="px-4 py-2">Nome completo (Ex: São Paulo, Rio de Janeiro)</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Código IBGE</td>
                        <td className="px-4 py-2">Código numérico do município</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Número de Vagas</td>
                        <td className="px-4 py-2">Número inteiro (Ex: 1, 2, 3)</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Cargo</td>
                        <td className="px-4 py-2">Nome do cargo por extenso</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Bairro</td>
                        <td className="px-4 py-2">Nome do bairro ou região</td>
                        <td className="px-4 py-2 text-gray-500">Não</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">PCD</td>
                        <td className="px-4 py-2">"Sim" ou "Não"</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Link</td>
                        <td className="px-4 py-2">URL completa da vaga</td>
                        <td className="px-4 py-2 text-gray-500">Não</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Observações */}
                <div className="mt-4">
                  <p className="font-medium mb-2">Observações:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 ml-2">
                    <li>Preencha todos os campos obrigatórios</li>
                    <li>Respeite o formato de cada campo conforme indicado</li>
                    <li>O código IBGE é preenchido automaticamente ao selecionar a cidade</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 