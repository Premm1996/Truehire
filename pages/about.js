import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function About() {
  const stats = [
    { number: '10,000+', label: 'Active Jobs' },
    { number: '750+', label: 'Partner Companies' },
    { number: '50,000+', label: 'Happy Candidates' },
    { number: '94%', label: 'Success Rate' }
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'SJ',
      bio: 'Former tech executive with 15+ years in recruitment and AI technology.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'MC',
      bio: 'AI expert and former Google engineer specializing in machine learning applications.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Talent',
      image: 'ER',
      bio: 'HR professional with extensive experience in talent acquisition and development.'
    }
  ]

  return (
    <>
      <Head>
        <title>About Us — TrueHire</title>
        <meta name="description" content="Learn about TrueHire's mission to revolutionize job matching with AI-powered technology and connect talent with opportunities." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="gradient-bg py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Revolutionizing <span className="text-gradient">Job Matching</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're on a mission to connect the world's best talent with life-changing opportunities through AI-powered matching technology.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Founded in 2020, TrueHire emerged from a simple observation: traditional job matching was inefficient and often missed the perfect connections between candidates and companies.
                  </p>
                  <p>
                    Our founders, experienced in both technology and recruitment, saw an opportunity to leverage artificial intelligence to create more meaningful matches. What started as a small team with a big vision has grown into a platform trusted by thousands of professionals and hundreds of companies.
                  </p>
                  <p>
                    Today, we continue to innovate, using cutting-edge AI to understand not just skills and experience, but also career aspirations, company culture, and long-term growth potential.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/team-collaboration.png"
                  alt="Team collaboration"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-gradient">Impact</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Numbers that tell our story of connecting talent with opportunity
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-mono">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-gradient">Mission & Values</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We leverage cutting-edge AI technology to create better matches and more efficient processes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  We believe in building strong relationships between candidates, companies, and our platform.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600">
                  We strive for the highest standards in everything we do, from technology to customer service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our <span className="text-gradient">Team</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The passionate individuals driving TrueHire's vision forward
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {member.image}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Whether you're looking for your next opportunity or hiring top talent, TrueHire is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-white text-blue-600 hover:bg-gray-50 px-8 py-3">
                Find Jobs
              </button>
              <button className="btn btn-secondary px-8 py-3">
                Post a Job
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
