import { useState } from 'react'
import {
  Plus, Users, Settings, Share2, Lock, RotateCcw,
  Eye, ChevronLeft, ChevronRight, StickyNote, BarChart3,
  FileQuestion, Link as LinkIcon, Pen, Eraser, Trash2
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

const DRAWING_COLORS = [
  { name: 'Nero', value: '#000000' },
  { name: 'Rosso', value: '#EF4444' },
  { name: 'Blu', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Giallo', value: '#F59E0B' },
  { name: 'Viola', value: '#8B5CF6' },
]

const DRAWING_THICKNESS = [
  { name: 'Fine', value: 2 },
  { name: 'Medio', value: 8 },
  { name: 'Spesso', value: 30 },
]

function Toolbar({ board, collapsed, onToggleCollapse, onAddElement, onUpdateConfig, onResetBoard, drawingState, onDrawingStateChange }) {
  const [activePanel, setActivePanel] = useState(null)

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  const getBoardLink = () => {
    return `${window.location.origin}?board=${board.id}`
  }

  const copyLink = () => {
    navigator.clipboard.writeText(getBoardLink())
    alert('Link copiato negli appunti!')
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-bacheca-${board.id}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  if (collapsed) {
    return (
      <div className="bg-white border-r shadow-sm w-16 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Espandi toolbar"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border-r shadow-sm w-80 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Toolbar Formatore</h2>
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Riduci toolbar"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Add Elements */}
        <div className="border rounded-lg">
          <button
            onClick={() => togglePanel('add')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus size={20} className="text-primary-600" />
              <span className="font-medium">Aggiungi</span>
            </div>
          </button>
          
          {activePanel === 'add' && (
            <div className="p-2 border-t space-y-1">
              <button
                onClick={() => { onAddElement('postit'); setActivePanel(null); }}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm"
              >
                <StickyNote size={16} />
                Post-it
              </button>
              <button
                onClick={() => { onAddElement('sondaggio'); setActivePanel(null); }}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm"
              >
                <BarChart3 size={16} />
                Sondaggio
              </button>
              <button
                onClick={() => { onAddElement('esercizio'); setActivePanel(null); }}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm"
              >
                <FileQuestion size={16} />
                Esercizio
              </button>
              <button
                onClick={() => { onAddElement('link'); setActivePanel(null); }}
                className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 rounded text-sm"
              >
                <LinkIcon size={16} />
                Link/Risorsa
              </button>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="border rounded-lg">
          <button
            onClick={() => togglePanel('participants')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users size={20} className="text-primary-600" />
              <span className="font-medium">Partecipanti</span>
            </div>
            <span className="text-sm bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {board.participants?.length || 0}
            </span>
          </button>
          
          {activePanel === 'participants' && (
            <div className="p-2 border-t max-h-48 overflow-y-auto">
              {!board.participants || board.participants.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Nessun partecipante</p>
              ) : (
                <div className="space-y-1">
                  {board.participants.map((p, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded text-sm flex items-center justify-between">
                      <span>{p.nickname}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(p.lastSeen).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="border rounded-lg">
          <button
            onClick={() => togglePanel('permissions')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-primary-600" />
              <span className="font-medium">Permessi Corsisti</span>
            </div>
          </button>
          
          {activePanel === 'permissions' && (
            <div className="p-3 border-t space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Creazione Post-it</span>
                <input
                  type="checkbox"
                  checked={board.config.allowPostIt}
                  onChange={(e) => onUpdateConfig({ allowPostIt: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Creazione Sondaggi</span>
                <input
                  type="checkbox"
                  checked={board.config.allowSondaggio}
                  onChange={(e) => onUpdateConfig({ allowSondaggio: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Creazione Esercizi</span>
                <input
                  type="checkbox"
                  checked={board.config.allowEsercizio}
                  onChange={(e) => onUpdateConfig({ allowEsercizio: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Creazione Link</span>
                <input
                  type="checkbox"
                  checked={board.config.allowLink}
                  onChange={(e) => onUpdateConfig({ allowLink: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Disegno</span>
                <input
                  type="checkbox"
                  checked={board.config.allowDrawing}
                  onChange={(e) => onUpdateConfig({ allowDrawing: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
              </label>
            </div>
          )}
        </div>

        {/* Share */}
        <div className="border rounded-lg">
          <button
            onClick={() => togglePanel('share')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Share2 size={20} className="text-primary-600" />
              <span className="font-medium">Condividi</span>
            </div>
          </button>
          
          {activePanel === 'share' && (
            <div className="p-3 border-t">
              <div className="flex flex-col items-center gap-3">
                <QRCodeSVG 
                  id="qr-code"
                  value={getBoardLink()} 
                  size={180}
                />
                <div className="w-full space-y-2">
                  <button
                    onClick={copyLink}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Copia link
                  </button>
                  <button
                    onClick={downloadQR}
                    className="w-full border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium"
                  >
                    Scarica QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lock Board */}
        <div className="border rounded-lg">
          <label className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <Lock size={20} className="text-primary-600" />
              <span className="font-medium">Blocca Bacheca</span>
            </div>
            <input
              type="checkbox"
              checked={board.config.isLocked}
              onChange={(e) => onUpdateConfig({ isLocked: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded"
            />
          </label>
        </div>

        {/* Drawing Tools */}
        <div className="border rounded-lg">
          <button
            onClick={() => togglePanel('drawing')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Pen size={20} className="text-primary-600" />
              <span className="font-medium">Disegno</span>
            </div>
            {drawingState.isDrawing && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Attivo
              </span>
            )}
          </button>
          
          {activePanel === 'drawing' && (
            <div className="p-3 border-t space-y-4">
              {/* Enable/Disable Drawing Mode */}
              <button
                onClick={() => onDrawingStateChange({ isDrawing: !drawingState.isDrawing })}
                className={`w-full p-3 rounded-lg font-medium transition-colors ${
                  drawingState.isDrawing
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {drawingState.isDrawing ? '✓ Modalità Disegno Attiva' : 'Attiva Modalità Disegno'}
              </button>

              {/* Tool Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Strumento</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDrawingStateChange({ tool: 'pen' })}
                    disabled={!drawingState.isDrawing}
                    className={`flex-1 p-2 rounded flex items-center justify-center gap-1 transition-colors ${
                      drawingState.tool === 'pen' && drawingState.isDrawing
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${!drawingState.isDrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Pen size={16} />
                  </button>
                  <button
                    onClick={() => onDrawingStateChange({ tool: 'eraser' })}
                    disabled={!drawingState.isDrawing}
                    className={`flex-1 p-2 rounded flex items-center justify-center gap-1 transition-colors ${
                      drawingState.tool === 'eraser' && drawingState.isDrawing
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${!drawingState.isDrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Eraser size={16} />
                  </button>
                </div>
              </div>

              {/* Color Selection */}
              {drawingState.tool === 'pen' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Colore</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DRAWING_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => onDrawingStateChange({ color: c.value })}
                        disabled={!drawingState.isDrawing}
                        className={`w-full h-8 rounded border-2 transition-all ${
                          drawingState.color === c.value ? 'border-gray-900 scale-110' : 'border-gray-300'
                        } ${!drawingState.isDrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Thickness Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Spessore</label>
                <div className="space-y-1">
                  {DRAWING_THICKNESS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => onDrawingStateChange({ thickness: t.value })}
                      disabled={!drawingState.isDrawing}
                      className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors ${
                        drawingState.thickness === t.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${!drawingState.isDrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Drawing */}
              <button
                onClick={() => onDrawingStateChange({ clearDrawing: true })}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-300 rounded hover:bg-red-100 text-sm font-medium"
              >
                <Trash2 size={14} />
                Cancella disegno
              </button>
            </div>
          )}
        </div>

        {/* Reset Board */}
        <button
          onClick={onResetBoard}
          className="w-full p-3 flex items-center gap-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <RotateCcw size={20} />
          <span className="font-medium">Reset Bacheca</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
