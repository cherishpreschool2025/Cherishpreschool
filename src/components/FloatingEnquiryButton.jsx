import React from 'react'

function FloatingEnquiryButton() {
  const phoneNumber = '9844162528'

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-40">
      <a
        href={`tel:${phoneNumber}`}
        className="group flex items-center gap-1.5 sm:gap-2 md:gap-3 bg-gradient-to-r from-cherish-pink via-cherish-purple to-cherish-blue text-white px-3 py-2 sm:px-3.5 sm:py-2.5 md:px-5 md:py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none"
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5 sm:p-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <span className="font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">Enquire Now</span>
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-0.5 sm:p-1 hidden sm:block">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    </div>
  )
}

export default FloatingEnquiryButton

