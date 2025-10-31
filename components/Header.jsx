import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [jobsDropdown, setJobsDropdown] = useState(false)
  const [companiesDropdown, setCompaniesDropdown] = useState(false)
  const [businessDropdown, setBusinessDropdown] = useState(false)
  const [authDropdown, setAuthDropdown] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Placeholder: set to true to simulate logged-in state

  const jobsRef = useRef(null)
  const companiesRef = useRef(null)
  const businessRef = useRef(null)
  const authRef = useRef(null)
  const userRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobsRef.current && !jobsRef.current.contains(event.target)) {
        setJobsDropdown(false)
      }
      if (companiesRef.current && !companiesRef.current.contains(event.target)) {
        setCompaniesDropdown(false)
      }
      if (businessRef.current && !businessRef.current.contains(event.target)) {
        setBusinessDropdown(false)
      }
      if (authRef.current && !authRef.current.contains(event.target)) {
        setAuthDropdown(false)
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleHome = () => window.location.href = '/'
  const handleJobs = () => window.location.href = '/jobs'
  const handleJobsCategory = (category) => window.location.href = `/jobs?category=${category}`
  const handleJobsLocation = (location) => window.location.href = `/jobs?location=${location}`
  const handleRemoteJobs = () => window.location.href = '/jobs?type=remote'
  const handleSavedJobs = () => window.location.href = '/jobs?saved=true'
  const handleCompanies = () => window.location.href = '/companies'
  const handleTopCompanies = () => window.location.href = '/companies?top=true'
  const handlePostJob = () => window.location.href = '/post-job'
  const handleCareer = () => window.location.href = '/career'
  const handleAbout = () => window.location.href = '/about'
  const handleBusiness = () => window.location.href = '/business'
  const handleContact = () => window.location.href = '/contact'
  const handleLogin = () => window.location.href = '/login'
  const handleRegister = (type) => window.location.href = `/register?type=${type}`

  return (
    <header className="bg-gradient-to-r from-[#0E1628] to-[#1a1f2e] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl pl-0 pr-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div
              onClick={handleHome}
              className="cursor-pointer focus:outline-none flex items-center px-3 py-2 rounded-lg border border-transparent hover:border-[#1E73E8] hover:bg-[#1E73E8]/10 transition-all duration-200"
              role="button"
              tabIndex={0}
              aria-label="Go to Home Page"
            >
              <img src="/images/truerizelogon.png.jpg" alt="TrueHire Logo" className="h-10 w-auto mr-3" />
              <span className="font-bold text-xl text-white tracking-wide">TrueHire</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center" onClick={handleHome}>
              Home
            </button>

            {/* Jobs Dropdown */}
            <div className="relative" ref={jobsRef}>
              <button
                className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center"
                onClick={() => setJobsDropdown(!jobsDropdown)}
              >
                Jobs
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`absolute top-full left-0 mt-2 w-64 bg-[#1A2235] rounded-xl shadow-xl border border-gray-600 py-3 z-10 transition-all duration-200 ease-in-out transform ${
                  jobsDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-4 pb-2">
                  <button
                    onClick={handleJobs}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg border border-gray-600 hover:border-blue-400"
                  >
                    <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                    All Jobs
                  </button>
                </div>

                <div className="border-t border-gray-600 my-2"></div>

                <div className="px-4 pb-2">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Browse by Category</div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleJobsCategory('it')}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                      </svg>
                      IT & Technology
                    </button>
                    <button
                      onClick={() => handleJobsCategory('marketing')}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                      </svg>
                      Marketing
                    </button>
                    <button
                      onClick={() => handleJobsCategory('sales')}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      Sales
                    </button>
                    <button
                      onClick={() => handleJobsCategory('design')}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
                      </svg>
                      Design
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-600 my-2"></div>

                <div className="px-4">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Quick Access</div>
                  <div className="space-y-2">
                    <button
                      onClick={handleRemoteJobs}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-green-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Remote Jobs
                    </button>
                    <button
                      onClick={handleSavedJobs}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-yellow-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                      </svg>
                      Saved Jobs
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Companies Dropdown */}
            <div className="relative" ref={companiesRef}>
              <button
                className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center"
                onClick={() => setCompaniesDropdown(!companiesDropdown)}
              >
                Companies
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`absolute top-full left-0 mt-2 w-64 bg-[#1A2235] rounded-xl shadow-xl border border-gray-600 py-3 z-10 transition-all duration-200 ease-in-out transform ${
                  companiesDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-4 pb-2">
                  <button
                    onClick={handleCompanies}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg border border-gray-600 hover:border-blue-400"
                  >
                    <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    All Companies
                  </button>
                </div>

                <div className="border-t border-gray-600 my-2"></div>

                <div className="px-4">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Featured</div>
                  <div className="space-y-2">
                    <button
                      onClick={handleTopCompanies}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-green-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                      </svg>
                      Top Hiring Companies
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Dropdown */}
            <div className="relative" ref={businessRef}>
              <button
                className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center"
                onClick={() => setBusinessDropdown(!businessDropdown)}
              >
                Business
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`absolute top-full left-0 mt-2 w-64 bg-[#1A2235] rounded-xl shadow-xl border border-gray-600 py-3 z-10 transition-all duration-200 ease-in-out transform ${
                  businessDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="px-4 pb-2">
                  <button
                    onClick={handlePostJob}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg border border-gray-600 hover:border-blue-400"
                  >
                    <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                    Post a Job
                  </button>
                </div>

                <div className="border-t border-gray-600 my-2"></div>

                <div className="px-4">
                  <button
                    onClick={handleBusiness}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-green-400 transition-all duration-200 rounded-lg"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    Business Overview
                  </button>
                </div>
              </div>
            </div>

            <button className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center" onClick={handleCareer}>
              Career Resources
            </button>

            <button className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center" onClick={handleAbout}>
              About Us
            </button>

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="relative" ref={userRef}>
                <button
                  className="text-sm text-white font-bold hover:text-blue-400 transition-all duration-200 flex items-center px-3 py-2 rounded-lg"
                  onClick={() => setUserDropdown(!userDropdown)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Profile
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`absolute top-full right-0 mt-2 w-64 bg-[#1A2235] rounded-xl shadow-xl border border-gray-600 py-3 z-10 transition-all duration-200 ease-in-out transform ${
                    userDropdown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="px-4 pb-2">
                    <div className="text-sm font-semibold text-white mb-2">Welcome, User!</div>
                  </div>

                  <div className="border-t border-gray-600 my-2"></div>

                  <div className="px-4 space-y-2">
                    <button
                      onClick={() => window.location.href = '/profile'}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Create & Manage Profile
                    </button>
                    <button
                      onClick={() => window.location.href = '/account'}
                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#1A2235]/50 hover:text-blue-400 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Account Settings
                    </button>
                    <button
                      onClick={() => { setIsLoggedIn(false); window.location.href = '/'; }}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#1A2235]/50 hover:text-red-300 transition-all duration-200 rounded-lg"
                    >
                      <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center" onClick={handleLogin}>
                  Login
                </button>
                <button className="px-4 py-1 border border-[#1E73E8] text-[#1E73E8] bg-transparent hover:bg-white hover:text-[#1E73E8] font-semibold rounded-md transition-all duration-200 flex items-center justify-center" onClick={() => handleRegister('')}>
                  Register
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-[#1A2235] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-600 pt-4 pb-4">
            <nav className="flex flex-col space-y-2">
              <a href="/" className="px-3 py-2 text-white hover:bg-[#1A2235] rounded-lg transition-colors">Home</a>

              {/* Mobile Jobs */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-white font-medium">Jobs</div>
                <a href="/jobs" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-blue-400 transition-colors">All Jobs</a>
                <a href="/jobs?category=it" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-blue-400 transition-colors">IT & Technology</a>
                <a href="/jobs?category=marketing" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-blue-400 transition-colors">Marketing</a>
                <a href="/jobs?category=sales" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-blue-400 transition-colors">Sales</a>
                <a href="/jobs?category=design" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-blue-400 transition-colors">Design</a>
                <a href="/jobs?location=remote" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-green-400 transition-colors">Remote Jobs</a>
                <a href="/jobs?saved=true" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-yellow-400 transition-colors">Saved Jobs</a>
              </div>

              {/* Mobile Companies */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-white font-medium">Companies</div>
                <a href="/companies" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-blue-400 transition-colors">All Companies</a>
                <a href="/companies?top=true" className="block px-6 py-1 text-sm text-gray-300 hover:bg-[#1A2235] hover:text-green-400 transition-colors">Top Hiring Companies</a>
              </div>

              <a href="/post-job" className="px-3 py-2 text-white hover:bg-[#1A2235] hover:text-blue-400 rounded-lg transition-colors">Post a Job</a>
              <a href="/career" className="px-3 py-2 text-white hover:bg-[#1A2235] hover:text-blue-400 rounded-lg transition-colors">Career Resources</a>
              <a href="/about" className="px-3 py-2 text-white hover:bg-[#1A2235] hover:text-blue-400 rounded-lg transition-colors">About Us</a>
              <a href="/business" className="px-3 py-2 text-white hover:bg-[#1A2235] hover:text-blue-400 rounded-lg transition-colors">Business</a>
              <a href="/contact" className="px-3 py-2 text-white hover:bg-[#1A2235] hover:text-blue-400 rounded-lg transition-colors">Contact Us</a>

              <div className="border-t border-gray-600 pt-2 mt-4 space-y-1">
                <a href="/login" className="block px-3 py-2 text-white hover:bg-[#1A2235] hover:text-blue-400 rounded-lg transition-colors">Login</a>
                <a href="/register" className="block px-3 py-2 text-white hover:bg-[#1A2235] hover:text-blue-400 rounded-lg transition-colors">Register</a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
