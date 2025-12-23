import { useState, useEffect } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import CanvasView from './CanvasView'
import Toolbar from './Toolbar'
import ParticipantToolbar from './ParticipantToolbar'
import { supabase } from '../lib/supabase'

function Bacheca({ board, isInstructor, participantNickname, onUpdateBoard, onBack }) {
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false)
  const [elements, setElements] = useState([])
  const [drawingState, setDrawingState] = useState({
    isDrawing: false,
    tool: 'pen',
    color: '#000000',
    thickness: 8
  })

  // Load elements from Supabase on mount and set up real-time subscription
  useEffect(() => {
    if (!board?.id) return

    loadElements()

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`board_${board.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'board_elements',
          filter: `board_id=eq.${board.id}`
        },
        (payload) => {
          console.log('Real-time event:', payload.eventType, payload)
          if (payload.eventType === 'INSERT') {
            // Check if element already exists (to avoid duplicates from optimistic updates)
            setElements(prev => {
              const exists = prev.some(el => el.id === payload.new.id)
              console.log('INSERT - exists?', exists, 'new element:', payload.new.id)
              return exists ? prev : [...prev, payload.new]
            })
          } else if (payload.eventType === 'UPDATE') {
            console.log('UPDATE payload.new:', payload.new)
            setElements(prev => {
              console.log('Current elements before update:', prev.length)
              const updated = prev.map(el => {
                if (el.id === payload.new.id) {
                  console.log('Found matching element, updating:', el.id)
                  console.log('Old element:', el)
                  console.log('New element:', payload.new)
                  return payload.new
                }
                return el
              })
              console.log('Elements after update:', updated.length)
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setElements(prev => prev.filter(el => el.id !== payload.old.id))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'boards',
          filter: `id=eq.${board.id}`
        },
        (payload) => {
          // Update board drawing data when it changes
          if (payload.new.drawing_data !== board.drawingData) {
            onUpdateBoard({ drawingData: payload.new.drawing_data })
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to board:', board.id)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel subscription error')
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Channel subscription timed out')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [board?.id])

  const loadElements = async () => {
    try {
      const { data, error } = await supabase
        .from('board_elements')
        .select('*')
        .eq('board_id', board.id)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setElements(data || [])
    } catch (error) {
      console.error('Error loading elements:', error)
    }
  }

  const handleAddElement = async (elementType) => {
    // Check permissions for non-instructor users
    if (!isInstructor) {
      if (elementType === 'postit' && !board.config.allowPostIt) {
        alert('Non hai i permessi per creare post-it');
        return;
      }
      if (elementType === 'sondaggio' && !board.config.allowSondaggio) {
        alert('Non hai i permessi per creare sondaggi');
        return;
      }
      if (elementType === 'esercizio' && !board.config.allowEsercizio) {
        alert('Non hai i permessi per creare esercizi');
        return;
      }
      if (elementType === 'link' && !board.config.allowLink) {
        alert('Non hai i permessi per creare link');
        return;
      }
    }

    const newElement = {
      board_id: board.id,
      type: elementType,
      position: { x: 100, y: 100 },
      author: isInstructor ? 'formatore' : participantNickname,
      data: getDefaultElementData(elementType)
    }

    try {
      const { data, error } = await supabase
        .from('board_elements')
        .insert([newElement])
        .select()
        .single()
      
      if (error) throw error
      
      console.log('Optimistic insert - added element:', data?.id)
      // Optimistically add to UI (real-time will also add it, but this is faster)
      if (data) {
        setElements(prev => [...prev, data])
      }
    } catch (error) {
      console.error('Error adding element:', error)
      alert('Errore nell\'aggiunta dell\'elemento')
    }
  }

  const getDefaultElementData = (type) => {
    switch (type) {
      case 'postit':
        return {
          text: '',
          color: 'yellow'
        }
      case 'sondaggio':
        return {
          question: 'Nuova domanda',
          options: ['Opzione 1', 'Opzione 2'],
          multipleChoice: false,
          votes: {}
        }
      case 'esercizio':
        return {
          question: 'Nuova domanda',
          responses: []
        }
      case 'link':
        return {
          url: '',
          title: 'Nuovo link'
        }
      default:
        return {}
    }
  }

  const handleUpdateElement = async (elementId, updates) => {
    try {
      // Optimistically update UI
      setElements(prev => prev.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ))
      
      const { error } = await supabase
        .from('board_elements')
        .update(updates)
        .eq('id', elementId)
      
      if (error) {
        // Revert on error by reloading
        await loadElements()
        throw error
      }
    } catch (error) {
      console.error('Error updating element:', error)
    }
  }

  const handleDeleteElement = async (elementId) => {
    try {
      // Optimistically remove from UI
      setElements(prev => prev.filter(el => el.id !== elementId))
      
      const { error } = await supabase
        .from('board_elements')
        .delete()
        .eq('id', elementId)
      
      if (error) {
        // Revert on error by reloading
        await loadElements()
        throw error
      }
    } catch (error) {
      console.error('Error deleting element:', error)
      alert('Errore nell\'eliminazione dell\'elemento')
    }
  }

  const handleUpdateConfig = (configUpdates) => {
    onUpdateBoard({
      config: { ...board.config, ...configUpdates }
    })
  }

  const handleResetBoard = async () => {
    if (confirm('Sei sicuro di voler eliminare tutti gli elementi creati dai corsisti?')) {
      try {
        const { error } = await supabase
          .from('board_elements')
          .delete()
          .eq('board_id', board.id)
          .neq('author', 'formatore')
        
        if (error) throw error
      } catch (error) {
        console.error('Error resetting board:', error)
        alert('Errore nel reset della bacheca')
      }
    }
  }

  const handleUpdateDrawing = async (drawingData) => {
    try {
      const { error } = await supabase
        .from('boards')
        .update({ drawing_data: drawingData })
        .eq('id', board.id)
      
      if (error) throw error
      
      // Update local state
      onUpdateBoard({ drawingData: drawingData })
    } catch (error) {
      console.error('Error updating drawing:', error)
    }
  }

  const handleDrawingStateChange = (updates) => {
    if (updates.clearDrawing) {
      if (confirm('Sei sicuro di voler cancellare tutto il disegno?')) {
        handleUpdateDrawing(null)
      }
      return
    }
    setDrawingState(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Torna indietro"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{board.title}</h1>
              <p className="text-xs text-gray-600">
                {isInstructor ? 'Modalità Formatore' : `Partecipante: ${participantNickname}`}
              </p>
            </div>
          </div>
          
          {board.config.isLocked && !isInstructor && (
            <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              🔒 BACHECA BLOCCATA
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar (only for instructor) */}
        {isInstructor && (
          <Toolbar
            board={board}
            collapsed={toolbarCollapsed}
            onToggleCollapse={() => setToolbarCollapsed(!toolbarCollapsed)}
            onAddElement={handleAddElement}
            onUpdateConfig={handleUpdateConfig}
            onResetBoard={handleResetBoard}
            drawingState={drawingState}
            onDrawingStateChange={handleDrawingStateChange}
          />
        )}

        {/* Participant Toolbar (only for participants with permissions) */}
        {!isInstructor && (
          <ParticipantToolbar
            board={board}
            onAddElement={handleAddElement}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <CanvasView
            board={{ ...board, elements }}
            isInstructor={isInstructor}
            participantNickname={participantNickname}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onUpdateDrawing={handleUpdateDrawing}
            drawingState={drawingState}
          />
        </div>
      </div>
    </div>
  )
}

export default Bacheca
