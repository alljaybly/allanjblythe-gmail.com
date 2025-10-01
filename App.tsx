
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from './store/themeStore';

import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Scan from './pages/Scan';
import Export from './pages/Export';
import Learn from './pages/Learn';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/chat" element={<PageWrapper><Chat /></PageWrapper>} />
        <Route path="/scan" element={<PageWrapper><Scan /></PageWrapper>} />
        <Route path="/export" element={<PageWrapper><Export /></PageWrapper>} />
        <Route path="/learn" element={<PageWrapper><Learn /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HashRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </HashRouter>
  );
}

export default App;
