// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import { databases } from '../../../config/appwrite'
import { APPWRITE_CONFIG } from '../../../config/appwrite'
import { Query } from 'appwrite'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import type { Solicitacao } from '../../../types/appwrite'
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
import type { DemandaPorResponsavel, DemandaPorMes, DemandaPorTipo } from '../../../types/appwrite'
import styles from './Dashboard.module.css'

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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Dashboard
          </h1>
          <p className={styles.subtitle}>
            Visão geral das demandas e métricas do sistema
          </p>
        </header>
        
        {/* Cards de Totais Gerais - Estilo atualizado */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ChartBarIcon className={`${styles.icon} ${styles.iconBlue}`} />
            <h2 className={styles.cardTitle}>
              Totais Gerais
            </h2>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Total de Demandas</span>
                <ChartBarIcon className={`${styles.iconSmall} ${styles.iconBlue}`} />
              </div>
              <p className={styles.statValue}>{stats.total}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Em Andamento</span>
                <ClockIcon className={`${styles.iconSmall} ${styles.iconIndigo}`} />
              </div>
              <p className={styles.statValue}>{stats.emAndamento}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Pendentes</span>
                <ClockIcon className={`${styles.iconSmall} ${styles.iconYellow}`} />
              </div>
              <p className={styles.statValue}>{stats.pendentes}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Concluídas</span>
                <CheckCircleIcon className={`${styles.iconSmall} ${styles.iconGreen}`} />
              </div>
              <p className={styles.statValue}>{stats.concluidas}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Suspensas</span>
                <XCircleIcon className={`${styles.iconSmall} ${styles.iconRed}`} />
              </div>
              <p className={styles.statValue}>{estatisticas.suspensas}</p>
            </div>
          </div>
        </div>

        {/* Estatísticas por Responsável */}
        <div className={styles.card}>
          <div className={styles.cardHeaderWithAction}>
            <div className={styles.cardHeaderLeft}>
              <UserGroupIcon className={`${styles.icon} ${styles.iconBlue}`} />
              <h2 className={styles.cardTitle}>
                Demandas por Responsável
              </h2>
            </div>
            <Link
              to="/painel-demandas"
              className={styles.button}
            >
              Visão Detalhada
            </Link>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>
                    Responsável
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Total
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Pendentes
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Em Andamento
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Concluídas
                  </th>
                  <th className={styles.tableHeaderCell}>
                    Suspensas
                  </th>
                </tr>
              </thead>
              <tbody>
                {demandasPorResponsavel.map((resp) => (
                  <tr key={resp.responsavel} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.tableCellBold}`}>
                      {resp.responsavel}
                    </td>
                    <td className={styles.tableCell}>
                      {resp.total}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${styles.badgeYellow}`}>
                        {resp.pendentes}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${styles.badgeBlue}`}>
                        {resp.emAndamento}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${styles.badgeGreen}`}>
                        {resp.concluidas}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.badge} ${styles.badgeRed}`}>
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
        <div className={styles.chartsGrid}>
          {/* Gráfico de Barras */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ChartBarIcon className={`${styles.icon} ${styles.iconBlue}`} />
              <h2 className={styles.cardTitle}>
                Evolução de Demandas
              </h2>
            </div>
            <div className={styles.chartContainer}>
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
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ChartBarIcon className={`${styles.icon} ${styles.iconBlue}`} />
              <h2 className={styles.cardTitle}>
                Distribuição por Tipo
              </h2>
            </div>
            <div className={styles.chartContainer}>
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