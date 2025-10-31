import Head from 'next/head'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import FeaturedJobs from '../components/FeaturedJobs'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import { jobs } from '../utils/jobs'

export default function Home() {
  return (
    <>
      <Head>
        <title>TrueHire — Find Your Dream Job with AI-Powered Matching</title>
        <meta name="description" content="Connect with top companies and discover job opportunities that match your skills and career goals. Join thousands of successful professionals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="jobs, career, employment, hiring, recruitment, AI matching" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Hero />
        <Stats />



        <section className="py-20 bg-gradient-to-r from-white via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Featured <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opportunities</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Discover handpicked opportunities from top companies that match your skills and career aspirations
              </p>
            </div>
            <FeaturedJobs jobs={jobs} />
            <div className="text-center mt-16">
              <button className="btn btn-primary px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6 mr-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                View All Jobs
              </button>
            </div>
          </div>
        </section>

        {/* Featured Companies */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Top <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Companies</span> Hiring
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Join industry leaders and innovative companies that are shaping the future
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {[
                { name: 'TechCorp', logo: '/images/tech crop.png' },
                { name: 'DataFlow', logo: '/images/data flow.png' },
                { name: 'CloudTech', logo: '/images/cloud tech.png' },
                { name: 'FinTech', logo: '/images/fin tech.png' },
                { name: 'GreenEnergy', logo: '/images/green energy.png' },
                { name: 'HealthTech', logo: '/images/health.png' }
              ].map((company, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                    <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-lg mx-auto mb-4 shadow-sm group-hover:shadow-lg transition-shadow duration-300" />
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{company.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <button className="btn btn-secondary px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                View All Companies
              </button>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-20 bg-gradient-to-r from-white via-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Quick <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Actions</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Get started with your career journey or find the perfect candidate
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-200">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Post a Job</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">Find qualified candidates quickly with our AI-powered platform</p>
                <button className="btn btn-primary px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300" onClick={() => window.location.href = '/post-job'}>Get Started</button>
              </div>

              <div className="text-center p-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-200">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Register</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">Create your profile and start your job search journey</p>
                <button className="btn btn-primary px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300" onClick={() => {
                  const authDropdown = document.querySelector('[data-auth-dropdown]');
                  if (authDropdown) {
                    authDropdown.click();
                  } else {
                    // Fallback: scroll to top and trigger dropdown
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      const dropdown = document.querySelector('.relative [class*="Login / Register"]');
                      if (dropdown) dropdown.click();
                    }, 500);
                  }
                }}>Sign Up</button>
              </div>

              <div className="text-center p-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-200">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Resources</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">Access tips, guides, and tools to advance your career</p>
                <button className="btn btn-primary px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300" onClick={() => window.location.href = '/career'}>Learn More</button>
              </div>
            </div>
          </div>
        </section>

        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
