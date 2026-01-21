import React, { useState } from 'react'

function ProgramsSection() {
  const [expandedProgram, setExpandedProgram] = useState(null)
  const programs = [
    {
      name: 'Play Group',
      age: '2-3 years',
      gradient: 'from-pink-400 via-rose-400 to-pink-500',
      description: 'Play-based learning and exploration',
      benefits: ['Creative Play', 'Social Skills', 'Motor Development']
    },
    {
      name: 'Nursery',
      age: '3-4 years',
      gradient: 'from-blue-400 via-cyan-400 to-blue-500',
      description: 'Foundation building activities',
      benefits: ['Language Skills', 'Number Recognition', 'Art & Craft']
    },
    {
      name: 'LKG',
      subtitle: 'Lower Kindergarten',
      age: '4-5 years',
      gradient: 'from-green-400 via-emerald-400 to-green-500',
      description: 'Structured learning development',
      benefits: ['Reading Readiness', 'Math Concepts', 'Science Exploration']
    },
    {
      name: 'UKG',
      subtitle: 'Upper Kindergarten',
      age: '5-6 years',
      gradient: 'from-purple-400 via-indigo-400 to-purple-500',
      description: 'Primary school preparation',
      benefits: ['School Readiness', 'Critical Thinking', 'Confidence Building']
    }
  ]

  const services = [
    {
      name: 'Day Care',
      hours: '9:30 AM - 6:00 PM',
      emoji: '🏠',
      color: 'from-cherish-yellow to-amber-400',
      description: 'Extended care for working parents'
    },
    {
      name: 'Van Facility',
      emoji: '🚐',
      color: 'from-cherish-green to-emerald-400',
      description: 'Safe transportation available'
    }
  ]

  return (
    <section id="programs" className="pt-1 md:pt-6 pb-1 md:pb-6 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 drop-shadow-sm">
            Our Programs
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-6">
            Your child's learning journey from{' '}
            <span className="text-cherish-pink font-semibold">2 to 6 years</span>
          </p>
        </div>

        {/* Playful Book-Style Programs */}
        <div className="mb-16 max-w-7xl mx-auto px-4 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-10 lg:gap-20">
            {programs.map((program, index) => (
              <div key={index} className="relative w-full max-w-[280px] mx-auto md:max-w-none md:mx-0">
                {/* Flip Card Container - All Screen Sizes */}
                <div className={`flip-card-container ${expandedProgram === index ? 'flipped' : ''} min-h-[240px] md:min-h-[280px]`}>
                  <div className="flip-card-inner">
                    {/* Front: Book Cover */}
                    <div className="flip-card-front">
                      <button
                        onClick={() => setExpandedProgram(expandedProgram === index ? null : index)}
                        className="relative w-full"
                      >
                        {/* Book Binding (Left Edge) - Playful Rainbow Colors */}
                        <div className="absolute left-0 top-0 bottom-0 w-5 md:w-5 z-10 shadow-lg rounded" style={{
                          boxShadow: 'inset -3px 0 15px rgba(0,0,0,0.4), 3px 0 8px rgba(0,0,0,0.3)',
                          background: program.gradient.includes('pink') 
                            ? 'linear-gradient(to right, #ec4899, #f472b6,rgb(228, 131, 186))'
                            : program.gradient.includes('blue')
                            ? 'linear-gradient(to right, #3b82f6, #60a5fa,rgb(131, 176, 228))'
                            : program.gradient.includes('green')
                            ? 'linear-gradient(to right, #10b981, #34d399,rgb(110, 221, 177))'
                            : 'linear-gradient(to right, #a855f7, #c084fc,rgb(175, 138, 216))'
                        }}>
                          {/* Binding Decorative Lines */}
                          <div className="absolute inset-0 flex flex-col justify-center items-center gap-1 opacity-30">
                            <div className="w-full h-0.5 bg-white/30"></div>
                            <div className="w-full h-0.5 bg-white/30"></div>
                            <div className="w-full h-0.5 bg-white/30"></div>
                          </div>
                        </div>
                        
                        {/* Book Cover - Realistic Book Cover Design */}
                        <div className={`relative bg-gradient-to-br ${program.gradient} p-4 md:p-6 ml-5 md:ml-5 text-white shadow-2xl overflow-hidden transition-all duration-500 min-h-[220px] md:min-h-[280px] rounded-r-xl md:rounded-r-2xl`} style={{
                          boxShadow: '0 15px 35px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
                        }}>
                          {/* Book Cover Texture/Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                              backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                              radial-gradient(circle at 70% 70%, rgba(255,255,255,0.08) 1px, transparent 1px)`,
                              backgroundSize: '20px 20px, 15px 15px'
                            }}></div>
                          </div>
                          
                          {/* Book Cover Layout */}
                          <div className="relative z-10 flex flex-col h-full">
                            {/* Middle Section - Main Title Area */}
                            <div className="flex-1 flex flex-col justify-center items-center my-2 md:my-4">
                              {/* Age Range - Like Edition/Volume */}
                              <div className="mb-2 md:mb-3">
                                <span className="inline-block bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1 md:py-1.5 rounded-md text-sm md:text-xs font-bold text-white border border-white/30 shadow-md" style={{
                                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                  letterSpacing: '1px'
                                }}>
                                  {program.age}
                                </span>
                              </div>
                              
                              {/* Main Title - Book Title Style */}
                              <h3 className="text-3xl md:text-3xl lg:text-4xl font-extrabold mb-2 md:mb-3 text-center" style={{
                                textShadow: '0 3px 10px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.2)',
                                letterSpacing: '1px',
                                lineHeight: '1.2'
                              }}>
                                {program.name}
                              </h3>
                              
                              {/* Subtitle - Author/Description Style */}
                              {program.subtitle && (
                                <p className="text-lg md:text-base font-medium text-white/95 text-center mt-2" style={{
                                  textShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                  fontStyle: 'italic'
                                }}>
                                  {program.subtitle}
                                </p>
                              )}
                            </div>
                            
                            {/* Bottom Section - Interactive Element */}
                            <div className="mt-auto pb-2">
                              <div className="flex items-center justify-center gap-2 text-sm md:text-xs font-semibold">
                                <span style={{
                                  textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }}>
                                  Tap to open
                                </span>
                                <span className="text-lg animate-bounce" style={{
                                  filter: 'drop-shadow(0 1px 10px rgba(0,0,0,0.3))'
                                }}>
                                  ▼
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Back: Details Page */}
                    <div className="flip-card-back">
                      <button
                        onClick={() => setExpandedProgram(expandedProgram === index ? null : index)}
                        className="relative w-full h-full"
                      >
                        {/* Book Page */}
                        <div className="relative rounded-xl md:rounded-2xl p-2.5 md:p-4 shadow-2xl border-4 h-full overflow-hidden" style={{
                          boxShadow: '0 25px 70px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.1)',
                          background: 'linear-gradient(to right, #f0f9ff, #ffffff, #f0f9ff)',
                          borderColor: program.gradient.includes('pink') 
                            ? '#fbcfe8'
                            : program.gradient.includes('blue')
                            ? '#93c5fd'
                            : program.gradient.includes('green')
                            ? '#6ee7b7'
                            : '#d8b4fe'
                        }}>
                          {/* Page Lines (Notebook Style) */}
                          <div className="absolute left-4 right-4 top-0 bottom-0 opacity-8 notebook-lines"></div>
                          
                          {/* Content */}
                          <div className="relative z-10 h-full flex flex-col pt-2 md:pt-3">
                            {/* Description - Playful Style */}
                            <p className="text-slate-800 text-sm md:text-sm mb-2 md:mb-4 leading-tight handwritten" style={{
                              lineHeight: '1.3'
                            }}>
                              {program.description}
                            </p>
                            
                            <div className="space-y-1 md:space-y-2 flex-1 min-h-0">
                              {/* Section Header - Playful Underlined */}
                              <div className="relative mb-1 md:mb-2">
                                <p className="text-sm md:text-sm font-bold uppercase tracking-wider inline-block handwritten" style={{
                                  borderBottom: program.gradient.includes('pink') 
                                    ? '2px double #f472b6'
                                    : program.gradient.includes('blue')
                                    ? '2px double #60a5fa'
                                    : program.gradient.includes('green')
                                    ? '2px double #34d399'
                                    : '2px double #c084fc',
                                  paddingBottom: '3px',
                                  color: program.gradient.includes('pink') 
                                    ? '#be185d'
                                    : program.gradient.includes('blue')
                                    ? '#1e40af'
                                    : program.gradient.includes('green')
                                    ? '#047857'
                                    : '#7e22ce'
                                }}>
                                  What's Included:
                                </p>
                              </div>
                              
                              {/* Benefits - Simple List Style */}
                              {program.benefits.map((benefit, i) => {
                                const checkColor = program.gradient.includes('pink') 
                                  ? 'linear-gradient(to right, #ec4899, #f472b6)'
                                  : program.gradient.includes('blue')
                                  ? 'linear-gradient(to right, #3b82f6, #60a5fa)'
                                  : program.gradient.includes('green')
                                  ? 'linear-gradient(to right, #10b981, #34d399)'
                                  : 'linear-gradient(to right, #a855f7, #c084fc)'
                                
                                return (
                                  <div 
                                    key={i} 
                                    className="flex items-center gap-2 py-0.5 md:py-1"
                                    style={{ 
                                      animationDelay: `${i * 0.1}s`
                                    }}
                                  >
                                    {/* Checkmark Circle */}
                                    <div className="flex-shrink-0 w-5 h-5 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-lg checkmark-circle" style={{
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                                      animationDelay: `${i * 0.15}s`,
                                      background: checkColor
                                    }}>
                                      <span className="text-white text-xs md:text-xs font-bold">✓</span>
                                    </div>
                                    <span className="text-slate-700 text-sm md:text-sm font-semibold handwritten">{benefit}</span>
                                  </div>
                                )
                              })}
                            </div>
                            
                            {/* Bottom Section - Tap to Close */}
                            <div className="mt-auto pt-1 md:pt-2">
                              <div className="flex items-center justify-center gap-2 text-xs md:text-xs font-semibold text-slate-600">
                                <span>Tap to close</span>
                                <span className="text-base md:text-base">▲</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Services - Creative Hanging Tags Design */}
        <div className="mb-12 md:mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 md:mb-10 text-center">
            Additional Services
          </h3>
          <div className="max-w-5xl mx-auto px-4">
            {/* Container for horizontal line and hanging tags */}
            <div className="relative flex flex-col items-center">
              {/* Hanging String/Line */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-0.5 bg-gray-300 z-10"></div>
              
              {/* Hanging Tags in a Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-12 pt-8 md:pt-10 w-full">
                {services.map((service, index) => {
                  // Different animation speeds for variety
                  const animationClass = index === 0 
                    ? 'animate-hang-sway' 
                    : index === 1 
                    ? 'animate-hang-sway-reverse' 
                    : 'animate-hang-sway-slow'
                  
                  // Simple solid colors for icons
                  const iconBgColor = index === 0 ? 'bg-amber-100' : 'bg-emerald-100'
                  const iconBorderColor = index === 0 ? 'border-amber-300' : 'border-emerald-300'
                  
                  // Separate heights for each card
                  // Day Care (index 0): working properly
                  const mobileStringTop = index === 0 ? '-2rem' : '-2rem'
                  const mobileStringHeight = index === 0 ? '2.125rem' : '2.25rem'
                  const desktopStringTop = index === 0 ? '-2.5rem' : '-4rem'
                  const desktopStringHeight = index === 0 ? '2.525rem' : '2rem'
                  
                  return (
                    <div
                      key={index}
                      className={`group relative ${animationClass}`}
                      style={{
                        transformOrigin: 'top center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.animationPlayState = 'paused'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.animationPlayState = 'running'
                        e.currentTarget.style.transform = ''
                      }}
                    >
                      {/* Hanging String - extends from horizontal line to tag hole */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-400" style={{
                        top: mobileStringTop,
                        height: mobileStringHeight,
                        transformOrigin: 'top center',
                        zIndex: 1
                      }}></div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-400 hidden md:block" style={{
                        top: desktopStringTop,
                        height: desktopStringHeight,
                        transformOrigin: 'top center',
                        zIndex: 1
                      }}></div>
                    
                    {/* Tag Card */}
                    <div className="relative bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 min-w-[220px] md:min-w-[260px]">
                      {/* Tag Hole with String Attachment */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-7 h-7 bg-white rounded-full border-2 border-gray-300 shadow-sm flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5 md:p-6 pt-7">
                        {/* Icon */}
                        <div className="flex items-center justify-center mb-4">
                          <div 
                            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-4xl md:text-5xl ${iconBgColor} border-2 ${iconBorderColor} shadow-md transform transition-transform duration-300 group-hover:scale-110`}
                          >
                            {service.emoji}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center">{service.name}</h3>
                        
                        {/* Description */}
                        <p className="text-sm md:text-base text-gray-600 text-center mb-4 leading-relaxed">{service.description}</p>
                        
                        {/* Hours Badge */}
                        {service.hours && (
                          <div className="flex justify-center mt-5">
                            <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm md:text-base font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {service.hours}
                            </span>
                          </div>
                        )}
                      </div>
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

export default ProgramsSection
