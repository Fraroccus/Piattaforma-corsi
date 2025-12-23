import { useState, useRef } from 'react'
import { Trash2, Edit2, Send } from 'lucide-react'
import Draggable from 'react-draggable'

function Esercizio({ element, isInstructor, canEdit, canInteract, participantNickname, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(!element.data.question || element.data.question === 'Nuova domanda')
  const [question, setQuestion] = useState(element.data.question || '')
  const [responseText, setResponseText] = useState('')
  const nodeRef = useRef(null)

  const handleDragStop = (e, data) => {
    if (isInstructor) {
      onUpdate({
        position: { x: data.x, y: data.y }
      })
    }
  }

  const handleDragStart = (e) => {
    e.stopPropagation()
  }

  const handleSaveQuestion = () => {
    if (question.trim()) {
      onUpdate({
        data: {
          ...element.data,
          question: question.trim()
        }
      })
      setIsEditing(false)
    }
  }

  const handleSubmitResponse = () => {
    if (!responseText.trim() || !canInteract) return

    // Check if user already responded
    const hasResponded = element.data.responses.some(r => r.author === participantNickname)
    if (hasResponded && !isInstructor) {
      alert('Hai già inviato una risposta!')
      return
    }

    const newResponse = {
      author: participantNickname,
      text: responseText.trim(),
      timestamp: new Date().toISOString()
    }

    onUpdate({
      data: {
        ...element.data,
        responses: [...element.data.responses, newResponse]
      }
    })

    setResponseText('')
  }

  const hasUserResponded = () => {
    return element.data.responses.some(r => r.author === participantNickname)
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={element.position}
      onStart={handleDragStart}
      onStop={handleDragStop}
      disabled={!isInstructor}
      bounds="parent"
      cancel=".no-drag"
    >
      <div
        ref={nodeRef}
        className="absolute bg-white border-2 border-green-400 rounded-lg shadow-lg"
        style={{ width: '360px', minHeight: '250px' }}
      >
        {/* Header */}
        <div className="p-3 bg-green-50 border-b border-green-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-green-900">
            ✏️ Esercizio - {element.author}
          </span>
          <div className="flex items-center gap-1">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-green-100 rounded"
                title="Modifica"
              >
                <Edit2 size={14} />
              </button>
            )}
            {canEdit && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-green-100 rounded"
                title="Elimina"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 no-drag">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Domanda</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
                  placeholder="Inserisci la domanda dell'esercizio"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {question.length}/500
                </div>
              </div>

              <button
                onClick={handleSaveQuestion}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Salva
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Question */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-medium text-gray-900 whitespace-pre-wrap">
                  {element.data.question}
                </h3>
              </div>

              {/* Response Input */}
              {canInteract && !hasUserResponded() && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">La tua risposta</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Scrivi la tua risposta..."
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{responseText.length}/1000</span>
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!responseText.trim()}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Send size={14} />
                      Invia
                    </button>
                  </div>
                </div>
              )}

              {/* User already responded */}
              {canInteract && hasUserResponded() && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-700">
                  ✓ Risposta inviata
                </div>
              )}

              {/* Responses List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Risposte ({element.data.responses.length})
                  </h4>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {element.data.responses.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nessuna risposta ancora
                    </p>
                  ) : (
                    element.data.responses.map((response, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-semibold text-primary-600">
                            {response.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(response.timestamp).toLocaleTimeString('it-IT', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {response.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Draggable>
  )
}

export default Esercizio
