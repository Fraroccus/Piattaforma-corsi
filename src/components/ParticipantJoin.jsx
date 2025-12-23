import { useState } from 'react'
import { UserPlus } from 'lucide-react'

function ParticipantJoin({ boardId, onJoin }) {
  const [nickname, setNickname] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (nickname.trim()) {
      onJoin(boardId, nickname.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto!
          </h1>
          <p className="text-gray-600">Inserisci un nickname per partecipare</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              Il tuo nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="es. Mario"
              maxLength={30}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              I duplicati sono ammessi
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <UserPlus size={20} />
            Entra nella bacheca
          </button>
        </form>
      </div>
    </div>
  )
}

export default ParticipantJoin
