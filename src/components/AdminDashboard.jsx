import React, { useState, useEffect } from 'react'
import { uploadMultipleImagesToSupabase, deleteImageFromSupabase } from '../utils/imageUpload'

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
    images: [] // Array to store Supabase image URLs
  })
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false) // Loading state for image upload
  const [uploadProgress, setUploadProgress] = useState(0) // Upload progress
  const [showFormModal, setShowFormModal] = useState(false) // Control form modal visibility

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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} file(s) are not images. Please select image files only.`)
      return
    }

    // Validate file sizes (max 50MB each - will be compressed before upload)
    const invalidSizes = files.filter(file => file.size > 50 * 1024 * 1024)
    if (invalidSizes.length > 0) {
      alert(`${invalidSizes.length} image(s) exceed 50MB limit. Please choose smaller files.`)
      return
    }

    // Generate activity ID for organizing files
    const activityId = editingId || `temp-${Date.now()}`

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload images to Supabase
      const totalFiles = files.length
      let uploadedCount = 0

      const { uploadImageToSupabase } = await import('../utils/imageUpload')
      
      const uploadPromises = files.map(async (file) => {
        const url = await uploadImageToSupabase(file, activityId)
        uploadedCount++
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
        return url
      })

      const imageUrls = await Promise.all(uploadPromises)

      // Add uploaded images to form
      setFormData({
        ...formData,
        images: [...formData.images, ...imageUrls]
      })

      alert(`✅ Successfully uploaded ${imageUrls.length} image${imageUrls.length > 1 ? 's' : ''}!`)
    } catch (error) {
      console.error('Upload error:', error)
      alert(`❌ Error uploading images: ${error.message}\n\nMake sure Supabase is configured correctly.`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      e.target.value = ''
    }
  }

  const removeImage = async (index) => {
    const imageToRemove = formData.images[index]
    
    // If it's an uploaded image (Supabase URL), delete it from storage
    if (imageToRemove && imageToRemove.includes('supabase.co')) {
      try {
        await deleteImageFromSupabase(imageToRemove)
        console.log('Deleted image from Supabase:', imageToRemove)
      } catch (error) {
        console.error('Error deleting image from Supabase:', error)
        // Continue with removal from UI even if Supabase deletion fails
      }
    }
    
    // Remove from form
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      images: newImages
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Get existing images if editing, merge with new ones
    let finalImages = formData.images
    if (editingId) {
      const existingActivity = activities.find(a => a.id === editingId)
      if (existingActivity && existingActivity.images) {
        // Merge existing images with new ones (or replace if new ones added)
        finalImages = formData.images.length > 0 ? formData.images : existingActivity.images
      }
    }

    // If we have temp activity IDs in image paths, update them with the real activity ID
    const activityId = editingId || Date.now()
    finalImages = finalImages.map(img => {
      if (img.includes('/temp-')) {
        return img.replace(/\/temp-\d+/, `/${activityId}`)
      }
      return img
    })

    const newActivity = {
      id: activityId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image: finalImages.length > 0 ? '📷' : '🎨',
      color: colorMap[formData.category],
      images: finalImages
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
    
    // Reset form and close modal
    setFormData({
      title: '',
      description: '',
      category: 'art',
      images: []
    })
    setEditingId(null)
    setShowFormModal(false)
  }

  const handleEdit = (activity) => {
    // Get images (now stored as Supabase URLs)
    const existingImages = activity.images || []
    
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      images: existingImages
    })
    setEditingId(activity.id)
    setShowFormModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity? This will also delete all associated images.')) {
      // Find the activity to get its images
      const activityToDelete = activities.find(activity => activity.id === id)
      
      // Delete all images from Supabase Storage
      if (activityToDelete && activityToDelete.images && activityToDelete.images.length > 0) {
        try {
          // Delete all images in parallel
          await Promise.all(
            activityToDelete.images.map(imageUrl => deleteImageFromSupabase(imageUrl))
          )
          console.log(`Deleted ${activityToDelete.images.length} image(s) from Supabase`)
        } catch (error) {
          console.error('Error deleting images from Supabase:', error)
          // Continue with activity deletion even if image deletion fails
        }
      }
      
      // Remove activity from list
      const updatedActivities = activities.filter(activity => activity.id !== id)
      onUpdateActivities(updatedActivities)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      category: 'art',
      images: []
    })
    setEditingId(null)
    setShowFormModal(false)
  }

  const handleNewActivity = () => {
    setFormData({
      title: '',
      description: '',
      category: 'art',
      images: []
    })
    setEditingId(null)
    setShowFormModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage activities and upload student photos</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-red-600 transition-colors flex-1 sm:flex-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Activities List - Full Width */}
        <div>
          {/* Activities List */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">Manage Activities ({activities.length})</h2>
              <button
                onClick={handleNewActivity}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full text-2xl sm:text-3xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                title="Add New Activity"
              >
                +
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4"
                >
                  <div className="flex-shrink-0 flex justify-center sm:justify-start">
                    {(() => {
                      const images = activity.images || []
                      const firstImage = images[0]
                      
                      if (firstImage) {
                        return (
                          <div className="relative">
                            <img
                              src={firstImage}
                              alt={activity.title}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                            />
                            {images.length > 1 && (
                              <div className="absolute -top-2 -right-2 bg-cherish-pink text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                +{images.length}
                              </div>
                            )}
                          </div>
                        )
                      } else {
                        return (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-3xl sm:text-4xl">
                            {activity.image}
                          </div>
                        )
                      }
                    })()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 break-words">{activity.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-0">
                      <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                        {categories.find(c => c.id === activity.category)?.name}
                      </span>
                      {activity.images?.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                          📷 {activity.images.length} photo{activity.images.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 sm:flex-col lg:flex-row">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-600 transition-colors flex-1 sm:flex-none"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-red-600 transition-colors flex-1 sm:flex-none"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600 text-lg">No activities yet. Click the + button to add your first activity!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showFormModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={handleCancel}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 rounded-t-2xl sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {editingId ? 'Edit Activity' : 'Add New Activity'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
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
                    <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                      Upload Photos
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {uploading && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Uploading... {uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      📸 Select multiple images to upload (max 50MB each). Images will be automatically compressed and stored securely in Supabase.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ⚡ Images are compressed to ~1MB each for faster loading and less storage usage.
                    </p>
                    
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Added Photos ({formData.images.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 sm:h-32 object-cover rounded-xl border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1 rounded-full opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 sm:py-3 rounded-xl text-sm sm:text-base font-bold hover:shadow-lg transition-all"
                    >
                      {editingId ? 'Update Activity' : 'Add Activity'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard


