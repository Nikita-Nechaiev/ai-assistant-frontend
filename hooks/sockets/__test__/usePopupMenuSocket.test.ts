import { renderHook, act } from '@testing-library/react';

import { usePopupMenu } from '../usePopupMenuSocket';

class MockSocket {
  emit = jest.fn();
}

describe('usePopupMenu', () => {
  let socket: MockSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    socket = new MockSocket();
  });

  it('emits duplicateDocument with id', () => {
    const { result } = renderHook(() => usePopupMenu(socket as unknown as any));

    act(() => result.current.duplicateDocument(12));
    expect(socket.emit).toHaveBeenCalledWith('duplicateDocument', {
      documentId: 12,
    });
  });

  it('emits deleteDocument with id', () => {
    const { result } = renderHook(() => usePopupMenu(socket as any));

    act(() => result.current.deleteDocument(7));
    expect(socket.emit).toHaveBeenCalledWith('deleteDocument', {
      documentId: 7,
    });
  });
});
