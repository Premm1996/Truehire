import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function UserProfileComplete() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
        email: 'user@example.com',
        role: 'Job Seeker'
      })
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      'name', 'email', 'phone', 'location', 'experience',
      'education', 'skills', 'resume', 'linkedin', 'portfolio'
    ]
    const filledFields = fields.filter(field => user[field] && user[field].trim() !== '')
    return Math.round((filledFields.length / fields.length) * 100)
  }

  const profileFields = [
    { label: 'Full Name', value: user.name, completed: !!user.name, required: true },
    { label: 'Email Address', value: user.email, completed: !!user.email, required: true },
    { label: 'Phone Number', value: user.phone || '', completed: !!user.phone, required: false },
    { label: 'Location', value: user.location || '', completed: !!user.location, required: true },
    { label: 'Years of Experience', value: user.experience || '', completed: !!user.experience, required: true },
    { label: 'Education', value: user.education || '', completed: !!user.education, required: true },
    { label: 'Skills', value: user.skills || '', completed: !!user.skills, required: true },
    { label: 'Resume', value: user.resume ? 'Uploaded' : '', completed: !!user.resume, required: true },
    { label: 'LinkedIn Profile', value: user.linkedin || '', completed: !!user.linkedin, required: false },
    { label: 'Portfolio/Website', value: user.portfolio || '', completed: !!user.portfolio, required: false }
  ]

  const completionPercentage = calculateProfileCompletion()

  return (
    <>
      <Head>
        <title>Profile Completion - TrueHire</title>
      </Head>
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">Profile Completion</h1>
            <p className="text-gray-700 mt-2">Complete your profile to increase your chances of getting hired</p>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-300 mb-8">
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold mb-2 ${
                completionPercentage >= 80 ? 'text-green-600' :
                completionPercentage >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {completionPercentage}%
              </div>
              <p className="text-gray-700">Profile Complete</p>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  completionPercentage >= 80 ? 'bg-green-500' :
                  completionPercentage >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {completionPercentage >= 80 ? 'Great job! Your profile looks complete.' :
                 completionPercentage >= 60 ? 'Almost there! Complete a few more fields.' :
                 'Complete your profile to stand out to employers.'}
              </p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-300">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-black mb-6">Profile Fields</h2>
              <div className="space-y-4">
                {profileFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        field.completed ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {field.completed ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-black">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {field.completed ? field.value : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {!field.completed && (
                      <button
                        onClick={() => router.push('/profile')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Profile
            </button>
            <button
              onClick={() => router.push('/welcome')}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
