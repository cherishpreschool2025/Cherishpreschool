import React from 'react'

function WorkGallery({ work }) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold gradient-text mb-6 text-center">
        Our School Work Showcase
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {work.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-xl p-6 card-hover shadow-lg overflow-hidden"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Colorful gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-cherish-pink via-cherish-yellow to-cherish-green opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 text-center">
              <div className="text-5xl mb-3 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                {item.image}
              </div>
              <h3 className="font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
                {item.title}
              </h3>
            </div>
            
            {/* Decorative corner */}
            <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-cherish-blue rounded-tr-lg opacity-50"></div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WorkGallery

