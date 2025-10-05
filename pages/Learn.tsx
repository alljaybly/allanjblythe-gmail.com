import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Code } from 'lucide-react';

const MotionDiv = motion.div;

const LearnCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <MotionDiv
        className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-cosmic-blue/10 text-cosmic-blue">
                {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="text-slate-600 dark:text-slate-300 space-y-2">
            {children}
        </div>
    </MotionDiv>
);

const Learn = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-black tracking-tight mb-2">Learn About Baseline</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                    Understand the "why" behind this tool and how Baseline helps create a more interoperable web.
                </p>
            </div>

            <div className="space-y-8">
                <LearnCard icon={<BookOpen size={24} />} title="What is Baseline?">
                    <p>
                        Baseline is a project by Google that aims to clarify which web platform features are safe to use across major browsers. When a feature is part of Baseline, it means it has reached a stable and interoperable state.
                    </p>
                    <p>
                        This provides a clear signal to developers that they can adopt these features without worrying about complex compatibility issues, prefixes, or polyfills for the majority of their users.
                    </p>
                </LearnCard>

                <LearnCard icon={<CheckCircle size={24} />} title="Feature Availability Status">
                    <p>
                        This tool uses the data from the Web Platform Dashboard and categorizes features into three main statuses:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li>
                            <strong className="text-green-600 dark:text-green-400">Widely Available:</strong> The feature has been supported across all major browser engines for at least 30 months. This is the gold standard for stability.
                        </li>
                        <li>
                            <strong className="text-blue-600 dark:text-blue-400">Newly Available:</strong> The feature is now supported in all major browsers, but it's new. It's generally safe to use, but you might want to check caniuse.com for specific version support if you need to support older browsers.
                        </li>
                        <li>
                            <strong className="text-orange-600 dark:text-orange-400">Limited Availability:</strong> The feature is NOT supported in one or more major browsers. Using it in production will exclude a significant portion of users unless you provide fallbacks or polyfills.
                        </li>
                    </ul>
                </LearnCard>

                <LearnCard icon={<Code size={24} />} title="How Baseline Scout Helps">
                    <p>
                        Baseline Feature Scout is designed to make it easy to align your projects with the Baseline standard.
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li>
                            <strong>AI Chat:</strong> Get quick, context-aware answers about any web feature's status.
                        </li>
                        <li>
                            <strong>Project Scanner:</strong> Get a comprehensive audit of your codebase to see how it aligns with Baseline, identifying any features with limited support.
                        </li>
                        <li>
                            <strong>Export Tools:</strong> Integrate Baseline checks directly into your development workflow with tools like ESLint and GitHub Actions.
                        </li>
                    </ul>
                </LearnCard>
            </div>

            <div className="text-center pt-8">
                 <a
                    href="https://web.dev/baseline"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-cosmic-blue/30"
                >
                    Read the official Baseline documentation
                </a>
            </div>
        </div>
    );
};

export default Learn;
