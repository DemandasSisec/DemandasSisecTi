import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ResponsaveisDetalhado from './pages/demandas/ResponsaveisDetalhado'
import ListaSolicitacoesVagas from './pages/vagas/ListaSolicitacoesVagas'
import DetalhesSolicitacao from './pages/demandas/DetalhesDaSolicitacao'
import { SmallLoadingProvider } from './context/SmallLoadingContext'
import DetalhamentoDemanda from './pages/vagas/DetalhamentoDemanda'
import ListaSolicitacoes from './pages/demandas/ListaSolicitacoes'
import NovaSolicitacao from './pages/demandas/NovaSolicitacao'
import CadastrarUsuario from './pages/comum/CadastrarUsuario'
import SolicitacaoVagas from './pages/vagas/NovaSolicitacao/Emprego/NSEmprego'
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
import SelecaoTipoUsuario from './pages/comum/SelecaoTipoUsuario'

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
                          <Route path="demandas/nova-solicitacao" element={<NovaSolicitacao />} />
                          <Route path="demandas/lista-solicitacoes" element={<ListaSolicitacoes />} />
                          <Route path="demandas/painel-demandas" element={<PainelDemandas />} />
                          <Route path="demandas/detalhes-solicitacao/:id" element={<DetalhesSolicitacao />} />
                          <Route path="demandas/responsaveis-detalhado" element={<ResponsaveisDetalhado />} />
                          <Route 
                            path="cadastrar-usuario" 
                            element={
                              <ProtectedRoute allowedUserTypes={['admin']}>
                                <CadastrarUsuario />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="lista-usuarios" 
                            element={
                              <ProtectedRoute allowedUserTypes={['admin']}>
                                <ListaUsuarios />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="vagas/nova-solicitacao" element={<SolicitacaoVagas />} />
                          <Route 
                            path="vagas/lista-solicitacoes" 
                            element={
                              <ProtectedRoute allowedUserTypes={['admin']}>
                                <ListaSolicitacoesVagas />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="vagas/detalhes-solicitacao/:id" 
                            element={<DetalhamentoDemanda />} 
                          />
                          <Route 
                            path="vagas/cadastro-empresa" 
                            element={
                              <ProtectedRoute allowedUserTypes={['admin']}>
                                <CadastroEmpresa />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
