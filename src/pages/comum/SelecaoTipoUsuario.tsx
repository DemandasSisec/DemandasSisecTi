import { useNavigate } from 'react-router-dom'
import { BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'
import type { Engine } from "tsparticles-engine"
import { loadSlim } from "tsparticles-slim"
import Particles from "react-particles"
import '../../utils/Login.css'

export default function SelecaoTipoUsuario() {
  const navigate = useNavigate()

  const handleSelectType = (type: 'empresa' | 'sisec') => {
    if (type === 'empresa') {
      navigate('/login-empresa')
    } else {
      navigate('/login-sisec')
    }
  }

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const particlesConfig = {
    particles: {
      number: {
        value: 30,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#ffffff"
      },
      links: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.1,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none" as const,
        random: true,
        straight: false,
        outModes: {
          default: "out"
        },
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500">
      {/* Particles background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesConfig}
        className="absolute inset-0"
      />

      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-400 opacity-20 blur-3xl"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Controle de Demandas
            </h1>
            <p className="text-xl text-blue-100">
              Selecione o tipo de acesso para continuar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Empresa */}
            <button
              onClick={() => handleSelectType('empresa')}
              className="group relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-500/30 transition-colors duration-300">
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Empresa</h3>
                <p className="text-blue-100 text-sm">
                  Acesso para empresas parceiras que desejam solicitar vagas
                </p>
              </div>
            </button>

            {/* Card SISEC */}
            <button
              onClick={() => handleSelectType('sisec')}
              className="group relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-500/30 transition-colors duration-300">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Equipe SISEC</h3>
                <p className="text-blue-100 text-sm">
                  Acesso para membros da equipe SISEC que gerenciam as demandas
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 