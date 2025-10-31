import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function RecruiterDashboard() {
  const [recruiterData, setRecruiterData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    // Check if recruiter is logged in
    const isLoggedIn = localStorage.getItem('recruiterLoggedIn')
    const data = localStorage.getItem('recruiterData')

    if (!isLoggedIn || !data) {
      router.push('/recruiter-login')
      return
    }

    setRecruiterData(JSON.parse(data))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('recruiterLoggedIn')
    localStorage.removeItem('recruiterData')
    localStorage.removeItem('recruiterOtpVerified')
    router.push('/business')
  }

  if (!recruiterData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = [
    { label: 'Active Jobs', value: recruiterData.activeJobs || 0, icon: '📋', color: 'bg-blue-500' },
    { label: 'Total Applications', value: recruiterData.applicationsReceived || 0, icon: '👥', color: 'bg-green-500' },
    { label: 'Jobs Posted', value: recruiterData.jobsPosted || 0, icon: '💼', color: 'bg-purple-500' },
    { label: 'Profile Complete', value: `${recruiterData.profileComplete || 0}%`, icon: '📊', color: 'bg-orange-500' }
  ]

  const recentJobs = [
    { id: 1, title: 'Senior Software Engineer', applicants: 45, status: 'Active', posted: '2 days ago' },
    { id: 2, title: 'Product Manager', applicants: 23, status: 'Active', posted: '1 week ago' },
    { id: 3, title: 'UX Designer', applicants: 67, status: 'Closed', posted: '2 weeks ago' }
  ]

  const recentApplications = [
    { id: 1, candidate: 'John Smith', job: 'Senior Software Engineer', status: 'Under Review', applied: '1 day ago' },
    { id: 2, candidate: 'Sarah Johnson', job: 'Product Manager', status: 'Interview Scheduled', applied: '3 days ago' },
    { id: 3, candidate: 'Mike Chen', job: 'UX Designer', status: 'Shortlisted', applied: '1 week ago' }
  ]

  return (
    <>
      <Head>
        <title>Recruiter Dashboard - TrueHire</title>
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="relative bg-white rounded-lg shadow-sm p-12 mb-8 overflow-hidden min-h-[200px]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: 'url(/images/truerizelogon.png.jpg)' }}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/images/ahamed.jpg"
                    alt="Profile"
                    className="w-20 h-20 rounded-full cursor-pointer mr-6"
                    onClick={() => router.push('/company-profile')}
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">Welcome back, mudassir!</h1>
                    <p className="text-gray-600 mt-2 text-lg">{recruiterData.company} • {recruiterData.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => router.push('/company-profile')}
                    className="btn btn-outline px-8 py-3 text-lg"
                  >
                    Company Profile
                  </button>
                  <button
                    onClick={() => window.location.href = '/post-job'}
                    className="btn btn-primary px-8 py-3 text-lg"
                  >
                    Post New Job
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary px-8 py-3 text-lg"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (stat.label === 'Active Jobs') {
                    router.push('/active-jobs');
                  } else if (stat.label === 'Total Applications') {
                    router.push('/total-applications');
                  } else if (stat.label === 'Jobs Posted') {
                    router.push('/jobs-posted');
                  } else if (stat.label === 'Profile Complete') {
                    router.push('/profile-complete');
                  }
                }}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'jobs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Jobs
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'applications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Applications
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => window.location.href = '/post-job'}
                        className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Post New Job</h4>
                            <p className="text-sm text-gray-600">Create and publish a job opening</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('jobs')}
                        className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Manage Jobs</h4>
                            <p className="text-sm text-gray-600">View and edit your job postings</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('applications')}
                        className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Review Applications</h4>
                            <p className="text-sm text-gray-600">Check candidate applications</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Jobs */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
                      <div className="space-y-3">
                        {recentJobs.map((job) => (
                          <div key={job.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{job.title}</h4>
                                <p className="text-sm text-gray-600">{job.applicants} applicants • Posted {job.posted}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Applications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
                      <div className="space-y-3">
                        {recentApplications.map((app) => (
                          <div key={app.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{app.candidate}</h4>
                                <p className="text-sm text-gray-600">{app.job} • Applied {app.applied}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                app.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">My Job Postings</h3>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h4>
                    <p className="text-gray-600 mb-4">Start by posting your first job opening</p>
                    <button
                      onClick={() => window.location.href = '/post-job'}
                      className="btn btn-primary"
                    >
                      Post Your First Job
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'applications' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications</h3>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h4>
                    <p className="text-gray-600 mb-4">Applications will appear here once candidates apply to your jobs</p>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics coming soon</h4>
                    <p className="text-gray-600 mb-4">Detailed analytics and insights will be available here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
