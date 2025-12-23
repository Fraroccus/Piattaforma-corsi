import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Bacheca from './components/Bacheca'
import Login from './components/Login'
import ParticipantJoin from './components/ParticipantJoin'

function App() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'dashboard', 'bacheca', 'participant'
  const [isInstructor, setIsInstructor] = useState(false)
  const [currentBoardId, setCurrentBoardId] = useState(null)
  const [participantNickname, setParticipantNickname] = useState('')
  
  // Mock boards data (will be replaced with Supabase later)
  const [boards, setBoards] = useState([
    {
      id: '1',
      title: 'Bacheca Demo',
      createdAt: new Date().toISOString(),
      config: {
        allowPostIt: true,
        allowDrawing: false,
        allowSondaggio: true,
        allowEsercizio: true,
        allowLink: false,
        isLocked: false
      },
      elements: [],
      participants: [],
      drawingData: null
    }
  ])

  // Handle login
  const handleLogin = (username, password) => {
    // Mock authentication - in production will use Supabase
    if (username && password) {
      setIsInstructor(true)
      setCurrentView('dashboard')
    }
  }

  // Handle participant join
  const handleParticipantJoin = (boardId, nickname) => {
    if (nickname.trim()) {
      setCurrentBoardId(boardId)
      setParticipantNickname(nickname)
      setCurrentView('bacheca')
      
      // Add participant to board
      setBoards(prev => prev.map(board => 
        board.id === boardId 
          ? {
              ...board,
              participants: [...board.participants, {
                nickname,
                joinedAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
              }]
            }
          : board
      ))
    }
  }

  // Create new board
  const handleCreateBoard = () => {
    const newBoard = {
      id: Date.now().toString(),
      title: 'Nuova Bacheca',
      createdAt: new Date().toISOString(),
      config: {
        allowPostIt: true,
        allowDrawing: false,
        allowSondaggio: true,
        allowEsercizio: true,
        allowLink: false,
        isLocked: false
      },
      elements: [],
      participants: [],
      drawingData: null
    }
    setBoards([...boards, newBoard])
  }

  // Delete board
  const handleDeleteBoard = (boardId) => {
    setBoards(boards.filter(b => b.id !== boardId))
  }

  // Update board title or config
  const handleUpdateBoardMeta = (boardId, updates) => {
    setBoards(boards.map(b => 
      b.id === boardId ? { ...b, ...updates } : b
    ))
  }

  // Open board (instructor)
  const handleOpenBoard = (boardId) => {
    setCurrentBoardId(boardId)
    setCurrentView('bacheca')
  }

  // Update board
  const handleUpdateBoard = (boardId, updates) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? { ...board, ...updates }
        : board
    ))
  }

  // Get current board
  const currentBoard = boards.find(b => b.id === currentBoardId)

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      
      {currentView === 'dashboard' && (
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
      )}
      
      {currentView === 'bacheca' && currentBoard && (
        <Bacheca
          board={currentBoard}
          isInstructor={isInstructor}
          participantNickname={participantNickname}
          onUpdateBoard={(updates) => handleUpdateBoard(currentBoardId, updates)}
          onBack={() => {
            setCurrentBoardId(null)
            setCurrentView(isInstructor ? 'dashboard' : 'login')
          }}
        />
      )}
    </div>
  )
}

export default App
