import React from 'react'

function FooterDecoration({ onAdminClick }) {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500">
      {/* Water waves - Wavy shape */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 md:h-32" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path
            d="M0,100 Q200,60 400,100 T800,100 T1200,100 L1200,200 L0,200 Z"
            fill="url(#waveGradient1)"
            className="animate-wave"
          >
            <animate
              attributeName="d"
              values="M0,100 Q200,60 400,100 T800,100 T1200,100 L1200,200 L0,200 Z;M0,100 Q200,140 400,100 T800,100 T1200,100 L1200,200 L0,200 Z;M0,100 Q200,60 400,100 T800,100 T1200,100 L1200,200 L0,200 Z"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,120 Q300,80 600,120 T1200,120 L1200,200 L0,200 Z"
            fill="url(#waveGradient2)"
            className="animate-wave-delayed"
            opacity="0.7"
          >
            <animate
              attributeName="d"
              values="M0,120 Q300,80 600,120 T1200,120 L1200,200 L0,200 Z;M0,120 Q300,160 600,120 T1200,120 L1200,200 L0,200 Z;M0,120 Q300,80 600,120 T1200,120 L1200,200 L0,200 Z"
              dur="5s"
              repeatCount="indefinite"
            />
          </path>
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Content - On top of water */}
      <div className="relative z-20 py-4 sm:py-5 md:py-6">
        <div className="container mx-auto px-3 sm:px-4 text-center text-white">
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-0.5 sm:mb-1 drop-shadow-lg leading-tight">Cherish Pre-School</h3>
          <p className="text-white/95 italic text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1 drop-shadow-md leading-tight">For brilliant brains</p>
          <p className="text-white/90 text-[10px] sm:text-xs md:text-sm drop-shadow-md mb-2 sm:mb-3 leading-tight">Lakshmi Education Trust (R.)</p>
          
          <p className="text-white/90 text-[10px] sm:text-xs mb-1.5 sm:mb-2 drop-shadow-md leading-tight">© 2025 Cherish Pre-School. All rights reserved.</p>
          
          {/* Very subtle admin access */}
          <div className="mt-0.5 sm:mt-1">
            <button
              onClick={onAdminClick}
              className="text-white/20 hover:text-white/50 text-[8px] sm:text-xs transition-all duration-300 font-light"
              style={{ letterSpacing: '1px' }}
              title="Admin Login"
            >
              ADMIN
            </button>
          </div>
        </div>
      </div>

      {/* Ducks/Swans floating in water - Positioned in the water area, below footer text */}
      <div className="absolute bottom-4 md:bottom-6 left-[12%] animate-bounce-slow z-10">
        <div className="text-xl md:text-2xl drop-shadow-lg">🦆</div>
      </div>

      <div className="absolute bottom-5 md:bottom-7 left-[28%] animate-bounce-slow-delayed z-10">
        <div className="text-lg md:text-xl drop-shadow-lg">🦆</div>
      </div>

      <div className="absolute bottom-4 md:bottom-6 left-[45%] animate-bounce-slow z-10" style={{ animationDelay: '0.4s' }}>
        <div className="text-xl md:text-2xl drop-shadow-lg">🦢</div>
      </div>

      <div className="absolute bottom-6 md:bottom-8 right-[28%] animate-bounce-slow-delayed z-10" style={{ animationDelay: '0.6s' }}>
        <div className="text-lg md:text-xl drop-shadow-lg">🦆</div>
      </div>

      <div className="absolute bottom-5 md:bottom-7 right-[12%] animate-bounce-slow z-10" style={{ animationDelay: '0.8s' }}>
        <div className="text-xl md:text-2xl drop-shadow-lg">🦢</div>
      </div>
    </div>
  )
}

export default FooterDecoration
