import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, FileText, ChevronDown, ClipboardCopy, ClipboardCheck } from 'lucide-react';
import { ScanResult, ScanIssue, BaselineStatus } from '../types';
import FeatureBadge from './FeatureBadge';
import { useScanStore } from '../store/scanStore';

const ScoreCircle = ({ score }: { score: number }) => {
    const getScoreColor = () => {
        if (score >= 90) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-slate-200 dark:text-dark-border"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <motion.circle
                    className={getScoreColor()}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Score</span>
            </div>
        </div>
    );
};

const StatCard = ({ status, count, icon }: { status: BaselineStatus, count: number, icon: React.ReactNode }) => {
    const statusInfo = {
        [BaselineStatus.Widely]: { color: 'bg-green-500', title: 'Widely Available' },
        [BaselineStatus.Newly]: { color: 'bg-blue-500', title: 'Newly Available' },
        [BaselineStatus.Limited]: { color: 'bg-orange-500', title: 'Limited Availability' },
        [BaselineStatus.Unknown]: { color: 'bg-gray-500', title: 'Unknown' },
    };
    
    return (
        <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg flex items-center gap-4 border border-light-border dark:border-dark-border">
            <div className={`p-2 rounded-full text-white ${statusInfo[status].color}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{statusInfo[status].title}</p>
            </div>
        </div>
    );
};


const IssuesTable = ({ issues, fileContents }: { issues: ScanIssue[], fileContents: Map<string, string> | null }) => {
    const [openFile, setOpenFile] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopy = async (issue: ScanIssue, index: number) => {
        if (!fileContents) return;
        const content = fileContents.get(issue.file);
        if (!content) return;

        const lines = content.split('\n');
        const codeSnippet = lines[issue.line - 1];
        if (!codeSnippet) return;

        try {
            await navigator.clipboard.writeText(codeSnippet.trim());
            const key = `${issue.file}-${issue.line}-${index}`;
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error('Failed to copy code snippet:', err);
            alert('Could not copy to clipboard. Your browser might not support this feature or permissions may be denied.');
        }
    };
    
    const groupedIssues = issues.reduce((acc, issue) => {
        if (!acc[issue.file]) {
            acc[issue.file] = [];
        }
        acc[issue.file].push(issue);
        return acc;
    }, {} as Record<string, ScanIssue[]>);

    const toggleFile = (file: string) => {
        setOpenFile(openFile === file ? null : file);
    };

    if (issues.length === 0) {
        return (
            <div className="text-center p-8 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="mx-auto text-green-500" size={48} />
                <h3 className="mt-4 text-xl font-semibold">No Compatibility Issues Found!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your project seems to be using features that are widely available. Great job!</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-2">
            {Object.entries(groupedIssues).map(([file, fileIssues]) => (
                <div key={file} className="bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border">
                    <button onClick={() => toggleFile(file)} className="w-full flex justify-between items-center p-4 text-left">
                        <div className="flex items-center gap-2 font-mono text-sm">
                            <FileText size={16} />
                            {file}
                            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-dark-border">{fileIssues.length} issues</span>
                        </div>
                        <ChevronDown size={20} className={`transition-transform ${openFile === file ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                    {openFile === file && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-light-border dark:border-dark-border">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-dark-card">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Line</th>
                                            <th scope="col" className="px-6 py-3">Feature</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fileIssues.map((issue, index) => {
                                            const key = `${issue.file}-${issue.line}-${index}`;
                                            return (
                                            <tr key={key} className="border-b last:border-b-0 border-light-border dark:border-dark-border">
                                                <td className="px-6 py-4 font-mono">{issue.line}:{issue.column}</td>
                                                <td className="px-6 py-4 font-semibold">{issue.name}</td>
                                                <td className="px-6 py-4"><FeatureBadge status={issue.status} /></td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleCopy(issue, index)}
                                                        className="flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-dark-border hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                                        title="Copy code snippet"
                                                    >
                                                        {copiedKey === key ? (
                                                            <>
                                                                <ClipboardCheck size={14} className="text-green-500" /> Copied!
                                                            </>
                                                        ) : (
                                                             <>
                                                                <ClipboardCopy size={14} /> Copy
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const ScanResultDashboard = ({ result }: { result: ScanResult }) => {
    const { fileContents } = useScanStore();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 p-8 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border">
                <ScoreCircle score={result.score} />
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold">Project Scan Complete</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                        Your project has a Baseline Score of <span className="font-bold">{result.score}</span>. This score reflects the percentage of detected features that are widely or newly available.
                    </p>
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold mb-4 text-center">Feature Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard status={BaselineStatus.Widely} count={result.stats[BaselineStatus.Widely]} icon={<CheckCircle size={24} />} />
                    <StatCard status={BaselineStatus.Newly} count={result.stats[BaselineStatus.Newly]} icon={<Info size={24} />} />
                    <StatCard status={BaselineStatus.Limited} count={result.stats[BaselineStatus.Limited]} icon={<AlertTriangle size={24} />} />
                    <StatCard status={BaselineStatus.Unknown} count={result.stats[BaselineStatus.Unknown]} icon={<XCircle size={24} />} />
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold mb-4 text-center">Detected Issues</h2>
                 <IssuesTable issues={result.issues} fileContents={fileContents} />
            </div>
        </motion.div>
    );
};

export default ScanResultDashboard;