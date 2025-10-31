import Link from 'next/link'

export default function FeaturedJobs({ jobs = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <article
          key={job.id}
          className="card p-6 group"
        >
          <div className="flex items-start space-x-4 mb-4">
            {job.company === 'TechCorp' ? (
              <img src="/images/tech crop.png" alt={job.company} className="w-12 h-12 rounded-xl shadow-sm" />
            ) : job.company === 'InnoGroup' ? (
              <img src="/images/inno group.png" alt={job.company} className="w-12 h-12 rounded-xl shadow-sm" />
            ) : job.company === 'DesignCo' ? (
              <img src="/images/design co.png" alt={job.company} className="w-12 h-12 rounded-xl shadow-sm" />
            ) : job.company === 'DataLab' ? (
              <img src="/images/datalab.png" alt={job.company} className="w-12 h-12 rounded-xl shadow-sm" />
            ) : job.company === 'InfraWorks' ? (
              <img src="/images/infra works.png" alt={job.company} className="w-12 h-12 rounded-xl shadow-sm" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                {job.company[0]}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                <Link href={`/jobs/${job.id}`}>
                  {job.title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm font-medium">{job.company}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{job.location || 'Remote'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>{job.salary || '$50k - $80k'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                {job.level}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {job.type || 'Full-time'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Posted {job.posted || '2 days ago'}
            </div>
            <Link
              href={`/jobs/${job.id}`}
              className="btn btn-primary text-sm px-4 py-2 group-hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
