import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

const STATUS_LIST = [
  { id: 1, label: 'Pendente' },
  { id: 2, label: 'Extraindo Candidatos do Banco' },
  { id: 3, label: 'Processando Lista de Candidatos' },
  { id: 4, label: 'Aguardando Cadastro de Vagas no Sistema' },
  { id: 5, label: 'Aguardando Cadastro' },
  { id: 6, label: 'Lista Cadastrada no Sistema' },
  { id: 7, label: 'Enviado para Ouvidoria' },
  { id: 8, label: 'Aguardando Retorno da Ouvidoria' },
  { id: 9, label: 'Retorno da Ouvidoria Recebido' },
  { id: 10, label: 'Extraindo Candidatos Interessados' },
  { id: 11, label: 'Candidatos Interessados Encaminhados para Empresa' },
  { id: 12, label: 'Concluído' }
]

interface StatusTimelineProps {
  currentStatus: number
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {STATUS_LIST.map((status, index) => (
          <li key={status.id}>
            <div className="relative pb-8">
              {index !== STATUS_LIST.length - 1 ? (
                <span
                  className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                    status.id <= currentStatus ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      status.id === currentStatus
                        ? 'bg-blue-600'
                        : status.id < currentStatus
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    {status.id === currentStatus ? (
                      <ClockIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : status.id < currentStatus ? (
                      <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-400" />
                    )}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className={`text-sm ${
                      status.id <= currentStatus ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {status.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 