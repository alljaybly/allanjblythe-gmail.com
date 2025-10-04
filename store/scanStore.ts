import { create } from 'zustand';
import { ScanResult } from '../types';

interface ScanState {
  result: ScanResult | null;
  isScanning: boolean;
  progress: number;
  fileContents: Map<string, string> | null;
  setResult: (result: ScanResult | null) => void;
  setScanning: (isScanning: boolean) => void;
  setProgress: (progress: number) => void;
  setFileContents: (contents: Map<string, string> | null) => void;
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
}));
