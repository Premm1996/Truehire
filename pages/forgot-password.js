import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Simulate API call to send reset email
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Show success message
      setMessage('Password reset instructions have been sent to your email address.')

      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      console.error('Password reset failed:', error)
      setMessage('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password - TrueHire</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-gray-600">Enter your email address and we'll send you a link to reset your password</p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              <div className="text-center space-y-2">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors block"
                >
                  ← Back to Login
                </Link>
                <Link
                  href="/register"
                  className="text-gray-600 hover:text-gray-500 text-sm transition-colors block"
                >
                  Don't have an account? Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
