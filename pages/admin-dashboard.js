import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn')
    const data = localStorage.getItem('adminData')

    if (!isLoggedIn || !data) {
      router.push('/recruiter-login')
      return
    }

    setAdminData(JSON.parse(data))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminData')
    router.push('/business')
  }

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Mock data for demonstration
  const stats = [
    { label: 'Total Recruiters', value: 45, icon: '👥', color: 'bg-blue-500' },
    { label: 'Total Users', value: 1234, icon: '👤', color: 'bg-green-500' },
    { label: 'Active Jobs', value: 89, icon: '💼', color: 'bg-purple-500' },
    { label: 'Total Applications', value: 567, icon: '📊', color: 'bg-orange-500' }
  ]

  const recruiters = [
    { id: 1, name: 'John Smith', email: 'john@techcorp.com', company: 'Tech Corp', status: 'Active', joined: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@innovate.com', company: 'Innovate Inc', status: 'Active', joined: '2024-02-20' },
    { id: 3, name: 'Mike Chen', email: 'mike@startup.com', company: 'Startup Co', status: 'Suspended', joined: '2024-03-10' },
    { id: 4, name: 'Emma Davis', email: 'emma@global.com', company: 'Global Solutions', status: 'Active', joined: '2024-01-05' }
  ]

  const users = [
    { id: 1, name: 'Alex Wilson', email: 'alex.wilson@email.com', role: 'Job Seeker', status: 'Active', joined: '2024-03-15' },
    { id: 2, name: 'Lisa Brown', email: 'lisa.brown@email.com', role: 'Job Seeker', status: 'Active', joined: '2024-03-12' },
    { id: 3, name: 'David Lee', email: 'david.lee@email.com', role: 'Job Seeker', status: 'Inactive', joined: '2024-02-28' },
    { id: 4, name: 'Maria Garcia', email: 'maria.garcia@email.com', role: 'Job Seeker', status: 'Active', joined: '2024-03-08' }
  ]

  const recentJobs = [
    { id: 1, title: 'Senior Software Engineer', company: 'Tech Corp', applicants: 45, status: 'Active', posted: '2 days ago' },
    { id: 2, title: 'Product Manager', company: 'Innovate Inc', applicants: 23, status: 'Active', posted: '1 week ago' },
    { id: 3, title: 'UX Designer', company: 'Startup Co', applicants: 67, status: 'Closed', posted: '2 weeks ago' }
  ]

  return (
    <>
      <Head>
        <title>Admin Dashboard - TrueHire</title>
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
                    src="/images/truerizelogon.png.jpg"
                    alt="Admin Profile"
                    className="w-20 h-20 rounded-full cursor-pointer mr-6"
                    onClick={() => router.push('/admin-profile')}
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">Welcome back, Truerize Admin!</h1>
                    <p className="text-gray-600 mt-2 text-lg">Administrator • Full System Access</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => router.push('/settings')}
                    className="btn btn-outline px-8 py-3 text-lg"
                  >
                    System Settings
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
                  if (stat.label === 'Total Recruiters') router.push('/admin-recruiters')
                  else if (stat.label === 'Total Users') router.push('/admin-users')
                  else if (stat.label === 'Active Jobs') router.push('/admin-jobs')
                  else if (stat.label === 'Total Applications') router.push('/admin-applications')
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
                  onClick={() => setActiveTab('recruiters')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'recruiters'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manage Recruiters
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'jobs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Job Management
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
                        onClick={() => setActiveTab('recruiters')}
                        className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Add New Recruiter</h4>
                            <p className="text-sm text-gray-600">Register a new recruiter account</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('users')}
                        className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Manage Users</h4>
                            <p className="text-sm text-gray-600">View and manage user accounts</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">View Analytics</h4>
                            <p className="text-sm text-gray-600">Check platform statistics</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Jobs */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Job Postings</h3>
                      <div className="space-y-3">
                        {recentJobs.map((job) => (
                          <div key={job.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{job.title}</h4>
                                <p className="text-sm text-gray-600">{job.company} • {job.applicants} applicants • Posted {job.posted}</p>
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

                    {/* System Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Server Status</h4>
                              <p className="text-sm text-gray-600">All systems operational</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Database</h4>
                              <p className="text-sm text-gray-600">Connected and healthy</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Email Service</h4>
                              <p className="text-sm text-gray-600">Minor delays detected</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recruiters' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Manage Recruiters</h3>
                    <button className="btn btn-primary">
                      Add New Recruiter
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recruiters.map((recruiter) => (
                          <tr key={recruiter.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{recruiter.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{recruiter.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{recruiter.company}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                recruiter.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {recruiter.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {recruiter.joined}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className={`${
                                recruiter.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}>
                                {recruiter.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                    <button className="btn btn-primary">
                      Add New User
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.joined}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className={`${
                                user.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}>
                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Management</h3>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Job management features</h4>
                    <p className="text-gray-600 mb-4">View, edit, and moderate all job postings on the platform</p>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Advanced analytics dashboard</h4>
                    <p className="text-gray-600 mb-4">Detailed insights into platform usage, user behavior, and performance metrics</p>
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
