import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function RecruiterChats() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState('')

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

        // Mock chats data
        setChats([
          {
            id: 1,
            recruiter: 'Sarah Johnson',
            company: 'TechCorp',
            position: 'Senior Frontend Developer',
            lastMessage: 'Hi! We\'d like to schedule an interview for next week.',
            timestamp: '2024-01-20T10:30:00Z',
            unread: 2,
            messages: [
              {
                id: 1,
                sender: 'recruiter',
                text: 'Hello! Thank you for applying to the Senior Frontend Developer position at TechCorp.',
                timestamp: '2024-01-18T09:00:00Z'
              },
              {
                id: 2,
                sender: 'user',
                text: 'Hi Sarah, thank you for reaching out. I\'m very interested in the position.',
                timestamp: '2024-01-18T09:15:00Z'
              },
              {
                id: 3,
                sender: 'recruiter',
                text: 'Great! We\'d like to schedule an interview for next week. What days work best for you?',
                timestamp: '2024-01-20T10:30:00Z'
              }
            ]
          },
          {
            id: 2,
            recruiter: 'Mike Chen',
            company: 'InnovateLabs',
            position: 'React Developer',
            lastMessage: 'Your portfolio looks impressive! Let\'s discuss the next steps.',
            timestamp: '2024-01-19T14:20:00Z',
            unread: 0,
            messages: [
              {
                id: 1,
                sender: 'recruiter',
                text: 'Hi there! I reviewed your application and your portfolio looks impressive.',
                timestamp: '2024-01-19T14:20:00Z'
              }
            ]
          },
          {
            id: 3,
            recruiter: 'Emily Davis',
            company: 'StartupXYZ',
            position: 'Full Stack Developer',
            lastMessage: 'Thank you for your interest. We\'ll be in touch soon.',
            timestamp: '2024-01-15T16:45:00Z',
            unread: 1,
            messages: [
              {
                id: 1,
                sender: 'recruiter',
                text: 'Thank you for your interest in the Full Stack Developer position.',
                timestamp: '2024-01-15T16:45:00Z'
              }
            ]
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

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    }

    setChats(chats.map(chat =>
      chat.id === activeChat.id
        ? {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: message,
            timestamp: new Date().toISOString(),
            unread: 0
          }
        : chat
    ))

    setMessage('')
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Recruiter Chats - TrueHire</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/welcome" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Chats</h1>
            <p className="text-gray-600">Connect directly with recruiters and hiring managers</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-[600px] flex">
            {/* Chat List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              <div className="overflow-y-auto h-full">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      activeChat?.id === chat.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{chat.recruiter}</h3>
                      <span className="text-xs text-gray-500">{formatDate(chat.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{chat.company} • {chat.position}</p>
                    <p className="text-sm text-gray-700 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mt-2">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{activeChat.recruiter}</h3>
                    <p className="text-sm text-gray-600">{activeChat.company} • {activeChat.position}</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeChat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a chat from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
