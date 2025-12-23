import { useState } from 'react'
import { Plus, StickyNote, BarChart3, FileQuestion, Link as LinkIcon, X } from 'lucide-react'

function ParticipantToolbar({ board, onAddElement }) {
  const [isOpen, setIsOpen] = useState(false)

  // Check which permissions are enabled
  const hasAnyPermission = 
    board.config.allowPostIt || 
    board.config.allowSondaggio || 
    board.config.allowEsercizio || 
    board.config.allowLink

  // Don't show toolbar if no permissions
  if (!hasAnyPermission) {
    return null
  }

  const handleAdd = (type) => {
    onAddElement(type)
    setIsOpen(false)
  }

  return (
    <div className="absolute bottom-6 left-6 z-20">
      {/* Main Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-all"
          title="Aggiungi elemento"
        >
          <Plus size={24} />
          <span className="font-medium">Aggiungi</span>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl border-2 border-primary-200 p-3 min-w-48">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <span className="font-semibold text-gray-900">Aggiungi</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-1">
            {board.config.allowPostIt && (
              <button
                onClick={() => handleAdd('postit')}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm text-left"
              >
                <StickyNote size={16} className="text-yellow-600" />
                Post-it
              </button>
            )}
            
            {board.config.allowSondaggio && (
              <button
                onClick={() => handleAdd('sondaggio')}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm text-left"
              >
                <BarChart3 size={16} className="text-primary-600" />
                Sondaggio
              </button>
            )}
            
            {board.config.allowEsercizio && (
              <button
                onClick={() => handleAdd('esercizio')}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm text-left"
              >
                <FileQuestion size={16} className="text-green-600" />
                Esercizio
              </button>
            )}
            
            {board.config.allowLink && (
              <button
                onClick={() => handleAdd('link')}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm text-left"
              >
                <LinkIcon size={16} className="text-purple-600" />
                Link
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ParticipantToolbar
