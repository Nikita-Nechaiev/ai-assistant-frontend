import type { IUserCollaborationSession } from '@/models/models';

import { useSessionStore } from '../useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ session: null });
  });

  it('initialises with a null session', () => {
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('setSession stores the given session object', () => {
    const mockSession = {
      id: 'sess-1',
      title: 'Unit-test demo',
    } as unknown as IUserCollaborationSession;

    useSessionStore.getState().setSession(mockSession);

    expect(useSessionStore.getState().session).toEqual(mockSession);
  });

  it('updateSession merges updates into the current session', () => {
    const baseSession = {
      id: 'sess-1',
      title: 'Original title',
    } as unknown as IUserCollaborationSession;

    useSessionStore.getState().setSession(baseSession);

    useSessionStore.getState().updateSession({ title: 'Renamed title' } as Partial<IUserCollaborationSession>);

    expect(useSessionStore.getState().session).toEqual({
      ...baseSession,
      title: 'Renamed title',
    });
  });

  it('updateSession is a no-op when no session is present', () => {
    useSessionStore.getState().updateSession({ title: 'Should not apply' } as Partial<IUserCollaborationSession>);
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('clearSession resets the store back to null', () => {
    const mockSession = { id: 'sess-1' } as unknown as IUserCollaborationSession;

    useSessionStore.getState().setSession(mockSession);

    useSessionStore.getState().clearSession();

    expect(useSessionStore.getState().session).toBeNull();
  });
});
