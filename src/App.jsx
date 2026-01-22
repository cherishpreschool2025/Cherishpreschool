import React, { useState, useEffect } from 'react'
import ActivityCard from './components/ActivityCard'
import Header from './components/Header'
import ProgramsSection from './components/ProgramsSection'
import AboutSection from './components/AboutSection'
import ContactSection from './components/ContactSection'
import FloatingEnquiryButton from './components/FloatingEnquiryButton'
import FooterDecoration from './components/FooterDecoration'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import { fetchActivitiesFromSupabase } from './utils/activities'

function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [activities, setActivities] = useState([])

  // Default activities
  const defaultActivities = [
    {
      id: 1,
      title: 'Art & Craft Day',
      description: 'Children created beautiful paintings and handmade crafts',
      image: '🎨',
      category: 'art',
      date: '2025-01-15',
      color: 'from-cherish-pink to-rose-400'
    },
    {
      id: 2,
      title: 'Story Time',
      description: 'Interactive storytelling session with puppets',
      image: '📚',
      category: 'reading',
      date: '2025-01-22',
      color: 'from-cherish-blue to-cyan-400'
    },
    {
      id: 3,
      title: 'Sports Day',
      description: 'Mini Olympics with fun games and races',
      image: '⚽',
      category: 'sports',
      date: '2025-01-25',
      color: 'from-cherish-orange to-red-400'
    }
  ]

  // Load activities: Always show defaults, merge with Supabase data if available
  useEffect(() => {
    const loadActivities = async () => {
      // Start with default activities
      let mergedActivities = [...defaultActivities]
      
      try {
        const supabaseActivities = await fetchActivitiesFromSupabase()
        
        if (supabaseActivities && supabaseActivities.length > 0) {
          // Clean up Supabase activities: remove empty/invalid image URLs
          const cleanedSupabase = supabaseActivities.map(activity => ({
            ...activity,
            images: (activity.images || []).filter(img => img && img.trim() !== '')
          }))
          
          // Merge Supabase activities with defaults
          // If a Supabase activity has the same ID as a default, update the default with Supabase data
          // Otherwise, add the Supabase activity
          cleanedSupabase.forEach(supabaseActivity => {
            const defaultIndex = mergedActivities.findIndex(a => a.id === supabaseActivity.id)
            if (defaultIndex !== -1) {
              // Update existing default activity with Supabase data (including images)
              mergedActivities[defaultIndex] = {
                ...mergedActivities[defaultIndex],
                ...supabaseActivity,
                // Keep default title/description if Supabase doesn't have them
                title: supabaseActivity.title || mergedActivities[defaultIndex].title,
                description: supabaseActivity.description || mergedActivities[defaultIndex].description
              }
            } else {
              // Add new activity from Supabase
              mergedActivities.push(supabaseActivity)
            }
          })
        }
      } catch (error) {
        console.error('Error loading activities from Supabase:', error)
        // Continue with defaults even if Supabase fails
      }
      
      setActivities(mergedActivities)
    }

    loadActivities()

    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    setIsAdmin(adminLoggedIn)
  }, [])

  // Activities are now only stored in Supabase, no localStorage needed

  // Keyboard shortcut for admin access (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+A for Windows/Linux
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        if (!isAdmin) {
          handleAdminClick()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin])

  const handleLogin = (loggedIn) => {
    setIsAdmin(loggedIn)
    setShowAdminLogin(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    setIsAdmin(false)
    setShowAdminLogin(false)
  }

  const handleAdminClick = () => {
    if (isAdmin) {
      // Already logged in, show dashboard
      return
    }
    setShowAdminLogin(true)
  }

  const handleUpdateActivities = (updatedActivities) => {
    setActivities(updatedActivities)
  }


  // Show admin login if requested
  if (showAdminLogin && !isAdmin) {
    return <AdminLogin onLogin={handleLogin} onBack={() => setShowAdminLogin(false)} />
  }

  // Show admin dashboard if logged in
  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} activities={activities} onUpdateActivities={handleUpdateActivities} />
  }

  // Show public dashboard
  return (
    <div className="min-h-screen">
      <Header isAdmin={false} onAdminClick={handleAdminClick} />
      
      {/* Floating Enquiry Button */}
      <FloatingEnquiryButton />
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-16 sm:pt-18 md:pt-20">
        {/* About Section */}
        <AboutSection />
        
        {/* Programs Section */}
        <ProgramsSection />
        
        <div id="activities" className="bg-gradient-to-br from-gray-50 to-blue-50 pt-1 md:pt-6 pb-1 md:pb-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Activities Section */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
                Activities
              </h2>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <ContactSection />
      </div>

      {/* Footer with Water Scene */}
      <FooterDecoration onAdminClick={handleAdminClick} />
    </div>
  )
}

export default App

