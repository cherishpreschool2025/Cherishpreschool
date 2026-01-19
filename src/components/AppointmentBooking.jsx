import React, { useState } from 'react'

function AppointmentBooking({ onBookingSuccess }) {
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    email: '',
    phone: '',
    childAge: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    // Get existing appointments
    const existingAppointments = JSON.parse(localStorage.getItem('cherishAppointments') || '[]')
    
    // Create new appointment
    const newAppointment = {
      id: Date.now(),
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    }

    // Add to appointments
    const updatedAppointments = [...existingAppointments, newAppointment]
    localStorage.setItem('cherishAppointments', JSON.stringify(updatedAppointments))

    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      
      // Reset form
      setFormData({
        parentName: '',
        childName: '',
        email: '',
        phone: '',
        childAge: '',
        preferredDate: '',
        preferredTime: '',
        message: ''
      })

      // Call success callback if provided
      if (onBookingSuccess) {
        onBookingSuccess(newAppointment)
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000)
    }, 1000)
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📅</div>
        <h3 className="text-3xl font-bold gradient-text mb-2">Book an Appointment</h3>
        <p className="text-gray-600">Schedule a visit to our school for admission</p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-6 bg-green-100 border-2 border-green-400 text-green-700 px-6 py-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold">Appointment Request Submitted!</p>
              <p className="text-sm">We'll contact you soon to confirm your appointment.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Parent Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Parent/Guardian Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Child Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Child's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              placeholder="Enter child's name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Child Age */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Child's Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="childAge"
              value={formData.childAge}
              onChange={handleChange}
              min="2"
              max="6"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              placeholder="Age (2-6 years)"
              required
            />
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={today}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Preferred Time */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Preferred Time <span className="text-red-500">*</span>
          </label>
          <select
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
            required
          >
            <option value="">Select a time</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Additional Message (Optional)
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cherish-pink focus:outline-none transition-colors"
            placeholder="Any special requests or questions..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-cherish-pink to-cherish-purple text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            '📅 Book Appointment'
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          We'll contact you within 24 hours to confirm your appointment.
        </p>
      </form>
    </div>
  )
}

export default AppointmentBooking

