import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Applications() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState([
    {
      id: 1,
      jobTitle: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '₹120k - ₹160k',
      status: 'Under Review',
      appliedDate: '2 days ago',
      applicationId: 'APP-001'
    },
    {
      id: 2,
      jobTitle: 'Product Manager',
      company: 'InnoGroup',
      location: 'New York, NY',
      salary: '₹140k - ₹180k',
      status: 'Interview Scheduled',
      appliedDate: '1 week ago',
      applicationId: 'APP-002'
    },
    {
      id: 3,
      jobTitle: 'UI/UX Designer',
      company: 'DesignCo',
      location: 'Austin, TX',
      salary: '₹70k - ₹90k',
      status: 'Rejected',
      appliedDate: '2 weeks ago',
      applicationId: 'APP-003'
    }
  ])
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    const otpVerified = localStorage.getItem('otpVerified') === 'true'
    if (!otpVerified) {
      router.push('/otp')
      return
    }

    // Get user data
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      setUser(JSON.parse(storedUserData))
    } else {
      setUser({
        name: 'Professional User',
        email: 'user@example.com'
      })
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your applications...</p>
        </div>
      </div>
    )
  }



  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Interview Scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleWithdrawApplication = (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      setApplications(applications.filter(app => app.id !== applicationId))
      alert('Application withdrawn successfully')
    }
  }

  return (
    <>
      <Head>
        <title>My Applications - TrueHire</title>
      </Head>
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/welcome')}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-4"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2">Track the status of your job applications</p>
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.jobTitle}</h3>
                    <p className="text-gray-600 mb-2">{app.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>{app.location}</span>
                      <span>{app.salary}</span>
                      <span>Applied {app.appliedDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">ID: {app.applicationId}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push(`/jobs/${app.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Job Details
                    </button>
                    <button
                      onClick={() => handleWithdrawApplication(app.id)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Withdraw Application
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {applications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-6">Start applying to jobs to see your applications here</p>
              <button
                onClick={() => router.push('/jobs')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
