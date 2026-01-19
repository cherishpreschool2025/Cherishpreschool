import React from 'react'

function ActivityDetailModal({ activity, onClose }) {
  if (!activity) return null

  // Get all images for this activity - support both new format (images array) and old format (imageFile)
  const images = activity.images || (activity.imageFile ? [activity.imageFile] : [])
  const hasImages = images.length > 0

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${activity.color} text-white p-6 rounded-t-2xl sticky top-0 z-10`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{activity.title}</h2>
              <p className="text-white/90 text-lg">{activity.description}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {hasImages ? (
            <>
              <h3 className="text-2xl font-bold gradient-text mb-6 text-center">
                Photo Gallery ({images.length} {images.length === 1 ? 'Photo' : 'Photos'})
              </h3>
              
              {/* Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <img
                      src={image}
                      alt={`${activity.title} - Photo ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white font-semibold">
                        Photo {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{activity.image}</div>
              <p className="text-gray-600 text-lg">No photos uploaded yet for this activity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityDetailModal

