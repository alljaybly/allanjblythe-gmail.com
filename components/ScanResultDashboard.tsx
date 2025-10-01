
import React from 'react';
import { ScanResult, BaselineStatus } from '../types';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, HelpCircle, Sparkles, FileText } from 'lucide-react';
import FeatureBadge from './FeatureBadge';

const statusDetails = {
    [BaselineStatus.Widely]: {
        icon: <CheckCircle className="text-green-500" />,
        color: 'bg-green-500',
    },
    [BaselineStatus.Newly]: {
        icon: <Sparkles className="text-blue-500" />,
        color: 'bg-blue-500',
    },
    [BaselineStatus.Limited]: {
        icon: <AlertTriangle className="text-orange-500" />,
        color: 'bg-orange-500',
    },
    [BaselineStatus.Unknown]: {
        icon: <HelpCircle className="text-gray-500" />,
        color: 'bg-gray-500',
    },
};

const ScoreCircle = ({ score }: { score: number }) => {
    const getColor = (s: number) => {
        if (s >= 90) return 'text-green-500';
        if (s >= 70) return 'text-blue-500';
        if (s >= 50) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
                <circle
                    className="text-slate-200 dark:text-dark-border"
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <circle
                    className={getColor(score)}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${score}, 100`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${getColor(score)}`}>{score}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Baseline Score</span>
            </div>
        </div>
    );
};

const BreakdownBar = ({ stats }: { stats: ScanResult['stats'] }) => {
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return null;
    
    return (
        <div>
            <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-dark-border my-4">
                {Object.entries(stats).map(([status, count]) => {
                    if (count === 0) return null;
                    const width = (count / total) * 100;
                    return (
                        <div
                            key={status}
                            className={`${statusDetails[status as BaselineStatus].color}`}
                            style={{ width: `${width}%` }}
                            title={`${status}: ${count}`}
                        />
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
                 {Object.entries(stats).map(([status, count]) => {
                    if (count === 0) return null;
                    return (
                        <div key={status} className="flex items-center gap-2 text-sm">
                            <span className={`w-3 h-3 rounded-full ${statusDetails[status as BaselineStatus].color}`} />
                            <span className="capitalize">{status}</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{count}</span>
                        </div>
                    );
                 })}
            </div>
        </div>
    );
};

interface ScanResultDashboardProps {
    result: ScanResult;
}

const ScanResultDashboard: React.FC<ScanResultDashboardProps> = ({ result }) => {
    const { score, stats, issues } = result;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Scan Complete</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Here's the Baseline compatibility report for your project.
                </p>
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-2 gap-8 items-center bg-light-card dark:bg-dark-card p-8 rounded-xl border border-light-border dark:border-dark-border">
                <div>
                    <h2 className="text-xl font-bold mb-4 text-center md:text-left">Project Score</h2>
                    <ScoreCircle score={score} />
                </div>
                <div className="space-y-4">
                     <h2 className="text-xl font-bold mb-4">Feature Breakdown</h2>
                    <BreakdownBar stats={stats} />
                </div>
            </div>
            
            {/* Details Table */}
            {issues.length > 0 && (
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
                    <h2 className="text-2xl font-bold mb-6">Detailed Report</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-light-bg dark:bg-dark-bg">
                                <tr>
                                    <th scope="col" className="px-6 py-3 rounded-l-lg">File Path</th>
                                    <th scope="col" className="px-6 py-3">Line</th>
                                    <th scope="col" className="px-6 py-3">Feature</th>
                                    <th scope="col" className="px-6 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map((issue, index) => (
                                    <tr key={`${issue.file}-${issue.line}-${index}`} className="border-b border-light-border dark:border-dark-border last:border-b-0">
                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                            <FileText size={16} className="text-slate-400" />
                                            {issue.file}
                                        </td>
                                        <td className="px-6 py-4">{issue.line}</td>
                                        <td className="px-6 py-4">{issue.name}</td>
                                        <td className="px-6 py-4">
                                            <FeatureBadge status={issue.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ScanResultDashboard;
