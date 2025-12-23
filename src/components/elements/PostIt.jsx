import { useState, useRef, useEffect } from 'react'
import { Trash2, GripVertical } from 'lucide-react'
import Draggable from 'react-draggable'

const COLORS = {
  yellow: { bg: 'bg-yellow-200', border: 'border-yellow-400', text: 'text-gray-900' },
  pink: { bg: 'bg-pink-200', border: 'border-pink-400', text: 'text-gray-900' },
  green: { bg: 'bg-green-200', border: 'border-green-400', text: 'text-gray-900' },
  blue: { bg: 'bg-blue-200', border: 'border-blue-400', text: 'text-gray-900' },
  orange: { bg: 'bg-orange-200', border: 'border-orange-400', text: 'text-gray-900' },
}

function PostIt({ element, isInstructor, canEdit, canInteract, onUpdate, onDelete }) {
  // Only start in editing mode if created by current user AND text is empty
  const [isEditing, setIsEditing] = useState(canEdit && !element.data.text)
  const [text, setText] = useState(element.data.text || '')
  const [position, setPosition] = useState(element.position || { x: 0, y: 0 })
  const nodeRef = useRef(null)
  const isDraggingRef = useRef(false)

  // Sync position when element updates from real-time events (but not while dragging)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setPosition(element.position || { x: 0, y: 0 })
    }
  }, [element.position?.x, element.position?.y])

  // Sync text when element updates from real-time events
  useEffect(() => {
    if (!isEditing) {
      setText(element.data?.text || '')
    }
  }, [element, isEditing])

  const colorScheme = COLORS[element.data.color] || COLORS.yellow

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
    if (text.trim()) {
      onUpdate({
        data: { ...element.data, text: text.trim() }
      })
      setIsEditing(false)
    }
  }

  const handleColorChange = (color) => {
    onUpdate({
      data: { ...element.data, color }
    })
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
        className={`absolute ${colorScheme.bg} border-2 ${colorScheme.border} rounded-lg shadow-lg`}
        style={{ width: '200px', minHeight: '200px' }}
      >
        {/* Header */}
        <div className="p-2 flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center gap-1">
            {canEdit && (
              <div className="cursor-move">
                <GripVertical size={16} className="text-gray-500" />
              </div>
            )}
            <span className="text-xs font-medium text-gray-600">
              {element.author}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-gray-200 rounded"
                title="Elimina"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 no-drag">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 280))}
                className="w-full h-32 p-2 bg-white bg-opacity-50 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Scrivi qui..."
                maxLength={280}
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{text.length}/280</span>
                <button
                  onClick={handleSave}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                >
                  Salva
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => canEdit && setIsEditing(true)}
              onMouseDown={(e) => e.stopPropagation()}
              className={`min-h-32 text-sm whitespace-pre-wrap ${canEdit ? 'cursor-pointer hover:bg-opacity-70' : ''}`}
            >
              {text}
            </div>
          )}
        </div>

        {/* Color Picker */}
        {canEdit && !isEditing && (
          <div className="p-2 border-t border-gray-300 flex gap-1 justify-center no-drag">
            {Object.keys(COLORS).map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  element.data.color === color ? 'border-gray-700' : 'border-gray-300'
                } ${COLORS[color].bg}`}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="px-2 pb-1 text-xs text-gray-500 text-right">
          {new Date(element.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </Draggable>
  )
}

export default PostIt
