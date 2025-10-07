import React from 'react';
import { Link } from 'react-router-dom';
import { Database, BarChart3, Bot, Search, Zap, Shield } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Database,
      title: 'Comprehensive Database',
      description: 'Access thousands of material samples with detailed composition, thermal processing, and mechanical properties data.',
      color: 'bg-blue-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Visualize trends, correlations, and insights across different material systems and processing conditions.',
      color: 'bg-green-500'
    },
    {
      icon: Bot,
      title: 'AI-Powered Assistant',
      description: 'Get intelligent answers to complex materials science questions using our AI conversation interface.',
      color: 'bg-purple-500'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find materials by composition, properties, processing parameters, or any combination of criteria.',
      color: 'bg-orange-500'
    },
    {
      icon: Zap,
      title: 'Real-time Insights',
      description: 'Generate instant reports and comparisons to accelerate your R&D decision-making process.',
      color: 'bg-red-500'
    },
    {
      icon: Shield,
      title: 'Reliable Data',
      description: 'All data sourced from peer-reviewed publications with full traceability and quality assurance.',
      color: 'bg-indigo-500'
    }
  ];

  const stats = [
    { label: 'Material Samples', value: '10,000+' },
    { label: 'Research Papers', value: '2,500+' },
    { label: 'Unique Elements', value: '50+' },
    { label: 'Processing Methods', value: '200+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Materials Science
              <span className="block text-primary-200">Database Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto animate-slide-up">
              Comprehensive materials data with AI-powered insights for accelerated R&D
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/database"
                className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Explore Database
              </Link>
              <Link
                to="/ai-assistant"
                className="bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3 px-8 rounded-lg border border-primary-400 transition-colors duration-200"
              >
                Try AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Materials Research
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze, understand, and utilize materials data effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Accelerate Your Research?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join researchers worldwide who trust our platform for materials data analysis
          </p>
          <Link
            to="/database"
            className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;