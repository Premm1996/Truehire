import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function SavedJobs() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState([
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '₹120k - ₹160k',
      type: 'Full-time',
      level: 'Senior',
      savedDate: '1 week ago',
      description: 'Join our team to build scalable web applications using modern technologies.'
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'InnoGroup',
      location: 'New York, NY',
      salary: '₹140k - ₹180k',
      type: 'Full-time',
      level: 'Mid',
      savedDate: '3 days ago',
      description: 'Lead product strategy and work closely with engineering teams.'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'DesignCo',
      location: 'Austin, TX',
      salary: '₹70k - ₹90k',
      type: 'Full-time',
      level: 'Junior',
      savedDate: '5 days ago',
      description: 'Create beautiful and intuitive user experiences for our products.'
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
          <p className="text-gray-300">Loading your saved jobs...</p>
        </div>
      </div>
    )
  }



  const handleApply = (jobId) => {
    // In a real app, this would submit an application
    alert(`Applied to job ${jobId}`)
  }

  const handleRemove = (jobId) => {
    if (window.confirm('Are you sure you want to remove this saved job?')) {
      setSavedJobs(savedJobs.filter(job => job.id !== jobId))
      alert('Job removed from saved jobs successfully')
    }
  }

  return (
    <>
      <Head>
        <title>Saved Jobs - TrueHire</title>
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
            <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-gray-600 mt-2">Jobs you've saved for later</p>
          </div>

          {/* Saved Jobs List */}
          <div className="space-y-6">
            {savedJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span>{job.location}</span>
                      <span>{job.salary}</span>
                      <span>{job.level}</span>
                      <span>{job.type}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                    <p className="text-xs text-gray-500">Saved {job.savedDate}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleApply(job.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {savedJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
              <p className="text-gray-600 mb-6">Save jobs you're interested in to view them later</p>
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
