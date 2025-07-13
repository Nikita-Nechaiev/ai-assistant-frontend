import React from 'react';

import { renderHook, act } from '@testing-library/react';

import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';

import useDocumentData from '../useDocumentData';

/* ─────────── fake Socket impl ─────────── */
class MockSocket {
  emit = jest.fn();

  private listeners: Record<string, ((...a: any[]) => void)[]> = {};

  on = jest.fn((ev: string, cb: (...a: any[]) => void) => {
    (this.listeners[ev] ??= []).push(cb);
  });

  off = jest.fn();

  trigger(ev: string, ...args: any[]) {
    this.listeners[ev]?.forEach((cb) => cb(...args));
  }
}

/* ─────────── lockBodyScroll spy ─────────── */
const lockSpy = jest.fn();

jest.mock('@/helpers/scrollLock', () => ({
  lockBodyScroll: (...a: any[]) => lockSpy(...a),
}));

/* ─────────── minimal stubs ─────────── */
const doc = (id = 1) => ({ id, name: `Doc${id}` }) as any;
const ver = (id: number, dId: number) => ({ id, document: { id: dId } }) as any;
const usage = (dId: number) => ({ id: 99, document: { id: dId }, result: 'ok', user: { id: 1 } }) as any;

/* ─────────── wrapper providing SessionContext ─────────── */
const withCtx = (socket: MockSocket, children: React.ReactNode) => (
  <SessionContext.Provider value={{ socket: socket as any, sessionId: 123 }}>{children}</SessionContext.Provider>
);

describe('useDocumentData', () => {
  let socket: MockSocket;
  const documentId = 42;

  beforeEach(() => {
    jest.clearAllMocks();
    socket = new MockSocket();
  });

  it('emits initial get* events on mount', () => {
    renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    expect(socket.emit).toHaveBeenCalledWith('getDocument', { documentId });
    expect(socket.emit).toHaveBeenCalledWith('getVersions', { documentId });
    expect(socket.emit).toHaveBeenCalledWith('getDocumentAiUsage', { documentId });
  });

  it('sets currentDocument on documentData', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => socket.trigger('documentData', doc(documentId)));
    expect(result.current.currentDocument?.id).toBe(documentId);
  });

  it('filters versions and prepends on versionCreated', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => socket.trigger('versionsData', [ver(1, documentId), ver(2, 999)]));
    expect(result.current.versions.map((v) => v.id)).toEqual([1]);

    act(() => socket.trigger('versionCreated', ver(5, documentId)));
    expect(result.current.versions.map((v) => v.id)).toEqual([5, 1]);
  });

  it('handles AI usage list + creation event', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => socket.trigger('documentAiUsage', [usage(documentId), usage(999)]));
    expect(result.current.aiUsageList.length).toBe(1);

    act(() => socket.trigger('documentAiUsageCreated', usage(documentId)));
    expect(lockSpy).toHaveBeenCalled();
    expect(result.current.aiUsageList.length).toBe(2);
    expect(result.current.newAiUsage?.id).toBe(99);
    expect(result.current.isFetchingAI).toBe(false);
  });

  it('createDocumentAiUsage emits and toggles isFetchingAI', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() =>
      result.current.actions.createDocumentAiUsage({
        toolName: 'rewrite',
        text: 'hi',
      }),
    );

    expect(result.current.isFetchingAI).toBe(true);
    expect(socket.emit).toHaveBeenCalledWith('createDocumentAiUsage', {
      toolName: 'rewrite',
      text: 'hi',
      documentId,
    });
  });
});
