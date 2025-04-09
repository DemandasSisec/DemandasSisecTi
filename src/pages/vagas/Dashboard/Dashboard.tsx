import React from 'react';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { GraficoDePizza } from '../../../components/GraficoDePizza';
import styles from './Dashboard.module.css';

// Dados mockados para exemplo
const estatisticasVagas = {
  totalListas: 120,
  totalVagasSolicitadas: 450,
  totalPendente: 80,
  totalConcluido: 300,
  totalOuvidoria: 70
};

// Dados mockados para os gráficos
const evolucaoVagas = [
  { mes: 'Jan', total: 30, preenchidas: 20, emAberto: 10 },
  { mes: 'Fev', total: 45, preenchidas: 30, emAberto: 15 },
  { mes: 'Mar', total: 55, preenchidas: 35, emAberto: 20 },
  { mes: 'Abr', total: 40, preenchidas: 25, emAberto: 15 },
  { mes: 'Mai', total: 50, preenchidas: 40, emAberto: 10 },
  { mes: 'Jun', total: 65, preenchidas: 45, emAberto: 20 }
];

// Dados mockados para o top 5 empresas
const top5Empresas = [
  { name: 'Empresa A', value: 45 },
  { name: 'Empresa B', value: 38 },
  { name: 'Empresa C', value: 30 },
  { name: 'Empresa D', value: 25 },
  { name: 'Empresa E', value: 20 }
];

// Cores para os gráficos
const CORES = {
  total: '#60A5FA',      // azul
  preenchidas: '#34D399', // verde
  emAberto: '#F87171'     // vermelho
};

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard de Vagas</h1>
          <p className={styles.subtitle}>
            Acompanhamento e estatísticas das vagas
          </p>
        </header>

        {/* Cards de Estatísticas */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ChartBarIcon className={`${styles.icon} ${styles.iconBlue}`} />
            <h2 className={styles.cardTitle}>Totais Gerais</h2>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Total de Listas</span>
                <ClipboardDocumentListIcon className={`${styles.iconSmall} ${styles.iconBlue}`} />
              </div>
              <p className={styles.statValue}>{estatisticasVagas.totalListas}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Total de Vagas Solicitadas</span>
                <DocumentPlusIcon className={`${styles.iconSmall} ${styles.iconIndigo}`} />
              </div>
              <p className={styles.statValue}>{estatisticasVagas.totalVagasSolicitadas}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Total Pendente</span>
                <ClockIcon className={`${styles.iconSmall} ${styles.iconYellow}`} />
              </div>
              <p className={styles.statValue}>{estatisticasVagas.totalPendente}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Total Concluído</span>
                <CheckCircleIcon className={`${styles.iconSmall} ${styles.iconGreen}`} />
              </div>
              <p className={styles.statValue}>{estatisticasVagas.totalConcluido}</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statLabel}>Total Enviado para Ouvidoria</span>
                <ChatBubbleLeftRightIcon className={`${styles.iconSmall} ${styles.iconRed}`} />
              </div>
              <p className={styles.statValue}>{estatisticasVagas.totalOuvidoria}</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className={styles.chartsGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ChartBarIcon className={`${styles.icon} ${styles.iconBlue}`} />
              <h2 className={styles.cardTitle}>Evolução das Vagas</h2>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evolucaoVagas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill={CORES.total} />
                  <Bar dataKey="preenchidas" name="Preenchidas" fill={CORES.preenchidas} />
                  <Bar dataKey="emAberto" name="Em Aberto" fill={CORES.emAberto} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ChartBarIcon className={`${styles.icon} ${styles.iconBlue}`} />
              <h2 className={styles.cardTitle}>Distribuição por Tipo</h2>
            </div>
            <div className={styles.chartContainer}>
              <GraficoDePizza data={top5Empresas} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 