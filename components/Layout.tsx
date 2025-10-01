
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Github, Moon, Sun, Menu, X } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { NAV_LINKS } from '../constants';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const NavLinks = () => (
    <>
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-cosmic-blue/20 text-cosmic-blue dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-card'
            }`
          }
          onClick={() => setIsMenuOpen(false)}
        >
          {link.name}
        </NavLink>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-light-border dark:border-dark-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
              <Code className="h-8 w-8 text-cosmic-blue" />
              <span className="text-xl font-bold tracking-tight">Baseline Scout</span>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLinks />
            </div>
          </div>
          <div className="flex items-center">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-card transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-card"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <NavLinks />
          </div>
        </motion.div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-light-bg dark:bg-dark-bg border-t border-light-border dark:border-dark-border mt-12">
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} Baseline Feature Scout. MIT License.</p>
      <p className="mt-1">
        A hackathon project for the Google/Devpost Baseline Tooling Hackathon.
      </p>
      <a
        href="https://github.com/your-repo/baseline-feature-scout" // Replace with actual repo URL
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-2 hover:text-cosmic-blue"
      >
        <Github size={16} />
        View on GitHub
      </a>
    </div>
  </footer>
);


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
