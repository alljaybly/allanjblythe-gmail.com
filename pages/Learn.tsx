import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { useThemeStore } from '../store/themeStore';
import { useEditorSettingsStore } from '../store/editorSettingsStore';
import { Check, ChevronLeft, ChevronRight, Settings, Search } from 'lucide-react';
import { scanCss, scanHtml, scanJavaScript } from '../services/codeScanner';
import { useDashboardAPI } from '../hooks/useDashboardAPI';
import { DashboardFeature, BaselineStatus } from '../types';
import { editor } from 'monaco-editor';
import { debounce } from 'lodash-es';


const tutorials = [
  {
    title: 'CSS Nesting',
    featureId: 'css-nesting',
    language: 'css',
    steps: [
      {
        title: 'Basic Nesting',
        description: 'Nest selectors to create more readable and modular CSS. Try nesting the `p` tag inside the `.card` selector.',
        code: `/* Style this card */\n\n.card {\n  background: lightblue;\n  padding: 1rem;\n\n  p {\n    color: darkblue;\n  }\n}`,
        validate: (code: string) => /\\.card\\s*{[^}]*p\\s*{/s.test(code),
      },
      {
        title: 'The `&` Selector',
        description: 'The `&` selector refers to the parent selector. Use it to style pseudo-classes like `:hover`.',
        code: `.card {\n  background: lightblue;\n  padding: 1rem;\n  transition: transform 0.2s;\n\n  &:hover {\n    transform: scale(1.05);\n  }\n}`,
        validate: (code: string) => code.includes('&:hover'),
      }
    ]
  },
  {
    title: 'Popover API',
    featureId: 'popover',
    language: 'html',
    steps: [
        {
            title: 'Creating a Popover',
            description: 'The `popover` attribute turns any element into a popover. Add the `popover` attribute to the `div`.',
            code: `<button popovertarget="my-popover">Toggle Popover</button>\n\n<div id="my-popover">\n  I am a popover!\n</div>\n\n<style>\n  [popover] { margin: auto; }\n</style>`,
            validate: (code: string) => /<div[^>]+popover/i.test(code),
        },
        {
            title: 'Styling with `:popover-open`',
            description: 'Use the `:popover-open` pseudo-class to style a popover when it is visible.',
            code: `<style>\n  [popover] {\n    border: 2px solid #0A84FF;\n    border-radius: 8px;\n  }\n  [popover]:popover-open {\n    box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n  }\n</style>\n\n<button popovertarget="my-popover">Toggle Popover</button>\n<div id="my-popover" popover>I am a popover!</div>`,
            validate: (code: string) => code.includes(':popover-open'),
        }
    ]
  }
];

const EditorSettings = () => {
    const { fontSize, wordWrap, syncTheme, setFontSize, setWordWrap, toggleSyncTheme } = useEditorSettingsStore();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="absolute top-2 right-2 z-20">
            <button
                onClick={() => setShowSettings(prev => !prev)}
                className="p-2 rounded-full bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm hover:bg-slate-200 dark:hover:bg-dark-border"
                aria-label="Editor Settings"
            >
                <Settings size={18} />
            </button>
            {showSettings && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-xl p-4 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <label htmlFor="font-size" className="text-sm font-medium">Font Size</label>
                        <input
                            type="number"
                            id="font-size"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-20 p-1 text-center rounded bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Word Wrap</label>
                        <button onClick={() => setWordWrap(wordWrap === 'on' ? 'off' : 'on')} className={`px-3 py-1 text-sm rounded-full transition-colors ${wordWrap === 'on' ? 'bg-cosmic-blue text-white' : 'bg-slate-200 dark:bg-dark-border'}`}>
                            {wordWrap === 'on' ? 'On' : 'Off'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Sync App Theme</label>
                        <button onClick={toggleSyncTheme} className={`px-3 py-1 text-sm rounded-full transition-colors ${syncTheme ? 'bg-cosmic-blue text-white' : 'bg-slate-200 dark:bg-dark-border'}`}>
                            {syncTheme ? 'On' : 'Off'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};


const Learn = () => {
    const { theme } = useThemeStore();
    const { fontSize, wordWrap, syncTheme } = useEditorSettingsStore();
    const [selectedTutorialIndex, setSelectedTutorialIndex] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const { data: featureMap } = useDashboardAPI('/features?limit=2000');
    const [searchTerm, setSearchTerm] = useState('');
    
    const tutorial = tutorials[selectedTutorialIndex];
    const step = tutorial.steps[currentStepIndex];
    
    const [code, setCode] = useState(step.code);
    const [isCompleted, setIsCompleted] = useState(false);
    
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<any>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const lastSize = useRef({ width: 0, height: 0 });

    const filteredTutorials = useMemo(() => {
        if (!searchTerm) {
            return tutorials;
        }
        return tutorials.filter(tut =>
            tut.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tut.featureId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Effect to adjust selection if the current tutorial is filtered out
    useEffect(() => {
        if (filteredTutorials.length > 0) {
            const currentTutorial = tutorials[selectedTutorialIndex];
            const isSelectedVisible = filteredTutorials.some(t => t.featureId === currentTutorial.featureId);

            if (!isSelectedVisible) {
                const firstFilteredInOriginalIndex = tutorials.findIndex(t => t.featureId === filteredTutorials[0].featureId);
                if (firstFilteredInOriginalIndex !== -1) {
                    setSelectedTutorialIndex(firstFilteredInOriginalIndex);
                    setCurrentStepIndex(0);
                }
            }
        }
    }, [searchTerm, filteredTutorials, selectedTutorialIndex]);


    const constructPreview = (htmlCode: string, cssCode: string, jsCode: string) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                <script>${jsCode}</script>
            </body>
            </html>
        `;
    };
    
    const previewContent = useMemo(() => {
        const lang = tutorial.language;
        return constructPreview(
            lang === 'html' ? code : '',
            lang === 'css' ? code : '',
            lang === 'javascript' ? code : ''
        )
    }, [code, tutorial.language]);

    const validateCode = useCallback((currentCode: string) => {
        if (!Array.isArray(featureMap) || !editorRef.current || !monacoRef.current) return;
        
        let issues = [];
        if (tutorial.language === 'css') {
            issues = scanCss(currentCode, 'style.css', featureMap);
        } else if (tutorial.language === 'html') {
            issues = scanHtml(currentCode, 'index.html', featureMap);
        } else if (tutorial.language === 'javascript') {
            issues = scanJavaScript(currentCode, 'script.js', featureMap);
        }

        const markers = issues
            .filter(issue => issue.status === BaselineStatus.Limited)
            .map(issue => ({
                startLineNumber: issue.line,
                startColumn: issue.column,
                endLineNumber: issue.line,
                endColumn: issue.column + issue.name.length,
                message: `${issue.name} has limited browser support.`,
                severity: monacoRef.current.MarkerSeverity.Warning,
            }));

        monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), 'baseline-scout', markers);
    }, [featureMap, tutorial.language]);

    const debouncedValidate = useCallback(debounce(validateCode, 500), [validateCode]);

    const handleEditorChange = useCallback((value?: string) => {
        const newCode = value || '';
        setCode(newCode);
        setIsCompleted(step.validate(newCode));
        debouncedValidate(newCode);
    }, [step, debouncedValidate]);

    const handleEditorMount: OnMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        console.info('Monaco web workers might be disabled in this environment; falling back to main thread.');
        // Initial validation
        validateCode(editor.getValue());
    }, [validateCode]);
    
    const editorOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize,
        wordWrap,
        automaticLayout: false, // CRITICAL: Disable automatic layout to prevent loops
    }), [fontSize, wordWrap]);

    useEffect(() => {
        const newStep = tutorials[selectedTutorialIndex].steps[currentStepIndex];
        setCode(newStep.code);
        setIsCompleted(false);
        // Clear markers on step change
        if (editorRef.current && monacoRef.current) {
            monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), 'baseline-scout', []);
            setTimeout(() => validateCode(newStep.code), 100);
        }
    }, [selectedTutorialIndex, currentStepIndex, validateCode]);

    // Definitive fix for ResizeObserver loop error
    useEffect(() => {
        const editor = editorRef.current;
        const container = editorContainerRef.current;
        if (!editor || !container) return;

        const handleResize = debounce(() => {
            const { width, height } = container.getBoundingClientRect();
            // Size guard: only layout if size changed significantly (>5px)
            if (Math.abs(width - lastSize.current.width) > 5 || Math.abs(height - lastSize.current.height) > 5) {
                lastSize.current = { width, height };
                // Defer layout call to next event loop tick to break the cycle
                setTimeout(() => {
                    editor.layout();
                }, 0);
            }
        }, 150);

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        
        // Initial layout call
        handleResize();

        return () => {
            resizeObserver.disconnect();
            handleResize.cancel();
        };
    }, []); // Empty dependency array ensures this runs only once on mount.
    
    const goToStep = (index: number) => {
        if(index >= 0 && index < tutorial.steps.length) {
            setCurrentStepIndex(index);
        }
    }

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-2">Learning Playground</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Get hands-on with modern web features through interactive tutorials with live validation.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Tutorial Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                     <h2 className="text-xl font-bold">Tutorials</h2>
                     <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search tutorials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-cosmic-blue focus:outline-none"
                        />
                    </div>
                    
                    {filteredTutorials.length > 0 ? (
                        filteredTutorials.map((tut) => {
                            const originalIndex = tutorials.findIndex(t => t.featureId === tut.featureId);
                            return (
                                <button
                                    key={tut.featureId}
                                    onClick={() => { setSelectedTutorialIndex(originalIndex); setCurrentStepIndex(0); }}
                                    className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedTutorialIndex === originalIndex ? 'bg-cosmic-blue/10 border-cosmic-blue ring-2 ring-cosmic-blue' : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:border-cosmic-blue/50'}`}
                                >
                                    <h3 className="font-semibold">{tut.title}</h3>
                                </button>
                            );
                        })
                    ) : (
                         <div className="text-center p-4 text-slate-500 dark:text-slate-400 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
                            <p>No tutorials found for "{searchTerm}".</p>
                        </div>
                    )}
                </div>

                {/* Editor & Instructions */}
                <div className="lg:col-span-2 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
                    <div className="p-6 border-b border-light-border dark:border-dark-border">
                        <h3 className="text-lg font-bold">{step.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{step.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 h-[500px]">
                        <div ref={editorContainerRef} className="h-full w-[99%] relative min-w-[300px] overflow-hidden">
                             <EditorSettings />
                             <MonacoEditor
                                height="100%"
                                language={tutorial.language}
                                theme={syncTheme ? (theme === 'dark' ? 'vs-dark' : 'light') : 'light'}
                                value={code}
                                onChange={handleEditorChange}
                                onMount={handleEditorMount}
                                options={editorOptions}
                            />
                        </div>
                        <div className="h-full w-[99%] border-l border-light-border dark:border-dark-border">
                            <iframe
                                srcDoc={previewContent}
                                title="Live Preview"
                                sandbox="allow-scripts"
                                className="w-full h-full bg-white"
                            />
                        </div>
                    </div>
                    
                    <div className="p-4 bg-light-bg dark:bg-dark-bg/50 flex justify-between items-center border-t border-light-border dark:border-dark-border">
                        <button onClick={() => goToStep(currentStepIndex - 1)} disabled={currentStepIndex === 0} className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-dark-border rounded-md font-semibold disabled:opacity-50">
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <div className="flex items-center gap-4">
                            {tutorial.steps.map((_, i) => (
                                <button key={i} onClick={() => goToStep(i)} className={`h-2.5 w-2.5 rounded-full transition-colors ${i === currentStepIndex ? 'bg-cosmic-blue' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`}></button>
                            ))}
                        </div>
                        <button onClick={() => goToStep(currentStepIndex + 1)} disabled={!isCompleted || currentStepIndex === tutorial.steps.length - 1} className="flex items-center gap-2 px-4 py-2 bg-cosmic-blue text-white rounded-md font-semibold disabled:opacity-50">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                     <motion.div 
                        initial={false}
                        animate={isCompleted ? 'visible' : 'hidden'}
                        variants={{
                            visible: { opacity: 1, height: 'auto', marginTop: '1rem' },
                            hidden: { opacity: 0, height: 0, marginTop: '0rem' },
                        }}
                        className="p-4 border-t border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 flex items-center gap-2 text-sm">
                       <Check size={16} /> Well done! You've completed this step.
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Learn;