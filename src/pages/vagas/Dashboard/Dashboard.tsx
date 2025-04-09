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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from './Dashboard.module.css';

// Dados mockados para exemplo
const estatisticasVagas = {
  totalListas: 120,
  totalVagasSolicitadas: 450,
  totalPendente: 80,
  totalConcluido: 300,
  totalOuvidoria: 70
};

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
  tipos: ['#60A5FA', '#34D399', '#F472B6', '#A78BFA', '#FBBF24'] // cores vibrantes
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
              <h2 className={styles.cardTitle}>Top Empresas</h2>
            </div>
            <div className={styles.rankingList}>
              {top5Empresas.map((empresa, index) => (
                <div key={empresa.name} className={styles.rankingItem}>
                  <div className={styles.rankingLeft}>
                    <span className={styles.rankingNumber}>{index + 1}</span>
                    <span className={styles.rankingName}>{empresa.name}</span>
                  </div>
                  <div className={styles.rankingRight}>
                    <div className={styles.rankingBarContainer}>
                      <div 
                        className={styles.rankingBar} 
                        style={{ 
                          width: `${(empresa.value / top5Empresas[0].value) * 100}%`,
                          backgroundColor: CORES.tipos[index % CORES.tipos.length]
                        }}
                      />
                    </div>
                    <span className={styles.rankingValue}>
                      {empresa.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ChartBarIcon className={`${styles.icon} ${styles.iconBlue}`} />
              <h2 className={styles.cardTitle}>Distribuição por Tipo</h2>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={top5Empresas}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = 25 + outerRadius;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#4B5563"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize="12"
                        >
                          {top5Empresas[index].name} ({value})
                        </text>
                      );
                    }}
                  >
                    {top5Empresas.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CORES.tipos[index % CORES.tipos.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #111827',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 