import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

const features = [
  {
    icon: '🎯',
    title: 'Traditional Retirement',
    description: 'Plan for a comfortable retirement at 60 with inflation-adjusted spending until life expectancy.'
  },
  {
    icon: '🔥',
    title: 'FIRE Planning',
    description: 'Achieve financial independence early using the Safe Withdrawal Rate method.'
  },
  {
    icon: '☕',
    title: 'Barista FIRE',
    description: 'Semi-retire early with part-time work while building your corpus.'
  },
  {
    icon: '🏖️',
    title: 'Coast FIRE',
    description: 'Calculate your coast number and let compound growth do the rest.'
  },
  {
    icon: '👑',
    title: 'Fat FIRE',
    description: 'FIRE with a higher lifestyle budget for those who want it all.'
  },
  {
    icon: '📊',
    title: 'Gap Analysis',
    description: 'Know exactly how much you need to save monthly to reach your goals.'
  },
]

const benefits = [
  {
    title: 'India-Focused',
    description: 'Built for Indian investors with EPF, PPF, NPS, and Lakh/Crore formatting.',
    icon: '🇮🇳'
  },
  {
    title: 'Multiple Goals',
    description: 'Track child education, marriage, car purchases, and custom buckets.',
    icon: '🎓'
  },
  {
    title: 'What-If Scenarios',
    description: 'Test different return rates, inflation, and SWR assumptions.',
    icon: '🔮'
  },
  {
    title: 'SIP Recommendations',
    description: 'Get precise monthly investment amounts with step-up options.',
    icon: '💰'
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-gray-900">NorthStar Finance</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full opacity-30 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-200 rounded-full opacity-30 blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-amber-200 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <span className="mr-2">✨</span>
              Free retirement planning for Indian couples
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Plan your retirement with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
                confidence
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Calculate your retirement corpus, track multiple goals, and get personalized SIP recommendations. 
              Supporting Traditional, FIRE, Barista, Coast, and Fat FIRE modes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="xl" className="shadow-lg shadow-indigo-500/30">
                  Start Planning Free
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Bank-level security
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                5,000+ couples planning
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% free
              </div>
            </div>
          </div>

          {/* Hero image/preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl p-2 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-white rounded-xl overflow-hidden">
                {/* Mock dashboard preview */}
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Retirement Dashboard</h3>
                      <p className="text-sm text-gray-500">Traditional Retirement Mode</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      On Track
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Target Corpus', value: '₹8.5 Cr', color: 'indigo' },
                      { label: 'Projected', value: '₹9.2 Cr', color: 'emerald' },
                      { label: 'Monthly SIP', value: '₹85,000', color: 'amber' },
                      { label: 'Years to Go', value: '25', color: 'purple' },
                    ].map((stat) => (
                      <div key={stat.label} className={`p-4 bg-${stat.color}-50 rounded-xl`}>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">📈 Corpus Growth Chart</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Choose your path to financial freedom
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're planning traditional retirement or pursuing FIRE, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Built for Indian investors
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Unlike generic calculators, NorthStar understands Indian financial instruments, 
                tax implications, and life goals.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl">
                      {benefit.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl transform rotate-3 opacity-10" />
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Sample Calculation</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Monthly expenses</span>
                    <span className="font-semibold">₹1,00,000</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Retirement age</span>
                    <span className="font-semibold">55 years</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Current savings</span>
                    <span className="font-semibold">₹50 L</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Expected return</span>
                    <span className="font-semibold">12% p.a.</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-900 font-medium">Required SIP</span>
                    <span className="text-2xl font-bold text-indigo-600">₹72,500/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start planning your future today
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of Indian couples who are taking control of their financial future.
          </p>
          <Link to="/auth">
            <Button size="xl" variant="secondary" className="shadow-lg">
              Create Free Account
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl">🎯</span>
              <span className="text-lg font-bold text-white">NorthStar Finance</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 NorthStar Finance. Plan with confidence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
