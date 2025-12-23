import { Plus, Trash2, ExternalLink, Users, LogOut, Calendar, Edit2, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

function Dashboard({ boards, onCreateBoard, onDeleteBoard, onUpdateBoard, onOpenBoard, onLogout }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingTitle, setEditingTitle] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBoardLink = (boardId) => {
    return `${window.location.origin}?board=${boardId}`
  }

  const copyLink = (boardId) => {
    const link = getBoardLink(boardId)
    navigator.clipboard.writeText(link)
    alert('Link copiato negli appunti!')
  }

  const handleDelete = (boardId) => {
    if (deleteConfirm === boardId) {
      onDeleteBoard(boardId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(boardId)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const startEditTitle = (board) => {
    setEditingTitle(board.id)
    setEditTitle(board.title)
  }

  const saveTitle = (boardId) => {
    if (editTitle.trim()) {
      onUpdateBoard(boardId, { title: editTitle.trim() })
    }
    setEditingTitle(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Formatore</h1>
              <p className="text-sm text-gray-600 mt-1">ITS Maker Academy</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Esci
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Board Button */}
        <div className="mb-8">
          <button
            onClick={onCreateBoard}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md"
          >
            <Plus size={20} />
            Nuova Bacheca
          </button>
        </div>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Nessuna bacheca creata</p>
            <p className="text-gray-400 text-sm mt-2">Clicca su "Nuova Bacheca" per iniziare</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  {/* Board Title */}
                  {editingTitle === board.id ? (
                    <div className="mb-4 flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveTitle(board.id)}
                        className="flex-1 text-xl font-semibold text-gray-900 border-b-2 border-primary-500 outline-none"
                        autoFocus
                        maxLength={50}
                      />
                      <button
                        onClick={() => saveTitle(board.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Salva"
                      >
                        <Check size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center gap-2 group">
                      <h3 className="flex-1 text-xl font-semibold text-gray-900">
                        {board.title}
                      </h3>
                      <button
                        onClick={() => startEditTitle(board)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Modifica titolo"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{board.participants.length} partecipanti attivi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(board.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => onOpenBoard(board.id)}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Apri
                    </button>
                    <button
                      onClick={() => handleDelete(board.id)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        deleteConfirm === board.id
                          ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                      title="Elimina"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* QR Code - Always visible */}
                  <div className="border-t pt-4">
                    <div className="flex flex-col items-center gap-3">
                      <QRCodeSVG 
                        value={getBoardLink(board.id)} 
                        size={150}
                        className="border-2 border-gray-200 p-2 rounded"
                      />
                      <button
                        onClick={() => copyLink(board.id)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Copia link
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === board.id && (
                    <div className="text-xs text-red-600 text-center">
                      Clicca ancora per confermare
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
