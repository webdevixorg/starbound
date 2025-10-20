import React from 'react';
import CareerForm from '@/components/Forms/CareerForm';

export default function CareerPage() {
  return (
    <>
      {/* Full Screen Layout */}
      <div className="w-full bg-gray-50 min-h-screen">
        {/* Hero Section - Full Width */}
        <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 lg:py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                <span className="block">Career</span>
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Opportunities
                </span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                Join our innovative team and help shape the future of technology
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold">Remote-First</div>
                  <div className="text-blue-200">Work from anywhere</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold">Growth-Focused</div>
                  <div className="text-blue-200">Continuous learning</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold">Innovation</div>
                  <div className="text-blue-200">Cutting-edge projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 lg:py-16">
            {/* Why Join Us Section */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Why Join Our Team?
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  We're always looking for talented individuals to join our
                  growing team. If you're passionate about technology and
                  innovation, we'd love to hear from you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    50+
                  </div>
                  <div className="text-gray-600">Team Members</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Diverse, talented professionals
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌍</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    Remote
                  </div>
                  <div className="text-gray-600">Work Options</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Flexible work arrangements
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    Growth
                  </div>
                  <div className="text-gray-600">Opportunities</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Career advancement paths
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    Innovation
                  </div>
                  <div className="text-gray-600">Culture</div>
                  <p className="text-sm text-gray-500 mt-2">
                    Cutting-edge technology
                  </p>
                </div>
              </div>

              {/* Benefits Grid */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 lg:p-12">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
                  What We Offer
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: '💰',
                      title: 'Competitive Salary',
                      desc: 'Market-leading compensation packages',
                    },
                    {
                      icon: '🏥',
                      title: 'Health Benefits',
                      desc: 'Comprehensive medical, dental, and vision',
                    },
                    {
                      icon: '🎓',
                      title: 'Learning Budget',
                      desc: '$2000 annual learning and development',
                    },
                    {
                      icon: '🏖️',
                      title: 'Unlimited PTO',
                      desc: 'Take time off when you need it',
                    },
                    {
                      icon: '💻',
                      title: 'Equipment',
                      desc: 'Top-tier hardware and software',
                    },
                    {
                      icon: '🚀',
                      title: 'Stock Options',
                      desc: 'Equity participation in company growth',
                    },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      <div className="text-2xl mb-2">{benefit.icon}</div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Form Section */}
            <CareerForm />
          </div>
        </div>
      </div>
    </>
  );
}
