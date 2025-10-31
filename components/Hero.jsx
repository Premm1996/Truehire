import Link from 'next/link';

export default function Hero() {
  return (
    <section className="gradient-bg py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Powered by Truerize AI Matching
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Find Your Dream Job with <span className="text-gradient">TrueHire</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Connect with top companies and discover opportunities that match your skills, passion, and career goals. Your next big opportunity is just a search away.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">10,000+ Active Jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">500+ Companies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">AI-Powered Matching</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Top Companies Hiring</h2>
              <p className="text-gray-600">Join industry leaders and innovative companies that are shaping the future</p>
              <Link href="/companies">
                <button className="btn btn-secondary px-6 py-3 text-sm font-semibold bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md">
                  View All Companies
                </button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end relative -mt-32">
            <img
              src="/images/job1.png"
              alt="Jobs illustration"
              className="w-96 h-96 md:w-[500px] md:h-[500px] object-contain filter hue-rotate-180 saturate-150"
            />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 p-10 max-w-4xl w-full">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 tracking-wide">Job Title</label>
                    <input
                      className="input w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md bg-white text-sm"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 tracking-wide">Location</label>
                    <input
                      className="input w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md bg-white text-sm"
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 tracking-wide">Experience</label>
                    <select className="input w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md text-sm">
                      <option>Select Level</option>
                      <option>Entry Level</option>
                      <option>Junior (1-3 years)</option>
                      <option>Mid Level (3-5 years)</option>
                      <option>Senior (5+ years)</option>
                      <option>Executive</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 tracking-wide">&nbsp;</label>
                    <button className="btn btn-primary w-full px-1 py-1 text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5">
                      <svg className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
