'use client';

import { useCallback, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { IDocument, IVersion, IAiToolUsage } from '@/models/models';
import { SessionContext } from '@/components/Session/SessionLayout/SessionLayout';
import { lockBodyScroll } from '@/helpers/scrollLock';
import useSnackbarStore from '@/store/useSnackbarStore';
import { SnackbarStatusEnum } from '@/models/enums';

interface DocumentAiUsageParams {
  toolName: string;
  text: string;
  documentId: number;
  targetLanguage?: string;
}

export default function useDocumentData(documentId: number) {
  const ctx = useContext(SessionContext);

  if (!ctx) throw new Error('useDocumentData must be used inside <SessionLayout>');

  const { socket, sessionId } = ctx;

  const [currentDocument, setCurrentDocument] = useState<IDocument | null>(null);
  const [versions, setVersions] = useState<IVersion[]>([]);
  const [aiUsageList, setAiUsageList] = useState<IAiToolUsage[]>([]);
  const [isFetchingAI, setFetchingAI] = useState(false);
  const [newAiUsage, setNewAiUsage] = useState<IAiToolUsage | null>(null);

  const { setSnackbar } = useSnackbarStore();
  const router = useRouter();

  useEffect(() => {
    if (!socket || !documentId) return;

    socket.emit('getDocument', { documentId });
    socket.emit('getVersions', { documentId });
    socket.emit('getDocumentAiUsage', { documentId });

    const onDocData = (doc: IDocument) => {
      if (doc.id !== documentId) return;

      setCurrentDocument(doc);
    };
    const onDocUpdated = onDocData;

    const onVersions = (list: IVersion[]) => setVersions(list.filter((v) => v.document.id === documentId));

    const onVersionAdd = (v: IVersion) => {
      if (v.document.id !== documentId) return;

      setVersions((prev) => [v, ...prev]);
    };

    const onAiUsage = (list: IAiToolUsage[]) => setAiUsageList(list.filter((u) => u.document?.id === documentId));

    const onAiCreated = (usage: IAiToolUsage) => {
      if (usage.document?.id !== documentId) return;

      lockBodyScroll();
      setAiUsageList((prev) => [...prev, usage]);
      setNewAiUsage(usage);
      setFetchingAI(false);
    };

    const onError = () => setFetchingAI(false);

    const onDocumentDeleted = ({ documentId: id }: { documentId: number }) => {
      if (documentId === id) {
        setSnackbar('Editor has deleted this document.', SnackbarStatusEnum.WARNING);

        router.replace(`/session/${sessionId}`);
      }
    };

    socket.on('documentData', onDocData);
    socket.on('documentUpdated', onDocUpdated);
    socket.on('lastEditedDocument', onDocUpdated);

    socket.on('versionsData', onVersions);
    socket.on('versionCreated', onVersionAdd);

    socket.on('documentAiUsage', onAiUsage);
    socket.on('documentAiUsageCreated', onAiCreated);

    socket.on('documentDeleted', onDocumentDeleted);

    socket.on('error', onError);

    return () => {
      socket.off('documentData', onDocData);
      socket.off('documentUpdated', onDocUpdated);
      socket.off('lastEditedDocument', onDocUpdated);

      socket.off('versionsData', onVersions);
      socket.off('versionCreated', onVersionAdd);

      socket.off('documentAiUsage', onAiUsage);
      socket.off('documentAiUsageCreated', onAiCreated);

      socket.off('error', onError);
    };
  }, [socket, documentId, setSnackbar, router, sessionId]);

  const changeDocumentTitle = useCallback(
    (newTitle: string) =>
      socket?.emit('changeDocumentTitle', {
        documentId,
        newTitle: newTitle.trim(),
      }),
    [socket, documentId],
  );

  const changeContentAndSaveDocument = useCallback(
    (newContent: string) => {
      socket?.emit('changeContentAndSaveDocument', {
        documentId,
        newContent,
      });
    },
    [socket, documentId],
  );

  const applyVersion = useCallback(
    (versionId: number) => {
      socket?.emit('applyVersion', {
        documentId,
        versionId,
      });
    },
    [socket, documentId],
  );

  const createDocumentAiUsage = useCallback(
    (params: Omit<DocumentAiUsageParams, 'documentId'>) => {
      if (!socket) return;

      setFetchingAI(true);
      socket.emit('createDocumentAiUsage', { ...params, documentId });
    },
    [socket, documentId],
  );

  const isLoadingPage = !currentDocument;

  return {
    currentDocument,
    versions,
    aiUsageList,
    newAiUsage,
    isFetchingAI,

    isLoadingPage,

    actions: {
      changeDocumentTitle,
      changeContentAndSaveDocument,
      applyVersion,
      createDocumentAiUsage,
      setNewAiUsage,
    },
  };
}
