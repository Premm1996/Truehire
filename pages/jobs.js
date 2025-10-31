import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { jobs } from '../utils/jobs'

export default function Jobs() {
  return (
    <>
      <Head>
        <title>Jobs — TrueHire</title>
        <meta name="description" content="Browse thousands of job opportunities from top companies. Find your dream job with AI-powered matching." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="gradient-bg py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your <span className="text-gradient">Dream Job</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore thousands of opportunities from leading companies. Our AI-powered matching helps you find the perfect fit for your skills and career goals.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="e.g. Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select className="input w-full">
                      <option>All Locations</option>
                      <option>New York</option>
                      <option>San Francisco</option>
                      <option>London</option>
                      <option>Berlin</option>
                      <option>Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select className="input w-full">
                      <option>All Levels</option>
                      <option>Entry Level</option>
                      <option>Junior (1-3 years)</option>
                      <option>Mid Level (3-5 years)</option>
                      <option>Senior (5+ years)</option>
                      <option>Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                    <select className="input w-full">
                      <option>All Ranges</option>
                      <option>$30k - $50k</option>
                      <option>$50k - $80k</option>
                      <option>$80k - $120k</option>
                      <option>$120k - $200k</option>
                      <option>$200k+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Full-time</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Part-time</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Contract</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">Remote</span>
                      </label>
                    </div>
                  </div>

                  <button className="btn btn-primary w-full">Apply Filters</button>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="lg:w-3/4">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Latest Jobs</h2>
                <span className="text-sm text-gray-600">{jobs.length} jobs found</span>
              </div>

              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                            <p className="text-blue-600 font-medium mb-2">{job.company}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {job.type}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {job.location}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {job.salary}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-2">
                        <span className="text-sm text-gray-500">{job.posted}</span>
                        <button className="btn btn-primary">Apply Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-blue-600 text-white">1</button>
                  <button className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">2</button>
                  <button className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">3</button>
                  <button className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
