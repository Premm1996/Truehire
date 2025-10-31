import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AdminJobs() {
  const [adminData, setAdminData] = useState(null)
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

  const jobs = [
    { id: 1, title: 'Senior Software Engineer', company: 'Tech Corp', applicants: 45, status: 'Active', posted: '2 days ago' },
    { id: 2, title: 'Product Manager', company: 'Innovate Inc', applicants: 23, status: 'Active', posted: '1 week ago' },
    { id: 3, title: 'UX Designer', company: 'Startup Co', applicants: 67, status: 'Closed', posted: '2 weeks ago' }
  ]

  return (
    <>
      <Head>
        <title>Job Management - TrueHire</title>
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
                <p className="text-gray-600 mt-2">View, edit, and moderate all job postings on the platform</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin-dashboard')}
                  className="btn btn-outline px-6 py-2"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary px-6 py-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  💼
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                  <p className="text-gray-600 text-sm">Active Jobs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  📊
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">567</p>
                  <p className="text-gray-600 text-sm">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  ❌
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-gray-600 text-sm">Closed Jobs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Job Postings</h3>
              <button className="btn btn-primary">
                Create New Job
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.applicants}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.posted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className={`${
                          job.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}>
                          {job.status === 'Active' ? 'Close' : 'Reopen'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
