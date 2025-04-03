import { useState, useEffect } from 'react'
import { databases } from '../../config/appwrite'
import { APPWRITE_CONFIG } from '../../config/appwrite'
import { Query } from 'appwrite'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../components/StatusBadge'
import { useAuth } from '../../contexts/AuthContext'
import type { Solicitacao } from '../../types/appwrite'
import { CardDemandas } from '../../components/cardDemandas'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface DemandaGrouped {
  responsavel: string
  demandas: Solicitacao[]
}

export default function PainelDemandas() {
  const [demandas, setDemandas] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [demandasPorResponsavel, setDemandasPorResponsavel] = useState<DemandaGrouped[]>([])
  const [demandasSemResponsavel, setDemandasSemResponsavel] = useState<Solicitacao[]>([])

  const fetchDemandas = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.DEMANDS,
        [
          Query.orderDesc('created_at')
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
      })) as Solicitacao[]

      setDemandas(demandasData)

      // Separa demandas sem responsável
      const semResponsavel = demandasData.filter(d => !d.responsavel || d.responsavel.trim() === '')
      setDemandasSemResponsavel(semResponsavel)

      // Agrupa demandas com responsável
      const grouped = demandasData.reduce((acc: { [key: string]: Solicitacao[] }, demanda) => {
        if (!demanda.responsavel || demanda.responsavel.trim() === '') return acc
        if (!acc[demanda.responsavel]) {
          acc[demanda.responsavel] = []
        }
        acc[demanda.responsavel].push(demanda)
        return acc
      }, {})

      // Converte para array e ordena
      const groupedArray = Object.entries(grouped)
        .map(([responsavel, demandas]) => ({
          responsavel,
          demandas
        }))
        .sort((a, b) => {
          const diff = b.demandas.length - a.demandas.length
          if (diff === 0) {
            return a.responsavel.localeCompare(b.responsavel)
          }
          return diff
        })

      setDemandasPorResponsavel(groupedArray)
    } catch (error) {
      console.error('Erro ao buscar demandas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDemandas()
  }, [])

  const formatDate = (date: string) => {
    if (!date) return 'Sem prazo'
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Demandas por Responsável
        </h1>
      </div>

      {/* Seção de demandas sem responsável - Atualizada */}
      {demandasSemResponsavel.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400"
        >
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6 text-yellow-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Demandas Aguardando Responsável
              </h2>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {demandasSemResponsavel.length} demandas
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demandasSemResponsavel.map((demanda) => (
                <motion.div
                  key={demanda.$id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => navigate(`/detalhes-solicitacao/${demanda.$id}`)}
                  className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-600">Nº {demanda.$id}</span>
                      </div>
                      {demanda.titulo && (
                        <p className="text-sm text-gray-900 font-medium mb-2 truncate">
                          {demanda.titulo}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <StatusBadge status={demanda.status} />
                        <span className="text-sm text-gray-500">
                          {formatDate(demanda.prazo)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Seção de demandas com responsável */}
      <div className="flex flex-col space-y-6 w-full">
        {demandasPorResponsavel.map(({ responsavel, demandas }) => (
          <CardDemandas 
            key={responsavel} 
            responsavel={responsavel} 
            demandas={demandas} 
          />
        ))}
      </div>

      {demandasPorResponsavel.length === 0 && demandasSemResponsavel.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhuma demanda encontrada.
          </p>
        </div>
      )}
    </div>
  )
}
