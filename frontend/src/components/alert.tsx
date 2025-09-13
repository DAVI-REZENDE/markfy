interface AlertProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

export function Alert({ message, type, onClose }: AlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border border-green-200'
      case 'error':
        return 'bg-red-50 text-red-800 border border-red-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
      case 'info':
        return 'bg-blue-50 text-blue-800 border border-blue-200'
      default:
        return 'bg-gray-50 text-gray-800 border border-gray-200'
    }
  }

  return (
    <div className={`mb-6 p-4 rounded-md ${getAlertStyles()}`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
