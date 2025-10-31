import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { jobs } from '../../utils/jobs'

const companies = [
  {
    id: 1,
    name: 'TechCorp',
    logo: '/images/tech crop.png',
    industry: 'Technology',
    size: '1000-5000 employees',
    location: 'San Francisco, CA',
    description: 'Leading technology company focused on AI and machine learning solutions.',
    jobs: 45,
    rating: 4.8,
    website: 'https://techcorp.com',
    founded: '2010',
    headquarters: 'San Francisco, CA',
    employees: '2,500',
    about: 'TechCorp is a leading technology company specializing in AI and machine learning solutions. We are committed to pushing the boundaries of innovation and creating technology that makes a positive impact on the world. Our team of talented engineers, data scientists, and designers work together to build cutting-edge products that solve real-world problems.',
    culture: 'At TechCorp, we foster a culture of innovation, collaboration, and continuous learning. We believe in empowering our employees to take ownership of their work and providing them with the resources they need to succeed.',
    benefits: [
      'Competitive salary and equity',
      'Comprehensive health insurance',
      'Flexible work arrangements',
      'Professional development budget',
      'Catered meals and wellness programs',
      'Modern office spaces'
    ]
  },
  {
    id: 2,
    name: 'DataFlow Inc',
    logo: '/images/data flow.png',
    industry: 'Data Analytics',
    size: '500-1000 employees',
    location: 'New York, NY',
    description: 'Specialized in big data analytics and business intelligence platforms.',
    jobs: 23,
    rating: 4.6,
    website: 'https://dataflow.com',
    founded: '2012',
    headquarters: 'New York, NY',
    employees: '750',
    about: 'DataFlow Inc is a leading provider of big data analytics and business intelligence platforms. We help organizations transform their data into actionable insights that drive business growth and innovation.',
    culture: 'Our culture is built on the principles of data-driven decision making, collaboration, and continuous improvement. We value diversity and inclusion and strive to create an environment where everyone can thrive.',
    benefits: [
      'Competitive compensation',
      'Health and dental insurance',
      'Flexible PTO',
      'Learning and development opportunities',
      'Stock options',
      'Remote work options'
    ]
  },
  {
    id: 3,
    name: 'CloudTech Solutions',
    logo: '/images/cloud tech.png',
    industry: 'Cloud Computing',
    size: '100-500 employees',
    location: 'Austin, TX',
    description: 'Innovative cloud infrastructure and DevOps solutions provider.',
    jobs: 18,
    rating: 4.7,
    website: 'https://cloudtech.com',
    founded: '2015',
    headquarters: 'Austin, TX',
    employees: '300',
    about: 'CloudTech Solutions provides innovative cloud infrastructure and DevOps solutions to help businesses scale and modernize their operations. Our platform enables organizations to build, deploy, and manage applications with ease.',
    culture: 'We believe in fostering a culture of innovation and collaboration. Our team is passionate about technology and committed to delivering exceptional solutions that drive our clients\' success.',
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Flexible work environment',
      'Technology stipend',
      'Professional development',
      'Team building activities'
    ]
  },
  {
    id: 4,
    name: 'FinTech Global',
    logo: '/images/fin tech.png',
    industry: 'Financial Technology',
    size: '5000+ employees',
    location: 'London, UK',
    description: 'Global leader in financial technology and digital banking solutions.',
    jobs: 67,
    rating: 4.9,
    website: 'https://fintechglobal.com',
    founded: '2008',
    headquarters: 'London, UK',
    employees: '8,500',
    about: 'FinTech Global is a global leader in financial technology and digital banking solutions. We serve millions of customers worldwide, providing secure and innovative financial services that empower people and businesses.',
    culture: 'Our culture is centered around trust, innovation, and customer-centricity. We are committed to creating a diverse and inclusive workplace where employees can grow and succeed.',
    benefits: [
      'Competitive compensation package',
      'Comprehensive benefits',
      'Work-life balance',
      'Career development programs',
      'Global opportunities',
      'Employee wellness programs'
    ]
  },
  {
    id: 5,
    name: 'GreenEnergy Corp',
    logo: '/images/green energy.png',
    industry: 'Renewable Energy',
    size: '1000-5000 employees',
    location: 'Berlin, Germany',
    description: 'Pioneering sustainable energy solutions for a greener future.',
    jobs: 34,
    rating: 4.5,
    website: 'https://greenenergy.com',
    founded: '2011',
    headquarters: 'Berlin, Germany',
    employees: '2,200',
    about: 'GreenEnergy Corp is dedicated to pioneering sustainable energy solutions for a greener future. We develop and deploy renewable energy technologies that help combat climate change and create a sustainable world.',
    culture: 'We are passionate about sustainability and environmental responsibility. Our team works together to create innovative solutions that make a positive impact on the planet.',
    benefits: [
      'Competitive salary',
      'Health and wellness programs',
      'Flexible work arrangements',
      'Sustainability initiatives',
      'Professional development',
      'Green commuting options'
    ]
  },
  {
    id: 6,
    name: 'HealthTech Innovations',
    logo: '/images/health.png',
    industry: 'Healthcare Technology',
    size: '500-1000 employees',
    location: 'Boston, MA',
    description: 'Revolutionizing healthcare through innovative technology solutions.',
    jobs: 28,
    rating: 4.8,
    website: 'https://healthtech.com',
    founded: '2013',
    headquarters: 'Boston, MA',
    employees: '650',
    about: 'HealthTech Innovations is revolutionizing healthcare through innovative technology solutions. We develop cutting-edge medical devices and software that improve patient outcomes and healthcare delivery.',
    culture: 'Our culture is built on innovation, compassion, and excellence. We are committed to improving healthcare outcomes and making a positive difference in people\'s lives.',
    benefits: [
      'Competitive compensation',
      'Comprehensive health benefits',
      'Flexible work options',
      'Innovation time',
      'Professional development',
      'Community involvement'
    ]
  }
]

