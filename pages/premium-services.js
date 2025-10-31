import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function PremiumServices() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('free') // 'free', 'basic', 'pro', 'enterprise'

  const router = useRouter()

  const premiumPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      period: 'month',
      description: 'Perfect for job seekers looking to enhance their profile',
      features: [
        'AI Profile Enhancement',
        'Priority Application Tracking',
        'Advanced Job Alerts',
        'Resume Review (1x/month)',
        'Interview Preparation Tips',
        'Basic Analytics Dashboard'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 19.99,
      period: 'month',
      description: 'Comprehensive tools for serious job seekers',
      features: [
        'Everything in Basic',
        'AI Interview Coach (unlimited)',
        'Resume Optimization (unlimited)',
        'Recruiter Direct Messaging',
        'Salary Negotiation Assistant',
        'Advanced Analytics & Insights',
        'Priority Customer Support',
        'Company Insights & Reviews'
      ],
      popular: true,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      period: 'month',
      description: 'For teams and organizations with advanced hiring needs',
      features: [
        'Everything in Professional',
        'Team Collaboration Tools',
        'Bulk Resume Processing',
        'Advanced Reporting & Analytics',
        'Custom Integration APIs',
        'Dedicated Account Manager',
        'White-label Solutions',
        'Priority Feature Requests'
      ],
      popular: false,
      color: 'green'
    }
  ]

  const premiumFeatures = [
    {
      icon: '🤖',
      title: 'AI Profile Enhancer',
      description: 'Get AI-powered suggestions to optimize your resume and profile for better visibility.',
      plan: 'Basic+'
    },
    {
      icon: '🎭',
      title: 'AI Interview Coach',
      description: 'Practice interviews with our AI coach that provides real-time feedback and tips.',
      plan: 'Pro+'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track your application success rates, profile views, and hiring trends.',
      plan: 'Basic+'
    },
    {
      icon: '💬',
      title: 'Recruiter Direct Access',
      description: 'Message recruiters directly and get noticed by top companies.',
      plan: 'Pro+'
    },
    {
      icon: '💰',
      title: 'Salary Insights',
      description: 'Get detailed salary information and negotiation strategies for your role.',
      plan: 'Pro+'
    },
    {
      icon: '🎯',
      title: 'Priority Matching',
      description: 'Get matched with jobs faster with our priority algorithm.',
      plan: 'Basic+'
    },
    {
      icon: '📈',
      title: 'Career Insights',
      description: 'Access industry reports, salary trends, and career development resources.',
      plan: 'Pro+'
    },
    {
      icon: '🛡️',
      title: 'Premium Support',
      description: 'Get priority customer support with faster response times.',
      plan: 'Basic+'
    }
  ]

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Fetch user data and current plan
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

        // Load current plan from localStorage
        const storedPlan = localStorage.getItem('currentPlan') || 'free'
        setCurrentPlan(storedPlan)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
  }

  const handleUpgrade = () => {
    if (selectedPlan) {
      // Simulate payment processing
      alert(`Upgrading to ${selectedPlan} plan...`)
      setCurrentPlan(selectedPlan)
      localStorage.setItem('currentPlan', selectedPlan)
      setSelectedPlan(null)
    }
  }

  const getPlanColor = (planId) => {
    const plan = premiumPlans.find(p => p.id === planId)
    return plan ? plan.color : 'gray'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Premium Services...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Premium Services - TrueHire</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/welcome" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              ← Back to Welcome
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ⭐ Premium Services
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Unlock advanced features and accelerate your career journey
            </p>
            {currentPlan !== 'free' && (
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <span className="text-lg mr-2">✓</span>
                Current Plan: {premiumPlans.find(p => p.id === currentPlan)?.name || 'Free'}
              </div>
            )}
          </div>

          {/* Current Plan Status */}
          {currentPlan !== 'free' && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Current Plan</h2>
                  <p className="text-gray-600">You're enjoying premium features with the {premiumPlans.find(p => p.id === currentPlan)?.name} plan</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${premiumPlans.find(p => p.id === currentPlan)?.price}</p>
                  <p className="text-gray-600">per {premiumPlans.find(p => p.id === currentPlan)?.period}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {premiumPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg border-2 p-6 relative ${
                  plan.popular ? 'border-purple-500' : 'border-gray-200'
                } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={currentPlan === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    currentPlan === plan.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : selectedPlan === plan.id
                      ? 'bg-blue-600 text-white'
                      : `bg-${plan.color}-600 text-white hover:bg-${plan.color}-700`
                  }`}
                >
                  {currentPlan === plan.id ? 'Current Plan' : selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Upgrade Section */}
          {selectedPlan && selectedPlan !== currentPlan && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Upgrade</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selected Plan:</span>
                      <span className="font-medium">{premiumPlans.find(p => p.id === selectedPlan)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Price:</span>
                      <span className="font-medium">${premiumPlans.find(p => p.id === selectedPlan)?.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing Cycle:</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="radio" name="payment" defaultChecked className="mr-3" />
                      <span>Credit Card **** **** **** 1234</span>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" name="payment" className="mr-3" />
                      <span>Add New Payment Method</span>
                    </div>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    className="w-full btn btn-primary mt-4"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Premium Features */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    feature.plan === 'Basic+' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {feature.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Our Premium Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Software Engineer',
                  plan: 'Professional',
                  quote: 'The AI Interview Coach helped me land my dream job. The personalized feedback was incredible!',
                  rating: 5
                },
                {
                  name: 'Mike Chen',
                  role: 'Product Manager',
                  plan: 'Basic',
                  quote: 'Premium analytics showed me exactly what was working in my job search. Game changer!',
                  rating: 5
                },
                {
                  name: 'Lisa Rodriguez',
                  role: 'UX Designer',
                  plan: 'Professional',
                  quote: 'The recruiter direct messaging feature got me interviews I never would have gotten otherwise.',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4 italic">"{testimonial.quote}"</blockquote>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-purple-600">{testimonial.plan} Plan</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  question: 'Can I cancel my premium subscription anytime?',
                  answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to premium features until the end of your billing period.'
                },
                {
                  question: 'Is there a free trial for premium features?',
                  answer: 'We offer a 7-day free trial for all premium plans. No credit card required to start your trial.'
                },
                {
                  question: 'Can I change my plan after upgrading?',
                  answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                },
                {
                  question: 'Do you offer refunds?',
                  answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with your premium subscription, contact our support team for a full refund.'
                },
                {
                  question: 'Are premium features available on mobile?',
                  answer: 'Yes, all premium features are fully available on our mobile app and responsive web interface.'
                }
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Have questions about premium services?</p>
            <button className="btn btn-secondary">
              Contact Premium Support
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
