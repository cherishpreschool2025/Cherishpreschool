import React, { useState } from 'react'

function Header({ isAdmin, onAdminClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleAdminClick = (e) => {
    e.preventDefault()
    if (onAdminClick) {
      onAdminClick()
    } else {
      window.location.hash = '#admin'
      window.location.reload()
    }
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 80
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      // Close mobile menu after clicking
      setIsMobileMenuOpen(false)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 text-white shadow-lg" style={{ background: 'linear-gradient(to right,rgb(121, 69, 163) 0%,rgb(127, 97, 197) 50%,rgb(71, 127, 192) 100%)' }}>
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo and School Name */}
            <div className="flex items-center gap-2 md:gap-3">
              <img 
                src="/logo.png" 
                alt="Cherish Pre-School Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain drop-shadow-lg"
              />
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight">
                  Cherish Pre-School
                </h1>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-white/90 italic leading-tight -mt-0.5">
                  For brilliant brains
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => scrollToSection('about')}
                className="px-4 py-2 text-sm md:text-base font-semibold bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('programs')}
                className="px-4 py-2 text-sm md:text-base font-semibold bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
              >
                Programs
              </button>
              <button
                onClick={() => scrollToSection('activities')}
                className="px-4 py-2 text-sm md:text-base font-semibold bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
              >
                Activities
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-4 py-2 text-sm md:text-base font-semibold bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
              >
                Contact Us
              </button>
              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-1.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-1 text-sm"
                >
                  <span>🔐</span>
                  <span>Admin</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-300"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer - Slides from below header */}
      <div
        className={`fixed top-16 sm:top-20 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Menu Items */}
        <nav className="p-6 pt-4 space-y-1">
          <button
            onClick={() => scrollToSection('about')}
            className="w-full text-left py-3 text-gray-800 text-base font-medium hover:text-cherish-pink transition-colors duration-200 border-b border-gray-100"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('programs')}
            className="w-full text-left py-3 text-gray-800 text-base font-medium hover:text-cherish-pink transition-colors duration-200 border-b border-gray-100"
          >
            Programs
          </button>
          <button
            onClick={() => scrollToSection('activities')}
            className="w-full text-left py-3 text-gray-800 text-base font-medium hover:text-cherish-pink transition-colors duration-200 border-b border-gray-100"
          >
            Activities
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="w-full text-left py-3 text-gray-800 text-base font-medium hover:text-cherish-pink transition-colors duration-200 border-b border-gray-100"
          >
            Contact Us
          </button>
          {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="w-full text-left py-3 text-gray-800 text-base font-medium hover:text-cherish-pink transition-colors duration-200 border-b border-gray-100 flex items-center gap-2"
            >
              <span>🔐</span>
              <span>Admin</span>
            </button>
          )}
        </nav>
      </div>
    </>
  )
}

export default Header

