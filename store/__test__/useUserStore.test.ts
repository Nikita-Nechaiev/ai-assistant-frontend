import type { IUser } from '@/models/models';

import { useUserStore } from '../useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
  });

  it('initialises with user = null', () => {
    expect(useUserStore.getState().user).toBeNull();
  });

  it('setUser stores a full user object', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      oauthProvider: null,
      oauthId: null,
      roles: ['user'],
      createdAt: new Date('2023-01-01'),
      avatar: '',
    } as unknown as IUser;

    useUserStore.getState().setUser(mockUser);

    expect(useUserStore.getState().user).toEqual(mockUser);
  });

  it('setUser merges new fields without clobbering existing ones', () => {
    const first = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
    } as Partial<IUser>;

    const patch = {
      email: 'john.doe@example.com',
    } as Partial<IUser>;

    const { setUser } = useUserStore.getState();

    setUser(first);
    setUser(patch);

    const user = useUserStore.getState().user!;

    expect(user.email).toBe('john.doe@example.com');
    expect(user.name).toBe('John');
  });

  it('updateUser patches an existing user', () => {
    const base = {
      id: 2,
      name: 'Alice',
      email: 'alice@example.com',
    } as unknown as IUser;

    const { setUser, updateUser } = useUserStore.getState();

    setUser(base);
    updateUser({ name: 'Alice Cooper' });

    const updated = useUserStore.getState().user!;

    expect(updated.name).toBe('Alice Cooper');
    expect(updated.email).toBe('alice@example.com');
  });

  it('updateUser is a no-op when no user exists', () => {
    useUserStore.getState().updateUser({ name: 'Should not apply' });
    expect(useUserStore.getState().user).toBeNull();
  });

  it('clearUser resets the store back to null', () => {
    useUserStore.getState().setUser({ id: 3 } as unknown as IUser);
    useUserStore.getState().clearUser();
    expect(useUserStore.getState().user).toBeNull();
  });
});
