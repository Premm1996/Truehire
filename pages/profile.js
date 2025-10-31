import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const storedUserData = localStorage.getItem('userData')
        const fallback = {
          name: 'Professional User',
          email: 'user@example.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          bio: 'Experienced professional seeking new opportunities.',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          experience: '5+ years',
          education: 'Bachelor\'s in Computer Science',
          certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
          summary: 'Passionate software engineer with expertise in full-stack development.',
          socialLinks: {
            linkedin: '',
            github: '',
            portfolio: ''
          },
          profilePhoto: null,
          visibility: 'public',
          portfolio: [],
          resumes: [],
          profileComplete: 75
        }
        const userData = storedUserData ? JSON.parse(storedUserData) : {}
        setUser({ ...fallback, ...userData })
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSave = () => {
    // Save user data to localStorage
    localStorage.setItem('userData', JSON.stringify(user))
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file.')
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.')
        return
      }

      // Simulate AI parsing (in a real app, this would call an API)
      setUser({...user, resume: file.name})
      alert('Resume uploaded successfully! AI parsing will populate your profile details shortly.')
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.')
        return
      }

      // Create object URL for preview
      const url = URL.createObjectURL(file)
      setUser({...user, profilePhoto: url})
      alert('Profile photo uploaded successfully!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Profile - TrueHire</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create & Manage Profile</h1>
                  <p className="text-gray-600">Build and update your professional profile</p>
                </div>
              </div>
              <div className="flex space-x-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={user.phone}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={user.location}
                    onChange={(e) => setUser({...user, location: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{user.location}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={user.bio}
                  onChange={(e) => setUser({...user, bio: e.target.value})}
                  rows={4}
                  className="input"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={user.experience}
                    onChange={(e) => setUser({...user, experience: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{user.experience}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={user.education}
                    onChange={(e) => setUser({...user, education: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{user.education}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              {isEditing ? (
                <input
                  type="text"
                  value={user.skills.join(', ')}
                  onChange={(e) => setUser({...user, skills: e.target.value.split(', ')})}
                  className="input"
                  placeholder="Enter skills separated by commas"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Auto-Fill from Resume */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Auto-Fill from Resume</h2>
            <p className="text-gray-600 mb-4">Upload your resume and our AI will automatically extract education, skills, and experience to populate your profile.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
              </svg>
              <div className="mb-4">
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-800 font-medium">Click to upload</span> or drag and drop
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleResumeUpload(e)}
                />
              </div>
              <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
              {user.resume && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">Resume uploaded successfully! AI parsing in progress...</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Builder */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Builder</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                {isEditing ? (
                  <textarea
                    value={user.summary}
                    onChange={(e) => setUser({...user, summary: e.target.value})}
                    rows={4}
                    className="input"
                    placeholder="Write a compelling professional summary..."
                  />
                ) : (
                  <p className="text-gray-900">{user.summary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={user.certifications.join(', ')}
                    onChange={(e) => setUser({...user, certifications: e.target.value.split(', ')})}
                    className="input"
                    placeholder="Enter certifications separated by commas"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={user.socialLinks.linkedin}
                    onChange={(e) => setUser({...user, socialLinks: {...user.socialLinks, linkedin: e.target.value}})}
                    className="input"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-gray-900">{user.socialLinks.linkedin || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={user.socialLinks.github}
                    onChange={(e) => setUser({...user, socialLinks: {...user.socialLinks, github: e.target.value}})}
                    className="input"
                    placeholder="https://github.com/yourusername"
                  />
                ) : (
                  <p className="text-gray-900">{user.socialLinks.github || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={user.socialLinks.portfolio}
                    onChange={(e) => setUser({...user, socialLinks: {...user.socialLinks, portfolio: e.target.value}})}
                    className="input"
                    placeholder="https://yourportfolio.com"
                  />
                ) : (
                  <p className="text-gray-900">{user.socialLinks.portfolio || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Photo Upload */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Photo (Optional)</h2>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                  </svg>
                )}
              </div>
              <div>
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-800 font-medium">Upload photo</span>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e)}
                />
                <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF (Max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Profile Visibility Control */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Visibility</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Who can view your profile?</label>
                {isEditing ? (
                  <select
                    value={user.visibility}
                    onChange={(e) => setUser({...user, visibility: e.target.value})}
                    className="input"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                ) : null}
              </div>
            </div>
          </div>

          {/* Multiple Resume Versions */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resume Versions</h2>
            <p className="text-gray-600 mb-4">Maintain different resume versions for different roles and opportunities.</p>
            <div className="space-y-3">
              {user.resumes.map((resume, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
                    </svg>
                    <span className="text-gray-900">{resume.name}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                </div>
              ))}
              <button className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                + Add New Resume Version
              </button>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio</h2>
            <p className="text-gray-600 mb-4">Showcase your case studies, projects, or creative work to impress potential employers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.portfolio.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <a href={item.link} className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">View Project</a>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium">+ Add Project</button>
              </div>
            </div>
          </div>

          {/* Profile Completion Indicator */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Completion</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Profile Complete</span>
                <span className="text-sm font-bold text-gray-900">{user.profileComplete}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${user.profileComplete}%`}}></div>
              </div>
              <div className="text-sm text-gray-600">
                Complete these steps to reach 100%:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Add a professional photo</li>
                  <li>Fill in your social links</li>
                  <li>Add at least one project to your portfolio</li>
                  <li>Upload multiple resume versions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <Link href="/welcome" className="text-blue-600 hover:text-blue-500 font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
