import SolicitacaoEmpreendedorismo from './pages/vagas/NovaSolicitacao/Empreendedorismo/NSEmpreendedorismo'
import ListaSolicitacoesVagas from './pages/vagas/ListaDeSolicitacoes/ListaSolicitacoesVagas'
import SolicitacaoCapacitacao from './pages/vagas/NovaSolicitacao/Capacitacao/NSCapacitacao'
import DetalhamentoDemanda from './pages/vagas/DetalhamentoDemanda/DetalhamentoDemanda'
import SolicitacaoVagas from './pages/vagas/NovaSolicitacao/Emprego/NSEmprego'
import ResponsaveisDetalhado from './pages/demandas/ResponsaveisDetalhado'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DetalhesSolicitacao from './pages/demandas/DetalhesDaSolicitacao'
import { SmallLoadingProvider } from './context/SmallLoadingContext'
import ListaSolicitacoes from './pages/demandas/ListaSolicitacoes'
import SelecaoTipoUsuario from './pages/comum/SelecaoTipoUsuario'
import NovaSolicitacao from './pages/demandas/NovaSolicitacao'
import CadastrarUsuario from './pages/comum/CadastrarUsuario'
import PainelDemandas from './pages/demandas/PainelDemandas'
import CadastroEmpresa from './pages/vagas/CadastroEmpresa'
import { LoadingProvider } from './context/LoadingContext'
import ProtectedRoute from './components/ProtectedRoute'
import ListaUsuarios from './pages/comum/ListaUsuarios'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './pages/comum/Dashboard'
import AppLayout from './components/AppLayout'
import { Toaster } from 'react-hot-toast'
import Login from './pages/comum/Login'

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <SmallLoadingProvider>
          <BrowserRouter>
            <div>
              <Routes>
                <Route path="/" element={<SelecaoTipoUsuario />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login-empresa" element={<Login type="empresa" />} />
                <Route path="/login-sisec" element={<Login type="sisec" />} />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute allowedUserTypes={['admin', 'user']}>
                      <AppLayout>
                        <Routes>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="lista-usuarios" element={<ListaUsuarios />} />
                          <Route path="cadastrar-usuario" element={<CadastrarUsuario />} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                          <Route path="vagas/cadastro-empresa" element={<CadastroEmpresa />} />
                          <Route path="demandas/painel-demandas" element={<PainelDemandas />} />
                          <Route path="demandas/nova-solicitacao" element={<NovaSolicitacao />} />
                          <Route path="demandas/lista-solicitacoes" element={<ListaSolicitacoes />} />
                          <Route path="vagas/nova-solicitacao/emprego" element={<SolicitacaoVagas />} />
                          <Route path="vagas/nova-solicitacao/capacitacao" element={<SolicitacaoCapacitacao />} />
                          <Route path="vagas/nova-solicitacao/empreendedorismo" element={<SolicitacaoEmpreendedorismo />} />
                          <Route path="vagas/lista-solicitacoes" element={<ListaSolicitacoesVagas />} />
                          <Route path="vagas/detalhes-solicitacao/:id" element={<DetalhamentoDemanda />} />
                          <Route path="demandas/detalhes-solicitacao/:id" element={<DetalhesSolicitacao />} />
                          <Route path="demandas/responsaveis-detalhado" element={<ResponsaveisDetalhado />} />
                          <Route path="vagas/nova-solicitacao" element={<Navigate to="/vagas/nova-solicitacao/emprego" replace />} />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster position="top-right" />
            </div>
          </BrowserRouter>
        </SmallLoadingProvider>
      </LoadingProvider>
    </AuthProvider>
  )
}

export default App
