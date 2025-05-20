import { create } from 'zustand';

import { IUserCollaborationSession } from '@/models/models';

interface SessionStoreState {
  session: IUserCollaborationSession | null;
  setSession: (session: IUserCollaborationSession) => void;
  updateSession: (updates: Partial<IUserCollaborationSession>) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  session: null,

  setSession: (session) => set({ session: session }),

  updateSession: (updates) =>
    set((state) => ({
      session: state.session ? { ...state.session, ...updates } : null,
    })),

  clearSession: () => set({ session: null }),
}));
