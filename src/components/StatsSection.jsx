import React from 'react'

function StatsSection() {
  const stats = [
    { label: 'Active Students', value: '150+', icon: '👶', color: 'from-cherish-pink to-rose-400' },
    { label: 'Activities This Month', value: '25+', icon: '🎯', color: 'from-cherish-blue to-cyan-400' },
    { label: 'Happy Parents', value: '200+', icon: '😊', color: 'from-cherish-green to-emerald-400' },
    { label: 'Age Group', value: '2-6 Years', icon: '🎓', color: 'from-cherish-yellow to-amber-400' }
  ]

  return (
    <section className="mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-xl card-hover text-center`}
          >
            <div className="text-4xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-semibold text-white/90">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StatsSection

