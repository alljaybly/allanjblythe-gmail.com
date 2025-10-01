
import { create } from 'zustand';
import { ScanResult } from '../types';

interface ScanState {
  result: ScanResult | null;
  isScanning: boolean;
  progress: number;
  setResult: (result: ScanResult | null) => void;
  setScanning: (isScanning: boolean) => void;
  setProgress: (progress: number) => void;
}

export const useScanStore = create<ScanState>((set) => ({
  result: null,
  isScanning: false,
  progress: 0,
  setResult: (result) => set({ result }),
  setScanning: (isScanning) => set({ isScanning }),
  setProgress: (progress) => set({ progress }),
}));
