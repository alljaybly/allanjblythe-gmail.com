// FIX: Add a triple-slash directive to include Vite client types for `import.meta.env`.
/// <reference types="vite/client" />

import { create } from 'zustand';
import { ChatMessage, MessageSender } from '../types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
}

const isApiConfigured = !!import.meta.env.VITE_GEMINI_API_KEY;

export const useChatStore = create<ChatState>((set) => ({
  messages: isApiConfigured
    ? [
        {
          sender: MessageSender.AI,
          text: "Hello! I'm Baseline Feature Scout. Ask me about any web feature, like 'Is CSS nesting safe to use?' or 'Tell me about the View Transitions API'.",
        },
      ]
    : [
        {
          sender: MessageSender.AI,
          text: "Welcome! The AI chat is currently disabled because the VITE_GEMINI_API_KEY is not configured. Please contact the site administrator.",
        },
      ],
  isLoading: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
}));