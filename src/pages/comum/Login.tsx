import { ClipboardDocumentListIcon, ChartBarIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { Engine } from "tsparticles-engine"
import { useNavigate } from 'react-router-dom'
import { loadSlim } from "tsparticles-slim"
import Particles from "react-particles"
import toast from 'react-hot-toast'
import '../../utils/Login.css'
import Lottie from 'lottie-react'
import loadingAnimation from '../../assets/Animation_loading.json'

interface LoginProps {
  type?: 'empresa' | 'sisec'
}

export default function Login({ type = 'sisec' }: LoginProps) {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Login realizado com sucesso!')
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Email ou senha inválidos')
    } finally {
      setIsLoading(false)
    }
  }

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const particlesConfig = {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 1000
        }
      },
      color: {
        value: "#ffffff"
      },
      links: {
        enable: true,
        distance: 200,
        color: "#ffffff",
        opacity: 0.15,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none" as const,
        random: false,
        straight: false,
        outModes: {
          default: "bounce"
        },
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        },
        onClick: {
          enable: true,
          mode: "push"
        }
      },
      modes: {
        grab: {
          distance: 180,
          links: {
            opacity: 0.3
          }
        }
      }
    },
    background: {
      color: "transparent"
    },
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    detectRetina: true
  } as const;

  const getTitle = () => {
    return type === 'empresa' ? 'Empresas Parceiras' : 'Equipe TI - SISEC'
  }

  const getFeatures = () => {
    if (type === 'empresa') {
      return [
        {
          icon: <BuildingOfficeIcon className="w-6 h-6 text-white" />,
          text: 'Solicite vagas de forma simples e rápida'
        },
        {
          icon: <ChartBarIcon className="w-6 h-6 text-white" />,
          text: 'Acompanhe o status de suas solicitações'
        },
        {
          icon: <UserGroupIcon className="w-6 h-6 text-white" />,
          text: 'Gerencie seus usuários e permissões'
        }
      ]
    }
    return [
      {
        icon: <ClipboardDocumentListIcon className="w-6 h-6 text-white" />,
        text: 'Gerencie todas as solicitações em um único lugar'
      },
      {
        icon: <ChartBarIcon className="w-6 h-6 text-white" />,
        text: 'Acompanhe o progresso em tempo real'
      },
      {
        icon: <UserGroupIcon className="w-6 h-6 text-white" />,
        text: 'Colabore com sua equipe de forma eficiente'
      }
    ]
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500">
      {/* Loading deve ser o primeiro elemento */}
      {isLoading && (
        <div className="fixed inset-0 w-full h-full bg-white z-[9999] flex items-center justify-center">
          <Lottie
            animationData={loadingAnimation}
            loop={true}
            style={{ width: 300, height: 300 }}
          />
        </div>
      )}

      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesConfig}
        className="absolute inset-0"
      />

      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-cyan-400 opacity-20 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-300 opacity-20 blur-3xl"></div>
        
        {/* Grade decorativa */}
        <div className="absolute inset-0" 
             style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 h-screen flex flex-col lg:flex-row items-center justify-center relative z-10">
        {/* Lado Esquerdo - Informações */}
        <div className="lg:w-1/2 text-white lg:pr-16 mb-8 lg:mb-0">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 whitespace-nowrap">
              Controle de Demandas
            </h1>
            <h2 className="text-3xl font-semibold mb-8 text-blue-100">
              {getTitle()}
            </h2>
            <div className="space-y-6 backdrop-blur-sm bg-white/5 rounded-2xl p-6">
              {getFeatures().map((feature, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    {feature.icon}
                  </div>
                  <p className="text-lg">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário de Login */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo</h2>
              <p className="text-blue-100">Faça login para continuar</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}