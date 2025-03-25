import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from './components/AppLayout'
import NovaSolicitacao from './pages/NovaSolicitacao'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ListaSolicitacoes from './pages/ListaSolicitacoes'
import DetalhesSolicitacao from './pages/DetalhesDaSolicitacao'
import CadastrarUsuario from './pages/CadastrarUsuario'
import ListaUsuarios from './pages/ListaUsuarios'
import PainelDemandas from './pages/PainelDemandas'
import ProtectedRoute from './components/ProtectedRoute'
import ResponsaveisDetalhado from './pages/ResponsaveisDetalhado'
import { LoadingProvider } from './context/LoadingContext'
import { SmallLoadingProvider } from './context/SmallLoadingContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <SmallLoadingProvider>
          <BrowserRouter>
            <div>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute allowedUserTypes={['admin', 'user']}>
                      <AppLayout>
                        <Routes>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="nova-solicitacao" element={<NovaSolicitacao />} />
                          <Route path="lista-solicitacoes" element={<ListaSolicitacoes />} />
                          <Route path="painel-demandas" element={<PainelDemandas />} />
                          <Route path="detalhes-solicitacao/:id" element={<DetalhesSolicitacao />} />
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
                          <Route path="/" element={<Navigate to="/dashboard" />} />
                          <Route path="responsaveis-detalhado" element={<ResponsaveisDetalhado />} />
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
