import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Career() {
  const resources = [
    {
      title: 'Resume Writing Guide',
      description: 'Learn how to create a compelling resume that stands out to employers.',
      icon: '📄',
      link: '#'
    },
    {
      title: 'Interview Preparation',
      description: 'Master common interview questions and techniques for success.',
      icon: '🎯',
      link: '#'
    },
    {
      title: 'Career Development',
      description: 'Tips for advancing your career and achieving your professional goals.',
      icon: '📈',
      link: '#'
    },
    {
      title: 'Skill Building',
      description: 'Resources to learn new skills and stay competitive in your field.',
      icon: '🛠️',
      link: '#'
    },
    {
      title: 'Networking Strategies',
      description: 'Build meaningful professional connections and expand your network.',
      icon: '🤝',
      link: '#'
    },
    {
      title: 'Salary Negotiation',
      description: 'Learn how to negotiate better compensation and benefits.',
      icon: '💰',
      link: '#'
    }
  ]

  const courses = [
    {
      title: 'Digital Marketing Fundamentals',
      duration: '4 weeks',
      level: 'Beginner',
      price: 'Free'
    },
    {
      title: 'Data Science with Python',
      duration: '8 weeks',
      level: 'Intermediate',
      price: '$49'
    },
    {
      title: 'UI/UX Design Principles',
      duration: '6 weeks',
      level: 'Beginner',
      price: '$39'
    },
    {
      title: 'Project Management Professional',
      duration: '12 weeks',
      level: 'Advanced',
      price: '$99'
    }
  ]

  return (
    <>
      <Head>
        <title>Career Resources — TrueHire</title>
        <meta name="description" content="Access career development resources, resume builders, interview tips, and skill-building courses to advance your professional journey." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="gradient-bg py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Advance Your <span className="text-gradient">Career</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access professional development resources, expert guidance, and skill-building tools to take your career to the next level.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Career Tips & Guides */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Career <span className="text-gradient">Tips & Guides</span>
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Expert advice and practical strategies to help you succeed in your professional journey
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="text-4xl mb-4">{resource.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{resource.title}</h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <a href={resource.link} className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    Read More →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Resume Builder */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Professional <span className="text-gradient">Resume Builder</span>
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Create a standout resume with our AI-powered builder. Choose from professionally designed templates and get expert tips to make your application shine.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ATS-friendly templates
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Real-time preview
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Keyword optimization
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Multiple export formats
                    </li>
                  </ul>
                  <button className="btn btn-primary px-8 py-3 text-lg">
                    Start Building Resume
                  </button>
                </div>
                <div className="relative">
                  <img
                    src="/images/resume-builder.png"
                    alt="Resume Builder Interface"
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Interview Preparation */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Interview <span className="text-gradient">Preparation</span>
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Practice with realistic interview scenarios and get feedback to boost your confidence
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Interview Questions</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Tell me about yourself</p>
                    <p className="text-sm text-gray-600 mt-1">Learn how to craft a compelling response</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">What are your strengths and weaknesses?</p>
                    <p className="text-sm text-gray-600 mt-1">Tips for answering tricky questions</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Why do you want to work here?</p>
                    <p className="text-sm text-gray-600 mt-1">Research and preparation strategies</p>
                  </div>
                </div>
                <button className="btn btn-primary w-full mt-6">View All Questions</button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Mock Interview Practice</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Technical Interview</p>
                      <p className="text-sm text-gray-600">Coding and technical questions</p>
                    </div>
                    <button className="btn btn-secondary text-sm">Start Practice</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Behavioral Interview</p>
                      <p className="text-sm text-gray-600">Situational and experience-based</p>
                    </div>
                    <button className="btn btn-secondary text-sm">Start Practice</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Case Study Interview</p>
                      <p className="text-sm text-gray-600">Problem-solving scenarios</p>
                    </div>
                    <button className="btn btn-secondary text-sm">Start Practice</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skill Development Courses */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Skill <span className="text-gradient">Development</span> Courses
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Enhance your professional skills with our comprehensive online courses
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="mb-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Duration: {course.duration}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                    <button className="btn btn-primary text-sm">Enroll Now</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Career Assessment */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Take Our Career Assessment
                </h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                  Discover your ideal career path with our comprehensive assessment. Get personalized recommendations based on your skills, interests, and goals.
                </p>
                <button className="btn bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
                  Start Assessment
                </button>
              </div>
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated with Career Tips
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for weekly career advice, job market insights, and exclusive content.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                className="input flex-1"
                placeholder="Enter your email"
              />
              <button className="btn btn-primary px-6">
                Subscribe
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
