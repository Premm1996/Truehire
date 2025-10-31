import { useEffect, useState } from 'react'

export default function Stats() {
  const [counters, setCounters] = useState({
    jobs: 0,
    companies: 0,
    candidates: 0,
    success: 0
  })

  const targets = {
    jobs: 12500,
    companies: 750,
    candidates: 50000,
    success: 94
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => ({
        jobs: prev.jobs < targets.jobs ? prev.jobs + 125 : targets.jobs,
        companies: prev.companies < targets.companies ? prev.companies + 7 : targets.companies,
        candidates: prev.candidates < targets.candidates ? prev.candidates + 500 : targets.candidates,
        success: prev.success < targets.success ? prev.success + 1 : targets.success
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      number: counters.jobs.toLocaleString(),
      label: 'Active Jobs',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )
    },
    {
      number: counters.companies.toLocaleString(),
      label: 'Partner Companies',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      )
    },
    {
      number: counters.candidates.toLocaleString(),
      label: 'Happy Candidates',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 8c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5 14.67 10 15.5 10zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
        </svg>
      )
    },
    {
      number: `${counters.success}%`,
      label: 'Success Rate',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
        </svg>
      )
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join a growing community of professionals and companies finding perfect matches every day
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="text-blue-600">
                  {stat.icon}
                </div>
              </div>
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
  )
}
