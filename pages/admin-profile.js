import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AdminProfile() {
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

  return (
    <>
      <Head>
        <title>Admin Profile - TrueHire</title>
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src="/images/truerizelogon.png.jpg"
                  alt="Admin Profile"
                  className="w-24 h-24 rounded-full mr-6"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Truerize Admin</h1>
                  <p className="text-gray-600 mt-1">Administrator • Full System Access</p>
                  <p className="text-sm text-gray-500 mt-1">Email: {adminData.email || 'admin@truehire.com'}</p>
                </div>
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

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{adminData.name || 'Truerize Admin'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <p className="mt-1 text-sm text-gray-900">{adminData.email || 'admin@truehire.com'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">Administrator</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Access Level</label>
                  <p className="mt-1 text-sm text-gray-900">Full System Access</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                  <p className="mt-1 text-sm text-gray-900">Enabled</p>
                </div>
                <button className="w-full btn btn-primary mt-4">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Logged into admin dashboard</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <span className="text-xs text-gray-500">Admin Dashboard</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Updated system settings</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <span className="text-xs text-gray-500">System Settings</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Reviewed recruiter applications</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
                <span className="text-xs text-gray-500">Recruiter Management</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
