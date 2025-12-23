import { StickyNote, BarChart3, FileQuestion, Link as LinkIcon } from 'lucide-react'

function ParticipantToolbar({ board, onAddElement }) {
  const handleAdd = (type) => {
    onAddElement(type)
  }

  return (
    <div className="flex-shrink-0 bg-white border-l shadow-lg w-16 flex flex-col items-center py-4 gap-4">
      {/* Post-it Button */}
      <button
        onClick={() => handleAdd('postit')}
        disabled={!board.config.allowPostIt}
        className={`p-3 rounded-lg transition-colors group relative ${
          board.config.allowPostIt
            ? 'hover:bg-gray-100 cursor-pointer'
            : 'opacity-30 cursor-not-allowed'
        }`}
        title={board.config.allowPostIt ? "Aggiungi Post-it" : "Post-it non consentiti"}
      >
        <StickyNote size={24} className="text-yellow-600" />
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {board.config.allowPostIt ? 'Post-it' : 'Non consentiti'}
        </span>
      </button>
      
      {/* Sondaggio Button */}
      <button
        onClick={() => handleAdd('sondaggio')}
        disabled={!board.config.allowSondaggio}
        className={`p-3 rounded-lg transition-colors group relative ${
          board.config.allowSondaggio
            ? 'hover:bg-gray-100 cursor-pointer'
            : 'opacity-30 cursor-not-allowed'
        }`}
        title={board.config.allowSondaggio ? "Aggiungi Sondaggio" : "Sondaggi non consentiti"}
      >
        <BarChart3 size={24} className="text-primary-600" />
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {board.config.allowSondaggio ? 'Sondaggio' : 'Non consentiti'}
        </span>
      </button>
      
      {/* Esercizio Button */}
      <button
        onClick={() => handleAdd('esercizio')}
        disabled={!board.config.allowEsercizio}
        className={`p-3 rounded-lg transition-colors group relative ${
          board.config.allowEsercizio
            ? 'hover:bg-gray-100 cursor-pointer'
            : 'opacity-30 cursor-not-allowed'
        }`}
        title={board.config.allowEsercizio ? "Aggiungi Esercizio" : "Esercizi non consentiti"}
      >
        <FileQuestion size={24} className="text-green-600" />
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {board.config.allowEsercizio ? 'Esercizio' : 'Non consentiti'}
        </span>
      </button>
      
      {/* Link Button */}
      <button
        onClick={() => handleAdd('link')}
        disabled={!board.config.allowLink}
        className={`p-3 rounded-lg transition-colors group relative ${
          board.config.allowLink
            ? 'hover:bg-gray-100 cursor-pointer'
            : 'opacity-30 cursor-not-allowed'
        }`}
        title={board.config.allowLink ? "Aggiungi Link" : "Link non consentiti"}
      >
        <LinkIcon size={24} className="text-purple-600" />
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {board.config.allowLink ? 'Link' : 'Non consentiti'}
        </span>
      </button>
    </div>
  )
}

export default ParticipantToolbar
