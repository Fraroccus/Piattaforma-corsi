import { useState, useRef, useEffect } from 'react'
import { Trash2, Edit2, ExternalLink, Link as LinkIcon } from 'lucide-react'
import Draggable from 'react-draggable'

function LinkElement({ element, isInstructor, canEdit, canInteract, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(!element.data.url)
  const [url, setUrl] = useState(element.data.url || '')
  const [title, setTitle] = useState(element.data.title || '')
  const [showPreview, setShowPreview] = useState(false)
  const [position, setPosition] = useState(element.position || { x: 0, y: 0 })
  const nodeRef = useRef(null)

  // Sync position when element updates from real-time events
  useEffect(() => {
    if (element.position) {
      setPosition(element.position)
    }
  }, [element.position])

  // Sync data when element updates from real-time events
  useEffect(() => {
    if (!isEditing) {
      setUrl(element.data.url || '')
      setTitle(element.data.title || '')
    }
  }, [element, isEditing])

  const handleDragStop = (e, data) => {
    if (isInstructor) {
      const newPos = { x: data.x, y: data.y }
      setPosition(newPos)
      onUpdate({
        position: newPos
      })
    }
  }

  const handleDragStart = (e) => {
    e.stopPropagation()
  }

  const handleSave = () => {
    if (url.trim()) {
      // Ensure URL has protocol
      let finalUrl = url.trim()
      if (!finalUrl.match(/^https?:\/\//i)) {
        finalUrl = 'https://' + finalUrl
      }

      onUpdate({
        data: {
          url: finalUrl,
          title: title.trim() || 'Link'
        }
      })
      setIsEditing(false)
    }
  }

  const openInNewTab = () => {
    window.open(element.data.url, '_blank', 'noopener,noreferrer')
  }

  const isIframeable = (url) => {
    // Some sites don't allow iframing - this is a simple check
    const domain = new URL(url).hostname
    const nonIframeableDomains = ['youtube.com', 'twitter.com', 'instagram.com', 'facebook.com']
    return !nonIframeableDomains.some(d => domain.includes(d))
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStart={handleDragStart}
      onStop={handleDragStop}
      disabled={!isInstructor}
      bounds="parent"
      cancel=".no-drag"
    >
      <div
        ref={nodeRef}
        className="absolute bg-white border-2 border-purple-400 rounded-lg shadow-lg"
        style={{ width: showPreview ? '600px' : '300px', minHeight: '120px' }}
      >
        {/* Header */}
        <div className="p-3 bg-purple-50 border-b border-purple-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-purple-900 flex items-center gap-2">
            <LinkIcon size={16} />
            Link - {element.author}
          </span>
          <div className="flex items-center gap-1">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-purple-100 rounded"
                title="Modifica"
              >
                <Edit2 size={14} />
              </button>
            )}
            {canEdit && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-purple-100 rounded"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Titolo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Titolo del link"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="https://esempio.com"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
              >
                Salva
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Link Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{element.data.title}</h3>
                <div className="text-xs text-gray-500 break-all mb-3">
                  {element.data.url}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={openInNewTab}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-medium"
                >
                  <ExternalLink size={14} />
                  Apri in nuova tab
                </button>
                
                {isIframeable(element.data.url) && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 border border-purple-300 text-purple-700 rounded hover:bg-purple-50 text-sm font-medium"
                  >
                    {showPreview ? 'Nascondi' : 'Anteprima'}
                  </button>
                )}
              </div>

              {/* Preview iframe */}
              {showPreview && isIframeable(element.data.url) && (
                <div className="mt-3 border-2 border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={element.data.url}
                    className="w-full h-96"
                    title={element.data.title}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Draggable>
  )
}

export default LinkElement
