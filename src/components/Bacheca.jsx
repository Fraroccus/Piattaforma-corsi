import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import CanvasView from './CanvasView'
import Toolbar from './Toolbar'
import ParticipantToolbar from './ParticipantToolbar'

function Bacheca({ board, isInstructor, participantNickname, onUpdateBoard, onBack }) {
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false)
  const [drawingState, setDrawingState] = useState({
    isDrawing: false,
    tool: 'pen',
    color: '#000000',
    thickness: 8
  })

  const handleAddElement = (elementType) => {
    // Check permissions for non-instructor users
    if (!isInstructor) {
      if (elementType === 'postit' && !board.config.allowPostIt) {
        alert('Non hai i permessi per creare post-it');
        return;
      }
      if (elementType === 'sondaggio' && !board.config.allowSondaggio) {
        alert('Non hai i permessi per creare sondaggi');
        return;
      }
      if (elementType === 'esercizio' && !board.config.allowEsercizio) {
        alert('Non hai i permessi per creare esercizi');
        return;
      }
      if (elementType === 'link' && !board.config.allowLink) {
        alert('Non hai i permessi per creare link');
        return;
      }
    }

    const newElement = {
      id: Date.now().toString(),
      type: elementType,
      position: { x: 100, y: 100 },
      author: isInstructor ? 'formatore' : participantNickname,
      createdAt: new Date().toISOString(),
      data: getDefaultElementData(elementType)
    }

    onUpdateBoard({
      elements: [...board.elements, newElement]
    })
  }

  const getDefaultElementData = (type) => {
    switch (type) {
      case 'postit':
        return {
          text: '',
          color: 'yellow'
        }
      case 'sondaggio':
        return {
          question: 'Nuova domanda',
          options: ['Opzione 1', 'Opzione 2'],
          multipleChoice: false,
          votes: {}
        }
      case 'esercizio':
        return {
          question: 'Nuova domanda',
          responses: []
        }
      case 'link':
        return {
          url: '',
          title: 'Nuovo link'
        }
      default:
        return {}
    }
  }

  const handleUpdateElement = (elementId, updates) => {
    onUpdateBoard({
      elements: board.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      )
    })
  }

  const handleDeleteElement = (elementId) => {
    onUpdateBoard({
      elements: board.elements.filter(el => el.id !== elementId)
    })
  }

  const handleUpdateConfig = (configUpdates) => {
    onUpdateBoard({
      config: { ...board.config, ...configUpdates }
    })
  }

  const handleResetBoard = () => {
    if (confirm('Sei sicuro di voler eliminare tutti gli elementi creati dai corsisti?')) {
      onUpdateBoard({
        elements: board.elements.filter(el => el.author === 'formatore')
      })
    }
  }

  const handleUpdateDrawing = (drawingData) => {
    onUpdateBoard({
      drawingData
    })
  }

  const handleDrawingStateChange = (updates) => {
    if (updates.clearDrawing) {
      if (confirm('Sei sicuro di voler cancellare tutto il disegno?')) {
        handleUpdateDrawing(null)
      }
      return
    }
    setDrawingState(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Torna indietro"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{board.title}</h1>
              <p className="text-xs text-gray-600">
                {isInstructor ? 'Modalità Formatore' : `Partecipante: ${participantNickname}`}
              </p>
            </div>
          </div>
          
          {board.config.isLocked && !isInstructor && (
            <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              🔒 BACHECA BLOCCATA
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar (only for instructor) */}
        {isInstructor && (
          <Toolbar
            board={board}
            collapsed={toolbarCollapsed}
            onToggleCollapse={() => setToolbarCollapsed(!toolbarCollapsed)}
            onAddElement={handleAddElement}
            onUpdateConfig={handleUpdateConfig}
            onResetBoard={handleResetBoard}
            drawingState={drawingState}
            onDrawingStateChange={handleDrawingStateChange}
          />
        )}

        {/* Participant Toolbar (only for participants with permissions) */}
        {!isInstructor && (
          <ParticipantToolbar
            board={board}
            onAddElement={handleAddElement}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <CanvasView
            board={board}
            isInstructor={isInstructor}
            participantNickname={participantNickname}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onUpdateDrawing={handleUpdateDrawing}
            drawingState={drawingState}
          />
        </div>
      </div>
    </div>
  )
}

export default Bacheca
