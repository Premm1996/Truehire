import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function InterviewPractice() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState('')

  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const router = useRouter()

  const practiceQuestions = [
    'Tell me about yourself and your background.',
    'What are your greatest strengths and weaknesses?',
    'Why are you interested in this position?',
    'Where do you see yourself in 5 years?',
    'Tell me about a challenging project you worked on.',
    'How do you handle pressure and tight deadlines?',
    'Describe a situation where you had to learn something new quickly.',
    'What motivates you in your work?',
    'How do you handle constructive criticism?',
    'Tell me about a time you failed and what you learned from it.'
  ]

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
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
            email: 'user@example.com',
            role: 'Job Seeker'
          })
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()

    // Initialize camera
    initializeCamera()
  }, [router])

  const initializeCamera = async () => {
    // Check if we're in the browser and mediaDevices is available
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('Media devices not available in this environment')
      alert('Camera and microphone access is not supported in this browser or environment.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera and microphone. Please check permissions.')
    }
  }

  const startRecording = () => {
    if (!videoRef.current?.srcObject) {
      alert('Camera not initialized. Please refresh the page.')
      return
    }

    recordedChunksRef.current = []
    const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
      mimeType: 'video/webm;codecs=vp9'
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedVideo(url)
      analyzeRecording(blob)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const analyzeRecording = (videoBlob) => {
    // Simulate AI analysis
    setTimeout(() => {
      setFeedback({
        overallScore: Math.floor(Math.random() * 30) + 70,
        categories: {
          verbalCommunication: Math.floor(Math.random() * 30) + 70,
          bodyLanguage: Math.floor(Math.random() * 30) + 70,
          confidence: Math.floor(Math.random() * 30) + 70,
          content: Math.floor(Math.random() * 30) + 70
        },
        strengths: [
          'Clear and articulate speech',
          'Good eye contact maintained',
          'Well-structured response'
        ],
        improvements: [
          'Reduce filler words (um, like)',
          'Use more hand gestures for emphasis',
          'Vary your speaking pace'
        ],
        tips: [
          'Practice in front of a mirror',
          'Record multiple takes and compare',
          'Focus on one main point per answer'
        ]
      })
    }, 3000)
  }

  const resetRecording = () => {
    setRecordedVideo(null)
    setFeedback(null)
    setSelectedQuestion('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Interview Practice...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Interview Practice - TrueHire</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/welcome" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              ← Back to Welcome
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎤 Interview Practice
            </h1>
            <p className="text-xl text-gray-600">
              Record and review your interview skills with AI-powered analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Recording Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Session</h2>

              {/* Question Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Practice Question
                </label>
                <select
                  value={selectedQuestion}
                  onChange={(e) => setSelectedQuestion(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a question...</option>
                  {practiceQuestions.map((question, index) => (
                    <option key={index} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Display */}
              <div className="mb-6">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-64 object-cover"
                  />
                  {isRecording && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center bg-red-500 text-white px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        Recording
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!selectedQuestion}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🎬 Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="btn btn-danger"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}
                {recordedVideo && (
                  <button
                    onClick={resetRecording}
                    className="btn btn-secondary"
                  >
                    🔄 New Recording
                  </button>
                )}
              </div>
            </div>

            {/* Playback and Feedback Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Feedback</h2>

              {recordedVideo ? (
                <div className="space-y-6">
                  {/* Recorded Video Playback */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Recording</h3>
                    <video
                      src={recordedVideo}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* AI Feedback */}
                  {feedback ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                          <span className="text-2xl font-bold text-blue-600">{feedback.overallScore}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Overall Score</h3>
                      </div>

                      {/* Category Scores */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{feedback.categories.verbalCommunication}</div>
                          <div className="text-sm text-gray-600">Verbal Communication</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{feedback.categories.bodyLanguage}</div>
                          <div className="text-sm text-gray-600">Body Language</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{feedback.categories.confidence}</div>
                          <div className="text-sm text-gray-600">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{feedback.categories.content}</div>
                          <div className="text-sm text-gray-600">Content</div>
                        </div>
                      </div>

                      {/* Detailed Feedback */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">✅ Strengths</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {feedback.strengths.map((strength, index) => (
                              <li key={index}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-700 mb-2">🔧 Areas for Improvement</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {feedback.improvements.map((improvement, index) => (
                              <li key={index}>• {improvement}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2">💡 Practice Tips</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {feedback.tips.map((tip, index) => (
                              <li key={index}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Analyzing your performance...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Practice?</h3>
                  <p className="text-gray-600">
                    Select a question above and start recording to get AI-powered feedback on your interview performance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl mb-4">📹</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Recording</h3>
              <p className="text-gray-600">Record yourself answering interview questions with video and audio.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Get detailed feedback on your verbal communication, body language, and content.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Track your improvement over time with detailed performance metrics.</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Perfect Your Interview Skills</h2>
            <p className="text-green-100 mb-6">
              Unlock advanced recording features, unlimited practice sessions, and detailed performance analytics.
            </p>
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
