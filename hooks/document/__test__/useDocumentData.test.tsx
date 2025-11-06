import React from 'react';

import { renderHook, act } from '@testing-library/react';

import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';
import { SnackbarStatusEnum } from '@/models/enums';

import useDocumentData from '../useDocumentData';

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  prefetch: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

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

const lockSpy = jest.fn();

jest.mock('@/helpers/scrollLock', () => ({
  lockBodyScroll: (...a: any[]) => lockSpy(...a),
}));

const setSnackbar = jest.fn();

jest.mock('@/store/useSnackbarStore', () => () => ({ setSnackbar }));

const doc = (id = 1) => ({ id, name: `Doc${id}` }) as any;
const ver = (id: number, dId: number) => ({ id, document: { id: dId } }) as any;
const usage = (dId: number) => ({ id: 99, document: { id: dId }, result: 'ok', user: { id: 1 } }) as any;

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

  it('sets currentDocument on documentData / documentUpdated / lastEditedDocument', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => socket.trigger('documentData', doc(documentId)));
    expect(result.current.currentDocument?.id).toBe(documentId);

    act(() => socket.trigger('documentUpdated', doc(documentId)));
    expect(result.current.currentDocument?.id).toBe(documentId);

    act(() => socket.trigger('lastEditedDocument', doc(documentId)));
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

  it('handles AI usage list + creation event (positive and negative branches)', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => socket.trigger('documentAiUsage', [usage(documentId), usage(999)]));
    expect(result.current.aiUsageList.length).toBe(1);

    act(() => socket.trigger('documentAiUsageCreated', usage(999)));
    expect(result.current.aiUsageList.length).toBe(1);

    act(() => socket.trigger('documentAiUsageCreated', usage(documentId)));
    expect(lockSpy).toHaveBeenCalled();
    expect(result.current.aiUsageList.length).toBe(2);
    expect(result.current.newAiUsage?.id).toBe(99);
    expect(result.current.isFetchingAI).toBe(false);
  });

  it('createDocumentAiUsage emits and toggles isFetchingAI; error event clears it', () => {
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

    act(() => socket.trigger('error', 'oops'));
    expect(result.current.isFetchingAI).toBe(false);
  });

  it('documentDeleted shows warning toast and navigates only when ids match', () => {
    renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => socket.trigger('documentDeleted', { documentId: 999 }));
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(setSnackbar).not.toHaveBeenCalled();

    act(() => socket.trigger('documentDeleted', { documentId }));
    expect(setSnackbar).toHaveBeenCalledWith('Editor has deleted this document.', SnackbarStatusEnum.WARNING);
    expect(mockRouter.replace).toHaveBeenCalledWith('/session/123');
  });

  it('action emitters send correct payloads (title/content/version)', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => result.current.actions.changeDocumentTitle('  New Title   '));
    expect(socket.emit).toHaveBeenCalledWith('changeDocumentTitle', {
      documentId,
      newTitle: 'New Title',
    });

    act(() => result.current.actions.changeContentAndSaveDocument('hello world'));
    expect(socket.emit).toHaveBeenCalledWith('changeContentAndSaveDocument', {
      documentId,
      newContent: 'hello world',
    });

    act(() => result.current.actions.applyVersion(7));
    expect(socket.emit).toHaveBeenCalledWith('applyVersion', {
      documentId,
      versionId: 7,
    });
  });

  it('setNewAiUsage mutates state', () => {
    const { result } = renderHook(() => useDocumentData(documentId), {
      wrapper: ({ children }) => withCtx(socket, children),
    });

    act(() => result.current.actions.setNewAiUsage(usage(documentId)));
    expect(result.current.newAiUsage?.id).toBe(99);
  });
});
