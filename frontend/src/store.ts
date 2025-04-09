import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  apiKey: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  type: 'user' | 'llm';
}

interface Store {
  user: User | null;
  messages: Message[];
  setUser: (user: User | null) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  messages: [],
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
})); 