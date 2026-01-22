import React, { useState } from 'react'
import ActivityDetailModal from './ActivityDetailModal'

function ActivityCard({ activity }) {
  const [showModal, setShowModal] = useState(false)
  
  // Map activity titles to cover images in public folder
  const getCoverImage = (title) => {
    const coverImageMap = {
      'Art & Craft Day': '/art.png',
      'Story Time': '/story-telling.png',
      'Sports Day': '/sports-time.png'
    }
    return coverImageMap[title] || null
  }
  
  // Priority: 1. Cover image from public folder, 2. Uploaded images, 3. Emoji
  const coverImage = getCoverImage(activity.title)
  const hasUploadedImage = activity.images && activity.images.length > 0 ? activity.images[0] : null
  
  const displayImage = coverImage || hasUploadedImage

  return (
    <>
      <div className={`bg-gradient-to-br ${activity.color} rounded-2xl p-6 shadow-xl hover:shadow-2xl text-white relative overflow-hidden transition-all duration-300 transform hover:scale-105`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          {/* Show cover image or uploaded image if available, otherwise show emoji */}
          {displayImage ? (
            <div className="mb-4 rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={() => setShowModal(true)}>
              <img 
                src={displayImage} 
                alt={activity.title}
                className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  // If image fails to load, show emoji fallback
                  e.target.style.display = 'none'
                  const parent = e.target.parentElement
                  if (parent && !parent.querySelector('.fallback-emoji')) {
                    const fallback = document.createElement('div')
                    fallback.className = 'fallback-emoji text-6xl text-center py-8'
                    fallback.textContent = activity.image || '📷'
                    parent.appendChild(fallback)
                  }
                }}
              />
              {hasUploadedImage && activity.images && activity.images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                  +{activity.images.length} photos
                </div>
              )}
            </div>
          ) : (
            <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-300 cursor-pointer text-center" onClick={() => setShowModal(true)}>
              {activity.image}
            </div>
          )}
          <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">{activity.title}</h3>
          <p className="text-white/90 mb-4 text-base line-clamp-2 leading-relaxed">{activity.description}</p>
          <div className="flex items-center justify-end">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-white text-gray-800 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
            >
              View More →
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ActivityDetailModal 
          activity={activity} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}

export default ActivityCard

