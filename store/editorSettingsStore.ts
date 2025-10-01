import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WordWrap = 'on' | 'off';

interface EditorSettingsState {
  fontSize: number;
  wordWrap: WordWrap;
  syncTheme: boolean;
  setFontSize: (size: number) => void;
  setWordWrap: (wrap: WordWrap) => void;
  toggleSyncTheme: () => void;
}

export const useEditorSettingsStore = create<EditorSettingsState>()(
  persist(
    (set) => ({
      fontSize: 14,
      wordWrap: 'on',
      syncTheme: true,
      setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(30, size)) }), // Clamp font size
      setWordWrap: (wrap) => set({ wordWrap: wrap }),
      toggleSyncTheme: () => set((state) => ({ syncTheme: !state.syncTheme })),
    }),
    {
      name: 'editor-settings-storage',
    }
  )
);
