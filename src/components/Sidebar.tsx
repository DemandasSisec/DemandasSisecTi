import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, PlusCircleIcon, ClipboardDocumentListIcon, ArrowLeftOnRectangleIcon, UserPlusIcon, ViewColumnsIcon, ChartBarIcon, BriefcaseIcon, DocumentTextIcon, ChevronDownIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'admin_ti'
  const [isVagasOpen, setIsVagasOpen] = useState(true)
  const [isEquipeTIOpen, setIsEquipeTIOpen] = useState(true)

  const equipeTIItems = [
    { path: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { path: '/lista-solicitacoes', icon: ClipboardDocumentListIcon, label: 'Solicitações' },
    { path: '/nova-solicitacao', icon: PlusCircleIcon, label: 'Nova Solicitação' },
    { path: '/cadastrar-usuario', icon: UserPlusIcon, label: 'Cadastrar Usuário' },
    { path: '/lista-usuarios', icon: UserPlusIcon, label: 'Lista de Usuários' },
  ]
  
  const vagasMenuItems = [
    { path: '/solicitacao-vagas', icon: BriefcaseIcon, label: 'Nova Solicitação' },
    { path: '/vagas-solicitacoes', icon: DocumentTextIcon, label: 'Lista de Solicitações' },
    { path: '/cadastrar-empresa', icon: BriefcaseIcon, label: 'Cadastrar Empresa' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao deslogar:', error)
    }
  }

  const getTipoUsuario = (role: string) => {
    switch(role) {
      case 'admin':
        return 'Perfil: Administrador'
      case 'admin_ti':
        return 'Perfil: Equipe de TI'
      case 'user':
        return 'Perfil: Usuário'
      default:
        return 'Perfil: Usuário'
    }
  }

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      <div className="p-[0.9rem] border-b border-gray-700/50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Controle de Demandas
        </h1>
      </div>
      
      <div className="p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex flex-col">
          <div className="flex items-center space-x-4 mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-lg font-semibold">
                {user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-white">
              {user?.name || 'Usuário'}
            </span>
          </div>
          
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-400">
              {user?.email}
            </span>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-200 rounded-full inline-flex items-center w-fit">
              {getTipoUsuario(user?.role || 'user')}
            </span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-blue-400/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-400/70">
        <div className="my-4 border-t border-gray-700/50" />

        {/* Seção Equipe TI com Accordion */}
        <motion.button
          onClick={() => setIsEquipeTIOpen(!isEquipeTIOpen)}
          className="flex items-center justify-between w-full px-4 py-3 mb-2 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Equipe TI</span>
          </div>
          <motion.div
            animate={{ rotate: isEquipeTIOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-5 h-5" />
          </motion.div>
        </motion.button>

        <AnimatePresence initial={false}>
          {isEquipeTIOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="pl-4 overflow-hidden"
            >
              {equipeTIItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 mb-2 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-200 group ${
                      isActive(item.path) 
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white shadow-sm' 
                        : ''
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${
                      isActive(item.path) ? 'text-blue-400' : ''
                    }`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seção Vagas com Accordion */}
        <motion.button
          onClick={() => setIsVagasOpen(!isVagasOpen)}
          className="flex items-center justify-between w-full px-4 py-3 mb-2 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center">
            <BriefcaseIcon className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Vagas</span>
          </div>
          <motion.div
            animate={{ rotate: isVagasOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-5 h-5" />
          </motion.div>
        </motion.button>

        <AnimatePresence initial={false}>
          {isVagasOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="pl-4 overflow-hidden"
            >
              {vagasMenuItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 mb-2 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-200 group ${
                      isActive(item.path) 
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white shadow-sm' 
                        : ''
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${
                      isActive(item.path) ? 'text-blue-400' : ''
                    }`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-gray-300 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white transition-all duration-200 group"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar 