import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AdminApplications() {
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

  const applications = [
    { id: 1, jobTitle: 'Senior Software Engineer', applicant: 'Alex Wilson', company: 'Tech Corp', status: 'Under Review', applied: '2024-03-15' },
    { id: 2, jobTitle: 'Product Manager', applicant: 'Lisa Brown', company: 'Innovate Inc', status: 'Shortlisted', applied: '2024-03-12' },
    { id: 3, jobTitle: 'UX Designer', applicant: 'David Lee', company: 'Startup Co', status: 'Rejected', applied: '2024-03-10' }
  ]

  return (
    <>
      <Head>
        <title>Application Management - TrueHire</title>
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
                <p className="text-gray-600 mt-2">Monitor and manage all job applications on the platform</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  👀
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">234</p>
                  <p className="text-gray-600 text-sm">Under Review</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  ✅
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                  <p className="text-gray-600 text-sm">Shortlisted</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  ❌
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                  <p className="text-gray-600 text-sm">Rejected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Applications</h3>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>All Status</option>
                  <option>Under Review</option>
                  <option>Shortlisted</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.jobTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{application.applicant}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{application.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.applied}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Shortlist</button>
                        <button className="text-red-600 hover:text-red-900">Reject</button>
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
