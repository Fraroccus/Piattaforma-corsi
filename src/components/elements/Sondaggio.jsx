import { useState, useRef, useEffect } from 'react'
import { Trash2, Edit2, Check, Plus, X } from 'lucide-react'
import Draggable from 'react-draggable'

function Sondaggio({ element, isInstructor, canEdit, canInteract, participantNickname, onUpdate, onDelete }) {
  // Only start in editing mode if created by current user AND question is empty/default
  const [isEditing, setIsEditing] = useState(canEdit && (!element.data.question || element.data.question === 'Nuova domanda'))
  const [question, setQuestion] = useState(element.data.question || '')
  const [options, setOptions] = useState(element.data.options || [])
  const [multipleChoice, setMultipleChoice] = useState(element.data.multipleChoice || false)
  const [position, setPosition] = useState(element.position || { x: 0, y: 0 })
  const nodeRef = useRef(null)
  const isDraggingRef = useRef(false)

  // Sync position when element updates from real-time events (but not while dragging)
  useEffect(() => {
    if (!isDraggingRef.current && element.position) {
      setPosition(element.position)
    }
  }, [element.position])

  // Sync data when element updates from real-time events
  useEffect(() => {
    // Update if data changed, even if in editing mode
    const dataChanged = 
      element.data.question !== question ||
      JSON.stringify(element.data.options) !== JSON.stringify(options) ||
      element.data.multipleChoice !== multipleChoice
    
    if (dataChanged || !isEditing) {
      setQuestion(element.data.question || '')
      setOptions(element.data.options || [])
      setMultipleChoice(element.data.multipleChoice || false)
      // If we receive saved data and we're in editing mode, exit editing mode
      if (element.data.question && element.data.question !== 'Nuova domanda' && isEditing) {
        setIsEditing(false)
      }
    }
    // Note: We don't sync votes to local state, we read directly from element.data.votes
  }, [element.data.question, element.data.options, element.data.multipleChoice])

  const handleDragStop = (e, data) => {
    isDraggingRef.current = false
    if (canEdit) {
      const newPos = { x: data.x, y: data.y }
      setPosition(newPos)
      onUpdate({
        position: newPos
      })
    }
  }

  const handleDragStart = (e) => {
    isDraggingRef.current = true
    e.stopPropagation()
  }

  const handleSave = () => {
    const validOptions = options.filter(o => o.trim())
    if (question.trim() && validOptions.length >= 2) {
      onUpdate({
        data: {
          question: question.trim(),
          options: validOptions,
          multipleChoice,
          votes: element.data.votes || {}
        }
      })
      setIsEditing(false)
    }
  }

  const handleVote = (optionIndex) => {
    if (!canInteract) return

    const votes = { ...element.data.votes }
    const userVotes = votes[participantNickname] || []

    if (multipleChoice) {
      // Toggle vote for this option
      if (userVotes.includes(optionIndex)) {
        votes[participantNickname] = userVotes.filter(v => v !== optionIndex)
      } else {
        votes[participantNickname] = [...userVotes, optionIndex]
      }
    } else {
      // Single choice - replace any existing vote
      votes[participantNickname] = [optionIndex]
    }

    onUpdate({
      data: { ...element.data, votes }
    })
  }

  const getVoteCount = (optionIndex) => {
    const votes = element.data.votes || {}
    return Object.values(votes).filter(userVotes => userVotes.includes(optionIndex)).length
  }

  const getTotalVotes = () => {
    const votes = element.data.votes || {}
    return Object.keys(votes).length
  }

  const getVotePercentage = (optionIndex) => {
    const total = getTotalVotes()
    if (total === 0) return 0
    return Math.round((getVoteCount(optionIndex) / total) * 100)
  }

  const hasUserVoted = (optionIndex) => {
    const votes = element.data.votes || {}
    const userVotes = votes[participantNickname] || []
    return userVotes.includes(optionIndex)
  }

  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStart={handleDragStart}
      onStop={handleDragStop}
      disabled={!canEdit}
      bounds="parent"
      cancel=".no-drag"
    >
      <div
        ref={nodeRef}
        className="absolute bg-white border-2 border-primary-400 rounded-lg shadow-lg"
        style={{ width: '320px', minHeight: '200px' }}
      >
        {/* Header */}
        <div className="p-3 bg-primary-50 border-b border-primary-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-900">
            📊 Sondaggio - {element.author}
          </span>
          <div className="flex items-center gap-1">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-primary-100 rounded"
                title="Modifica"
              >
                <Edit2 size={14} />
              </button>
            )}
            {canEdit && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-primary-100 rounded"
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
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Inserisci domanda"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Opzioni</label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder={`Opzione ${index + 1}`}
                        maxLength={100}
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 8 && (
                  <button
                    onClick={addOption}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Aggiungi opzione
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={multipleChoice}
                  onChange={(e) => setMultipleChoice(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                Risposta multipla
              </label>

              <button
                onClick={handleSave}
                className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
              >
                Salva
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">{element.data.question}</h3>
              
              <div className="text-xs text-gray-500 mb-2">
                {multipleChoice ? 'Scelta multipla' : 'Scelta singola'} • {getTotalVotes()} voti
              </div>

              <div className="space-y-2">
                {element.data.options.map((option, index) => {
                  const count = getVoteCount(index)
                  const percentage = getVotePercentage(index)
                  const voted = hasUserVoted(index)

                  return (
                    <button
                      key={index}
                      onClick={() => handleVote(index)}
                      disabled={!canInteract}
                      className={`w-full text-left relative overflow-hidden rounded-lg border-2 transition-all ${
                        voted 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-300 hover:border-primary-300'
                      } ${!canInteract ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Progress bar */}
                      <div
                        className="absolute inset-0 bg-primary-100 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                      
                      {/* Content */}
                      <div className="relative p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {voted && <Check size={16} className="text-primary-600" />}
                          <span className="text-sm font-medium">{option}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{count}</span>
                          <span className="text-sm font-semibold text-primary-700">{percentage}%</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Draggable>
  )
}

export default Sondaggio
