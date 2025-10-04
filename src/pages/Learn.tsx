import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { useThemeStore } from '../store/themeStore';
import { useEditorSettingsStore } from '../store/editorSettingsStore';
import { Check, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { scanCss, scanHtml, scanJavaScript } from '../services/codeScanner';
import { useDashboardAPI } from '../hooks/useDashboardAPI';
import { BaselineStatus } from '../types';
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
    
    const tutorial = tutorials[selectedTutorialIndex];
    const step = tutorial.steps[currentStepIndex];
    
    const [code, setCode] = useState(step.code);
    const [isCompleted, setIsCompleted] = useState(false);
    
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<any>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const lastWidthRef = useRef(0);


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

    const handleEditorChange = (value?: string) => {
        const newCode = value || '';
        setCode(newCode);
        setIsCompleted(step.validate(newCode));
        debouncedValidate(newCode);
    };

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        validateCode(editor.getValue());
    };
    
    // Definitive fix for ResizeObserver loop
    useEffect(() => {
        const container = editorContainerRef.current;
        if (!container) return;

        const handleResize = debounce(() => {
            window.requestAnimationFrame(() => {
                const editor = editorRef.current;
                const currentContainer = editorContainerRef.current;
                if (editor && currentContainer) {
                    const newWidth = currentContainer.getBoundingClientRect().width;
                    // Guard: only layout if size changed significantly
                    if (Math.abs(newWidth - lastWidthRef.current) > 5) {
                        editor.layout();
                        lastWidthRef.current = newWidth;
                    }
                }
            });
        }, 100);

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            handleResize.cancel();
        };
    }, []); // Empty dependency array ensures this runs only once on mount.


    useEffect(() => {
        const newStep = tutorials[selectedTutorialIndex].steps[currentStepIndex];
        setCode(newStep.code);
        setIsCompleted(false);
        if (editorRef.current && monacoRef.current) {
            monacoRef.current.editor.setModelMarkers(editorRef.current.getModel(), 'baseline-scout', []);
            setTimeout(() => validateCode(newStep.code), 100);
        }
    }, [selectedTutorialIndex, currentStepIndex, validateCode]);
    
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
                <div className="lg:col-span-1 space-y-4">
                     <h2 className="text-xl font-bold">Tutorials</h2>
                    {tutorials.map((tut, index) => (
                        <button key={tut.featureId} onClick={() => { setSelectedTutorialIndex(index); setCurrentStepIndex(0); }}
                         className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedTutorialIndex === index ? 'bg-cosmic-blue/10 border-cosmic-blue ring-2 ring-cosmic-blue' : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border hover:border-cosmic-blue/50'}`}
                        >
                            <h3 className="font-semibold">{tut.title}</h3>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-2 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
                    <div className="p-6 border-b border-light-border dark:border-dark-border">
                        <h3 className="text-lg font-bold">{step.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{step.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 h-[500px]">
                        <div ref={editorContainerRef} className="h-full w-full relative min-w-[300px] overflow-hidden">
                             <EditorSettings />
                             <MonacoEditor
                                height="100%"
                                language={tutorial.language}
                                theme={syncTheme ? (theme === 'dark' ? 'vs-dark' : 'light') : 'light'}
                                value={code}
                                onChange={handleEditorChange}
                                onMount={handleEditorMount}
                                options={{ 
                                    minimap: { enabled: false }, 
                                    fontSize, 
                                    wordWrap,
                                    automaticLayout: false, // Important: disable automatic layout
                                }}
                            />
                        </div>
                        <div className="h-full w-full border-l border-light-border dark:border-dark-border min-w-[300px] overflow-hidden">
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