import { create } from 'zustand';

type UserState = {
  id: number | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
  createdAt: string | null;
  roles: string[];
  setUser: (user: Partial<Omit<UserState, 'setUser' | 'clearUser'>>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  id: null,
  email: null,
  name: null,
  avatar: null,
  createdAt: null,
  roles: [],
  setUser: (user) => {
    return set((state) => ({
      ...state,
      ...user,
    }));
  },
  clearUser: () => {
    return set({
      id: null,
      email: null,
      name: null,
      avatar: null,
      createdAt: null,
      roles: [],
    });
  },
}));
