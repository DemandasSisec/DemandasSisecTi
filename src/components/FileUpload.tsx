import { useState } from 'react'
import { 
  DocumentArrowUpIcon, 
  XCircleIcon,
  DocumentIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ExclamationCircleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
}

interface FilePreview {
  file: File
  name: string
  type: string
  size: string
  isValid: boolean
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB em bytes
const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024 // 2GB em bytes
const ALLOWED_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
  const totalSize = selectedFiles.reduce((acc, file) => acc + file.file.size, 0)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <DocumentTextIcon className="w-8 h-8 text-red-500" />
      case 'doc':
      case 'docx':
        return <DocumentIcon className="w-8 h-8 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <TableCellsIcon className="w-8 h-8 text-green-500" />
      default:
        return <DocumentIcon className="w-8 h-8 text-gray-500" />
    }
  }

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return file.size <= MAX_FILE_SIZE && ALLOWED_TYPES.includes(extension)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles: FilePreview[] = Array.from(files).map(file => ({
      file,
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() || '',
      size: formatFileSize(file.size),
      isValid: validateFile(file)
    }))

    const validFiles = newFiles.filter(f => f.isValid)
    setSelectedFiles(prev => [...prev, ...validFiles])
    onFilesSelected(validFiles.map(f => f.file))
  }

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName))
    onFilesSelected(selectedFiles.filter(file => file.name !== fileName).map(f => f.file))
  }

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <div className="flex items-center justify-center w-full">
        <label className="relative w-full transition-all duration-300 ease-in-out">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-blue-200 border-dashed rounded-xl cursor-pointer bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 group">
            {/* Ícone animado */}
            <div className="relative">
              <CloudArrowUpIcon className="w-12 h-12 mb-4 text-blue-400 transition-transform group-hover:scale-110 group-hover:text-blue-500" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <CloudArrowUpIcon className="w-12 h-12 text-blue-400" />
              </div>
            </div>

            {/* Texto principal */}
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-700">
                <span className="text-blue-500 hover:text-blue-600">Clique para selecionar</span> ou arraste e solte
              </p>
              
              {/* Informações sobre limites */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <DocumentIcon className="w-4 h-4" />
                  <span>PDF, DOC, DOCX, XLS, XLSX</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  <span>Máx {formatFileSize(MAX_FILE_SIZE)} por arquivo</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CloudArrowUpIcon className="w-4 h-4" />
                  <span>Total disponível: {formatFileSize(MAX_TOTAL_SIZE)}</span>
                </div>
              </div>
            </div>

            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept={ALLOWED_TYPES.join(',')}
            />
          </div>
        </label>
      </div>

      {/* Barra de progresso */}
      {selectedFiles.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Armazenamento utilizado</span>
              <span className="text-gray-600">{formatFileSize(totalSize)} / {formatFileSize(MAX_TOTAL_SIZE)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalSize > MAX_TOTAL_SIZE 
                    ? 'bg-gradient-to-r from-red-400 to-red-500' 
                    : 'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}
                style={{ width: `${Math.min((totalSize / MAX_TOTAL_SIZE) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de arquivos */}
      {selectedFiles.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Arquivos selecionados</h4>
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.name}
                className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="transition-transform group-hover:scale-105">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">{file.size}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!file.isValid && (
                    <div className="tooltip" data-tip="Arquivo muito grande ou formato não permitido">
                      <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFile(file.name)}
                    className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {totalSize > MAX_TOTAL_SIZE && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2 text-red-500" />
            O tamanho total dos arquivos excede o limite de {formatFileSize(MAX_TOTAL_SIZE)}
          </p>
        </div>
      )}
    </div>
  )
} 