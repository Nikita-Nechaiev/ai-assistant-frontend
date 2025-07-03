'use client';

import { useCallback } from 'react';

import { Socket } from 'socket.io-client';

export function usePopupMenu(socket: Socket | undefined | null) {
  const duplicateDocument = useCallback(
    (documentId: number) => socket?.emit('duplicateDocument', { documentId }),
    [socket],
  );

  const deleteDocument = useCallback((documentId: number) => socket?.emit('deleteDocument', { documentId }), [socket]);

  return { duplicateDocument, deleteDocument };
}
