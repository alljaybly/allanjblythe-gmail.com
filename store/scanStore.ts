import { create } from 'zustand';
import { ScanResult, Priority } from '../types';

interface ScanState {
  result: ScanResult | null;
  isScanning: boolean;
  progress: number;
  fileContents: Map<string, string> | null;
  setResult: (result: ScanResult | null) => void;
  setScanning: (isScanning: boolean) => void;
  setProgress: (progress: number) => void;
  setFileContents: (contents: Map<string, string> | null) => void;
  updateIssuePriority: (issueIndex: number, priority: Priority) => void;
}

export const useScanStore = create<ScanState>((set) => ({
  result: null,
  isScanning: false,
  progress: 0,
  fileContents: null,
  setResult: (result) => set({ result }),
  setScanning: (isScanning) => set({ isScanning }),
  setProgress: (progress) => set({ progress }),
  setFileContents: (contents) => set({ fileContents: contents }),
  updateIssuePriority: (issueIndex, priority) =>
    set((state) => {
      if (!state.result) return {};
      const newIssues = [...state.result.issues];
      if (newIssues[issueIndex]) {
        newIssues[issueIndex] = { ...newIssues[issueIndex], priority };
      }
      return {
        result: {
          ...state.result,
          issues: newIssues,
        },
      };
    }),
}));
