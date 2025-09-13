'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditorHeaderProps {
  onSave: () => void
  onPublish: () => void
  isLoading: boolean
  showBackButton?: boolean
}

export function EditorHeader({ 
  onSave, 
  onPublish, 
  isLoading, 
  showBackButton = true 
}: EditorHeaderProps) {
  const router = useRouter()

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Markfy</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={isLoading}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button 
            onClick={onPublish}
            disabled={isLoading}
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>
    </header>
  )
}
