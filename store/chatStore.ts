
import { create } from 'zustand';
import { ChatMessage, MessageSender } from '../types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      sender: MessageSender.AI,
      text: "Hello! I'm Baseline Feature Scout. Ask me about any web feature, like 'Is CSS nesting safe to use?' or 'Tell me about the View Transitions API'.",
    }
  ],
  isLoading: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
