import { create } from 'zustand';

type User = {
  id: number | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
  createdAt: string | null;
  roles: string[];
};

type UserState = {
  user: User | null;
  setUser: (user: Partial<User>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null, // The entire user object
  setUser: (user) => {
    return set((state) => ({
      user: {
        ...(state.user || {
          id: null,
          email: null,
          name: null,
          avatar: null,
          createdAt: null,
          roles: [],
        }),
        ...user,
      },
    }));
  },
  clearUser: () => {
    return set({
      user: null,
    });
  },
}));
