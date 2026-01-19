import React from 'react'

// School contact information - moved outside component to prevent recreation on each render
const contactInfo = {
  phone: '9844162528',
  email: 'cherishpreschool2025@gmail.com',
  address: "Cherish School, 1st Parallel Road, Stage 1, Vinobanagar, Shivamogga, Karnataka. 9 m from Param Embroidery, Pin-577204 (India)",
  instagram: 'https://www.instagram.com/cherish_pre_school?igsh=dW84OHQzbnk4M2dz',
  googleMapsUrl: 'https://maps.app.goo.gl/4Pwveu6a1HZXYGX59'
}

// Pre-computed phone number for tel: link
const phoneTelLink = `tel:${contactInfo.phone.replace(/\s/g, '')}`

// Google Maps embed URL (just the src, not the full iframe tag)
const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3872.1459062405966!2d75.56244439999999!3d13.949916700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTPCsDU2JzU5LjciTiA3NcKwMzMnNDQuOCJF!5e0!3m2!1sen!2sin!4v1768823314052!5m2!1sen!2sin'

// Coordinates extracted from embed URL (latitude, longitude)
const schoolCoordinates = '13.949916700000003,75.56244439999999'

// Google Maps directions URL (using coordinates for better accuracy)
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${schoolCoordinates}`

function ContactSection() {

  return (
    <section id="contact" className="pt-1 md:pt-4 pb-6 md:pb-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-3 sm:px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 md:mb-2 text-center">
          Contact Us
        </h2>
        <p className="text-gray-600 text-center mb-3 sm:mb-4 md:mb-4 text-sm sm:text-base md:text-lg px-2">
          Get in touch with us - We'd love to hear from you!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-4 lg:gap-5 items-stretch">
          {/* Contact Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl pt-3 pb-0 px-3 sm:pt-4 sm:pb-0 sm:px-4 md:pt-4 md:pb-0 md:px-4 h-fit w-full">
            <div className="space-y-2.5 sm:space-y-3 md:space-y-3">
              {/* Phone */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="bg-gradient-to-br from-cherish-blue to-cyan-400 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Phone</h4>
                  <a 
                    href={phoneTelLink}
                    className="text-cherish-blue hover:text-cherish-purple transition-colors text-base sm:text-lg break-all"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="bg-gradient-to-br from-cherish-pink to-rose-400 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Email</h4>
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-cherish-blue hover:text-cherish-purple transition-colors text-sm sm:text-base md:text-lg break-all"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="bg-gradient-to-br from-cherish-green to-emerald-400 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Address</h4>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-snug">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Directions & Social Media - Same Line */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 pb-0 border-t-2 border-gray-100">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes moveCar {
                  0% { transform: translateX(0); }
                  50% { transform: translateX(calc(100% - 2.5rem)); }
                  100% { transform: translateX(0); }
                }
                .moving-car {
                  animation: moveCar 3s ease-in-out infinite;
                  display: inline-block;
                }
              `}} />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
                {/* Directions Button - Mobile Only */}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center justify-center gap-3 bg-transparent text-black px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base flex-1 sm:flex-none overflow-hidden md:hidden"
                >
                  <span className="moving-car text-xl sm:text-2xl">🚗</span>
                  <span className="font-extrabold whitespace-nowrap">Get Directions</span>
                </a>

                {/* Social Media */}
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 mb-3 sm:mb-4 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base sm:ml-auto"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="whitespace-nowrap">Follow on Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Map - Hidden on mobile, visible on md and above */}
          <div className="hidden md:block bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden h-full w-full">
            <div className="h-full">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cherish Pre School Location"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection

