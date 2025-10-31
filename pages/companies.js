import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

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
    rating: 4.8
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
    rating: 4.6
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
    rating: 4.7
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
    rating: 4.9
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
    rating: 4.5
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
    rating: 4.8
  }
]

export default function Companies() {
  return (
    <>
      <Head>
        <title>Companies — TrueHire</title>
        <meta name="description" content="Discover top companies hiring on TrueHire. Explore company profiles, culture, and career opportunities." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="gradient-bg py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Top <span className="text-gradient">Companies</span> Hiring
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore opportunities at leading companies across various industries. Find your perfect workplace and career match.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Search and Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                className="input w-full"
                placeholder="Search companies..."
              />
            </div>
            <div className="md:w-48">
              <select className="input w-full">
                <option>All Industries</option>
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Energy</option>
                <option>Consulting</option>
              </select>
            </div>
            <div className="md:w-48">
              <select className="input w-full">
                <option>All Sizes</option>
                <option>1-50 employees</option>
                <option>51-200 employees</option>
                <option>201-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center mb-4">
                  <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-lg object-cover mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(company.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">{company.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Industry:</span> {company.industry}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Size:</span> {company.size}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {company.location}
                  </p>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{company.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">{company.jobs} open positions</span>
                  <button
                    onClick={() => window.location.href = `/companies/${company.id}`}
                    className="btn btn-primary text-sm"
                  >
                    View Jobs
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn btn-secondary px-8 py-3">
              Load More Companies
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
