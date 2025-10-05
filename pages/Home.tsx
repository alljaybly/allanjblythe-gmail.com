import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Bot, CodeXml, FileCog, ArrowRight } from 'lucide-react';
import { useDashboardAPI } from '../hooks/useDashboardAPI';
import FeatureBadge from '../components/FeatureBadge';
import { BaselineStatus, DashboardFeature } from '../types';
import Tooltip from '../components/Tooltip';

// FIX: Assign motion.div to a variable to help with type inference.
const MotionDiv = motion.div;

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cosmic-blue to-cosmic-orange">
      {value}
    </p>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <MotionDiv 
    className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border"
    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cosmic-blue/10 text-cosmic-blue mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
  </MotionDiv>
);

const TrendingFeatures = () => {
    const { data: features, isLoading } = useDashboardAPI('/features?q=baseline_status:newly&sort=recent');
    const navigate = useNavigate();

    if (isLoading && !features) return <div className="text-center">Loading Trending Features...</div>;
    if (!features || features.length === 0) return null;

    return (
        <section>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">Hot off the Baseline</h2>
                <p className="max-w-lg mx-auto mt-2 text-slate-500 dark:text-slate-400">
                    Explore newly available features you can start using today.
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.isArray(features) && features.slice(0, 3).map((feature: DashboardFeature) => (
                    <MotionDiv
                        key={feature.identifier}
                        className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border cursor-pointer flex flex-col justify-between"
                        whileHover={{ y: -5, boxShadow: 'var(--tw-shadow-glow-blue)' }}
                        onClick={() => navigate(`/chat?q=${encodeURIComponent(feature.name)}`)}
                    >
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                                <FeatureBadge status={BaselineStatus.Newly} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                                {feature.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-cosmic-blue font-semibold text-sm">
                            Ask AI about this <ArrowRight size={16} />
                        </div>
                    </MotionDiv>
                ))}
            </div>
        </section>
    );
};


const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center pt-8 md:pt-16">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            Scout the Web's Future.
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cosmic-blue to-cosmic-orange mt-2">
              Instantly.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-300 md:text-xl">
            Stop guessing about browser compatibility. Get AI-powered, contextual advice using real-time Baseline data to build for tomorrow, today.
          </p>
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex items-center relative">
            <Search className="absolute left-4 text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Is Container Queries ready for production?'"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border focus:ring-2 focus:ring-cosmic-blue focus:outline-none"
            />
            <Tooltip content="Submit your question to the AI">
              <button type="submit" className="absolute right-2 px-4 py-1.5 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
                Ask AI
              </button>
            </Tooltip>
          </form>
          <div className="mt-8 flex justify-center gap-4">
            <Tooltip content="Go to the AI Chat page">
              <button
                onClick={() => navigate('/chat')}
                className="px-6 py-3 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-cosmic-blue/30"
              >
                Start Chat
              </button>
            </Tooltip>
            <Tooltip content="Go to the Project Scanner page">
              <button
                onClick={() => navigate('/scan')}
                className="px-6 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full font-semibold hover:bg-slate-100 dark:hover:bg-dark-border transition-colors"
              >
                Upload Project
              </button>
            </Tooltip>
          </div>
        </MotionDiv>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="1.2k+" label="Features Tracked" />
          <StatCard value="95%+" label="Widely Available" />
          <StatCard value="Real-time" label="Dashboard API" />
          <StatCard value="100%" label="Client-Side Privacy" />
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">A Developer's Complete Toolkit</h2>
          <p className="max-w-lg mx-auto mt-2 text-slate-500 dark:text-slate-400">
            From quick questions to full project audits and CI integration.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Bot size={24} />} 
            title="AI-Powered Chat"
            description="Ask natural language questions and get detailed reports on feature support, alternatives, and polyfills."
          />
          <FeatureCard 
            icon={<CodeXml size={24} />} 
            title="Project Scanner"
            description="Upload your codebase to get a 'Baseline Score', identifying features with limited browser support."
          />
          <FeatureCard 
            icon={<FileCog size={24} />}
            title="Instant Integrations"
            description="Export ESLint configurations, GitHub Actions, and other tooling snippets with one click."
          />
        </div>
      </section>
      
      <TrendingFeatures />
    </div>
  );
};

export default Home;
