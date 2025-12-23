import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Bacheca from './components/Bacheca'
import Login from './components/Login'
import ParticipantJoin from './components/ParticipantJoin'
import { supabase } from './lib/supabase'

function App() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'dashboard', 'bacheca', 'participant'
  const [isInstructor, setIsInstructor] = useState(false)
  const [currentBoardId, setCurrentBoardId] = useState(null)
  const [participantNickname, setParticipantNickname] = useState('')
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load boards from Supabase on mount
  useEffect(() => {
    loadBoards()
    
    // Check if there's a board parameter in the URL for participant join
    const urlParams = new URLSearchParams(window.location.search)
    const boardId = urlParams.get('board')
    if (boardId) {
      setCurrentBoardId(boardId)
      setCurrentView('participant')
    }
  }, [])

  const loadBoards = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Map snake_case to camelCase for consistency
      const boards = (data || []).map(board => ({
        ...board,
        drawingData: board.drawing_data,
        createdAt: board.created_at
      }))
      
      setBoards(boards)
    } catch (error) {
      console.error('Error loading boards:', error)
      setError('Errore nel caricamento delle bacheche: ' + error.message)
      setBoards([])
    } finally {
      setLoading(false)
    }
  }

  // Handle login
  const handleLogin = (username, password) => {
    // Mock authentication - in production will use Supabase
    if (username && password) {
      setIsInstructor(true)
      setCurrentView('dashboard')
    }
  }

  // Handle participant join
  const handleParticipantJoin = async (boardId, nickname) => {
    if (nickname.trim()) {
      try {
        // Upsert participant to database (update if exists, insert if new)
        const { error } = await supabase
          .from('board_participants')
          .upsert({
            board_id: boardId,
            nickname: nickname.trim(),
            joined_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          }, {
            onConflict: 'board_id,nickname'
          })
        
        if (error) {
          console.error('Error joining board:', error)
          throw error
        }
        
        setCurrentBoardId(boardId)
        setParticipantNickname(nickname)
        setCurrentView('bacheca')
      } catch (error) {
        console.error('Error joining board:', error)
        alert('Errore nell\'accesso alla bacheca: ' + (error.message || 'Unknown error'))
      }
    }
  }

  // Create new board
  const handleCreateBoard = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('boards')
        .insert([{
          title: 'Nuova Bacheca',
          config: {
            allowPostIt: true,
            allowDrawing: false,
            allowSondaggio: true,
            allowEsercizio: true,
            allowLink: false,
            isLocked: false
          }
        }])
        .select()
        .single()
      
      if (error) throw error
      await loadBoards() // Reload boards
    } catch (error) {
      console.error('Error creating board:', error)
      alert('Errore nella creazione della bacheca')
    } finally {
      setLoading(false)
    }
  }

  // Delete board
  const handleDeleteBoard = async (boardId) => {
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId)
      
      if (error) throw error
      await loadBoards() // Reload boards
    } catch (error) {
      console.error('Error deleting board:', error)
      alert('Errore nell\'eliminazione della bacheca')
    }
  }

  // Update board title or config
  const handleUpdateBoardMeta = async (boardId, updates) => {
    try {
      const { error } = await supabase
        .from('boards')
        .update(updates)
        .eq('id', boardId)
      
      if (error) throw error
      
      // Update local state
      setBoards(boards.map(b => 
        b.id === boardId ? { ...b, ...updates } : b
      ))
    } catch (error) {
      console.error('Error updating board:', error)
      alert('Errore nell\'aggiornamento della bacheca')
    }
  }

  // Open board (instructor)
  const handleOpenBoard = (boardId) => {
    setCurrentBoardId(boardId)
    setCurrentView('bacheca')
  }

  // Update board
  const handleUpdateBoard = async (boardId, updates) => {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates = {}
      if ('drawingData' in updates) {
        dbUpdates.drawing_data = updates.drawingData
      }
      if ('config' in updates) {
        dbUpdates.config = updates.config
      }
      if ('title' in updates) {
        dbUpdates.title = updates.title
      }
      
      const { error } = await supabase
        .from('boards')
        .update(dbUpdates)
        .eq('id', boardId)
      
      if (error) throw error
      
      // Update local state with camelCase
      setBoards(prev => prev.map(board => 
        board.id === boardId 
          ? { ...board, ...updates }
          : board
      ))
    } catch (error) {
      console.error('Error updating board:', error)
    }
  }

  // Get current board
  const currentBoard = boards.find(b => b.id === currentBoardId)

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      
      {currentView === 'participant' && (
        <ParticipantJoin 
          boardId={currentBoardId}
          onJoin={handleParticipantJoin}
        />
      )}
      
      {currentView === 'dashboard' && (
        <>
          {error && (
            <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
              <p className="font-bold">Errore</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="absolute top-2 right-2 text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          )}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-700">Caricamento...</p>
              </div>
            </div>
          )}
          <Dashboard
            boards={boards}
            onCreateBoard={handleCreateBoard}
            onDeleteBoard={handleDeleteBoard}
            onUpdateBoard={handleUpdateBoardMeta}
            onOpenBoard={handleOpenBoard}
            onLogout={() => {
              setIsInstructor(false)
              setCurrentView('login')
            }}
          />
        </>
      )}
      
      {currentView === 'bacheca' && currentBoard && (
        <Bacheca
          board={currentBoard}
          isInstructor={isInstructor}
          participantNickname={participantNickname}
          onUpdateBoard={(updates) => handleUpdateBoard(currentBoardId, updates)}
          onBack={() => {
            if (isInstructor) {
              setCurrentBoardId(null)
              setCurrentView('dashboard')
            } else {
              // Participant goes back to join page
              setCurrentView('participant')
            }
          }}
        />
      )}
    </div>
  )
}

export default App
