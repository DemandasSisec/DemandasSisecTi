import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { databases, storage } from '../../config/appwrite'
import { APPWRITE_CONFIG } from '../../config/appwrite'
import { ID } from 'appwrite'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowDownTrayIcon, ArrowUpTrayIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function SolicitacaoVagas() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Solicitação de Vagas
          </h1>
          <p className="mt-2 text-gray-600">
            Envie suas solicitações de vagas de forma rápida e organizada
          </p>
        </div>

        <div className="space-y-6">
          {/* 01. Enviar Solicitação */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              01. Enviar Solicitação
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div 
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors ${
                  file ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {file ? (
                  <div className="text-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-4" />
                    <p className="text-green-800 font-medium">{file.name}</p>
                    <p className="text-sm text-green-600 mt-1">
                      Arquivo selecionado
                    </p>
                  </div>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mb-4" />
                    <div className="text-center">
                      <p className="text-gray-600">
                        Arraste seu arquivo aqui ou
                      </p>
                      <p className="text-gray-500 mt-1">
                        clique para selecionar
                      </p>
                    </div>
                  </>
                )}

                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="arquivo"
                />
                <label
                  htmlFor="arquivo"
                  className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border border-blue-200"
                >
                  {file ? 'Trocar arquivo' : 'Selecionar Arquivo'}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </form>
          </div>

          {/* 02. Como solicitar vagas */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-start space-x-4">
              <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  02. Como solicitar vagas
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Passo 1 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-2">
                          1
                        </span>
                        <h3 className="font-medium text-gray-900">Download do Modelo</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Baixe o arquivo modelo Excel que contém a estrutura correta para preenchimento
                      </p>
                    </div>

                    {/* Passo 2 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-2">
                          2
                        </span>
                        <h3 className="font-medium text-gray-900">Preenchimento</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Preencha todas as informações necessárias seguindo o formato do modelo
                      </p>
                    </div>

                    {/* Passo 3 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-2">
                          3
                        </span>
                        <h3 className="font-medium text-gray-900">Salvar Arquivo</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Salve o arquivo no formato .xlsx mantendo a estrutura original
                      </p>
                    </div>

                    {/* Passo 4 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-2">
                          4
                        </span>
                        <h3 className="font-medium text-gray-900">Envio</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Faça o upload do arquivo preenchido utilizando o formulário ao lado
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={downloadModelo}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                      Baixar Arquivo Modelo
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                        <td className="px-4 py-2 font-medium">Escolaridade</td>
                        <td className="px-4 py-2">
                          EFC = Ensino Fundamental Completo<br />
                          EMI = Ensino Médio Incompleto<br />
                          EMC = Ensino Médio Completo<br />
                          ESI = Ensino Superior Incompleto<br />
                          ESC = Ensino Superior Completo<br />
                          ES+ = Ensino Superior com Pós-Graduação ou mais
                        </td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Faixa Etária</td>
                        <td className="px-4 py-2">
                          18-24 anos<br />
                          25-35 anos<br />
                          36-45 anos<br />
                          46-55 anos<br />
                          Acima de 55 anos
                        </td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Quantidade de Vagas</td>
                        <td className="px-4 py-2">Número inteiro (Ex: 1, 2, 3)</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Cargo</td>
                        <td className="px-4 py-2">Nome do cargo por extenso</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">PCD</td>
                        <td className="px-4 py-2">"Sim" ou "Não"</td>
                        <td className="px-4 py-2 text-blue-600">Sim</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">Bairro</td>
                        <td className="px-4 py-2">Nome do bairro ou região</td>
                        <td className="px-4 py-2 text-gray-500">Não</td>
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
                    <li>Mantenha todas as colunas do arquivo modelo</li>
                    <li>Preencha todos os campos obrigatórios</li>
                    <li>Respeite o formato de cada campo conforme indicado</li>
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