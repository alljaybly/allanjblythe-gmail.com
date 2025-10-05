import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor as EditorType } from 'monaco-editor';
import { useDebouncedResize } from '../hooks/useDebouncedResize';
import { useEditorSettingsStore } from '../../store/editorSettingsStore';
import { useThemeStore } from '../../store/themeStore';
import { Loader } from 'lucide-react';

interface MonacoEditorWrapperProps {
  language: string;
  value: string;
  onEditorMount: (editor: EditorType.IStandaloneCodeEditor) => void;
}

const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  language,
  value,
  onEditorMount,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorType.IStandaloneCodeEditor | null>(null);

  const { fontSize, wordWrap, syncTheme } = useEditorSettingsStore();
  const { theme: appTheme } = useThemeStore();
  const dimensions = useDebouncedResize(wrapperRef);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    onEditorMount(editor);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [dimensions]);

  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.updateOptions({
            fontSize,
            wordWrap,
        });
    }
  }, [fontSize, wordWrap]);
  
  const editorTheme = syncTheme ? (appTheme === 'dark' ? 'vs-dark' : 'light') : 'vs-dark';

  return (
    <div ref={wrapperRef} className="h-full w-full" aria-label="Code Editor">
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={value}
        onMount={handleEditorDidMount}
        theme={editorTheme}
        options={{
          fontSize,
          wordWrap,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly: true,
          domReadOnly: true,
        }}
        loading={<div className="flex h-full w-full items-center justify-center"><Loader className="animate-spin text-cosmic-blue" size={32} /></div>}
      />
    </div>
  );
};

export default MonacoEditorWrapper;
