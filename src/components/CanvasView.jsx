import { useRef, useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import PostIt from './elements/PostIt'
import Sondaggio from './elements/Sondaggio'
import Esercizio from './elements/Esercizio'
import LinkElement from './elements/LinkElement'
import DrawingCanvas from './DrawingCanvas'

function CanvasView({ board, isInstructor, participantNickname, onUpdateElement, onDeleteElement, onUpdateDrawing, drawingState }) {
  const [canDraw, setCanDraw] = useState(false)
  const transformRef = useRef(null)

  // Check if user can interact
  const canInteract = isInstructor || !board?.config?.isLocked
  
  // Disable panning when in drawing mode
  const isPanningDisabled = drawingState?.isDrawing || false

  // Safety check
  if (!board) {
    return <div className="w-full h-full flex items-center justify-center">Caricamento...</div>
  }

  // Reset zoom
  const handleResetZoom = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform()
    }
  }

  const renderElement = (element) => {
    const commonProps = {
      key: element.id,
      element,
      isInstructor,
      canEdit: isInstructor || element.author === participantNickname,
      canInteract,
      onUpdate: (updates) => onUpdateElement(element.id, updates),
      onDelete: () => onDeleteElement(element.id)
    }

    switch (element.type) {
      case 'postit':
        return <PostIt {...commonProps} />
      case 'sondaggio':
        return <Sondaggio {...commonProps} participantNickname={participantNickname} />
      case 'esercizio':
        return <Esercizio {...commonProps} participantNickname={participantNickname} />
      case 'link':
        return <LinkElement {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md border flex flex-col">
        <button
          onClick={() => transformRef.current?.zoomIn()}
          className="p-2 hover:bg-gray-100 border-b"
          title="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => transformRef.current?.zoomOut()}
          className="p-2 hover:bg-gray-100 border-b"
          title="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 hover:bg-gray-100"
          title="Reset zoom"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Locked Banner */}
      {board?.config?.isLocked && !isInstructor && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-md text-sm font-medium">
          🔒 Bacheca bloccata - Solo visualizzazione
        </div>
      )}

      {/* Canvas with Zoom/Pan */}
      <TransformWrapper
        ref={transformRef}
        initialScale={0.2}
        minScale={0.1}
        maxScale={2}
        limitToBounds={false}
        centerOnInit={true}
        wheel={{ step: 0.1, disabled: isPanningDisabled }}
        doubleClick={{ disabled: true }}
        panning={{ 
          disabled: isPanningDisabled,
          velocityDisabled: true,
          excluded: ['input', 'textarea', 'button', 'select', 'a']
        }}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="flex items-center justify-center"
        >
          {/* Canvas Area */}
          <div className="relative bg-white shadow-2xl" style={{ width: '4000px', height: '4000px' }}>
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            />

            {/* Elements */}
            <div className="relative w-full h-full">
              {(board.elements || []).map(renderElement)}
            </div>

            {/* Drawing Layer */}
            <DrawingCanvas
              board={board}
              isInstructor={isInstructor}
              canDraw={board?.config?.allowDrawing || false}
              drawingState={drawingState}
              onUpdateDrawing={onUpdateDrawing}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

export default CanvasView
