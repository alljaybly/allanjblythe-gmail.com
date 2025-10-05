import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, XCircle, FileText, ChevronDown, ClipboardCopy, ClipboardCheck, Filter, ArrowUpDown } from 'lucide-react';
import { ScanResult, ScanIssue, BaselineStatus, Priority } from '../types';
import FeatureBadge from './FeatureBadge';
import { useScanStore } from '../store/scanStore';
import Tooltip from './Tooltip';

// FIX: Assign motion components to variables to help with type inference.
const MotionDiv = motion.div;
const MotionCircle = motion.circle;

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
                <MotionCircle
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

const CodeSnippetView: React.FC<{ issue: ScanIssue, fileContents: Map<string, string> | null }> = ({ issue, fileContents }) => {
    const content = fileContents?.get(issue.file);
    if (!content) {
        return <div className="p-4 text-xs text-slate-500">Could not load code snippet.</div>;
    }

    const lines = content.split('\n');
    const issueLineIndex = issue.line - 1;
    const startLine = Math.max(0, issueLineIndex - 2);
    const endLine = Math.min(lines.length - 1, issueLineIndex + 2);

    const snippetLines = lines.slice(startLine, endLine + 1);

    return (
        <div className="bg-dark-card p-4">
            <pre className="text-xs text-slate-300 overflow-x-auto">
                {snippetLines.map((line, index) => {
                    const currentLineNumber = startLine + index + 1;
                    const isIssueLine = currentLineNumber === issue.line;
                    return (
                        <div key={index} className={`flex ${isIssueLine ? 'bg-cosmic-orange/10' : ''}`}>
                            <span className={`w-12 inline-block text-right pr-4 ${isIssueLine ? 'text-cosmic-orange' : 'text-slate-500'}`}>
                                {currentLineNumber}
                            </span>
                            <code className="whitespace-pre">{line}</code>
                        </div>
                    );
                })}
            </pre>
        </div>
    );
};


