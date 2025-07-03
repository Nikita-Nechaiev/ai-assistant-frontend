import { create } from 'zustand';

import { IUser } from '@/models/models';

type UserState = {
  user: IUser | null;
  setUser: (user: Partial<IUser>) => void;
  updateUser: (user: Partial<IUser>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => {
    return set((state) => ({
      user: {
        ...state.user,
        ...user,
        id: user.id ?? state.user?.id ?? 0,
        name: user.name ?? state.user?.name ?? '',
        email: user.email ?? state.user?.email ?? '',
        oauthProvider: user.oauthProvider ?? state.user?.oauthProvider ?? null,
        oauthId: user.oauthId ?? state.user?.oauthId ?? null,
        roles: user.roles ?? state.user?.roles ?? [],
        createdAt: user.createdAt ?? state.user?.createdAt ?? new Date(),
        avatar: user.avatar ?? state.user?.avatar ?? '',
      },
    }));
  },

  updateUser: (patch) =>
    set((state) => {
      if (!state.user) return state;

      const sanitizedPatch = Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ) as Partial<IUser>;

      return {
        user: {
          ...state.user,
          ...sanitizedPatch,
        },
      };
    }),

  clearUser: () =>
    set({
      user: null,
    }),
}));
