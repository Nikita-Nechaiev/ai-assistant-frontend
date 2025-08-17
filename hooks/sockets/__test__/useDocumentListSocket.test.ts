import { renderHook, act } from '@testing-library/react';

import { useDocumentListSocket } from '../useDocumentListSocket';

class MockSocket {
  private listeners: Record<string, ((...a: any[]) => void)[]> = {};

  on = jest.fn((ev: string, cb: (...a: any[]) => void) => {
    (this.listeners[ev] ??= []).push(cb);
  });

  off = jest.fn();

  emit = jest.fn();

  trigger(ev: string, ...args: any[]) {
    this.listeners[ev]?.forEach((cb) => cb(...args));
  }
}

const doc = (id: number, title = `Doc ${id}`) => ({ id, title }) as any;

describe('useDocumentListSocket', () => {
  let socket: MockSocket;
  const sessionId = 42;

  beforeEach(() => {
    jest.clearAllMocks();
    socket = new MockSocket();
  });

  it('emits getSessionDocuments on mount and sets initial list', () => {
    const { result } = renderHook(() => useDocumentListSocket({ sessionId, socket: socket as any }));

    expect(socket.emit).toHaveBeenCalledWith('getSessionDocuments', {
      sessionId,
    });

    const docs = [doc(1), doc(2)];

    act(() => socket.trigger('sessionDocuments', docs));
    expect(result.current.documents).toEqual(docs);
  });

  it('prepends on create / duplicate / lastEdited / update', () => {
    const { result } = renderHook(() => useDocumentListSocket({ sessionId, socket: socket as any }));

    act(() => socket.trigger('sessionDocuments', [doc(1), doc(2)]));
    act(() => socket.trigger('documentCreated', doc(3)));
    expect(result.current.documents.map((d) => d.id)).toEqual([3, 1, 2]);

    act(() => socket.trigger('documentUpdated', doc(2, 'Renamed')));
    expect(result.current.documents[0]).toMatchObject({ id: 2, title: 'Renamed' });
  });

  it('removes on documentDeleted', () => {
    const { result } = renderHook(() => useDocumentListSocket({ sessionId, socket: socket as any }));

    act(() => socket.trigger('sessionDocuments', [doc(1), doc(2)]));
    act(() => socket.trigger('documentDeleted', { documentId: 1 }));
    expect(result.current.documents.map((d) => d.id)).toEqual([2]);
  });

  it('helper methods emit correct payloads', () => {
    const { result } = renderHook(() => useDocumentListSocket({ sessionId, socket: socket as any }));

    act(() => result.current.createDocument('New'));
    expect(socket.emit).toHaveBeenCalledWith('createDocument', { title: 'New' });

    act(() => result.current.changeDocumentTitle(5, 'New title'));
    expect(socket.emit).toHaveBeenCalledWith('changeDocumentTitle', {
      documentId: 5,
      newTitle: 'New title',
    });
  });
});
