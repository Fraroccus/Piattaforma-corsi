import { useRef, useEffect, useState } from 'react'

function DrawingCanvas({ board, isInstructor, canDraw, drawingState, onUpdateDrawing }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const cursorCanvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState(null)
  const [cursorContext, setCursorContext] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const lastPoint = useRef(null)

  const canUserDraw = isInstructor || canDraw
  const isDrawingModeActive = drawingState?.isDrawing && canUserDraw
  const isEraserMode = drawingState?.tool === 'eraser'

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      setContext(ctx)
      
      // Load existing drawing if any
      if (board.drawingData) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
        }
        img.src = board.drawingData
      }
    }

    // Setup cursor canvas
    const cursorCanvas = cursorCanvasRef.current
    if (cursorCanvas) {
      const cursorCtx = cursorCanvas.getContext('2d')
      setCursorContext(cursorCtx)
    }
  }, [])

  // Reload drawing when it changes (e.g., after clear)
  useEffect(() => {
    if (context && board.drawingData === null) {
      const canvas = canvasRef.current
      context.clearRect(0, 0, canvas.width, canvas.height)
    } else if (context && board.drawingData) {
      const img = new Image()
      img.onload = () => {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        context.drawImage(img, 0, 0)
      }
      img.src = board.drawingData
    }
  }, [board.drawingData, context])

  // Draw cursor circle
  useEffect(() => {
    if (!cursorContext) return

    const cursorCanvas = cursorCanvasRef.current
    const thickness = drawingState?.thickness || 8
    
    // Clear previous cursor
    cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height)
    
    // Only draw if in drawing mode and using eraser
    if (isDrawingModeActive && isEraserMode) {
      // Draw new cursor circle
      cursorContext.beginPath()
      cursorContext.arc(mousePos.x, mousePos.y, thickness / 2, 0, Math.PI * 2)
      cursorContext.strokeStyle = '#FF0000'
      cursorContext.lineWidth = 2
      cursorContext.stroke()
    }
  }, [mousePos, cursorContext, isDrawingModeActive, isEraserMode, drawingState?.thickness])

  const startDrawing = (e) => {
    if (!isDrawingModeActive) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Get actual mouse position relative to the canvas element itself
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    setIsDrawing(true)
    lastPoint.current = { x, y }
    
    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing || !isDrawingModeActive) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Get actual mouse position relative to the canvas element itself
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    const tool = drawingState?.tool || 'pen'
    const color = drawingState?.color || '#000000'
    const thickness = drawingState?.thickness || 8

    context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
    context.lineWidth = thickness
    context.lineTo(x, y)
    context.stroke()

    lastPoint.current = { x, y }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Update mouse position for cursor
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    setMousePos({ x, y })
    
    // Continue drawing if mouse is down
    draw(e)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    context.closePath()
    
    // Save drawing to board state
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL()
    onUpdateDrawing(dataUrl)
  }

  return (
    <>
      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        width={4000}
        height={4000}
        className={`absolute inset-0 ${
          isDrawingModeActive 
            ? (isEraserMode ? 'cursor-none' : 'cursor-crosshair')
            : 'pointer-events-none'
        }`}
        style={{ zIndex: 10 }}
        onMouseDown={startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      {/* Cursor Canvas - shows eraser circle */}
      <canvas
        ref={cursorCanvasRef}
        width={4000}
        height={4000}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 11, display: (isDrawingModeActive && isEraserMode) ? 'block' : 'none' }}
      />
    </>
  )
}

export default DrawingCanvas
