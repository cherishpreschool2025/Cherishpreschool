import React, { useState, useEffect } from 'react'

// Subtle admin access component - hidden in footer for admins to access login
function AdminAccess({ onAdminClick }) {
  const [showLink, setShowLink] = useState(false)

  // Show link on keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl + Shift + A (works on Windows/Linux) or Cmd + Shift + A (Mac)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setShowLink(true)
      }
      // Also support Cmd for Mac users
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setShowLink(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Always show a very subtle link (but make it less obvious)
  return (
    <div className="text-center mt-4">
      <button
        onClick={onAdminClick}
        className="text-white/20 hover:text-white/50 text-xs transition-colors opacity-0 hover:opacity-100"
        style={{ fontSize: '10px' }}
        title="Press Ctrl+Shift+A to access admin"
      >
        Admin
      </button>
    </div>
  )
}

export default AdminAccess