export default function CompanyDetail() {
  const router = useRouter()
  const { id } = router.query

  const company = companies.find(c => c.id === parseInt(id))

  if (!company) {
    return (
      <>
        <Head>
          <title>Company Not Found — TrueHire</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Company Not Found</h1>
            <p className="text-gray-600 mb-8">The company you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/companies')}
              className="btn btn-primary"
            >
              Back to Companies
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Filter jobs for this company
  const companyJobs = jobs.filter(job => job.company === company.name)

  return (
    <>
      <Head>
        <title>{company.name} — TrueHire</title>
        <meta name="description" content={`Learn about ${company.name} and explore career opportunities. ${company.description}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Company Header */}
        <div className="gradient-bg py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <img src={company.logo} alt={company.name} className="w-24 h-24 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{company.name}</h1>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(company.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg text-gray-600 ml-2">{company.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    {company.industry}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {company.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                    {company.employees} employees
                  </div>
                </div>
                <p className="text-gray-600 text-lg">{company.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {company.name}</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{company.about}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Company Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Founded:</span> {company.founded}</p>
                      <p><span className="font-medium">Headquarters:</span> {company.headquarters}</p>
                      <p><span className="font-medium">Industry:</span> {company.industry}</p>
                      <p><span className="font-medium">Company Size:</span> {company.size}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
                    <div className="space-y-2">
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                        Visit Website →
                      </a>
                      <p className="text-gray-600 text-sm">{company.jobs} open positions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Culture */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Culture</h2>
                <p className="text-gray-700 leading-relaxed">{company.culture}</p>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Jobs */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions at {company.name}</h2>
                {companyJobs.length > 0 ? (
                  <div className="space-y-4">
                    {companyJobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                                </svg>
                                {job.salary}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                                {job.type}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.slice(0, 3).map((skill) => (
                                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className="btn btn-primary text-sm ml-4"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Positions</h3>
                    <p className="text-gray-600">There are currently no open positions at {company.name}. Check back later for new opportunities.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded</span>
                    <span className="font-medium">{company.founded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employees</span>
                    <span className="font-medium">{company.employees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Open Positions</span>
                    <span className="font-medium text-blue-600">{company.jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{company.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Apply Now */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Ready to Join {company.name}?</h3>
                <p className="text-blue-100 mb-4">Explore our open positions and start your journey with us.</p>
                <button
                  onClick={() => document.getElementById('open-jobs').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Open Positions
                </button>
              </div>

              {/* Similar Companies */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Companies</h3>
                <div className="space-y-3">
                  {companies.filter(c => c.id !== company.id && c.industry === company.industry).slice(0, 3).map((similarCompany) => (
                    <div key={similarCompany.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={similarCompany.logo} alt={similarCompany.name} className="w-8 h-8 rounded object-cover mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{similarCompany.name}</p>
                          <p className="text-gray-600 text-xs">{similarCompany.location}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/companies/${similarCompany.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
