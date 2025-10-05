import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardFeature } from '../types';
import FeatureBadge from './FeatureBadge';
import { mapApiStatusToBaselineStatus } from '../services/codeScanner';

interface FeatureDetailModalProps {
  feature: DashboardFeature;
  onClose: () => void;
}

// FIX: Assign motion.div to a variable to help with type inference.
const MotionDiv = motion.div;

const BrowserSupportIcon = ({ browser }: { browser: string }) => {
    const name = browser.toLowerCase();
    if (name.includes('chrome')) return <span title="Chrome">Cr</span>;
    if (name.includes('firefox')) return <span title="Firefox">Fx</span>;
    if (name.includes('safari')) return <span title="Safari">Sf</span>;
    if (name.includes('edge')) return <span title="Edge">Ed</span>;
    return <span title={browser}>{browser.substring(0, 2)}</span>;
};

const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({ feature, onClose }) => {
  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <MotionDiv
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-light-card dark:bg-dark-card w-full max-w-2xl max-h-[90vh] rounded-xl border border-light-border dark:border-dark-border shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="flex items-start justify-between p-6 border-b border-light-border dark:border-dark-border">
            <div>
              <h2 className="text-2xl font-bold">{feature.name}</h2>
              <div className="mt-2">
                <FeatureBadge status={mapApiStatusToBaselineStatus(feature)} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-dark-border transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </header>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
            
            {/* Browser Support */}
            {feature.browser_support && feature.browser_support.length > 0 && (
                <div>
                    <h3 className="font-semibold text-lg mb-3">Browser Support</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {feature.browser_support.map(support => (
                        <div key={support.browser} className="bg-light-bg dark:bg-dark-bg p-3 rounded-md border border-light-border dark:border-dark-border text-center">
                            <div className="font-bold text-sm h-6 w-6 mx-auto mb-2 rounded-full bg-slate-200 dark:bg-dark-border flex items-center justify-center">
                                <BrowserSupportIcon browser={support.browser} />
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{support.browser}</p>
                            {support.support.version_added ? (
                            <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1 mt-1">
                                <CheckCircle size={14} />
                                {typeof support.support.version_added === 'string' ? support.support.version_added : 'Yes'}
                            </p>
                            ) : (
                            <p className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1 mt-1">
                                <AlertCircle size={14} />
                                No
                            </p>
                            )}
                        </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Specifications */}
            {feature.specifications && feature.specifications.length > 0 && (
                 <div>
                    <h3 className="font-semibold text-lg mb-3">Specifications</h3>
                    <ul className="space-y-2">
                        {feature.specifications.map(spec => (
                            <li key={spec.url}>
                                <a href={spec.url} target="_blank" rel="noopener noreferrer" className="inline-block p-3 bg-light-bg dark:bg-dark-bg rounded-md border border-light-border dark:border-dark-border w-full hover:border-cosmic-blue transition-colors">
                                    <span className="font-medium text-cosmic-blue">{spec.name}</span>
                                    <span className="block text-xs text-slate-400 truncate">{spec.url}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default FeatureDetailModal;
