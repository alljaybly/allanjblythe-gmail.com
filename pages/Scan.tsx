import React, { useState, useCallback } from 'react';
import { useScanStore } from '../store/scanStore';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';
import ScanResultDashboard from '../components/ScanResultDashboard';
import { scanJavaScript, scanCss, scanHtml } from '../services/codeScanner';
import { ScanResult, ScanIssue, BaselineStatus } from '../types';
import { WEB_PLATFORM_DASHBOARD_API } from '../constants';
import { get as getFromCache, set as setInCache } from 'idb-keyval';
import Tooltip from '../components/Tooltip';

type StoredFile = {
    path: string;
    name: string;
    content: string;
};

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

const runScan = async (
    files: StoredFile[], 
    fileContents: Map<string, string>, 
    onProgress: (p: number) => void
): Promise<ScanResult> => {
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
        const filePath = file.path;
        const text = file.content;
        let issues: ScanIssue[] = [];

        if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
            issues = scanJavaScript(text, filePath, featureMap);
        } else if (file.name.endsWith('.css')) {
            issues = scanCss(text, filePath, featureMap);
        } else if (file.name.endsWith('.html')) {
            issues = scanHtml(text, filePath, featureMap);
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

// FIX: Assign motion.div to a variable to help with type inference.
const MotionDiv = motion.div;

const Scan = () => {
    const { result, isScanning, progress, setResult, setScanning, setProgress, setFileContents } = useScanStore();
    const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = useCallback(async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        
        const fileArray = Array.from(selectedFiles);
        const totalSize = fileArray.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > 20 * 1024 * 1024) { // 20MB limit
            setError('Total project size cannot exceed 20MB.');
            return;
        }
        
        setError(null);
        setIsProcessing(true);
        setStoredFiles([]);

        try {
            const filePromises = fileArray.map(async (file) => {
                const content = await file.text();
                return {
                    path: file.webkitRelativePath || file.name,
                    name: file.name,
                    content,
                };
            });

            const newStoredFiles = await Promise.all(filePromises);
            setStoredFiles(newStoredFiles);
        } catch (e) {
            console.error("Failed to read files:", e);
            setError("An error occurred while reading your project files. Please try again.");
            setStoredFiles([]);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleScan = async () => {
        if (storedFiles.length === 0) return;
        setScanning(true);
        setResult(null);
        setFileContents(null);
        setProgress(0);
        try {
            const fileContentsMap = new Map<string, string>();
            for (const file of storedFiles) {
                fileContentsMap.set(file.path, file.content);
            }

            const scanResult = await runScan(storedFiles, fileContentsMap, setProgress);
            setResult(scanResult);
            setFileContents(fileContentsMap);
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

    const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFileChange(e.dataTransfer.files);
        }
    }, [handleFileChange]);

    if (result) {
        return (
            <div>
                <ScanResultDashboard result={result} />
                <Tooltip content="Clear results and start a new scan">
                  <button
                      onClick={() => { 
                          setResult(null); 
                          setFileContents(null);
                          setStoredFiles([]); 
                      }}
                      className="mt-8 px-6 py-2 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                  >
                      Scan Another Project
                  </button>
                </Tooltip>
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
                <Tooltip content="Select your project folder to scan" position="bottom">
                  <label htmlFor="file-upload" className="cursor-pointer text-cosmic-blue font-semibold hover:underline">
                      select a folder
                  </label>
                </Tooltip>
                <p className="text-xs text-slate-400 mt-4">
                    Max 20MB. All processing is done on your device. Your code never leaves your browser.
                </p>
            </div>
            
            {isProcessing && (
                 <div className="mt-4">
                    <p className="text-slate-500 dark:text-slate-400">Processing project files...</p>
                </div>
            )}
            {error && <p className="text-red-500 mt-4">{error}</p>}

            {storedFiles.length > 0 && (
                <div className="mt-8 text-left">
                    <h3 className="font-semibold mb-2">Selected Files ({storedFiles.length}):</h3>
                    <ul className="max-h-48 overflow-y-auto space-y-1 bg-light-bg dark:bg-dark-bg p-3 rounded-md border border-light-border dark:border-dark-border">
                        {storedFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <FileText size={14} className="text-slate-500" />
                                    {file.path}
                                </span>
                                <Tooltip content="Remove this file" position="left">
                                  <button onClick={() => setStoredFiles(prev => prev.filter(f => f.path !== file.path))}>
                                      <X size={14} className="text-red-500" />
                                  </button>
                                </Tooltip>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {isScanning && (
                <div className="mt-8">
                    <p>Scanning... {progress}%</p>
                    <div className="w-full bg-slate-200 dark:bg-dark-border rounded-full h-2.5 mt-2">
                        <MotionDiv
                            className="bg-cosmic-blue h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                        />
                    </div>
                </div>
            )}

            <Tooltip content={storedFiles.length === 0 ? 'Please select a project folder first' : 'Begin scanning the selected files'}>
              <button
                  onClick={handleScan}
                  disabled={storedFiles.length === 0 || isScanning || isProcessing}
                  className="mt-8 px-8 py-3 bg-cosmic-blue text-white rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                  {isScanning ? 'Scanning...' : isProcessing ? 'Processing...' : 'Start Scan'}
              </button>
            </Tooltip>
        </div>
    );
};

export default Scan;
