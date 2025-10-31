import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AdminRecruiters() {
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

  const recruiters = [
    { id: 1, name: 'John Smith', email: 'john@techcorp.com', company: 'Tech Corp', status: 'Active', joined: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@innovate.com', company: 'Innovate Inc', status: 'Active', joined: '2024-02-20' },
    { id: 3, name: 'Mike Chen', email: 'mike@startup.com', company: 'Startup Co', status: 'Suspended', joined: '2024-03-10' },
    { id: 4, name: 'Emma Davis', email: 'emma@global.com', company: 'Global Solutions', status: 'Active', joined: '2024-01-05' }
  ]

  return (
    <>
      <Head>
        <title>Manage Recruiters - TrueHire</title>
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Recruiters</h1>
                <p className="text-gray-600 mt-2">View and manage all recruiter accounts on the platform</p>
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
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  👥
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                  <p className="text-gray-600 text-sm">Total Recruiters</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  ✅
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">42</p>
                  <p className="text-gray-600 text-sm">Active Recruiters</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  ⏳
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-gray-600 text-sm">Pending Approval</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recruiters Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Recruiters</h3>
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
        </div>
      </main>
      <Footer />
    </>
  )
}
