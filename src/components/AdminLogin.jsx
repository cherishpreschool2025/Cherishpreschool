import React, { useState } from 'react'

function AdminLogin({ onLogin, onBack }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')

  // Get admin credentials from environment variables
  const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'cherish2025'

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
      localStorage.setItem('adminLoggedIn', 'true')
      onLogin(true)
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cherish-pink via-cherish-purple to-cherish-blue p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold hidden sm:inline">Back to Dashboard</span>
            <span className="font-semibold sm:hidden">Back</span>
          </button>
        )}
        
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔐</div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Admin Login</h2>
          <p className="text-sm sm:text-base text-gray-600">Cherish Pre School Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cherish-pink to-cherish-purple text-white py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin

