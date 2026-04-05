import React, { useEffect, useMemo, useState } from 'react'
import { uploadImageToSupabase, deleteImageFromSupabase } from '../utils/imageUpload'
import { saveActivitiesToSupabase, deleteActivityFromSupabase } from '../utils/activities'
import { fetchHealthChecksFromSupabase } from '../utils/healthChecks'

function AdminDashboard({ onLogout, activities, onUpdateActivities }) {
  const [activeTab, setActiveTab] = useState('activities')
  const [showAppointments, setShowAppointments] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [healthChecks, setHealthChecks] = useState([])
  const [healthLoading, setHealthLoading] = useState(false)
  const [runningCron, setRunningCron] = useState(false)
  const [healthTableMissing, setHealthTableMissing] = useState(false)
  const [healthError, setHealthError] = useState('')
  const [draftActivityId, setDraftActivityId] = useState(null)
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [activityCategory, setActivityCategory] = useState('all')
  const [activitySort, setActivitySort] = useState('newest')
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false)

  const pushToast = (toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const next = {
      id,
      type: toast?.type || 'info', // info | success | error
      title: toast?.title || '',
      message: toast?.message || '',
      timeoutMs: typeof toast?.timeoutMs === 'number' ? toast.timeoutMs : 3500,
    }

    setToasts((prev) => [next, ...prev].slice(0, 5))

    if (next.timeoutMs > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, next.timeoutMs)
    }
  }

  const askConfirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm }) => {
    setConfirmState({ title, message, confirmText, cancelText, onConfirm })
  }

  const btnBase =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl md:rounded-2xl font-semibold transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2'

  const btn = {
    primary: `${btnBase} bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-700 focus:ring-purple-400`,
    dark: `${btnBase} bg-gray-900 text-white shadow-md hover:bg-black focus:ring-gray-400`,
    info: `${btnBase} bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:ring-blue-400`,
    danger: `${btnBase} bg-red-600 text-white shadow-md hover:bg-red-700 focus:ring-red-400`,
    soft: `${btnBase} bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300`,
    outline: `${btnBase} bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-purple-400`,
  }

  const activityStats = useMemo(() => {
    let photos = 0
    let covers = 0
    let withNoPhotos = 0

    for (const a of activities || []) {
      const cover = a?.cover_image_url ? String(a.cover_image_url).trim() : ''
      if (cover) covers++
      const imgs = (a?.images || []).filter((x) => x && String(x).trim() !== '')
      const total = imgs.length + (cover && !imgs.includes(cover) ? 1 : 0)
      photos += total
      if (total === 0) withNoPhotos++
    }

    return { photos, covers, withNoPhotos }
  }, [activities])

  const filteredActivities = useMemo(() => {
    const photoCountFor = (a) => {
      const cover = a?.cover_image_url ? String(a.cover_image_url).trim() : ''
      const imgs = (a?.images || []).filter((x) => x && String(x).trim() !== '')
      return imgs.length + (cover && !imgs.includes(cover) ? 1 : 0)
    }

    const list = (activities || []).filter((a) => {
      if (activityCategory !== 'all' && a?.category !== activityCategory) return false
      if (onlyWithPhotos && photoCountFor(a) === 0) return false
      return true
    })

    const sorted = [...list]
    if (activitySort === 'oldest') {
      sorted.sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0))
    } else if (activitySort === 'title') {
      sorted.sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')))
    } else {
      // newest
      sorted.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
    }

    return sorted
  }, [activities, activityCategory, activitySort, onlyWithPhotos])

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

  const loadHealthChecks = async () => {
    setHealthLoading(true)
    setHealthError('')
    try {
      const { checks, tableMissing, error } = await fetchHealthChecksFromSupabase({ limit: 30 })
      setHealthChecks(checks)
      setHealthTableMissing(tableMissing)
      if (error && !tableMissing) {
        setHealthError(error.message || 'Failed to load health checks')
      }
    } catch (error) {
      setHealthError(error?.message || 'Failed to load health checks')
    } finally {
      setHealthLoading(false)
    }
  }

  const runCronNow = async () => {
    setRunningCron(true)
    setHealthError('')

    try {
      const host = window.location.hostname
      const isLocal = host === 'localhost' || host === '127.0.0.1'

      const resp = await fetch('/api/cron/ping', { method: 'GET' })
      const contentType = resp.headers.get('content-type') || ''

      let payload = null
      if (contentType.includes('application/json')) {
        try {
          payload = await resp.json()
        } catch {
          payload = null
        }
      } else {
        // Vercel 404 pages are HTML; Vite may also return index.html with a 200 for unknown paths.
        try {
          await resp.text()
        } catch {
          // ignore
        }
      }

      if (!resp.ok) {
        if (resp.status === 404) {
          setHealthError(
            isLocal
              ? "You're running locally (Vite). `/api/cron/ping` is a Vercel Function and won't exist on `npm run dev`. Test it on the deployed site, or run `vercel dev` locally."
              : "Cron endpoint not found (404). Ensure your Vercel project Root Directory is 'cherish-pre-school' and redeploy Production.",
          )
        } else if (resp.status === 401) {
          setHealthError(
            payload?.error ||
              'Unauthorized. If CRON_SECRET is set, the Admin UI cannot call the cron endpoint.',
          )
        } else {
          setHealthError(payload?.error || `Failed to run cron (${resp.status})`)
        }
        return
      }

      // If we got a 200 but not JSON, we're almost certainly hitting the SPA fallback locally.
      if (!contentType.includes('application/json')) {
        setHealthError(
          isLocal
            ? "Local dev server returned HTML for `/api/cron/ping` (SPA fallback). This endpoint only exists on Vercel. Use the deployed site, or run `vercel dev`."
            : `Cron endpoint returned unexpected content-type (${contentType || 'unknown'}).`,
        )
        return
      }

      // If the cron ran but couldn't write a row, surface it.
      if (payload && payload.log && payload.log.ok === false) {
        setHealthError(
          'Cron ran but could not write to `health_checks`. Check that the table exists and `SUPABASE_SERVICE_ROLE_KEY` is set correctly in Vercel.',
        )
        return
      }
    } catch (error) {
      setHealthError(error?.message || 'Failed to run cron')
      return
    } finally {
      setRunningCron(false)
    }

    await loadHealthChecks()
  }

  useEffect(() => {
    if (activeTab !== 'health') return

    let cancelled = false
    let intervalId = null

    const run = async () => {
      setHealthLoading(true)
      setHealthError('')
      try {
        const { checks, tableMissing, error } = await fetchHealthChecksFromSupabase({ limit: 30 })
        if (cancelled) return { tableMissing: false }
        setHealthChecks(checks)
        setHealthTableMissing(tableMissing)
        setHealthError(error && !tableMissing ? error.message || 'Failed to load health checks' : '')
        return { tableMissing }
      } catch (error) {
        if (cancelled) return { tableMissing: false }
        setHealthError(error?.message || 'Failed to load health checks')
        return { tableMissing: false }
      } finally {
        if (!cancelled) setHealthLoading(false)
      }
    }

    ;(async () => {
      const { tableMissing } = await run()
      if (cancelled) return
      if (!tableMissing) {
        intervalId = setInterval(run, 30_000)
      }
    })()

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [activeTab])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'art',
    cover_image_url: '',
    images: [] // Array to store Supabase image URLs
  })
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false) // Loading state for image upload
  const [uploadProgress, setUploadProgress] = useState(0) // Upload progress
  const [coverUploading, setCoverUploading] = useState(false)
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
      pushToast({
        type: 'error',
        title: 'Invalid file type',
        message: `${invalidFiles.length} file(s) are not images. Please select image files only.`,
      })
      return
    }

    // Validate file sizes (max 50MB each - will be compressed before upload)
    const invalidSizes = files.filter(file => file.size > 50 * 1024 * 1024)
    if (invalidSizes.length > 0) {
      pushToast({
        type: 'error',
        title: 'Files too large',
        message: `${invalidSizes.length} image(s) exceed 50MB limit. Please choose smaller files.`,
      })
      return
    }

    // Upload into a stable activity folder so URLs never break.
    // For new activities, we create a draft ID once and reuse it across uploads + final save.
    const resolvedActivityId = editingId || draftActivityId || Date.now()
    if (!editingId && !draftActivityId) setDraftActivityId(resolvedActivityId)

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload images to Supabase
      const totalFiles = files.length
      let uploadedCount = 0
      
      const uploadPromises = files.map(async (file) => {
        const url = await uploadImageToSupabase(file, resolvedActivityId)
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

      pushToast({
        type: 'success',
        title: 'Upload complete',
        message: `Uploaded ${imageUrls.length} photo${imageUrls.length > 1 ? 's' : ''}.`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      pushToast({
        type: 'error',
        title: 'Upload failed',
        message: error?.message || 'Error uploading images. Make sure Supabase is configured correctly.',
        timeoutMs: 6000,
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      pushToast({ type: 'error', title: 'Invalid file', message: 'Cover file must be an image.' })
      return
    }

    // Validate file size (max 50MB before compression)
    if (file.size > 50 * 1024 * 1024) {
      pushToast({
        type: 'error',
        title: 'Cover too large',
        message: 'Cover image must be less than 50MB. Please choose a smaller file.',
      })
      return
    }

    // Upload into a stable activity folder so URLs never break.
    const resolvedActivityId = editingId || draftActivityId || Date.now()
    if (!editingId && !draftActivityId) setDraftActivityId(resolvedActivityId)

    setCoverUploading(true)
    try {
      const previousCover = formData.cover_image_url
      const url = await uploadImageToSupabase(file, resolvedActivityId)

      setFormData({
        ...formData,
        cover_image_url: url,
      })

      pushToast({ type: 'success', title: 'Cover set', message: 'Cover photo updated.' })

      // Best-effort cleanup of old cover image if it's being replaced
      const previousCoverUsedInGallery =
        previousCover && (formData.images || []).includes(previousCover)
      if (
        previousCover &&
        previousCover.includes('supabase.co') &&
        previousCover !== url &&
        !previousCoverUsedInGallery
      ) {
        deleteImageFromSupabase(previousCover).catch(() => {})
      }
    } catch (error) {
      console.error('Cover upload error:', error)
      pushToast({
        type: 'error',
        title: 'Cover upload failed',
        message: error?.message || 'Error uploading cover image.',
        timeoutMs: 6000,
      })
    } finally {
      setCoverUploading(false)
      e.target.value = ''
    }
  }

  const removeCoverImage = async () => {
    const coverToRemove = formData.cover_image_url
    if (!coverToRemove) return

    const coverUsedInGallery = (formData.images || []).includes(coverToRemove)
    if (coverToRemove.includes('supabase.co') && !coverUsedInGallery) {
      try {
        await deleteImageFromSupabase(coverToRemove)
      } catch (error) {
        console.error('Error deleting cover image from Supabase:', error)
      }
    }

    setFormData({
      ...formData,
      cover_image_url: '',
    })

    pushToast({ type: 'info', title: 'Cover removed', message: 'Cover photo cleared.' })

    // If editing an existing activity, persist the change immediately (same behavior as image removal)
    if (editingId) {
      const existingActivity = activities.find(a => a.id === editingId)
      if (existingActivity) {
        const updatedActivity = {
          ...existingActivity,
          cover_image_url: null,
        }
        const updatedActivities = activities.map(activity =>
          activity.id === editingId ? updatedActivity : activity
        )
        try {
          await saveActivitiesToSupabase(updatedActivities)
          onUpdateActivities(updatedActivities)
        } catch (error) {
          console.error('Error saving to Supabase after cover removal:', error)
        }
      }
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
    const removedWasCover = imageToRemove && imageToRemove === formData.cover_image_url
    setFormData({
      ...formData,
      images: newImages,
      cover_image_url: removedWasCover ? '' : formData.cover_image_url,
    })
    
    // If editing an existing activity, update it immediately in localStorage and Supabase
    if (editingId) {
      const existingActivity = activities.find(a => a.id === editingId)
      if (existingActivity) {
        const updatedActivity = {
          ...existingActivity,
          images: newImages,
          cover_image_url: removedWasCover ? null : existingActivity.cover_image_url || null,
        }
        const updatedActivities = activities.map(activity =>
          activity.id === editingId ? updatedActivity : activity
        )
        // Save to Supabase first
        try {
          await saveActivitiesToSupabase(updatedActivities)
          // Only update state after successful Supabase save
          onUpdateActivities(updatedActivities)
        } catch (error) {
          console.error('Error saving to Supabase after image removal:', error)
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Use current form images (already updated when images are removed)
    // Filter out any empty/invalid image URLs
    let finalImages = formData.images.filter(img => img && img.trim() !== '')
    const activityId = editingId || draftActivityId || Date.now()

    const newActivity = {
      id: activityId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      image: finalImages.length > 0 || formData.cover_image_url ? '📷' : '🎨',
      color: colorMap[formData.category],
      cover_image_url: formData.cover_image_url || null,
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

    // Save to Supabase first (this is the source of truth)
    try {
      await saveActivitiesToSupabase(updatedActivities)
      console.log('Activities saved to Supabase successfully')
      // Only update local state after successful Supabase save
      onUpdateActivities(updatedActivities)
      pushToast({
        type: 'success',
        title: editingId ? 'Activity updated' : 'Activity created',
        message: 'Saved successfully.',
      })
    } catch (error) {
      console.error('Error saving activities to Supabase:', error)
      pushToast({
        type: 'error',
        title: 'Save failed',
        message: error?.message || 'Error saving activities. Please try again.',
        timeoutMs: 6000,
      })
      // Don't update state if Supabase save fails
    }
    
    // Reset form and close modal
    setFormData({
      title: '',
      description: '',
      category: 'art',
      cover_image_url: '',
      images: []
    })
    setEditingId(null)
    setDraftActivityId(null)
    setShowFormModal(false)
  }

  const handleEdit = (activity) => {
    // Get images (now stored as Supabase URLs)
    const existingImages = activity.images || []
    
    setFormData({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      cover_image_url: activity.cover_image_url || '',
      images: existingImages
    })
    setEditingId(activity.id)
    setDraftActivityId(activity.id)
    setShowFormModal(true)
  }

  const handleDelete = async (id) => {
    askConfirm({
      title: 'Delete activity?',
      message: 'This will delete the activity and its photos from storage. This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: async () => {
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

      // Delete cover image (if set)
      const coverToDelete = activityToDelete?.cover_image_url ? String(activityToDelete.cover_image_url) : ''
      const coverIsInGallery = coverToDelete && (activityToDelete?.images || []).includes(coverToDelete)
      if (coverToDelete && coverToDelete.includes('supabase.co') && !coverIsInGallery) {
        try {
          await deleteImageFromSupabase(coverToDelete)
        } catch (error) {
          console.error('Error deleting cover image from Supabase:', error)
        }
      }
      
      // Delete activity from Supabase database
      try {
        await deleteActivityFromSupabase(id)
        console.log('Activity deleted from Supabase successfully')
      } catch (error) {
        console.error('Error deleting activity from Supabase:', error)
        // Continue even if Supabase delete fails
      }
      
      // Remove activity from list
      const updatedActivities = activities.filter(activity => activity.id !== id)
      
      // Save updated activities list to Supabase first
      try {
        await saveActivitiesToSupabase(updatedActivities)
        console.log('Updated activities saved to Supabase successfully')
        // Only update state after successful Supabase save
        onUpdateActivities(updatedActivities)
        pushToast({ type: 'success', title: 'Deleted', message: 'Activity removed.' })
      } catch (error) {
        console.error('Error saving updated activities to Supabase:', error)
        pushToast({
          type: 'error',
          title: 'Delete failed',
          message: error?.message || 'Error deleting activity. Please try again.',
          timeoutMs: 6000,
        })
        // Don't update state if Supabase save fails
      }
      },
    })
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      category: 'art',
      cover_image_url: '',
      images: []
    })
    setEditingId(null)
    setDraftActivityId(null)
    setShowFormModal(false)
  }

  const handleNewActivity = () => {
    setFormData({
      title: '',
      description: '',
      category: 'art',
      cover_image_url: '',
      images: []
    })
    setEditingId(null)
    setDraftActivityId(Date.now())
    setShowFormModal(true)
    pushToast({ type: 'info', title: 'New activity', message: 'Fill the form and upload photos.' })
  }

  const latestHealthCheck = healthChecks?.[0] || null

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
                className={`${btn.danger} px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base flex-1 sm:flex-none`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Overview */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">Activities</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{activities.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {activityStats.withNoPhotos > 0 ? `${activityStats.withNoPhotos} without photos` : 'All have photos'}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-4">
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">Photos</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{activityStats.photos}</p>
              <p className="text-xs text-gray-500 mt-1">Includes cover + gallery</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-yellow-50 to-white p-4">
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">Covers</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{activityStats.covers}</p>
              <p className="text-xs text-gray-500 mt-1">Set for activity cards</p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('health')}
              className="text-left rounded-2xl border border-gray-100 bg-gradient-to-br from-green-50 to-white p-4 hover:shadow-md transition-shadow"
              title="Open Health tab"
            >
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">Supabase Health</p>
              <div className="mt-2 flex items-center gap-2">
                {latestHealthCheck ? (
                  <span
                    className={[
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border',
                      latestHealthCheck.ok
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200',
                    ].join(' ')}
                  >
                    {latestHealthCheck.ok ? 'Healthy' : 'Degraded'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">
                    Not loaded
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {latestHealthCheck?.checked_at ? `Last: ${new Date(latestHealthCheck.checked_at).toLocaleString()}` : 'Tap to view'}
              </p>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-2 sm:p-3 mb-4 sm:mb-6 sticky top-3 z-40 border border-white/40">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('activities')}
              className={[
                activeTab === 'activities' ? btn.primary : btn.soft,
                'px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base',
              ].join(' ')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h3l1 1h8a2 2 0 012 2v2H4V6zm0 5h20v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7z"
                />
              </svg>
              Activities
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('health')}
              className={[
                activeTab === 'health' ? btn.primary : btn.soft,
                'px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base',
              ].join(' ')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 10h4l2-3 4 10 2-4h4"
                />
              </svg>
              Health
            </button>
          </div>
        </div>

        {activeTab === 'activities' && (
          <div>
            {/* Activities List */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold gradient-text min-w-0">
                  Manage Activities{' '}
                  <span className="text-gray-500 font-semibold">
                    ({filteredActivities.length}/{activities.length})
                  </span>
                </h2>
                <button
                  onClick={handleNewActivity}
                  className={`${btn.primary} hidden sm:inline-flex px-5 py-3 text-sm sm:text-base font-extrabold`}
                  title="Add New Activity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Activity
                </button>
              </div>

              {/* Search / Filters */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-3 sm:p-4 border border-gray-100 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <select
                    value={activityCategory}
                    onChange={(e) => setActivityCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cherish-pink focus:outline-none bg-white text-sm sm:text-base"
                    title="Filter by category"
                  >
                    <option value="all">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={activitySort}
                    onChange={(e) => setActivitySort(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cherish-pink focus:outline-none bg-white text-sm sm:text-base"
                    title="Sort"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title (A → Z)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setActivityCategory('all')
                      setActivitySort('newest')
                      setOnlyWithPhotos(false)
                    }}
                    disabled={activityCategory === 'all' && activitySort === 'newest' && !onlyWithPhotos}
                    className={`${btn.soft} px-3 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    Reset
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                  <label className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={onlyWithPhotos}
                      onChange={(e) => setOnlyWithPhotos(e.target.checked)}
                      className="w-4 h-4 accent-purple-600"
                    />
                    Only with photos
                  </label>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Showing <span className="font-semibold text-gray-800">{filteredActivities.length}</span> of{' '}
                  <span className="font-semibold text-gray-800">{activities.length}</span>
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {filteredActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 flex justify-center sm:justify-start">
                      {(() => {
                        const cover = activity.cover_image_url ? String(activity.cover_image_url).trim() : ''
                        const images = (activity.images || []).filter((img) => img && String(img).trim() !== '')
                        const firstImage = images[0]
                        const displayThumb = cover || firstImage

                        if (displayThumb) {
                          return (
                            <div className="relative">
                              <img
                                src={displayThumb}
                                alt={activity.title}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                              {cover && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                                  Cover
                                </div>
                              )}
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
                      {(() => {
                        const cover = activity.cover_image_url ? String(activity.cover_image_url).trim() : ''
                        const images = (activity.images || []).filter((img) => img && String(img).trim() !== '')
                        const totalPhotos = images.length + (cover && !images.includes(cover) ? 1 : 0)
                        if (totalPhotos <= 0) return null
                        return (
                          <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                          📷 {totalPhotos} photo{totalPhotos > 1 ? 's' : ''}
                          </span>
                        )
                      })()}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col md:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(activity)}
                        className={`${btn.info} flex-1 sm:flex-none px-4 py-2.5 text-sm`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.462 3 21l2.538-5.25L16.862 3.487z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className={`${btn.danger} flex-1 sm:flex-none px-4 py-2.5 text-sm`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8m-9 0V5a2 2 0 012-2h6a2 2 0 012 2v2"
                          />
                        </svg>
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

                {activities.length > 0 && filteredActivities.length === 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-10 text-center">
                    <div className="text-5xl mb-3">🔎</div>
                    <p className="text-gray-700 font-semibold">No activities match your filters.</p>
                    <p className="text-gray-500 text-sm mt-1">Try resetting filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActivityCategory('all')
                        setActivitySort('newest')
                        setOnlyWithPhotos(false)
                      }}
                      className={`${btn.dark} mt-4 px-5 py-2.5 text-sm`}
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold gradient-text">Supabase Health</h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Vercel cron runs daily at 12:00 AM IST (18:30 UTC)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={runCronNow}
                  disabled={runningCron || healthLoading}
                  className={`${btn.dark} w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {runningCron ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Running…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Run cron
                    </>
                  )}
                </button>
              </div>

              {healthError && (
                <div className="mt-4 bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl text-sm sm:text-base">
                  {healthError}
                </div>
              )}

              {healthTableMissing && (
                <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 text-yellow-900 px-4 py-3 rounded-xl text-sm sm:text-base">
                  Health checks table not found. Create `health_checks` in Supabase (see `SUPABASE_HEALTH_SETUP.md`).
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Current Status</p>
                  {latestHealthCheck ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border',
                          latestHealthCheck.ok
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200',
                        ].join(' ')}
                      >
                        {latestHealthCheck.ok ? 'Healthy' : 'Degraded'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Last Check</p>
                  {latestHealthCheck?.checked_at ? (
                    <p className="text-gray-900 font-bold">
                      {new Date(latestHealthCheck.checked_at).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">—</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-yellow-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Latency</p>
                  <p className="text-gray-900 font-bold">
                    {typeof latestHealthCheck?.latency_ms === 'number' ? `${latestHealthCheck.latency_ms} ms` : '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold gradient-text">Recent Checks</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Latest 30 runs</p>
              </div>

              {healthChecks.length === 0 ? (
                <div className="p-6 sm:p-10 text-center">
                  <div className="text-5xl mb-3">🩺</div>
                  <p className="text-gray-700 font-semibold">No health checks logged yet.</p>
                  <p className="text-gray-500 text-sm mt-1">
                    After you create the table, the next cron run will appear here.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Mobile list (no horizontal scrolling) */}
                  <div className="sm:hidden divide-y divide-gray-100">
                    {healthChecks.map((row) => (
                      <div key={row.id ?? row.checked_at} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {row.checked_at ? new Date(row.checked_at).toLocaleString() : '—'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Latency:{' '}
                              <span className="font-semibold text-gray-900">
                                {typeof row.latency_ms === 'number' ? `${row.latency_ms} ms` : '—'}
                              </span>
                            </p>
                          </div>
                          <span
                            className={[
                              'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0',
                              row.ok ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200',
                            ].join(' ')}
                          >
                            {row.ok ? 'OK' : 'FAIL'}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <p className="text-gray-600 font-semibold">Primary</p>
                            <p className="text-gray-900 font-bold mt-0.5">{row.primary_status ?? '—'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <p className="text-gray-600 font-semibold">Fallback</p>
                            <p className="text-gray-900 font-bold mt-0.5">{row.fallback_status ?? '—'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop/tablet table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="text-left px-4 sm:px-6 py-3 font-semibold">Time</th>
                          <th className="text-left px-4 sm:px-6 py-3 font-semibold">Status</th>
                          <th className="text-left px-4 sm:px-6 py-3 font-semibold">Latency</th>
                          <th className="text-left px-4 sm:px-6 py-3 font-semibold">Primary</th>
                          <th className="text-left px-4 sm:px-6 py-3 font-semibold">Fallback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {healthChecks.map((row) => (
                          <tr key={row.id ?? row.checked_at} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                              {row.checked_at ? new Date(row.checked_at).toLocaleString() : '—'}
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                              <span
                                className={[
                                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border',
                                  row.ok
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-red-100 text-red-800 border-red-200',
                                ].join(' ')}
                              >
                                {row.ok ? 'OK' : 'FAIL'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                              {typeof row.latency_ms === 'number' ? `${row.latency_ms} ms` : '—'}
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700">
                              {row.primary_status ?? '—'}
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700">
                              {row.fallback_status ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile floating action (Add Activity) */}
        {activeTab === 'activities' && !showFormModal && (
          <button
            type="button"
            onClick={handleNewActivity}
            className="sm:hidden fixed bottom-6 right-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl font-extrabold z-40 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
            aria-label="Add new activity"
            title="Add New Activity"
          >
            +
          </button>
        )}

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
                      Cover Photo (Activity Card)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={coverUploading}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {coverUploading && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Uploading cover…</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      🖼️ This image is used on the activity card as the main thumbnail. Tip: you can also tap ⭐ on any photo below to set it as cover.
                    </p>

                    {formData.cover_image_url ? (
                      <div className="mt-3">
                        <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                          <img
                            src={formData.cover_image_url}
                            alt="Cover preview"
                            className="w-full h-32 sm:h-40 object-cover"
                            onError={(e) => {
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"300\"%3E%3Crect fill=\"%23f3f4f6\" width=\"600\" height=\"300\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"%239ca3af\" font-family=\"Arial\" font-size=\"16\"%3EImage not found%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                            Cover
                          </div>
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove cover"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {formData.images.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cover_image_url: formData.images[0] })}
                            className="mt-2 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900"
                          >
                            Use first uploaded photo as cover
                          </button>
                        )}
                      </div>
                    ) : (
                      formData.images.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, cover_image_url: formData.images[0] })}
                          className="mt-2 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900"
                        >
                          Use first uploaded photo as cover
                        </button>
                      )
                    )}
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
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, cover_image_url: image })}
                                className={[
                                  'absolute top-1 left-1 sm:top-2 sm:left-2 p-1.5 rounded-full backdrop-blur-sm transition-all',
                                  formData.cover_image_url === image
                                    ? 'bg-yellow-400/90 text-yellow-900'
                                    : 'bg-black/45 text-white opacity-85 sm:opacity-0 group-hover:opacity-100 hover:bg-black/60',
                                ].join(' ')}
                                title={formData.cover_image_url === image ? 'Cover photo' : 'Set as cover'}
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill={formData.cover_image_url === image ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.913c.969 0 1.371 1.24.588 1.81l-3.974 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.974-2.888a1 1 0 00-1.176 0l-3.974 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.101c-.783-.57-.38-1.81.588-1.81h4.913a1 1 0 00.95-.69l1.518-4.674z"
                                  />
                                </svg>
                              </button>
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
                      className={`${btn.primary} flex-1 py-2 sm:py-3 text-sm sm:text-base font-extrabold`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {editingId ? 'Update Activity' : 'Add Activity'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={`${btn.soft} px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {confirmState && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => {
              if (!confirmLoading) setConfirmState(null)
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                {confirmState.title || 'Confirm'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2">{confirmState.message}</p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end mt-5">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  disabled={confirmLoading}
                  className={`${btn.soft} px-4 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {confirmState.cancelText || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setConfirmLoading(true)
                    try {
                      await confirmState.onConfirm?.()
                    } finally {
                      setConfirmLoading(false)
                      setConfirmState(null)
                    }
                  }}
                  disabled={confirmLoading}
                  className={`${btn.danger} px-4 py-2.5 font-extrabold disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {confirmLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Working…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0h8m-9 0V5a2 2 0 012-2h6a2 2 0 012 2v2"
                        />
                      </svg>
                      {confirmState.confirmText || 'Confirm'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toasts */}
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[70] flex flex-col gap-2 sm:w-[380px]">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                'rounded-2xl border p-4 shadow-lg backdrop-blur-sm',
                t.type === 'success'
                  ? 'bg-green-50/95 border-green-200 text-green-900'
                  : t.type === 'error'
                    ? 'bg-red-50/95 border-red-200 text-red-900'
                    : 'bg-blue-50/95 border-blue-200 text-blue-900',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5 text-lg">
                  {t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'}
                </div>
                <div className="flex-1 min-w-0">
                  {t.title && <p className="font-extrabold leading-snug">{t.title}</p>}
                  {t.message && <p className="text-sm mt-0.5 leading-snug opacity-90">{t.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="text-current/70 hover:text-current p-1"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


