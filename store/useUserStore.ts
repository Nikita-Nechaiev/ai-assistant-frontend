import { IUser } from '@/models/models';
import { create } from 'zustand';

type UserState = {
  user: IUser | null;
  setUser: (user: Partial<IUser>) => void;
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
  clearUser: () =>
    set({
      user: null,
    }),
}));
