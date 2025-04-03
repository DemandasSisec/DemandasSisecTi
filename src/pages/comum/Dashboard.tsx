// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import { databases } from '../../config/appwrite'
import { APPWRITE_CONFIG } from '../../config/appwrite'
import { Query } from 'appwrite'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { Solicitacao, SolicitacaoVaga } from '../../types/appwrite'
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  DocumentPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Link } from 'react-router-dom'
import type { DemandaPorResponsavel, DemandaPorMes, DemandaPorTipo } from '../types/appwrite'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [demandas, setDemandas] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
    suspensas: 0,
    urgentes: 0,
    adiadas: 0
  })
  const [demandasPorResponsavel, setDemandasPorResponsavel] = useState<DemandaPorResponsavel[]>([])
  const [demandasPorMes, setDemandasPorMes] = useState<DemandaPorMes[]>([])
  const [demandasPorTipo, setDemandasPorTipo] = useState<DemandaPorTipo[]>([])
  const [vagasSolicitadas, setVagasSolicitadas] = useState<SolicitacaoVaga[]>([])
  const [statsVagas, setStatsVagas] = useState({
    total: 0,
    pendentes: 0,
    aprovadas: 0,
    reprovadas: 0
  })

  // Cores mais atraentes para os gráficos
  const CORES_STATUS = {
    pendentes: '#FCD34D', // amarelo mais suave
    emAndamento: '#60A5FA', // azul mais suave
    concluidas: '#34D399',  // verde mais suave
    suspensas: '#F87171'     // vermelho
  }

  const CORES_TIPOS = [
    '#60A5FA', // azul
    '#34D399', // verde
    '#F472B6', // rosa
    '#A78BFA', // roxo
    '#FBBF24', // amarelo
    '#F87171'  // vermelho
  ]

  // Função auxiliar para formatar a data
  const formatarMesAno = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  }

  // Função auxiliar para obter os últimos 3 meses
  const getUltimosTresMeses = () => {
    const meses = new Map()
    const hoje = new Date()
    
    // Ajusta para o primeiro dia do mês atual
    hoje.setDate(1)
    hoje.setHours(0, 0, 0, 0)

    // Gera os últimos 3 meses, começando do mais antigo
    for (let i = 0; i <= 2; i++) { // Mudamos a direção do loop (de 0 a 2)
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - (2 - i), 1) // Invertemos o cálculo do mês
      const mesAno = formatarMesAno(data)
      meses.set(mesAno, {
        mes: mesAno,
        data: data,
        total: 0,
        pendentes: 0,
        emAndamento: 0,
        concluidas: 0,
        suspensas: 0
      })
    }

    return meses
  }

  useEffect(() => {
    const fetchDemandas = async () => {
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.DEMANDS,
          [
            Query.orderDesc('created_at'),
            Query.limit(100)
          ]
        )

        const demandasData = response.documents.map(doc => ({
          $id: doc.$id,
          titulo: doc.titulo,
          descricao: doc.descricao,
          tipo: doc.tipo,
          urgencia: doc.urgencia,
          status: doc.status,
          prazo: doc.prazo,
          responsavel: doc.responsavel,
          solicitante: doc.solicitante,
          created_at: doc.created_at,
          link: doc.link,
          dataSuspensao: doc.dataSuspensao,
          dataFinalizacao: doc.dataFinalizacao
        }))

        setDemandas(demandasData)

        // Calcula estatísticas gerais
        const stats = demandasData.reduce((acc: any, demanda) => {
          acc.total++
          if (demanda.status === 'pendente') acc.pendentes++
          if (demanda.status === 'em_andamento') acc.emAndamento++
          if (demanda.status === 'concluida') acc.concluidas++
          if (demanda.status === 'suspenso') acc.suspensas++
          if (demanda.urgencia === 'alta') acc.urgentes++
          return acc
        }, {
          total: 0,
          pendentes: 0,
          emAndamento: 0,
          concluidas: 0,
          suspensas: 0,
          urgentes: 0
        })

        setEstatisticas(stats)

        // Processa demandas por responsável
        const porResponsavel = demandasData.reduce((acc: { [key: string]: DemandaPorResponsavel }, demanda) => {
          const resp = demanda.responsavel || 'Sem responsável'
          
          if (!acc[resp]) {
            acc[resp] = {
              responsavel: resp,
              total: 0,
              pendentes: 0,
              emAndamento: 0,
              concluidas: 0,
              suspensas: 0
            }
          }

          acc[resp].total++
          if (demanda.status === 'pendente') acc[resp].pendentes++
          if (demanda.status === 'em_andamento') acc[resp].emAndamento++
          if (demanda.status === 'concluida') acc[resp].concluidas++
          if (demanda.status === 'suspenso') acc[resp].suspensas++

          return acc
        }, {})

        setDemandasPorResponsavel(Object.values(porResponsavel))

        // Inicializa os últimos 3 meses
        const ultimosTresMeses = getUltimosTresMeses()
        
        // Data limite (3 meses atrás)
        const dataLimite = new Date()
        dataLimite.setMonth(dataLimite.getMonth() - 2)
        dataLimite.setDate(1)
        dataLimite.setHours(0, 0, 0, 0)

        // Processa cada demanda
        demandasData.forEach(demanda => {
          const dataDemanda = new Date(demanda.created_at)
          dataDemanda.setDate(1) // Normaliza para o primeiro dia do mês
          
          // Só processa demandas dos últimos 3 meses
          if (dataDemanda >= dataLimite) {
            const mesAno = formatarMesAno(dataDemanda)
            
            if (ultimosTresMeses.has(mesAno)) {
              const stats = ultimosTresMeses.get(mesAno)
              stats.total++
              
              switch(demanda.status) {
                case 'pendente':
                  stats.pendentes++
                  break
                case 'em_andamento':
                  stats.emAndamento++
                  break
                case 'concluida':
                  stats.concluidas++
                  break
                case 'suspenso':
                  stats.suspensas++
                  break
              }
            }
          }
        })

        // Converte o Map para array e ordena por data (do mais antigo para o mais recente)
        const demandasPorMesArray = Array.from(ultimosTresMeses.values())
          .sort((a, b) => a.data.getTime() - b.data.getTime()) // Mantém esta ordenação
          .map(({ data, ...rest }) => rest)

        console.log('Dados processados:', demandasPorMesArray)
        setDemandasPorMes(demandasPorMesArray)

        // Processa demandas por tipo
        const tiposCount = demandasData.reduce((acc: { [key: string]: number }, demanda) => {
          const tipo = demanda.tipo || 'outros'
          acc[tipo] = (acc[tipo] || 0) + 1
          return acc
        }, {})

        const tiposData = Object.entries(tiposCount).map(([tipo, quantidade]) => ({
          tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' '),
          quantidade
        }))

        setDemandasPorTipo(tiposData)

        // Buscar solicitações de vagas
        const vagasResponse = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.VAGAS,  // Certifique-se que esta collection existe
          [Query.orderDesc('created_at')]
        )

        const vagasData = vagasResponse.documents
        setVagasSolicitadas(vagasData)

        // Calcular estatísticas de vagas
        const vagasStats = vagasData.reduce((acc: any, vaga) => {
          acc.total++
          if (vaga.status === 'pendente') acc.pendentes++
          if (vaga.status === 'aprovada') acc.aprovadas++
          if (vaga.status === 'reprovada') acc.reprovadas++
          return acc
        }, {
          total: 0,
          pendentes: 0,
          aprovadas: 0,
          reprovadas: 0
        })

        setStatsVagas(vagasStats)

      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDemandas()
  }, [])

  const stats = {
    total: demandas.length,
    pendentes: demandas.filter(d => d.status === 'pendente').length,
    emAndamento: demandas.filter(d => d.status === 'em_andamento').length,
    concluidas: demandas.filter(d => d.status === 'concluida').length
  }

  const cards = [
    {
      title: 'Nova Solicitação',
      icon: DocumentPlusIcon,
      color: 'from-blue-400 to-cyan-400',
      link: '/nova-solicitacao'
    },
    {
      title: 'Lista de Solicitações',
      icon: ClipboardDocumentListIcon,
      color: 'from-violet-400 to-purple-400',
      link: '/lista-solicitacoes'
    },
    {
      title: 'Painel de Demandas',
      icon: ChartBarIcon,
      color: 'from-amber-400 to-orange-400',
      link: '/painel-demandas'
    },
    {
      title: 'Lista de Usuários',
      icon: UserGroupIcon,
      color: 'from-emerald-400 to-teal-400',
      link: '/lista-usuarios',
      adminOnly: true
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Visão geral das demandas e métricas do sistema
          </p>
        </header>
        
        {/* Cards de Totais Gerais - Estilo atualizado */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Totais Gerais
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total de Demandas</span>
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Em Andamento</span>
                <ClockIcon className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.emAndamento}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Pendentes</span>
                <ClockIcon className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.pendentes}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Concluídas</span>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.concluidas}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Suspensas</span>
                <XCircleIcon className="w-5 h-5 text-red-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{estatisticas.suspensas}</p>
            </div>
          </div>
        </div>

        {/* Nova seção de Vagas */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Solicitações de Vagas
              </h2>
            </div>
            <Link
              to="/lista-solicitacoes-vagas"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Visão Detalhada
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total', value: statsVagas.total, status: 'all', icon: ChartBarIcon, color: 'blue' },
              { label: 'Pendentes', value: statsVagas.pendentes, status: 'pendente', icon: ClockIcon, color: 'yellow' },
              { label: 'Aprovadas', value: statsVagas.aprovadas, status: 'aprovada', icon: CheckCircleIcon, color: 'green' },
              { label: 'Reprovadas', value: statsVagas.reprovadas, status: 'reprovada', icon: XCircleIcon, color: 'red' }
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => navigate(`/detalhes-solicitacao-vaga/${item.status}`)}
                className="cursor-pointer"
              >
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas por Responsável */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Demandas por Responsável
              </h2>
            </div>
            <Link
              to="/painel-demandas"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Visão Detalhada
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendentes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Em Andamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concluídas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suspensas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demandasPorResponsavel.map((resp) => (
                  <tr key={resp.responsavel} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resp.responsavel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resp.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {resp.pendentes}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {resp.emAndamento}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {resp.concluidas}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {resp.suspensas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráficos atualizados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <ChartBarIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Evolução de Demandas
              </h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={demandasPorMes}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="mes"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: '#4B5563', fontSize: '14px' }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="pendentes"
                    fill={CORES_STATUS.pendentes}
                    name="Pendentes"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar
                    dataKey="emAndamento"
                    fill={CORES_STATUS.emAndamento}
                    name="Em Andamento"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar
                    dataKey="concluidas"
                    fill={CORES_STATUS.concluidas}
                    name="Concluídas"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar
                    dataKey="suspensas"
                    fill={CORES_STATUS.suspensas}
                    name="Suspensas"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Pizza */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <ChartBarIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Distribuição por Tipo
              </h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demandasPorTipo}
                    dataKey="quantidade"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index
                    }) => {
                      const RADIAN = Math.PI / 180
                      const radius = 25 + innerRadius + (outerRadius - innerRadius)
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#4B5563"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize="12"
                        >
                          {demandasPorTipo[index].tipo} ({value})
                        </text>
                      )
                    }}
                  >
                    {demandasPorTipo.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CORES_TIPOS[index % CORES_TIPOS.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name, props) => [`${value} demandas`, props.payload.tipo]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}