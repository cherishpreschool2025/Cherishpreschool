import React, { useState, useEffect } from 'react'

function AboutSection() {
  const features = [
    { text: 'Expert Teachers', color: 'from-cherish-pink to-rose-400' },
    { text: 'Play-Based Learning', color: 'from-cherish-blue to-cyan-400' },
    { text: 'Safe Environment', color: 'from-cherish-green to-emerald-400' },
    { text: 'Individual Attention', color: 'from-cherish-purple to-indigo-400' },
    { text: 'Creative Learning', color: 'from-cherish-yellow to-amber-400' },
    { text: 'Happy Environment', color: 'from-cherish-orange to-red-400' },
    { text: 'Nurturing Care', color: 'from-pink-400 to-purple-400' }
  ]

  // Responsive radius: different for mobile and laptop
  const [radius, setRadius] = useState(100) // Default to mobile
  
  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth >= 768) {
        // Laptop/Desktop: larger radius
        setRadius(130)
      } else {
        // Mobile: smaller radius
        setRadius(100)
      }
    }
    
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  const centerX = 0
  const centerY = 0

  return (
    <section id="about" className="relative bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-8 md:gap-12 items-center">
          {/* Left Side - Text Content (70%) */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:text-left text-center">
              Welcome to Cherish Preschool
            </h2>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed md:text-left text-center mb-4">
              Our curriculum is designed to foster creativity, curiosity, and confidence in every child. Through hands-on activities, interactive learning, and personalized attention, we ensure that each child reaches their full potential. Our experienced educators create a warm and welcoming atmosphere where children feel safe to explore, learn, and grow.
            </p>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed md:text-left text-center">
              At Cherish Preschool, we understand that early childhood education is the foundation for lifelong learning. That's why we focus on developing not just academic skills, but also social, emotional, and physical development. Join us in nurturing the next generation of bright, confident, and compassionate individuals.
            </p>
          </div>

          {/* Right Side - Revolving Circular Badges */}
          <div className="relative flex items-center justify-center md:justify-end">
            <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] md:w-[400px] md:h-[400px] lg:w-[480px] lg:h-[480px] overflow-hidden">
              {/* Revolving container - stays in same place */}
              <div className="absolute inset-0 animate-revolve" style={{ transformOrigin: 'center center' }}>
                {features.map((feature, index) => {
                  // Calculate angle for each badge (7 badges = 360/7 degrees apart)
                  const angle = (index * (360 / 7) - 90) * (Math.PI / 180) // Start from top
                  const x = centerX + radius * Math.cos(angle)
                  const y = centerY + radius * Math.sin(angle)
                  
                  return (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className={`bg-gradient-to-br ${feature.color} rounded-full w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 flex items-center justify-center p-2 sm:p-3 md:p-4 hover:scale-110 transition-all duration-300 animate-counter-revolve`}>
                        <p className="text-white text-xs sm:text-sm md:text-base font-bold text-center leading-tight">
                          {feature.text}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
