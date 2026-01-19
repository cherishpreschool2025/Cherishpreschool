import React from 'react'

function ProgramsSection() {
  const programs = [
    {
      name: 'Play Group',
      age: '2-3 years',
      emoji: '🎨',
      color: 'from-cherish-pink to-rose-400',
      gradient: 'from-pink-400 via-rose-400 to-pink-500',
      description: 'Play-based learning and exploration',
      benefits: ['Creative Play', 'Social Skills', 'Motor Development'],
      icon: '🎨'
    },
    {
      name: 'Nursery',
      age: '3-4 years',
      emoji: '📚',
      color: 'from-cherish-blue to-cyan-400',
      gradient: 'from-blue-400 via-cyan-400 to-blue-500',
      description: 'Foundation building activities',
      benefits: ['Language Skills', 'Number Recognition', 'Art & Craft'],
      icon: '📚'
    },
    {
      name: 'LKG',
      subtitle: 'Lower Kindergarten',
      age: '4-5 years',
      emoji: '✏️',
      color: 'from-cherish-green to-emerald-400',
      gradient: 'from-green-400 via-emerald-400 to-green-500',
      description: 'Structured learning development',
      benefits: ['Reading Readiness', 'Math Concepts', 'Science Exploration'],
      icon: '✏️'
    },
    {
      name: 'UKG',
      subtitle: 'Upper Kindergarten',
      age: '5-6 years',
      emoji: '🎓',
      color: 'from-cherish-purple to-indigo-400',
      gradient: 'from-purple-400 via-indigo-400 to-purple-500',
      description: 'Primary school preparation',
      benefits: ['School Readiness', 'Critical Thinking', 'Confidence Building'],
      icon: '🎓'
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
    <section className="pt-1 md:pt-6 pb-1 md:pb-6 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Programs
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Nurturing young minds with age-appropriate learning for children{' '}
            <span className="text-cherish-pink font-semibold">2-6 years</span>
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {programs.map((program, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-visible border border-gray-100"
            >
              {/* Age Badge - Above the card */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                  {program.age}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 md:p-8 pt-6">
                {/* Icon */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${program.gradient} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <span className="text-4xl md:text-5xl">{program.icon}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
                  {program.name}
                </h3>
                {program.subtitle && (
                  <p className="text-sm text-gray-500 text-center mb-4">{program.subtitle}</p>
                )}
                
                {/* Description */}
                <p className="text-gray-600 text-sm md:text-base text-center mb-6 leading-relaxed">
                  {program.description}
                </p>

                {/* Benefits */}
                <div className="space-y-3">
                  {program.benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${program.gradient} flex-shrink-0`}></div>
                      <span className="text-gray-700 text-sm md:text-base font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 border-2 border-transparent group-hover:border-${program.color.split(' ')[1]} rounded-2xl transition-all duration-300 pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Additional Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${service.color} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
              >
                <div className="text-6xl mb-4 text-center">{service.emoji}</div>
                <h3 className="text-2xl font-bold mb-2 text-center">{service.name}</h3>
                {service.hours && (
                  <p className="text-white/95 text-center mb-3 font-semibold text-lg">{service.hours}</p>
                )}
                <p className="text-white/90 text-center text-base">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProgramsSection
