import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function ApplicationTracker() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [filter, setFilter] = useState('all')

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

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          const userData = JSON.parse(storedUserData)
          setUser(userData)
        } else {
          setUser({
            name: 'Professional User',
            email: 'user@example.com'
          })
        }

        // Mock applications data
        setApplications([
          {
            id: 1,
            company: 'TechCorp',
            position: 'Senior Frontend Developer',
            status: 'applied',
            appliedDate: '2024-01-15',
            lastUpdate: '2024-01-15',
            notes: 'Applied through company website'
          },
          {
            id: 2,
            company: 'InnovateLabs',
            position: 'React Developer',
            status: 'interview',
            appliedDate: '2024-01-10',
            lastUpdate: '2024-01-18',
            notes: 'Phone interview scheduled for next week'
          },
          {
            id: 3,
            company: 'StartupXYZ',
            position: 'Full Stack Developer',
            status: 'rejected',
            appliedDate: '2024-01-05',
            lastUpdate: '2024-01-12',
            notes: 'Position filled internally'
          },
          {
            id: 4,
            company: 'DataFlow Inc',
            position: 'Frontend Engineer',
            status: 'offer',
            appliedDate: '2024-01-08',
            lastUpdate: '2024-01-20',
            notes: 'Offer received, reviewing details'
          }
        ])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'reviewing': return 'bg-yellow-100 text-yellow-800'
      case 'interview': return 'bg-purple-100 text-purple-800'
      case 'offer': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'applied': return 'Applied'
      case 'reviewing': return 'Under Review'
      case 'interview': return 'Interview'
      case 'offer': return 'Offer Received'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Application Tracker - TrueHire</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/welcome" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Tracker</h1>
            <p className="text-gray-600">Track your job application status and progress</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total</h3>
              <p className="text-3xl font-bold text-gray-600">{applications.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Applied</h3>
              <p className="text-3xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'applied').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview</h3>
              <p className="text-3xl font-bold text-purple-600">
                {applications.filter(app => app.status === 'interview').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Offers</h3>
              <p className="text-3xl font-bold text-green-600">
                {applications.filter(app => app.status === 'offer').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rejected</h3>
              <p className="text-3xl font-bold text-red-600">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setFilter('applied')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'applied'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Applied ({applications.filter(app => app.status === 'applied').length})
              </button>
              <button
                onClick={() => setFilter('interview')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'interview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Interview ({applications.filter(app => app.status === 'interview').length})
              </button>
              <button
                onClick={() => setFilter('offer')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'offer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Offers ({applications.filter(app => app.status === 'offer').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'rejected'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({applications.filter(app => app.status === 'rejected').length})
              </button>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No applications found for the selected filter.</p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <div key={application.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.position}
                        </h3>
                        <p className="text-gray-600 mb-2">{application.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Applied: {application.appliedDate}</span>
                          <span>Last Update: {application.lastUpdate}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                    {application.notes && (
                      <p className="text-gray-700 mb-4">{application.notes}</p>
                    )}
                    <div className="flex space-x-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 font-medium">
                        Update Status
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
