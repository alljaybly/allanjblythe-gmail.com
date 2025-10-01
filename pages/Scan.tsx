
import React, { useState, useCallback } from 'react';
import { useScanStore } from '../store/scanStore';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';
import ScanResultDashboard from '../components/ScanResultDashboard';
import { scanJavaScript, scanCss, scanHtml } from '../services/codeScanner';
import { ScanResult, ScanIssue, BaselineStatus } from '../types';
import { WEB_PLATFORM_DASHBOARD_API } from '../constants';
import { get as getFromCache, set as setInCache } from 'idb-keyval';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        webkitdirectory?: string;
        directory?: string;
    }
}

// In a real app, this would be fetched and cached
const getFeatureMap = async () => {
    const cacheKey = 'baseline-feature-map';
    try {
        const cached = await getFromCache(cacheKey);
        if (cached) return cached;
    } catch (e) {
        console.error("Failed to read feature map from cache", e);
    }
    
    // This is a simplified fetch, a real app might need pagination
    const res = await fetch(`${WEB_PLATFORM_DASHBOARD_API}/features`);
    const data = await res.json();
    
    const features = Array.isArray(data.features) ? data.features : [];
    
    try {
        await setInCache(cacheKey, features);
    } catch (e) {
        console.error("Failed to write feature map to cache", e);
    }
    
    return features;
};

const runScan = async (files: File[], onProgress: (p: number) => void): Promise<ScanResult> => {
    let allIssues: ScanIssue[] = [];
    const stats: ScanResult['stats'] = {
        [BaselineStatus.Widely]: 0,
        [BaselineStatus.Newly]: 0,
        [BaselineStatus.Limited]: 0,
        [BaselineStatus.Unknown]: 0,
    };

    const featureMap = await getFeatureMap() || [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        let issues: ScanIssue[] = [];

        if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
            issues = scanJavaScript(text, file.name, featureMap);
        } else if (file.name.endsWith('.css')) {
            issues = scanCss(text, file.name, featureMap);
        } else if (file.name.endsWith('.html')) {
            issues = scanHtml(text, file.name, featureMap);
        }
        
        issues.forEach(issue => {
            stats[issue.status]++;
        });
        allIssues = [...allIssues, ...issues];
        onProgress(Math.round(((i + 1) / files.length) * 100));
    }

    const totalFeatures = allIssues.length;
    const score = totalFeatures > 0 ? Math.round(((stats[BaselineStatus.Widely] + stats[BaselineStatus.Newly]) / totalFeatures) * 100) : 100;

    return {
        score,
        stats,
        issues: allIssues.sort((a,b) => a.file.localeCompare(b.file)),
    };
};

const Scan = () => {
    const { result, isScanning, progress, setResult, setScanning, setProgress } = useScanStore();
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
            const fileArray = Array.from(selectedFiles);
            const totalSize = fileArray.reduce((acc, file) => acc + file.size, 0);
            if (totalSize > 20 * 1024 * 1024) { // 20MB limit
                setError('Total project size cannot exceed 20MB.');
                return;
            }
            setError(null);
            setFiles(fileArray);
        }
    };

    const handleScan = async () => {
        if (files.length === 0) return;
        setScanning(true);
        setResult(null);
        setProgress(0);
        try {
            const scanResult = await runScan(files, setProgress);
            setResult(scanResult);
        } catch (e) {
            console.error("Scan failed:", e);
            setError("An unexpected error occurred during the scan.");
        }
        setScanning(false);
    };

    const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
        }
    }, []);

    if (result) {
        return (
            <div>
                <ScanResultDashboard result={result} />
                <button
                    onClick={() => { setResult(null); setFiles([]); }}
                    className="mt-8 px-6 py-2 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                    Scan Another Project
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-2">Project Scanner</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
                Get a "Baseline Score" for your project. Find out which modern features you're using and their browser support status.
            </p>

            <div
                onDragEnter={onDragEnter}
                onDragOver={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`p-10 border-2 border-dashed rounded-xl transition-colors ${isDragging ? 'border-cosmic-blue bg-cosmic-blue/10' : 'border-light-border dark:border-dark-border'}`}
            >
                <UploadCloud size={48} className="mx-auto text-slate-400 mb-4" />
                <h2 className="text-lg font-semibold">Drag & drop your project files here</h2>
                <p className="text-slate-500 dark:text-slate-400 my-2">or</p>
                <input
                    id="file-upload"
                    type="file"
                    multiple
                    webkitdirectory=""
                    directory=""
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                />
                <label htmlFor="file-upload" className="cursor-pointer text-cosmic-blue font-semibold hover:underline">
                    select a folder
                </label>
                <p className="text-xs text-slate-400 mt-4">
                    Max 20MB. All processing is done on your device. Your code never leaves your browser.
                </p>
            </div>
            
            {error && <p className="text-red-500 mt-4">{error}</p>}

            {files.length > 0 && (
                <div className="mt-8 text-left">
                    <h3 className="font-semibold mb-2">Selected Files ({files.length}):</h3>
                    <ul className="max-h-48 overflow-y-auto space-y-1 bg-light-bg dark:bg-dark-bg p-3 rounded-md border border-light-border dark:border-dark-border">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <FileText size={14} className="text-slate-500" />
                                    {file.webkitRelativePath || file.name}
                                </span>
                                <button onClick={() => setFiles(files.filter(f => f.name !== file.name))}>
                                    <X size={14} className="text-red-500" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {isScanning && (
                <div className="mt-8">
                    <p>Scanning... {progress}%</p>
                    <div className="w-full bg-slate-200 dark:bg-dark-border rounded-full h-2.5 mt-2">
                        <motion.div
                            className="bg-cosmic-blue h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                        />
                    </div>
                </div>
            )}


            <button
                onClick={handleScan}
                disabled={files.length === 0 || isScanning}
                className="mt-8 px-8 py-3 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
                {isScanning ? 'Scanning...' : 'Start Scan'}
            </button>
        </div>
    );
};

export default Scan;
