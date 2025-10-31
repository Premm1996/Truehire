import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ProfileComplete() {
  const [recruiterData, setRecruiterData] = useState(null)
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

  if (!recruiterData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const calculateProfileCompletion = () => {
    const fields = ['company', 'name', 'email', 'industry', 'description', 'website', 'companySize']
    const filledFields = fields.filter(field => recruiterData[field] && recruiterData[field].trim() !== '')
    return Math.round((filledFields.length / fields.length) * 100)
  }

  const profileFields = [
    { label: 'Company Name', value: recruiterData.company, completed: !!recruiterData.company },
    { label: 'Your Name', value: recruiterData.name, completed: !!recruiterData.name },
    { label: 'Email', value: recruiterData.email, completed: !!recruiterData.email },
    { label: 'Industry', value: recruiterData.industry, completed: !!recruiterData.industry },
    { label: 'Company Description', value: recruiterData.description, completed: !!recruiterData.description },
    { label: 'Website', value: recruiterData.website, completed: !!recruiterData.website },
    { label: 'Company Size', value: recruiterData.companySize, completed: !!recruiterData.companySize }
  ]

  return (
    <>
      <Head>
        <title>Profile Completion - TrueHire</title>
      </Head>

      <Header />
      <main className="min-h-screen bg-white pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Profile Completion</h1>
              <p className="text-gray-600 mt-1">Complete your profile to attract better candidates</p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-green-600 mb-2">{calculateProfileCompletion()}%</div>
              <p className="text-gray-600">Profile Complete</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${calculateProfileCompletion()}%` }}
              ></div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Fields</h2>
              <div className="space-y-4">
                {profileFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        field.completed ? 'bg-green-500' : 'bg-gray-300'
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
                        <h3 className="font-medium text-gray-900">{field.label}</h3>
                        <p className="text-sm text-gray-600">
                          {field.completed ? field.value : 'Not provided'}
                        </p>
                      </div>
                    </div>
                    {!field.completed && (
                      <button
                        onClick={() => router.push('/company-profile')}
                        className="btn btn-outline px-4 py-2 text-sm"
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
              onClick={() => router.push('/company-profile')}
              className="btn btn-primary px-8 py-3"
            >
              Complete Profile
            </button>
            <button
              onClick={() => router.push('/recruiter-dashboard')}
              className="btn btn-outline px-8 py-3"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
