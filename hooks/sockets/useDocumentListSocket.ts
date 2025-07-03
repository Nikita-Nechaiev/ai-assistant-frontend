'use client';

import { useState, useEffect, useCallback } from 'react';

import { Socket } from 'socket.io-client';

import { IDocument } from '@/models/models';

interface Params {
  sessionId: number;
  socket: Socket | null;
}

export function useDocumentListSocket({ sessionId, socket }: Params) {
  const [documents, setDocuments] = useState<IDocument[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('getSessionDocuments', { sessionId });

    const onSessionDocuments = (docs: IDocument[]) => setDocuments(docs);
    const prepend = (doc: IDocument) => setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);

    socket.on('sessionDocuments', onSessionDocuments);
    socket.on('documentCreated', prepend);
    socket.on('documentDuplicated', prepend);
    socket.on('lastEditedDocument', prepend);
    socket.on('documentUpdated', prepend);
    socket.on('documentDeleted', ({ documentId }: { documentId: number }) =>
      setDocuments((prev) => prev.filter((d) => d.id !== documentId)),
    );

    return () => {
      socket.off('sessionDocuments', onSessionDocuments);
      socket.off('documentCreated', prepend);
      socket.off('documentDuplicated', prepend);
      socket.off('lastEditedDocument', prepend);
      socket.off('documentUpdated', prepend);
      socket.off('documentDeleted');
    };
  }, [socket, sessionId]);

  const createDocument = useCallback((title: string) => socket?.emit('createDocument', { title }), [socket]);

  const changeDocumentTitle = useCallback(
    (docId: number, newTitle: string) => socket?.emit('changeDocumentTitle', { documentId: docId, newTitle }),
    [socket],
  );

  return { documents, createDocument, changeDocumentTitle };
}
