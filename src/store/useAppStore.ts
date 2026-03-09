import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  setAuthenticated: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (status) => set({ isAuthenticated: status }),
}));