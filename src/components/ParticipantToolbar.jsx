import { StickyNote, BarChart3, FileQuestion, Link as LinkIcon } from 'lucide-react'

function ParticipantToolbar({ board, onAddElement }) {

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
  }

  return (
    <div className="flex-shrink-0 bg-white border-l shadow-lg w-16 flex flex-col items-center py-4 gap-4">
      {/* Add Element Buttons */}
      {board.config.allowPostIt && (
        <button
          onClick={() => handleAdd('postit')}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors group relative"
          title="Aggiungi Post-it"
        >
          <StickyNote size={24} className="text-yellow-600" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Post-it
          </span>
        </button>
      )}
      
      {board.config.allowSondaggio && (
        <button
          onClick={() => handleAdd('sondaggio')}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors group relative"
          title="Aggiungi Sondaggio"
        >
          <BarChart3 size={24} className="text-primary-600" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Sondaggio
          </span>
        </button>
      )}
      
      {board.config.allowEsercizio && (
        <button
          onClick={() => handleAdd('esercizio')}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors group relative"
          title="Aggiungi Esercizio"
        >
          <FileQuestion size={24} className="text-green-600" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Esercizio
          </span>
        </button>
      )}
      
      {board.config.allowLink && (
        <button
          onClick={() => handleAdd('link')}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors group relative"
          title="Aggiungi Link"
        >
          <LinkIcon size={24} className="text-purple-600" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Link
          </span>
        </button>
      )}
    </div>
  )
}

export default ParticipantToolbar