const IssuesTable = ({ issuesWithIndex, fileContents, onPriorityChange }: { issuesWithIndex: {issue: ScanIssue, originalIndex: number}[], fileContents: Map<string, string> | null, onPriorityChange: (index: number, priority: Priority) => void }) => {
    const [openFile, setOpenFile] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [expandedIssueKey, setExpandedIssueKey] = useState<string | null>(null);


    const handleCopy = async (e: React.MouseEvent, issue: ScanIssue) => {
        e.stopPropagation(); // Prevent row from expanding
        if (!fileContents) return;
        const content = fileContents.get(issue.file);
        if (!content) return;

        const lines = content.split('\n');
        const codeSnippet = lines[issue.line - 1];
        if (!codeSnippet) return;

        try {
            await navigator.clipboard.writeText(codeSnippet.trim());
            const key = `${issue.file}-${issue.line}`;
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error('Failed to copy code snippet:', err);
            alert('Could not copy to clipboard. Your browser might not support this feature or permissions may be denied.');
        }
    };
    
    const groupedIssues = issuesWithIndex.reduce((acc, item) => {
        const { issue } = item;
        if (!acc[issue.file]) {
            acc[issue.file] = [];
        }
        acc[issue.file].push(item);
        return acc;
    }, {} as Record<string, {issue: ScanIssue, originalIndex: number}[]>);

    const toggleFile = (file: string) => {
        setOpenFile(openFile === file ? null : file);
    };

    if (issuesWithIndex.length === 0) {
        return (
            <div className="text-center p-8 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="mx-auto text-green-500" size={48} />
                <h3 className="mt-4 text-xl font-semibold">No Compatibility Issues Found!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your project seems to be using features that are widely available. Great job!</p>
            </div>
        );
    }
    
    const priorityClasses: Record<Priority, string> = {
        [Priority.High]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800 focus:ring-red-500',
        [Priority.Medium]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800 focus:ring-yellow-500',
        [Priority.Low]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600 focus:ring-gray-500',
    };

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
                        <MotionDiv
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-light-border dark:border-dark-border">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-dark-card">
                                        <tr>
                                            <th scope="col" className="w-12 px-4 py-3"></th>
                                            <th scope="col" className="px-6 py-3">Line</th>
                                            <th scope="col" className="px-6 py-3">Feature</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3">Priority</th>
                                            <th scope="col" className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fileIssues.map(({issue, originalIndex}) => {
                                            const key = `${originalIndex}`;
                                            const isExpanded = expandedIssueKey === key;
                                            return (
                                            <React.Fragment key={key}>
                                                <tr 
                                                    className="border-b last:border-b-0 border-light-border dark:border-dark-border cursor-pointer hover:bg-slate-200/50 dark:hover:bg-dark-border/50"
                                                    onClick={() => setExpandedIssueKey(isExpanded ? null : key)}
                                                >
                                                    <td className="px-4 py-4 text-slate-400">
                                                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </td>
                                                    <td className="px-6 py-4 font-mono">{issue.line}:{issue.column}</td>
                                                    <td className="px-6 py-4 font-semibold">{issue.name}</td>
                                                    <td className="px-6 py-4"><FeatureBadge status={issue.status} /></td>
                                                    <td className="px-6 py-4">
                                                       <select
                                                            value={issue.priority}
                                                            onClick={(e) => e.stopPropagation()} // Prevent row click
                                                            onChange={(e) => onPriorityChange(originalIndex, e.target.value as Priority)}
                                                            className={`rounded-full py-1 px-3 border text-xs font-medium appearance-none focus:outline-none focus:ring-2 ${priorityClasses[issue.priority]}`}
                                                        >
                                                            <option value={Priority.High}>High</option>
                                                            <option value={Priority.Medium}>Medium</option>
                                                            <option value={Priority.Low}>Low</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Tooltip content="Copy code snippet" position="left">
                                                          <button
                                                              onClick={(e) => handleCopy(e, issue)}
                                                              className="flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-dark-border hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                                          >
                                                              {copiedKey === `${issue.file}-${issue.line}` ? (
                                                                  <>
                                                                      <ClipboardCheck size={14} className="text-green-500" /> Copied!
                                                                  </>
                                                              ) : (
                                                                   <>
                                                                      <ClipboardCopy size={14} /> Copy
                                                                  </>
                                                              )}
                                                          </button>
                                                        </Tooltip>
                                                    </td>
                                                </tr>
                                                <AnimatePresence>
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={6} className="p-0 border-b border-light-border dark:border-dark-border">
                                                            <MotionDiv
                                                                key="content"
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                className="overflow-hidden"
                                                            >
                                                                <CodeSnippetView issue={issue} fileContents={fileContents} />
                                                            </MotionDiv>
                                                        </td>
                                                    </tr>
                                                )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        </MotionDiv>
                    )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const ScanResultDashboard = ({ result }: { result: ScanResult }) => {
    const { fileContents, updateIssuePriority } = useScanStore();
    const [filterBy, setFilterBy] = useState<Priority | 'All'>('All');
    const [sortBy, setSortBy] = useState<'priority' | 'file'>('priority');

    const processedIssues = useMemo(() => {
        if (!result?.issues) return [];

        const issuesWithIndex = result.issues.map((issue, index) => ({ issue, originalIndex: index }));

        const filtered = filterBy === 'All'
            ? issuesWithIndex
            : issuesWithIndex.filter(({ issue }) => issue.priority === filterBy);
        
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { [Priority.High]: 0, [Priority.Medium]: 1, [Priority.Low]: 2 };
                return priorityOrder[a.issue.priority] - priorityOrder[b.issue.priority] || a.originalIndex - b.originalIndex;
            }
            if (sortBy === 'file') {
                return a.issue.file.localeCompare(b.issue.file) || a.issue.line - b.issue.line;
            }
            return 0;
        });
        
        return sorted;

    }, [result?.issues, filterBy, sortBy]);

    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
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
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Actionable Tasks</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Review, prioritize, and address features with limited compatibility.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-500" />
                        <span className="font-semibold text-sm">Filter by Priority:</span>
                        <div className="flex items-center gap-1 bg-light-bg dark:bg-dark-bg p-1 rounded-md">
                            {(['All', Priority.High, Priority.Medium, Priority.Low] as const).map(p => (
                                <button key={p} onClick={() => setFilterBy(p)} className={`px-3 py-1 text-xs rounded ${filterBy === p ? 'bg-cosmic-blue text-white shadow' : 'hover:bg-slate-200 dark:hover:bg-dark-border'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <ArrowUpDown size={16} className="text-slate-500" />
                        <label htmlFor="sort-by" className="font-semibold text-sm">Sort by:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'priority' | 'file')}
                            className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-cosmic-blue focus:outline-none"
                        >
                            <option value="priority">Priority</option>
                            <option value="file">File Path</option>
                        </select>
                    </div>
                </div>

                 <IssuesTable issuesWithIndex={processedIssues} fileContents={fileContents} onPriorityChange={updateIssuePriority} />
            </div>
        </MotionDiv>
    );
};

export default ScanResultDashboard;