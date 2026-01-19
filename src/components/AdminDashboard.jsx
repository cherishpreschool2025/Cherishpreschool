import React, { useState, useEffect } from 'react'

function AdminDashboard({ onLogout, activities, onUpdateActivities }) {
  const [showAppointments, setShowAppointments] = useState(false)
  const [appointments, setAppointments] = useState([])

  // Load appointments from localStorage
  useEffect(() => {
    const savedAppointments = JSON.parse(localStorage.getItem('cherishAppointments') || '[]')
    setAppointments(savedAppointments)
  }, [])

  // Listen for new appointments
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAppointments = JSON.parse(localStorage.getItem('cherishAppointments') || '[]')
      setAppointments(savedAppointments)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check periodically for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'art',
    date: new Date().toISOString().split('T')[0],
    images: [] // Array to store multiple images
  })
  const [editingId, setEditingId] = useState(null)

  const categories = [
    { id: 'art', name: 'Art & Craft', emoji: '🎨' },
    { id: 'music', name: 'Music', emoji: '🎵' },
    { id: 'nature', name: 'Nature', emoji: '🌿' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'reading', name: 'Reading', emoji: '📚' },
    { id: 'science', name: 'Science', emoji: '🔬' }
  ]

  const colorMap = {
    art: 'from-cherish-pink to-rose-400',
    music: 'from-cherish-purple to-indigo-400',
    nature: 'from-cherish-green to-emerald-400',
    reading: 'from-cherish-blue to-cyan-400',
    sports: 'from-cherish-orange to-red-400',
    science: 'from-cherish-yellow to-amber-400'
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} image(s) exceed 5MB limit. Please choose smaller files.`)
      return
    }

    // Read all files
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(readers).then(results => {
      setFormData({
        ...formData,
        images: [...formData.images, ...results]
      })
    })

    // Reset file input
    e.target.value = ''
  }

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      images: newImages
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Get existing images if editing, merge with new ones
    let finalImages = formData.images
    if (editingId) {
      const existingActivity = activities.find(a => a.id === editingId)
      if (existingActivity && existingActivity.images) {
        // Merge existing images with new ones (or replace if new ones added)
        finalImages = formData.images.length > 0 ? formData.images : existingActivity.images
      } else if (existingActivity && existingActivity.imageFile) {
        // Migrate old single image format to new array format
        finalImages = formData.images.length > 0 ? formData.images : [existingActivity.imageFile]
      }
    }

    const newActivity = {
      id: editingId || Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      image: finalImages.length > 0 ? '📷' : '🎨', // Fallback emoji
      color: colorMap[formData.category],
      images: finalImages, // Store array of images
      // Keep backward compatibility
      imageFile: finalImages.length > 0 ? finalImages[0] : null
    }

    let updatedActivities
    if (editingId) {
      updatedActivities = activities.map(activity =>
        activity.id === editingId ? newActivity : activity
      )
      setEditingId(null)
    } else {
      updatedActivities = [...activities, newActivity]
    }

    onUpdateActivities(updatedActivities)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'art',
      date: new Date().toISOString().split('T')[0],
      images: []
    })
  }

  const handleEdit = (activity) => {
    // Get images from new format (images array) or old format (imageFile)
    const existingImages = activity.images || (activity.imageFile ? [activity.imageFile] : [])
    
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      date: activity.date,
      images: existingImages
    })
    setEditingId(activity.id)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      const updatedActivities = activities.filter(activity => activity.id !== id)
      onUpdateActivities(updatedActivities)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      category: 'art',
      date: new Date().toISOString().split('T')[0],
      images: []
    })
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage activities and upload student photos</p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowAppointments(!showAppointments)}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors relative"
              >
                📅 Appointments
                {appointments.filter(apt => apt.status === 'pending').length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {appointments.filter(apt => apt.status === 'pending').length}
                  </span>
                )}
              </button>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.hash = ''
                  window.location.reload()
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                View Site
              </a>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Panel */}
        {showAppointments && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                Appointment Requests ({appointments.length})
              </h2>
              <button
                onClick={() => setShowAppointments(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-600 text-lg">No appointment requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {appointments
                  .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                  .map(appointment => (
                    <div
                      key={appointment.id}
                      className={`border-2 rounded-xl p-5 ${
                        appointment.status === 'pending'
                          ? 'border-yellow-300 bg-yellow-50'
                          : appointment.status === 'confirmed'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {appointment.parentName} - {appointment.childName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Child Age: {appointment.childAge} years
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === 'pending'
                              ? 'bg-yellow-200 text-yellow-800'
                              : appointment.status === 'confirmed'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="font-semibold text-gray-700">Email:</p>
                          <a
                            href={`mailto:${appointment.email}`}
                            className="text-cherish-blue hover:underline"
                          >
                            {appointment.email}
                          </a>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">Phone:</p>
                          <a
                            href={`tel:${appointment.phone}`}
                            className="text-cherish-blue hover:underline"
                          >
                            {appointment.phone}
                          </a>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">Date:</p>
                          <p className="text-gray-600">
                            {new Date(appointment.preferredDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">Time:</p>
                          <p className="text-gray-600">{appointment.preferredTime}</p>
                        </div>
                      </div>

                      {appointment.message && (
                        <div className="mb-3">
                          <p className="font-semibold text-gray-700 text-sm">Message:</p>
                          <p className="text-gray-600 text-sm">{appointment.message}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                const updated = appointments.map(apt =>
                                  apt.id === appointment.id
                                    ? { ...apt, status: 'confirmed' }
                                    : apt
                                )
                                setAppointments(updated)
                                localStorage.setItem('cherishAppointments', JSON.stringify(updated))
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                            >
                              ✓ Confirm
                            </button>
                            <button
                              onClick={() => {
                                const updated = appointments.map(apt =>
                                  apt.id === appointment.id
                                    ? { ...apt, status: 'cancelled' }
                                    : apt
                                )
                                setAppointments(updated)
                                localStorage.setItem('cherishAppointments', JSON.stringify(updated))
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this appointment request?')) {
                              const updated = appointments.filter(apt => apt.id !== appointment.id)
                              setAppointments(updated)
                              localStorage.setItem('cherishAppointments', JSON.stringify(updated))
                            }
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        Submitted: {new Date(appointment.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                {editingId ? 'Edit Activity' : 'Add New Activity'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Activity Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none"
                    placeholder="e.g., Art & Craft Day"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none"
                    rows="3"
                    placeholder="Describe the activity..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload Photos (Multiple allowed)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">You can select multiple photos at once (max 5MB each)</p>
                  
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Uploaded Photos ({formData.images.length})
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cherish-pink to-cherish-purple text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    {editingId ? 'Update' : 'Add Activity'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Activities List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold gradient-text mb-6">Manage Activities ({activities.length})</h2>
            
            <div className="space-y-4">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-white rounded-xl shadow-lg p-6 flex gap-4"
                >
                  <div className="flex-shrink-0">
                    {(() => {
                      const images = activity.images || (activity.imageFile ? [activity.imageFile] : [])
                      const firstImage = images[0]
                      
                      if (firstImage) {
                        return (
                          <div className="relative">
                            <img
                              src={firstImage}
                              alt={activity.title}
                              className="w-24 h-24 object-cover rounded-xl"
                            />
                            {images.length > 1 && (
                              <div className="absolute -top-2 -right-2 bg-cherish-pink text-white text-xs font-bold px-2 py-1 rounded-full">
                                +{images.length}
                              </div>
                            )}
                          </div>
                        )
                      } else {
                        return (
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-4xl">
                            {activity.image}
                          </div>
                        )
                      }
                    })()}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{activity.title}</h3>
                    <p className="text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        {categories.find(c => c.id === activity.category)?.name}
                      </span>
                      {(activity.images?.length > 0 || activity.imageFile) && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          📷 {activity.images?.length || 1} photo{(activity.images?.length || 1) > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600 text-lg">No activities yet. Add your first activity!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

