export default function Testimonials() {
  const testimonials = [
    {
      name: "Prem M",
      role: "Software Engineer",
      company: "TrueRize",
      image: "/images/prem.png.jpg",
      content: "TrueHire helped me find my dream job in just 2 weeks! The AI matching was incredibly accurate and saved me so much time.",
      rating: 5
    },
    {
      name: "John Doe",
      role: "Software Engineer",
      company: "TechCorp",
      image: "/images/john.png.jpg",
      content: "As a hiring manager, TrueHire has transformed our recruitment process. We found top talent 3x faster than traditional methods.",
      rating: 5
    },
    {
      name: "Sabarinathan",
      role: "Trainee Software Engineer",
      company: "TrueRize",
      image: "/images/sabari.png.jpg",
      content: "The platform is intuitive and the job recommendations are spot-on. I landed a role that perfectly matches my skills and interests.",
      rating: 5
    }
  ]

  return (
    <section className="py-16 gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our <span className="text-gradient">Community</span> Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from professionals who found success with TrueHire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6 relative">
              {/* Quote icon */}
              <div className="absolute top-4 right-4 text-slate-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                {testimonial.image.startsWith('/images/') ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.image}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Ready to join thousands of successful professionals?</p>
          <button
            className="btn btn-primary px-8 py-3 text-lg font-semibold"
            onClick={() => {
              const searchSection = document.querySelector('.gradient-bg');
              if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  )
}
